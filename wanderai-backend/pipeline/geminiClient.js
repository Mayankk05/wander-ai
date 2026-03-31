import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

import appLogger from '../lib/logger.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemma-3-12b-it",
];

const exhaustedModels = new Set();
const EXHAUSTION_RESET_MS = parseInt(process.env.MODEL_COOLDOWN_MS) || 60 * 60 * 1000;

function getAvailableChain() {
  return MODEL_CHAIN.filter(m => !exhaustedModels.has(m));
}

function markExhausted(model) {
  exhaustedModels.add(model);
  appLogger.warn({ model, cooldownMs: EXHAUSTION_RESET_MS }, "Model daily quota exhausted");
  setTimeout(() => {
    exhaustedModels.delete(model);
    appLogger.info({ model }, "Model re-enabled after cooldown");
  }, EXHAUSTION_RESET_MS);
}

async function withFallback(options, systemInstruction, callFn, signal) {
  const chain = getAvailableChain();
  
  if (signal?.aborted) throw new Error("Request aborted");

  if (chain.length === 0) {
    throw new Error("All Gemini models have hit their quota limits. Please try again later or upgrade your API plan.");
  }

  let lastError = null;

  for (const modelName of chain) {
    // Gemma models don't support JSON mode — strip responseMimeType for them
    const isGemma = modelName.startsWith('gemma');
    const modelOptions = isGemma && options.generationConfig?.responseMimeType
      ? {
          ...options,
          generationConfig: {
            ...options.generationConfig,
            responseMimeType: undefined
          },
          signal
        }
      : { ...options, signal };

    const model = genAI.getGenerativeModel({
      ...modelOptions,
      model: modelName,
      systemInstruction: isGemma ? undefined : systemInstruction
    });

    try {
      appLogger.info({ model: modelName, isGemma }, "Attempting AI generation");
      const result = await callFn(model);
      
      if (result.stream) {
        return {
          ...result,
          stream: {
            [Symbol.asyncIterator]: async function* () {
              try {
                for await (const chunk of result.stream) {
                  yield chunk;
                }
              } catch (streamError) {
                appLogger.error({ err: streamError, model: modelName }, "AI Stream failure");
                throw streamError;
              }
            }
          }
        };
      }

      return result;
    } catch (error) {
      lastError = error;

      const isRetryable = 
        error.status === 429 || error.message?.includes('429') || error.message?.includes('quota') ||
        error.status === 503 || error.message?.includes('503') || error.message?.includes('Service Unavailable');
        
      if (!isRetryable || signal?.aborted) {
        if (signal?.aborted) {
           appLogger.info({ model: modelName }, "AI request aborted by client");
           throw new Error("Request aborted");
        }
        appLogger.error({ err: error, model: modelName }, "Fatal AI failure (non-retryable)");
        throw error;
      }

      const isDailyExhausted = error.message?.includes('GenerateRequestsPerDayPerProjectPerModel')
        || error.message?.includes('per day')
        || (error.message?.includes('quota') && error.message?.includes('20'));

      if (isDailyExhausted) {
        markExhausted(modelName);
        appLogger.warn({ model: modelName }, "Quota exhaustion fallback triggered");
      } else {
        appLogger.warn({ model: modelName }, "Rate limit fallback triggered");
      }
    }
  }

  throw new Error(`All Gemini models exhausted their quotas. Please try again later.`);
}

export const geminiClient = {
  generateContent: async (options, promptOrRequest, systemInstruction, signal) => {
    return withFallback(options, systemInstruction, (model) => model.generateContent(promptOrRequest), signal);
  },
  
  generateContentStream: async (options, promptOrRequest, systemInstruction, signal) => {
    return withFallback(options, systemInstruction, (model) => model.generateContentStream(promptOrRequest), signal);
  },

  getStatus: () => {
    return MODEL_CHAIN.map(m => ({
      model: m,
      status: exhaustedModels.has(m) ? 'exhausted' : 'available'
    }));
  }
};

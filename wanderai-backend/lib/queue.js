import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';
import appLogger from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MAX_CONCURRENT_WORKERS = parseInt(process.env.MAX_PDF_WORKERS) || 4;
const queue = [];
let activeWorkers = 0;

// Process next task in queue
function processQueue() {
  if (queue.length === 0 || activeWorkers >= MAX_CONCURRENT_WORKERS) {
    return;
  }

  const { trip, currency, resolve, reject } = queue.shift();
  activeWorkers++;

  appLogger.info({ tripId: trip.id, activeWorkers }, "Starting PDF background worker");

  const worker = new Worker(path.join(__dirname, '../workers/pdfWorker.js'), {
    workerData: { trip, currency }
  });

  worker.on('message', (message) => {
    if (message.status === 'done') {
      resolve(message.buffer);
    } else {
      reject(new Error(message.error));
    }
  });

  worker.on('error', (err) => {
    appLogger.error({ err, tripId: trip.id }, "PDF Worker Error");
    reject(err);
  });

  worker.on('exit', (code) => {
    activeWorkers--;
    appLogger.info({ tripId: trip.id, activeWorkers, code }, "PDF Worker Exited");
    
    if (code !== 0) {
      reject(new Error(`Worker stopped with exit code ${code}`));
    }
    
    // Check if there are more tasks waiting
    processQueue();
  });
}

// Dispatch PDF generation task to background queue
export function generatePDFInBackground(trip, currency) {
  return new Promise((resolve, reject) => {
    queue.push({ trip, currency, resolve, reject });
    processQueue();
  });
}

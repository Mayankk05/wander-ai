/**
 * Unified SSE streaming utility for AI-driven features (Generation, Chat, Regeneration).
 * Supports both GET and POST while handling common error codes like 401 and 429.
 */
export async function stream({ 
  url, 
  method = 'POST', 
  body = null, 
  params = null,
  onStatus, 
  onChunk, 
  onComplete, 
  onError,
  signal 
}) {
  try {
    let finalUrl = url;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, Array.isArray(val) ? val.join(',') : val);
        }
      });
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + searchParams.toString();
    }

    const response = await fetch(finalUrl, {
      method,
      credentials: 'include',
      headers: { 
        'Accept': 'text/event-stream',
        ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {})
      },
      body: method === 'POST' && body ? JSON.stringify(body) : undefined,
      signal
    });

    if (!response.ok) {
      let errorData = {};
      try {
        const text = await response.text();
        errorData = JSON.parse(text);
      } catch {
        if (response.status >= 500) {
          onError?.('The system is temporarily busy. Please try again soon.');
          return;
        }
      }
      
      if (response.status === 401) {
        onError?.('Session ended. Please sign in again.');
        setTimeout(() => window.location.href = '/auth', 2000);
        return;
      }
      
      if (response.status === 429) {
        onError?.('Limit reached. Please wait a moment.');
        return;
      }

      onError?.(errorData.error || errorData.message || 'Something went wrong. Please try again.');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Catch any partial line in the internal buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        
        const jsonStr = trimmed.slice(6);
        if (!jsonStr) continue;

        try {
          const parsed = JSON.parse(jsonStr);
          
          if (parsed.type === 'status') {
             onStatus?.(parsed.message, parsed.progress);
          } else if (parsed.type === 'chunk') {
             onChunk?.(parsed.text || parsed.chunk || '');
          } else if (parsed.type === 'complete' || parsed.type === 'itinerary' || parsed.type === 'trip') {
             // Standardized extraction across different backend response formats
             const finalData = parsed.trip || parsed.itinerary || (parsed.type === 'complete' ? parsed : null);
             if (finalData) {
               onComplete?.(finalData);
               return; 
             }
          } else if (parsed.type === 'error') {
             onError?.(parsed.error || parsed.message || 'An error occurred during streaming');
             return;
          }
        } catch {
          // Swallow partial JSON parse errors for robust streaming
        }
      }
    }
    onComplete?.();
  } catch (networkError) {
    if (networkError.name === 'AbortError') return;
    onError?.('Network error. Check your connection and try again.');
  }
}

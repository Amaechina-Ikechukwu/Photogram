/**
 * Fetch with automatic retry logic for failed requests
 * Useful for handling temporary network issues or server timeouts
 */

interface FetchWithRetryOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

/**
 * Enhanced fetch function with retry logic and timeout support
 * @param url - The URL to fetch
 * @param options - Fetch options plus retry configuration
 * @returns Promise with the fetch response
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    retries = 1, // Default: retry once on failure
    retryDelay = 1000, // Default: 1 second delay between retries
    timeout = 30000, // Default: 30 second timeout
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // If response is ok or client error (4xx), don't retry
      // Only retry on server errors (5xx) or network failures
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      // Server error - will retry if attempts remain
      if (attempt < retries) {
        console.log(`Request failed with status ${response.status}, retrying (${attempt + 1}/${retries})...`);
        await delay(retryDelay);
        continue;
      }

      return response;
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on abort (timeout) for last attempt
      if (error.name === 'AbortError') {
        console.error(`Request timeout after ${timeout}ms`);
      }
      
      if (attempt < retries) {
        console.log(`Request failed: ${error.message}, retrying (${attempt + 1}/${retries})...`);
        await delay(retryDelay);
      }
    }
  }

  // All retries exhausted
  throw lastError || new Error('Request failed after all retries');
}

/**
 * Helper function to delay execution
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Convenience wrapper for GET requests with retry
 */
export async function apiGet(
  endpoint: string,
  options: Omit<FetchWithRetryOptions, 'method'> = {}
): Promise<Response> {
  return fetchWithRetry(`${process.env.EXPO_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    method: 'GET',
  });
}

/**
 * Convenience wrapper for POST requests with retry
 */
export async function apiPost(
  endpoint: string,
  options: Omit<FetchWithRetryOptions, 'method'> = {}
): Promise<Response> {
  return fetchWithRetry(`${process.env.EXPO_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    method: 'POST',
  });
}

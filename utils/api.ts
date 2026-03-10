/**
 * Fetch with automatic retry logic for failed requests
 * Useful for handling temporary network issues or server timeouts
 */

interface FetchWithRetryOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

function getApiBaseUrl(): string {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!baseUrl) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured');
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function createApiUrl(endpoint: string): string {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${getApiBaseUrl()}${normalizedEndpoint}`;
}

export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    retries = 1,
    retryDelay = 1000,
    timeout = 30000,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }

      if (attempt < retries) {
        console.log(`Request failed with status ${response.status}, retrying (${attempt + 1}/${retries})...`);
        await delay(retryDelay);
        continue;
      }

      return response;
    } catch (error: any) {
      lastError = error;
      
      if (error.name === 'AbortError') {
        console.error(`Request timeout after ${timeout}ms`);
      }
      
      if (attempt < retries) {
        console.log(`Request failed: ${error.message}, retrying (${attempt + 1}/${retries})...`);
        await delay(retryDelay);
      }
    }
  }

  throw lastError || new Error('Request failed after all retries');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiGet(
  endpoint: string,
  options: Omit<FetchWithRetryOptions, 'method'> = {}
): Promise<Response> {
  return fetchWithRetry(createApiUrl(endpoint), {
    ...options,
    method: 'GET',
  });
}

export async function apiPost(
  endpoint: string,
  options: Omit<FetchWithRetryOptions, 'method'> = {}
): Promise<Response> {
  return fetchWithRetry(createApiUrl(endpoint), {
    ...options,
    method: 'POST',
  });
}

export async function apiDelete(
  endpoint: string,
  options: Omit<FetchWithRetryOptions, 'method'> = {}
): Promise<Response> {
  return fetchWithRetry(createApiUrl(endpoint), {
    ...options,
    method: 'DELETE',
  });
}

export async function apiPut(
  endpoint: string,
  options: Omit<FetchWithRetryOptions, 'method'> = {}
): Promise<Response> {
  return fetchWithRetry(createApiUrl(endpoint), {
    ...options,
    method: 'PUT',
  });
}
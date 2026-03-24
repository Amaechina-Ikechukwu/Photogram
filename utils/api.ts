/**
 * Fetch with automatic retry logic for failed requests
 * Useful for handling temporary network issues or server timeouts
 */

interface FetchWithRetryOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

export class ApiResponseError extends Error {
  status: number;
  statusText: string;
  body: string;
  contentType: string | null;

  constructor(
    message: string,
    {
      status,
      statusText,
      body,
      contentType,
    }: {
      status: number;
      statusText: string;
      body: string;
      contentType: string | null;
    }
  ) {
    super(message);
    this.name = 'ApiResponseError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
    this.contentType = contentType;
  }
}

function isJsonContentType(contentType: string | null): boolean {
  if (!contentType) {
    return false;
  }

  const normalized = contentType.toLowerCase();
  return normalized.includes('application/json') || normalized.includes('+json');
}

function looksLikeJson(body: string): boolean {
  const trimmed = body.trim();
  return trimmed.startsWith('{') || trimmed.startsWith('[');
}

function getBodySnippet(body: string, maxLength = 160): string {
  return body.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function extractErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const record = data as Record<string, unknown>;

  if (typeof record.message === 'string' && record.message.trim()) {
    return record.message;
  }

  if (typeof record.error === 'string' && record.error.trim()) {
    return record.error;
  }

  return null;
}

function getGenericRequestErrorMessage(status: number, contentType: string | null, body: string): string {
  const snippet = getBodySnippet(body);
  const detail = snippet ? `: ${snippet}` : '';

  if (contentType) {
    return `Request failed with status ${status} (${contentType})${detail}`;
  }

  return `Request failed with status ${status}${detail}`;
}

export async function parseApiJson<T = unknown>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const body = await response.text();
  const trimmedBody = body.trim();

  if (!trimmedBody) {
    if (!response.ok) {
      throw new ApiResponseError(`Request failed with status ${response.status}`, {
        status: response.status,
        statusText: response.statusText,
        body,
        contentType,
      });
    }

    return null as T;
  }

  const shouldParseJson = isJsonContentType(contentType) || looksLikeJson(trimmedBody);
  if (!shouldParseJson) {
    throw new ApiResponseError(
      response.ok
        ? `Expected JSON response but received ${contentType || 'non-JSON content'}: ${getBodySnippet(trimmedBody)}`
        : getGenericRequestErrorMessage(response.status, contentType, trimmedBody),
      {
        status: response.status,
        statusText: response.statusText,
        body,
        contentType,
      }
    );
  }

  let data: T;
  try {
    data = JSON.parse(trimmedBody) as T;
  } catch {
    throw new ApiResponseError(
      response.ok
        ? `Failed to parse server response: ${getBodySnippet(trimmedBody)}`
        : getGenericRequestErrorMessage(response.status, contentType, trimmedBody),
      {
        status: response.status,
        statusText: response.statusText,
        body,
        contentType,
      }
    );
  }

  if (!response.ok) {
    throw new ApiResponseError(
      extractErrorMessage(data) || getGenericRequestErrorMessage(response.status, contentType, trimmedBody),
      {
        status: response.status,
        statusText: response.statusText,
        body,
        contentType,
      }
    );
  }

  return data;
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

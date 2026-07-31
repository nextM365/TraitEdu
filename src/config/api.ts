// API Configuration - automatically uses correct endpoint based on environment

const API_BASE_URL = (() => {
  // Development environment
  if (import.meta.env.DEV) {
    return 'http://localhost:4000';
  }

  // Production environment - use environment variable or current domain
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }

  // Fallback: use same origin for API (works when frontend and backend on same domain)
  return `${window.location.protocol}//${window.location.host}`;
})();

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export function getApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

console.log(`🔗 API configured for: ${API_BASE_URL}`);

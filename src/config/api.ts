const trimSlash = (value: string) => value.replace(/\/+$/, '');

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const LOCAL_API_PORT = '3002';
const LOCAL_API_URL = `http://localhost:${LOCAL_API_PORT}`;
const REMOTE_API_URL = 'https://your-backend.up.railway.app';
const envApiBaseUrl = (process.env.REACT_APP_API_URL || '').trim();

const resolveApiBaseUrl = (): string => {
  if (!isLocalhost) {
    return envApiBaseUrl || REMOTE_API_URL;
  }

  if (!envApiBaseUrl) {
    return LOCAL_API_URL;
  }

  try {
    const parsed = new URL(envApiBaseUrl);
    const appPort = typeof window !== 'undefined' ? window.location.port : '';
    const isSameHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    const isSamePortAsFrontend = isSameHost && parsed.port === appPort;

    if (isSamePortAsFrontend) {
      return LOCAL_API_URL;
    }
  } catch {
    // Keep env value if it cannot be parsed as URL.
  }

  return envApiBaseUrl;
};

export const API_BASE_URL = trimSlash(
  resolveApiBaseUrl()
);

export const buildApiUrl = (path: string) => {
  if (!path.startsWith('/')) {
    return `${API_BASE_URL}/${path}`;
  }
  return `${API_BASE_URL}${path}`;
};

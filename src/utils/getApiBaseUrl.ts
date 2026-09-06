const DEFAULT_API_BASE_URL = 'http://localhost:3005'

export function getApiBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  if (typeof configuredUrl === 'string' && configuredUrl.trim() !== '') {
    return configuredUrl.replace(/\/$/, '')
  }

  return DEFAULT_API_BASE_URL
}

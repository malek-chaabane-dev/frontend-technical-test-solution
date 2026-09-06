import { getApiBaseUrl } from '../utils/getApiBaseUrl'

export class ApiError extends Error {
  status: number | null

  constructor(message: string, status: number | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, { signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    throw new ApiError('La connexion au service est indisponible.')
  }

  if (!response.ok) {
    throw new ApiError('Le service a rencontré un problème.', response.status)
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new ApiError('La réponse du service est invalide.', response.status)
  }
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError('La connexion au service est indisponible.')
  }

  if (!response.ok) {
    throw new ApiError('Le message n\'a pas pu être envoyé.', response.status)
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new ApiError('La réponse du service est invalide.', response.status)
  }
}
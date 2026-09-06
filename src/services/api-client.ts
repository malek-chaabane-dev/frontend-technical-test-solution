import { getApiBaseUrl } from '../utils/getApiBaseUrl'

export class ApiError extends Error {
  status: number | null

  constructor(message: string, status: number | null = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')
  )
}

export function createValidationError(message: string): ApiError {
  return new ApiError(message)
}

function getHttpErrorMessage(status: number): string {
  if (status === 400) {
    return 'La requête est invalide.'
  }

  if (status === 404) {
    return 'La ressource demandée est introuvable.'
  }

  if (status === 503) {
    return 'Le service est temporairement indisponible.'
  }

  return 'Le service a rencontré un problème.'
}

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, { signal })
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }

    throw new ApiError('La connexion au service est indisponible.')
  }

  if (!response.ok) {
    throw new ApiError(getHttpErrorMessage(response.status), response.status)
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new ApiError('La réponse du service est invalide.', response.status)
  }
}

export async function postJson<T>(
  path: string,
  body: unknown,
  resourceName = 'Le message',
): Promise<T> {
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
    throw new ApiError(
      response.status === 400
        ? `${resourceName} est invalide.`
        : response.status === 503
          ? 'Le service est temporairement indisponible.'
          : `${resourceName} n\'a pas pu être créé.`,
      response.status,
    )
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new ApiError('La réponse du service est invalide.', response.status)
  }
}
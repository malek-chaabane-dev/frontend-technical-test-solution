import { getApiBaseUrl } from '../utils/getApiBaseUrl'
import { MESSAGING_TEXT } from '../constants/messaging'

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
    return MESSAGING_TEXT.errors.invalidRequest
  }

  if (status === 404) {
    return MESSAGING_TEXT.errors.resourceNotFound
  }

  if (status === 503) {
    return MESSAGING_TEXT.errors.serviceUnavailable
  }

  return MESSAGING_TEXT.errors.serviceFailure
}

export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, { signal })
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }

    throw new ApiError(MESSAGING_TEXT.errors.connectionUnavailable)
  }

  if (!response.ok) {
    throw new ApiError(getHttpErrorMessage(response.status), response.status)
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new ApiError(MESSAGING_TEXT.errors.invalidResponse, response.status)
  }
}

export async function postJson<T>(
  path: string,
  body: unknown,
  resourceName: string = MESSAGING_TEXT.common.resources.message,
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
    throw new ApiError(MESSAGING_TEXT.errors.connectionUnavailable)
  }

  if (!response.ok) {
    throw new ApiError(
      response.status === 400
        ? resourceName === MESSAGING_TEXT.common.resources.conversation
          ? MESSAGING_TEXT.errors.invalidConversation
          : MESSAGING_TEXT.errors.invalidMessage
        : response.status === 503
          ? MESSAGING_TEXT.errors.serviceUnavailable
          : resourceName === MESSAGING_TEXT.common.resources.conversation
            ? MESSAGING_TEXT.errors.conversationNotCreated
            : MESSAGING_TEXT.errors.messageNotCreated,
      response.status,
    )
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new ApiError(MESSAGING_TEXT.errors.invalidResponse, response.status)
  }
}
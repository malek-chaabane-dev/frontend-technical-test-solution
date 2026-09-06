import { createValidationError, getJson } from './api-client'
import type { User } from '../types/user'

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const user = value as Record<string, unknown>

  return (
    Number.isInteger(user.id) &&
    typeof user.nickname === 'string' &&
    user.nickname.trim() !== '' &&
    typeof user.token === 'string'
  )
}

export async function getUsers(signal?: AbortSignal): Promise<User[]> {
  const response = await getJson<unknown>('/users', signal)

  if (!Array.isArray(response) || !response.every(isUser)) {
    throw createValidationError('La réponse des utilisateurs est invalide.')
  }

  return response
}
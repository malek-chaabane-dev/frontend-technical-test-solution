import { useEffect, useState } from 'react'
import { isAbortError } from '../services/api-client'
import { getUsers } from '../services/users-api'
import type { User } from '../types/user'
import type { AsyncState } from '../types/api'
import { MESSAGING_TEXT } from '../constants/messaging'

type UseNewConversationUsersResult = {
  users: User[]
  isLoading: boolean
  error: Error | null
}

export function useNewConversationUsers(
  isOpen: boolean,
  loggedUserId: number,
): UseNewConversationUsersResult {
  const [state, setState] = useState<AsyncState<User[]>>({
    status: 'idle',
    data: [],
    error: null,
  })

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const controller = new AbortController()
    setState((currentState) => ({ ...currentState, status: 'loading', error: null }))

    getUsers(controller.signal)
      .then((nextUsers) => {
        setState({
          status: 'success',
          data: nextUsers.filter((user) => user.id !== loggedUserId),
          error: null,
        })
      })
      .catch((requestError: unknown) => {
        if (!isAbortError(requestError)) {
          setState((currentState) => ({
            ...currentState,
            status: 'error',
            error:
              requestError instanceof Error
                ? requestError
                : new Error(MESSAGING_TEXT.errors.usersLoadFallback),
          }))
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setState((currentState) => ({
            ...currentState,
            status: currentState.error ? 'error' : 'success',
          }))
        }
      })

    return () => controller.abort()
  }, [isOpen, loggedUserId])

  return {
    users: state.data,
    isLoading: state.status === 'loading',
    error: state.error,
  }
}

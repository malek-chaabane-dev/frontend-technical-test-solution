import type { User } from '../types/user'
import { LOGGED_USER_ID } from '../constants/messaging'

// Default way to use a logged user
// Feel free to update the user ID for your tests
// or enhance it with better data source, or better user management
export const getLoggedUserId = (): User['id'] => LOGGED_USER_ID


import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Logo from '../assets/lbc-logo.webp'
import { ConversationList } from '../components/ConversationList'
import { ConversationPanel } from '../components/ConversationPanel'
import { useConversations } from '../hooks/useConversations'
import { getLoggedUserId } from '../utils/getLoggedUserId'
import { useConversationMessages } from '../hooks/useConversationMessages'
import { getConversationPartner } from '../utils/conversation-utils'
import { sendMessage } from '../services/messages-api'
import { createConversation } from '../services/conversations-api'
import { getUsers } from '../services/users-api'
import { isAbortError } from '../services/api-client'
import { NewConversationDialog } from '../components/NewConversationDialog'
import type { User } from '../types/user'

export default function Home(): ReactElement {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(
    null,
  )
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [newConversationError, setNewConversationError] = useState<string | null>(null)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)

  const isConversationOpen = selectedConversationId !== null
  const loggedUserId = getLoggedUserId()
  const { conversations, isLoading, error, retry } = useConversations(loggedUserId)
  const selectedConversation = conversations.find(
    (conversation) => conversation.id === selectedConversationId,
  )
  const {
    messages,
    isLoading: areMessagesLoading,
    error: messagesError,
    retry: retryMessages,
    addMessage,
  } = useConversationMessages(selectedConversationId)

  useEffect(() => {
    if (!isNewConversationOpen) {
      return
    }

    const controller = new AbortController()
    setIsLoadingUsers(true)
    setNewConversationError(null)

    getUsers(controller.signal)
      .then((nextUsers) => {
        setUsers(nextUsers.filter((user) => user.id !== loggedUserId))
      })
      .catch((requestError: unknown) => {
        if (!isAbortError(requestError)) {
          setNewConversationError(
            requestError instanceof Error
              ? requestError.message
              : 'Les utilisateurs n’ont pas pu être chargés.',
          )
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingUsers(false)
        }
      })

    return () => controller.abort()
  }, [isNewConversationOpen, loggedUserId])

  async function handleSendMessage(body: string): Promise<void> {
    if (selectedConversationId === null) {
      return
    }

    const createdMessage = await sendMessage(
      selectedConversationId,
      loggedUserId,
      body,
      Math.floor(Date.now() / 1000),
    )
    addMessage(createdMessage)
  }

  async function handleCreateConversation(recipientId: number): Promise<void> {
    setIsCreatingConversation(true)
    setNewConversationError(null)

    try {
      const conversationId = await createConversation(loggedUserId, recipientId)
      retry()
      setSelectedConversationId(conversationId)
      setIsNewConversationOpen(false)
    } catch (requestError: unknown) {
      setNewConversationError(
        requestError instanceof Error
          ? requestError.message
          : 'La conversation n’a pas pu être créée.',
      )
    } finally {
      setIsCreatingConversation(false)
    }
  }

  return (
    <>
      <Head>
        <title>Messages - Leboncoin</title>
        <meta
          name="description"
          content="Messagerie Leboncoin : consultez et répondez à vos conversations."
        />
      </Head>

      <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-white">
        <header className="flex shrink-0 items-center gap-3 border-b border-zinc-200 px-4 py-2.5">
          <Image
            src={Logo}
            alt="Leboncoin"
            width={120}
            height={38}
            priority
            className="h-8 w-auto"
          />
          <h1 className="text-lg font-semibold text-zinc-900">Messages</h1>
          <button
            type="button"
            onClick={() => setIsNewConversationOpen(true)}
            className="ml-auto rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Nouvelle conversation
          </button>
        </header>

        <main className="flex min-h-0 min-w-0 flex-1">
          <div
            className={`h-full min-h-0 w-full md:w-80 md:shrink-0 lg:w-96 ${
              isConversationOpen ? 'hidden md:flex' : 'flex'
            } flex-col`}
          >
            <ConversationList
              conversations={conversations}
              loggedUserId={loggedUserId}
              isLoading={isLoading}
              error={error}
              onRetry={retry}
              onSelect={setSelectedConversationId}
            />
          </div>
          <div
            className={`h-full min-h-0 min-w-0 flex-1 flex-col ${
              isConversationOpen ? 'flex' : 'hidden md:flex'
            }`}
          >
            <ConversationPanel
              selectedConversationId={selectedConversationId}
              partnerName={
                selectedConversation
                  ? getConversationPartner(selectedConversation, loggedUserId)
                  : null
              }
              loggedUserId={loggedUserId}
              messages={messages}
              isLoading={areMessagesLoading}
              error={messagesError}
              onRetry={retryMessages}
              onSendMessage={handleSendMessage}
              onBack={() => setSelectedConversationId(null)}
            />
          </div>
        </main>
      </div>
      {isNewConversationOpen ? (
        <NewConversationDialog
          users={users}
          isLoadingUsers={isLoadingUsers}
          isSubmitting={isCreatingConversation}
          error={newConversationError}
          onClose={() => setIsNewConversationOpen(false)}
          onSubmit={handleCreateConversation}
        />
      ) : null}
    </>
  )
}

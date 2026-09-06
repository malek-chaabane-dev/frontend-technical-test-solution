import { useState } from 'react'
import type { ReactElement } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Logo from '../assets/lbc-logo.webp'
import { ConversationList } from '../components/ConversationList'
import { ConversationPanel } from '../components/ConversationPanel'

export default function Home(): ReactElement {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(
    null,
  )

  const isConversationOpen = selectedConversationId !== null

  return (
    <>
      <Head>
        <title>Messages - Leboncoin</title>
        <meta
          name="description"
          content="Messagerie Leboncoin : consultez et répondez à vos conversations."
        />
      </Head>

      <div className="flex h-svh flex-col overflow-hidden bg-white">
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
        </header>

        <main className="flex min-h-0 flex-1">
          <div
            className={`h-full min-h-0 w-full md:w-80 md:shrink-0 lg:w-96 ${
              isConversationOpen ? 'hidden md:flex' : 'flex'
            } flex-col`}
          >
            <ConversationList />
          </div>
          <div
            className={`h-full min-h-0 min-w-0 flex-1 flex-col ${
              isConversationOpen ? 'flex' : 'hidden md:flex'
            }`}
          >
            <ConversationPanel
              selectedConversationId={selectedConversationId}
              onBack={() => setSelectedConversationId(null)}
            />
          </div>
        </main>
      </div>
    </>
  )
}

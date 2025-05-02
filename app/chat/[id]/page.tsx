// app/chat/[id]/page.tsx
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { Chat } from '@/components/chat';
import {
  DEFAULT_MODEL_NAME,
  DEFAULT_REASONING_MODEL_NAME,
  models,
  reasoningModels,
} from '@/lib/ai/models';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { convertToUIMessages, generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { supabaseServer } from '@/lib/supabase-server';

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  // Initialize Supabase on the server and get the session
  const supabase = await supabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If chat is private, enforce ownership
  if (chat.visibility === 'private') {
    if (!session?.user?.id || session.user.id !== chat.userId) {
      notFound();
    }
  }

  // Fetch existing messages
  const messagesFromDb = await getMessagesByChatId({ id });

  // Determine model selections from cookies
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId =
    models.find(m => m.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  const reasoningModelIdFromCookie =
    cookieStore.get('reasoning-model-id')?.value;
  const selectedReasoningModelId =
    reasoningModels.find(m => m.id === reasoningModelIdFromCookie)?.id ||
    DEFAULT_REASONING_MODEL_NAME;

  // Unique key for resetting the Chat component
  const key = generateUUID();

  return (
    <>
      <Chat
        key={key}
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedModelId={selectedModelId}
        selectedReasoningModelId={selectedReasoningModelId}
        selectedVisibilityType={chat.visibility}
        isReadonly={session?.user?.id !== chat.userId}
      />
      <DataStreamHandler id={chat.id} />
    </>
  );
}

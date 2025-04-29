'use server';

import { type CoreUserMessage, generateText } from 'ai';
import { cookies } from 'next/headers';
import { models, reasoningModels } from '@/lib/ai/models';

import { customModel } from '@/lib/ai';
// Import functions from queries
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById
} from '@/lib/db/queries';
// Import types directly from the schema definition file
import { type Message } from '@/lib/db/schema'; // Changed import source
import { VisibilityType } from '@/components/visibility-selector';

export async function saveModelId(model: string) {
  const cookieStore = await cookies();
  // Check against both model lists or combine them if appropriate
  if (models.some((m) => m.id === model) || reasoningModels.some((m) => m.id === model)) {
     // Decide which cookie to set based on model type or set a general one
     if (models.some((m) => m.id === model)) {
        cookieStore.set('model-id', model);
     }
     if (reasoningModels.some((m) => m.id === model)) {
        cookieStore.set('reasoning-model-id', model);
     }
  } else {
      console.warn(`Attempted to save unknown model ID: ${model}`);
  }
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: CoreUserMessage;
}) {
  try {
      const { text: title } = await generateText({
        model: customModel('gpt-4o'), // Ensure customModel returns a valid GenerativeModel
        system: `\n
        - you will generate a short title based on the first message a user begins a conversation with
        - ensure it is not more than 80 characters long
        - the title should be a summary of the user's message
        - do not use quotes or colons`,
        prompt: JSON.stringify(message), // Ensure prompt format is suitable for the model
      });
      return title;
  } catch (error) {
      console.error("Error generating title:", error);
      // Return a default title or re-throw the error
      return "Chat Title";
  }
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  try {
    // Call getMessageById without array destructuring
    // Explicitly type the expected return type using the imported Message type
    const message: Message | null = await getMessageById({ id });

    // Check if the message was found
    if (!message) {
      console.warn(`deleteTrailingMessages: Message with id ${id} not found.`);
      // Decide how to handle: return, throw error, etc.
      // Depending on usage, maybe returning is fine if the message was already deleted.
      return;
    }

    // Proceed only if message exists
    await deleteMessagesByChatIdAfterTimestamp({
      chatId: message.chatId,
      timestamp: message.createdAt,
    });

    console.log(`Trailing messages deleted for chatId ${message.chatId} after timestamp ${message.createdAt}`);

  } catch (error) {
      console.error(`Error in deleteTrailingMessages for id ${id}:`, error);
      // Re-throw or handle the error appropriately
      throw error; // Or return an error state
  }
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType; // Ensure VisibilityType is 'public' | 'private' or similar
}) {
  try {
      await updateChatVisiblityById({ chatId, visibility });
      console.log(`Chat visibility updated for chatId ${chatId} to ${visibility}`);
  } catch (error) {
      console.error(`Error updating chat visibility for chatId ${chatId}:`, error);
      throw error; // Or return an error state
  }
}

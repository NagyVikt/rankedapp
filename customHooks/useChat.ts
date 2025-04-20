"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState, useRef } from "react";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

// Allowed fields for generationConfig:
interface GenerationConfig {
  temperature: number;
  topP: number;
  topK: number;
  maxOutputTokens: number;
  responseMimeType: string;
}

// Chat message shape:
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// For the internal chat session:
interface ChatSession {
  sendMessage: (message: string) => Promise<{ response: { text: () => Promise<string> } }>;
}

const useChat = () => {
  // The system prompt (persona / high-level instructions)
  const [systemPrompt, setSystemPrompt] = useState<string>("");

  // The selected model, separate from generationConfig.
  const [modelType, setModelType] = useState<string>("gemini-2.0-flash");

  // Only store the standard generation config fields here (no modelType).
  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>({
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  });

  // The conversation so far.
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Use a ref to store the chat session so it isn’t reinitialized on every render.
  const chatSessionRef = useRef<ChatSession | null>(null);

  // Create the model instance for the chosen model + system prompt.
  const model = genAI.getGenerativeModel({
    model: modelType,
    systemInstruction: systemPrompt,
  });

  // Start a new chat session.
  async function startChat(): Promise<ChatSession> {
    return model.startChat({ generationConfig });
  }

  // Send a user message, then get the assistant's response.
  const sendMessage = async (userMessage: string) => {
    // Add the user's message to local state.
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    // If there is no active session, start a new one.
    if (!chatSessionRef.current) {
      chatSessionRef.current = await startChat();
    }
    
    // Send the message to the model.
    const result = await chatSessionRef.current.sendMessage(userMessage);

    // Await the text from the response.
    const assistantMessage = await result.response.text();

    // Append the assistant's response.
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: assistantMessage },
    ]);
  };

  return {
    // Return both the generationConfig and modelType, but keep them separate.
    generationConfig,
    setGenerationConfig,
    modelType,
    setModelType,
    systemPrompt,
    setSystemPrompt,
    messages,
    sendMessage,
  };
};

export default useChat;

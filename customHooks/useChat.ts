"use client";

import {
  GoogleGenerativeAI,
  ChatSession as GeminiChatSession, // Use an alias or just ChatSession if you remove yours
  GenerateContentResult, // Import this type too for clarity if needed
  GenerationConfig as GeminiGenerationConfig, // Optional: alias library's config type
  Content, // Import Content type for message history
} from "@google/generative-ai";
import { useState, useRef, useEffect } from "react"; // Added useEffect

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set"); // Add runtime check
}
const genAI = new GoogleGenerativeAI(apiKey);

// Allowed fields for generationConfig (Keep your local interface for state)
interface GenerationConfig {
  temperature: number;
  topP: number;
  topK: number;
  maxOutputTokens: number;
  responseMimeType: string; // Note: Check library docs if responseMimeType is valid here
                            // It might belong elsewhere or have a different name/structure.
                            // Often it's part of GenerateContentRequest, not startChat generationConfig.
                            // Let's assume it's okay for now based on your code.
}

// Chat message shape (Keep your local interface)
interface ChatMessage {
  role: "user" | "model"; // Use "model" for consistency with the library
  content: string;
}

// REMOVE your local ChatSession interface:
// interface ChatSession {
//   sendMessage: (message: string) => Promise<{ response: { text: () => Promise<string> } }>;
// }

const useChat = () => {
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [modelType, setModelType] = useState<string>("gemini-1.5-flash"); // Default to a known stable model
  const [generationConfig, setGenerationConfig] = useState<GenerationConfig>({
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain", // Double-check this parameter's validity/placement
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [error, setError] = useState<Error | null>(null); // Add error state

  // Use the imported ChatSession type from the library
  const chatSessionRef = useRef<GeminiChatSession | null>(null);

  // Re-initialize chat when model, system prompt, or generation config changes
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setError(null); // Clear previous errors
        const model = genAI.getGenerativeModel({
          model: modelType,
          systemInstruction: systemPrompt,
          // Ensure generationConfig properties are valid for the model's startChat
          // Some might only be valid on individual sendMessage requests
        });

        // Pass only the valid GenerationConfig properties for startChat
        // Check library documentation for what startChat accepts.
        // Often, only history might be passed here, config later.
        // Let's adapt based on common patterns:
        const history = messages.map(msg => ({ // Convert local messages to library format if needed
            role: msg.role,
            parts: [{ text: msg.content }]
        })) as Content[]; // Type assertion might be needed depending on strictness

        chatSessionRef.current = model.startChat({
           generationConfig: { // Pass the generation config subset valid for startChat
             temperature: generationConfig.temperature,
             topP: generationConfig.topP,
             topK: generationConfig.topK,
             maxOutputTokens: generationConfig.maxOutputTokens,
             // responseMimeType might not belong here, check docs
           },
           history: history, // Start chat with existing history
        });
      } catch (err) {
        console.error("Failed to initialize chat:", err);
        setError(err instanceof Error ? err : new Error("Unknown chat initialization error"));
      }
    };

    if (apiKey) { // Ensure API key is present before initializing
        initializeChat();
    }

    // Cleanup function if needed (e.g., abort ongoing requests)
    // return () => { /* cleanup logic */ };

  }, [modelType, systemPrompt, generationConfig]); // Rerun when these change

  const sendMessage = async (userMessage: string) => {
    if (!chatSessionRef.current) {
      setError(new Error("Chat session not initialized."));
      return;
    }
    if (isLoading) return; // Prevent multiple simultaneous messages

    setIsLoading(true);
    setError(null);
    // Add user message optimistically
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      // Send the message to the model using the existing session
      const result = await chatSessionRef.current.sendMessage(userMessage);

      // Access the response text directly (it's synchronous)
      const assistantMessage = result.response.text();

      // Append the assistant's response
      setMessages((prev) => [
        ...prev,
        { role: "model", content: assistantMessage }, // Use "model" role
      ]);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError(err instanceof Error ? err : new Error("Failed to get response"));
      // Optional: Remove the optimistic user message if the API call failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generationConfig,
    setGenerationConfig,
    modelType,
    setModelType,
    systemPrompt,
    setSystemPrompt,
    messages,
    sendMessage,
    isLoading, // Expose loading state
    error, // Expose error state
  };
};

export default useChat;
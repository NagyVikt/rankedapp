"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ScrollShadow,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  Button,
} from "@heroui/react";
import { Icon } from "@iconify/react";

import SidebarContainer from "@/components/playground/sidebar-with-chat-history";
import MessagingChatMessage from "@/components/playground/messaging-chat-message";
import PromptInputWithEnclosedActions from "@/components/playground/prompt-input-with-enclosed-actions";

// Import your custom chat hook (no config UI needed).
import useChat from "@/customHooks/useChat";

// Gemini model options:
const modelTypes: string[] = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-1.0-pro-vision-latest",
  "gemini-1.0-pro",
];

export default function PlaygroundPage() {
  // Pull relevant state/actions from your custom chat hook.
  const {
    generationConfig,
    setGenerationConfig,
    setModelType,
    messages,
    sendMessage,
  } = useChat();

  // Local state for user input in the text field.
  const [newMessage, setNewMessage] = useState("");

  // Scroll reference to keep the conversation in view.
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  // Scrolls the chat to the bottom when messages update.
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  // Sends a message on submit.
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await sendMessage(newMessage);
      // Immediately clear the input
      setNewMessage("");
    }
  };

  return (
      <div className="h-dvh w-full max-w-full">
        {/* Sidebar container for chat and header with model selection */}
        <SidebarContainer
          header={
            <Dropdown className="bg-content1">
              <DropdownTrigger>
                <Button
                  className="min-w-[120px] text-default-400"
                  endContent={
                    <Icon
                      className="text-default-400"
                      height={20}
                      icon="solar:alt-arrow-down-linear"
                      width={20}
                    />
                  }
                  variant="light"
                >
                  {/* Show currently selected model or a placeholder */}
                  {generationConfig.modelType || "Select Model"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Dropdown menu with gemini models"
                className="px-0 py-[16px]"
                variant="faded"
              >
                <DropdownSection
                  classNames={{
                    heading: "text-tiny px-[10px]",
                  }}
                  title="Model"
                >
                  {modelTypes.map((type) => (
                    <DropdownItem
                      key={type}
                      className="text-default-500 data-[hover=true]:text-default-500"
                      classNames={{
                        description: "text-default-500 text-tiny",
                      }}
                      description="Gemini model variant"
                      endContent={
                        generationConfig.modelType === type ? (
                          <Icon
                            className="text-default-foreground"
                            height={24}
                            icon="solar:check-circle-bold"
                            width={24}
                          />
                        ) : null
                      }
                      startContent={
                        <Icon
                          className="text-default-400"
                          height={24}
                          icon="solar:star-linear"
                          width={24}
                        />
                      }
                      onPress={() => {
                        setModelType(type);
                        // If you store modelType in generationConfig, set it here as well:
                        setGenerationConfig((prev) => ({
                          ...prev,
                          modelType: type,
                        }));
                      }}
                    >
                      {type}
                    </DropdownItem>
                  ))}
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          }
          subTitle="Today"
          title="Apply for launch promotion"
        >
          {/* Chat display */}
          <div className="relative flex h-full flex-col">
            <div
              ref={chatHistoryRef}
              className="flex h-full max-h-[60vh] flex-col gap-6 overflow-y-auto p-6 pb-8"
            >
              {messages.map((msg, idx) => (
                <MessagingChatMessage
                  key={idx}
                  classNames={{ base: "text-sm" }}
                  role={msg.role}
                  message={msg.content}
                />
              ))}
            </div>

            {/* Single prompt input for user messages */}
            <div className="mt-auto flex max-w-full flex-col gap-2 px-6">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <PromptInputWithEnclosedActions
                  classNames={{
                    button:
                      // Turn the arrow icon into our submit button
                      "bg-default-foreground opacity-100 w-[30px] h-[30px] !min-w-[30px] self-center",
                    buttonIcon: "text-background",
                    input: "placeholder:text-default-500",
                  }}
                  placeholder="Send a message to Gemini"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                {/* Remove the separate "Send" text button; rely on the arrow icon for submission */}
              </form>
              <p className="px-2 text-center text-small font-medium leading-5 text-default-500">
                Gemini can make mistakes. Always verify important info.
              </p>
            </div>
          </div>
        </SidebarContainer>
      </div>
  );
}

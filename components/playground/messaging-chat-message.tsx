"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Avatar, Image } from "@heroui/react";
import { cn } from "@heroui/react";

interface MessagingChatMessageProps {
  avatar?: string;
  name?: string;
  time?: string;
  message: string;
  role: "user" | "assistant";
  isRTL?: boolean;
  imageUrl?: string;
  className?: string;
  classNames?: {
    base?: string;
  };
}

const MessagingChatMessage = React.forwardRef<HTMLDivElement, MessagingChatMessageProps>(
  (
    {
      avatar,
      name,
      time,
      message,
      role,
      imageUrl,
      className,
      classNames,
      ...props
    },
    ref
  ) => {
    // Animate assistant's message (typing), display user message immediately
    const [displayedContent, setDisplayedContent] = useState(
      role === "assistant" ? "" : message
    );

    useEffect(() => {
      if (role !== "assistant") {
        setDisplayedContent(message);
        return;
      }
      let index = 0;
      const intervalId = setInterval(() => {
        if (index < message.length) {
          setDisplayedContent((prev) => prev + message[index]);
          index++;
        } else {
          clearInterval(intervalId);
        }
      }, 20);
      return () => clearInterval(intervalId);
    }, [message, role]);

    const MessageAvatar = useCallback(() => <Avatar src={avatar} />, [avatar]);

    const MessageContent = () => (
      <div
        className={cn(
          "relative w-full rounded-medium px-4 py-3",
          role === "assistant"
            ? "bg-content2 text-default-600"
            : "bg-default-50 text-default-600",
          classNames?.base
        )}
      >
        <div className="flex">
          <div className="w-full text-small font-semibold text-default-foreground">
            {role === "assistant" ? (name || "Gemini") : (name || "You")}
          </div>
          <div className="flex-end text-small text-default-400">{time}</div>
        </div>
        <div className="mt-2 whitespace-pre-wrap text-small text-default-900">
          {displayedContent}
        </div>
        {imageUrl && (
          <Image
            alt={`Image sent by ${name}`}
            className="mt-2 border-2 border-default-200 shadow-small"
            height={96}
            src={imageUrl}
            width={264}
          />
        )}
      </div>
    );

    return (
      <div
        {...props}
        ref={ref}
        className={cn(
          "mb-3 flex gap-3",
          // Assistant on left => flex-row; user on right => flex-row-reverse
          role === "assistant" ? "flex-row" : "flex-row-reverse",
          // Conditionally add left margin for assistant, right margin for user
          role === "assistant" ? "ml-6" : "mr-6",
          className
        )}
      >
        <div className="flex-none">
          <MessageAvatar />
        </div>
        <MessageContent />
      </div>
    );
  }
);

MessagingChatMessage.displayName = "MessagingChatMessage";
export default MessagingChatMessage;

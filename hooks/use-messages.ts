import { ChatMessage } from "@/lib/schema";
import { useState } from "react";

export const useMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  return {
    messages,
    setMessages,
    addMessage,
  };
};

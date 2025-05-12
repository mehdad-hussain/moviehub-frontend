import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage } from "@/lib/schema";
import { format } from "date-fns";
import { getInitials } from "./chat-sidebar";

type ChatMessageProps = {
  message: ChatMessage;
  isCurrentUser: boolean;
};

export const ChatMessageComponent = ({ message, isCurrentUser }: ChatMessageProps) => {
  const formatMessageTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 mr-2 self-end mb-1 hidden sm:inline-flex">
          <AvatarImage
            src={`https://api.dicebear.com/6.x/initials/svg?seed=${message.sender.name}`}
          />
          <AvatarFallback>{getInitials(message.sender.name)}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={`rounded-2xl p-3 px-4 max-w-[80%] shadow-sm ${
          isCurrentUser
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-card border rounded-bl-none"
        }`}
      >
        <p className="break-words">{message.message}</p>
        <div className="flex items-center justify-end mt-1 gap-1">
          <span
            className={`text-xs ${
              isCurrentUser ? "text-primary-foreground/80" : "text-muted-foreground"
            }`}
          >
            {formatMessageTime(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, ChatRoom, User } from "@/lib/schema";
import { MessageSquare, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChatMessageComponent } from "./chat-message";
import { getInitials } from "./chat-sidebar";

type ChatAreaProps = {
  selectedUser: User | null;
  selectedRoom: ChatRoom | null;
  currentUser: User | null;
  messages: ChatMessage[];
  sendMessage: (recipientIdOrRoomId: string, message: string, isRoomMessage?: boolean) => void;
  onLeaveRoom: (roomId: string) => void;
  onlineUserIds?: string[]; // Add this prop
};

export const ChatArea = ({
  selectedUser,
  selectedRoom,
  currentUser,
  messages,
  sendMessage,
  onLeaveRoom,
  onlineUserIds = [], // Default to empty array
}: ChatAreaProps) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || (!selectedUser && !selectedRoom)) return;

    if (selectedUser) {
      const recipientId = selectedUser.id;

      if (!recipientId) {
        console.error(`Cannot send message: Invalid recipient ID for user ${selectedUser.name}`);
        return;
      }

      sendMessage(recipientId, message);
    } else if (selectedRoom) {
      const roomId = selectedRoom._id;

      if (!roomId) {
        console.error(`Cannot send message: Invalid room ID for room ${selectedRoom.name}`);
        return;
      }

      sendMessage(roomId, message, true);
    }

    setMessage("");
  };

  if (!selectedUser && !selectedRoom) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className="rounded-full bg-primary/10 p-8 mb-6">
          <MessageSquare className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold mb-3">Welcome to Chat</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Select a contact from the list to start chatting or search for a user to begin a new
          conversation.
        </p>
      </div>
    );
  }

  return (
    <>
      <CardHeader className="border-b px-6 py-4 flex-none bg-card">
        <div className="flex items-center">
          <div className="relative">
            <Avatar className="h-10 w-10 mr-4 border border-muted shadow-sm">
              <AvatarImage
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${
                  selectedUser ? selectedUser.name : selectedRoom?.name
                }`}
              />
              <AvatarFallback>
                {getInitials(selectedUser ? selectedUser.name : selectedRoom?.name || "")}
              </AvatarFallback>
            </Avatar>
            {/* Only show the green dot for online users */}
            {selectedUser && onlineUserIds.includes(selectedUser.id) && (
              <span className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></span>
            )}
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">
              {selectedUser ? selectedUser.name : selectedRoom?.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {selectedUser ? selectedUser.email : selectedRoom?.description}
            </p>
            {selectedRoom && (
              <div className="text-xs text-muted-foreground mt-1">
                <span>{selectedRoom.members?.length || 0} members</span>
                {currentUser &&
                  selectedRoom.members?.some((member) => member._id === currentUser.id) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 ml-2 text-xs"
                      onClick={() => onLeaveRoom(selectedRoom._id)}
                    >
                      Leave Room
                    </Button>
                  )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0 bg-accent/20">
        <ScrollArea className="h-full px-6 py-4">
          <div className="space-y-4 pt-0.5">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="rounded-full bg-primary/10 p-5 mb-5">
                  <Send className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Send a message to start chatting with{" "}
                  {selectedUser ? selectedUser.name : selectedRoom?.name}
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessageComponent
                  key={`${msg._id}-${msg.sender._id === currentUser?.id ? "sent" : "received"}`}
                  message={msg}
                  isCurrentUser={msg.sender._id === currentUser?.id}
                />
              ))
            )}
            <div className="h-4" />
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <div className="p-4 px-6 border-t bg-card">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-grow border-muted rounded-full px-4 focus-visible:ring-1 focus-visible:ring-primary"
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            disabled={!message.trim()}
            className="h-10 w-10 rounded-full"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </>
  );
};

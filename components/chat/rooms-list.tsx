import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChatRoom, User } from "@/lib/schema";
import { Users, X } from "lucide-react";
import { getInitials } from "./chat-sidebar";

type RoomsListProps = {
  rooms: ChatRoom[];
  selectedRoom: ChatRoom | null;
  onRoomSelect: (room: ChatRoom) => void;
  onLeaveRoom: (roomId: string) => void;
  onlineUsers?: Record<string, User[]>; // Map of roomId to list of online users
  onShowOnlineUsers?: (roomId: string) => void;
};

export const RoomsList = ({
  rooms,
  selectedRoom,
  onRoomSelect,
  onLeaveRoom,
  onlineUsers = {},
  onShowOnlineUsers,
}: RoomsListProps) => {
  return (
    <ScrollArea className="h-[22vh]">
      <div className="space-y-0.5 p-2">
        {rooms.length === 0 ? (
          <div className="text-center text-muted-foreground p-4 italic text-sm">
            No rooms available
          </div>
        ) : (
          rooms.map((room) => (
            <div
              key={`room-${room._id}`}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                selectedRoom?._id === room._id
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted"
              }`}
              onClick={() => onRoomSelect(room)}
            >
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${room.name}`} />
                <AvatarFallback>{getInitials(room.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{room.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {room.description || "No description"}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {onlineUsers[room._id] && (
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 px-2 flex items-center text-sm gap-1 bg-green-500/10 text-green-600 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            onShowOnlineUsers?.(room._id);
                          }}
                        >
                          <Users className="h-3.5 w-3.5" />
                          <span>{onlineUsers[room._id]?.length || 0}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Online users</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-50 hover:opacity-100 hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLeaveRoom(room._id);
                  }}
                  title="Leave room"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};

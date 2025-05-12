import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ChatRoom, User } from "@/lib/schema";
import { MessageSquare, Plus, Search, UserIcon, Users, UsersIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RoomsList } from "./rooms-list";
import { UsersList } from "./users-list";

type ChatSidebarProps = {
  users: User[];
  chatUsers: User[];
  rooms: ChatRoom[];
  allUsers: User[];
  selectedUser: User | null;
  selectedRoom: ChatRoom | null;
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUserSelect: (user: User) => void;
  onRoomSelect: (room: ChatRoom) => void;
  onLeaveRoom: (roomId: string) => void;
  onTabChange: (value: string) => void;
  onCreateRoom: (roomData: {
    name: string;
    description: string;
    members: string[];
  }) => Promise<boolean>;
};

export const ChatSidebar = ({
  users,
  chatUsers,
  rooms,
  allUsers,
  selectedUser,
  selectedRoom,
  currentUser,
  isLoading,
  error,
  searchQuery,
  onSearchChange,
  onUserSelect,
  onRoomSelect,
  onLeaveRoom,
  onTabChange,
  onCreateRoom,
}: ChatSidebarProps) => {
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [newRoomMembers, setNewRoomMembers] = useState<string[]>([]);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const toggleMember = (userId: string) => {
    setNewRoomMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
      setIsCreatingRoom(true);
      const success = await onCreateRoom({
        name: newRoomName,
        description: newRoomDescription,
        members: newRoomMembers,
      });

      if (success) {
        toast.success("Room created", {
          description: `Room "${newRoomName}" has been created successfully.`,
        });

        setNewRoomName("");
        setNewRoomDescription("");
        setNewRoomMembers([]);
        setIsCreateRoomOpen(false);
      }
    } catch (error) {
      toast.error("Failed to create room", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  return (
    <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-3">
      {/* Users List */}
      <Card className="h-3/5 py-1 overflow-hidden shadow-md border-muted/60">
        <CardHeader className="p-4 pb-2 space-y-2 bg-card">
          <CardTitle className="text-xl font-semibold flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            Users
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users..."
              className="pl-8 h-9 rounded-md border-muted"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Tabs defaultValue="all" onValueChange={onTabChange} className="w-full">
            <TabsList className="grid grid-cols-2 w-full h-9">
              <TabsTrigger value="all" className="flex items-center gap-1.5 text-xs">
                <UsersIcon className="h-3.5 w-3.5" />
                <span>All Users</span>
              </TabsTrigger>
              <TabsTrigger value="contacts" className="flex items-center gap-1.5 text-xs">
                <UserIcon className="h-3.5 w-3.5" />
                <span>Contacts</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          <UsersList
            users={users}
            currentUser={currentUser}
            selectedUser={selectedUser}
            isLoading={isLoading}
            error={error}
            onUserSelect={onUserSelect}
          />
        </CardContent>
      </Card>

      {/* Rooms Section */}
      <Card className="h-2/5 py-1 overflow-hidden shadow-md border-muted/60">
        <CardHeader className="p-4 pb-2 space-y-2 bg-card">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-primary" />
              Conversations
            </CardTitle>
            <Dialog open={isCreateRoomOpen} onOpenChange={setIsCreateRoomOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Room</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to create a new chat room.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="roomName" className="text-right">
                      Room Name
                    </Label>
                    <Input
                      id="roomName"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="roomDescription" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="roomDescription"
                      value={newRoomDescription}
                      onChange={(e) => setNewRoomDescription(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div>
                    <Label>Members</Label>
                    <ScrollArea className="h-[150px] border rounded-md p-2">
                      {allUsers.map((user) => (
                        <div
                          key={`member-selection-${user.id}`}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`member-${user.id}`}
                            checked={newRoomMembers.includes(user.id)}
                            onCheckedChange={() => toggleMember(user.id)}
                          />
                          <Label htmlFor={`member-${user.id}`} className="text-sm">
                            {user.name}
                          </Label>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateRoom}
                    disabled={isCreatingRoom || !newRoomName.trim()}
                  >
                    {isCreatingRoom ? "Creating..." : "Create Room"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Tabs defaultValue="directMessages" className="w-full">
            <TabsList className="grid grid-cols-2 w-full h-9">
              <TabsTrigger value="directMessages" className="flex items-center gap-1.5 text-xs">
                <UserIcon className="h-3.5 w-3.5" />
                <span>Direct Messages</span>
              </TabsTrigger>
              <TabsTrigger value="rooms" className="flex items-center gap-1.5 text-xs">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Rooms</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="directMessages" className="mt-0">
              <ScrollArea className="h-[22vh]">
                <div className="space-y-0.5 p-2">
                  {chatUsers.length === 0 ? (
                    <div className="text-center text-muted-foreground p-4 italic text-sm">
                      No recent conversations
                    </div>
                  ) : (
                    chatUsers
                      .filter((user) => user.id !== currentUser?.id)
                      .map((user) => (
                        <div
                          key={`chatuser-${user.id}`}
                          className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedUser?.id === user.id
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-muted"
                          }`}
                          onClick={() => onUserSelect(user)}
                        >
                          <div className="relative">
                            <Avatar className="h-8 w-8 mr-3 border border-muted">
                              <AvatarImage
                                src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`}
                              />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-0 right-2 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card"></span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{user.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="rooms" className="mt-0">
              <RoomsList
                rooms={rooms}
                selectedRoom={selectedRoom}
                onRoomSelect={onRoomSelect}
                onLeaveRoom={onLeaveRoom}
              />
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
};

// Helper function to get initials from a name
export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

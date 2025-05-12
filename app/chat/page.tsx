"use client";

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
import { useChat } from "@/hooks/use-chat";
import { chatApi, chatRoomApi, usersApi } from "@/lib/api";
import { ChatMessage as ChatMessageType, ChatRoom, User } from "@/lib/schema";
import { useAuthStore } from "@/lib/store/auth-store";
import { format } from "date-fns";
import { MessageSquare, Plus, Search, Send, UserIcon, Users, UsersIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = Record<string, never>;

const Page = ({}: Props) => {
  const [users, setUsers] = useState<User[]>([]);
  const [chatUsers, setChatUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create new room modal state
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [newRoomMembers, setNewRoomMembers] = useState<string[]>([]);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const currentUser = useAuthStore((state) => state.user);

  const { sendMessage, joinRoom, leaveRoom } = useChat({
    onNewMessage: (message) => {
      if (selectedUser && message.sender._id === selectedUser.id) {
        setMessages((prev) => [...prev, { ...message, read: message.read || false }]);
      }
    },
    onNewRoomMessage: (message) => {
      if (selectedRoom && message.roomId === selectedRoom._id) {
        setMessages((prev) => [...prev, { ...message, read: message.read || false }]);
      }
    },
    onMessageSent: (message) => {
      if (
        (selectedUser && message.recipient === selectedUser.id) ||
        (selectedRoom && message.roomId === selectedRoom._id)
      ) {
        setMessages((prev) => [...prev, { ...message, read: message.read || false }]);
      }
    },
    onRoomJoined: (data) => {
      console.log(`Joined room: ${data.name}`);
    },
    onRoomLeft: (data) => {
      console.log(`Left room: ${data.name}`);
    },
    onRoomAdded: (data) => {
      console.log(`Added to room: ${data.room.name}`);

      // Show notification (you could add a more elaborate notification system)
      alert(data.message);

      // Refresh rooms list
      fetchRooms();
    },
  });

  useEffect(() => {
    fetchUsers();
    fetchRooms();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedUser && selectedUser.id) {
      loadChatHistory(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      setUsers(
        allUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(lowerQuery) ||
            user.email.toLowerCase().includes(lowerQuery),
        ),
      );
    } else {
      setUsers(allUsers);
    }
  }, [searchQuery, allUsers]);

  const fetchChatUsers = async () => {
    try {
      const fetchedChatUsers = await chatApi.getChatUsers();
      if (fetchedChatUsers && fetchedChatUsers.length > 0) {
        const mappedChatUsers = fetchedChatUsers.map((user: User) => ({
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
        }));
        setChatUsers(mappedChatUsers);
      }
    } catch (err) {
      console.error("Error fetching chat users:", err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const fetchedAllUsers = await usersApi.getAllUsers();
      const mappedAllUsers = fetchedAllUsers.map((user) => ({
        id: user._id || user.id,
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
      }));

      setAllUsers(mappedAllUsers);
      setUsers(mappedAllUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
      console.error("Error fetching users:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      await fetchChatUsers();
      await fetchAllUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const userRooms = await chatRoomApi.getUserRooms();
      setRooms(userRooms);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  const loadChatHistory = async (userId: string) => {
    if (!userId) {
      console.error("Cannot load chat history: Invalid user ID");
      setMessages([]);
      return;
    }

    try {
      const history = await chatApi.getChatHistory(userId);
      setMessages(history);
    } catch (err) {
      console.error("Error loading chat history:", err);
      setMessages([]);
    }
  };

  const loadRoomChatHistory = async (roomId: string) => {
    try {
      const history = await chatRoomApi.getRoomChatHistory(roomId);
      setMessages(history);
    } catch (err) {
      console.error("Error loading room chat history:", err);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

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

      sendMessage(roomId, message, true); // Pass true to indicate this is a room message
    }

    setMessage("");
  };

  const formatMessageTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSelectedRoom(null);
  };

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
    setSelectedUser(null);

    // Join the room when it's selected
    joinRoom(room._id);

    // Load room chat history
    loadRoomChatHistory(room._id);
  };

  // Handle leaving a room
  const handleLeaveRoom = async (roomId: string) => {
    try {
      // Tell the server we're leaving the room
      leaveRoom(roomId);

      // Call the API to leave the room
      await chatRoomApi.leaveRoom(roomId);

      // Update rooms list
      fetchRooms();

      // If we're currently viewing this room, reset the selection
      if (selectedRoom && selectedRoom._id === roomId) {
        setSelectedRoom(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Error leaving room:", err);
    }
  };

  const handleSetTab = (value: string) => {
    if (value === "contacts") {
      fetchChatUsers();
      setUsers(chatUsers);
    } else {
      fetchAllUsers();
      setUsers(allUsers);
    }
  };

  // Create a new chat room
  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;

    try {
      setIsCreatingRoom(true);

      await chatRoomApi.createRoom({
        name: newRoomName,
        description: newRoomDescription,
        members: newRoomMembers,
      });

      // Reset form and close modal
      setNewRoomName("");
      setNewRoomDescription("");
      setNewRoomMembers([]);
      setIsCreateRoomOpen(false);

      // Refresh rooms list
      fetchRooms();
    } catch (err) {
      console.error("Error creating room:", err);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // Add or remove a member from the new room members list
  const toggleMember = (userId: string) => {
    setNewRoomMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  return (
    <div className="container mx-auto p-4 h-[90vh] max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
        {/* Sidebar with Users and Rooms */}
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs defaultValue="all" onValueChange={handleSetTab} className="w-full">
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
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 p-4 text-center">{error}</div>
              ) : (
                <ScrollArea className="h-[30vh]">
                  <div className="space-y-0.5 p-2">
                    {users.length === 0 ? (
                      <div className="text-center text-muted-foreground p-4 italic text-sm">
                        No users found
                      </div>
                    ) : (
                      users
                        .filter((user) => user.id !== currentUser?.id)
                        .map((user) => (
                          <div
                            key={`user-${user.id}`}
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedUser?.id === user.id
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-muted"
                            }`}
                            onClick={() => handleUserSelect(user)}
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
              )}
            </CardContent>
          </Card>

          {/* Chats and Rooms Tabs */}
          <Card className="h-2/5 py-1 overflow-hidden shadow-md border-muted/60">
            <CardHeader className="p-4 pb-2 space-y-2 bg-card">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                  Conversations
                </CardTitle>
                <Dialog>
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
                              onClick={() => handleUserSelect(user)}
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
                            onClick={() => handleRoomSelect(room)}
                          >
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarImage
                                src={`https://api.dicebear.com/6.x/initials/svg?seed=${room.name}`}
                              />
                              <AvatarFallback>{getInitials(room.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{room.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {room.description || "No description"}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-50 hover:opacity-100 hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLeaveRoom(room._id);
                              }}
                              title="Leave room"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>

        {/* Chat Area */}
        <Card
          id="chat-area"
          className="md:col-span-8 lg:col-span-9 h-full flex flex-col overflow-hidden shadow-md border-muted/60"
        >
          {selectedUser || selectedRoom ? (
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
                    {selectedUser && (
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
                              onClick={() => handleLeaveRoom(selectedRoom._id)}
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
                <ScrollArea className="h-[70vh] px-6 py-4">
                  <div className="space-y-4">
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
                      messages.map((msg) => {
                        const isCurrentUser = msg.sender._id === currentUser?.id;
                        return (
                          <div
                            key={`${msg._id}-${isCurrentUser ? "sent" : "received"}`}
                            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                          >
                            {!isCurrentUser && (
                              <Avatar className="h-8 w-8 mr-2 self-end mb-1 hidden sm:inline-flex">
                                <AvatarImage
                                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${msg.sender.name}`}
                                />
                                <AvatarFallback>{getInitials(msg.sender.name)}</AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`rounded-2xl p-3 px-4 max-w-[80%] shadow-sm ${
                                isCurrentUser
                                  ? "bg-primary text-primary-foreground rounded-br-none"
                                  : "bg-card border rounded-bl-none"
                              }`}
                            >
                              <p className="break-words">{msg.message}</p>
                              <div className="flex items-center justify-end mt-1 gap-1">
                                <span
                                  className={`text-xs ${
                                    isCurrentUser
                                      ? "text-primary-foreground/80"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {formatMessageTime(msg.createdAt)}
                                </span>
                                {isCurrentUser && (
                                  <span className="text-xs text-primary-foreground/80">
                                    {msg.read ? "✓✓" : "✓"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
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
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="rounded-full bg-primary/10 p-8 mb-6">
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Welcome to Chat</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Select a contact from the list to start chatting or search for a user to begin a new
                conversation.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="outline" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span>Find Contacts</span>
                </Button>
                <Button
                  className="flex items-center gap-2"
                  onClick={() => setIsCreateRoomOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  <span>New Chat Room</span>
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Page;

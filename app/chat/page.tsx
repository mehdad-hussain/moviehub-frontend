"use client";

import { UsersList } from "@/components/chat/users-list";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useChat } from "@/hooks/use-chat";
import { chatApi, chatRoomApi, usersApi } from "@/lib/api";
import { ChatRoom, User } from "@/lib/schema";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ChatArea } from "../../components/chat/chat-area";
import { ChatSidebar } from "../../components/chat/chat-sidebar";
import { useMessages } from "../../hooks/use-messages";

const Page = () => {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [chatUsers, setChatUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<Record<string, User[]>>({});
  const [selectedRoomForUsers, setSelectedRoomForUsers] = useState<string | null>(null);
  const [showOnlineUsersDialog, setShowOnlineUsersDialog] = useState(false);

  const { accessToken, user: currentUser } = useAuthStore((state) => state);
  const { messages, setMessages, addMessage } = useMessages();
  // Add a state to track rooms created by the current user
  const [createdRoomIds, setCreatedRoomIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthChecking(true);

      if (!accessToken) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            router.push("/login?callbackUrl=" + encodeURIComponent("/chat"));
            return;
          }
        } catch (error) {
          console.error("Error checking authentication:", error);
          router.push("/login?callbackUrl=" + encodeURIComponent("/chat"));
          return;
        }
      }

      setIsAuthChecking(false);
    };

    checkAuth();
  }, [accessToken, router]);
  const { sendMessage, joinRoom, leaveRoom, getOnlineUsers } = useChat({
    onNewMessage: (message) => {
      if (selectedUser && message.sender._id === selectedUser.id) {
        addMessage({ ...message, read: message.read || false });
      }
    },
    onNewRoomMessage: (message) => {
      if (selectedRoom && message.roomId === selectedRoom._id) {
        addMessage({ ...message, read: message.read || false });
      }
    },
    onMessageSent: (message) => {
      if (
        (selectedUser && message.recipient === selectedUser.id) ||
        (selectedRoom && message.roomId === selectedRoom._id)
      ) {
        addMessage({ ...message, read: message.read || false });
      }
    },
    onRoomJoined: (data) => {
      console.log(`Joined room: ${data.name}`);
      // When joining a room, request the online users for this room
      getOnlineUsers();
    },
    onRoomLeft: (data) => {
      console.log(`Left room: ${data.name}`);
    },
    onRoomAdded: (data) => {
      console.log(`Added to room: ${data.room.name}`);

      // Check if this is a room the current user created
      if (!createdRoomIds.has(data.room._id)) {
        // Only show toast for rooms the user didn't create themselves
        toast.success(data.message, {
          description: `You have been added to ${data.room.name}`,
        });
      }

      fetchRooms();
    },
    // Online user events
    onOnlineUsersList: (data) => {
      const roomUsersMap: Record<string, User[]> = {};

      // Process the users and organize them by room
      if (data.userIds && data.userIds.length > 0) {
        // Find the actual user objects from allUsers
        const onlineUserObjects = allUsers.filter((user) => data.userIds.includes(user.id));

        // For simplicity, we'll just add all online users to the current selected room
        if (selectedRoom) {
          roomUsersMap[selectedRoom._id] = onlineUserObjects;
        }
      }

      setOnlineUsers(roomUsersMap);
    },
    // Reconnection handlers
    onReconnect: () => {
      toast.success("Reconnected", {
        description: "Your connection has been restored.",
      });
      // After reconnection, refresh the online users list
      getOnlineUsers();
    },
    onReconnectionSuccessful: (data) => {
      toast.success("Reconnection successful", {
        description: data.message,
      });
    },
  });

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    setIsLoading(true);

    const fetchInitialData = async () => {
      try {
        await Promise.all([fetchChatUsers(), fetchAllUsers(), fetchRooms()]);
        // After fetching initial data, request online users
        getOnlineUsers();
      } catch (err) {
        console.error("Error fetching initial data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [accessToken, getOnlineUsers]);

  useEffect(() => {
    if (accessToken) {
      fetchRooms();
    }
  }, [accessToken]);

  useEffect(() => {
    if (selectedUser && selectedUser.id) {
      loadChatHistory(selectedUser.id);
    }
  }, [selectedUser]);

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

  const fetchRooms = useCallback(async () => {
    try {
      const userRooms = await chatRoomApi.getUserRooms();
      setRooms(userRooms);

      // After fetching rooms, also request online users
      if (getOnlineUsers) {
        getOnlineUsers();
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  }, [getOnlineUsers]);

  const loadChatHistory = useCallback(
    async (userId: string) => {
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
    },
    [setMessages],
  );

  const loadRoomChatHistory = async (roomId: string) => {
    try {
      const history = await chatRoomApi.getRoomChatHistory(roomId);
      setMessages(history);
    } catch (err) {
      console.error("Error loading room chat history:", err);
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSelectedRoom(null);
  };
  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
    setSelectedUser(null);
    joinRoom(room._id);
    loadRoomChatHistory(room._id);
    // When a room is selected, fetch online users
    getOnlineUsers();
  };

  const handleLeaveRoom = async (roomId: string) => {
    try {
      leaveRoom(roomId);
      await chatRoomApi.leaveRoom(roomId);
      fetchRooms();

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

  const handleShowOnlineUsers = (roomId: string) => {
    setSelectedRoomForUsers(roomId);
    setShowOnlineUsersDialog(true);
  };

  const handleCreateRoom = async (roomData: {
    name: string;
    description: string;
    members: string[];
  }) => {
    try {
      const newRoom = await chatRoomApi.createRoom(roomData);

      // Store the ID of the room the user just created
      if (newRoom && newRoom._id) {
        setCreatedRoomIds((prev) => {
          const updated = new Set(prev);
          updated.add(newRoom._id);
          return updated;
        });
      }

      setTimeout(() => {
        fetchRooms();
      }, 500);

      return true;
    } catch (err) {
      console.error("Error creating room:", err);
      return false;
    }
  };

  if (isAuthChecking) {
    return (
      <div className="container mx-auto p-4 h-[90vh] max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
          <div className="md:col-span-4 lg:col-span-3">
            <Card className="h-full shadow-md border-muted/60">
              <div className="p-4">
                <Skeleton className="h-8 w-36 mb-4" />
                <Skeleton className="h-10 w-full mb-6" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </Card>
          </div>
          <Card className="md:col-span-8 lg:col-span-9 h-full flex flex-col overflow-hidden shadow-md border-muted/60">
            <div className="p-4 border-b">
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="flex-1 p-4">
              <div className="flex justify-center items-center h-full">
                <Skeleton className="h-8 w-64" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-4 h-[90vh] max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
        <ChatSidebar
          users={users}
          chatUsers={chatUsers}
          rooms={rooms}
          allUsers={allUsers}
          selectedUser={selectedUser}
          selectedRoom={selectedRoom}
          currentUser={currentUser}
          isLoading={isLoading}
          error={error}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onUserSelect={handleUserSelect}
          onRoomSelect={handleRoomSelect}
          onLeaveRoom={handleLeaveRoom}
          onTabChange={handleSetTab}
          onCreateRoom={handleCreateRoom}
          onlineUsers={onlineUsers}
          onShowOnlineUsers={handleShowOnlineUsers}
        />

        <Card className="md:col-span-8 lg:col-span-9 h-full flex flex-col overflow-hidden shadow-md border-muted/60">
          <ChatArea
            selectedUser={selectedUser}
            selectedRoom={selectedRoom}
            currentUser={currentUser}
            messages={messages}
            sendMessage={sendMessage}
            onLeaveRoom={handleLeaveRoom}
          />
        </Card>
      </div>

      {/* Dialog for showing online users in a room */}
      <Dialog open={showOnlineUsersDialog} onOpenChange={setShowOnlineUsersDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Online Users</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px]">
            {selectedRoomForUsers && onlineUsers[selectedRoomForUsers] ? (
              <UsersList
                users={onlineUsers[selectedRoomForUsers]}
                currentUser={currentUser}
                selectedUser={null}
                isLoading={false}
                error={null}
                onUserSelect={() => {}}
              />
            ) : (
              <div className="text-center p-4 text-muted-foreground">
                No users are currently online in this room
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;

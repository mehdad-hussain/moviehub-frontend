"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChat } from "@/hooks/use-chat";
import { chatApi, usersApi } from "@/lib/api";
import { ChatMessage as ChatMessageType, User } from "@/lib/schema";
import { useAuthStore } from "@/lib/store/auth-store";
import { format } from "date-fns";
import { Search, Send, UserIcon, UsersIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = Record<string, never>;

const Page = ({}: Props) => {
  const [users, setUsers] = useState<User[]>([]);
  const [chatUsers, setChatUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = useAuthStore((state) => state.user);

  // Use the specialized chat hook instead of the general socket hook
  const { sendMessage } = useChat({
    onNewMessage: (message) => {
      if (selectedUser && message.sender._id === selectedUser.id) {
        setMessages((prev) => [...prev, { ...message, read: message.read || false }]);
      }
    },
    onMessageSent: (message) => {
      if (selectedUser && message.recipient === selectedUser.id) {
        setMessages((prev) => [...prev, { ...message, read: message.read || false }]);
      }
    },
  });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load chat history when user is selected
  useEffect(() => {
    if (selectedUser && selectedUser.id) {
      loadChatHistory(selectedUser.id);
    }
  }, [selectedUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter users based on search query
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

  // Get chat users (users who have chatted before)
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
      console.log("Error fetching chat users:", err);
    }
  };

  // Get all users
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

      // Fetch both types of users initially
      await fetchChatUsers();
      await fetchAllUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedUser) return;

    const recipientId = selectedUser.id;

    if (!recipientId) {
      console.error(`Cannot send message: Invalid recipient ID for user ${selectedUser.name}`);
      return;
    }

    // Use the sendMessage function from useChat instead of direct sendPrivateMessage
    sendMessage(recipientId, message);
    setMessage("");
  };

  const formatMessageTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  // Fetch appropriate user list when changing tabs
  const handleSetTab = (value: string) => {
    if (value === "contacts") {
      fetchChatUsers();
      setUsers(chatUsers);
    } else {
      fetchAllUsers();
      setUsers(allUsers);
    }
  };

  return (
    <div className="container mx-auto p-4 h-[85vh]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {/* Users List - Left Side */}
        <Card className="md:col-span-1 h-full overflow-hidden">
          <CardHeader className="p-4 space-y-2">
            <CardTitle className="text-2xl font-bold">Messages</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs defaultValue="all" onValueChange={handleSetTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  <span>All Users</span>
                </TabsTrigger>
                <TabsTrigger value="contacts" className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
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
              <ScrollArea className="h-[58vh]">
                <div className="space-y-1 p-2">
                  {users.length === 0 ? (
                    <div className="text-center text-muted-foreground p-4">No users found</div>
                  ) : (
                    users
                      .filter((user) => user.id !== currentUser?.id)
                      .map((user) => (
                        <div
                          key={user.id}
                          className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                            selectedUser?.id === user.id ? "bg-primary/10" : "hover:bg-accent"
                          }`}
                          onClick={() => handleUserSelect(user)}
                        >
                          <div className="relative">
                            <Avatar className="h-10 w-10 mr-3 border border-border">
                              <AvatarImage
                                src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`}
                              />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
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

        {/* Chat Area - Right Side */}
        <Card id="chat-area" className="md:col-span-2 h-full flex flex-col">
          {selectedUser ? (
            <>
              <CardHeader className="border-b px-4 py-3 flex-none">
                <div className="flex items-center">
                  <div className="relative">
                    <Avatar className="h-10 w-10 mr-3 border border-border">
                      <AvatarImage
                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${selectedUser.name}`}
                      />
                      <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{selectedUser.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden p-0 bg-accent/30">
                <ScrollArea className="h-[58vh] px-4 py-2">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[45vh] text-center">
                        <div className="rounded-full bg-primary/10 p-4 mb-4">
                          <Send className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium mb-1">No messages yet</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                          Send a message to start chatting with {selectedUser.name}
                        </p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isCurrentUser = msg.sender._id === currentUser?.id;
                        return (
                          <div
                            key={msg._id}
                            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`rounded-lg p-3 max-w-[80%] ${
                                isCurrentUser
                                  ? "bg-primary text-primary-foreground rounded-br-none"
                                  : "bg-card border rounded-bl-none"
                              }`}
                            >
                              <p className="break-words">{msg.message}</p>
                              <div className="flex items-center justify-end mt-1 gap-1">
                                <span
                                  className={`text-xs ${isCurrentUser ? "text-primary-foreground/80" : "text-muted-foreground"}`}
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
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-grow"
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    disabled={!message.trim()}
                    className="h-10 w-10"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="rounded-full bg-primary/10 p-6 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1-2-2h14a2 2 0 0 1-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Your messages</h3>
              <p className="text-muted-foreground max-w-sm">
                Select a contact from the list to start chatting or search for a user to begin a new
                conversation.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Page;

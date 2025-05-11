"use client";
import { Menu, MessageSquare, Plus, Send, Settings } from "lucide-react";
import { useState } from "react";

type Props = Record<string, never>;

type Message = {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  avatar: string;
};

type Room = {
  id: number;
  name: string;
  unread: boolean;
};

type DirectMessage = {
  id: number;
  name: string;
  status: "online" | "offline" | "away";
  unread: boolean;
};

const Page = ({}: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeRoom, setActiveRoom] = useState("general");
  const [messageInput, setMessageInput] = useState("");

  // Dummy data
  const rooms: Room[] = [
    { id: 1, name: "general", unread: false },
    { id: 2, name: "movies", unread: true },
    { id: 3, name: "series", unread: false },
    { id: 4, name: "anime", unread: false },
  ];

  const directMessages: DirectMessage[] = [
    { id: 1, name: "John Doe", status: "online", unread: true },
    { id: 2, name: "Jane Smith", status: "offline", unread: false },
    { id: 3, name: "Mark Johnson", status: "away", unread: false },
  ];

  const messages: Message[] = [
    {
      id: 1,
      sender: "John Doe",
      content: "Hey everyone! What movies are you watching this weekend?",
      timestamp: "12:30 PM",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: 2,
      sender: "Jane Smith",
      content: "I'm planning to watch the new Marvel movie. Anyone interested?",
      timestamp: "12:32 PM",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    {
      id: 3,
      sender: "Mark Johnson",
      content: "Count me in! What time are you thinking?",
      timestamp: "12:35 PM",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    {
      id: 4,
      sender: "John Doe",
      content: "How about 7 PM on Saturday?",
      timestamp: "12:37 PM",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: 5,
      sender: "You",
      content: "That works for me too!",
      timestamp: "12:39 PM",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the message
    setMessageInput("");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-[calc(100vh-65px)] bg-white text-gray-900">
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-200 p-2 rounded-md"
        onClick={toggleSidebar}
      >
        <Menu className="text-gray-900" />
      </button>

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transform transition-transform duration-300 fixed md:relative w-64 h-full bg-gray-100 text-gray-900 z-40`}
      >
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold">MovieHub Chat</h1>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-md font-semibold text-gray-600 uppercase">Channels</h2>
            <button className="text-gray-600 hover:text-gray-900">
              <Plus />
            </button>
          </div>
          <ul>
            {rooms.map((room) => (
              <li key={room.id} className="mb-1">
                <button
                  className={`flex items-center w-full p-2 rounded-md ${activeRoom === room.name ? "bg-blue-100 text-blue-600" : "hover:bg-gray-200"}`}
                  onClick={() => setActiveRoom(room.name)}
                >
                  <MessageSquare className="mr-2" />
                  <span>{room.name}</span>
                  {room.unread && <span className="ml-auto bg-red-500 w-2 h-2 rounded-full"></span>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-md font-semibold text-gray-600 uppercase">Direct Messages</h2>
            <button className="text-gray-600 hover:text-gray-900">
              <Plus />
            </button>
          </div>
          <ul>
            {directMessages.map((dm) => (
              <li key={dm.id} className="mb-1">
                <button
                  className="flex items-center w-full p-2 rounded-md hover:bg-gray-200"
                  onClick={() => setActiveRoom(dm.name)}
                >
                  <div className="relative mr-2">
                    <div className="w-2 h-2 absolute bottom-0 right-0 rounded-full bg-white">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          dm.status === "online"
                            ? "bg-green-500"
                            : dm.status === "away"
                              ? "bg-yellow-500"
                              : "bg-gray-400"
                        }`}
                      ></div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs">
                      {dm.name.charAt(0)}
                    </div>
                  </div>
                  <span>{dm.name}</span>
                  {dm.unread && <span className="ml-auto bg-red-500 w-2 h-2 rounded-full"></span>}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white mr-2 flex items-center justify-center">
              <span>Y</span>
            </div>
            <div>
              <div className="font-medium">Your Name</div>
              <div className="text-xs text-gray-600">#userId123</div>
            </div>
            <button className="ml-auto text-gray-600 hover:text-gray-900">
              <Settings />
            </button>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Channel header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">#{activeRoom}</h2>
            <div className="ml-4 text-sm text-gray-600">5 members</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start">
              <img
                src={message.avatar}
                alt={message.sender}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <div className="flex items-center">
                  <span className="font-semibold">{message.sender}</span>
                  <span className="text-xs text-gray-600 ml-2">{message.timestamp}</span>
                </div>
                <p className="text-gray-800">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSendMessage} className="flex">
            <input
              type="text"
              placeholder={`Message #${activeRoom}`}
              className="flex-1 bg-gray-100 text-gray-900 p-2 rounded-l-md focus:outline-none border border-gray-300 border-r-0"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 rounded-r-md flex items-center justify-center"
            >
              <Send />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;

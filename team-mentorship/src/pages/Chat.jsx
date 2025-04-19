"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaEllipsisH,
  FaPaperPlane,
  FaSearch,
  FaSmile,
  FaUserCircle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import io from "socket.io-client";
// import { config } from "../config";

export default function Chat() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:5000", { // Explicit backend URL
      withCredentials: true,
      autoConnect: false
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  // Set up socket event listeners when user is authenticated
  useEffect(() => {
    if (!socket || !user) return;

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit("register", user.uid);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleNewMessage = (message) => {
      if (
        (message.from === selectedChat?.id ||
          message.to === selectedChat?.id) &&
        (message.from === user.uid || message.to === user.uid)
      ) {
        setMessages((prev) => [...prev, message]);
      }

      // Update last message in conversations
      setConversations((prev) => {
        const otherUserId =
          message.from === user.uid ? message.to : message.from;
        const updated = prev.map((conv) =>
          conv.id === otherUserId
            ? { ...conv, lastMessage: message.text, time: message.timestamp }
            : conv
        );

        // If this is a new conversation, add it
        if (!prev.some((conv) => conv.id === otherUserId)) {
          return [
            {
              id: otherUserId,
              name:
                message.from === user.uid ? selectedChat?.name : "Unknown User",
              avatar:
                message.from === user.uid
                  ? selectedChat?.avatar
                  : "/default-profile.png",
              lastMessage: message.text,
              time: message.timestamp,
              unread: message.from !== user.uid && !message.read ? 1 : 0,
            },
            ...updated,
          ];
        }

        return updated;
      });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("newMessage", handleNewMessage);

    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("newMessage", handleNewMessage);
      socket.disconnect();
    };
  }, [socket, user, selectedChat]);

  // Fetch conversations when user changes
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const response = await fetch(`/api/chat/conversations/${user.uid}`);
        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, [user]);

  // Fetch messages when selected chat changes
  useEffect(() => {
    if (!selectedChat || !user) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `/api/chat/messages/${user.uid}/${selectedChat.id}`
        );
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedChat, user]);

  // Handle search for users
  useEffect(() => {
    if (!searchQuery || !user) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      try {
        const response = await fetch(
          `/api/chat/search/${user.uid}/${searchQuery}`
        );
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Error searching users:", error);
      }
    };

    const timer = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, user]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat || !user || !socket) return;

    const message = {
      from: user.uid,
      to: selectedChat.id,
      text: messageText,
      timestamp: new Date().toISOString(),
    };

    // Optimistically add the message
    setMessages((prev) => [...prev, message]);
    setMessageText("");

    try {
      // Send via socket.io for real-time
      socket.emit("sendMessage", message);

      // Also save to database via API
      await fetch("/api/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally show error to user
    }
  };

  const startNewChat = (user) => {
    setSelectedChat({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="bg-gray-900 min-h-screen flex">
      {/* Chat List */}
      <div className="w-full md:w-80 lg:w-96 bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white mb-4">Messages</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
              aria-label="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="border-b border-gray-700">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center p-4 cursor-pointer hover:bg-gray-700/50"
                onClick={() => startNewChat(user)}
              >
                <img
                  src={user.avatar}
                  alt={`${user.name} avatar`}
                  className="w-12 h-12 rounded-full object-cover"
                  width={48}
                  height={48}
                />
                <div className="ml-3 flex-1 overflow-hidden">
                  <h3 className="font-medium text-white truncate">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-400 truncate">
                    Start new chat
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="overflow-y-auto h-[calc(100vh-130px)]">
          {conversations.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center p-4 cursor-pointer ${
                selectedChat?.id === chat.id
                  ? "bg-gray-700"
                  : "hover:bg-gray-700/50"
              }`}
              onClick={() => setSelectedChat(chat)}
              aria-selected={selectedChat?.id === chat.id}
            >
              <div className="relative">
                <img
                  src={chat.avatar}
                  alt={`${chat.name} avatar`}
                  className="w-12 h-12 rounded-full object-cover"
                  width={48}
                  height={48}
                />
              </div>
              <div className="ml-3 flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-white truncate">
                    {chat.name}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {new Date(chat.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-400 truncate">
                  {chat.lastMessage}
                </p>
              </div>
              {chat.unread > 0 && (
                <div className="ml-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden md:flex flex-col flex-1 bg-gray-900">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={selectedChat.avatar}
                  alt={`${selectedChat.name} avatar`}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                  width={40}
                  height={40}
                />
                <div>
                  <h2 className="font-medium text-white">
                    {selectedChat.name}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {isConnected ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <button
                className="text-gray-400 hover:text-white p-2"
                aria-label="More options"
              >
                <FaEllipsisH />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id || message.timestamp}
                  className={`flex ${
                    message.from === user.uid ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] ${
                      message.from === user.uid ? "order-2" : "order-1"
                    }`}
                  >
                    {message.from !== user.uid && (
                      <div className="flex items-center mb-1">
                        <FaUserCircle className="text-gray-500 mr-1" />
                        <span className="text-xs text-gray-400">
                          {selectedChat.name}
                        </span>
                      </div>
                    )}
                    <div
                      className={`rounded-lg p-3 ${
                        message.from === user.uid
                          ? "bg-purple-600 text-white"
                          : "bg-gray-700 text-gray-200"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center">
                <button
                  className="text-gray-400 hover:text-white p-2"
                  aria-label="Open emoji picker"
                >
                  <FaSmile />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white mx-2"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  aria-label="Message input"
                  disabled={!isConnected}
                />
                <button
                  className={`p-2 rounded-full ${
                    messageText.trim() && isConnected
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-400"
                  }`}
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || !isConnected}
                  aria-label="Send message"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400">
                Select a conversation to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: No chat selected message */}
      <div className="flex-1 flex items-center justify-center md:hidden">
        <div className="text-center p-4">
          <p className="text-gray-400">
            Select a conversation to start chatting
          </p>
        </div>
      </div>
    </div>
  );
}

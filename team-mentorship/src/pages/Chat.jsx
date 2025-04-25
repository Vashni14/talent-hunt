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
import ChatInterface from "../components/ChatInterface";

export default function Chat() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(() => {
    const saved = localStorage.getItem("selectedChat");
    return saved ? JSON.parse(saved) : null;
  });
  const [messageText, setMessageText] = useState("");
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const API_BASE_URL = "http://localhost:5000";


  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    const newSocket = io("http://localhost:5000", {
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    const handleConnect = () => {
      setIsConnected(true);
      console.log("Socket connected");
      newSocket.emit("register", user.uid);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    };

    // In your Socket.io useEffect
    const handleNewMessage = (message) => {
      // Update messages if in current chat
      if (message.tempId) return;
      if (
        selectedChat &&
        (message.from === selectedChat.id || message.to === selectedChat.id)
      ) {
        setMessages(prev => {
          // Check if message already exists
          const exists = prev.some(m => 
            m._id === message._id || 
            (m.tempId && m.text === message.text && m.from === message.from)
          );
          
          return exists ? prev : [...prev, message];
        });
      }

      // Update conversations list
      setConversations((prev) => {
        const otherUserId =
          message.from === user.uid ? message.to : message.from;
        const existingIndex = prev.findIndex((c) => c.id === otherUserId);

        if (existingIndex >= 0) {
          // Update existing conversation
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            lastMessage: message.text,
            time: message.timestamp,
            unread:
              message.from !== user.uid
                ? (updated[existingIndex].unread || 0) + 1
                : updated[existingIndex].unread,
          };
          return updated;
        } else {
          // Add new conversation
          return [
            {
              id: otherUserId,
              name:
                message.from === user.uid
                  ? selectedChat?.id === otherUserId
                    ? selectedChat.name
                    : "Unknown"
                  : "Unknown",
              avatar: "/default-profile.png",
              lastMessage: message.text,
              time: message.timestamp,
              unread: message.from !== user.uid ? 1 : 0,
            },
            ...prev,
          ];
        }
      });
    };

    newSocket.on("connect", handleConnect);
    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("newMessage", handleNewMessage);

    return () => {
      newSocket.off("connect", handleConnect);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("newMessage", handleNewMessage);
      newSocket.disconnect();
    };
  }, [user]);

  // Fetch conversations when user changes
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/chat/conversations/${user.uid}`
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch conversations");
        }
        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error("Conversations error:", error);
        setConversations([]); // Reset to empty array on error
      }
    };

    fetchConversations();
  }, [user]);

  // Fetch messages when selected chat changes
  useEffect(() => {
    if (!selectedChat || !user) return;

    const fetchMessages = async () => {
      try {
        console.log(
          `Fetching messages between ${user.uid} and ${selectedChat.id}`
        );
        const response = await fetch(
          `${API_BASE_URL}/api/chat/messages/${user.uid}/${selectedChat.id}`,
          {
            credentials: "include",
            
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch messages");
        }

        const data = await response.json();
        console.log("Fetched messages:", data);
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", {
          error: error.message,
          stack: error.stack,
        });
        // Optionally show error to user
        setMessages([]);
      }
    };

    fetchMessages();
  }, [selectedChat, user]);

  // Save to localStorage when selectedChat changes
  useEffect(() => {
    if (selectedChat) {
      localStorage.setItem("selectedChat", JSON.stringify(selectedChat));
    }
  }, [selectedChat]);

  // Handle search for users
  useEffect(() => {
    if (!searchQuery || !user) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/chat/search/${user.uid}/${encodeURIComponent(
            searchQuery
          )}`
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Search failed");
        }

        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, user]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat || !user) return;

    const tempId = Date.now();
    const message = {
      _id: tempId, // Temporary ID for optimistic update
      tempId, // Flag to identify optimistic messages
      from: user.uid,
      to: selectedChat.id,
      text: messageText,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Optimistic update
    setMessages((prev) => [...prev, message]);
    setMessageText("");

    try {
      // Send via socket.io with acknowledgement
      socketRef.current.emit("sendMessage", message, (response) => {
        if (!response?.success) {
          throw new Error(response?.error || "Failed to send message");
        }
        // Replace optimistic message with saved message
        setMessages((prev) =>
          prev.map((msg) => (msg.tempId === tempId ? response.message : msg))
        );
      });

      // Also save to database via API (fallback)
      const apiResponse = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: user.uid,
          to: selectedChat.id,
          text: messageText,
        }),
        credentials: "include",
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}));
        throw new Error(errorData.message || "API fallback failed");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the optimistic update if failed
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));

      // Show error to user
      alert(`Failed to send message: ${error.message}`);
    }
  };

  const startNewChat = (user) => {
    setSelectedChat({
      id: user.id,
      name: user.name,
      avatar: user.avatar || "/default-profile.png",
      profilePicture: user.avatar || "/default-profile.png",
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/chat/conversations/${user.uid}`
        );
        if (!response.ok) throw new Error("Failed to fetch conversations");
        const data = await response.json();
        setConversations(data);

        // Restore selected chat if available
        const savedChat = localStorage.getItem("selectedChat");
        if (savedChat) {
          const parsedChat = JSON.parse(savedChat);
          // Verify the chat still exists in conversations
          if (data.some((conv) => conv.id === parsedChat.id)) {
            setSelectedChat(parsedChat);
          }
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    };

    if (user) loadConversations();
  }, [user]);

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
              className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>

        {isSearching ? (
          <div className="p-4 text-center text-gray-400">Searching...</div>
        ) : searchResults.length > 0 ? (
          <div className="border-b border-gray-700">
            <div className="p-2 text-xs text-gray-400 px-4">Search Results</div>
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
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-profile.png";
                  }}
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
        ) : null}

        <div className="overflow-y-auto h-[calc(100vh-130px)]">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No conversations yet
            </div>
          ) : (
            conversations.map((chat) => (
              <div
                key={chat.id}
                className={`flex items-center p-4 cursor-pointer ${
                  selectedChat?.id === chat.id
                    ? "bg-gray-700"
                    : "hover:bg-gray-700/50"
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="relative">
                  <img
                    src={chat.avatar}
                    alt={`${chat.name} avatar`}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-profile.png";
                    }}
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
                  <div className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {chat.unread}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden md:flex flex-col flex-1 bg-gray-900">
        {selectedChat ? (
          <ChatInterface
            currentChat={selectedChat}
            messages={messages}
            messageInput={messageText}
            setMessageInput={setMessageText}
            sendMessage={handleSendMessage}
            currentUser={user}
            isConnected={isConnected}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400">
                {searchResults.length > 0
                  ? "Select a user to start chatting"
                  : "Select a conversation or search for users"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaEllipsisH,
  FaPaperPlane,
  FaSearch,
  FaSmile,
  FaUserCircle,
  FaUserGraduate,
  FaChalkboardTeacher,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import io from "socket.io-client";
import ChatInterface from "../components/ChatInterface";

export default function MentorStudentChat() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(user?.role === "mentor" ? "students" : "mentors");
  const [selectedChat, setSelectedChat] = useState(() => {
    const saved = localStorage.getItem("selectedMentorStudentChat");
    return saved ? JSON.parse(saved) : null;
  });
  const [messageText, setMessageText] = useState("");
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
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

    const handleNewMessage = (message) => {
      if (message.tempId) return;
      
      // Update messages if in current chat
      if (
        selectedChat &&
        (message.from === selectedChat.id || message.to === selectedChat.id)
      ) {
        setMessages(prev => {
          const exists = prev.some(m => 
            m._id === message._id || 
            (m.tempId && m.text === message.text && m.from === message.from)
          );
          return exists ? prev : [...prev, message];
        });
      }

      // Update conversations list
      setConversations(prev => {
        const otherUserId = message.from === user.uid ? message.to : message.from;
        const existingIndex = prev.findIndex(c => c.id === otherUserId);

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            lastMessage: message.text,
            time: message.timestamp,
            unread: message.from !== user.uid ? (updated[existingIndex].unread || 0) + 1 : 0,
          };
          return updated;
        }
        return prev;
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
  }, [user, selectedChat]);

  // Fetch conversations based on active tab
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        let endpoint = "";
        if (activeTab === "students") {
          endpoint = `${API_BASE_URL}/api/chat/mentor-students/${user.uid}`;
        } else {
          endpoint = `${API_BASE_URL}/api/chat/student-mentors/${user.uid}`;
        }

        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error("Failed to fetch conversations");
        }
        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error("Conversations error:", error);
        setConversations([]);
      }
    };

    fetchConversations();
  }, [user, activeTab]);

  // Fetch messages when selected chat changes
  useEffect(() => {
    if (!selectedChat || !user) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/chat/messages/${user.uid}/${selectedChat.id}`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [selectedChat, user]);

  // Save to localStorage when selectedChat changes
  useEffect(() => {
    if (selectedChat) {
      localStorage.setItem("selectedMentorStudentChat", JSON.stringify(selectedChat));
    }
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat || !user) return;

    const tempId = Date.now();
    const message = {
      _id: tempId,
      tempId,
      from: user.uid,
      to: selectedChat.id,
      text: messageText,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Optimistic update
    setMessages(prev => [...prev, message]);
    setMessageText("");

    try {
      // Send via socket.io
      socketRef.current.emit("sendMessage", message, (response) => {
        if (!response?.success) {
          throw new Error(response?.error || "Failed to send message");
        }
        setMessages(prev =>
          prev.map(msg => (msg.tempId === tempId ? response.message : msg))
        );
      });

      // Also save to database via API (fallback)
      const apiResponse = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: user.uid,
          to: selectedChat.id,
          text: messageText,
        }),
        credentials: "include",
      });

      if (!apiResponse.ok) {
        throw new Error("API fallback failed");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      alert(`Failed to send message: ${error.message}`);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex">
      {/* Chat List */}
      <div className="w-full md:w-80 lg:w-96 bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white mb-2">
            {user?.role === "mentor" ? "Student Chats" : "Mentor Chat"}
          </h1>
          
          {/* Tab selector for mentors */}
          {user?.role === "mentor" && (
            <div className="flex mb-4">
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-l-lg ${
                  activeTab === "students"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setActiveTab("students")}
              >
                <FaUserGraduate className="inline mr-2" />
                My Students
              </button>
            </div>
          )}
          
          {/* Tab selector for students */}
          {user?.role === "student" && (
            <div className="flex mb-4">
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-lg ${
                  activeTab === "mentors"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                onClick={() => setActiveTab("mentors")}
              >
                <FaChalkboardTeacher className="inline mr-2" />
                My Mentor
              </button>
            </div>
          )}
        </div>

        <div className="overflow-y-auto h-[calc(100vh-180px)]">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              {activeTab === "students" 
                ? "No students assigned yet" 
                : "No mentor assigned yet"}
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
                {activeTab === "students"
                  ? "Select a student to chat"
                  : "Select a mentor to chat"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
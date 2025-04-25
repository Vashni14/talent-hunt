"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaEllipsisH,
  FaPaperPlane,
  FaSearch,
  FaUsers,
  FaUserCircle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import io from "socket.io-client";
import ChatInterface from "../components/ChatInterface";

export default function TeamChat() {
  const { user } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState(() => {
    const saved = localStorage.getItem("selectedTeamChat");
    return saved ? JSON.parse(saved) : null;
  });
  const [messageText, setMessageText] = useState("");
  const [teams, setTeams] = useState([]);
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

    const handleNewTeamMessage = (message) => {
      if (message.tempId) return;
      
      // Update messages if in current team chat
      if (selectedTeam && message.to === selectedTeam.id) {
        setMessages(prev => {
          const exists = prev.some(m => 
            m._id === message._id || 
            (m.tempId && m.text === message.text && m.from === message.from)
          );
          return exists ? prev : [...prev, message];
        });
      }

      // Update teams list
      setTeams(prev => {
        const existingIndex = prev.findIndex(t => t.id === message.to);

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
    newSocket.on("newTeamMessage", handleNewTeamMessage);

    return () => {
      newSocket.off("connect", handleConnect);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("newTeamMessage", handleNewTeamMessage);
      newSocket.disconnect();
    };
  }, [user, selectedTeam]);

  // Fetch team conversations
  useEffect(() => {
    const fetchTeamConversations = async () => {
      try {
        console.log("Fetching teams for user:", user.uid);
        const response = await fetch(
          `${API_BASE_URL}/api/chat/team-conversations/${user.uid}`
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Received teams:", data);
        setTeams(data);
      } catch (error) {
        console.error("Fetch error:", error);
        setTeams([]);
      }
    };
  
    if (user) fetchTeamConversations();
  }, [user]);

  // Fetch team messages
  useEffect(() => {
    if (!selectedTeam || !user) return;

    const fetchTeamMessages = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/chat/team-messages/${selectedTeam.id}?userId=${user.uid}`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch team messages");
        }

        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching team messages:", error);
        setMessages([]);
      }
    };

    fetchTeamMessages();
  }, [selectedTeam, user]);

  // Save to localStorage when selectedTeam changes
  useEffect(() => {
    if (selectedTeam) {
      localStorage.setItem("selectedTeamChat", JSON.stringify(selectedTeam));
    }
  }, [selectedTeam]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedTeam || !user) return;

    const tempId = Date.now();
    const message = {
      _id: tempId,
      tempId,
      from: user.uid,
      to: selectedTeam.id,
      text: messageText,
      isTeamMessage: true,
      senderName: user.name,
      readBy: [user.uid],
      timestamp: new Date().toISOString()
    };

    // Optimistic update
    setMessages(prev => [...prev, message]);
    setMessageText("");

    try {
      // Send via socket.io
      socketRef.current.emit("sendTeamMessage", message, (response) => {
        if (!response?.success) {
          throw new Error(response?.error || "Failed to send message");
        }
        setMessages(prev =>
          prev.map(msg => (msg.tempId === tempId ? response.message : msg))
        );
      });

      // Also save to database via API (fallback)
      const apiResponse = await fetch(`${API_BASE_URL}/api/chat/send-team-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: user.uid,
          to: selectedTeam.id,
          text: messageText,
          senderName: user.name
        }),
        credentials: "include",
      });

      if (!apiResponse.ok) {
        throw new Error("API fallback failed");
      }
    } catch (error) {
      console.error("Error sending team message:", error);
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      alert(`Failed to send message: ${error.message}`);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex">
      {/* Team List */}
      <div className="w-full md:w-80 lg:w-96 bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white mb-4">Team Chats</h1>
          <div className="flex items-center text-gray-400 mb-2">
            <FaUsers className="mr-2" />
            <span>My Teams</span>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-130px)]">
          {teams.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              You're not part of any teams yet
            </div>
          ) : (
            teams.map((team) => (
              <div
                key={team.id}
                className={`flex items-center p-4 cursor-pointer ${
                  selectedTeam?.id === team.id
                    ? "bg-gray-700"
                    : "hover:bg-gray-700/50"
                }`}
                onClick={() => setSelectedTeam(team)}
              >
                <div className="relative">
                  <img
                    src={team.avatar}
                    alt={`${team.name} logo`}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-team.png";
                    }}
                  />
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-white truncate">
                      {team.name}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {new Date(team.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {team.lastMessage}
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    {team.members?.length || 0} members
                  </div>
                </div>
                {team.unread > 0 && (
                  <div className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {team.unread}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden md:flex flex-col flex-1 bg-gray-900">
        {selectedTeam ? (
          <ChatInterface
            currentChat={selectedTeam}
            messages={messages}
            messageInput={messageText}
            setMessageInput={setMessageText}
            sendMessage={handleSendMessage}
            currentUser={user}
            isConnected={isConnected}
            isTeamChat={true}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400">
                {teams.length > 0
                  ? "Select a team to start chatting"
                  : "Join or create a team to start chatting"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
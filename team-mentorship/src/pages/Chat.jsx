import React, { useState, useEffect, useRef } from "react";
import {
  FiMoreVertical,
  FiSearch,
  FiPaperclip,
  FiMic,
  FiSmile,
} from "react-icons/fi";
import { BsCheck2All, BsThreeDotsVertical } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import { RiChatNewLine } from "react-icons/ri";
import axios from "axios";
import { io } from "socket.io-client";
import { auth } from "../config/firebase"; // Import auth from your Firebase config

const ChatApp = () => {
  const [currentUser, setCurrentUser] = useState(null); // Store the current user
  const [activeTab, setActiveTab] = useState("individual");
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [individualChats, setIndividualChats] = useState([]);
  const [teamChats, setTeamChats] = useState([]);
  const [mentorChats, setMentorChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch the current user using auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          name: user.name || "Anonymous",
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Initialize socket connection and set up listeners
  useEffect(() => {
    if (!currentUser) return;

    socketRef.current = io("https://talent-hunt-2.onrender.com", {
      withCredentials: true,
    });

    socketRef.current.emit("register", currentUser.uid);

    socketRef.current.on("newMessage", (message) => {
      if (message.to === activeChat || message.from === activeChat) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socketRef.current.on("newTeamMessage", (message) => {
      if (message.to === activeChat) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUser, activeChat]);

  // Fetch conversations based on active tab
  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchConversations = async () => {
      setLoading(true);
      try {
        if (activeTab === "individual") {
          const res = await axios.get(
            `https://talent-hunt-2.onrender.com/api/chat/conversations/${currentUser.uid}`
          );
          setIndividualChats(res.data);
        } else if (activeTab === "team") {
          const res = await axios.get(
            `https://talent-hunt-2.onrender.com/api/chat/team-conversations/${currentUser.uid}`
          );
          setTeamChats(res.data);
        } else if (activeTab === "mentor") {
          if (currentUser.role === "mentor") {
            const res = await axios.get(
              `https://talent-hunt-2.onrender.com/api/chat/mentor-students/${currentUser.uid}`
            );
            setMentorChats(res.data);
          } else {
            const res = await axios.get(
              `https://talent-hunt-2.onrender.com/api/chat/student-mentors/${currentUser.uid}`
            );
            setMentorChats(res.data);
          }
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [activeTab, currentUser]);

  // Fetch team conversations
  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchTeamConversations = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://talent-hunt-2.onrender.com/api/chat/team-conversations/${currentUser.uid}`
        );
        setTeamChats(res.data);
      } catch (err) {
        console.error("Error fetching team conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamConversations();
  }, [currentUser]);

  // Handle search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await axios.get(
          `https://talent-hunt-2.onrender.com/api/chat/search/${currentUser.uid}/${searchTerm}`
        );
        setSearchResults(res.data.results);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm, currentUser]);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (!activeChat || !currentUser?.uid) return;

    const fetchMessages = async () => {
      try {
        let res;
        if (activeTab === "individual") {
          res = await axios.get(
            `https://talent-hunt-2.onrender.com/api/chat/messages/${currentUser.uid}/${activeChat}`
          );
        } else if (activeTab === "team") {
          res = await axios.get(
            `https://talent-hunt-2.onrender.com/api/chat/team-messages/${activeChat}?userId=${currentUser.uid}`
          );
        } else if (activeTab === "mentor") {
          res = await axios.get(
            `https://talent-hunt-2.onrender.com/api/chat/messages/${currentUser.uid}/${activeChat}`
          );
        }

        setMessages(res.data);
        scrollToBottom();
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [activeChat, activeTab, currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (message.trim() === "" || !activeChat || !currentUser) return;

    const tempId = `temp-${Date.now()}`;
    const newMessage = {
      tempId,
      text: message,
      time: new Date().toISOString(),
      from: currentUser.uid,
      to: activeChat,
      sender: "me",
      status: "sent",
    };

    // Optimistic update
    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    scrollToBottom();

    try {
      await axios.post("https://talent-hunt-2.onrender.com/api/chat/send", {
        from: currentUser.uid,
        to: activeChat,
        text: message,
      });
    } catch (err) {
      console.error("Error sending message:", err);
      // Remove the optimistic update if there's an error
      setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
    }
  };

  const getActiveChatList = () => {
    switch (activeTab) {
      case "individual":
        return individualChats;
      case "team":
        return teamChats;
      case "mentor":
        return mentorChats;
      default:
        return [];
    }
  };

  const getActiveChatInfo = () => {
    const chatList = getActiveChatList();
    return chatList.find((chat) => chat.id === activeChat) || null;
  };

  const startNewChat = (userId) => {
    setActiveChat(userId);
    setSearchTerm("");
    setSearchResults([]);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 flex flex-col border-r border-gray-700 bg-gray-800">
        {/* Header */}
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Chats</h1>
          <div className="flex space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white">
              <RiChatNewLine size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white">
              <BsThreeDotsVertical size={20} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 bg-gray-800">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search or start new chat"
              className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            className={`flex-1 py-3 font-medium ${
              activeTab === "individual"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("individual")}
          >
            Individual
          </button>
          <button
            className={`flex-1 py-3 font-medium ${
              activeTab === "team"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("team")}
          >
            Teams
          </button>
          <button
            className={`flex-1 py-3 font-medium ${
              activeTab === "mentor"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("mentor")}
          >
            Mentors
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isSearching ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : searchTerm && searchResults.length > 0 ? (
            // Show search results
            <div className="divide-y divide-gray-700">
              <div className="p-3 text-sm text-gray-400">Search Results</div>
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center p-3 cursor-pointer hover:bg-gray-700"
                  onClick={() => startNewChat(result.id)}
                >
                  <img
                    src={result.avatar}
                    alt={result.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h3 className="font-medium text-white">{result.name}</h3>
                    <p className="text-xs text-gray-400">
                      {result.isExisting ? "Existing chat" : "New chat"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            // Show regular chat list
            getActiveChatList()
              .filter((chat) =>
                chat.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((chat) => (
                <div
                  key={chat.id}
                  className={`flex items-center p-3 border-b border-gray-700 cursor-pointer hover:bg-gray-700 ${
                    activeChat === chat.id ? "bg-gray-700" : ""
                  }`}
                  onClick={() => setActiveChat(chat.id)}
                >
                  <div className="relative">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {!chat.isTeam && chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-white">{chat.name}</h3>
                      <span className="text-xs text-gray-400">
                        {formatTime(chat.time)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-400 truncate max-w-[180px]">
                        {chat.lastMessage}
                      </p>
                      {chat.unread > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
              <div className="flex items-center">
                <img
                  src={getActiveChatInfo()?.avatar || "/default-profile.png"}
                  alt={getActiveChatInfo()?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="ml-3">
                  <h3 className="font-medium text-white">
                    {getActiveChatInfo()?.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {activeTab === "individual" &&
                      (getActiveChatInfo()?.online ? "Online" : "Offline")}
                    {activeTab === "team" &&
                      `${getActiveChatInfo()?.memberCount || 0} members`}
                    {(activeTab === "mentor" || activeTab === "individual") &&
                      (getActiveChatInfo()?.department ||
                        getActiveChatInfo()?.expertise ||
                        "")}
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button className="text-gray-400 hover:text-white">
                  <FiSearch size={20} />
                </button>
                <button className="text-gray-400 hover:text-white">
                  <FiMoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 p-4 overflow-y-auto bg-gray-900"
              style={{
                backgroundImage:
                  'url("https://web.whatsapp.com/img/bg-chat-tile-dark_04fcacde539c58cca6745483d4858c52.png")',
              }}
            >
              <div className="space-y-2">
                {messages.map((msg) => (
                  <div
                    key={msg._id || msg.tempId}
                    className={`flex ${
                      msg.from === currentUser?.uid
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.from === currentUser?.uid
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-100"
                      }`}
                    >
                      {activeTab === "team" &&
                        msg.from !== currentUser?.uid && (
                          <p className="text-xs font-semibold text-gray-300">
                            {msg.senderName || "Unknown"}
                          </p>
                        )}
                      <p>{msg.text}</p>
                      <div
                        className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
                          msg.from === currentUser?.uid
                            ? "text-blue-300"
                            : "text-gray-400"
                        }`}
                      >
                        <span>{formatTime(msg.time || msg.timestamp)}</span>
                        {msg.from === currentUser?.uid && (
                          <BsCheck2All
                            className={
                              msg.readBy?.length > 1
                                ? "text-blue-400"
                                : "text-gray-400"
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-3 bg-gray-800 border-t border-gray-700">
              <div className="flex items-center">
                <button className="p-2 text-gray-400 hover:text-white">
                  <FiSmile size={24} />
                </button>
                <button className="p-2 text-gray-400 hover:text-white">
                  <FiPaperclip size={24} />
                </button>
                <input
                  type="text"
                  placeholder="Type a message"
                  className="flex-1 mx-2 py-2 px-4 bg-gray-700 rounded-full border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-400"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                {message ? (
                  <button
                    className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700"
                    onClick={handleSendMessage}
                  >
                    <IoMdSend size={20} />
                  </button>
                ) : (
                  <button className="p-2 text-gray-400 hover:text-white">
                    <FiMic size={24} />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-900">
            <div className="w-64 h-64 bg-gray-800 rounded-full opacity-20"></div>
            <h2 className="mt-6 text-xl font-medium text-gray-300">
              ScholarCompete Chat
            </h2>
            <p className="mt-2 text-gray-500 text-center max-w-md">
              {searchTerm
                ? "No matching chats found. Try a different search."
                : "Select a chat to start messaging. Your conversations will appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;

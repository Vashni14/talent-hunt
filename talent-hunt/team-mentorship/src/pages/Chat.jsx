"use client"

import { useState } from "react"
import { FaEllipsisH, FaPaperPlane, FaSearch, FaSmile, FaUserCircle } from "react-icons/fa"

export default function Chats() {
  const [selectedChat, setSelectedChat] = useState("1")
  const [messageText, setMessageText] = useState("")

  const chats = [
    {
      id: "1",
      name: "Web Wizards",
      avatar: "/placeholder.svg",
      lastMessage: "Let's discuss the new design changes",
      time: "10:30 AM",
      unread: 3,
      isOnline: true,
      isTeam: true,
    },
    {
      id: "2",
      name: "Sarah Chen",
      avatar: "/placeholder.svg",
      lastMessage: "I've pushed the latest code changes",
      time: "Yesterday",
      unread: 0,
      isOnline: true,
    },
    {
      id: "3",
      name: "Michael Johnson",
      avatar: "/placeholder.svg",
      lastMessage: "Can you review my PR?",
      time: "Yesterday",
      unread: 1,
      isOnline: false,
    },
    {
      id: "4",
      name: "Data Dynamos",
      avatar: "/placeholder.svg",
      lastMessage: "Meeting at 3 PM tomorrow",
      time: "Monday",
      unread: 0,
      isOnline: true,
      isTeam: true,
    },
    {
      id: "5",
      name: "Emily Rodriguez",
      avatar: "/placeholder.svg",
      lastMessage: "Here's the UI mockup",
      time: "Monday",
      unread: 0,
      isOnline: false,
    },
  ]

  const messages = {
    "1": [
      {
        id: "1",
        senderId: "2",
        text: "Hey team, I've updated the wireframes for the homepage. Can everyone take a look?",
        time: "10:15 AM",
        isMe: false,
      },
      {
        id: "2",
        senderId: "3",
        text: "Looks good! I especially like the new navigation layout.",
        time: "10:20 AM",
        isMe: false,
      },
      {
        id: "3",
        senderId: "current-user",
        text: "I agree. The user flow is much clearer now.",
        time: "10:25 AM",
        isMe: true,
      },
      {
        id: "4",
        senderId: "2",
        text: "Great! Let's discuss the new design changes in more detail during our meeting tomorrow.",
        time: "10:30 AM",
        isMe: false,
      },
    ],
    "2": [
      {
        id: "1",
        senderId: "2",
        text: "Hi there! I just finished working on the frontend components.",
        time: "Yesterday",
        isMe: false,
      },
      {
        id: "2",
        senderId: "current-user",
        text: "That's great! Can you share the repository link?",
        time: "Yesterday",
        isMe: true,
      },
      {
        id: "3",
        senderId: "2",
        text: "Sure, here it is: github.com/project/frontend",
        time: "Yesterday",
        isMe: false,
      },
      {
        id: "4",
        senderId: "2",
        text: "I've pushed the latest code changes",
        time: "Yesterday",
        isMe: false,
      },
    ],
  }

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedChat) return

    // In a real app, you would send this to your backend
    console.log(`Sending message to chat ${selectedChat}: ${messageText}`)

    // Clear the input
    setMessageText("")
  }

  const currentChat = chats.find((chat) => chat.id === selectedChat)
  const currentMessages = selectedChat ? messages[selectedChat] || [] : []

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
            />
            <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-130px)]">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center p-4 cursor-pointer ${
                selectedChat === chat.id ? "bg-gray-700" : "hover:bg-gray-700/50"
              }`}
              onClick={() => setSelectedChat(chat.id)}
              aria-selected={selectedChat === chat.id}
            >
              <div className="relative">
                <img
                  src={chat.avatar}
                  alt={`${chat.name} avatar`}
                  className={`w-12 h-12 ${chat.isTeam ? "rounded-lg" : "rounded-full"} object-cover`}
                  width={48}
                  height={48}
                />
                {chat.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                )}
              </div>
              <div className="ml-3 flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-white truncate">{chat.name}</h3>
                  <span className="text-xs text-gray-400">{chat.time}</span>
                </div>
                <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
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
        {selectedChat && currentChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={currentChat.avatar}
                  alt={`${currentChat.name} avatar`}
                  className={`w-10 h-10 ${currentChat.isTeam ? "rounded-lg" : "rounded-full"} object-cover mr-3`}
                  width={40}
                  height={40}
                />
                <div>
                  <h2 className="font-medium text-white">{currentChat.name}</h2>
                  <p className="text-xs text-gray-400">{currentChat.isOnline ? "Online" : "Offline"}</p>
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
              {currentMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.isMe ? "justify-end" : "justify-start"}`}
                  aria-owns={message.id}
                >
                  <div className={`max-w-[70%] ${message.isMe ? "order-2" : "order-1"}`}>
                    {!message.isMe && (
                      <div className="flex items-center mb-1">
                        <FaUserCircle className="text-gray-500 mr-1" />
                        <span className="text-xs text-gray-400">
                          {chats.find((chat) => chat.id === message.senderId)?.name || "Unknown"}
                        </span>
                      </div>
                    )}
                    <div
                      className={`rounded-lg p-3 ${
                        message.isMe ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-200"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{message.time}</p>
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
                      handleSendMessage()
                    }
                  }}
                  aria-label="Message input"
                />
                <button
                  className={`p-2 rounded-full ${
                    messageText.trim() ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-400"
                  }`}
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
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
              <p className="text-gray-400">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: No chat selected message */}
      <div className="flex-1 flex items-center justify-center md:hidden">
        <div className="text-center p-4">
          <p className="text-gray-400">Select a conversation to start chatting</p>
        </div>
      </div>
    </div>
  )
}
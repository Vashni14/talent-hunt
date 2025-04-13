"use client"

import { useRef, useEffect } from "react";
import { FaPaperPlane, FaFacebookMessenger } from "react-icons/fa";

export default function ChatInterface({ 
  currentChat, 
  messages, 
  messageInput, 
  setMessageInput, 
  sendMessage,
  currentUser,
  isConnected
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Filter messages for this specific conversation
  const conversationMessages = messages.filter(msg => 
    (msg.from === currentUser.uid && msg.to === currentChat._id) || 
    (msg.from === currentChat._id && msg.to === currentUser.uid)
  );

  if (!currentChat) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
        <div className="text-gray-400 mb-4">
          <FaFacebookMessenger className="text-4xl mx-auto" />
        </div>
        <h3 className="text-lg font-medium mb-2">No chat selected</h3>
        <p className="text-gray-400">Select a teammate to start chatting</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 h-[calc(100vh-200px)] flex flex-col">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src={currentChat.profilePicture || "/default-profile.png"}
              alt={currentChat.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-profile.png";
              }}
            />
          </div>
          <div>
            <h3 className="font-medium">{currentChat.name}</h3>
            <p className="text-xs text-gray-400">{currentChat.department}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {conversationMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          conversationMessages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 flex ${msg.from === currentUser.uid ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-xs lg:max-w-md">
                <div
                  className={`px-4 py-2 rounded-lg ${
                    msg.from === currentUser.uid
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-700 text-gray-100 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <div className={`text-xs mt-1 ${
                  msg.from === currentUser.uid ? "text-right" : "text-left"
                } text-gray-400`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {msg.from === currentUser.uid && !isConnected && !msg.timestamp && (
                    <span className="ml-2 text-red-400">(Sending...)</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            className={`flex-1 bg-gray-700 border rounded-lg py-2 px-4 focus:outline-none focus:ring-2 text-white ${
              isConnected ? "border-gray-600 focus:ring-blue-500" : "border-red-500 focus:ring-red-500"
            }`}
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            className={`p-2 rounded-lg transition-colors ${
              isConnected && messageInput.trim()
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!isConnected || !messageInput.trim()}
          >
            <FaPaperPlane />
          </button>
        </div>
        {!isConnected && (
          <p className="text-xs text-red-400 mt-2">
            Connection lost. Messages will be sent when reconnected.
          </p>
        )}
      </div>
    </div>
  );
}
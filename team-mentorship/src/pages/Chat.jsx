import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const Chat = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => socket.disconnect();
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", { userId: user.uid, text: message });
      setMessage("");
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold text-teal-400 mb-4">Chat</h2>
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="h-48 overflow-y-auto mb-4">
          {messages.map((msg, index) => (
            <div key={index} className="text-gray-300">
              <strong>{msg.userId}:</strong> {msg.text}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
        />
        <button
          onClick={sendMessage}
          className="mt-2 bg-teal-500 px-4 py-2 rounded font-bold hover:bg-teal-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
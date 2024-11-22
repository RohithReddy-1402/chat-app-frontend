import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("https://chat-bot-backend-0f3q.onrender.com"); // Connect to the backend

function App() {
  const [username, setUsername] = useState("");
  const [registered, setRegistered] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("private_message", ({ sender, message }) => {
      setMessages((prev) => [...prev, { sender, message }]);
    });

    return () => {
      socket.off("online_users");
      socket.off("private_message");
    };
  }, []);

  const register = () => {
    if (username) {
      socket.emit("register", username);
      setRegistered(true);
    }
  };

  const sendMessage = () => {
    if (recipient && message) {
      socket.emit("private_message", { sender: username, recipient, message });
      setMessages((prev) => [...prev, { sender: "You", message }]);
      setMessage(""); 
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      {!registered ? (
        <div>
          <h1>Register</h1>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
          />
          <button onClick={register} style={{ padding: "10px", width: "100%" }}>
            Register
          </button>
        </div>
      ) : (
        <div>
          <h1>Welcome, {username}</h1>
          <div>
            <h2>Online Users</h2>
            <select
              onChange={(e) => setRecipient(e.target.value)}
              value={recipient}
              style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
            >
              <option value="">Select a recipient</option>
              {onlineUsers.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>
          <div>
            <h2>Chat</h2>
            <div
              style={{
                border: "1px solid #ccc",
                height: "200px",
                overflowY: "scroll",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              {messages.map((msg, index) => (
                <p key={index}>
                  <strong>{msg.sender}:</strong> {msg.message}
                </p>
              ))}
            </div>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
              style={{ padding: "10px", width: "80%", marginRight: "10px" }}
            />
            <button
              onClick={sendMessage}
              style={{ padding: "10px", backgroundColor: "#007bff", color: "white" }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

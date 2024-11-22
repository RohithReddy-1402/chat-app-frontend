import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css"; // Importing the CSS file
import Button from '@mui/material/Button';
const socket = io("https://chat-bot-backend-0f3q.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [registered, setRegistered] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const registerUser = () => {
    if (username.trim()) {
      socket.emit("register", username);
      setRegistered(true);
    }
  };

  useEffect(() => {
    socket.on("private_message", ({ sender, message }) => {
      setMessages((prev) => [...prev, { sender, message }]);
    });

    socket.on("online_users", (users) => {
      setOnlineUsers(users.filter((user) => user !== username));
    });

    return () => {
      socket.off("private_message");
      socket.off("online_users");
    };
  }, [username]);

  useEffect(() => {
    if (recipient) {
      socket.emit("get_chat_history", { user1: username, user2: recipient });

      socket.on("chat_history", (history) => {
        setMessages(
          history.map((msg) => ({
            sender: msg.sender,
            message: msg.content,
            timestamp: msg.timestamp,
          }))
        );
      });

      return () => socket.off("chat_history");
    }
  }, [recipient, username]);

  const sendMessage = () => {
    if (message.trim() && recipient) {
      socket.emit("private_message", {
        sender: username,
        recipient,
        message,
      });

      setMessages((prev) => [...prev, { sender: "You", message }]);
      setMessage("");
    }
  };

  return (
    <div className="app">
      {!registered ? (
        <div className="register">
          <h2>Register</h2>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
          />
          <button onClick={registerUser} className="btn">
            Register
          </button>
        </div>
      ) : (
        <div className="chat-container">
          <h2>Welcome, {username}</h2>
          <div className="main">
            <div className="online-users">
              <h3>Online Users</h3>
              <ul>
                {onlineUsers.map((user) => (
                  <li
                    key={user}
                    className={`user ${user === recipient ? "selected" : ""}`}
                    onClick={() => setRecipient(user)}
                  >
                    <Button variant="outlined">{user}</Button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="chat">
              {recipient && (
                <>
                  <h3>Chat with {recipient}</h3>
                  <div className="messages">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`message ${
                          msg.sender === "You" ? "sent" : "received"
                        }`}
                      >
                        <p>
                          <strong>{msg.sender}:</strong> {msg.message}
                        </p>
                        {msg.timestamp && (
                          <small>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </small>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="input-container">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="input"
                    />
                    <button onClick={sendMessage} className="btn send-btn">
                      Send
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

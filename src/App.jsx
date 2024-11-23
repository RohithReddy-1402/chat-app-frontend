import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";
import Button from '@mui/material/Button';
const socket = io("http://localhost:3000");

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
        <div className="chat-container ">
          <h2 className="">Welcome, {username}</h2>
          <div className="main">
            <div className="online-users absolute left-0 " style={{width:"300px"}}>
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

            <div className="chat right-0">
              {recipient && (
                <>
                  <h3 style={{border:"2px solid red",width:"900px",height:"40px"}}  >Chat with {recipient}</h3>
                  <div className="messages absolute my-3" style={{right:"400px",border:"3px solid red",width:"900px",left:"464px"}}>
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
                  <div className="input-container absolute bottom-0" style={{width:"800px"}}>
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

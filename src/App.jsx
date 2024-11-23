import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import "./App.css";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useAuth0 } from "@auth0/auth0-react";
const socket = io("https://chat-bot-backend-0f3q.onrender.com");
import { createTheme } from '@mui/material/styles';
import { gray } from "color-convert";

const theme = createTheme({
  palette: {
    ochre: {
      main: '#E3D026',
      light: '#E9DB5D',
      dark: '#A29415',
      contrastText: '#242105',
      gray:'#808080'
    },
  },
});

function App() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const [username, setUsername] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [recentChats, setRecentChats] = useState([]);


  useEffect(() => {
    if (user && user.name) {
      setUsername(user.name);
    }
  }, [user]);
  useEffect(()=>{
    if (username) {
      socket.emit("register", username); 
    }
  },[username])
  useEffect(() => {
    socket.on("private_message", ({ sender, message }) => {
      setMessages((prev) => [...prev, { sender, message }]);
    });

    socket.on("online_users", (users) => {
      setOnlineUsers(users.filter((u) => u !== username));
    });

    return () => {
      socket.off("private_message");
      socket.off("online_users");
    };
  }, [username]);
  useEffect(() => {
    if (username) {
      socket.emit("get_recent_chats", username);
      socket.on("recent_chats", (chats) => {
        setRecentChats(chats);
      });
    }
  
    return () => socket.off("recent_chats");
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
  console.log(onlineUsers)
  const sendMessage = () => {
    if (!message.trim() || !recipient) return;
    socket.emit("private_message", { sender: username, recipient, message });
    setMessages((prev) => [...prev, { sender: "You", message }]);
    setMessage("");
  };

  return (
    <div className="app">
      {!isAuthenticated ? (
        <Button variant="outlined" onClick={loginWithRedirect}>
          Login with Redirect
        </Button>
      ) : (
        <div className="chat-container">
          <h2>Welcome, {username}</h2>
          <Button variant="contained" onClick={() => logout()}>
            Logout
          </Button>
          <div className="chat-layout">
            <div className="online-users">
              <h3>Online Users</h3>
              <ul>
                {onlineUsers.map((user) => (
                  <li key={user}>
                    <Button
                      variant={user === recipient ? "contained" : "outlined"}
                      onClick={() => setRecipient(user)}
                      fullWidth
                      style={{ marginBottom: "0.5rem" }}
                    >
                      {user}
                    </Button>
                  </li>
                ))}
              </ul>
              <h3>Recent Chats</h3>
  <ul>
    {recentChats.map((chat, index) => (
      <li key={index}>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => setRecipient(chat._id.chatPartner)}
        >
          <small>
          {chat._id.chatPartner}</small>
          <br />
          
          <small>
            
            {chat.isOnline ? (
              <FiberManualRecordIcon color="success" fontSize="small"/>
            ) : (
              <FiberManualRecordIcon color="success" sx={{color:"#808080"}} fontSize="small"/>
            )}
          </small>
        </Button>
      </li>
    ))}
  </ul>


            </div>
            
            <div className="chat-section">
              {recipient ? (
                <>
                  <h3>{recipient}</h3>
                  <div className="messages-container">
                    {messages.length > 0 ? (
                      messages.map((msg, index) => (
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
                      ))
                    ) : (
                      <p>No messages yet. Start the conversation!</p>
                    )}
                  </div>
                  <div className="input-container">
                    <TextField
                      variant="outlined"
                      placeholder="Type your message..."
                      fullWidth
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      style={{ marginRight: "1rem" }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={sendMessage}
                    >
                      Send
                    </Button>
                  </div>
                </>
              ) : (
                <p>Select a user to start chatting.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

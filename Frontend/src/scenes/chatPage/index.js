import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "scenes/navbar";
import { useTheme, useMediaQuery } from "@mui/material";
import WidgetWrapper from "components/WidgetWrapper";
import { setFriends } from "state";
import Avatar from "@mui/material/Avatar";
import { io } from "socket.io-client";
import "./ChatPage.css";

const ChatPage = () => {
  const { _id: userId } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const friends = useSelector((state) => state.user.friends);
  const { palette } = useTheme();
  const isDarkTheme = palette.mode === "dark";
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFriend, setSelectedFriend] = useState(null);
  const socket = io("process.env.REACT_APP_SOCIAL_CIRCLE_BACKEND");

  const baseUrl = process.env.REACT_APP_SOCIAL_CIRCLE_BACKEND;

  const getFriends = async () => {
    try {
      const response = await fetch(`${baseUrl}/users/${userId}/friends`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      dispatch(setFriends({ friends: data }));
    } catch (error) {
      console.error("Failed to fetch friends:", error);
    }
  };

  const getMessages = async (friendId) => {
    try {
      const response = await fetch(
        `${baseUrl}/messages/${userId}/${friendId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  useEffect(() => {
    getFriends();

    if (selectedFriend) {
      socket.emit("joinRoom", { userId, friendId: selectedFriend._id });
      getMessages(selectedFriend._id);
    }

    // socket.on("connect", () => {
    //   console.log(`Connected to socket server with ID: ${socket.id}`);
    // });

    socket.on("receiveMsg", (message) => {
      console.log(`Message received: ${JSON.stringify(message)}`);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    socket.on("error", (error) => {
      console.error(`Socket error: ${error}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedFriend]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const messageData = {
        userId,
        friendId: selectedFriend._id,
        message: newMessage,
        // timestamp: new Date().getDate(),
      };
      console.log(userId, selectedFriend._id);
      socket.emit("sendMsg", messageData);
      // setMessages((prevMessages) => [...prevMessages, newMessage]);
      setNewMessage("");
    }
  };

  return (
    <div>
      <Navbar />
      <div
        className="chat-container"
        style={{ display: isNonMobileScreens ? "flex" : "block" }}
      >
        <WidgetWrapper className="friend-list-container">
          <div
            className={`friend-heading ${
              isDarkTheme ? "dark-mode" : "light-mode"
            }`}
          >
            Friends List
          </div>
          <div className="friend-list">
            {friends.map((friend) => (
              <div
                key={friend._id}
                className={`friend-item ${
                  selectedFriend && selectedFriend._id === friend._id
                    ? "selected"
                    : ""
                }`}
                onClick={() => setSelectedFriend(friend)}
              >
                <Avatar
                  className="friend-avatar"
                  src={friend.picturePath}
                  alt={friend.firstName}
                >
                  {friend.firstName}
                </Avatar>
                <div className="friend-info">
                  <div className="friend-name">{`${friend.firstName} ${friend.lastName}`}</div>
                  <div className="friend-subtitle">{friend.occupation}</div>
                </div>
              </div>
            ))}
          </div>
        </WidgetWrapper>
        {selectedFriend && (
          <WidgetWrapper className="chat-box-container">
            <div
              className={`chat-box ${isDarkTheme ? "dark-mode" : "light-mode"}`}
            >
              <div className="chat-header">
                Chat with{" "}
                {`${selectedFriend.firstName} ${selectedFriend.lastName}`}
              </div>
              <div className="messages">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message ${
                      message.userId === userId ? "sent" : "received"
                    }`}
                  >
                    <div className="message-content">{message.message}</div>
                    <div className="message-timestamp">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="message-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>
          </WidgetWrapper>
        )}
      </div>
    </div>
  );
};

export default ChatPage;

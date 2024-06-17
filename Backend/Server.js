import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { register } from "./controllers/auth.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import messageRoutes from "./routes/messages.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import { createServer } from "http";
import { Server } from "socket.io";

/*MOCK DATA */
import User from "./models/User.js";
import Message from "./models/Message.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
// app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* SOCKET.IO SETUP */
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production" ? false : ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`New client with the id ${socket.id} connected`);

  socket.on("joinRoom", async ({ userId, friendId }) => {
    try {
      const user = await User.findById(userId);
      if (user && user.friends.includes(friendId)) {
        const room = [userId, friendId].sort().join("-");
        socket.join(room);
      } else {
        socket.emit("error", "You are not friends with this user.");
      }
    } catch (error) {
      console.error(`Error finding user: ${error.message}`);
      socket.emit("error", "An error occurred while joining the room.");
    }
  });

  socket.on("sendMsg", async ({ userId, friendId, message }) => {
    const room = [userId, friendId].sort().join("-");
    const newMessage = new Message({ userId, friendId, message });
    console.log(`user: ${userId}, friend: ${friendId}`);
    // console.log(newMessage);

    try {
      await newMessage.save();
      io.to(room).emit("receiveMsg", {
        userId,
        message,
        timestamp: newMessage.timestamp,
      });
      // console.log(`Message saved and emitted to room ${room}`);
    } catch (error) {
      console.error(`Error saving message: ${error.message}`);
      socket.emit("error", "An error occurred while sending the message.");
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client with the id ${socket.id} disconnected`);
  });
});

/* FILE STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("image"), register);
// app.post("/auth/register", register);
app.post("/posts", verifyToken, upload.single("image"), createPost);
// app.post("/posts", verifyToken, createPost);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);
app.use("/messages", messageRoutes);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    server.listen(PORT, () => console.log(`Server running on Port: ${PORT}`));
  } catch (error) {
    console.log(`${error} did not connect`);
  }
};

startServer();

// .then(() => {
/* ADD DATA ONE TIME */
// User.insertMany(users);
// Post.insertMany(posts);
// })

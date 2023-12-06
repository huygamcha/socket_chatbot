const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 4000;
const axios = require("axios");
const bcrypt = require("bcryptjs");

const { getAnswer } = require("./getAnswer");

const mongoose = require("mongoose");

const MONGODB_URI = "mongodb://localhost:27017/socket"; // Thay thế bằng địa chỉ MongoDB của bạn
mongoose.connect(MONGODB_URI);
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const User = require("./models/users");

const server = app.listen(PORT, () =>
  console.log(`««««« server on ${PORT} »»»»»`)
);
const io = require("socket.io")(server);
app.use(express.static(path.join(__dirname, "public")));

let socketsConnected = new Set();

io.on("connection", onConnected);

function onConnected(socket) {
  console.log(socket.id);
  socketsConnected.add(socket.id);

  let handshake = socket.handshake;

  console.log("handshake: ", handshake.time);

  io.emit("clients-total", socketsConnected.size);

  socket.on("disconnect", () => {
    console.log("disconnect", socket.id);
    socketsConnected.delete(socket.id);
    io.emit("clients-total", socketsConnected.size);
  });

  socket.on("message", async (data) => {
    socket.emit("wait", false);
    // Thực hiện yêu cầu HTTP bằng axios
    try {
      const response = await axios.post(
        "https://af8c-35-247-58-8.ngrok-free.app/query_description",
        {
          query: data.message,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const receivedQueryId = response.data.query_id;

        // Call the additional API with the received queryId
        const responseData = await getAnswer(receivedQueryId);
        // Gửi kết quả từ API về cho client thông qua WebSocket
        socket.emit("http-response", responseData);
        socket.emit("wait", true);
      }
    } catch (error) {
      console.error("Error making HTTP request:", error.message);
    }
  });
  // Xử lý đăng ký
  socket.on("register", async (data) => {
    const { username, password } = data;
    console.log("««««« username »»»»»", username);
    // Kiểm tra xem người dùng đã tồn tại chưa
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      socket.emit("register-status", {
        success: false,
        message: "Username already taken",
      });
    } else {
      // Tạo một người dùng mới và lưu vào cơ sở dữ liệu
      const newUser = new User({ username, password });
      await newUser.save();

      socket.emit("register-status", {
        success: true,
        message: "Registration successful",
      });
    }
  });

  // Xử lý đăng nhập
  socket.on("login", async (data) => {
    const { username, password } = data;

    // Tìm người dùng dựa trên tên đăng nhập
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      // So sánh mật khẩu đã nhập với mật khẩu trong cơ sở dữ liệu
      const isPasswordMatch = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (isPasswordMatch) {
        socket.emit("login-status", {
          success: true,
          user: username,
          message: "Login successful",
        });
      } else {
        socket.emit("login-status", {
          success: false,
          message: "Invalid password or username",
        });
      }
    } else {
      socket.emit("login-status", {
        success: false,
        message: "Invalid username or username",
      });
    }
  });

  socket.on("logout", () => {
    socket.emit("logout");
  });
}

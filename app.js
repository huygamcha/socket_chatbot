const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 4000;
const axios = require("axios");
const { getAnswer } = require("./getAnswer");

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
    console.log("Message from client:", data);

    // Thực hiện yêu cầu HTTP bằng axios
    try {
      const response = await axios.post(
        "https://c251-34-142-160-96.ngrok-free.app/query_description",
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
        console.log("Query ID answer:", receivedQueryId);

        // Call the additional API with the received queryId
        const responseData = await getAnswer(receivedQueryId);
        // Gửi kết quả từ API về cho client thông qua WebSocket
        socket.emit("http-response", responseData);
      }
    } catch (error) {
      console.error("Error making HTTP request:", error.message);
    }
  });
  // Xử lý đăng ký
  let users = [];
  socket.on("register", (data) => {
    const { username, password, values } = data;
    if (values && values.find((value) => value.username === username)) {
      socket.emit("abc", {
        success: false,
        message: "Username already taken",
      });
    }
    // Kiểm tra nếu tên người dùng đã tồn tại
    else {
      // Lưu thông tin người dùng

      users[username] = { username, password };

      socket.emit("store-user-in-local-storage", { user: users[username] });

      socket.emit("abc", {
        success: true,
        message: "Registration successful",
      });
      console.log("Registration successful");
    }
  });

  // Xử lý đăng nhập
  socket.on("login", (data) => {
    const { username, password, values } = data;
    console.log(values);

    // Kiểm tra tên người dùng và mật khẩu
    if (
      values &&
      values.find(
        (value) => value.username === username && value.password === password
      )
    ) {
      socket.emit("login-status", {
        success: true,
        user: username,
        message: "Login successful",
      });
    } else {
      socket.emit("login-status", {
        success: false,
        message: "Invalid username or password",
      });
    }
  });

  socket.on("logout", () => {
    socket.emit("logout");
  });
}

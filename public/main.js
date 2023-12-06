const socket = io("http://localhost:4000");

const messageContainer = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const clientsTotal = document.getElementById("client-total");
// const messageTone = new Audio("/message-tone.mp3");
// client.js
// client.js

function register() {
  const username = document.getElementById("usernameSignup").value;
  const password = document.getElementById("passwordSignup").value;
  const values = JSON.parse(localStorage.getItem("clients"));

  // Sử dụng Axios để gửi yêu cầu đăng ký
  axios
    .post("http://localhost:3000/api/register", {
      username,
      password,
      values,
    })
    .then((response) => {
      console.log(response.data);
      // Xử lý kết quả từ server ở đây
    })
    .catch((error) => {
      console.error("Error during registration:", error);
    });
}

socket.on("clients-total", (data) => {
  clientsTotal.innerText = `The number of accesses: ${data}`;
});

// // nhận câu trả lời từ server
socket.on("message", (data) => {
  messageTone.play();
  addMessageToUI(false, data);
});

// // gửi tin nhắn tới server
function send() {
  if (messageInput.value === "") return;
  const data = {
    name: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
  };
  socket.emit("message", data);
  addMessageToUI(true, data);
  messageInput.value = "";
}

socket.on("http-response", (data) => {
  const message = {
    name: "server",
    message: data,
    dateTime: new Date(),
  };
  addMessageToUI(false, message);
});

function addMessageToUI(isOwnMessage, data) {
  const element = `
        <li class="${isOwnMessage ? "message-right" : "message-left"}">
            <p class="message">
              ${data.message}
              <span> ${moment(data.dateTime)}</span>
            </p>
          </li>
          `;

  messageContainer.innerHTML += element;
  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}
// // main.js
// // const socket = io();
const statusElement = document.getElementById("status");

function register() {
  const username = document.getElementById("usernameSignup").value;
  const password = document.getElementById("passwordSignup").value;
  console.log(username);
  socket.emit("register", { username, password });
}
// Xử lý kết quả đăng ký
socket.on("register-status", (data) => {
  // statusElement.textContent = data.message;
  if (!data.success) {
  }
  alert(`${data.message}`);
});

socket.on("wait", (data) => {
  if (data === true) {
    console.log("123");
  } else {
    console.log("ok");
  }
});

function login() {
  const username = document.getElementById("usernameSignin").value;
  const password = document.getElementById("passwordSignin").value;
  socket.emit("login", { username, password });
}
// Xử lý kết quả đăng nhập
socket.on("login-status", (data) => {
  // statusElement.textContent = data.message;

  if (data.success) {
    sessionStorage.setItem("user", JSON.stringify(data.user));

    // Đăng nhập thành công, có thể thực hiện các thao tác tiếp theo
    window.location.href = "/chat.html";
  } else {
    alert(`${data.message}`);
  }
});

function logout() {
  socket.emit("logout");
}

socket.on("logout", () => {
  window.location.href = "/index.html";
});

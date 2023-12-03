const socket = io("http://localhost:4000");

const messageContainer = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const clientsTotal = document.getElementById("client-total");
// const messageTone = new Audio("/message-tone.mp3");

socket.on("clients-total", (data) => {
  clientsTotal.innerText = `Total Clients: ${data}`;
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
  const values = JSON.parse(localStorage.getItem("clients"));
  const username = document.getElementById("usernameSignup").value;
  const password = document.getElementById("passwordSignup").value;
  console.log(username);
  socket.emit("register", { username, password, values });
}

function login() {
  const values = JSON.parse(localStorage.getItem("clients"));
  const username = document.getElementById("usernameSignin").value;
  const password = document.getElementById("passwordSignin").value;
  socket.emit("login", { username, password, values });
}

function logout() {
  socket.emit("logout");
}

socket.on("logout", () => {
  window.location.href = "/index.html";
});
// Xử lý kết quả đăng ký
socket.on("abc", (data) => {
  statusElement.textContent = data.message;
  console.log("««««« ao vai lz »»»»»");
  if (data.success) {
    // Đăng ký thành công, có thể thực hiện các thao tác tiếp theo
  }
});

// Xử lý kết quả đăng nhập
socket.on("login-status", (data) => {
  statusElement.textContent = data.message;

  if (data.success) {
    sessionStorage.setItem("user", JSON.stringify(data.user));

    // Đăng nhập thành công, có thể thực hiện các thao tác tiếp theo
    window.location.href = "/chat.html";
  }
});

socket.on("store-user-in-local-storage", (data) => {
  // Store user information in localStorage
  let usersArray = JSON.parse(localStorage.getItem("clients")) || [];

  console.log(usersArray);

  // Check if the user is not already in the array (to avoid duplicates)
  if (!usersArray.some((u) => u.username === data.user.username)) {
    // Push the new user object into the array
    usersArray.push({
      username: data.user.username,
      password: data.user.password,
    });

    // Update localStorage with the modified array
    localStorage.setItem("clients", JSON.stringify(usersArray));
  }

  // localStorage.setItem("client", JSON.stringify(data.user));
});

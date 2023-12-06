const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/users"); // Thay đường dẫn tùy thuộc vào cấu trúc dự án của bạn

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Tìm người dùng dựa trên tên đăng nhập
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      // So sánh mật khẩu đã nhập với mật khẩu trong cơ sở dữ liệu
      const isPasswordMatch = await bcrypt.compare(
        password,
        existingUser.hashPass
      );

      if (isPasswordMatch) {
        // Đăng nhập thành công
        res.json({
          success: true,
          user: username,
          message: "Login successful",
        });
      } else {
        // Sai mật khẩu
        res.json({
          success: false,
          message: "Invalid password",
        });
      }
    } else {
      // Người dùng không tồn tại
      res.json({
        success: false,
        message: "Invalid username",
      });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;

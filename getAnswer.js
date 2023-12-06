// getAnswer.js
const axios = require("axios");

async function getAnswer(query) {
  try {
    const response = await axios.get(
      `https://af8c-35-247-58-8.ngrok-free.app/query_result/${query}`,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      const jsonResponse = response.data.result;

      return jsonResponse; // hoặc giá trị cần trả về khác
    }
  } catch (error) {
    console.error("Error making HTTP request:", error.message);
    throw error; // Ném lỗi để xử lý nó ở nơi khác nếu cần
  }
}

module.exports = { getAnswer };

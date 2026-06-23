const axios = require("axios");

async function checkStatus() {
  try {
    const res = await axios.get("https://cenemaverse-1.onrender.com/api/users/login"); // Incorrect method but let's see if we get a 405 or 500
    console.log("Status:", res.status);
  } catch (err) {
    console.log("Status:", err.response?.status);
    console.log("Message:", err.response?.data?.message);
  }
}
checkStatus();

const express = require("express");
const app = express();

app.get("/hello", (req, res) => {
  res.status(200).json({
    message: "Hello World 🌍"
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

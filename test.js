const express = require("express");
const fs = require("fs");

const app = express();

app.listen(3000, () => {
  console.log("Сервер ожидает подключения на http://localhost:3000");
});

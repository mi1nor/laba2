const express = require("express");
const fs = require("fs");

const app = express();

app.post("/api/users", async (req, res) => {
  const { name, age } = req.body;

  if (!isValidName(name)) {
    return res
      .status(400)
      .json({ success: false, message: "Некорректное имя." });
  }

  if (!isValidAge(age)) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Возраст должен быть положительным числом.",
      });
  }

  try {
    const data = await fsPromises.readFile("users.json", "utf8");
    const users = JSON.parse(data);

    // Проверяем уникальность имени пользователя
    const isNameExists = users.some((user) => user.name === name);
    if (isNameExists) {
      return res
        .status(400)
        .json({ success: false, message: "Имя пользователя уже существует." });
    }

    const id = Math.max(...users.map((user) => user.id)) + 1;
    const newUser = { id, name, age };

    users.push(newUser);
    await fsPromises.writeFile("users.json", JSON.stringify(users));

    res.json({ success: true, message: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Ошибка записи данных" });
  }
});

app.listen(3000, () => {
  console.log("Сервер ожидает подключения на http://localhost:3000");
});

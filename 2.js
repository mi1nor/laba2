const express = require("express");
const fsPromises = require("fs").promises;

const app = express();

app.get("/api/users", async (req, res) => {
  try {
    const content = await fsPromises.readFile("users.json", "utf8");
    const users = JSON.parse(content);
    res.json({ success: true, message: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Ошибка чтения данных" });
  }
});

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

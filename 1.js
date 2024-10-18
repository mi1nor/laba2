const express = require("express");
const fs = require("fs").promises; // Используем промисы для асинхронной работы с файлами
const app = express();
const PORT = 3000;

app.use(express.json());

// Асинхронная функция для чтения файла users.json
async function readUsersFile() {
  const data = await fs.readFile("users.json", "utf8");
  return JSON.parse(data);
}

// Асинхронная функция для записи данных в файл users.json
async function writeUsersFile(users) {
  await fs.writeFile("users.json", JSON.stringify(users, null, 2));
}

// POST-запрос для добавления нового пользователя
app.post("/api/users", async (req, res) => {
  try {
    const { name, age } = req.body;

    // Валидация данных
    if (!name || !/^[A-Za-z\s]+$/.test(name)) {
      return res.status(400).json({
        success: false,
        message: "Имя должно содержать только буквы и пробелы",
      });
    }

    if (age == null || age <= 0 || !Number.isInteger(Number(age))) {
      return res.status(400).json({
        success: false,
        message: "Возраст должен быть положительным целым числом",
      });
    }

    // Читаем существующих пользователей
    const users = await readUsersFile();

    // Проверка уникальности имени
    const isNameUnique = users.some((user) => user.name === name);
    if (isNameUnique) {
      return res.status(400).json({
        success: false,
        message: "Пользователь с таким именем уже существует",
      });
    }

    // Определяем новый ID
    const id = users.length ? Math.max(...users.map((user) => user.id)) + 1 : 1;

    // Создаем нового пользователя
    const newUser = { id, name, age };
    users.push(newUser);

    // Записываем обновлённые данные в файл
    await writeUsersFile(users);

    // Возвращаем успешный ответ
    res.status(201).json({
      success: true,
      message: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

// PUT-запрос для обновления пользователя
app.put("/api/users", async (req, res) => {
  try {
    const { id, name, age } = req.body;

    // Валидация данных
    if (!name || !/^[A-Za-z\s]+$/.test(name)) {
      return res.status(400).json({
        success: false,
        message: "Имя должно содержать только буквы и пробелы",
      });
    }

    if (age == null || age <= 0 || !Number.isInteger(Number(age))) {
      return res.status(400).json({
        success: false,
        message: "Возраст должен быть положительным целым числом",
      });
    }

    if (id == null || !Number.isInteger(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "ID должен быть числом",
      });
    }

    // Читаем пользователей из файла
    const users = await readUsersFile();
    const user = users.find((user) => user.id === id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    // Обновляем данные пользователя
    user.name = name;
    user.age = age;

    // Записываем обновленные данные обратно в файл
    await writeUsersFile(users);

    res.json({
      success: true,
      message: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

// DELETE-запрос для удаления пользователя
app.delete("/api/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    // Валидация ID
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID должен быть числом",
      });
    }

    // Читаем пользователей из файла
    const users = await readUsersFile();

    // Находим пользователя по ID
    const index = users.findIndex((user) => user.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    // Удаляем пользователя из массива
    const [deletedUser] = users.splice(index, 1);

    // Записываем обновленные данные обратно в файл
    await writeUsersFile(users);

    res.json({
      success: true,
      message: deletedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

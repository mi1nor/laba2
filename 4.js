const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());

let users = [
  { id: 1, username: 'test1', email: 'test1@example.com' },
  { id: 2, username: 'test2', email: 'test2@example.com' }
];

function logOperation(operation, data) {
  const logMessage = `[${new Date().toISOString()}] ${operation}: ${JSON.stringify(data)}\n`;
  fs.appendFile(path.join(__dirname, 'logs.txt'), logMessage, (err) => {
    if (err) console.error('Error writing to log file:', err);
  });
}

app.post('/users', (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: 'Username and email are required' });
  }

  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const newUser = {
    id: users.length + 1,
    username,
    email
  };

  users.push(newUser);
  
  logOperation('ADD_USER', newUser);
  
  res.status(201).json(newUser);
});

app.put('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { username, email } = req.body;

  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updatedUser = { ...users[userIndex], username, email };
  users[userIndex] = updatedUser;

  logOperation('UPDATE_USER', updatedUser);

  res.json(updatedUser);
});

app.delete('/users/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const deletedUser = users[userIndex];
  users.splice(userIndex, 1);

  logOperation('DELETE_USER', deletedUser);

  res.json({ message: 'User deleted successfully' });
});

app.listen(port, () => {
    console.log("Сервер ожидает подключения на http://localhost:3000");
});
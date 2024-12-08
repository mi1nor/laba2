const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());

const usersFilePath = path.join(__dirname, 'users.json');
const backupFilePath = path.join(__dirname, 'users_backup.json');

function readUsers() {
    if (!fs.existsSync(usersFilePath)) {
        return [];
    }
    try {
        const data = fs.readFileSync(usersFilePath, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error reading users file:", error);
        return [];
    }
}

function writeUsers(users) {
    if (fs.existsSync(usersFilePath)) {
        fs.copyFileSync(usersFilePath, backupFilePath);
    }
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

function logOperation(operation, data) {
    const logMessage = `[${new Date().toISOString()}] ${operation}: ${JSON.stringify(data)}\n`;
    fs.appendFileSync(path.join(__dirname, 'logs.txt'), logMessage);
}

let users = readUsers();

app.get('/api/users', (req, res) => {
    const { name, age } = req.query;
    
    let filteredUsers = users;

    if (name) {
        filteredUsers = filteredUsers.filter(user => 
            user.name.toLowerCase().includes(name.toLowerCase())
        );
    }

    if (age) {
        filteredUsers = filteredUsers.filter(user => 
            user.age === parseInt(age)
        );
    }

    res.json(filteredUsers);
});

app.post('/users', (req, res) => {
    const { name, email, age } = req.body;

    if (!name || !email || !age) {
        return res.status(400).json({ error: 'Name, email, and age are required' });
    }

    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name,
        email,
        age: parseInt(age)
    };

    users.push(newUser);
    writeUsers(users);
    
    logOperation('ADD_USER', newUser);
    
    res.status(201).json(newUser);
});

app.put('/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, email, age } = req.body;

    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = { 
        ...users[userIndex], 
        name: name || users[userIndex].name,
        email: email || users[userIndex].email,
        age: age ? parseInt(age) : users[userIndex].age
    };
    users[userIndex] = updatedUser;

    writeUsers(users);
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

    writeUsers(users);
    logOperation('DELETE_USER', deletedUser);

    res.json({ message: 'User deleted successfully' });
});

app.get('/users', (req, res) => {
    res.json(users);
});

app.listen(port, () => {
    console.log("Сервер ожидает подключения на http://localhost:3000");
});
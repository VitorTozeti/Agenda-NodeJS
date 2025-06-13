const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, 'tasks.json');

app.use(express.static('public'));

app.use(express.json());

function readTasks() {
    if (!fs.existsSync(DATA_FILE)) return {};
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '{}');
}

function writeTasks(tasks) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

app.get('/api/days', (req, res) => {
    const tasks = readTasks();
    res.json(Object.keys(tasks));
});

app.get('/api/tasks/:date', (req, res) => {
    const tasks = readTasks();
    const dayTasks = tasks[req.params.date] || [];
    res.json(dayTasks);
});

app.post('/api/tasks/:date', (req, res) => {
    const tasks = readTasks();
    const date = req.params.date;
    const newTask = req.body;

    if (!tasks[date]) tasks[date] = [];
    tasks[date].push(newTask);

    writeTasks(tasks);
    res.status(201).send('Tarefa adicionada.');
});

app.put('/api/tasks/:date/:taskIndex', (req, res) => {
    const tasks = readTasks();
    const { date, taskIndex } = req.params;
    const updatedTask = req.body;

    if (!tasks[date] || !tasks[date][taskIndex]) {
        return res.status(404).send('Tarefa não encontrada.');
    }

    tasks[date][taskIndex] = updatedTask;

    writeTasks(tasks);
    res.send('Tarefa atualizada.');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

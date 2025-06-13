// Importando módulos necessários
const express = require('express');
const fs = require('fs');
const path = require('path');

// Criando o app Express
const app = express();
const PORT = 3000;

// Arquivo onde vamos armazenar os dados das tarefas
const DATA_FILE = path.join(__dirname, 'tasks.json');

// Middleware para servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static('public'));

// Middleware para aceitar JSON no corpo das requisições
app.use(express.json());

/**
 * Função utilitária para ler as tarefas do arquivo
 */
function readTasks() {
    if (!fs.existsSync(DATA_FILE)) return {};
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '{}');
}

/**
 * Função utilitária para salvar as tarefas no arquivo
 */
function writeTasks(tasks) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// Rota: Listar todos os dias que têm tarefas
app.get('/api/days', (req, res) => {
    const tasks = readTasks();
    res.json(Object.keys(tasks)); // Retorna array de datas: ["2025-06-13", "2025-06-14", ...]
});

// Rota: Obter todas as tarefas de um dia específico
app.get('/api/tasks/:date', (req, res) => {
    const tasks = readTasks();
    const dayTasks = tasks[req.params.date] || [];
    res.json(dayTasks);
});

// Rota: Adicionar uma nova tarefa para um dia
app.post('/api/tasks/:date', (req, res) => {
    const tasks = readTasks();
    const date = req.params.date;
    const newTask = req.body;

    if (!tasks[date]) tasks[date] = [];
    tasks[date].push(newTask);

    writeTasks(tasks);
    res.status(201).send('Tarefa adicionada.');
});

// Rota: Atualizar uma tarefa (ex: marcar como completa, editar detalhes, etc.)
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

// Inicializando o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

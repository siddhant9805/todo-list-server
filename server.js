const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Optional: set CLIENT_ORIGIN (e.g. https://my-todo.vercel.app) to restrict CORS.
app.use(cors(process.env.CLIENT_ORIGIN ? { origin: process.env.CLIENT_ORIGIN.split(',') } : undefined));
app.use(express.json());

/* ------------------------------------------------------------------ *
 * Storage
 *  - On Vercel: Upstash Redis (the filesystem there is read-only).
 *  - Locally without Redis env vars: falls back to tasks.json.
 * ------------------------------------------------------------------ */
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const HASH_KEY = 'tasks';

let store;

if (REDIS_URL && REDIS_TOKEN) {
  const { Redis } = require('@upstash/redis');
  const redis = new Redis({ url: REDIS_URL, token: REDIS_TOKEN });

  store = {
    async all() {
      const data = (await redis.hgetall(HASH_KEY)) || {};
      return Object.values(data).sort((a, b) => a.id - b.id);
    },
    async add(task) {
      await redis.hset(HASH_KEY, { [String(task.id)]: task });
    },
    async update(id, message) {
      const task = await redis.hget(HASH_KEY, String(id));
      if (!task) return false;
      await redis.hset(HASH_KEY, { [String(id)]: { ...task, message } });
      return true;
    },
    async remove(id) {
      return (await redis.hdel(HASH_KEY, String(id))) > 0;
    },
  };
} else {
  const TASKS_FILE = path.join(__dirname, 'tasks.json');
  const read = async () => {
    if (!fs.existsSync(TASKS_FILE)) await fs.promises.writeFile(TASKS_FILE, '[]', 'utf-8');
    return JSON.parse(await fs.promises.readFile(TASKS_FILE, 'utf-8'));
  };
  const write = (tasks) => fs.promises.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');

  store = {
    all: read,
    async add(task) { const t = await read(); t.push(task); await write(t); },
    async update(id, message) {
      const t = await read();
      const task = t.find((x) => String(x.id) === String(id));
      if (!task) return false;
      task.message = message;
      await write(t);
      return true;
    },
    async remove(id) {
      const t = await read();
      const i = t.findIndex((x) => String(x.id) === String(id));
      if (i === -1) return false;
      t.splice(i, 1);
      await write(t);
      return true;
    },
  };
}

// Forward async errors to Express (Express 4 doesn't do this itself)
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.get('/tasks', wrap(async (req, res) => {
  res.json(await store.all());
}));

app.post('/tasks', wrap(async (req, res) => {
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  if (!message) return res.status(400).json({ error: 'message is required' });

  const newTask = { id: Date.now(), message };
  await store.add(newTask);
  res.status(201).json(newTask);
}));

app.put('/tasks/:id', wrap(async (req, res) => {
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
  if (!message) return res.status(400).json({ error: 'message is required' });

  if (!(await store.update(req.params.id, message))) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json({ message: 'Task updated successfully' });
}));

app.delete('/tasks/:id', wrap(async (req, res) => {
  if (!(await store.remove(req.params.id))) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json({ message: 'Task deleted successfully' });
}));

app.get('/', (req, res) => {
  res.send(`
    <h2>Todo REST API Server is Running!</h2>
    <p>Endpoints available:</p>
    <ul>
      <li><strong>GET /tasks</strong> - Fetch all tasks</li>
      <li><strong>POST /tasks</strong> - Add a new task (JSON body: {message:""})</li>
      <li><strong>PUT /tasks/:id</strong> - Update a task (JSON body: {message:""})</li>
      <li><strong>DELETE /tasks/:id</strong> - Delete a task by ID</li>
    </ul>
    <p><a href="/tasks" target="_blank">Click here to view /tasks in browser</a></p>
  `);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Run a real server only locally; Vercel imports the exported app instead.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Storage: ${REDIS_URL ? 'Upstash Redis' : 'local tasks.json'}`);
  });
}

module.exports = app;

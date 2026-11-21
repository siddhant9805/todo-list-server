const path = require('path');
const { readJsonArray, writeJsonArray } = require('./jsonFileStore');

const USERS_FILE = path.join(__dirname, '..', 'users.json');
const TASKS_FILE = path.join(__dirname, '..', 'tasks.json');

module.exports = {
  async findUser(email) {
    const e = email.trim().toLowerCase();
    const users = await readJsonArray(USERS_FILE);
    return users.find((u) => u.email && u.email.toLowerCase() === e) || null;
  },

  async createUser(user) {
    const users = await readJsonArray(USERS_FILE);
    if (users.some((u) => u.email && u.email.toLowerCase() === user.email)) return false;
    users.push(user);
    await writeJsonArray(USERS_FILE, users);
    return true;
  },

  async listTasks(userId) {
    const tasks = await readJsonArray(TASKS_FILE);
    return tasks.filter((t) => String(t.userId) === String(userId));
  },

  async createTask(task) {
    const tasks = await readJsonArray(TASKS_FILE);
    tasks.push(task);
    await writeJsonArray(TASKS_FILE, tasks);
    return task;
  },

  async updateTask(userId, id, message) {
    const tasks = await readJsonArray(TASKS_FILE);
    const task = tasks.find((t) => String(t.id) === String(id) && String(t.userId) === String(userId));
    if (!task) return null;
    task.message = message;
    task.updatedAt = new Date().toISOString();
    await writeJsonArray(TASKS_FILE, tasks);
    return task;
  },

  async removeTask(userId, id) {
    const tasks = await readJsonArray(TASKS_FILE);
    const i = tasks.findIndex((t) => String(t.id) === String(id) && String(t.userId) === String(userId));
    if (i === -1) return false;
    tasks.splice(i, 1);
    await writeJsonArray(TASKS_FILE, tasks);
    return true;
  },
};
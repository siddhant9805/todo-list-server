const path = require('path');
const { delayMs } = require('../config');
const { readJsonArray, writeJsonArray } = require('./jsonFileStore');

const TASKS_FILE = path.join(__dirname, '..', 'tasks.json');

async function getAll(userId) {
  const tasks = await readJsonArray(TASKS_FILE);
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return tasks.filter((task) => task.userId === userId);
}

async function create({ message, userId, username }) {
  const tasks = await readJsonArray(TASKS_FILE);
  const task = {
    id: Date.now(),
    message: message.trim(),
    userId,
    createdBy: username
  };

  tasks.push(task);
  await writeJsonArray(TASKS_FILE, tasks);
  return task;
}

async function update(id, userId, message) {
  const tasks = await readJsonArray(TASKS_FILE);
  const task = tasks.find(
    (item) => String(item.id) === id && item.userId === userId
  );

  if (!task) {
    return null;
  }

  task.message = message.trim();
  task.updatedAt = new Date().toISOString();
  await writeJsonArray(TASKS_FILE, tasks);
  return task;
}

async function remove(id, userId) {
  const tasks = await readJsonArray(TASKS_FILE);
  const taskIndex = tasks.findIndex(
    (item) => String(item.id) === id && item.userId === userId
  );

  if (taskIndex === -1) {
    return false;
  }

  tasks.splice(taskIndex, 1);
  await writeJsonArray(TASKS_FILE, tasks);
  return true;
}

module.exports = { getAll, create, update, remove };

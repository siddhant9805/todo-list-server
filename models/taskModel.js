const crypto = require('crypto');
const { delayMs } = require('../config');
const db = require('./db');

async function getAll(userId) {
  if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
  return db.listTasks(userId);
}

async function create({ message, userId, username }) {
  return db.createTask({
    id: Date.now() * 1000 + crypto.randomInt(1000),
    message: message.trim(),
    userId,
    createdBy: username
  });
}

async function update(id, userId, message) {
  return db.updateTask(userId, id, message.trim());
}

async function remove(id, userId) {
  return db.removeTask(userId, id);
}

module.exports = { getAll, create, update, remove };
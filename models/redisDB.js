const { Redis } = require('@upstash/redis');
const { redisUrl, redisToken } = require('../config');

const redis = new Redis({ url: redisUrl, token: redisToken });
const USERS = 'users';
const tasksKey = (userId) => `tasks:${userId}`;

module.exports = {
  async findUser(email) {
    return (await redis.hget(USERS, email.trim().toLowerCase())) || null;
  },

  async createUser(user) {
    const created = await redis.hsetnx(USERS, user.email, user);
    return created === 1;
  },

  async listTasks(userId) {
    const data = (await redis.hgetall(tasksKey(userId))) || {};
    return Object.values(data).sort((a, b) => a.id - b.id);
  },

  async createTask(task) {
    await redis.hset(tasksKey(task.userId), { [String(task.id)]: task });
    return task;
  },

  async updateTask(userId, id, message) {
    const task = await redis.hget(tasksKey(userId), String(id));
    if (!task) return null;
    const updated = { ...task, message, updatedAt: new Date().toISOString() };
    await redis.hset(tasksKey(userId), { [String(id)]: updated });
    return updated;
  },

  async removeTask(userId, id) {
    return (await redis.hdel(tasksKey(userId), String(id))) > 0;
  },
};
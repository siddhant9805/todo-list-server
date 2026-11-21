const taskModel = require('../models/taskModel');

async function listTasks(req, res, next) {
  try {
    const tasks = await taskModel.getAll(req.user.userId);
    return res.json(tasks);
  } catch (error) {
    return next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const { message } = req.body;

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Task message cannot be empty.' });
    }

    const task = await taskModel.create({
      message,
      userId: req.user.userId,
      username: req.user.email
    });
    return res.status(201).json(task);
  } catch (error) {
    return next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const { message } = req.body;

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Task message cannot be empty.' });
    }

    const task = await taskModel.update(req.params.id, req.user.userId, message);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    return next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const deleted = await taskModel.remove(req.params.id, req.user.userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listTasks, createTask, updateTask, deleteTask };

const crypto = require('crypto');
const db = require('./db');

async function findByEmail(email) {
  return db.findUser(email);
}

async function createUser({ email, password }) {
  const user = {
    id: crypto.randomUUID(),
    email: email.trim().toLowerCase(),
    password,
    createdAt: new Date().toISOString()
  };
  const created = await db.createUser(user);
  return created ? user : null;
}

module.exports = { findByEmail, createUser };
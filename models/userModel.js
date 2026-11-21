const crypto = require('crypto');
const path = require('path');
const { readJsonArray, writeJsonArray } = require('./jsonFileStore');

const USERS_FILE = path.join(__dirname, '..', 'users.json');

async function findByEmail(email) {
  const users = await readJsonArray(USERS_FILE);
  const normalizedEmail = email.trim().toLowerCase();
  // user.email && ... : purane records jinme email nahi hai, unse crash na ho
  return users.find((user) => user.email && user.email.toLowerCase() === normalizedEmail);
}

async function createUser({ email, password }) {
  const users = await readJsonArray(USERS_FILE);
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((user) => user.email && user.email.toLowerCase() === normalizedEmail)) {
    return null;
  }

  const user = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    password,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  await writeJsonArray(USERS_FILE, users);
  return user;
}

module.exports = { findByEmail, createUser };
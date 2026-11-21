const fs = require('fs');

async function readJsonArray(filePath) {
  try {
    await fs.promises.access(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
    await fs.promises.writeFile(filePath, '[]', 'utf-8');
  }

  const fileData = await fs.promises.readFile(filePath, 'utf-8');
  let data;

  try {
    data = JSON.parse(fileData);
  } catch (error) {
    throw new Error(`Could not parse JSON data in ${filePath}: ${error.message}`);
  }

  if (!Array.isArray(data)) {
    throw new Error(`Expected ${filePath} to contain a JSON array.`);
  }

  return data;
}

async function writeJsonArray(filePath, data) {
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readJsonArray, writeJsonArray };

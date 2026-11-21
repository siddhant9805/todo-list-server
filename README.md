# Simple Express Todo REST API (Local JSON File Storage)

A beginner-friendly Express backend that performs CRUD operations on tasks and persists them directly into a local `tasks.json` file.

---

## 🚀 How to Run Locally

1. **Open terminal** inside this folder:
   ```bash
   npm install
   ```

2. **Start the Express server**:
   ```bash
   npm start
   ```
   *(or `npm run dev` to automatically restart on file changes)*

3. Server will start at:
   ```
   http://localhost:5000
   ```

---

## 📡 REST API Endpoints (`/tasks`)

| Method | Endpoint | Description | Request Body (JSON) |
|---|---|---|---|
| **GET** | `/tasks` | Get all tasks | *None* |
| **POST** | `/tasks` | Add a new task | `{ "message": "Buy milk" }` |
| **PUT** | `/tasks/:id` | Update an existing task | `{ "message": "Buy almond milk" }` |
| **DELETE** | `/tasks/:id` | Delete task by ID | *None* |

---  

## 💾 Local File Storage

- All tasks are stored directly inside [`tasks.json`](./tasks.json).
- Whenever you add, edit, or delete a task, Express uses Node's `fs.promises` to read and write changes to the file.
- If [`tasks.json`](./tasks.json) does not exist, Express creates it automatically with an empty array `[]`.

---

## ⚛️ React Integration

An example React component connecting to this server is provided in [`client-example/App.jsx`](./client-example/App.jsx).

### Basic Fetch Examples for Students:

#### 1. Fetching tasks (GET):
```javascript
useEffect(() => {
  fetch("http://localhost:5000/tasks")
    .then((res) => res.json())
    .then((data) => setTasks(data));
}, []);
```

#### 2. Adding a task (POST):
```javascript
const response = await fetch("http://localhost:5000/tasks", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ task: input })
});
const newTask = await response.json();
setTasks([...tasks, newTask]);
```

#### 3. Updating a task (PUT):
```javascript
await fetch(`http://localhost:5000/tasks/${editId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ task: input })
});
```

#### 4. Deleting a task (DELETE):
```javascript
await fetch(`http://localhost:5000/tasks/${id}`, {
  method: "DELETE"
});
setTasks(tasks.filter((t) => t.id !== id));
```

function renderApiGuide({ port }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo API &amp; JWT Authentication Guide</title>
  <style>
    :root { color-scheme: dark; font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; }
    * { box-sizing: border-box; }
    body { line-height: 1.6; margin: 0; padding: 32px 16px; }
    main { max-width: 860px; margin: auto; }
    header { text-align: center; margin-bottom: 32px; }
    h1 { color: white; }
    h2 { color: #38bdf8; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    code, pre { background: #090d16; border-radius: 5px; padding: 3px 6px; }
    pre { padding: 12px 16px; overflow-x: auto; }
    .status { color: #22c55e; }
    .protected { color: #c084fc; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Todo REST API</h1>
      <p>JWT authentication and bcrypt password hashing</p>
      <p class="status">Server running on port ${port}</p>
    </header>
    <section class="card">
      <h2>Authentication</h2>
      <p>Register with <code>POST /register</code>, then sign in with <code>POST /login</code> to receive a signed JWT.</p>
      <p>Send the token with protected task requests using <code>Authorization: Bearer &lt;token&gt;</code>.</p>
      <pre>{ "username": "johndoe", "password": "secretpassword" }</pre>
    </section>
    <section class="card">
      <h2>API Endpoints</h2>
      <p><code>POST /register</code> — create an account (public)</p>
      <p><code>POST /login</code> — sign in and receive a JWT (public)</p>
      <p class="protected"><code>GET /tasks</code> — list tasks (protected)</p>
      <p class="protected"><code>POST /tasks</code> — add a task using <code>{ "message": "..." }</code> (protected)</p>
      <p class="protected"><code>PUT /tasks/:id</code> — update a task (protected)</p>
      <p class="protected"><code>DELETE /tasks/:id</code> — delete a task (protected)</p>
      <p>All task operations are scoped to the user identified by the JWT.</p>
    </section>
    <section class="card">
      <h2>Example</h2>
      <pre>curl http://localhost:${port}/tasks \\
  -H "Authorization: Bearer &lt;token&gt;"</pre>
    </section>
  </main>
</body>
</html>`;
}

module.exports = renderApiGuide;

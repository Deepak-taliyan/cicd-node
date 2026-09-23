const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/todos", async (req, res) => {
  try {
    const [todos] = await pool.query(
      "SELECT id, title, completed, created_at FROM todos ORDER BY id DESC"
    );

    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/todos", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const [result] = await pool.query(
      "INSERT INTO todos (title) VALUES (?)",
      [title.trim()]
    );

    res.status(201).json({
      id: result.insertId,
      title: title.trim(),
      completed: false
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    await pool.query(
      "UPDATE todos SET completed = ? WHERE id = ?",
      [completed ? 1 : 0, id]
    );

    res.json({ message: "Todo updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM todos WHERE id = ?",
      [id]
    );

    res.json({ message: "Todo deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "UP" });
});

app.get("/test", (req, res) => {
	    res.send("Server is working!");
});

app.listen(PORT, () => {
  console.log(`Todo app running on port ${PORT}`);
});

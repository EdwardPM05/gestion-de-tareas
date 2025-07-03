const express = require('express');
const mysql = require('mysql2/promise'); // Usar la versión promise para async/await
const cors = require('cors');

const app = express();
const port = 5000; // Puerto donde correrá tu backend

// Middleware
app.use(cors()); // Habilita CORS
app.use(express.json()); // Permite a Express parsear JSON en el cuerpo de las peticiones

// Configuración de la conexión a la base de datos MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root', // Reemplaza con tu usuario MySQL
  password: 'root', // Reemplaza con tu contraseña MySQL
  database: 'task_db'
};

// Conectar a la base de datos
let pool;
async function connectDb() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('Conectado a la base de datos MySQL!');
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1); // Sale del proceso si no puede conectar
  }
}
connectDb();

// Rutas de la API

// GET todas las tareas
app.get('/api/tasks', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las tareas' });
  }
});

// POST nueva tarea
app.post('/api/tasks', async (req, res) => {
  const { text, completed } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'El texto de la tarea es requerido' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO tasks (text, completed) VALUES (?, ?)',
      [text, completed || false] // Default a false si no se proporciona
    );
    const newTask = { id: result.insertId, text, completed: completed || false };
    res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al agregar la tarea' });
  }
});

// PUT actualizar tarea
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;
  if (!text && typeof completed === 'undefined') {
    return res.status(400).json({ error: 'Se requiere texto o estado para actualizar' });
  }

  try {
    let query = 'UPDATE tasks SET ';
    const values = [];
    const updates = [];

    if (text !== undefined) {
      updates.push('text = ?');
      values.push(text);
    }
    if (completed !== undefined) {
      updates.push('completed = ?');
      values.push(completed);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    query += updates.join(', ') + ' WHERE id = ?';
    values.push(id);

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    // Obtener la tarea actualizada para devolverla
    const [updatedTaskRow] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(updatedTaskRow[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  }
});

// DELETE tarea
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    res.status(204).send(); // No Content
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
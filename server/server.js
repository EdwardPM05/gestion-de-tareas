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

// GET: Obtener todas las tareas (solo las no eliminadas lógicamente)
app.get('/api/tasks', async (req, res) => {
  try {
    // Solo selecciona las tareas donde is_deleted es FALSE
    const [rows] = await pool.query('SELECT * FROM tasks WHERE is_deleted = FALSE ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener las tareas:', err);
    res.status(500).json({ error: 'Error interno del servidor al obtener tareas' });
  }
});

// NUEVA RUTA (opcional): Obtener tareas eliminadas lógicamente (para una "Papelera de Reciclaje")
app.get('/api/tasks/deleted', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE is_deleted = TRUE ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener tareas eliminadas:', err);
    res.status(500).json({ error: 'Error interno del servidor al obtener tareas eliminadas' });
  }
});

// POST: Agregar una nueva tarea (no cambia, por defecto is_deleted es FALSE)
app.post('/api/tasks', async (req, res) => {
  const { text, completed } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'El texto de la tarea es requerido.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO tasks (text, completed, is_deleted) VALUES (?, ?, FALSE)', // Añadimos is_deleted
      [text, completed || false]
    );
    const newTask = { id: result.insertId, text, completed: completed || false, is_deleted: false };
    res.status(201).json(newTask);
  } catch (err) {
    console.error('Error al agregar la tarea:', err);
    res.status(500).json({ error: 'Error interno del servidor al agregar tarea.' });
  }
});

// PUT: Actualizar una tarea existente por ID (puede incluir is_deleted)
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { text, completed, is_deleted } = req.body; // <-- Ahora también recibimos is_deleted

  if (text === undefined && typeof completed === 'undefined' && typeof is_deleted === 'undefined') {
    return res.status(400).json({ error: 'Se requiere texto, estado o estado de eliminación para actualizar.' });
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
    if (is_deleted !== undefined) { // <-- Lógica para actualizar is_deleted
      updates.push('is_deleted = ?');
      values.push(is_deleted);
    }

    query += updates.join(', ') + ' WHERE id = ?';
    values.push(id);

    const [result] = await pool.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }
    const [updatedTaskRows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(updatedTaskRows[0]);
  } catch (err) {
    console.error('Error al actualizar la tarea:', err);
    res.status(500).json({ error: 'Error interno del servidor al actualizar tarea.' });
  }
});

// DELETE: Cambiar el estado de la tarea a is_deleted = TRUE (eliminación lógica)
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Actualiza is_deleted a TRUE en lugar de eliminar
    const [result] = await pool.query('UPDATE tasks SET is_deleted = TRUE WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada.' });
    }
    // Opcional: Podrías devolver la tarea actualizada para que el frontend la elimine de la vista
    const [deletedTaskRows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.status(200).json(deletedTaskRows[0]); // Devuelve la tarea marcada como eliminada
  } catch (err) {
    console.error('Error al marcar tarea como eliminada:', err);
    res.status(500).json({ error: 'Error interno del servidor al marcar tarea como eliminada.' });
  }
});

app.delete('/api/tasks/permanent/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada para eliminación permanente.' });
    }
    res.status(204).send(); // 204 No Content para indicar eliminación exitosa sin contenido de respuesta
  } catch (err) {
    console.error('Error al eliminar la tarea permanentemente:', err);
    res.status(500).json({ error: 'Error interno del servidor al eliminar la tarea permanentemente.' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
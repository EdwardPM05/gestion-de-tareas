import React, { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import AddTaskForm from './components/AddTaskForm';
import EditTaskForm from './components/EditTaskForm';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null); // Almacena la tarea que se está editando

  // useEffect para cargar las tareas cuando el componente se monta
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // Asegúrate de que esta URL coincida con la URL de tu backend
      const response = await fetch('http://localhost:5000/api/tasks');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      // Aquí puedes mostrar un mensaje de error al usuario
    }
  };

  const handleAddTask = async (newTaskText) => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTaskText, completed: false })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newTask = await response.json();
      setTasks(prevTasks => [...prevTasks, newTask]); // Actualiza el estado con la nueva tarea
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTasks(prevTasks => prevTasks.map(task => (task.id === data.id ? data : task)));
      setEditingTask(null); // Sale del modo de edición
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleToggleComplete = (id) => {
    const taskToUpdate = tasks.find(task => task.id === id);
    if (taskToUpdate) {
      const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };
      handleUpdateTask(updatedTask); // Reutiliza la función de actualización
    }
  };

  return (
    <div className="app-container">
      <h1>Gestión de Tareas</h1>
      <AddTaskForm onAddTask={handleAddTask} />

      {editingTask ? (
        <EditTaskForm
          task={editingTask}
          onSave={handleUpdateTask}
          onCancel={() => setEditingTask(null)}
        />
      ) : (
        <TaskList
          tasks={tasks}
          onDelete={handleDeleteTask}
          onEdit={setEditingTask} // Pasa la función para establecer la tarea en edición
          onToggleComplete={handleToggleComplete}
        />
      )}
    </div>
  );
}

export default App;
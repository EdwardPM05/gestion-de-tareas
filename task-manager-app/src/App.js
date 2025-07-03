import React, { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import AddTaskForm from './components/AddTaskForm';
import EditTaskForm from './components/EditTaskForm';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null); // Almacena la tarea que se está editando
  const [showDeletedTasks, setShowDeletedTasks] = useState(false); // Estado para alternar entre tareas activas y eliminadas lógicamente

  // useEffect para cargar las tareas cuando el componente se monta o cuando cambia showDeletedTasks
  useEffect(() => {
    fetchTasks();
  }, [showDeletedTasks]); // Cada vez que cambie si mostramos eliminadas o no, volvemos a obtener las tareas

  const fetchTasks = async () => {
    try {
      // Determina la URL de la API según si queremos ver tareas activas o eliminadas lógicamente
      const url = showDeletedTasks
        ? 'http://localhost:5000/api/tasks/deleted' // Ruta para tareas eliminadas lógicamente
        : 'http://localhost:5000/api/tasks';      // Ruta para tareas activas

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data); // Actualiza el estado con las tareas obtenidas
    } catch (error) {
      console.error("Error fetching tasks:", error);
      // Aquí podrías implementar una UI para mostrar un mensaje de error al usuario
    }
  };

  // Manejador para agregar una nueva tarea
  const handleAddTask = async (newTaskText) => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTaskText, completed: false }) // Por defecto, no completada
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newTask = await response.json();
      setTasks(prevTasks => [...prevTasks, newTask]); // Agrega la nueva tarea al estado
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Manejador para actualizar una tarea existente (incluyendo su texto o estado de completado)
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
      // Si la tarea actualizada implica un cambio en su estado de eliminación, volvemos a obtener las tareas
      // Esto es útil si una tarea se está "restaurando" o "eliminando lógicamente" desde el modo de edición
      if (data.is_deleted !== undefined) {
          fetchTasks(); 
      } else {
          // Si es solo una actualización de texto o completado, actualizamos el estado local
          setTasks(prevTasks => prevTasks.map(task => (task.id === data.id ? data : task)));
      }
      setEditingTask(null); // Sale del modo de edición
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Manejador para "eliminar" una tarea (eliminación lógica: la marca como is_deleted = TRUE)
  const handleDeleteTask = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE' // Este endpoint en el backend ahora realiza un soft delete
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Después de marcar la tarea como eliminada lógicamente, refrescamos la lista
      // para que desaparezca de la vista actual (si no estamos en la papelera) o se actualice
      fetchTasks(); 
    } catch (error) {
      console.error("Error deleting (soft) task:", error);
    }
  };

  // Manejador para marcar/desmarcar una tarea como completada
  const handleToggleComplete = (id) => {
    const taskToUpdate = tasks.find(task => task.id === id);
    if (taskToUpdate) {
      // Crea una copia de la tarea invirtiendo su estado de 'completed'
      const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };
      // Reutiliza handleUpdateTask para enviar el cambio al backend
      handleUpdateTask(updatedTask);
    }
  };

  // Manejador para restaurar una tarea eliminada lógicamente (cambia is_deleted a FALSE)
  const handleRestoreTask = async (taskToRestore) => {
    try {
      const restoredTask = { ...taskToRestore, is_deleted: false }; // Cambia el estado de eliminación a false
      const response = await fetch(`http://localhost:5000/api/tasks/${restoredTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restoredTask)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Una vez restaurada, refrescamos la lista para que aparezca en las tareas activas
      fetchTasks();
    } catch (error) {
      console.error("Error restoring task:", error);
    }
  };

  // Manejador para eliminar una tarea permanentemente de la base de datos (hard delete)
  const handlePermanentDeleteTask = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta tarea PERMANENTEMENTE? Esta acción no se puede deshacer.")) {
        return;
    }

    try {
        // Asegúrate de que la URL contenga '/permanent/'
        const response = await fetch(`http://localhost:5000/api/tasks/permanent/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            // El error 404 que viste viene de esta línea
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        fetchTasks(); // Refresca la lista después de la eliminación
    } catch (error) {
        console.error("Error deleting task permanently:", error);
    }
};

  return (
    <div className="app-container">
      <h1>Gestión de Tareas</h1>
      {/* El componente Saludo se muestra al inicio */}

      
      {/* Formulario para agregar nuevas tareas */}
      <AddTaskForm onAddTask={handleAddTask} />

      {/* Botón para alternar entre ver tareas activas y la papelera de reciclaje */}
      <button
        onClick={() => setShowDeletedTasks(!showDeletedTasks)}
        style={{ marginBottom: '20px', padding: '10px 15px', cursor: 'pointer', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        {showDeletedTasks ? 'Ver Tareas Activas' : 'Ver Papelera de Reciclaje'}
      </button>

      {/* Renderizado condicional: si hay una tarea editándose, muestra el formulario de edición,
          sino, muestra la lista de tareas */}
      {editingTask ? (
        <EditTaskForm
          task={editingTask}
          onSave={handleUpdateTask}
          onCancel={() => setEditingTask(null)}
        />
      ) : (
        <TaskList
          tasks={tasks}
          onDelete={handleDeleteTask} // Para eliminación lógica (mover a papelera)
          onEdit={setEditingTask}
          onToggleComplete={handleToggleComplete}
          onRestore={handleRestoreTask} // Para restaurar desde la papelera
          onPermanentDelete={handlePermanentDeleteTask} // Para eliminar definitivamente
          isViewingDeleted={showDeletedTasks} // Indica si la lista actual es la papelera
        />
      )}
    </div>
  );
}

export default App;
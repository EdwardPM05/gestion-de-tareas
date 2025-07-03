import React, { useState } from 'react';
import './AddTaskForm.css'; // Estilos para AddTaskForm

function AddTaskForm({ onAddTask }) {
  const [taskText, setTaskText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskText.trim()) { // Asegúrate de que el texto no esté vacío o solo espacios
      onAddTask(taskText);
      setTaskText(''); // Limpia el input después de agregar
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-task-form">
      <input
        type="text"
        placeholder="Escribe una nueva tarea..."
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        className="task-input"
      />
      <button type="submit" className="add-btn">Agregar Tarea</button>
    </form>
  );
}

export default AddTaskForm;
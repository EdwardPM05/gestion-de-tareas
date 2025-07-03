import React from 'react';
import './TaskItem.css'; // Estilos para TaskItem

function TaskItem({ task, onDelete, onEdit, onToggleComplete }) {
  const handleEditClick = () => {
    onEdit(task); // Pasa la tarea completa para que App.js la ponga en modo edición
  };

  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      <span
        className="task-text"
        onClick={() => onToggleComplete(task.id)}
      >
        {task.text}
      </span>
      <div className="task-actions">
        <button onClick={handleEditClick} className="edit-btn">Editar</button>
        <button onClick={() => onDelete(task.id)} className="delete-btn">Eliminar</button>
      </div>
    </li>
  );
}

export default TaskItem;
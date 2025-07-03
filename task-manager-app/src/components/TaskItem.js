import React from 'react';
import './TaskItem.css';

// Añade onPermanentDelete a las props
function TaskItem({ task, onDelete, onEdit, onToggleComplete, onRestore, onPermanentDelete, isViewingDeleted }) {
  const handleEditClick = () => {
    onEdit(task);
  };

  const handleRestoreClick = () => {
    onRestore(task);
  };

  const handlePermanentDeleteClick = () => {
    onPermanentDelete(task.id); // Llama a la función de eliminación permanente
  };

  return (
    <li className={`task-item ${task.completed ? 'completed' : ''} ${task.is_deleted ? 'soft-deleted' : ''}`}>
      <span
        className="task-text"
        onClick={() => !isViewingDeleted && onToggleComplete(task.id)}
      >
        {task.text}
      </span>
      <div className="task-actions">
        {isViewingDeleted ? ( // Si estamos viendo tareas eliminadas lógicamente (en la papelera)
          <>
            <button onClick={handleRestoreClick} className="restore-btn">Restaurar</button>
            <button onClick={handlePermanentDeleteClick} className="permanent-delete-btn">Eliminar Permanentemente</button> {/* <-- NUEVO BOTÓN */}
          </>
        ) : ( // Si estamos viendo tareas activas
          <>
            <button onClick={handleEditClick} className="edit-btn">Editar</button>
            <button onClick={() => onDelete(task.id)} className="delete-btn">Eliminar</button> {/* Este es el soft delete */}
          </>
        )}
      </div>
    </li>
  );
}

export default TaskItem;
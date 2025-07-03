import React from 'react';
import TaskItem from './TaskItem';
import './TaskList.css';

// Añade onPermanentDelete a las props
function TaskList({ tasks, onDelete, onEdit, onToggleComplete, onRestore, onPermanentDelete, isViewingDeleted }) {
  if (tasks.length === 0) {
    const message = isViewingDeleted
      ? 'No hay tareas en la papelera de reciclaje.'
      : 'No hay tareas activas. ¡Agrega una nueva!';
    return <p className="no-tasks-message">{message}</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={onDelete}
          onEdit={onEdit}
          onToggleComplete={onToggleComplete}
          onRestore={onRestore}
          onPermanentDelete={onPermanentDelete} // <-- Pasa onPermanentDelete
          isViewingDeleted={isViewingDeleted}
        />
      ))}
    </ul>
  );
}

export default TaskList;
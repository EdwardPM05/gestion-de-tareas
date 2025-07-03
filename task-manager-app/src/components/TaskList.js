import React from 'react';
import TaskItem from './TaskItem';
import './TaskList.css'; // Estilos para TaskList

function TaskList({ tasks, onDelete, onEdit, onToggleComplete }) {
  if (tasks.length === 0) {
    return <p className="no-tasks-message">No hay tareas. ¡Agrega una nueva!</p>;
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
        />
      ))}
    </ul>
  );
}

export default TaskList;
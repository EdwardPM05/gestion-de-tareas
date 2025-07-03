import React, { useState, useEffect } from 'react';
import './EditTaskForm.css'; // Estilos para EditTaskForm

function EditTaskForm({ task, onSave, onCancel }) {
  const [editedText, setEditedText] = useState(task.text);

  // Sincroniza el estado local del input con la prop 'task.text'
  // Esto es útil si la tarea a editar cambia mientras el formulario está abierto
  useEffect(() => {
    setEditedText(task.text);
  }, [task.text]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editedText.trim()) {
      onSave({ ...task, text: editedText }); // Envía la tarea actualizada al padre
    }
  };

  return (
    <form onSubmit={handleSubmit} className="edit-task-form">
      <h2>Editar Tarea</h2>
      <input
        type="text"
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
        className="edit-input"
      />
      <div className="edit-actions">
        <button type="submit" className="save-btn">Guardar</button>
        <button type="button" onClick={onCancel} className="cancel-btn">Cancelar</button>
      </div>
    </form>
  );
}

export default EditTaskForm;    
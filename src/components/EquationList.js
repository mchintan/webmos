import React, { useState } from 'react';
import { ChromePicker } from 'react-color';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import './EquationList.css';

const EquationList = ({ equations, onDeleteEquation, onUpdateEquationColor, onUpdateEquation }) => {
  const [openColorPicker, setOpenColorPicker] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const handleColorChange = (id, color) => {
    onUpdateEquationColor(id, color.hex);
  };

  const toggleColorPicker = (id) => {
    setOpenColorPicker(openColorPicker === id ? null : id);
  };

  const startEditing = (equation) => {
    setEditingId(equation.id);
    setEditText(equation.expression);
  };

  const saveEdit = () => {
    if (editText.trim() && editingId) {
      onUpdateEquation(editingId, editText.trim());
      setEditingId(null);
      setEditText('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleEditKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  if (equations.length === 0) {
    return (
      <div className="equation-list">
        <div className="empty-state">
          <p>No equations yet. Add your first equation above!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="equation-list">
      <h3>Equations ({equations.length})</h3>
      {equations.map((equation) => (
        <div key={equation.id} className="equation-item">
          {editingId === equation.id ? (
            <div className="equation-edit">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyPress={handleEditKeyPress}
                className="edit-input"
                autoFocus
              />
              <div className="edit-controls">
                <button
                  className="save-button"
                  onClick={saveEdit}
                  title="Save changes"
                >
                  <FaSave />
                </button>
                <button
                  className="cancel-button"
                  onClick={cancelEdit}
                  title="Cancel editing"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="equation-text">{equation.expression}</div>
              
              <div className="equation-controls">
                <button
                  className="edit-button"
                  onClick={() => startEditing(equation)}
                  title="Edit equation"
                >
                  <FaEdit />
                </button>
                
                <div className="color-picker">
                  <div
                    className="color-preview"
                    style={{ backgroundColor: equation.color }}
                    onClick={() => toggleColorPicker(equation.id)}
                  />
                  {openColorPicker === equation.id && (
                    <div className="color-picker-popup">
                      <ChromePicker
                        color={equation.color}
                        onChange={(color) => handleColorChange(equation.id, color)}
                      />
                    </div>
                  )}
                </div>
                
                <button
                  className="delete-button"
                  onClick={() => onDeleteEquation(equation.id)}
                  title="Delete equation"
                >
                  ×
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default EquationList;


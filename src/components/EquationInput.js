import React, { useState } from 'react';
import { ChromePicker } from 'react-color';
import './EquationInput.css';

const EquationInput = ({ onAddEquation }) => {
  const [expression, setExpression] = useState('');
  const [color, setColor] = useState('#ff0000');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!expression.trim()) {
      setError('Please enter an equation');
      return;
    }
    
    try {
      onAddEquation(expression.trim(), color);
      setExpression('');
      setError('');
    } catch (err) {
      setError('Invalid equation format');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="equation-input">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter equation (e.g., y = sin(x), x^2 + y^2 = 4)"
          value={expression}
          onChange={(e) => {
            setExpression(e.target.value);
            setError('');
          }}
          onKeyPress={handleKeyPress}
          className={error ? 'error' : ''}
        />
        
        <div className="input-controls">
          <div className="color-selector">
            <div 
              className="color-preview"
              style={{ backgroundColor: color }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            {showColorPicker && (
              <div className="color-picker-popup">
                <ChromePicker
                  color={color}
                  onChange={(newColor) => setColor(newColor.hex)}
                />
              </div>
            )}
          </div>
          
          <button
            type="submit"
            className="add-button"
            disabled={!expression.trim()}
          >
            Add
          </button>
        </div>
      </form>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default EquationInput;


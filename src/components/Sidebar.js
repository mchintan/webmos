import React, { useState } from 'react';
import { ChromePicker } from 'react-color';
import EquationList from './EquationList';
import VoiceInput from './VoiceInput';
import VideoUpload from './VideoUpload';
import './Sidebar.css';

const Sidebar = ({
  equations,
  onAddEquation,
  onDeleteEquation,
  onUpdateEquationColor,
  onUpdateEquation,
  onClearGraph,
  onExportGraph,
  onVoiceInput,
  onVideoExtract
}) => {
  const [currentExpression, setCurrentExpression] = useState('');
  const [currentColor, setCurrentColor] = useState('#ff0000');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleAddEquation = () => {
    if (currentExpression.trim()) {
      onAddEquation(currentExpression.trim(), currentColor);
      setCurrentExpression('');
      setCurrentColor('#ff0000');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddEquation();
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>Math Graphing System</h1>
        <p>Enter equations to plot on the graph</p>
      </div>
      
      <div className="sidebar-content">
        <div className="equation-input">
          <input
            type="text"
            placeholder="Enter equation (e.g., y = sin(x), x^2 + y^2 = 4)"
            value={currentExpression}
            onChange={(e) => setCurrentExpression(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          
          <div className="color-selector">
            <div 
              className="color-preview"
              style={{ backgroundColor: currentColor }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            {showColorPicker && (
              <div className="color-picker-popup">
                <ChromePicker
                  color={currentColor}
                  onChange={(color) => setCurrentColor(color.hex)}
                />
              </div>
            )}
          </div>
          
          <button
            className="add-button"
            onClick={handleAddEquation}
            disabled={!currentExpression.trim()}
          >
            Add Equation
          </button>
        </div>

        <VoiceInput onVoiceInput={onVoiceInput} />
        
        <VideoUpload onVideoExtract={onVideoExtract} />
        
        <EquationList
          equations={equations}
          onDeleteEquation={onDeleteEquation}
          onUpdateEquationColor={onUpdateEquationColor}
          onUpdateEquation={onUpdateEquation}
        />
      </div>

      <div className="controls">
        <button className="control-button" onClick={onClearGraph}>
          Clear All Equations
        </button>
        <button className="control-button export" onClick={onExportGraph}>
          Export as SVG
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

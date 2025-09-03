import React from 'react';
import { 
  FaFont, 
  FaArrowRight, 
  FaCircle, 
  FaSquare, 
  FaRuler, 
  FaMousePointer,
  FaTrash,
  FaUndo,
  FaRedo
} from 'react-icons/fa';
import './AnnotationToolbar.css';

const AnnotationToolbar = ({ 
  activeTool, 
  onToolChange, 
  onClearAnnotations, 
  onUndo, 
  onRedo,
  canUndo,
  canRedo 
}) => {
  const tools = [
    { id: 'select', icon: FaMousePointer, label: 'Select', title: 'Select and move annotations' },
    { id: 'text', icon: FaFont, label: 'Text', title: 'Add text labels' },
    { id: 'arrow', icon: FaArrowRight, label: 'Arrow', title: 'Add arrows' },
    { id: 'circle', icon: FaCircle, label: 'Circle', title: 'Draw circles' },
    { id: 'rectangle', icon: FaSquare, label: 'Rectangle', title: 'Draw rectangles' },
    { id: 'measure', icon: FaRuler, label: 'Measure', title: 'Measure distances' }
  ];

  return (
    <div className="annotation-toolbar">
      <div className="toolbar-section">
        <h4>Annotations</h4>
        <div className="tool-buttons">
          {tools.map(tool => (
            <button
              key={tool.id}
              className={`tool-button ${activeTool === tool.id ? 'active' : ''}`}
              onClick={() => onToolChange(tool.id)}
              title={tool.title}
            >
              <tool.icon />
              <span className="tool-label">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <h4>Actions</h4>
        <div className="action-buttons">
          <button
            className="action-button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo last action"
          >
            <FaUndo />
            <span>Undo</span>
          </button>
          <button
            className="action-button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo last action"
          >
            <FaRedo />
            <span>Redo</span>
          </button>
          <button
            className="action-button danger"
            onClick={onClearAnnotations}
            title="Clear all annotations"
          >
            <FaTrash />
            <span>Clear All</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnotationToolbar;

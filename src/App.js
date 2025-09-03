import React, { useState, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import GraphCanvas from './components/GraphCanvas';

import { processVoiceInput, processVideoExtraction, validateExpression } from './utils/voiceProcessor';
import './App.css';

function App() {
  const [equations, setEquations] = useState([]);
  const [viewState, setViewState] = useState({
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
    scale: 1,
    translateX: 0,
    translateY: 0
  });

  const addEquation = useCallback((expression, color) => {
    const newEquation = {
      id: Date.now(),
      expression,
      color,
      visible: true
    };
    setEquations(prev => [...prev, newEquation]);
  }, []);

  const deleteEquation = useCallback((id) => {
    setEquations(prev => prev.filter(eq => eq.id !== id));
  }, []);

  const updateEquationColor = useCallback((id, color) => {
    setEquations(prev => 
      prev.map(eq => eq.id === id ? { ...eq, color } : eq)
    );
  }, []);

  const updateEquation = useCallback((id, expression) => {
    if (validateExpression(expression)) {
      setEquations(prev => 
        prev.map(eq => eq.id === id ? { ...eq, expression } : eq)
      );
      toast.success('Equation updated successfully!');
    } else {
      toast.error('Invalid mathematical expression');
    }
  }, []);

  const clearGraph = useCallback(() => {
    setEquations([]);
  }, []);

  const resetView = useCallback(() => {
    setViewState({
      xMin: -10,
      xMax: 10,
      yMin: -10,
      yMax: 10,
      scale: 1,
      translateX: 0,
      translateY: 0
    });
  }, []);

  const exportGraph = useCallback(() => {
    const canvas = document.querySelector('.graph-canvas svg');
    if (canvas) {
      const svgData = new XMLSerializer().serializeToString(canvas);
      const canvasBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(canvasBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'math-graph.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Graph exported successfully!');
    }
  }, []);

  const handleVoiceInput = useCallback((voiceText) => {
    const processedExpression = processVoiceInput(voiceText);
    if (validateExpression(processedExpression)) {
      addEquation(processedExpression, '#ff0000');
      toast.success('Voice input processed successfully!');
    } else {
      toast.error('Could not process voice input. Please try again.');
    }
  }, [addEquation]);

  const handleVideoExtract = useCallback((extractedText) => {
    const processedExpressions = processVideoExtraction(extractedText);
    let addedCount = 0;
    
    processedExpressions.forEach(expression => {
      if (validateExpression(expression)) {
        addEquation(expression, '#ff0000');
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      toast.success(`${addedCount} equation(s) added from video!`);
    } else {
      toast.error('No valid equations found in video content.');
    }
  }, [addEquation]);

  return (
    <div className="app">
      <Sidebar
        equations={equations}
        onAddEquation={addEquation}
        onDeleteEquation={deleteEquation}
        onUpdateEquationColor={updateEquationColor}
        onUpdateEquation={updateEquation}
        onClearGraph={clearGraph}
        onExportGraph={exportGraph}
        onVoiceInput={handleVoiceInput}
        onVideoExtract={handleVideoExtract}
      />
      <div className="graph-container">
        <GraphCanvas
          equations={equations}
          viewState={viewState}
          onViewStateChange={setViewState}
          onResetView={resetView}
        />
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;


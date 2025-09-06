import React, { useState, useCallback, useEffect } from 'react';
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
  const [error, setError] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    equationCount: 0,
    lastUpdate: Date.now()
  });

  // Performance monitoring
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      setPerformanceMetrics(prev => ({
        ...prev,
        renderTime: endTime - startTime,
        equationCount: equations.length,
        lastUpdate: Date.now()
      }));
    };
  }, [equations, viewState]);

  // Global error handler
  useEffect(() => {
    const handleError = (error) => {
      console.error('Application Error:', error);
      setError(error.message);
      toast.error('An unexpected error occurred. Please refresh the page.');
    };

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      setError(event.reason?.message || 'Unknown error');
      toast.error('An unexpected error occurred.');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const addEquation = useCallback((expression, color) => {
    try {
      // Validate expression before adding
      if (!expression || !expression.trim()) {
        throw new Error('Expression cannot be empty');
      }

      const newEquation = {
        id: Date.now(),
        expression: expression.trim(),
        color: color || '#ff0000',
        visible: true,
        createdAt: new Date().toISOString()
      };

      setEquations(prev => {
        // Prevent duplicate expressions
        const exists = prev.some(eq => eq.expression === newEquation.expression);
        if (exists) {
          toast.warning('This equation already exists');
          return prev;
        }
        return [...prev, newEquation];
      });

      setError(null);
      toast.success('Equation added successfully!');
    } catch (err) {
      console.error('Error adding equation:', err);
      setError(err.message);
      toast.error(`Failed to add equation: ${err.message}`);
    }
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
      {error && (
        <div className="global-error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
            <button
              className="error-dismiss"
              onClick={() => setError(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

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

        {/* Performance Metrics (Debug Mode) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="performance-metrics">
            <small>
              Render: {performanceMetrics.renderTime.toFixed(2)}ms |
              Equations: {performanceMetrics.equationCount} |
              Last Update: {new Date(performanceMetrics.lastUpdate).toLocaleTimeString()}
            </small>
          </div>
        )}
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;


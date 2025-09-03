import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { evaluateExpression, parseEquation, parseUserInput } from '../utils/mathUtils';
import { 
  createAnnotation, 
  screenToGraphCoords, 
  isPointInAnnotation,
  ANNOTATION_TYPES 
} from '../utils/annotationUtils';
import AnnotationLayer from './AnnotationLayer';
import AnnotationToolbar from './AnnotationToolbar';
import './GraphCanvas.css';

const GraphCanvas = ({ equations, viewState, onViewStateChange, onResetView }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const zoomRef = useRef();
  
  // Annotation state
  const [annotations, setAnnotations] = useState([]);
  const [activeTool, setActiveTool] = useState('select');
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingData, setDrawingData] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const width = 800;
  const height = 600;
  const margin = useMemo(() => ({ top: 40, right: 40, bottom: 40, left: 40 }), []);

  const xScale = d3.scaleLinear()
    .domain([viewState.xMin, viewState.xMax])
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain([viewState.yMin, viewState.yMax])
    .range([height - margin.bottom, margin.top]);

  const updateZoom = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    
    // Remove existing zoom behavior
    svg.on('.zoom', null);

    // Create new zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        const { transform } = event;
        
        // Update view state
        const newXMin = viewState.xMin - (transform.x / transform.k) * (viewState.xMax - viewState.xMin) / (width - margin.left - margin.right);
        const newXMax = viewState.xMax - (transform.x / transform.k) * (viewState.xMax - viewState.xMin) / (width - margin.left - margin.right);
        const newYMin = viewState.yMin + (transform.y / transform.k) * (viewState.yMax - viewState.yMin) / (height - margin.top - margin.bottom);
        const newYMax = viewState.yMax + (transform.y / transform.k) * (viewState.yMax - viewState.yMin) / (height - margin.top - margin.bottom);

        onViewStateChange({
          xMin: newXMin,
          xMax: newXMax,
          yMin: newYMin,
          yMax: newYMax,
          scale: transform.k,
          translateX: transform.x,
          translateY: transform.y
        });
      });

    svg.call(zoom);
    zoomRef.current = zoom;
  }, [viewState, onViewStateChange, width, height, margin]);

  const drawGrid = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Clear existing grid
    svg.selectAll('.grid-line').remove();

    // Draw vertical grid lines
    const xTicks = xScale.ticks(20);
    svg.selectAll('.grid-line-x')
      .data(xTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line grid-line-x')
      .attr('x1', d => xScale(d))
      .attr('y1', margin.top)
      .attr('x2', d => xScale(d))
      .attr('y2', height - margin.bottom);

    // Draw horizontal grid lines
    const yTicks = yScale.ticks(20);
    svg.selectAll('.grid-line-y')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line grid-line-y')
      .attr('x1', margin.left)
      .attr('y1', d => yScale(d))
      .attr('x2', width - margin.right)
      .attr('y2', d => yScale(d));
  }, [xScale, yScale, width, height, margin]);

  const drawAxes = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Clear existing axes
    svg.selectAll('.axis').remove();

    // X-axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(10)
      .tickFormat(d3.format('.1f'));

    svg.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis);

    // Y-axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(10)
      .tickFormat(d3.format('.1f'));

    svg.append('g')
      .attr('class', 'axis y-axis')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis);

    // Axis labels
    svg.append('text')
      .attr('class', 'axis-label x-label')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .text('x');

    svg.append('text')
      .attr('class', 'axis-label y-label')
      .attr('x', 10)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('transform', `rotate(-90, 10, ${height / 2})`)
      .text('y');
  }, [xScale, yScale, width, height, margin]);

  const plotFunction = useCallback((equation) => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const { expression, color } = equation;

    try {
      // Parse user input to handle common mathematical notation
      const processedExpression = parseUserInput(expression);
      const parsed = parseEquation(processedExpression);
      
      if (parsed.type === 'explicit') {
        // Plot explicit function y = f(x)
        const points = [];
        const step = (viewState.xMax - viewState.xMin) / 1000;
        
        for (let x = viewState.xMin; x <= viewState.xMax; x += step) {
          try {
            const y = evaluateExpression(parsed.function, { x });
            if (isFinite(y) && y >= viewState.yMin && y <= viewState.yMax) {
              points.push([x, y]);
            }
          } catch (error) {
            // Skip points that cause errors
          }
        }

        if (points.length > 1) {
          const line = d3.line()
            .x(d => xScale(d[0]))
            .y(d => yScale(d[1]))
            .curve(d3.curveMonotoneX);

          svg.append('path')
            .datum(points)
            .attr('class', 'function-line')
            .attr('d', line)
            .attr('stroke', color)
            .attr('fill', 'none')
            .attr('stroke-width', 2);
        }
      } else if (parsed.type === 'implicit') {
        // Plot implicit equation using contour method
        const resolution = 100;
        const xStep = (viewState.xMax - viewState.xMin) / resolution;
        const yStep = (viewState.yMax - viewState.yMin) / resolution;
        
        const points = [];
        
        for (let i = 0; i < resolution; i++) {
          for (let j = 0; j < resolution; j++) {
            const x = viewState.xMin + i * xStep;
            const y = viewState.yMin + j * yStep;
            
            try {
              const result = evaluateExpression(parsed.expression, { x, y });
              if (Math.abs(result) < 0.1) { // Threshold for implicit plotting
                points.push([x, y]);
              }
            } catch (error) {
              // Skip points that cause errors
            }
          }
        }

        if (points.length > 0) {
          svg.selectAll(`.implicit-points-${equation.id}`)
            .data(points)
            .enter()
            .append('circle')
            .attr('class', `implicit-points-${equation.id}`)
            .attr('cx', d => xScale(d[0]))
            .attr('cy', d => yScale(d[1]))
            .attr('r', 1)
            .attr('fill', color);
        }
      }
    } catch (error) {
      console.error('Error plotting function:', error);
    }
  }, [xScale, yScale, viewState]);

  const clearFunctions = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('.function-line').remove();
    svg.selectAll('[class^="implicit-points-"]').remove();
  }, []);

  const addTooltip = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    
    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    svg.on('mousemove', (event) => {
      const [mouseX, mouseY] = d3.pointer(event);
      const x = xScale.invert(mouseX);
      const y = yScale.invert(mouseY);
      
      tooltip
        .style('opacity', 1)
        .html(`(${x.toFixed(2)}, ${y.toFixed(2)})`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    });

    svg.on('mouseleave', () => {
      tooltip.style('opacity', 0);
    });
  }, [xScale, yScale]);

  // Annotation event handlers
  const handleMouseDown = useCallback((event) => {
    if (activeTool === 'select') {
      const [mouseX, mouseY] = d3.pointer(event);
      const graphCoords = screenToGraphCoords(mouseX, mouseY, viewState);
      
      // Check if clicking on an annotation
      const clickedAnnotation = annotations.find(annotation => 
        isPointInAnnotation(graphCoords, annotation, viewState)
      );
      
      if (clickedAnnotation) {
        setSelectedAnnotationId(clickedAnnotation.id);
      } else {
        setSelectedAnnotationId(null);
      }
    } else if (activeTool === 'text') {
      const [mouseX, mouseY] = d3.pointer(event);
      const graphCoords = screenToGraphCoords(mouseX, mouseY, viewState);
      
      const text = prompt('Enter text for annotation:');
      if (text) {
        const newAnnotation = createAnnotation(ANNOTATION_TYPES.TEXT, graphCoords, { text });
        addAnnotation(newAnnotation);
      }
    } else if (activeTool === 'arrow' || activeTool === 'measure') {
      const [mouseX, mouseY] = d3.pointer(event);
      const graphCoords = screenToGraphCoords(mouseX, mouseY, viewState);
      
      setIsDrawing(true);
      setDrawingData({
        type: activeTool,
        start: graphCoords
      });
    } else if (activeTool === 'circle') {
      const [mouseX, mouseY] = d3.pointer(event);
      const graphCoords = screenToGraphCoords(mouseX, mouseY, viewState);
      
      const radius = prompt('Enter circle radius:', '20');
      if (radius && !isNaN(radius)) {
        const newAnnotation = createAnnotation(ANNOTATION_TYPES.CIRCLE, {
          center: graphCoords,
          radius: parseFloat(radius)
        });
        addAnnotation(newAnnotation);
      }
    } else if (activeTool === 'rectangle') {
      const [mouseX, mouseY] = d3.pointer(event);
      const graphCoords = screenToGraphCoords(mouseX, mouseY, viewState);
      
      setIsDrawing(true);
      setDrawingData({
        type: activeTool,
        start: graphCoords
      });
    }
  }, [activeTool, annotations, viewState, addAnnotation]);

  const handleMouseMove = useCallback((event) => {
    if (!isDrawing || !drawingData) return;
    
    const [mouseX, mouseY] = d3.pointer(event);
    const graphCoords = screenToGraphCoords(mouseX, mouseY, viewState);
    
    // Update drawing preview
    setDrawingData(prev => ({
      ...prev,
      current: graphCoords
    }));
  }, [isDrawing, drawingData, viewState]);

  const handleMouseUp = useCallback((event) => {
    if (!isDrawing || !drawingData) return;
    
    const [mouseX, mouseY] = d3.pointer(event);
    const graphCoords = screenToGraphCoords(mouseX, mouseY, viewState);
    
    if (drawingData.type === 'arrow' || drawingData.type === 'measure') {
      const newAnnotation = createAnnotation(
        drawingData.type === 'arrow' ? ANNOTATION_TYPES.ARROW : ANNOTATION_TYPES.MEASURE,
        {
          start: drawingData.start,
          end: graphCoords
        }
      );
      addAnnotation(newAnnotation);
    } else if (drawingData.type === 'rectangle') {
      const width = Math.abs(graphCoords.x - drawingData.start.x);
      const height = Math.abs(graphCoords.y - drawingData.start.y);
      
      const newAnnotation = createAnnotation(ANNOTATION_TYPES.RECTANGLE, {
        x: Math.min(drawingData.start.x, graphCoords.x),
        y: Math.min(drawingData.start.y, graphCoords.y),
        width,
        height
      });
      addAnnotation(newAnnotation);
    }
    
    setIsDrawing(false);
    setDrawingData(null);
  }, [isDrawing, drawingData, viewState, addAnnotation]);

  // Annotation management functions
  const addAnnotation = useCallback((annotation) => {
    setAnnotations(prev => {
      const newAnnotations = [...prev, annotation];
      // Save to undo stack
      setUndoStack(prevStack => [...prevStack, prev]);
      setRedoStack([]);
      return newAnnotations;
    });
  }, []);

  const removeAnnotation = useCallback((id) => {
    setAnnotations(prev => {
      const newAnnotations = prev.filter(ann => ann.id !== id);
      setUndoStack(prevStack => [...prevStack, prev]);
      setRedoStack([]);
      return newAnnotations;
    });
  }, []);

  const updateAnnotation = useCallback((id, updates) => {
    setAnnotations(prev => {
      const newAnnotations = prev.map(ann => 
        ann.id === id ? { ...ann, ...updates } : ann
      );
      setUndoStack(prevStack => [...prevStack, prev]);
      setRedoStack([]);
      return newAnnotations;
    });
  }, []);

  const clearAnnotations = useCallback(() => {
    setUndoStack(prevStack => [...prevStack, annotations]);
    setRedoStack([]);
    setAnnotations([]);
  }, [annotations]);

  const undo = useCallback(() => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [...prev, annotations]);
      setAnnotations(previousState);
      setUndoStack(prev => prev.slice(0, -1));
    }
  }, [undoStack, annotations]);

  const redo = useCallback(() => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack(prev => [...prev, annotations]);
      setAnnotations(nextState);
      setRedoStack(prev => prev.slice(0, -1));
    }
  }, [redoStack, annotations]);

  const handleAnnotationClick = useCallback((id) => {
    setSelectedAnnotationId(id);
  }, []);

  const handleAnnotationDoubleClick = useCallback((id) => {
    const annotation = annotations.find(ann => ann.id === id);
    if (annotation && annotation.type === ANNOTATION_TYPES.TEXT) {
      const newText = prompt('Edit text:', annotation.properties.text);
      if (newText !== null) {
        updateAnnotation(id, {
          properties: { ...annotation.properties, text: newText }
        });
      }
    }
  }, [annotations, updateAnnotation]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedAnnotationId) {
          removeAnnotation(selectedAnnotationId);
          setSelectedAnnotationId(null);
        }
      } else if (event.key === 'Escape') {
        setSelectedAnnotationId(null);
        setActiveTool('select');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnnotationId, removeAnnotation]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    
    // Set up SVG
    svg.attr('width', width)
       .attr('height', height)
       .style('background', 'white');

    // Clear existing content
    svg.selectAll('*').remove();

    // Draw grid and axes
    drawGrid();
    drawAxes();
    
    // Add tooltip
    addTooltip();
    
    // Add annotation event handlers
    svg.on('mousedown', handleMouseDown)
       .on('mousemove', handleMouseMove)
       .on('mouseup', handleMouseUp);
    
    // Update zoom
    updateZoom();

  }, [drawGrid, drawAxes, addTooltip, updateZoom, handleMouseDown, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    // Clear and redraw functions when equations change
    clearFunctions();
    equations.forEach(plotFunction);
  }, [equations, plotFunction, clearFunctions]);

  useEffect(() => {
    // Redraw everything when view state changes
    if (!svgRef.current) return;
    
    // Update scales
    xScale.domain([viewState.xMin, viewState.xMax]);
    yScale.domain([viewState.yMin, viewState.yMax]);
    
    // Redraw grid and axes
    drawGrid();
    drawAxes();
    
    // Redraw functions
    clearFunctions();
    equations.forEach(plotFunction);
    
  }, [viewState, equations, xScale, yScale, drawGrid, drawAxes, plotFunction, clearFunctions]);

  return (
    <div className="graph-container" ref={containerRef}>
      <div className="graph-header">
        <button className="reset-button" onClick={onResetView}>
          Reset View
        </button>
        <AnnotationToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          onClearAnnotations={clearAnnotations}
          onUndo={undo}
          onRedo={redo}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
        />
      </div>
      <div className="graph-canvas-container">
        <svg ref={svgRef} className="graph-canvas">
          <AnnotationLayer
            annotations={annotations}
            viewState={viewState}
            selectedAnnotationId={selectedAnnotationId}
            onAnnotationClick={handleAnnotationClick}
            onAnnotationDoubleClick={handleAnnotationDoubleClick}
          />
        </svg>
      </div>
    </div>
  );
};

export default GraphCanvas;

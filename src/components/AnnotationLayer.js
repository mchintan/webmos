import React from 'react';
import { 
  ANNOTATION_TYPES, 
  graphToScreenCoords, 
  generateArrowPath, 
  calculateDistance 
} from '../utils/annotationUtils';
import './AnnotationLayer.css';

const AnnotationLayer = ({ 
  annotations, 
  viewState, 
  selectedAnnotationId, 
  onAnnotationClick,
  onAnnotationDoubleClick 
}) => {
  const renderTextAnnotation = (annotation) => {
    const screenCoords = graphToScreenCoords(annotation.coordinates.x, annotation.coordinates.y, viewState);
    const isSelected = selectedAnnotationId === annotation.id;
    
    return (
      <g key={annotation.id} className={`annotation text-annotation ${isSelected ? 'selected' : ''}`}>
        <text
          x={screenCoords.x}
          y={screenCoords.y}
          fill={annotation.properties.color}
          fontSize={annotation.properties.fontSize}
          fontFamily={annotation.properties.fontFamily}
          textAnchor={annotation.properties.textAnchor}
          dominantBaseline="middle"
          className="annotation-text"
          onClick={() => onAnnotationClick(annotation.id)}
          onDoubleClick={() => onAnnotationDoubleClick(annotation.id)}
        >
          {annotation.properties.text}
        </text>
        {isSelected && (
          <rect
            x={screenCoords.x - 5}
            y={screenCoords.y - annotation.properties.fontSize / 2 - 5}
            width={annotation.properties.text.length * annotation.properties.fontSize * 0.6 + 10}
            height={annotation.properties.fontSize + 10}
            fill="none"
            stroke="#007bff"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="selection-box"
          />
        )}
      </g>
    );
  };

  const renderArrowAnnotation = (annotation) => {
    const startScreen = graphToScreenCoords(annotation.coordinates.start.x, annotation.coordinates.start.y, viewState);
    const endScreen = graphToScreenCoords(annotation.coordinates.end.x, annotation.coordinates.end.y, viewState);
    const isSelected = selectedAnnotationId === annotation.id;
    
    const arrowPath = generateArrowPath(
      startScreen, 
      endScreen, 
      annotation.properties.arrowSize, 
      annotation.properties.arrowAngle
    );
    
    return (
      <g key={annotation.id} className={`annotation arrow-annotation ${isSelected ? 'selected' : ''}`}>
        <path
          d={arrowPath.line}
          stroke={annotation.properties.color}
          strokeWidth={annotation.properties.strokeWidth}
          fill="none"
          className="arrow-line"
          onClick={() => onAnnotationClick(annotation.id)}
          onDoubleClick={() => onAnnotationDoubleClick(annotation.id)}
        />
        <path
          d={arrowPath.arrow}
          stroke={annotation.properties.color}
          strokeWidth={annotation.properties.strokeWidth}
          fill="none"
          className="arrow-head"
        />
        {isSelected && (
          <>
            <circle
              cx={startScreen.x}
              cy={startScreen.y}
              r="4"
              fill="#007bff"
              className="control-point"
            />
            <circle
              cx={endScreen.x}
              cy={endScreen.y}
              r="4"
              fill="#007bff"
              className="control-point"
            />
          </>
        )}
      </g>
    );
  };

  const renderCircleAnnotation = (annotation) => {
    const centerScreen = graphToScreenCoords(annotation.coordinates.center.x, annotation.coordinates.center.y, viewState);
    const radiusScreen = annotation.coordinates.radius * viewState.scale;
    const isSelected = selectedAnnotationId === annotation.id;
    
    return (
      <g key={annotation.id} className={`annotation circle-annotation ${isSelected ? 'selected' : ''}`}>
        <circle
          cx={centerScreen.x}
          cy={centerScreen.y}
          r={radiusScreen}
          fill={annotation.properties.fill}
          stroke={annotation.properties.color}
          strokeWidth={annotation.properties.strokeWidth}
          strokeDasharray={annotation.properties.strokeDasharray}
          className="annotation-circle"
          onClick={() => onAnnotationClick(annotation.id)}
          onDoubleClick={() => onAnnotationDoubleClick(annotation.id)}
        />
        {isSelected && (
          <circle
            cx={centerScreen.x}
            cy={centerScreen.y}
            r={radiusScreen + 5}
            fill="none"
            stroke="#007bff"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="selection-box"
          />
        )}
      </g>
    );
  };

  const renderRectangleAnnotation = (annotation) => {
    const screenCoords = graphToScreenCoords(annotation.coordinates.x, annotation.coordinates.y, viewState);
    const widthScreen = annotation.coordinates.width * viewState.scale;
    const heightScreen = annotation.coordinates.height * viewState.scale;
    const isSelected = selectedAnnotationId === annotation.id;
    
    return (
      <g key={annotation.id} className={`annotation rectangle-annotation ${isSelected ? 'selected' : ''}`}>
        <rect
          x={screenCoords.x}
          y={screenCoords.y}
          width={widthScreen}
          height={heightScreen}
          fill={annotation.properties.fill}
          stroke={annotation.properties.color}
          strokeWidth={annotation.properties.strokeWidth}
          strokeDasharray={annotation.properties.strokeDasharray}
          className="annotation-rectangle"
          onClick={() => onAnnotationClick(annotation.id)}
          onDoubleClick={() => onAnnotationDoubleClick(annotation.id)}
        />
        {isSelected && (
          <rect
            x={screenCoords.x - 5}
            y={screenCoords.y - 5}
            width={widthScreen + 10}
            height={heightScreen + 10}
            fill="none"
            stroke="#007bff"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="selection-box"
          />
        )}
      </g>
    );
  };

  const renderMeasureAnnotation = (annotation) => {
    const startScreen = graphToScreenCoords(annotation.coordinates.start.x, annotation.coordinates.start.y, viewState);
    const endScreen = graphToScreenCoords(annotation.coordinates.end.x, annotation.coordinates.end.y, viewState);
    const isSelected = selectedAnnotationId === annotation.id;
    
    const distance = calculateDistance(annotation.coordinates.start, annotation.coordinates.end);
    const formattedDistance = distance.toFixed(annotation.properties.precision);
    const midPoint = {
      x: (startScreen.x + endScreen.x) / 2,
      y: (startScreen.y + endScreen.y) / 2
    };
    
    return (
      <g key={annotation.id} className={`annotation measure-annotation ${isSelected ? 'selected' : ''}`}>
        <line
          x1={startScreen.x}
          y1={startScreen.y}
          x2={endScreen.x}
          y2={endScreen.y}
          stroke={annotation.properties.color}
          strokeWidth={annotation.properties.strokeWidth}
          strokeDasharray="5,5"
          className="measure-line"
          onClick={() => onAnnotationClick(annotation.id)}
          onDoubleClick={() => onAnnotationDoubleClick(annotation.id)}
        />
        {annotation.properties.showDistance && (
          <text
            x={midPoint.x}
            y={midPoint.y - 10}
            fill={annotation.properties.color}
            fontSize={annotation.properties.fontSize}
            textAnchor="middle"
            dominantBaseline="middle"
            className="measure-text"
          >
            {formattedDistance} {annotation.properties.unit}
          </text>
        )}
        <circle
          cx={startScreen.x}
          cy={startScreen.y}
          r="3"
          fill={annotation.properties.color}
          className="measure-point"
        />
        <circle
          cx={endScreen.x}
          cy={endScreen.y}
          r="3"
          fill={annotation.properties.color}
          className="measure-point"
        />
        {isSelected && (
          <>
            <circle
              cx={startScreen.x}
              cy={startScreen.y}
              r="6"
              fill="none"
              stroke="#007bff"
              strokeWidth="2"
              className="control-point"
            />
            <circle
              cx={endScreen.x}
              cy={endScreen.y}
              r="6"
              fill="none"
              stroke="#007bff"
              strokeWidth="2"
              className="control-point"
            />
          </>
        )}
      </g>
    );
  };

  const renderAnnotation = (annotation) => {
    switch (annotation.type) {
      case ANNOTATION_TYPES.TEXT:
        return renderTextAnnotation(annotation);
      case ANNOTATION_TYPES.ARROW:
        return renderArrowAnnotation(annotation);
      case ANNOTATION_TYPES.CIRCLE:
        return renderCircleAnnotation(annotation);
      case ANNOTATION_TYPES.RECTANGLE:
        return renderRectangleAnnotation(annotation);
      case ANNOTATION_TYPES.MEASURE:
        return renderMeasureAnnotation(annotation);
      default:
        return null;
    }
  };

  return (
    <g className="annotation-layer">
      {annotations.map(renderAnnotation)}
    </g>
  );
};

export default AnnotationLayer;

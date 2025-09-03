// Annotation data structures and utilities

export const ANNOTATION_TYPES = {
  TEXT: 'text',
  ARROW: 'arrow',
  CIRCLE: 'circle',
  RECTANGLE: 'rectangle',
  MEASURE: 'measure'
};

// Create new annotation objects
export const createAnnotation = (type, coordinates, properties = {}) => {
  const baseAnnotation = {
    id: Date.now() + Math.random(),
    type,
    coordinates,
    properties: {
      color: '#ff0000',
      strokeWidth: 2,
      fontSize: 14,
      ...properties
    },
    createdAt: new Date().toISOString()
  };

  switch (type) {
    case ANNOTATION_TYPES.TEXT:
      return {
        ...baseAnnotation,
        properties: {
          ...baseAnnotation.properties,
          text: properties.text || 'Label',
          fontFamily: 'Arial, sans-serif',
          textAnchor: 'start'
        }
      };

    case ANNOTATION_TYPES.ARROW:
      return {
        ...baseAnnotation,
        coordinates: {
          start: coordinates.start,
          end: coordinates.end
        },
        properties: {
          ...baseAnnotation.properties,
          arrowSize: 8,
          arrowAngle: 30
        }
      };

    case ANNOTATION_TYPES.CIRCLE:
      return {
        ...baseAnnotation,
        coordinates: {
          center: coordinates.center,
          radius: coordinates.radius || 20
        },
        properties: {
          ...baseAnnotation.properties,
          fill: 'none',
          strokeDasharray: 'none'
        }
      };

    case ANNOTATION_TYPES.RECTANGLE:
      return {
        ...baseAnnotation,
        coordinates: {
          x: coordinates.x,
          y: coordinates.y,
          width: coordinates.width,
          height: coordinates.height
        },
        properties: {
          ...baseAnnotation.properties,
          fill: 'none',
          strokeDasharray: 'none'
        }
      };

    case ANNOTATION_TYPES.MEASURE:
      return {
        ...baseAnnotation,
        coordinates: {
          start: coordinates.start,
          end: coordinates.end
        },
        properties: {
          ...baseAnnotation.properties,
          showDistance: true,
          unit: 'units',
          precision: 2
        }
      };

    default:
      return baseAnnotation;
  }
};

// Convert screen coordinates to graph coordinates
export const screenToGraphCoords = (screenX, screenY, viewState) => {
  const { xMin, xMax, yMin, yMax, scale, translateX, translateY } = viewState;
  const graphWidth = xMax - xMin;
  const graphHeight = yMax - yMin;
  
  // Account for margins (40px on each side)
  const margin = 40;
  const effectiveWidth = 800 - 2 * margin;
  const effectiveHeight = 600 - 2 * margin;
  
  // Convert screen coordinates to graph coordinates
  const graphX = xMin + (screenX - margin - translateX) / scale * (graphWidth / effectiveWidth);
  const graphY = yMax - (screenY - margin - translateY) / scale * (graphHeight / effectiveHeight);
  
  return { x: graphX, y: graphY };
};

// Convert graph coordinates to screen coordinates
export const graphToScreenCoords = (graphX, graphY, viewState) => {
  const { xMin, xMax, yMin, yMax, scale, translateX, translateY } = viewState;
  const graphWidth = xMax - xMin;
  const graphHeight = yMax - yMin;
  
  // Account for margins (40px on each side)
  const margin = 40;
  const effectiveWidth = 800 - 2 * margin;
  const effectiveHeight = 600 - 2 * margin;
  
  // Convert graph coordinates to screen coordinates
  const screenX = margin + translateX + (graphX - xMin) * (effectiveWidth / graphWidth) * scale;
  const screenY = margin + translateY + (yMax - graphY) * (effectiveHeight / graphHeight) * scale;
  
  return { x: screenX, y: screenY };
};

// Calculate distance between two points
export const calculateDistance = (point1, point2) => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Calculate angle between two points
export const calculateAngle = (start, end) => {
  return Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
};

// Generate arrow path
export const generateArrowPath = (start, end, arrowSize = 8, arrowAngle = 30) => {
  const angle = calculateAngle(start, end);
  const rad = (angle * Math.PI) / 180;
  
  const arrowPoint1 = {
    x: end.x - arrowSize * Math.cos(rad - arrowAngle * Math.PI / 180),
    y: end.y - arrowSize * Math.sin(rad - arrowAngle * Math.PI / 180)
  };
  
  const arrowPoint2 = {
    x: end.x - arrowSize * Math.cos(rad + arrowAngle * Math.PI / 180),
    y: end.y - arrowSize * Math.sin(rad + arrowAngle * Math.PI / 180)
  };
  
  return {
    line: `M ${start.x} ${start.y} L ${end.x} ${end.y}`,
    arrow: `M ${end.x} ${end.y} L ${arrowPoint1.x} ${arrowPoint1.y} M ${end.x} ${end.y} L ${arrowPoint2.x} ${arrowPoint2.y}`
  };
};

// Validate annotation data
export const validateAnnotation = (annotation) => {
  if (!annotation || !annotation.type || !annotation.coordinates) {
    return false;
  }
  
  switch (annotation.type) {
    case ANNOTATION_TYPES.TEXT:
      return annotation.coordinates.x !== undefined && 
             annotation.coordinates.y !== undefined &&
             annotation.properties.text;
             
    case ANNOTATION_TYPES.ARROW:
      return annotation.coordinates.start && 
             annotation.coordinates.end &&
             annotation.coordinates.start.x !== undefined &&
             annotation.coordinates.start.y !== undefined &&
             annotation.coordinates.end.x !== undefined &&
             annotation.coordinates.end.y !== undefined;
             
    case ANNOTATION_TYPES.CIRCLE:
      return annotation.coordinates.center &&
             annotation.coordinates.center.x !== undefined &&
             annotation.coordinates.center.y !== undefined &&
             annotation.coordinates.radius > 0;
             
    case ANNOTATION_TYPES.RECTANGLE:
      return annotation.coordinates.x !== undefined &&
             annotation.coordinates.y !== undefined &&
             annotation.coordinates.width > 0 &&
             annotation.coordinates.height > 0;
             
    case ANNOTATION_TYPES.MEASURE:
      return annotation.coordinates.start &&
             annotation.coordinates.end &&
             annotation.coordinates.start.x !== undefined &&
             annotation.coordinates.start.y !== undefined &&
             annotation.coordinates.end.x !== undefined &&
             annotation.coordinates.end.y !== undefined;
             
    default:
      return false;
  }
};

// Clone annotation for undo/redo
export const cloneAnnotation = (annotation) => {
  return JSON.parse(JSON.stringify(annotation));
};

// Check if point is inside annotation (for selection)
export const isPointInAnnotation = (point, annotation, viewState) => {
  const screenPoint = graphToScreenCoords(point.x, point.y, viewState);
  
  switch (annotation.type) {
    case ANNOTATION_TYPES.TEXT:
      const textScreen = graphToScreenCoords(annotation.coordinates.x, annotation.coordinates.y, viewState);
      const tolerance = 20;
      return Math.abs(screenPoint.x - textScreen.x) < tolerance && 
             Math.abs(screenPoint.y - textScreen.y) < tolerance;
             
    case ANNOTATION_TYPES.CIRCLE:
      const centerScreen = graphToScreenCoords(annotation.coordinates.center.x, annotation.coordinates.center.y, viewState);
      const radiusScreen = annotation.coordinates.radius * viewState.scale;
      const distance = calculateDistance(screenPoint, centerScreen);
      return distance <= radiusScreen;
      
    case ANNOTATION_TYPES.RECTANGLE:
      const rectScreen = graphToScreenCoords(annotation.coordinates.x, annotation.coordinates.y, viewState);
      const widthScreen = annotation.coordinates.width * viewState.scale;
      const heightScreen = annotation.coordinates.height * viewState.scale;
      return screenPoint.x >= rectScreen.x && 
             screenPoint.x <= rectScreen.x + widthScreen &&
             screenPoint.y >= rectScreen.y && 
             screenPoint.y <= rectScreen.y + heightScreen;
             
    default:
      return false;
  }
};

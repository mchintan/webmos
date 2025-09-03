import {
  ANNOTATION_TYPES,
  createAnnotation,
  screenToGraphCoords,
  graphToScreenCoords,
  calculateDistance,
  calculateAngle,
  generateArrowPath,
  validateAnnotation,
  cloneAnnotation,
  isPointInAnnotation
} from '../utils/annotationUtils';

describe('Annotation Utils', () => {
  const mockViewState = {
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
    scale: 1,
    translateX: 0,
    translateY: 0
  };

  describe('ANNOTATION_TYPES', () => {
    test('should have all required annotation types', () => {
      expect(ANNOTATION_TYPES.TEXT).toBe('text');
      expect(ANNOTATION_TYPES.ARROW).toBe('arrow');
      expect(ANNOTATION_TYPES.CIRCLE).toBe('circle');
      expect(ANNOTATION_TYPES.RECTANGLE).toBe('rectangle');
      expect(ANNOTATION_TYPES.MEASURE).toBe('measure');
    });
  });

  describe('createAnnotation', () => {
    test('should create text annotation', () => {
      const annotation = createAnnotation(ANNOTATION_TYPES.TEXT, { x: 0, y: 0 }, { text: 'Test' });
      
      expect(annotation.type).toBe(ANNOTATION_TYPES.TEXT);
      expect(annotation.coordinates).toEqual({ x: 0, y: 0 });
      expect(annotation.properties.text).toBe('Test');
      expect(annotation.properties.color).toBe('#ff0000');
      expect(annotation.id).toBeDefined();
      expect(annotation.createdAt).toBeDefined();
    });

    test('should create arrow annotation', () => {
      const annotation = createAnnotation(ANNOTATION_TYPES.ARROW, {
        start: { x: 0, y: 0 },
        end: { x: 5, y: 5 }
      });
      
      expect(annotation.type).toBe(ANNOTATION_TYPES.ARROW);
      expect(annotation.coordinates.start).toEqual({ x: 0, y: 0 });
      expect(annotation.coordinates.end).toEqual({ x: 5, y: 5 });
      expect(annotation.properties.arrowSize).toBe(8);
      expect(annotation.properties.arrowAngle).toBe(30);
    });

    test('should create circle annotation', () => {
      const annotation = createAnnotation(ANNOTATION_TYPES.CIRCLE, {
        center: { x: 0, y: 0 },
        radius: 10
      });
      
      expect(annotation.type).toBe(ANNOTATION_TYPES.CIRCLE);
      expect(annotation.coordinates.center).toEqual({ x: 0, y: 0 });
      expect(annotation.coordinates.radius).toBe(10);
      expect(annotation.properties.fill).toBe('none');
    });

    test('should create rectangle annotation', () => {
      const annotation = createAnnotation(ANNOTATION_TYPES.RECTANGLE, {
        x: 0,
        y: 0,
        width: 10,
        height: 5
      });
      
      expect(annotation.type).toBe(ANNOTATION_TYPES.RECTANGLE);
      expect(annotation.coordinates.x).toBe(0);
      expect(annotation.coordinates.y).toBe(0);
      expect(annotation.coordinates.width).toBe(10);
      expect(annotation.coordinates.height).toBe(5);
    });

    test('should create measure annotation', () => {
      const annotation = createAnnotation(ANNOTATION_TYPES.MEASURE, {
        start: { x: 0, y: 0 },
        end: { x: 3, y: 4 }
      });
      
      expect(annotation.type).toBe(ANNOTATION_TYPES.MEASURE);
      expect(annotation.coordinates.start).toEqual({ x: 0, y: 0 });
      expect(annotation.coordinates.end).toEqual({ x: 3, y: 4 });
      expect(annotation.properties.showDistance).toBe(true);
      expect(annotation.properties.unit).toBe('units');
    });
  });

  describe('Coordinate Transformations', () => {
    test('should convert screen to graph coordinates correctly', () => {
      // Test center point (400, 300) should map to (0, 0) in graph coordinates
      const screenCoords = { x: 440, y: 340 }; // 400 + 40 margin, 300 + 40 margin
      const graphCoords = screenToGraphCoords(screenCoords.x, screenCoords.y, mockViewState);
      
      expect(graphCoords.x).toBeCloseTo(0, 1);
      expect(graphCoords.y).toBeCloseTo(0, 1);
    });

    test('should convert graph to screen coordinates correctly', () => {
      // Test graph point (0, 0) should map to center of screen
      const graphCoords = { x: 0, y: 0 };
      const screenCoords = graphToScreenCoords(graphCoords.x, graphCoords.y, mockViewState);
      
      expect(screenCoords.x).toBeCloseTo(440, 1); // 400 + 40 margin
      expect(screenCoords.y).toBeCloseTo(340, 1); // 300 + 40 margin
    });

    test('should handle zoom transformations', () => {
      const zoomedViewState = { ...mockViewState, scale: 2 };
      
      const screenCoords = { x: 440, y: 340 };
      const graphCoords = screenToGraphCoords(screenCoords.x, screenCoords.y, zoomedViewState);
      const backToScreen = graphToScreenCoords(graphCoords.x, graphCoords.y, zoomedViewState);
      
      expect(backToScreen.x).toBeCloseTo(screenCoords.x, 1);
      expect(backToScreen.y).toBeCloseTo(screenCoords.y, 1);
    });

    test('should handle pan transformations', () => {
      const pannedViewState = { ...mockViewState, translateX: 100, translateY: 50 };
      
      const screenCoords = { x: 440, y: 340 };
      const graphCoords = screenToGraphCoords(screenCoords.x, screenCoords.y, pannedViewState);
      const backToScreen = graphToScreenCoords(graphCoords.x, graphCoords.y, pannedViewState);
      
      expect(backToScreen.x).toBeCloseTo(screenCoords.x, 1);
      expect(backToScreen.y).toBeCloseTo(screenCoords.y, 1);
    });
  });

  describe('calculateDistance', () => {
    test('should calculate distance between two points', () => {
      expect(calculateDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
      expect(calculateDistance({ x: 1, y: 1 }, { x: 4, y: 5 })).toBe(5);
      expect(calculateDistance({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0);
    });

    test('should handle negative coordinates', () => {
      expect(calculateDistance({ x: -3, y: -4 }, { x: 0, y: 0 })).toBe(5);
      expect(calculateDistance({ x: -1, y: -1 }, { x: 1, y: 1 })).toBeCloseTo(2.828, 3);
    });
  });

  describe('calculateAngle', () => {
    test('should calculate angle between two points', () => {
      expect(calculateAngle({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(0);
      expect(calculateAngle({ x: 0, y: 0 }, { x: 0, y: 1 })).toBe(90);
      expect(calculateAngle({ x: 0, y: 0 }, { x: -1, y: 0 })).toBe(180);
      expect(calculateAngle({ x: 0, y: 0 }, { x: 0, y: -1 })).toBe(-90);
    });

    test('should handle diagonal angles', () => {
      expect(calculateAngle({ x: 0, y: 0 }, { x: 1, y: 1 })).toBe(45);
      expect(calculateAngle({ x: 0, y: 0 }, { x: -1, y: 1 })).toBe(135);
    });
  });

  describe('generateArrowPath', () => {
    test('should generate arrow path for horizontal arrow', () => {
      const path = generateArrowPath({ x: 0, y: 0 }, { x: 10, y: 0 });
      
      expect(path.line).toBe('M 0 0 L 10 0');
      expect(path.arrow).toContain('M 10 0');
    });

    test('should generate arrow path for vertical arrow', () => {
      const path = generateArrowPath({ x: 0, y: 0 }, { x: 0, y: 10 });
      
      expect(path.line).toBe('M 0 0 L 0 10');
      expect(path.arrow).toContain('M 0 10');
    });

    test('should generate arrow path for diagonal arrow', () => {
      const path = generateArrowPath({ x: 0, y: 0 }, { x: 10, y: 10 });
      
      expect(path.line).toBe('M 0 0 L 10 10');
      expect(path.arrow).toContain('M 10 10');
    });
  });

  describe('validateAnnotation', () => {
    test('should validate text annotation', () => {
      const validText = createAnnotation(ANNOTATION_TYPES.TEXT, { x: 0, y: 0 }, { text: 'Test' });
      const invalidText = { type: ANNOTATION_TYPES.TEXT, coordinates: {} };
      
      expect(validateAnnotation(validText)).toBe(true);
      expect(validateAnnotation(invalidText)).toBe(false);
    });

    test('should validate arrow annotation', () => {
      const validArrow = createAnnotation(ANNOTATION_TYPES.ARROW, {
        start: { x: 0, y: 0 },
        end: { x: 5, y: 5 }
      });
      const invalidArrow = { type: ANNOTATION_TYPES.ARROW, coordinates: {} };
      
      expect(validateAnnotation(validArrow)).toBe(true);
      expect(validateAnnotation(invalidArrow)).toBe(false);
    });

    test('should validate circle annotation', () => {
      const validCircle = createAnnotation(ANNOTATION_TYPES.CIRCLE, {
        center: { x: 0, y: 0 },
        radius: 10
      });
      const invalidCircle = { type: ANNOTATION_TYPES.CIRCLE, coordinates: { center: { x: 0, y: 0 } } };
      
      expect(validateAnnotation(validCircle)).toBe(true);
      expect(validateAnnotation(invalidCircle)).toBe(false);
    });

    test('should validate rectangle annotation', () => {
      const validRect = createAnnotation(ANNOTATION_TYPES.RECTANGLE, {
        x: 0,
        y: 0,
        width: 10,
        height: 5
      });
      const invalidRect = { type: ANNOTATION_TYPES.RECTANGLE, coordinates: { x: 0, y: 0 } };
      
      expect(validateAnnotation(validRect)).toBe(true);
      expect(validateAnnotation(invalidRect)).toBe(false);
    });

    test('should reject invalid annotation types', () => {
      const invalid = { type: 'invalid', coordinates: {} };
      expect(validateAnnotation(invalid)).toBe(false);
    });
  });

  describe('cloneAnnotation', () => {
    test('should create deep copy of annotation', () => {
      const original = createAnnotation(ANNOTATION_TYPES.TEXT, { x: 0, y: 0 }, { text: 'Test' });
      const cloned = cloneAnnotation(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.properties).not.toBe(original.properties);
    });
  });

  describe('isPointInAnnotation', () => {
    test('should detect point in text annotation', () => {
      const annotation = createAnnotation(ANNOTATION_TYPES.TEXT, { x: 0, y: 0 }, { text: 'Test' });
      const point = { x: 0, y: 0 };
      
      expect(isPointInAnnotation(point, annotation, mockViewState)).toBe(true);
    });

    test('should detect point in circle annotation', () => {
      const annotation = createAnnotation(ANNOTATION_TYPES.CIRCLE, {
        center: { x: 0, y: 0 },
        radius: 5
      });
      const pointInside = { x: 2, y: 2 };
      const pointOutside = { x: 10, y: 10 };
      
      expect(isPointInAnnotation(pointInside, annotation, mockViewState)).toBe(true);
      expect(isPointInAnnotation(pointOutside, annotation, mockViewState)).toBe(false);
    });

    test('should detect point in rectangle annotation', () => {
      const annotation = createAnnotation(ANNOTATION_TYPES.RECTANGLE, {
        x: 0,
        y: 0,
        width: 10,
        height: 5
      });
      const pointInside = { x: 5, y: 2 };
      const pointOutside = { x: 15, y: 10 };
      
      expect(isPointInAnnotation(pointInside, annotation, mockViewState)).toBe(true);
      expect(isPointInAnnotation(pointOutside, annotation, mockViewState)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero coordinates', () => {
      const annotation = createAnnotation(ANNOTATION_TYPES.TEXT, { x: 0, y: 0 }, { text: 'Test' });
      expect(validateAnnotation(annotation)).toBe(true);
    });

    test('should handle very large coordinates', () => {
      const annotation = createAnnotation(ANNOTATION_TYPES.TEXT, { x: 1000000, y: 1000000 }, { text: 'Test' });
      expect(validateAnnotation(annotation)).toBe(true);
    });

    test('should handle negative coordinates', () => {
      const annotation = createAnnotation(ANNOTATION_TYPES.TEXT, { x: -100, y: -100 }, { text: 'Test' });
      expect(validateAnnotation(annotation)).toBe(true);
    });
  });
});


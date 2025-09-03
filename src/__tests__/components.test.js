import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import VoiceInput from '../components/VoiceInput';
import VideoUpload from '../components/VideoUpload';
import AnnotationToolbar from '../components/AnnotationToolbar';
import { ANNOTATION_TYPES, createAnnotation } from '../utils/annotationUtils';

// Mock the Web Speech API
const mockSpeechRecognition = {
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  start: jest.fn(),
  stop: jest.fn(),
  onresult: jest.fn(),
  onend: jest.fn(),
  onerror: jest.fn()
};

global.SpeechRecognition = jest.fn(() => mockSpeechRecognition);
global.webkitSpeechRecognition = jest.fn(() => mockSpeechRecognition);

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: () => ({
    getRootProps: () => ({}),
    getInputProps: () => ({}),
    isDragActive: false
  })
}));

describe('Component Integration Tests', () => {
  describe('App Component', () => {
    test('should render the main application', () => {
      render(<App />);
      
      expect(screen.getByText('Math Graphing System')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter equation/)).toBeInTheDocument();
      expect(screen.getByText('Add Equation')).toBeInTheDocument();
    });

    test('should add equations and display them', () => {
      render(<App />);
      
      const input = screen.getByPlaceholderText(/Enter equation/);
      const addButton = screen.getByText('Add Equation');
      
      fireEvent.change(input, { target: { value: 'y = x^2' } });
      fireEvent.click(addButton);
      
      expect(screen.getByText('y = x^2')).toBeInTheDocument();
    });

    test('should handle multiple equations', () => {
      render(<App />);
      
      const input = screen.getByPlaceholderText(/Enter equation/);
      const addButton = screen.getByText('Add Equation');
      
      const equations = ['y = x^2', 'y = sin(x)', 'y = cos(x)'];
      
      equations.forEach(eq => {
        fireEvent.change(input, { target: { value: eq } });
        fireEvent.click(addButton);
      });
      
      equations.forEach(eq => {
        expect(screen.getByText(eq)).toBeInTheDocument();
      });
    });

    test('should clear all equations', () => {
      render(<App />);
      
      const input = screen.getByPlaceholderText(/Enter equation/);
      const addButton = screen.getByText('Add Equation');
      const clearButton = screen.getByText('Clear All Equations');
      
      fireEvent.change(input, { target: { value: 'y = x^2' } });
      fireEvent.click(addButton);
      
      expect(screen.getByText('y = x^2')).toBeInTheDocument();
      
      fireEvent.click(clearButton);
      
      expect(screen.queryByText('y = x^2')).not.toBeInTheDocument();
    });
  });

  describe('VoiceInput Component', () => {
    test('should render voice input interface', () => {
      const mockOnVoiceInput = jest.fn();
      render(<VoiceInput onVoiceInput={mockOnVoiceInput} />);
      
      expect(screen.getByTitle(/Start voice input/)).toBeInTheDocument();
      expect(screen.getByText(/Voice Tips/)).toBeInTheDocument();
    });

    test('should show voice tips', () => {
      const mockOnVoiceInput = jest.fn();
      render(<VoiceInput onVoiceInput={mockOnVoiceInput} />);
      
      expect(screen.getByText(/Say "y equals x squared"/)).toBeInTheDocument();
      expect(screen.getByText(/Say "sine of x"/)).toBeInTheDocument();
      expect(screen.getByText(/Say "circle radius three"/)).toBeInTheDocument();
    });

    test('should handle unsupported browser', () => {
      // Mock unsupported browser
      global.SpeechRecognition = undefined;
      global.webkitSpeechRecognition = undefined;
      
      const mockOnVoiceInput = jest.fn();
      render(<VoiceInput onVoiceInput={mockOnVoiceInput} />);
      
      expect(screen.getByText(/Voice input is not supported/)).toBeInTheDocument();
    });
  });

  describe('VideoUpload Component', () => {
    test('should render video upload interface', () => {
      const mockOnVideoExtract = jest.fn();
      render(<VideoUpload onVideoExtract={mockOnVideoExtract} />);
      
      expect(screen.getByText('Video Upload & Analysis')).toBeInTheDocument();
      expect(screen.getByText(/Drag & drop a video file/)).toBeInTheDocument();
    });

    test('should show video tips', () => {
      const mockOnVideoExtract = jest.fn();
      render(<VideoUpload onVideoExtract={mockOnVideoExtract} />);
      
      expect(screen.getByText(/Upload videos containing mathematical equations/)).toBeInTheDocument();
      expect(screen.getByText(/Supported formats: MP4, AVI, MOV/)).toBeInTheDocument();
    });
  });

  describe('AnnotationToolbar Component', () => {
    const mockProps = {
      activeTool: 'select',
      onToolChange: jest.fn(),
      onClearAnnotations: jest.fn(),
      onUndo: jest.fn(),
      onRedo: jest.fn(),
      canUndo: true,
      canRedo: false
    };

    test('should render all annotation tools', () => {
      render(<AnnotationToolbar {...mockProps} />);
      
      expect(screen.getByText('Select')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
      expect(screen.getByText('Arrow')).toBeInTheDocument();
      expect(screen.getByText('Circle')).toBeInTheDocument();
      expect(screen.getByText('Rectangle')).toBeInTheDocument();
      expect(screen.getByText('Measure')).toBeInTheDocument();
    });

    test('should render action buttons', () => {
      render(<AnnotationToolbar {...mockProps} />);
      
      expect(screen.getByText('Undo')).toBeInTheDocument();
      expect(screen.getByText('Redo')).toBeInTheDocument();
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });

    test('should handle tool selection', () => {
      render(<AnnotationToolbar {...mockProps} />);
      
      const textButton = screen.getByText('Text');
      fireEvent.click(textButton);
      
      expect(mockProps.onToolChange).toHaveBeenCalledWith('text');
    });

    test('should handle action buttons', () => {
      render(<AnnotationToolbar {...mockProps} />);
      
      const undoButton = screen.getByText('Undo');
      const redoButton = screen.getByText('Redo');
      const clearButton = screen.getByText('Clear All');
      
      fireEvent.click(undoButton);
      fireEvent.click(redoButton);
      fireEvent.click(clearButton);
      
      expect(mockProps.onUndo).toHaveBeenCalled();
      expect(mockProps.onRedo).toHaveBeenCalled();
      expect(mockProps.onClearAnnotations).toHaveBeenCalled();
    });

    test('should disable buttons when appropriate', () => {
      const propsWithDisabledRedo = { ...mockProps, canRedo: false };
      render(<AnnotationToolbar {...propsWithDisabledRedo} />);
      
      const redoButton = screen.getByText('Redo');
      expect(redoButton).toBeDisabled();
    });
  });
});

describe('Complex Mathematical Scenarios', () => {
  test('should handle complex polynomial equations', () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText(/Enter equation/);
    const addButton = screen.getByText('Add Equation');
    
    const complexEquations = [
      'y = x^3 - 2x^2 + x - 1',
      'y = x^4 + 3x^2 - 5',
      'y = (x-1)(x-2)(x-3)'
    ];
    
    complexEquations.forEach(eq => {
      fireEvent.change(input, { target: { value: eq } });
      fireEvent.click(addButton);
    });
    
    complexEquations.forEach(eq => {
      expect(screen.getByText(eq)).toBeInTheDocument();
    });
  });

  test('should handle transcendental functions', () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText(/Enter equation/);
    const addButton = screen.getByText('Add Equation');
    
    const transcendentalEquations = [
      'y = e^x',
      'y = ln(x)',
      'y = sin(x)',
      'y = cos(x)',
      'y = tan(x)'
    ];
    
    transcendentalEquations.forEach(eq => {
      fireEvent.change(input, { target: { value: eq } });
      fireEvent.click(addButton);
    });
    
    transcendentalEquations.forEach(eq => {
      expect(screen.getByText(eq)).toBeInTheDocument();
    });
  });

  test('should handle composite functions', () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText(/Enter equation/);
    const addButton = screen.getByText('Add Equation');
    
    const compositeEquations = [
      'y = sin(e^x)',
      'y = ln(sqrt(x))',
      'y = cos(x^2)',
      'y = tan(sin(x))',
      'y = e^(sin(x))'
    ];
    
    compositeEquations.forEach(eq => {
      fireEvent.change(input, { target: { value: eq } });
      fireEvent.click(addButton);
    });
    
    compositeEquations.forEach(eq => {
      expect(screen.getByText(eq)).toBeInTheDocument();
    });
  });

  test('should handle implicit equations', () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText(/Enter equation/);
    const addButton = screen.getByText('Add Equation');
    
    const implicitEquations = [
      'x^2 + y^2 = 4',
      'x^2 - y^2 = 1',
      'x + y = 5'
    ];
    
    implicitEquations.forEach(eq => {
      fireEvent.change(input, { target: { value: eq } });
      fireEvent.click(addButton);
    });
    
    implicitEquations.forEach(eq => {
      expect(screen.getByText(eq)).toBeInTheDocument();
    });
  });
});

describe('Annotation System Tests', () => {
  test('should create valid annotations', () => {
    const textAnnotation = createAnnotation(ANNOTATION_TYPES.TEXT, { x: 0, y: 0 }, { text: 'Test' });
    const arrowAnnotation = createAnnotation(ANNOTATION_TYPES.ARROW, {
      start: { x: 0, y: 0 },
      end: { x: 5, y: 5 }
    });
    const circleAnnotation = createAnnotation(ANNOTATION_TYPES.CIRCLE, {
      center: { x: 0, y: 0 },
      radius: 10
    });
    
    expect(textAnnotation.type).toBe(ANNOTATION_TYPES.TEXT);
    expect(arrowAnnotation.type).toBe(ANNOTATION_TYPES.ARROW);
    expect(circleAnnotation.type).toBe(ANNOTATION_TYPES.CIRCLE);
    
    expect(textAnnotation.properties.text).toBe('Test');
    expect(arrowAnnotation.coordinates.start).toEqual({ x: 0, y: 0 });
    expect(circleAnnotation.coordinates.radius).toBe(10);
  });

  test('should handle annotation properties', () => {
    const annotation = createAnnotation(ANNOTATION_TYPES.TEXT, { x: 0, y: 0 }, {
      text: 'Custom Text',
      color: '#00ff00',
      fontSize: 18
    });
    
    expect(annotation.properties.text).toBe('Custom Text');
    expect(annotation.properties.color).toBe('#00ff00');
    expect(annotation.properties.fontSize).toBe(18);
  });
});

describe('Error Handling Tests', () => {
  test('should handle invalid equation input gracefully', () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText(/Enter equation/);
    const addButton = screen.getByText('Add Equation');
    
    // Try to add an invalid equation
    fireEvent.change(input, { target: { value: 'invalid equation' } });
    fireEvent.click(addButton);
    
    // The equation should still be added to the list (validation happens during plotting)
    expect(screen.getByText('invalid equation')).toBeInTheDocument();
  });

  test('should handle empty equation input', () => {
    render(<App />);
    
    const input = screen.getByPlaceholderText(/Enter equation/);
    const addButton = screen.getByText('Add Equation');
    
    // Try to add an empty equation
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(addButton);
    
    // Button should be disabled for empty input
    expect(addButton).toBeDisabled();
  });
});


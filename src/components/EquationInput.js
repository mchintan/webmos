import React, { useState, useRef, useEffect } from 'react';
import { ChromePicker } from 'react-color';
import { validateExpression, parseEquation } from '../utils/mathUtils';
import './EquationInput.css';

const EquationInput = ({ onAddEquation }) => {
  const [expression, setExpression] = useState('');
  const [color, setColor] = useState('#ff0000');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [error, setError] = useState('');
  const [equationType, setEquationType] = useState('explicit');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Common mathematical functions and constants for suggestions
  const functionSuggestions = [
    'sin(', 'cos(', 'tan(', 'asin(', 'acos(', 'atan(',
    'sinh(', 'cosh(', 'tanh(',
    'log(', 'ln(', 'log10(',
    'exp(', 'sqrt(', 'abs(',
    'gamma(', 'erf(', 'besselj0(',
    'normalPDF(', 'normalCDF(',
    'ellipticK(', 'fresnelS(', 'fresnelC(',
    'pi', 'e', 'phi', 'γ', 'ℯ', 'ℎ'
  ];

  const equationTemplates = {
    explicit: [
      'y = sin(x)',
      'y = x^2 + 2*x + 1',
      'y = exp(-x^2/2)',
      'y = gamma(x)',
      'y = erf(x)'
    ],
    parametric: [
      'x = cos(t), y = sin(t)',
      'x = t^2, y = t',
      'x = sin(2*t), y = cos(3*t)'
    ],
    polar: [
      'r = 2*cos(theta)',
      'r = 1 + cos(theta)',
      'r = theta'
    ],
    implicit: [
      'x^2 + y^2 = 4',
      'x^2 - y^2 = 1',
      'sin(x*y) = 0'
    ]
  };

  // Auto-detect equation type based on input
  useEffect(() => {
    if (expression.trim()) {
      try {
        const parsed = parseEquation(expression.trim());
        setEquationType(parsed.type);
        setError('');
      } catch (err) {
        setError(err.message);
      }
    }
  }, [expression]);

  // Generate suggestions based on input
  useEffect(() => {
    if (expression.trim()) {
      const lastWord = expression.split(/[\s+\-*/^=(),]/).pop();
      if (lastWord && lastWord.length > 0) {
        const matches = functionSuggestions.filter(func =>
          func.toLowerCase().startsWith(lastWord.toLowerCase())
        );
        setSuggestions(matches.slice(0, 5));
        setShowSuggestions(matches.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [expression, functionSuggestions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!expression.trim()) {
      setError('Please enter an equation');
      return;
    }

    const validation = validateExpression(expression.trim());
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    try {
      onAddEquation(expression.trim(), color);
      setExpression('');
      setError('');
      setShowSuggestions(false);
    } catch (err) {
      setError('Error adding equation: ' + err.message);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const words = expression.split(/(\s+|[+\-*/^=(),])/);
    words[words.length - 1] = suggestion;
    setExpression(words.join(''));
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleTemplateClick = (template) => {
    setExpression(template);
    inputRef.current?.focus();
  };

  const getEquationTypeDisplay = () => {
    switch (equationType) {
      case 'explicit': return 'Explicit: y = f(x)';
      case 'parametric': return 'Parametric: x = f(t), y = g(t)';
      case 'polar': return 'Polar: r = f(θ)';
      case 'implicit': return 'Implicit: f(x,y) = 0';
      default: return 'Unknown type';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="equation-input">
      <div className="equation-type-indicator">
        <span className={`type-badge type-${equationType}`}>
          {getEquationTypeDisplay()}
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter equation (e.g., y = sin(x), x = cos(t), y = sin(t), r = 2*cos(theta))"
            value={expression}
            onChange={(e) => {
              setExpression(e.target.value);
              setError('');
            }}
            onKeyPress={handleKeyPress}
            className={error ? 'error' : ''}
          />

          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="input-controls">
          <div className="color-selector">
            <div
              className="color-preview"
              style={{ backgroundColor: color }}
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Choose color"
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
            disabled={!expression.trim() || !!error}
          >
            Add Equation
          </button>
        </div>
      </form>

      {/* Equation Templates */}
      <div className="equation-templates">
        <h4>Quick Templates:</h4>
        <div className="template-buttons">
          {equationTemplates[equationType]?.slice(0, 3).map((template, index) => (
            <button
              key={index}
              type="button"
              className="template-button"
              onClick={() => handleTemplateClick(template)}
            >
              {template}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Functions Help */}
      <div className="function-help">
        <details>
          <summary>Advanced Functions Available</summary>
          <div className="help-content">
            <div className="help-section">
              <h5>Special Functions</h5>
              <p>gamma(x), erf(x), besselj0(x), ellipticK(k)</p>
            </div>
            <div className="help-section">
              <h5>Statistical Functions</h5>
              <p>normalPDF(x, μ, σ), normalCDF(x, μ, σ)</p>
            </div>
            <div className="help-section">
              <h5>Constants</h5>
              <p>pi, e, phi (golden ratio), c (speed of light), h (Planck constant)</p>
            </div>
            <div className="help-section">
              <h5>Equation Types</h5>
              <ul>
                <li><strong>Explicit:</strong> y = f(x)</li>
                <li><strong>Parametric:</strong> x = f(t), y = g(t)</li>
                <li><strong>Polar:</strong> r = f(θ)</li>
                <li><strong>Implicit:</strong> f(x,y) = 0</li>
              </ul>
            </div>
          </div>
        </details>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default EquationInput;


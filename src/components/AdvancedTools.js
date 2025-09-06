import React, { useState, useCallback } from 'react';
import {
  calculateDerivative,
  calculateIntegral,
  findRoot,
  simplifyExpression,
  evaluateExpression
} from '../utils/mathUtils';
import './AdvancedTools.css';

const AdvancedTools = ({ equations, addEquation }) => {
  const [activeTool, setActiveTool] = useState('derivative');
  const [inputExpression, setInputExpression] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const tools = [
    {
      id: 'derivative',
      name: 'Derivative',
      icon: '∫',
      description: 'Calculate derivative of a function'
    },
    {
      id: 'integral',
      name: 'Integral',
      icon: '∫',
      description: 'Calculate definite integral'
    },
    {
      id: 'root',
      name: 'Root Finder',
      icon: '√',
      description: 'Find roots using bisection method'
    },
    {
      id: 'simplify',
      name: 'Simplify',
      icon: '≡',
      description: 'Simplify mathematical expressions'
    },
    {
      id: 'evaluate',
      name: 'Evaluate',
      icon: '=',
      description: 'Evaluate expression at a point'
    },
    {
      id: 'series',
      name: 'Taylor Series',
      icon: '∑',
      description: 'Generate Taylor series expansion'
    }
  ];

  const generateTaylorSeries = (expression, center, order) => {
    try {
      let series = '';
      let coeff = evaluateExpression(expression, { x: center });

      series += `${coeff.toFixed(4)}`;

      for (let n = 1; n <= order; n++) {
        const derivative = calculateDerivative(expression);
        coeff = evaluateExpression(derivative, { x: center }) / factorial(n);
        const sign = coeff >= 0 ? '+' : '';
        series += ` ${sign}${coeff.toFixed(4)}*(x-${center})^${n}`;
      }

      return series;
    } catch (err) {
      return 'Could not generate Taylor series';
    }
  };

  const factorial = (n) => {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  };

  const handleCalculate = useCallback(() => {
    if (!inputExpression.trim()) {
      setError('Please enter an expression');
      return;
    }

    setError('');
    setResult('');

    try {
      let calculationResult = '';

      switch (activeTool) {
        case 'derivative':
          calculationResult = calculateDerivative(inputExpression);
          break;

        case 'integral':
          const [a, b] = [-1, 1]; // Default limits
          const integralValue = calculateIntegral(inputExpression, a, b);
          calculationResult = `∫${inputExpression} dx from ${a} to ${b} = ${integralValue.toFixed(6)}`;
          break;

        case 'root':
          const root = findRoot(inputExpression, -10, 10);
          calculationResult = `Root found at x = ${root.toFixed(6)}`;
          break;

        case 'simplify':
          calculationResult = simplifyExpression(inputExpression);
          break;

        case 'evaluate':
          const point = 0; // Default evaluation point
          const value = evaluateExpression(inputExpression, { x: point });
          calculationResult = `${inputExpression} at x = ${point} = ${value.toFixed(6)}`;
          break;

        case 'series':
          // Simple Taylor series approximation
          calculationResult = generateTaylorSeries(inputExpression, 0, 4);
          break;

        default:
          calculationResult = 'Tool not implemented yet';
      }

      setResult(calculationResult);
    } catch (err) {
      setError(err.message);
    }
  }, [activeTool, inputExpression, generateTaylorSeries]);

  const handleAddToGraph = useCallback(() => {
    if (result && !error) {
      // Try to extract a function from the result
      const functionMatch = result.match(/y\s*=\s*(.+)/) ||
                           result.match(/(.+)=/);

      if (functionMatch) {
        addEquation(`y = ${functionMatch[1]}`, '#00ff00');
      } else {
        // If no clear function, show the result as text
        setError('Cannot extract function from result');
      }
    }
  }, [result, error, addEquation]);

  return (
    <div className="advanced-tools">
      <div className="tools-header">
        <h3>Advanced Mathematical Tools</h3>
        <div className="tools-grid">
          {tools.map(tool => (
            <button
              key={tool.id}
              className={`tool-button ${activeTool === tool.id ? 'active' : ''}`}
              onClick={() => setActiveTool(tool.id)}
              title={tool.description}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-name">{tool.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tool-input">
        <div className="input-group">
          <label htmlFor="expression-input">
            {tools.find(t => t.id === activeTool)?.description}
          </label>
          <input
            id="expression-input"
            type="text"
            value={inputExpression}
            onChange={(e) => setInputExpression(e.target.value)}
            placeholder="Enter mathematical expression..."
            onKeyPress={(e) => e.key === 'Enter' && handleCalculate()}
          />
        </div>

        <button
          className="calculate-button"
          onClick={handleCalculate}
          disabled={!inputExpression.trim()}
        >
          Calculate
        </button>
      </div>

      {result && (
        <div className="result-section">
          <h4>Result:</h4>
          <div className="result-display">
            {result}
          </div>
          <button
            className="add-to-graph-button"
            onClick={handleAddToGraph}
            title="Add result to graph"
          >
            Add to Graph
          </button>
        </div>
      )}

      {error && (
        <div className="error-section">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Quick Examples */}
      <div className="examples-section">
        <h4>Examples:</h4>
        <div className="examples-list">
          {getExamplesForTool(activeTool).map((example, index) => (
            <button
              key={index}
              className="example-button"
              onClick={() => setInputExpression(example)}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const getExamplesForTool = (toolId) => {
  const examples = {
    derivative: ['sin(x)', 'x^2 + 2*x', 'exp(-x^2)', 'ln(x)'],
    integral: ['sin(x)', 'x^2', 'exp(-x^2/2)', '1/x'],
    root: ['x^2 - 2', 'sin(x)', 'x^3 - x', 'exp(x) - 2'],
    simplify: ['(x+1)^2', 'sin(x)^2 + cos(x)^2', 'x*2 + x*3'],
    evaluate: ['sin(pi/2)', 'gamma(2)', 'erf(1)', 'besselj0(1)'],
    series: ['sin(x)', 'cos(x)', 'exp(x)', 'ln(1+x)']
  };

  return examples[toolId] || [];
};

export default AdvancedTools;

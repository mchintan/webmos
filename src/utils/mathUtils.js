import { evaluate, parse } from 'mathjs';

// Parse mathematical expressions and determine if they're explicit or implicit
export const parseEquation = (expression) => {
  const trimmed = expression.trim();
  
  // Check if it's an explicit function y = f(x)
  const explicitMatch = trimmed.match(/^y\s*=\s*(.+)$/i);
  if (explicitMatch) {
    return {
      type: 'explicit',
      function: explicitMatch[1].trim(),
      original: trimmed
    };
  }
  
  // Check if it's an implicit equation (contains both x and y)
  if (trimmed.includes('x') && trimmed.includes('y')) {
    return {
      type: 'implicit',
      expression: trimmed,
      original: trimmed
    };
  }
  
  // If it only contains x, treat it as y = f(x)
  if (trimmed.includes('x') && !trimmed.includes('y')) {
    return {
      type: 'explicit',
      function: trimmed,
      original: `y = ${trimmed}`
    };
  }
  
  throw new Error('Invalid equation format');
};

// Evaluate a mathematical expression with given variables
export const evaluateExpression = (expression, variables = {}) => {
  try {
    // Create a scope with mathematical constants and functions
    const scope = {
      pi: Math.PI,
      e: Math.E,
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      asin: Math.asin,
      acos: Math.acos,
      atan: Math.atan,
      sinh: Math.sinh,
      cosh: Math.cosh,
      tanh: Math.tanh,
      log: Math.log,
      log10: (x) => Math.log10(x),
      sqrt: Math.sqrt,
      abs: Math.abs,
      exp: Math.exp,
      pow: Math.pow,
      floor: Math.floor,
      ceil: Math.ceil,
      round: Math.round,
      ...variables
    };
    
    return evaluate(expression, scope);
  } catch (error) {
    throw new Error(`Evaluation error: ${error.message}`);
  }
};

// Validate if an expression is mathematically valid
export const validateExpression = (expression) => {
  try {
    parse(expression);
    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Generate sample points for explicit functions
export const generateFunctionPoints = (functionExpression, xMin, xMax, numPoints = 1000) => {
  const points = [];
  const step = (xMax - xMin) / numPoints;
  
  for (let i = 0; i <= numPoints; i++) {
    const x = xMin + i * step;
    try {
      const y = evaluateExpression(functionExpression, { x });
      if (isFinite(y)) {
        points.push([x, y]);
      }
    } catch (error) {
      // Skip points that cause errors
    }
  }
  
  return points;
};

// Generate points for implicit equations using marching squares or similar
export const generateImplicitPoints = (equation, xMin, xMax, yMin, yMax, resolution = 100) => {
  const points = [];
  const xStep = (xMax - xMin) / resolution;
  const yStep = (yMax - yMin) / resolution;
  
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const x = xMin + i * xStep;
      const y = yMin + j * yStep;
      
      try {
        const result = evaluateExpression(equation, { x, y });
        if (Math.abs(result) < 0.1) { // Threshold for implicit plotting
          points.push([x, y]);
        }
      } catch (error) {
        // Skip points that cause errors
      }
    }
  }
  
  return points;
};

// Convert mathematical notation to more user-friendly format
export const formatExpression = (expression) => {
  return expression
    .replace(/\^/g, '**') // Convert ^ to ** for math.js
    .replace(/\*/g, '×')  // Convert * to × for display
    .replace(/\//g, '÷'); // Convert / to ÷ for display
};

// Parse user input and convert to math.js compatible format
export const parseUserInput = (input) => {
  let processed = input
    .replace(/\*\*/g, '^')  // Convert ** back to ^ for math.js
    .replace(/×/g, '*')     // Convert × back to * for math.js
    .replace(/÷/g, '/');    // Convert ÷ back to / for math.js
  
  // Handle common mathematical notation like sin^2(x) -> sin(x)^2
  processed = processed.replace(/(\w+)\^(\d+)\(/g, '$1($2)^$3');
  
  return processed;
};

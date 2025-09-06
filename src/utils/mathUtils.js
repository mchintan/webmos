import { evaluate, parse, derivative, simplify } from 'mathjs';
import gamma from '@stdlib/math-base-special-gamma';
import besselj0 from '@stdlib/math-base-special-besselj0';

// Advanced mathematical constants and functions
const ADVANCED_CONSTANTS = {
  // Physical constants
  c: 299792458, // Speed of light (m/s)
  h: 6.62607015e-34, // Planck constant (J⋅s)
  hbar: 1.0545718e-34, // Reduced Planck constant (J⋅s)
  G: 6.67430e-11, // Gravitational constant (m³⋅kg⁻¹⋅s⁻²)
  eV: 1.602176634e-19, // Elementary charge (C)

  // Mathematical constants
  phi: (1 + Math.sqrt(5)) / 2, // Golden ratio
  catalan: 0.915965594177219, // Catalan's constant
  apery: 1.202056903159594, // Apery's constant
  khinchin: 2.685452001065306, // Khinchin's constant

  // Special values
  inf: Infinity,
  nan: NaN
};

// Advanced mathematical functions
const ADVANCED_FUNCTIONS = {
  // Special functions
  gamma: (x) => gamma(x),
  besselj0: (x) => besselj0(x),

  // Error functions
  erf: (x) => {
    // Approximation of error function
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  },

  // Fresnel integrals
  fresnelS: (x) => {
    // Simplified Fresnel sine integral approximation
    let sum = 0;
    const n = 20;
    for (let i = 0; i < n; i++) {
      const term = Math.pow(-1, i) * Math.pow(x, 4 * i + 1) / ((4 * i + 1) * factorial(2 * i));
      sum += term;
    }
    return sum;
  },

  fresnelC: (x) => {
    // Simplified Fresnel cosine integral approximation
    let sum = 0;
    const n = 20;
    for (let i = 0; i < n; i++) {
      const term = Math.pow(-1, i) * Math.pow(x, 4 * i + 3) / ((4 * i + 3) * factorial(2 * i + 1));
      sum += term;
    }
    return sum;
  },

  // Elliptic integrals
  ellipticK: (k) => {
    // Complete elliptic integral of the first kind
    const a0 = 1;
    const b0 = Math.sqrt(1 - k * k);
    let a = a0;
    let b = b0;
    const tolerance = 1e-10;

    while (Math.abs(a - b) > tolerance) {
      const a_next = (a + b) / 2;
      const b_next = Math.sqrt(a * b);
      a = a_next;
      b = b_next;
    }

    return Math.PI / (2 * a);
  },

  // Statistical functions
  normalPDF: (x, mu = 0, sigma = 1) => {
    return Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2)) / (sigma * Math.sqrt(2 * Math.PI));
  },

  normalCDF: (x, mu = 0, sigma = 1) => {
    // Approximation of normal cumulative distribution function
    const z = (x - mu) / (sigma * Math.sqrt(2));
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  },

  // Number theory functions
  factorial: (n) => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  },

  binomial: (n, k) => {
    if (k < 0 || k > n) return 0;
    return factorial(n) / (factorial(k) * factorial(n - k));
  },

  // Complex number functions
  complexAbs: (real, imag) => Math.sqrt(real * real + imag * imag),
  complexArg: (real, imag) => Math.atan2(imag, real),

  // Hypergeometric functions
  hypergeometric0F1: (a, x) => {
    // Simplified hypergeometric ₀F₁ function
    let sum = 1;
    let term = 1;
    const n = 20;

    for (let i = 1; i < n; i++) {
      term *= x / (a + i - 1);
      sum += term;
    }

    return sum;
  }
};

// Helper function for factorial
function factorial(n) {
  return ADVANCED_FUNCTIONS.factorial(n);
}

// Parse mathematical expressions and determine if they're explicit or implicit
export const parseEquation = (expression) => {
  const trimmed = expression.trim();

  // Check for parametric equations (x = f(t), y = g(t))
  const parametricMatch = trimmed.match(/^(x\s*=\s*.+),\s*(y\s*=\s*.+)$/i);
  if (parametricMatch) {
    return {
      type: 'parametric',
      xFunction: parametricMatch[1].replace(/^x\s*=\s*/, '').trim(),
      yFunction: parametricMatch[2].replace(/^y\s*=\s*/, '').trim(),
      original: trimmed
    };
  }

  // Check for polar equations (r = f(θ))
  const polarMatch = trimmed.match(/^r\s*=\s*(.+)$/i);
  if (polarMatch) {
    return {
      type: 'polar',
      function: polarMatch[1].trim(),
      original: trimmed
    };
  }

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

  throw new Error('Invalid equation format. Supported formats: y=f(x), implicit equations, parametric (x=f(t), y=g(t)), polar r=f(θ)');
};

// Evaluate a mathematical expression with given variables
export const evaluateExpression = (expression, variables = {}) => {
  try {
    // Create a scope with mathematical constants and functions
    const scope = {
      // Basic constants
      pi: Math.PI,
      e: Math.E,

      // Advanced constants
      ...ADVANCED_CONSTANTS,

      // Basic trigonometric functions
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      asin: Math.asin,
      acos: Math.acos,
      atan: Math.atan,

      // Hyperbolic functions
      sinh: Math.sinh,
      cosh: Math.cosh,
      tanh: Math.tanh,

      // Logarithmic functions
      log: Math.log,
      log10: (x) => Math.log10(x),
      ln: Math.log,

      // Power and root functions
      sqrt: Math.sqrt,
      pow: Math.pow,

      // Rounding functions
      floor: Math.floor,
      ceil: Math.ceil,
      round: Math.round,
      abs: Math.abs,

      // Exponential function
      exp: Math.exp,

      // Advanced mathematical functions
      ...ADVANCED_FUNCTIONS,

      // Additional aliases
      γ: ADVANCED_CONSTANTS.phi, // Golden ratio
      φ: ADVANCED_CONSTANTS.phi, // Golden ratio
      ℯ: Math.E, // Euler's number
      ℎ: ADVANCED_CONSTANTS.h, // Planck constant

      // Vector operations
      dot: (a, b) => a.reduce((sum, val, i) => sum + val * b[i], 0),
      cross: (a, b) => [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
      ],

      // Matrix operations
      det2x2: (m) => m[0][0] * m[1][1] - m[0][1] * m[1][0],
      trace: (m) => m.reduce((sum, row, i) => sum + row[i], 0),

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

// Calculate derivative of a function
export const calculateDerivative = (expression, variable = 'x') => {
  try {
    const node = parse(expression);
    const derivativeNode = derivative(node, variable);
    return derivativeNode.toString();
  } catch (error) {
    throw new Error(`Derivative calculation error: ${error.message}`);
  }
};

// Simplify mathematical expression
export const simplifyExpression = (expression) => {
  try {
    const node = parse(expression);
    const simplified = simplify(node);
    return simplified.toString();
  } catch (error) {
    throw new Error(`Simplification error: ${error.message}`);
  }
};

// Generate points for parametric equations
export const generateParametricPoints = (xFunction, yFunction, tMin, tMax, numPoints = 1000) => {
  const points = [];
  const tStep = (tMax - tMin) / numPoints;

  for (let i = 0; i <= numPoints; i++) {
    const t = tMin + i * tStep;
    try {
      const x = evaluateExpression(xFunction, { t });
      const y = evaluateExpression(yFunction, { t });
      if (isFinite(x) && isFinite(y)) {
        points.push([x, y]);
      }
    } catch (error) {
      // Skip points that cause errors
    }
  }

  return points;
};

// Generate points for polar equations
export const generatePolarPoints = (functionExpression, thetaMin, thetaMax, numPoints = 1000) => {
  const points = [];
  const thetaStep = (thetaMax - thetaMin) / numPoints;

  for (let i = 0; i <= numPoints; i++) {
    const theta = thetaMin + i * thetaStep;
    try {
      const r = evaluateExpression(functionExpression, { theta });
      if (isFinite(r) && r >= 0) {
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        points.push([x, y]);
      }
    } catch (error) {
      // Skip points that cause errors
    }
  }

  return points;
};

// Advanced function plotting with adaptive sampling
export const generateAdaptivePoints = (functionExpression, xMin, xMax, targetPoints = 1000) => {
  const points = [];
  const regions = [{ start: xMin, end: xMax, level: 0 }];
  const maxLevel = 8;

  while (points.length < targetPoints && regions.length > 0) {
    const region = regions.shift();
    const mid = (region.start + region.end) / 2;

    try {
      const y1 = evaluateExpression(functionExpression, { x: region.start });
      const y2 = evaluateExpression(functionExpression, { x: mid });
      const y3 = evaluateExpression(functionExpression, { x: region.end });

      if (isFinite(y1)) points.push([region.start, y1]);
      if (isFinite(y2)) points.push([mid, y2]);
      if (isFinite(y3)) points.push([region.end, y3]);

      // Adaptive subdivision based on curvature
      if (region.level < maxLevel) {
        const curvature = Math.abs(y1 - 2 * y2 + y3) / Math.pow(region.end - region.start, 2);
        if (curvature > 0.1) {
          regions.unshift(
            { start: region.start, end: mid, level: region.level + 1 },
            { start: mid, end: region.end, level: region.level + 1 }
          );
        }
      }
    } catch (error) {
      // Skip problematic regions
    }
  }

  // Sort points by x-coordinate
  return points.sort((a, b) => a[0] - b[0]);
};

// Calculate definite integral using Simpson's rule
export const calculateIntegral = (expression, a, b, n = 1000) => {
  try {
    const h = (b - a) / n;
    let sum = evaluateExpression(expression, { x: a }) + evaluateExpression(expression, { x: b });

    for (let i = 1; i < n; i++) {
      const x = a + i * h;
      const y = evaluateExpression(expression, { x });
      sum += i % 2 === 0 ? 2 * y : 4 * y;
    }

    return (h / 3) * sum;
  } catch (error) {
    throw new Error(`Integration error: ${error.message}`);
  }
};

// Find roots using bisection method
export const findRoot = (expression, a, b, tolerance = 1e-10, maxIterations = 100) => {
  try {
    let fa = evaluateExpression(expression, { x: a });
    let fb = evaluateExpression(expression, { x: b });

    if (fa * fb > 0) {
      throw new Error('Function does not change sign in the interval');
    }

    let c = a;
    for (let i = 0; i < maxIterations; i++) {
      c = (a + b) / 2;
      const fc = evaluateExpression(expression, { x: c });

      if (Math.abs(fc) < tolerance) {
        return c;
      }

      if (fa * fc < 0) {
        b = c;
        fb = fc;
      } else {
        a = c;
        fa = fc;
      }

      if (Math.abs(b - a) < tolerance) {
        return c;
      }
    }

    return c;
  } catch (error) {
    throw new Error(`Root finding error: ${error.message}`);
  }
};

// Generate contour plot data for implicit equations
export const generateContourData = (expression, xMin, xMax, yMin, yMax, levels = 20) => {
  const data = [];
  const xStep = (xMax - xMin) / 50;
  const yStep = (yMax - yMin) / 50;

  for (let i = 0; i <= 50; i++) {
    const row = [];
    for (let j = 0; j <= 50; j++) {
      const x = xMin + i * xStep;
      const y = yMin + j * yStep;

      try {
        const value = evaluateExpression(expression, { x, y });
        row.push(isFinite(value) ? value : 0);
      } catch (error) {
        row.push(0);
      }
    }
    data.push(row);
  }

  return { data, xMin, xMax, yMin, yMax, levels };
};

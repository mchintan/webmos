// Voice to Math Expression Processor
export const processVoiceInput = (voiceText) => {
  const text = voiceText.toLowerCase().trim();
  
  // Common voice patterns and their mathematical equivalents
  const patterns = [
    // Basic operations
    { pattern: /y equals x/, replacement: 'y = x' },
    { pattern: /y equals/, replacement: 'y = ' },
    { pattern: /x equals/, replacement: 'x = ' },
    { pattern: /plus/g, replacement: '+' },
    { pattern: /minus/g, replacement: '-' },
    { pattern: /times/g, replacement: '*' },
    { pattern: /multiplied by/g, replacement: '*' },
    { pattern: /divided by/g, replacement: '/' },
    { pattern: /over/g, replacement: '/' },
    
    // Powers and exponents
    { pattern: /x squared/g, replacement: 'x^2' },
    { pattern: /x cubed/g, replacement: 'x^3' },
    { pattern: /x to the power of (\d+)/g, replacement: 'x^$1' },
    { pattern: /x to the (\d+)/g, replacement: 'x^$1' },
    { pattern: /squared/g, replacement: '^2' },
    { pattern: /cubed/g, replacement: '^3' },
    
    // Trigonometric functions
    { pattern: /sine of x/g, replacement: 'sin(x)' },
    { pattern: /cosine of x/g, replacement: 'cos(x)' },
    { pattern: /tangent of x/g, replacement: 'tan(x)' },
    { pattern: /arc sine of x/g, replacement: 'asin(x)' },
    { pattern: /arc cosine of x/g, replacement: 'acos(x)' },
    { pattern: /arc tangent of x/g, replacement: 'atan(x)' },
    
    // Logarithms
    { pattern: /log of x/g, replacement: 'log(x)' },
    { pattern: /natural log of x/g, replacement: 'ln(x)' },
    { pattern: /log base (\d+) of x/g, replacement: 'log(x, $1)' },
    
    // Constants
    { pattern: /pi/g, replacement: 'pi' },
    { pattern: /e to the x/g, replacement: 'e^x' },
    { pattern: /euler's number/g, replacement: 'e' },
    
    // Special functions
    { pattern: /absolute value of x/g, replacement: 'abs(x)' },
    { pattern: /square root of x/g, replacement: 'sqrt(x)' },
    { pattern: /cube root of x/g, replacement: 'cbrt(x)' },
    
    // Numbers
    { pattern: /zero/g, replacement: '0' },
    { pattern: /one/g, replacement: '1' },
    { pattern: /two/g, replacement: '2' },
    { pattern: /three/g, replacement: '3' },
    { pattern: /four/g, replacement: '4' },
    { pattern: /five/g, replacement: '5' },
    { pattern: /six/g, replacement: '6' },
    { pattern: /seven/g, replacement: '7' },
    { pattern: /eight/g, replacement: '8' },
    { pattern: /nine/g, replacement: '9' },
    { pattern: /ten/g, replacement: '10' },
    
    // Variables
    { pattern: /why/g, replacement: 'y' },
    { pattern: /ex/g, replacement: 'x' },
    
    // Common mathematical phrases
    { pattern: /circle radius (\d+)/g, replacement: 'x^2 + y^2 = $1^2' },
    { pattern: /circle with radius (\d+)/g, replacement: 'x^2 + y^2 = $1^2' },
    { pattern: /parabola/g, replacement: 'y = x^2' },
    { pattern: /straight line/g, replacement: 'y = x' },
    { pattern: /horizontal line at (\d+)/g, replacement: 'y = $1' },
    { pattern: /vertical line at (\d+)/g, replacement: 'x = $1' },
    
    // Clean up spaces around operators
    { pattern: /\s*([+\-*/^=])\s*/g, replacement: ' $1 ' },
    { pattern: /\s+/g, replacement: ' ' },
    { pattern: /^\s+|\s+$/g, replacement: '' }
  ];
  
  let processedText = text;
  
  // Apply all patterns
  patterns.forEach(({ pattern, replacement }) => {
    processedText = processedText.replace(pattern, replacement);
  });
  
  // Handle special cases
  if (processedText.includes('y =') && !processedText.includes('x')) {
    // If it's just "y = something", assume it's a constant function
    processedText = processedText.replace('y = ', 'y = ');
  }
  
  // Clean up any remaining artifacts
  processedText = processedText
    .replace(/\s+/g, ' ')
    .trim();
  
  return processedText;
};

// Process multiple lines from video extraction
export const processVideoExtraction = (extractedText) => {
  const lines = extractedText.split('\n').filter(line => line.trim());
  return lines.map(line => processVoiceInput(line));
};

// Validate mathematical expression
export const validateExpression = (expression) => {
  try {
    // Basic validation - check for common mathematical syntax
    const validChars = /^[0-9x y+\-*/^()=.,\s]+$/;
    const hasValidChars = validChars.test(expression);
    
    // Check for balanced parentheses
    const parentheses = expression.match(/[()]/g) || [];
    const openParens = parentheses.filter(p => p === '(').length;
    const closeParens = parentheses.filter(p => p === ')').length;
    const balancedParens = openParens === closeParens;
    
    // Check for basic mathematical structure
    const hasMathStructure = /[+\-*/^=]/.test(expression) || /[()]/.test(expression);
    
    return hasValidChars && balancedParens && hasMathStructure;
  } catch (error) {
    return false;
  }
};

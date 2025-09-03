import { processVoiceInput, processVideoExtraction, validateExpression } from '../utils/voiceProcessor';

describe('Voice Processor', () => {
  describe('processVoiceInput', () => {
    test('should handle basic mathematical operations', () => {
      expect(processVoiceInput('y equals x')).toBe('y = x');
      expect(processVoiceInput('y equals x plus 2')).toBe('y = x + 2');
      expect(processVoiceInput('y equals x minus 3')).toBe('y = x - 3');
      expect(processVoiceInput('y equals x times 4')).toBe('y = x * 4');
      expect(processVoiceInput('y equals x divided by 2')).toBe('y = x / 2');
    });

    test('should handle powers and exponents', () => {
      expect(processVoiceInput('y equals x squared')).toBe('y = x^2');
      expect(processVoiceInput('y equals x cubed')).toBe('y = x^3');
      expect(processVoiceInput('y equals x to the power of 4')).toBe('y = x^4');
      expect(processVoiceInput('y equals x to the 5')).toBe('y = x^5');
    });

    test('should handle trigonometric functions', () => {
      expect(processVoiceInput('y equals sine of x')).toBe('y = sin(x)');
      expect(processVoiceInput('y equals cosine of x')).toBe('y = cos(x)');
      expect(processVoiceInput('y equals tangent of x')).toBe('y = tan(x)');
      expect(processVoiceInput('y equals arc sine of x')).toBe('y = asin(x)');
      expect(processVoiceInput('y equals arc cosine of x')).toBe('y = acos(x)');
      expect(processVoiceInput('y equals arc tangent of x')).toBe('y = atan(x)');
    });

    test('should handle logarithmic functions', () => {
      expect(processVoiceInput('y equals log of x')).toBe('y = log(x)');
      expect(processVoiceInput('y equals natural log of x')).toBe('y = ln(x)');
      expect(processVoiceInput('y equals log base 2 of x')).toBe('y = log(x, 2)');
    });

    test('should handle special functions', () => {
      expect(processVoiceInput('y equals absolute value of x')).toBe('y = abs(x)');
      expect(processVoiceInput('y equals square root of x')).toBe('y = sqrt(x)');
      expect(processVoiceInput('y equals cube root of x')).toBe('y = cbrt(x)');
    });

    test('should handle constants', () => {
      expect(processVoiceInput('y equals pi')).toBe('y = pi');
      expect(processVoiceInput('y equals e to the x')).toBe('y = e^x');
      expect(processVoiceInput('y equals euler\'s number')).toBe('y = e');
    });

    test('should handle numbers', () => {
      expect(processVoiceInput('y equals zero')).toBe('y = 0');
      expect(processVoiceInput('y equals one')).toBe('y = 1');
      expect(processVoiceInput('y equals two')).toBe('y = 2');
      expect(processVoiceInput('y equals three')).toBe('y = 3');
      expect(processVoiceInput('y equals ten')).toBe('y = 10');
    });

    test('should handle variables', () => {
      expect(processVoiceInput('why equals ex')).toBe('y = x');
      expect(processVoiceInput('ex equals why')).toBe('x = y');
    });

    test('should handle complex expressions', () => {
      expect(processVoiceInput('y equals x squared plus 2 times x plus 1')).toBe('y = x^2 + 2 * x + 1');
      expect(processVoiceInput('y equals sine of x squared plus cosine of 2 times x')).toBe('y = sin(x^2) + cos(2 * x)');
      expect(processVoiceInput('y equals e to the x times natural log of x')).toBe('y = e^x * ln(x)');
    });

    test('should handle common mathematical phrases', () => {
      expect(processVoiceInput('circle radius 3')).toBe('x^2 + y^2 = 9');
      expect(processVoiceInput('circle with radius 5')).toBe('x^2 + y^2 = 25');
      expect(processVoiceInput('parabola')).toBe('y = x^2');
      expect(processVoiceInput('straight line')).toBe('y = x');
      expect(processVoiceInput('horizontal line at 3')).toBe('y = 3');
      expect(processVoiceInput('vertical line at 2')).toBe('x = 2');
    });

    test('should handle case variations', () => {
      expect(processVoiceInput('Y EQUALS X')).toBe('y = x');
      expect(processVoiceInput('Why equals Ex')).toBe('y = x');
      expect(processVoiceInput('y Equals x Squared')).toBe('y = x^2');
    });

    test('should handle whitespace variations', () => {
      expect(processVoiceInput('  y equals x  ')).toBe('y = x');
      expect(processVoiceInput('y   equals   x')).toBe('y = x');
      expect(processVoiceInput('y\tequals\tx')).toBe('y = x');
    });
  });

  describe('processVideoExtraction', () => {
    test('should process multiple lines from video', () => {
      const extractedText = 'y = x^2\nsin(x)\ncos(x)';
      const result = processVideoExtraction(extractedText);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe('y = x^2');
      expect(result[1]).toBe('sin(x)');
      expect(result[2]).toBe('cos(x)');
    });

    test('should filter empty lines', () => {
      const extractedText = 'y = x^2\n\nsin(x)\n  \ncos(x)';
      const result = processVideoExtraction(extractedText);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe('y = x^2');
      expect(result[1]).toBe('sin(x)');
      expect(result[2]).toBe('cos(x)');
    });

    test('should handle single line', () => {
      const extractedText = 'y = x^2';
      const result = processVideoExtraction(extractedText);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('y = x^2');
    });

    test('should handle empty input', () => {
      const extractedText = '';
      const result = processVideoExtraction(extractedText);
      
      expect(result).toHaveLength(0);
    });

    test('should handle whitespace-only lines', () => {
      const extractedText = '   \n\t\n  \n';
      const result = processVideoExtraction(extractedText);
      
      expect(result).toHaveLength(0);
    });
  });

  describe('validateExpression', () => {
    test('should validate basic mathematical expressions', () => {
      expect(validateExpression('x + y')).toBe(true);
      expect(validateExpression('x^2 + y^2')).toBe(true);
      expect(validateExpression('sin(x)')).toBe(true);
      expect(validateExpression('log(x)')).toBe(true);
      expect(validateExpression('sqrt(x)')).toBe(true);
    });

    test('should validate complex expressions', () => {
      expect(validateExpression('x^2 + 2*x + 1')).toBe(true);
      expect(validateExpression('sin(x^2) + cos(2*x)')).toBe(true);
      expect(validateExpression('e^x * ln(x)')).toBe(true);
      expect(validateExpression('sqrt(x^2 + y^2)')).toBe(true);
    });

    test('should validate implicit equations', () => {
      expect(validateExpression('x^2 + y^2 = 4')).toBe(true);
      expect(validateExpression('x + y = 5')).toBe(true);
      expect(validateExpression('x^2 - y^2 = 1')).toBe(true);
    });

    test('should validate expressions with parentheses', () => {
      expect(validateExpression('(x + y) * 2')).toBe(true);
      expect(validateExpression('sin(x + y)')).toBe(true);
      expect(validateExpression('(x^2 + y^2) = 4')).toBe(true);
    });

    test('should reject invalid expressions', () => {
      expect(validateExpression('')).toBe(false);
      expect(validateExpression('invalid')).toBe(false);
      expect(validateExpression('x +')).toBe(false);
      expect(validateExpression('(x + y')).toBe(false); // Unbalanced parentheses
      expect(validateExpression('x + y)')).toBe(false); // Unbalanced parentheses
    });

    test('should reject expressions with invalid characters', () => {
      expect(validateExpression('x + y + z')).toBe(false); // 'z' not in valid chars
      expect(validateExpression('x + y + @')).toBe(false); // '@' not in valid chars
      expect(validateExpression('x + y + !')).toBe(false); // '!' not in valid chars
    });

    test('should handle edge cases', () => {
      expect(validateExpression('x')).toBe(false); // No mathematical structure
      expect(validateExpression('123')).toBe(false); // No mathematical structure
      expect(validateExpression('x y')).toBe(false); // No mathematical structure
    });
  });

  describe('Complex Voice Input Scenarios', () => {
    test('should handle polynomial functions', () => {
      const inputs = [
        'y equals x cubed minus 2 times x squared plus x minus 1',
        'y equals x to the power of 4 plus 3 times x squared minus 5',
        'y equals x squared plus 2 times x plus 1'
      ];

      const expected = [
        'y = x^3 - 2 * x^2 + x - 1',
        'y = x^4 + 3 * x^2 - 5',
        'y = x^2 + 2 * x + 1'
      ];

      inputs.forEach((input, index) => {
        expect(processVoiceInput(input)).toBe(expected[index]);
      });
    });

    test('should handle transcendental functions', () => {
      const inputs = [
        'y equals e to the x',
        'y equals natural log of x',
        'y equals sine of x',
        'y equals cosine of x',
        'y equals tangent of x'
      ];

      const expected = [
        'y = e^x',
        'y = ln(x)',
        'y = sin(x)',
        'y = cos(x)',
        'y = tan(x)'
      ];

      inputs.forEach((input, index) => {
        expect(processVoiceInput(input)).toBe(expected[index]);
      });
    });

    test('should handle composite functions', () => {
      const inputs = [
        'y equals sine of e to the x',
        'y equals natural log of square root of x',
        'y equals cosine of x squared',
        'y equals tangent of sine of x',
        'y equals e to the sine of x'
      ];

      const expected = [
        'y = sin(e^x)',
        'y = ln(sqrt(x))',
        'y = cos(x^2)',
        'y = tan(sin(x))',
        'y = e^(sin(x))'
      ];

      inputs.forEach((input, index) => {
        expect(processVoiceInput(input)).toBe(expected[index]);
      });
    });

    test('should handle implicit curves', () => {
      const inputs = [
        'x squared plus y squared equals 4',
        'x squared minus y squared equals 1',
        'x plus y equals 5'
      ];

      const expected = [
        'x^2 + y^2 = 4',
        'x^2 - y^2 = 1',
        'x + y = 5'
      ];

      inputs.forEach((input, index) => {
        expect(processVoiceInput(input)).toBe(expected[index]);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle empty input gracefully', () => {
      expect(processVoiceInput('')).toBe('');
      expect(processVoiceInput('   ')).toBe('');
    });

    test('should handle unrecognized patterns', () => {
      expect(processVoiceInput('hello world')).toBe('hello world');
      expect(processVoiceInput('random text')).toBe('random text');
    });

    test('should handle mixed valid and invalid content', () => {
      expect(processVoiceInput('y equals x plus some text')).toBe('y = x + some text');
      expect(processVoiceInput('some text y equals x')).toBe('some text y = x');
    });
  });
});


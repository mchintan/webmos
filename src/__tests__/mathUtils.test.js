import { evaluateExpression, parseEquation, parseUserInput } from '../utils/mathUtils';

describe('Math Utils', () => {
  describe('parseUserInput', () => {
    test('should handle basic mathematical notation', () => {
      expect(parseUserInput('x^2')).toBe('x**2');
      expect(parseUserInput('x^3')).toBe('x**3');
      expect(parseUserInput('2x')).toBe('2*x');
      expect(parseUserInput('x2')).toBe('x*2');
      expect(parseUserInput('sin(x)')).toBe('sin(x)');
      expect(parseUserInput('cos(x)')).toBe('cos(x)');
      expect(parseUserInput('tan(x)')).toBe('tan(x)');
      expect(parseUserInput('log(x)')).toBe('log(x)');
      expect(parseUserInput('ln(x)')).toBe('ln(x)');
      expect(parseUserInput('sqrt(x)')).toBe('sqrt(x)');
      expect(parseUserInput('abs(x)')).toBe('abs(x)');
    });

    test('should handle complex expressions', () => {
      expect(parseUserInput('x^2 + 2x + 1')).toBe('x**2 + 2*x + 1');
      expect(parseUserInput('sin(x^2) + cos(2x)')).toBe('sin(x**2) + cos(2*x)');
      expect(parseUserInput('e^x * ln(x)')).toBe('e**x * ln(x)');
      expect(parseUserInput('sqrt(x^2 + y^2)')).toBe('sqrt(x**2 + y**2)');
    });

    test('should handle implicit equations', () => {
      expect(parseUserInput('x^2 + y^2 = 4')).toBe('x**2 + y**2 - 4');
      expect(parseUserInput('x + y = 5')).toBe('x + y - 5');
      expect(parseUserInput('x^2 - y^2 = 1')).toBe('x**2 - y**2 - 1');
    });
  });

  describe('parseEquation', () => {
    test('should parse explicit functions', () => {
      const result = parseEquation('y = x^2');
      expect(result.type).toBe('explicit');
      expect(result.function).toBe('x**2');
    });

    test('should parse implicit equations', () => {
      const result = parseEquation('x^2 + y^2 = 4');
      expect(result.type).toBe('implicit');
      expect(result.expression).toBe('x**2 + y**2 - 4');
    });

    test('should handle complex explicit functions', () => {
      const result = parseEquation('y = sin(x^2) + cos(2x)');
      expect(result.type).toBe('explicit');
      expect(result.function).toBe('sin(x**2) + cos(2*x)');
    });

    test('should handle complex implicit equations', () => {
      const result = parseEquation('x^2 - y^2 = 1');
      expect(result.type).toBe('implicit');
      expect(result.expression).toBe('x**2 - y**2 - 1');
    });
  });

  describe('evaluateExpression', () => {
    test('should evaluate basic expressions', () => {
      expect(evaluateExpression('x + 1', { x: 2 })).toBe(3);
      expect(evaluateExpression('x^2', { x: 3 })).toBe(9);
      expect(evaluateExpression('2*x', { x: 4 })).toBe(8);
      expect(evaluateExpression('x/2', { x: 10 })).toBe(5);
    });

    test('should evaluate trigonometric functions', () => {
      expect(evaluateExpression('sin(x)', { x: 0 })).toBe(0);
      expect(evaluateExpression('cos(x)', { x: 0 })).toBe(1);
      expect(evaluateExpression('tan(x)', { x: 0 })).toBe(0);
      expect(evaluateExpression('sin(pi/2)', {})).toBeCloseTo(1);
      expect(evaluateExpression('cos(pi)', {})).toBeCloseTo(-1);
    });

    test('should evaluate logarithmic functions', () => {
      expect(evaluateExpression('log(10)', {})).toBe(1);
      expect(evaluateExpression('ln(e)', {})).toBe(1);
      expect(evaluateExpression('log(100, 10)', {})).toBe(2);
    });

    test('should evaluate complex expressions', () => {
      expect(evaluateExpression('sin(x^2) + cos(2*x)', { x: 1 })).toBeCloseTo(0.5403);
      expect(evaluateExpression('e^x * ln(x)', { x: 2 })).toBeCloseTo(5.545);
      expect(evaluateExpression('sqrt(x^2 + y^2)', { x: 3, y: 4 })).toBe(5);
    });

    test('should handle edge cases', () => {
      expect(evaluateExpression('1/0', {})).toBe(Infinity);
      expect(evaluateExpression('log(0)', {})).toBe(-Infinity);
      expect(evaluateExpression('sqrt(-1)', {})).toBe(NaN);
    });
  });

  describe('Complex Mathematical Functions', () => {
    test('should handle polynomial functions', () => {
      const equations = [
        'y = x^3 - 2x^2 + x - 1',
        'y = x^4 + 3x^2 - 5',
        'y = (x-1)(x-2)(x-3)',
        'y = x^2 + 2x + 1'
      ];

      equations.forEach(eq => {
        const parsed = parseEquation(eq);
        expect(parsed.type).toBe('explicit');
        expect(typeof parsed.function).toBe('string');
      });
    });

    test('should handle transcendental functions', () => {
      const equations = [
        'y = e^x',
        'y = ln(x)',
        'y = sin(x)',
        'y = cos(x)',
        'y = tan(x)',
        'y = arcsin(x)',
        'y = arccos(x)',
        'y = arctan(x)'
      ];

      equations.forEach(eq => {
        const parsed = parseEquation(eq);
        expect(parsed.type).toBe('explicit');
        expect(typeof parsed.function).toBe('string');
      });
    });

    test('should handle composite functions', () => {
      const equations = [
        'y = sin(e^x)',
        'y = ln(sqrt(x))',
        'y = cos(x^2)',
        'y = tan(sin(x))',
        'y = e^(sin(x))'
      ];

      equations.forEach(eq => {
        const parsed = parseEquation(eq);
        expect(parsed.type).toBe('explicit');
        expect(typeof parsed.function).toBe('string');
      });
    });

    test('should handle implicit curves', () => {
      const equations = [
        'x^2 + y^2 = 4',
        'x^2 - y^2 = 1',
        'x^2 + y^2 = 9',
        'x + y = 5',
        'x^2 + y^2 = 16'
      ];

      equations.forEach(eq => {
        const parsed = parseEquation(eq);
        expect(parsed.type).toBe('implicit');
        expect(typeof parsed.expression).toBe('string');
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid expressions gracefully', () => {
      expect(() => evaluateExpression('invalid', {})).toThrow();
      expect(() => evaluateExpression('x +', { x: 1 })).toThrow();
      expect(() => evaluateExpression('', {})).toThrow();
    });

    test('should handle missing variables', () => {
      expect(() => evaluateExpression('x + y', { x: 1 })).toThrow();
      expect(() => evaluateExpression('sin(x)', {})).toThrow();
    });
  });
});


// run tests with npx jest calculator.test.js --runInBand --config "{}"
let calculator;

beforeEach(() => {
    jest.resetModules();
    const { ImperialCalculator } = require('./calculator.js');
    calculator = new ImperialCalculator();
});

describe('calculate function', () => {
    test('adds two feet and inches values', () => {
        expect(calculator.calculate("5' 6\" + 2' 3\"")).toBe("7' 9\"");
    });

    test('subtracts two feet and inches values', () => {
        expect(calculator.calculate("10' 6\" - 2' 3\"")).toBe("8' 3\"");
    });

    test('multiplies feet and inches by a number', () => {
        expect(calculator.calculate("2' 6\" * 2")).toBe("5'");
    });

    test('divides feet and inches by a number', () => {
        expect(calculator.calculate("10' 0\" / 2")).toBe("5'");
    });

    test('handles decimal inches in result', () => {
        expect(calculator.calculate(`1.5' * 2`)).toBe(`3'`);
    });

    test('calculates with feet only', () => {
        expect(calculator.calculate("5' + 3'")).toBe("8'");
    });

    test('calculates with inches only', () => {
        expect(calculator.calculate("6\" + 6\"")).toBe("1'");
    });

    test('handles spaces in input format', () => {
        expect(calculator.calculate("5 ' 6 \" + 2 ' 3 \"")).toBe("7' 9\"");
    });

    test('multiplies meters by a unitless number', () => {
        expect(calculator.calculate('2m * 2')).toBe("13' 1.4804\"");
    });

    test('divides meters by a unitless number', () => {
        expect(calculator.calculate('2m / 2')).toBe("3' 3.3701\"");
    });

    test('adds imperial and metric operands together', () => {
        expect(calculator.calculate("1' + 1m")).toBe("4' 3.3701\"");
    });
});

describe('calculate function errors and exceptions', () => {
    test('throws when operator is missing', () => {
        expect(() => calculator.calculate("5' 6\"")).toThrow('Invalid calculation: missing operand or operator');
    });

    test('throws when second operand is missing', () => {
        expect(() => calculator.calculate("5' +")).toThrow('Invalid calculation: missing operand or operator');
    });

    test('throws for mixed unit and non-unit operand in plus or minus', () => {
        expect(() => calculator.calculate("5' + 3")).toThrow('Invalid calculation: cannot do plus or minus operations with operands with units and without units');
    });

    test('throws for multiply with two unit operands', () => {
        expect(() => calculator.calculate("5' * 2'")).toThrow('Not Supported: cannot do multiply or divide operations with two operands with units');
    });

    test('throws for divide with two unit operands', () => {
        expect(() => calculator.calculate("12\" / 3\"")).toThrow('Not Supported: cannot do multiply or divide operations with two operands with units');
    });

    test('throws for plus with meters and unitless operand', () => {
        expect(() => calculator.calculate('2m + 3')).toThrow('Invalid calculation: cannot do plus or minus operations with operands with units and without units');
    });

    test('throws for minus with meters and unitless operand', () => {
        expect(() => calculator.calculate('2m - 3')).toThrow('Invalid calculation: cannot do plus or minus operations with operands with units and without units');
    });
});
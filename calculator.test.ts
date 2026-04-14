import ImperialCalculator, { Component } from "./calculator";

let calculator: ImperialCalculator;

beforeEach(() => {
    jest.resetModules();
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

    test('add and minus operands with exponents', () => {
        expect(calculator.calculate("1'^2 + 1'^2")).toBe("2'^2");
        expect(calculator.calculate("2'^2 - 1'^2")).toBe("1'^2");
    });
    
    test('multiply and divide operands with exponents', () => {
        expect(calculator.calculate("1'^2 * 1'^2")).toBe("1'^4");
        expect(calculator.calculate("2'^4 / 1'^2")).toBe("2'^2");
    });

    test('divide two operands into 0 exponent should remove the unit', () => {
        expect(calculator.calculate("2'^2 / 1'^2")).toBe("2");
        expect(calculator.calculate("2' / 1'")).toBe("2");
    });

    test('divide two operands into 1 exponent should remove the exponent', () => {
        expect(calculator.calculate("2'^3 / 1'^2")).toBe("2'");
    });

    test('convert feet and inches with exponents', () => {
        expect(calculator.calculate('200"^2 * 1')).toBe(`1' 56"^2`);
        expect(calculator.calculate('20000"^3 * 1')).toBe(`11' 992"^3`);
        expect(calculator.calculate('5m^2 * 1')).toBe(`53' 118.0239"^2`);
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

    test('supports multiply with two unit operands', () => {
        expect(calculator.calculate("5' * 2'")).toBe("10'^2");
    });

    // test('throws for divide with two unit operands', () => {
    //     expect(() => calculator.calculate("12\" / 3\"")).toThrow('Not Supported: cannot do multiply or divide operations with two operands with units');
    // });

    test('throws for plus with meters and unitless operand', () => {
        expect(() => calculator.calculate('2m + 3')).toThrow('Invalid calculation: cannot do plus or minus operations with operands with units and without units');
    });

    test('throws for minus with meters and unitless operand', () => {
        expect(() => calculator.calculate('2m - 3')).toThrow('Invalid calculation: cannot do plus or minus operations with operands with units and without units');
    });

    test('throws for plus and minus with mixed power', () => {
        expect(() => calculator.calculate('2m^2 - 1m^3')).toThrow('Invalid calculation: cannot do plus or minus operations with operands with different exponents');
    });

    test('throws for divide into negative power', () => {
        expect(() => calculator.calculate('2m^2 / 1m^3')).toThrow('Not Supported: cannot do divide operations resulting in a negative exponent');
    });

    test('throws for divide into negative power', () => {
        expect(() => calculator.calculate('2^2 / 1^2')).toThrow('Not Supported: cannot process unitless numbers with exponents');
    });
});

describe('Unit conversions', () => {
    test('converts imperial operand components to meters', () => {
        const operand:Component[] = [
            { value: '1', unit: 'feet' },
            { value: '6', unit: 'inches' }
        ];

        calculator.toggleOperandUnits([operand], 'meters');

        expect(operand).toEqual([
            { value: '0.4572', unit: 'meters' }
        ]);
    });

    test('converts meters back to feet and inches', () => {
        const operand:Component[] = [
            { value: '1', unit: 'meters' }
        ];

        calculator.toggleOperandUnits([operand], 'inches');

        expect(operand).toEqual([
            { value: '3', unit: 'feet' },
            { value: '3.3701', unit: 'inches' }
        ]);
    });

    test('ignores pure numbers when toggling units', () => {
        const operand = [
            { value: '12', unit: null }
        ];

        calculator.toggleOperandUnits([operand], 'meters');

        expect(operand).toEqual([
            { value: '12', unit: null }
        ]);
    });
});

describe('Input capture', () => {
    test('removes unit before removing numeric value', () => {
        calculator.captureInput("5'");

        calculator.handleBack();

        expect(calculator.operand1).toEqual([
            { value: '5', unit: null }
        ]);
    });

    test('removes operator when there is no second operand', () => {
        calculator.captureInput("5' +");

        calculator.handleBack();

        expect(calculator.operator).toBeNull();
        expect(calculator.operand1).toEqual([
            { value: '5', unit: 'feet' }
        ]);
    });

    test('removes empty trailing second operand recursively', () => {
        calculator.operand1 = [{ value: '5', unit: 'feet' }];
        calculator.operator = '+';
        calculator.operand2 = [
            { value: '2', unit: 'feet' },
            { value: '', unit: null }
        ];

        calculator.handleBack();

        expect(calculator.operand2).toEqual([
            { value: '2', unit: null }
        ]);
    });

    test('capture exponent input one character at a time', () => {
        calculator.captureInput("5");
        calculator.captureInput("'");
        calculator.captureInput("^");
        calculator.captureInput("2");

        expect(calculator.operand1).toEqual([
            { value: '5', unit: 'feet', exponent: '2' }
        ]);
    });

    test('capture exponent input with multiple characters', () => {
        calculator.captureInput("5");
        calculator.captureInput("'");
        calculator.captureInput("^");
        calculator.captureInput("1");
        calculator.captureInput("0");

        expect(calculator.operand1).toEqual([
            { value: '5', unit: 'feet', exponent: '10' }
        ]);
    });

    test('capture more inputs after an exponent', () => {
        calculator.captureInput("5'^2");
        calculator.captureInput("+");
        calculator.captureInput("12");
        calculator.captureInput("'");
        calculator.captureInput("^");
        calculator.captureInput("2");

        expect(calculator.operand1).toEqual([
            { value: '5', unit: 'feet', exponent: '2' }
        ]);
        expect(calculator.operator).toBe('+');
        expect(calculator.operand2).toEqual([
            { value: '12', unit: 'feet', exponent: '2' }
        ]);
    });

    test('toggle unit when entering an exponent', () => {
        calculator.captureInput("5'");
        calculator.captureInput("^");
        calculator.captureInput("2");
        calculator.captureInput("m");

        expect(calculator.operand1).toEqual([
            { value: '5', unit: 'meters', exponent: '2' }
        ]);
    });
});

describe('negative values', () => {
    test('adds negative imperial values', () => {
        expect(calculator.calculate("-5' 6\" - 2' 3\"")).toBe("-7' 9\"");
    });

    test('subtracts negative imperial values', () => {
        expect(calculator.calculate("-10' 6\" + 2' 3\"")).toBe("-8' 3\"");
    });

    test('multiplies negative imperial values by a negative number', () => {
        expect(calculator.calculate("-2' 6\" * 2")).toBe("-5'");
    });

    test('performs operations with negative metric values', () => {
        expect(calculator.calculate('-2m - 1m')).toBe("-9' 10.1103\"");
    });

    test('adds negative imperial and negative metric operands together', () => {
        expect(calculator.calculate("-1' - 1m")).toBe("-4' 3.3701\"");
    });

    test('performs operations with negative unitless numbers', () => {
        expect(calculator.calculate("-5 - 3")).toBe("-8");
    });

    test('multiplies negative unitless numbers', () => {
        expect(calculator.calculate("-5 * 2")).toBe("-10");
    });

    test('divides negative imperial by negative number', () => {
        expect(calculator.calculate("-10' 0\" / 2")).toBe("-5'");
    });
});
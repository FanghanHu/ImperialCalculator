// run tests with npx jest calculator.test.js --runInBand --config "{}"
const { calculate } = require('./calculator.js');

describe('calculate function', () => {
    test('adds two feet and inches values', () => {
        expect(calculate("5' 6\" + 2' 3\"")).toEqual({ feet: 7, inches: 9 });
    });

    test('subtracts two feet and inches values', () => {
        expect(calculate("10' 6\" - 2' 3\"")).toEqual({ feet: 8, inches: 3 });
    });

    test('multiplies feet and inches by a number', () => {
        expect(calculate("2' 6\" * 2")).toEqual({ feet: 5, inches: 0 });
    });

    test('divides feet and inches by a number', () => {
        expect(calculate("10' 0\" / 2")).toEqual({ feet: 5, inches: 0 });
    });

    test('handles decimal inches in result', () => {
        expect(calculate("1' 0\" / 3")).toEqual({ feet: 0, inches: 4 });
    });

    test('calculates with feet only', () => {
        expect(calculate("5' + 3'")).toEqual({ feet: 8, inches: 0 });
    });

    test('calculates with inches only', () => {
        expect(calculate("6\" + 6\"")).toEqual({ feet: 1, inches: 0 });
    });

    test('handles spaces in input format', () => {
        expect(calculate("5 ' 6 \" + 2 ' 3 \"")).toEqual({ feet: 7, inches: 9 });
    });
});
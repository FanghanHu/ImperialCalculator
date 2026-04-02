// an array to store components of the first operand, such as feet and inches, each component is an object with the value and unit. for example [ { value: '5', unit: 'feet' }, { value: '6', unit: 'inches' } ]
const operand1 = [];
//similarly, an array to store components of the second operand
const operand2 = [];

//a variable to store the current operator, such as +, -, *, or /
let operator = null;

//only run this if the script is being run in a browser environment
if (typeof window !== 'undefined') {
    document.addEventListener('keydown', function(event) {
        //when the key is a number, a feet symbol, an inches symbol, 'm', a decimal point, an operator, or the Enter key, capture the input
        if ((event.key >= '0' && event.key <= '9') || event.key === "'" || event.key === '"' || event.key === 'm' || event.key === '.' || ['+', '-', '*', '/'].includes(event.key) || event.key === 'Enter') {
            if (event.key === 'Enter') {
                //when the Enter key is pressed, calculate the result and display it in the textarea
                const result = calculate();
                document.getElementById('display').value += '\n' + result;
            } else {
                captureInput(event.key);
            }
        }
    });
}

function captureInput(input) {
    for(let i = 0; i < input.length; i++) {
        const char = input[i];
        if(!operator) { //if there is no operator, we are entering value for operand1
            if(!operand1[operand1.length - 1]?.unit) { //if the last component of operand1 doesn't have a unit, we are still entering the value for the current component
                //if operand1 doesn't have any component yet, create a new component with null value and unit, and capture the value for this component, otherwise capture the value for the last component
                captureOperandValue(char, operand1[operand1.length - 1] || (operand1[operand1.length] = { value: null, unit: null }));
            } else {
                //if the last component of operand1 has a unit, we are capturing the next component
                captureOperandValue(char, operand1[operand1.length] = { value: null, unit: null });
            }
        } else {
            //entering value for operand2
            if(!operand2[operand2.length - 1]?.unit) { //if the last component of operand2 doesn't have a unit, we are still entering the value for the current component
                //if operand2 doesn't have any component yet, create a new component with null value and unit, and capture the value for this component, otherwise capture the value for the last component
                captureOperandValue(char, operand2[operand2.length - 1] || (operand2[operand2.length] = { value: null, unit: null }));
            } else {
                //if the last component of operand2 has a unit, we are capturing the next component
                captureOperandValue(char, operand2[operand2.length] = { value: null, unit: null });
            }
        }
    }
}

/**
 * 
 * @param {string} char -- a single character 
 * @param {{value: string|null, unit: string}} operand 
 */
function captureOperandValue(char, operand) {
    if (char >= '0' && char <= '9') {
        //if the char is a number, append it to the current value
        operand.value = (operand.value || '') + char;
    } else if (char === "'") {
        //if the char is a feet symbol, set the unit to feet
        operand.unit = 'feet';
    } else if (char === '"') {
        //if the char is an inches symbol, set the unit to inches
        operand.unit = 'inches';
    } else if (char === 'm') {
        //if the char is 'm' , set the unit to meters
        operand.unit = 'meters';
    } else if (char === '.') {
        //if the char is a decimal point
        if (operand.unit === 'inches' && operand.value !== null && !operand.value.includes('.')) {
            operand.value = (operand.value || '') + '.';
        }
    }
}

/**
 * Calculate the result of the current input and display it in the textarea
 */
function calculate(input) {
    //TODO: do the calculation with the captured operands and operator, and return the result as a string

    return `1'2"`;
}

/**
 * @param {string} input - a string representing a feet and inches value, or just a number, such as 5'6", 5', 6", or 5.5
 * extract the feet and inches component from the input string and return an object with the feet, inches
 * if the input only contains a number, without any feet or inches symbol, return the number instead.
 */
function extractFeetInches(input) {
    const regex = /([0-9.]+)(?:\s*'?\s*([0-9.]+)"?)?/;
    const match = input.match(regex);

    if (!match || !match[2]) {
        //if regex didn't match or there is no feet or inches symbol, return the number directly
        return parseFloat(input);
    }
    return {
        feet: parseInt(match[1]) || 0,
        inches: parseInt(match[2]) || 0
    };
}

/**
 * convert a number in inches to an object with the feet and inches component
 */
function convertToFeetInches(totalInches) {
    const inches = Math.round(totalInches % 12 * 10000) / 10000; //keep 4 decimal places for inches
    const feet = Math.floor(totalInches / 12);
    return {
        feet: feet,
        inches: inches
    };
}

/**
 * convert an operand object with the feet and inches component to a number in inches
 */
function converToInches(operand) {
    //if the operand is a number, return it directly
    if (typeof operand === 'number') {
        return operand;
    }

    return Math.round((operand.feet * 12 + operand.inches) * 10000) / 10000; //keep 4 decimal places for inches
}

exports.calculate = calculate;
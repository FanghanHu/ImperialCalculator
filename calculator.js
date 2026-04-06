/**
 * this calculator does imperial unit calculation and conversions.
 * when calculating, the operands are first converted to inches, then results are displayed in feet and inches.
 * 
 * the units of the operands matter:
 * imperial/metric units + or - imperial/metric units = imperial units
 * imperial/metric units * or / number = imperial units
 * number + or - or * or / number = number
 * imperial/metric units + or - number = invalid calculation
 * imperial/metric units * or / imperial/metric units = invalid calculation (unsupported, this requires tracking the power of the units, for example feet^2 or meter^3, which is not supported in this calculator)
 */

const imperialCalculator = {
    // an array to store components of the first operand, such as feet and inches, each component is an object with the value and unit. for example [ { value: '5', unit: 'feet' }, { value: '6', unit: 'inches' } ]
    operand1: [],
    //similarly, an array to store components of the second operand
    operand2: [],
    //a variable to store the current operator, such as +, -, *, or /
    operator: null,
    //an array to store the output of each calculation, which will be displayed in the textarea
    output: []
};

//only run this if the script is being run in a browser environment
if (typeof window !== 'undefined') {
    //add an event listener to capture keyboard input for the calculator
    document.addEventListener('keydown', function(event) {
        //when the key is a number, a feet symbol, an inches symbol, 'm', a decimal point, an operator, or the Enter key, capture the input
        if ((event.key >= '0' && event.key <= '9') || ['+', '-', '*', '/', "'", '"', 'm', '.', '='].includes(event.key) || event.key === 'Enter') {
            if (event.key === 'Enter' || event.key === '=') {
                //when the Enter key is pressed, calculate the result and display it in the textarea
                calculate();
            } else {
                captureInput(event.key);
                //display operand1, operator, and operand2 in the respective divs for debugging purposes
                document.getElementById('operand1').textContent = operandToString(imperialCalculator.operand1);
                document.getElementById('operator').textContent = imperialCalculator.operator || '';
                document.getElementById('operand2').textContent = operandToString(imperialCalculator.operand2);
            }
        }
    });
}

/**
 * @param {string} input -- calculation input string, for example "5' 6\" + 2' 3\"" 
 */
function captureInput(input) {
    for(let i = 0; i < input.length; i++) {
        const char = input[i];

        //the current component we are capturing value or units for, it can be the last component of operand1 or operand2 depending on whether we have captured an operator yet
        const currentComponent = imperialCalculator.operator
            ? imperialCalculator.operand2[imperialCalculator.operand2.length - 1]
            : imperialCalculator.operand1[imperialCalculator.operand1.length - 1];

        if(['+', '-', '*', '/'].includes(char)) { 
            //we are entering an operator
            if(imperialCalculator.operand2.length > 0) {
                //if there is already an operator, we need to calculate the result of the current operands and operator before capturing the new operator
                const result = calculate();
                //capture the result as the new operand1
                captureInput(result);
            }

            //capture the operator if there are no operator yet, or we don't have an operand2 yet, which means we can still change operator
            imperialCalculator.operator = char;
            continue;
        } else if([`'`, `"`, 'm'].includes(char) && (i === 0 || input[i - 1] === ' ')) { 
            //we are entering a unit
            if (currentComponent && currentComponent.value) {
                //set unit if we have a current component and it has a value, otherwise we can't determine which unit to set
                currentComponent.unit = char === `'` ? 'feet' : char === `"` ? 'inches' : char === 'm' ? 'meters' : null;
            } 
        } else if(char === '=') {
            //we are entering the equal sign, which means we want to calculate the result
            const result = calculate();
            //capture the result as the new operand1 for the next calculation
            captureInput(result);
        } else if(char === ' '){
            //ignore spaces
            continue;
        } else { 
            //we are entering values
            if(!currentComponent || currentComponent.unit) {
                //if there is no current component, or the current component already has a unit, we need to create a new component for the new value
                const newComponent = { value: null, unit: null };
                capturecomponentValue(char, newComponent);
                if (imperialCalculator.operator) {
                    imperialCalculator.operand2.push(newComponent);
                } else {
                    imperialCalculator.operand1.push(newComponent);
                }
            } else {
                //capture value for the current component
                capturecomponentValue(char, currentComponent);
            }
        }
    }
}

/**
 *  append value or change unit for the current component based on the input char
 * @param {string} char -- a single character 
 * @param {{value: string|null, unit: string}} component 
 */
function capturecomponentValue(char, component) {
    if (char >= '0' && char <= '9') {
        //if the char is a number, append it to the current value
        component.value = (component.value || '') + char;
    } else if (char === "'") {
        //if the char is a feet symbol, set the unit to feet
        component.unit = 'feet';
    } else if (char === '"') {
        //if the char is an inches symbol, set the unit to inches
        component.unit = 'inches';
    } else if (char === 'm') {
        //if the char is 'm' , set the unit to meters
        component.unit = 'meters';
    } else if (char === '.') {
        //if the char is a decimal point
        if ((component.unit === 'inches' || !component.unit) && component.value !== null && !component.value.includes('.')) { //only allow a single decimal point
            component.value = (component.value || '') + '.';
        }
    }
}

/**
 * Calculate the result of the current input and display it in the textarea
 */
function calculate(input) {
    if(input) {
        captureInput(input);
    }
    console.log('Calculating with operand1:', imperialCalculator.operand1, 'operator:', imperialCalculator.operator, 'operand2:', imperialCalculator.operand2);
    //TODO: do the calculation with the captured operands and operator, and return the result as a string

    if(imperialCalculator.operand1.length === 0 || imperialCalculator.operator === null || imperialCalculator.operand2.length === 0) {
        throw new Error('Invalid calculation: missing operand or operator');
    }
    
    if(
        (imperialCalculator.operand1.some(component => component.unit !== null) && imperialCalculator.operand1.some(component => component.unit === null)) ||
        (imperialCalculator.operand2.some(component => component.unit !== null) && imperialCalculator.operand2.some(component => component.unit === null))
    ) {
        throw new Error('Invalid calculation: cannot combine components with units and without units');
    }

    if(
        (imperialCalculator.operator === '+' || imperialCalculator.operator === '-') && (
            (imperialCalculator.operand1.some(component => component.unit !== null) && imperialCalculator.operand2.some(component => component.unit === null)) ||
            (imperialCalculator.operand1.some(component => component.unit === null) && imperialCalculator.operand2.some(component => component.unit !== null))
        )
    ) {
        throw new Error('Invalid calculation: cannot do plus or minus operations with operands with units and without units');
    }

    if(
        (imperialCalculator.operator === '*' || imperialCalculator.operator === '/') && 
        imperialCalculator.operand1.some(component => component.unit !== null) && 
        imperialCalculator.operand2.some(component => component.unit !== null)
    ) {
        throw new Error('Not Supported: cannot do multiply or divide operations with two operands with units');
    }

    const total1 = aggrateOperand(imperialCalculator.operand1);
    const total2 = aggrateOperand(imperialCalculator.operand2);
    let calculationResult;
    switch (imperialCalculator.operator) { //maybe avoid using eval()
        case '+':
            calculationResult = total1 + total2;
            break;
        case '-':
            calculationResult = total1 - total2;
            break;
        case '*':
            calculationResult = total1 * total2;
            break;
        case '/':
            calculationResult = total1 / total2;
            break;
        default:
            throw new Error('Invalid operator: ' + imperialCalculator.operator);
    }

    let result;

    if(imperialCalculator.operand1.some(component => component.unit !== null) || imperialCalculator.operand2.some(component => component.unit !== null)) {
        //if either operand has units, it means the result should be in imperial units, we will convert the result in inches back to feet and inches for display
        const resultOperand = inchesToOperand(calculationResult);
        result = operandToString(resultOperand);
    } else {
        //if both operands are just numbers without units, we will return the result as a number string
        result = calculationResult.toString();
    }

    //clear operands
    imperialCalculator.operand1 = [];
    imperialCalculator.operand2 = [];
    imperialCalculator.operator = null;
    imperialCalculator.output.push(result);
    return result;
}

/**
 * turn an operand array back to a string for display, for example [ { value: '5', unit: 'feet' }, { value: '6', unit: 'inches' } ] will be turned back to "5' 6\""
 * @param {[{value: string|null, unit:'feet'|'inches'|'meters'}]} operand 
 */
function operandToString(operand) {
    let result = '';
    for (const component of operand) {
        if (component.value !== null && component.unit) {
            let unitSymbol = '';
            switch (component.unit) { 
                case 'feet':
                    unitSymbol = "'";
                    break;
                case 'inches':
                    unitSymbol = '"';
                    break;
                case 'meters':
                    unitSymbol = 'm';
                    break;
            }
            result += component.value + unitSymbol + ' ';
        }
    }
    return result.trim();
}

/**
 * convert a number in inches to an operand array with feet and inches, for example 66 inches will be converted to [ { value: '5', unit: 'feet' }, { value: '6', unit: 'inches' } ]
 * @param {number} totalInches
 */
function inchesToOperand(totalInches) {
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round((totalInches % 12) * 10000) / 10000;
    const operand = [];
    if (feet > 0) {
        operand.push({ value: feet.toString(), unit: 'feet' });
    }
    if (inches > 0) {
        operand.push({ value: inches.toString(), unit: 'inches' });
    }
    if (operand.length === 0) {
        operand.push({ value: '0', unit: 'inches' });
    }
    return operand;
}

/**
 * combine the components of an operand array to get the total value in inches, for example [ { value: '5', unit: 'feet' }, { value: '6', unit: 'inches' } ] will be converted to 66 inches
 * meters will be converted to inches as well, 1 meter = 39.3701 inches, [ { value: '2', unit: 'meters' } ] will be converted to 78.7402 inches
 * operand without a unit will remine as a number, for example [ { value: '5', unit: null } ] will be converted to 5
 * @param {[{value: string|null, unit:'feet'|'inches'|'meters'}]} operand
 */
function aggrateOperand(operand) {
    //special case: when we only have 2 components, and first component is in feets, but 2nd component doesn't have a unit, we can assume the 2nd component is in inches, for example [ { value: '5', unit: 'feet' }, { value: '6', unit: null } ] can be converted to 66 inches
    if (operand.length === 2 && operand[0].unit === 'feet' && operand[1].unit === null) {
        operand[1].unit = 'inches';
    }

    //either all of the compoents should have units or none of them, we cannot combine united component with non-unit components, throw an error if that is the case
    const hasUnit = operand.some(component => component.unit !== null);
    const hasNonUnit = operand.some(component => component.unit === null);
    if (hasUnit && hasNonUnit) {
        throw new Error('Invalid operand: cannot combine components with units and without units');
    }

    let totalInches = 0;
    for (const component of operand) {
        if (component.value !== null && component.unit) {
            switch (component.unit) {
                case 'feet':
                    totalInches += parseFloat(component.value) * 12;
                    break;
                case 'inches':
                    totalInches += parseFloat(component.value);
                    break;
                case 'meters':
                    totalInches += parseFloat(component.value) * 39.3701;
                    break;
            }
        } else if (component.value !== null) {
            totalInches += parseFloat(component.value);
        }
    }
    return Math.round(totalInches * 10000) / 10000; //keep 4 decimal places for inches
}

//only export the calculate function for testing purposes
if (typeof window == 'undefined') {
    exports.calculate = calculate;
}
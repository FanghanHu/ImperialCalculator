/**
 * #this calculator does imperial unit calculation and conversions.  
 * when calculating, the operands are first converted to inches, then results are displayed in feet and inches.
 * values are rounded to four decimal places when converted between units.
 * 
 * ### the units of the operands matter:
 * imperial/metric units + or - imperial/metric units = imperial units  
 * imperial/metric units * or / number = imperial units  
 * number + or - or * or / number = number  
 * imperial/metric units + or - number = invalid calculation  
 * imperial/metric units * or / imperial/metric units = invalid calculation (unsupported, this requires tracking the power of the units, for example feet^2 or meter^3, which is not supported in this calculator)  
 * 
 * Note on negative values:
 * If the first component of an operand has a negative value, the entire operand is considered negative.
 * There will be operands with only the first component being negative (for example when user type it in), in which case the entire operand is considered negative.
 * There will also be operands with all its components being negative (when we parse a calculation result), in which case the entire operand is considered negative.
 */

export type Unit = 'feet' | 'inches' | 'meters';
export type Operator = '+' | '-' | '*' | '/';

export interface Component {
    value: string | null;
    unit: Unit | null;
    exponent?: string | null;
}

const METER_TO_INCH = 39.3701;
const FEET_TO_INCH = 12;

class ImperialCalculator {
    // an array to store components of the first operand, such as feet and inches, each component is an object with the value and unit. for example [ { value: '5', unit: 'feet' }, { value: '6', unit: 'inches' } ]
    operand1: Component[];
    //similarly, an array to store components of the second operand
    operand2: Component[];
    //a variable to store the current operator, such as +, -, *, or /
    operator: Operator | null;
    //the unit for the result, we will convert the result to this unit for display, it can be either 'inches' or 'meters', default to 'inches'
    resultUnit: Unit;

    constructor() {
        this.operand1 = [];
        this.operand2 = [];
        this.operator = null;
        this.resultUnit = 'inches';
    }

    /**
     * @param input -- calculation input string, for example "5' 6\" + 2' 3\""
     */
    captureInput(input: string): void {
        for (let i = 0; i < input.length; i++) {
            const char = input[i];

            //the current component we are capturing value or units for, it can be the last component of operand1 or operand2 depending on whether we have captured an operator yet
            const currentComponent = this.operator
                ? this.operand2[this.operand2.length - 1]
                : this.operand1[this.operand1.length - 1];

            const activeOperand = this.operator ? this.operand2 : this.operand1;

            if (char === '^') {
                if (activeOperand.length > 0) {
                    // Initialize exponent to '' to mark that we are in exponent-capture mode.
                    // Subsequent digit characters (one at a time or in a batch) will append to it.
                    activeOperand[0].exponent = activeOperand[0].exponent ?? '';

                    // Consume any exponent digits that immediately follow in the current string.
                    while (i + 1 < input.length && input[i + 1] >= '0' && input[i + 1] <= '9') {
                        activeOperand[0].exponent += input[i + 1];
                        i += 1;
                    }
                }
                continue;
            }

            if (['+', '-', '*', '/'].includes(char)) {
                if(!this.operand1?.[0]?.value && char === '-') {
                    //if the first operand is empty and the char is a minus sign, start capturing a negative value
                    if (!currentComponent) {
                        const newComponent: Component = { value: '-', unit: null };
                        this.operand1.push(newComponent);
                    } else {
                        currentComponent.value = '-' ;
                    }
                    continue;
                }

                //we are entering an operator
                if (this.operand2.length > 0) {
                    //if there is already an operator, we need to calculate the result of the current operands and operator before capturing the new operator
                    const result = this.calculate();
                    //capture the result as the new operand1
                    this.captureInput(result);
                }

            //capture the operator if there are no operator yet, or we don't have an operand2 yet, which means we can still change operator
                this.operator = char as Operator;
                continue;
            } else if ([`'`, `"`, 'm'].includes(char) && (i === 0 || input[i - 1] === ' ')) {
                //we are entering a unit
                if (currentComponent && currentComponent.value) {
                    //set unit if we have a current component and it has a value, otherwise we can't determine which unit to set
                    currentComponent.unit = char === `'` ? 'feet' : char === `"` ? 'inches' : char === 'm' ? 'meters' : null;
                }
            } else if (char === '=') {
                //we are entering the equal sign, which means we want to calculate the result
                this.calculate();
            } else if (char === ' ') {
                //ignore spaces
                continue;
            } else {
                //we are entering values

                // If the active operand is in exponent-capture mode ('^' was the last structural input)
                // and the character is a digit, append it to the exponent instead of the value.
                if (
                    char >= '0' && char <= '9' &&
                    activeOperand.length > 0 &&
                    activeOperand[0].exponent !== undefined
                ) {
                    activeOperand[0].exponent += char;
                    continue;
                }

                if (!currentComponent || currentComponent.unit) {
                    //if there is no current component, or the current component already has a unit, we need to create a new component for the new value
                    const newComponent: Component = { value: null, unit: null };
                    this.captureComponentValue(char, newComponent);
                    if (this.operator) {
                        this.operand2.push(newComponent);
                    } else {
                        this.operand1.push(newComponent);
                    }
                } else {
                    //capture value for the current component
                    this.captureComponentValue(char, currentComponent);
                }
            }
        }
    }

    /**
     *  append value or change unit for the current component based on the input char
     * @param char -- a single character
     * @param component
     */
    captureComponentValue(char: string, component: Component): void {
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
            if ((component.unit === 'inches' || !component.unit) && component.value !== null && !component.value.includes('.')) {
                //only allow a single decimal point
                component.value = (component.value || '') + '.';
            }
        }
    }

    /**
     * Calculate the result of the current input and display it in the textarea
     */
    calculate(input?: string): string {
        if (input) {
            this.operand1 = [];
            this.operand2 = [];
            this.operator = null;
            this.captureInput(input);
        }
        // console.log('Calculating with operand1:', this.operand1, 'operator:', this.operator, 'operand2:', this.operand2);

        if (this.operand1.length === 0 || this.operator === null || this.operand2.length === 0) {
            throw new Error('Invalid calculation: missing operand or operator');
        }

        for(const operand of [this.operand1, this.operand2]) {
            // Special case: interpret a trailing unitless component as inches in feet-and-inches input.
            // Example: [5 feet, 6] should be treated as [5 feet, 6 inches].
            if (operand.length === 2 && operand[0].unit === 'feet' && operand[1].unit === null) {
                operand[1].unit = 'inches';
            }
        }

        if (
            (this.operand1.some(component => component.unit !== null) && this.operand1.some(component => component.unit === null)) ||
            (this.operand2.some(component => component.unit !== null) && this.operand2.some(component => component.unit === null))
        ) {
            throw new Error('Invalid calculation: cannot combine components with units and without units');
        }

        if (
            (this.operator === '+' || this.operator === '-') &&
            ((this.operand1.some(component => component.unit !== null) && this.operand2.some(component => component.unit === null)) ||
                (this.operand1.some(component => component.unit === null) && this.operand2.some(component => component.unit !== null)))
        ) {
            throw new Error('Invalid calculation: cannot do plus or minus operations with operands with units and without units');
        }

        const operand1HasUnits = this.operandHasUnits(this.operand1);
        const operand2HasUnits = this.operandHasUnits(this.operand2);
        const operand1Exponent = this.getEffectiveOperandExponent(this.operand1);
        const operand2Exponent = this.getEffectiveOperandExponent(this.operand2);
        const operand1ExplicitExponent = this.getOperandExponent(this.operand1);
        const operand2ExplicitExponent = this.getOperandExponent(this.operand2);

        if ((!operand1HasUnits && operand1ExplicitExponent !== null) || (!operand2HasUnits && operand2ExplicitExponent !== null)) {
            throw new Error('Not Supported: cannot process unitless numbers with exponents');
        }

        if (
            (this.operator === '+' || this.operator === '-') &&
            operand1HasUnits &&
            operand2HasUnits &&
            operand1Exponent !== operand2Exponent
        ) {
            throw new Error('Invalid calculation: cannot do plus or minus operations with operands with different exponents');
        }

        const total1 = this.aggrateOperand(this.operand1);
        const total2 = this.aggrateOperand(this.operand2);
        let calculationResult: number;
        let resultExponent: number | null = null;
        switch (this.operator) {
            case '+':
                calculationResult = total1 + total2;
                resultExponent = operand1HasUnits ? operand1Exponent : null;
                break;
            case '-':
                calculationResult = total1 - total2;
                resultExponent = operand1HasUnits ? operand1Exponent : null;
                break;
            case '*':
                calculationResult = total1 * total2;
                if (operand1HasUnits && operand2HasUnits) {
                    resultExponent = (operand1Exponent ?? 1) + (operand2Exponent ?? 1);
                } else if (operand1HasUnits) {
                    resultExponent = operand1Exponent;
                } else if (operand2HasUnits) {
                    resultExponent = operand2Exponent;
                }
                break;
            case '/':
                calculationResult = total1 / total2;
                if (operand1HasUnits && operand2HasUnits) {
                    resultExponent = (operand1Exponent ?? 1) - (operand2Exponent ?? 1);
                } else if (operand1HasUnits) {
                    resultExponent = operand1Exponent;
                } else if (operand2HasUnits) {
                    resultExponent = -(operand2Exponent ?? 1);
                }

                if (resultExponent !== null && resultExponent < 0) {
                    throw new Error('Not Supported: cannot do divide operations resulting in a negative exponent');
                }

                break;
            default:
                throw new Error('Invalid operator: ' + this.operator);
        }

        let result: string;
        if ((operand1HasUnits || operand2HasUnits) && resultExponent !== 0) {
            //if either operand has units, it means the result should be in imperial units, we will convert the result in inches back to feet and inches for display
            const resultOperand = this.inchesToOperand(calculationResult, resultExponent ?? 1);

            if (this.resultUnit === 'meters') {
                this.toggleOperandUnits([resultOperand], 'meters'); //convert the result operand to meters if the result unit is set to meters
            }

            result = this.operandToString(resultOperand);
        } else {
            //if both operands are just numbers without units, we will return the result as a number string
            result = calculationResult.toString();
        }

        //clear operands
        this.operand1 = [];
        this.operand2 = [];
        this.operator = null;
        return result;
    }

    /**
     * Format operand for in-progress capture display, including value-only components.
     */
    operandToString(operand: Component[]): string {
        const exponent = this.getEffectiveOperandExponent(operand);
        const segments: string[] = [];

        for (const component of operand) {
            if (component.value !== null) {
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
                    default:
                        unitSymbol = '';
                }
                // only render a single '-' in front of the result if the value is negative
                segments.push((segments.length && component.value.startsWith('-') ? component.value.substring(1) : component.value) + unitSymbol);
            }
        }

        const result = segments.join(' ');
        if (exponent !== null && exponent > 1) {
            return result + '^' + exponent;
        }

        return result;
    }

    /**
     * convert a number in inches to an operand array with feet and inches, for example 66 inches will be converted to [ { value: '5', unit: 'feet' }, { value: '6', unit: 'inches' } ]
     * supports negative numbers, for example -66 inches will be converted to [ { value: '-5', unit: 'feet' }, { value: '-6', unit: 'inches' } ]
     */
    inchesToOperand(totalInches: number, exponent = 1): Component[] {
        const isNegative = totalInches < 0;
        const absTotalInches = Math.abs(totalInches);

        const feetUnitSize = Math.pow(FEET_TO_INCH, exponent);
        const feet = Math.floor(absTotalInches / feetUnitSize);
        const inches = Math.round((absTotalInches % feetUnitSize) * 10000) / 10000;
        const operand: Component[] = [];

        if (feet > 0) {
            operand.push({ value: (isNegative ? -feet : feet).toString(), unit: 'feet' });
        }
        if (inches > 0) {
            operand.push({ value: (isNegative ? -inches : inches).toString(), unit: 'inches' });
        }
        if (operand.length === 0) {
            operand.push({ value: '0', unit: 'inches' });
        }

        this.setOperandExponent(operand, exponent);
        return operand;
    }

    /**
     * combine the components of an operand array to get the total value in inches, for example [ { value: '5', unit: 'feet' }, { value: '6', unit: 'inches' } ] will be converted to 66 inches
     * meters will be converted to inches as well, 1 meter = 39.3701 inches, [ { value: '2', unit: 'meters' } ] will be converted to 78.7402 inches
     * operand without a unit will remine as a number, for example [ { value: '5', unit: null } ] will be converted to 5
     */
    aggrateOperand(operand: Component[]): number {
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

        //if the first component is negative, the entire operand is considered negative
        const isNegative = operand?.[0]?.value?.startsWith('-');
        const exponent = this.getEffectiveOperandExponent(operand) ?? 1;

        let totalInches = 0;
        for (const component of operand) {
            if (component.value !== null && component.unit) {
                switch (component.unit) {
                    case 'feet':
                        totalInches += Math.abs(parseFloat(component.value) * Math.pow(FEET_TO_INCH, exponent));
                        break;
                    case 'inches':
                        totalInches += Math.abs(parseFloat(component.value));
                        break;
                    case 'meters':
                        totalInches += Math.abs(parseFloat(component.value) * Math.pow(METER_TO_INCH, exponent));
                        break;
                }
            } else if (component.value !== null) {
                totalInches += Math.abs(parseFloat(component.value));
            }
        }

        if (isNegative) {
            totalInches = -totalInches;
        }
        return Math.round(totalInches * 10000) / 10000; //keep 4 decimal places for inches
    }

    /**
     * remove the last character from the current input, this is used for the backspace button
     */
    handleBack(): void {
        if (this.operand2.length > 0) {
            if (this.trimOperandExponent(this.operand2)) {
                return;
            }

            const lastComponent = this.operand2[this.operand2.length - 1];
            if (lastComponent.unit) {
                lastComponent.unit = null;
            } else if (lastComponent.value) {
                lastComponent.value = lastComponent.value.slice(0, -1);
            } else {
                this.operand2.pop();
                this.handleBack(); //after popping the last component, we need to check the new last component in case we need to remove unit or value from it as well
            }
        } else if (this.operator) {
            this.operator = null;
        } else if (this.operand1.length > 0) {
            if (this.trimOperandExponent(this.operand1)) {
                return;
            }

            const lastComponent = this.operand1[this.operand1.length - 1];
            if (lastComponent.unit) {
                lastComponent.unit = null;
            } else if (lastComponent.value) {
                lastComponent.value = lastComponent.value.slice(0, -1);
            } else {
                this.operand1.pop();
                this.handleBack();
            }
        }
    }

    /**
     * Toggle unit-bearing components between feet, inches and meters.
     * Unitless components are ignored.
     */
    toggleOperandUnits(operands: Component[][], targetUnit: Unit): void {
        for(const operand of operands) {
            if(operand.length === 0) {
                continue; //skip if there is no component in the operand
            }

            if(operand.some(component => component.unit == null)) {
                continue; //skip if there are any unitless components, we cannot toggle units for this operand
            }

            const totalInches = this.aggrateOperand(operand);
            const exponent = this.getOperandExponent(operand);
            const effectiveExponent = this.getEffectiveOperandExponent(operand) ?? 1;

            switch (targetUnit) {
                case 'meters': {
                    const totalMeters = Math.round((totalInches / Math.pow(METER_TO_INCH, effectiveExponent)) * 10000) / 10000;
                    operand.length = 0; //clear the operand array
                    operand.push({ value: totalMeters.toString(), unit: 'meters' });
                    this.setOperandExponent(operand, exponent);
                    break;
                }
                case 'inches':
                    operand.length = 0; //clear the operand array
                    operand.push(...this.inchesToOperand(totalInches, effectiveExponent)); //convert inches to feet and inches components and push to operand array
                    break;
            }  
        }    
    }

    operandHasUnits(operand: Component[]): boolean {
        return operand.some(component => component.unit !== null);
    }

    getOperandExponent(operand: Component[]): number | null {
        const exponent = operand?.[0]?.exponent;
        return exponent ? parseInt(exponent, 10) : null;
    }

    getEffectiveOperandExponent(operand: Component[]): number | null {
        const exponent = this.getOperandExponent(operand);

        if (exponent !== null) {
            return exponent;
        }

        if (this.operandHasUnits(operand)) {
            return 1;
        }

        return null;
    }

    setOperandExponent(operand: Component[], exponent: number | null): void {
        if (operand.length === 0) {
            return;
        }

        if (exponent !== null && exponent > 1) {
            operand[0].exponent = exponent.toString();
        } else {
            delete operand[0].exponent;
        }
    }

    trimOperandExponent(operand: Component[]): boolean {
        if (operand.length === 0 || !operand[0].exponent) {
            return false;
        }

        const trimmedExponent = operand[0].exponent.slice(0, -1);
        if (trimmedExponent) {
            operand[0].exponent = trimmedExponent;
        } else {
            delete operand[0].exponent;
        }

        return true;
    }
}

export default ImperialCalculator;

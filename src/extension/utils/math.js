const mathOperators = {
  '+': { precedence: 1, arity: 2 },
  '-': { precedence: 1, arity: 2 },
  '*': { precedence: 2, arity: 2 },
  '/': { precedence: 2, arity: 2 },
  '%': { precedence: 2, arity: 2 },
  // While commonly exponentiation has greater precendence than
  // multiplication and division, YNAB internally sets it level
  '^': { precedence: 2, arity: 2 },
  // Unary minus virtual operator
  U: { precedence: 3, arity: 1 },
};
const parentheses = ['(', ')'];

export class ToolkitMath {
  constructor() {
    this.tokenizerRegexp = this._computeTokenizerRegexp();

    this.tokens = [];
    this.rpnExpression = [];
  }

  evaluate(infixExpression) {
    this.tokens = this._tokenize(infixExpression);
    this.rpnExpression = this._infixToRPN();

    return this._evaluateRPN();
  }

  _computeTokenizerRegexp() {
    const regexpString = Object.keys(mathOperators)
      .concat(parentheses)
      .map(op => `\\${op}`)
      .join('|');

    return new RegExp(`(${regexpString})`);
  }

  // Ref: https://en.wikipedia.org/wiki/Shunting-yard_algorithm
  _infixToRPN() {
    let rpnOutput = [];
    let operatorStack = [];

    for (const token of this.tokens) {
      const parsedFloat = parseFloat(token);

      if (parsedFloat) {
        rpnOutput.push(parsedFloat);
      }

      if (token in mathOperators) {
        while (
          operatorStack.slice(-1)[0] !== '(' &&
          mathOperators[operatorStack.slice(-1)[0]] &&
          mathOperators[operatorStack.slice(-1)[0]].precedence >= mathOperators[token].precedence
        ) {
          rpnOutput.push(operatorStack.pop());
        }

        operatorStack.push(token);
      }

      if (token === '(') {
        operatorStack.push(token);
      }

      if (token === ')') {
        while (operatorStack.slice(-1)[0] !== '(') {
          const operator = operatorStack.pop();
          if (operator === undefined) throw new Error('Unbalanced parenthesis in expression');

          rpnOutput.push(operator);
        }

        operatorStack.pop();
      }
    }

    if (parentheses.filter(value => operatorStack.indexOf(value) > -1).length)
      throw new Error('Unbalanced parentheses in expression');

    return rpnOutput.concat(operatorStack.reverse());
  }

  // Ref: https://en.wikipedia.org/wiki/Reverse_Polish_notation#Postfix_evaluation_algorithm
  _evaluateRPN() {
    let result = [];

    for (const token of this.rpnExpression) {
      if (token in mathOperators) {
        switch (mathOperators[token].arity) {
          case 1: {
            result.push(this._evaluateMathOperation(token, result.pop()));
            break;
          }
          case 2: {
            result.push(this._evaluateMathOperation(token, result.pop(), result.pop()));
            break;
          }
        }
      } else {
        result.push(token);
      }
    }

    return result[0];
  }

  _tokenize(expression) {
    let tokens = expression
      .split(this.tokenizerRegexp)
      .map(t => t.trim())
      .filter(t => t !== '');

    tokens = this._markUnaryOperators(tokens);

    return tokens;
  }

  // Ref: https://stackoverflow.com/a/17132657
  _markUnaryOperators(tokens) {
    for (let i = 0; i < tokens.length; i++) {
      const previousToken = tokens[i - 1];

      if (
        tokens[i] === '-' &&
        (i === 0 || previousToken in mathOperators || previousToken === '(')
      ) {
        tokens[i] = 'U';
      }
    }

    return tokens;
  }

  _evaluateMathOperation(operation, rightOperand, leftOperand) {
    switch (operation) {
      case '+': {
        return leftOperand + rightOperand;
      }
      case '-': {
        return leftOperand - rightOperand;
      }
      case '*': {
        return leftOperand * rightOperand;
      }
      case '/': {
        return leftOperand / rightOperand;
      }
      case '%': {
        return leftOperand % rightOperand;
      }
      case '^': {
        return leftOperand ** rightOperand;
      }
      case 'U': {
        return -rightOperand;
      }
    }
  }
}

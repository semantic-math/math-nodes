/**
 * Functions to build nodes
 */

// possible options:
// - loc: {start, end}  (deprecate in favor of an array called range?)
// - implicit
// - wasMinus
export function applyNode(op, args, options = {}) {
    return {
        type: 'Apply',
        op: op,
        args: args,
        ...options,
    }
}

// possible options:
// - loc: {start, end}
// - subscript
export function identifierNode(name, options = {}) {
    return {
        type: 'Identifier',
        name: name,
        ...options,
    }
}

// possible options:
// - loc: {start, end}
export function numberNode(value, options = {}) {
    return {
        type: 'Number',
        value: value,
        ...options,
    }
}

// possible options:
// - loc: {start, end}
export function parensNode(body, options = {}) {
    return {
        type: 'Parentheses',
        body: body,
        ...options,
    }
}

/**
 * Functions to build nodes
 */

export const apply = (op, args, options = {}) => ({
    type: 'Apply',
    op: op,
    args: args,
    ...options,
})

// Operations

export const neg = (arg, options = {}) => apply('neg', [arg], options)      // options: wasMinus
export const add = (...terms) => apply('add', terms)
export const sub = (minuend, subtrahend) => apply('add', [minuend, neg(subtrahend, {wasMinus: true})])
export const mul = (...args) => apply('mul', args)
export const implicitMul = (...args) => apply('mul', args, {implicit: true})
export const div = (numerator, denominator) => apply('div', [numerator, denominator])
export const pow = (base, exponent) => apply('pow', [base, exponent])
export const abs = (arg) => apply('abs', [arg])
export const fact = (arg) => apply('fact', [arg])
export const nthRoot = (radicand, index = 2) => apply('nthRoot', [radicand, index])

// Relations

export const eq = (...args) => apply('eq', args)
export const ne = (...args) => apply('ne', args)
export const lt = (...args) => apply('lt', args)
export const le = (...args) => apply('le', args)
export const gt = (...args) => apply('gt', args)
export const ge = (...args) => apply('ge', args)


export const identifier = (name, options = {}) => ({
    type: 'Identifier',
    name: name,
    ...options, // options: subscript
})

export const number = (value, options = {}) => ({
    type: 'Number',
    value: value,
    ...options,
})


export const parens = (body, options = {}) => ({
    type: 'Parentheses',
    body: body,
    ...options,
})

// deprecated aliases
export const parensNode = parens;
export const numberNode = number;
export const identifierNode = identifier;
export const applyNode = apply;

/**
 * Functions to query properties of nodes
 */

export const isIdentifier = node => node && node.type === 'Identifier'
export const isApply = node => node && node.type === 'Apply'

export const isOperation = node => isApply(node) && !isNumber(node)
export const isFunction = node => isApply(node) && isIdentifier(node.op)

// TODO: curry it?
const _isOp = (op, node) => isApply(node) && node.op === op

export const isAdd = node => _isOp('add', node)
export const isMul = node => _isOp('mul', node)
export const isDiv = node => _isOp('div', node)
export const isPow = node => _isOp('pow', node)
export const isNeg = node => _isOp('neg', node)
export const isPos = node => _isOp('pos', node)
export const isAbs = node => _isOp('abs', node)
export const isFact = node => _isOp('fact', node)
export const isNthRoot = node => _isOp('nthRoot', node)

const relationIdentifierMap = {
    'eq': '=',
    'lt': '<',
    'le': '<=',
    'gt': '>',
    'ge': '>=',
    'ne': '!=',
}

export const isRel = node => isApply(node) && node.op in relationIdentifierMap

export const isNumber = node => {
    if (node.type === 'Number') {
        return true
    } else if (isNeg(node)) {
        return isNumber(node.args[0])
    } else {
        return false
    }
}

// check if it's a number before trying to get its value
export const getValue = node => {
    if (node.type === 'Number') {
        return parseFloat(node.value)
    } else if (isNeg(node)) {
        return -getValue(node.args[0])
    } else if (isPos(node)) {
        return getValue(node.args[0])
    }
}

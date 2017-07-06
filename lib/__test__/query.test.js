import assert from 'assert'
import {parse} from 'math-parser'
import stringify from 'json-stable-stringify'

import * as query from '../query'
import * as build from '../build'

const reverseAlphabetical = (a, b) => a.key < b.key ? 1 : -1

const serializer = {
    print(val) {
        return stringify(val, {cmp: reverseAlphabetical, space: '    '})
    },
    test() {
        return true
    },
}

expect.addSnapshotSerializer(serializer)  // eslint-disable-line

const suite = (name, func, cases) => {
    describe(name, () => {
        cases.forEach((c) => {
            it(c, () => {
                const result = func(parse(c))
                expect(result).toMatchSnapshot()  // eslint-disable-line
            })
        })
    })
}

suite.only = (name, func, cases) => {
    describe.only(name, () => {
        cases.forEach((c) => {
            it(c, () => {
                const result = func(parse(c))
                expect(result).toMatchSnapshot()  // eslint-disable-line
            })
        })
    })
}

describe('query', () => {
    let a, x, y

    beforeEach(() => {
        a = {type: 'Number', value: '5'}
        x = {type: 'Identifier', name: 'x'}
        y = {type: 'Identifier', name: 'y'}
    })

    suite('getVariableFactors', query.getVariableFactors, [
        '2x',
        'x^2',
        '2x^2',
        '2 x y z',
    ])

    suite('getCoefficientsAndConstants', query.getCoefficientsAndConstants, [
        '2',
        '2x',
        '2x^2',
        '2 x y z',
        '2x^3 + 3',
        'x^3 + y^3 + x y z + 3',
        '2/3 + 3 + cos(4)',
        '3x^2 * 2x^2',
        '2/3(x + 1)^1'
    ])

    it('isVariableFactor', () => {
        assert(query.isVariableFactor(parse('x')))
        assert(query.isVariableFactor(parse('xyz')))
        assert(query.isVariableFactor(parse('x^2')))
        assert(query.isVariableFactor(parse('(x+1)^2')))
        assert(!query.isVariableFactor(parse('2x^2')))
        assert(!query.isVariableFactor(parse('x y z')))
        assert(!query.isVariableFactor(parse('x + y')))
    })

    it('isPolynomialTerm', () => {
        assert(query.isPolynomialTerm(parse('x')))
        assert(query.isPolynomialTerm(parse('2x')))
        assert(query.isPolynomialTerm(parse('2x^2')))
        assert(query.isPolynomialTerm(parse('(x+2)^2')))
        assert(query.isPolynomialTerm(parse('(x+2)^(x+2)')))
        assert(query.isPolynomialTerm(parse('-2')))
        assert(query.isPolynomialTerm(parse('2.2')))
        assert(!query.isPolynomialTerm(parse('x^-2')))
    })

    it('isPolynomial', () => {
        // test cases from: https://www.mathsisfun.com/algebra/polynomials.html
        assert(query.isPolynomial(parse('1/5')))
        assert(query.isPolynomial(parse('5')))
        assert(query.isPolynomial(parse('3x')))
        assert(query.isPolynomial(parse('x/2')))
        assert(query.isPolynomial(parse('(3x)/8')))
        assert(query.isPolynomial(parse('x - 2')))
        assert(query.isPolynomial(parse('-6y^2 - (7/9)x')))
        assert(query.isPolynomial(parse('3xyz + 3xy2z - 0.1xz - 200y + 0.5')))
        assert(query.isPolynomial(parse('512v^5 + 99w^5')))
        assert(query.isPolynomial(parse('(2x^2 + 3y^2)/3')))
        assert(!query.isPolynomial(parse('3xy^-2')))
        assert(!query.isPolynomial(parse('2/(x+2)')))
        assert(!query.isPolynomial(parse('1/x')))
    })

    it('hasSameBase', () => {
        assert(query.hasSameBase(parse('x^1'), parse('x^2')))
        assert(query.hasSameBase(parse('(x+1)^2'), parse('(x+1)^x')))
        assert(query.hasSameBase(parse('(xyz)^2'), parse('(xyz)^5')))
        assert(!query.hasSameBase(parse('(x+1)^2'), parse('(x+2)^2')))
    })

    it('isIdentifier', () => {
        assert(query.isIdentifier(x))
        assert(!query.isIdentifier(a))
    })

    it('isApply', () => {
        assert(query.isApply({type: 'Apply'}))
        assert(!query.isApply(a))
        assert(!query.isApply(x))
    })

    it('isFunction', () => {
        assert(query.isFunction({
            type: 'Apply',
            op: {type: 'Identifier', name: 'sin'},
            args: [x],
        }))
        assert(!query.isFunction({type: 'Apply', op: 'sin'}))
    })

    it('isAdd', () => {
        assert(query.isAdd(parse('1 + 2')))
        assert(query.isAdd(parse('1 + 2 + x + y')))
        // This is b/c subtraction get's parsed as adding a negative
        assert(query.isAdd(parse('1 - 2')))
        assert(!query.isMul({
            type: 'Apply',
            op: 'add',
            args: build.number(1),
        }))
    })

    it('isMul', () => {
        assert(query.isMul(parse('2 * x')))
        assert(query.isMul(parse('2 x')))
        assert(!query.isMul({
            type: 'Apply',
            op: 'mul',
            args: build.number(1),
        }))
    })

    it('isDiv', () => {
        assert(query.isDiv(parse('x / y')))
        assert(!query.isDiv({
            type: 'Apply',
            op: 'div',
            args: [1, 2, 3].map(build.number),
        }))
    })

    it('isNeg', () => {
        assert(query.isNeg(parse('-x')))
        assert(query.isNeg(parse('-2')))
        // Even though this resolves to a positive 'x', we only check the given
        // node.
        assert(query.isNeg(parse('--x')))
        assert(!query.isDiv({
            type: 'Apply',
            op: 'neg',
            args: [1, 2].map(build.number),
        }))
    })

    it('isPos', () => {
        assert(query.isPos(parse('+x')))
        assert(query.isPos(parse('+2')))
        assert(query.isPos(parse('++x')))
        assert(!query.isDiv({
            type: 'Apply',
            op: 'pos',
            args: [1, 2].map(build.number),
        }))
    })

    it('isAbs', () => {
        assert(query.isAbs(parse('|x + y|')))
        assert(!query.isDiv({
            type: 'Apply',
            op: 'abs',
            args: [1, 2].map(build.number),
        }))
    })

    it('isFact', () => {
        assert(query.isFact(parse('x!')))
        assert(!query.isDiv({
            type: 'Apply',
            op: 'fact',
            args: [1, 2].map(build.number),
        }))
    })

    it('isNthRoot', () => {
        assert(query.isNthRoot(parse('nthRoot(4)')))
        assert(query.isNthRoot(parse('nthRoot(8, 3)')))
        assert(!query.isDiv({
            type: 'Apply',
            op: 'nthRoot',
            args: [1, 2, 3].map(build.number),
        }))
    })

    it('isFraction', () => {
        assert(query.isFraction(parse('2 / 3')))
        assert(query.isFraction(parse('-2 / 3')))
        assert(query.isFraction(parse('-(2 / 3)')))
        assert(query.isFraction(parse('--(2 / 3)')))
    })

    it('isConstantFraction', () => {
        assert(query.isConstantFraction(parse('2.2 / 3')))
        assert(!query.isConstantFraction(parse('x / 3')))
    })

    it('isIntegerFraction', () => {
        assert(!query.isIntegerFraction(parse('2.2 / 3')))
        assert(query.isIntegerFraction(parse('2 / 3')))
        assert(!query.isIntegerFraction(parse('x / 3')))
    })

    it('hasConstantBase', () => {
        assert(query.hasConstantBase(parse('2^2')))
        assert(query.hasConstantBase(parse('(2/3)^2')))
        assert(query.hasConstantBase(parse('(-2)^2')))
        assert(!query.hasConstantBase(parse('x^2')))
    })

    it('isDecimal', () => {
        assert(query.isDecimal(parse('-2.2')))
        assert(query.isDecimal(parse('2.2')))
        assert(!query.isDecimal(parse('-2')))
        assert(!query.isDecimal(parse('2')))
    })

    const relations = ['eq', 'ne', 'lt', 'le', 'gt', 'ge']

    it('isRel', () => {
        relations.forEach(rel => {
            assert(query.isRel({
                type: 'Apply',
                op: rel,
                args: [x, y]
            }))
        })
        assert(!query.isRel(a))
        assert(!query.isRel(x))
    })

    it('isNumber', () => {
        assert(query.isNumber(a))
        assert(query.isNumber(parse('-2')))
        assert(!query.isNumber(x))
    })

    it('getValue', () => {
        assert.equal(query.getValue(parse('2')), 2)
        assert.equal(query.getValue(parse('-2')), -2)
        assert.equal(query.getValue(parse('2.2')), 2.2)
        assert.equal(query.getValue(parse('-2.2')), -2.2)
        assert.equal(query.getValue(x), null)
    })

    it('getNumerator', () => {
        assert.deepEqual(query.getNumerator(parse('2/3')), parse('2'))
        assert.deepEqual(query.getNumerator(parse('-2/3')), parse('-2'))
        assert.deepEqual(query.getNumerator(parse('-(2/3)')), parse('2'))
        assert.equal(query.getNumerator(x), null)
    })

    it('getDenominator', () => {
        assert.deepEqual(query.getDenominator(parse('2/3')), parse('3'))
        assert.deepEqual(query.getDenominator(parse('2/-3')), parse('-3'))
        assert.deepEqual(query.getDenominator(parse('-(2/3)')), parse('3'))
        assert.equal(query.getDenominator(x), null)
    })

    it('getPolyDegree', () => {
        assert.deepEqual(query.getPolyDegree(parse('2')), parse('0'))
        assert.deepEqual(query.getPolyDegree(parse('2x')), parse('1'))
        assert.deepEqual(query.getPolyDegree(parse('2xyz')), parse('1'))
        assert.deepEqual(query.getPolyDegree(parse('2x^2')), parse('2'))
        assert.deepEqual(query.getPolyDegree(parse('x^2')), parse('2'))
        assert.deepEqual(query.getPolyDegree(parse('-2x^2')), parse('2'))
        assert.deepEqual(query.getPolyDegree(parse('-2/3 x^2')), parse('2'))
    })

    it('getCoefficient', () => {
        assert.deepEqual(query.getCoefficient(parse('2')), parse('2'))
        assert.deepEqual(query.getCoefficient(parse('2^2')), parse('2^2'))
        assert.deepEqual(query.getCoefficient(parse('2^(2/3)')), parse('2^(2/3)'))
        assert.deepEqual(query.getCoefficient(parse('2x')), parse('2'))
        assert.deepEqual(query.getCoefficient(parse('2x^2')), parse('2'))
        assert.deepEqual(query.getCoefficient(parse('x^2')), parse('1'))
        assert.deepEqual(query.getCoefficient(parse('-2x^2')), parse('-2'))
        assert.deepEqual(query.getCoefficient(parse('2/3 x^2')), parse('2/3'))
        assert.deepEqual(query.getCoefficient(parse('-2/3 x^2')), parse('-2/3'))
    })
})

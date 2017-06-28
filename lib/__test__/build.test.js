import assert from 'assert'
import {print} from 'math-parser'

import * as build from '../build'

describe('build', () => {
    let a, b, x, y

    beforeEach(() => {
        a = {type: 'Number', value: '5'}
        b = {type: 'Number', value: '10'}
        x = {type: 'Identifier', name: 'x'}
        y = {type: 'Identifier', name: 'y'}
    })

    it('neg', () => {
        assert.equal(print(build.neg(a)), '-5')
        assert.equal(print(build.add(a, build.neg(b))), '5 + -10')
        assert.equal(
            print(
                build.add(a, build.neg(b, {wasMinus: true}))
            ), '5 - 10'
        )
    })

    it('add', () => {
        assert.equal(print(build.add(a, b)), '5 + 10')
    })

    it('sub', () => {
        assert.equal(print(build.sub(a, b)), '5 - 10')
    })

    it('mul', () => {
        assert.equal(print(build.mul(a, b)), '5 * 10')
        assert.equal(print(build.mul(a, x, y)), '5 * x * y')
    })

    it('implicitMul', () => {
        assert.equal(print(build.implicitMul(a, b)), '5 10')
        assert.equal(print(build.implicitMul(a, x, y)), '5 x y')
    })

    it('div', () => {
        assert.equal(print(build.div(a, b)), '5 / 10')
    })

    it('pow', () => {
        assert.equal(print(build.pow(a, b)), '5^10')
    })

    it('abs', () => {
        assert.equal(print(build.abs(a)), '|5|')
    })

    it('fact', () => {
        assert.equal(print(build.fact(x)), 'x!')
    })

    it('nthRoot', () => {
        assert.equal(print(build.nthRoot(x)), 'nthRoot(x, 2)')
        assert.equal(print(build.nthRoot(x, a)), 'nthRoot(x, 5)')
    })

    const relations = ['eq', 'ne', 'lt', 'le', 'gt', 'ge']
    relations.forEach(rel => {
        it(`${rel}`, () => {
            assert.deepEqual(build[rel](x, y), {
                type: 'Apply',
                op: rel,
                args: [x, y]
            })
            assert.deepEqual(build[rel](a, b, x, y), {
                type: 'Apply',
                op: rel,
                args: [a, b, x, y]
            })
        })
    })

    it('identifier', () => {
        assert.deepEqual(build.identifier('x'), {
            type: 'Identifier',
            name: 'x',
        })
        assert.deepEqual(build.identifier('sin'), {
            type: 'Identifier',
            name: 'sin',
        })
    })

    it('number', () => {
        assert.deepEqual(build.number(5), {
            type: 'Number',
            value: '5',
        })
        assert.deepEqual(build.number('10'), {
            type: 'Number',
            value: '10',
        })
    })

    it('parens', () => {
        assert.deepEqual(build.parens(x), {
            type: 'Parentheses',
            body: x,
        })
    })
})

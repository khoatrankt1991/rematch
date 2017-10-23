beforeEach(() => {
  jest.resetModules()
})

const common = {
  state: 0,
  reducers: {
    addOne: (state) => state + 1,
  },
}

describe('subscriptions:', () => {
  test('should create a working subscription', () => {
    const { model, init, dispatch, getStore } = require('../src')
    init()

    model({
      name: 'first',
      ...common,
      subscriptions: {
        'second/addOne': () => dispatch.first.addOne(),
      }
    })

    model({
      name: 'second',
      ...common,
    })

    dispatch.second.addOne()

    expect(getStore().getState()).toEqual({
      second: 1, first: 1,
    })
  })

  test('should allow for two subscriptions with same name in different models', () => {
    const { model, init, dispatch, getStore } = require('../src')
    init()

    model({
      name: 'a1',
      ...common,
      subscriptions: {
        'b1/addOne': () => dispatch.a1.addOne(),
      }
    })

    model({
      name: 'b1',
      ...common,
    })

    model({
      name: 'c1',
      ...common,
      subscriptions: {
        'b1/addOne': () => dispatch.c1.addOne(),
      },
    })

    dispatch.b1.addOne()

    expect(getStore().getState()).toEqual({
      a1: 1, b1: 1, c1: 1,
    })
  })

  test('should allow for three subscriptions with same name in different models', () => {
    const { model, init, dispatch, getStore } = require('../src')
    init()

    model({
      name: 'a',
      ...common,
      subscriptions: {
        'b/addOne': () => dispatch.a.addOne(),
      }
    })

    model({
      name: 'b',
      ...common,
    })

    model({
      name: 'c',
      ...common,
      subscriptions: {
        'b/addOne': () => dispatch.c.addOne(),
      },
    })

    model({
      name: 'd',
      ...common,
      subscriptions: {
        'b/addOne': () => dispatch.d.addOne(),
      },
    })

    // no subscriptions, superfluous model
    // just an additional check to see that
    // other models are not effected
    model({
      name: 'e',
      ...common,
    })

    dispatch.b.addOne()

    expect(getStore().getState()).toEqual({
      a: 1, b: 1, c: 1, d: 1, e: 0
    })
  })

  test('it should throw if a subscription matcher is invalid', () => {
    const { model, init, dispatch } = require('../src')
    init()

    expect(() => model({
      name: 'first',
      ...common,
      subscriptions: {
        'Not/A/Valid/Matcher': () => dispatch.first.addOne(),
      }
    })).toThrow()
  })

  describe('pattern matching', () => {

    test('should create working pattern matching subscription (second/*)', () => {
      const { model, init, dispatch, getStore } = require('../src')
      init()

      model({
        name: 'first',
        ...common,
        subscriptions: {
          'second/*': () => dispatch.first.addOne(),
        }
      })

      model({
        name: 'second',
        ...common,
      })

      dispatch.second.addOne()

      expect(getStore().getState()).toEqual({
        second: 1, first: 1,
      })
    })

    test('should create working pattern matching subsription (*/addOne)', () => {
      const { model, init, dispatch, getStore } = require('../src')
      init()

      model({
        name: 'first',
        ...common,
        subscriptions: {
          '*/add': () => dispatch.first.addOne(),
        }
      })

      model({
        name: 'second',
        state: 0,
        reducers: {
          add: (state, payload) => state + payload
        }
      })

      dispatch.second.add(2)

      expect(getStore().getState()).toEqual({
        second: 2, first: 1,
      })
    })

    test('should create working pattern matching subscription (second/add*)', () => {
      const { model, init, dispatch, getStore } = require('../src')
      init()

      model({
        name: 'first',
        ...common,
        subscriptions: {
          'second/add*': () => dispatch.first.addOne(),
        }
      })

      model({
        name: 'second',
        ...common,
      })

      dispatch.second.addOne()

      expect(getStore().getState()).toEqual({
        second: 1, first: 1,
      })
    })

    test('should throw an error if a user creates a subscription that matches a reducer in the model', () => {
      const { model, init } = require('../src')
      init()

      const createModel = () => model({
        name: 'first',
        state: 0,
        reducers: {
          addOne: (state) => state + 1
        },
        subscriptions: {
          'first/addOne': () => console.log('anything'),
        }
      })

      expect(createModel).toThrow()
    })

    test('should throw an error if a user creates a subscription that matches an effect in the model', () => {
      const { model, init } = require('../src')
      init()

      const createModel = () => model({
        name: 'first',
        state: 0,
        effects: {
          sayHi: () => console.log('hi')
        },
        subscriptions: {
          'first/sayHi': () => console.log('anything'),
        }
      })

      expect(createModel).toThrow()
    })

    test('should throw an error if a user creates a subscription that pattern matches a reducer in the model', () => {
      const { model, init } = require('../src')
      init()

      const createModel = () => model({
        name: 'first',
        state: 0,
        reducers: {
          addOne: (state) => state + 1
        },
        subscriptions: {
          '*/addOne': () => console.log('anything'),
        }
      })

      expect(createModel).toThrow()
    })
  })
})
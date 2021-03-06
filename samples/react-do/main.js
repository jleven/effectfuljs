/**
 * Double-barrelled continuations Monad
 *
 * It is very similar to Promise's Thenable interface except:
 *   - instead of an object with single `then` method it is a function
 *     (with same two callbacks - successful and failed continuation resp.)
 *   - the callbacks can be called more than once
 *   - results of the callbacks and the value functions are ignored
 */
import React from "react";

/**
 * This marks effectful values (functions), so we can distinguish them
 * from any other function.
 */
export const tagSymbol = Symbol("@effectful/react-do");

/**
 * Makes an effectful value from a function
 * This just adds `[tagSymbol] = true` to `value` for `coerce` operation.
 */
function make(value) {
  value[tagSymbol] = true;
  return value;
}

/**
 *  This makes a computation which runs computations from `args` array
 *  in parallel.  Like `Promise.all` it returns a result as an array
 *  after all continuations have at least one value received.
 *
 *  It also runs its continuations again on each new value from any of `args`
 *  continuations.  If any value is rejected it rejects the whole
 *  resulting value. But unlike Promise, this value may call success
 *  continuation thus the resulting value will continue sending arrays.
 */
export const join = args =>
  make((rs, rj) => {
    if (!args.length) return rs([]);
    const state = [];
    const errors = [];
    args.forEach((effect, index) => {
      effect(
        value => {
          state[index] = value;
          errors[index] = null;
          const error = errors.find(Boolean);
          if (error) rj(error);
          else if (Object.values(state).length === args.length) rs([...state]);
        },
        error => {
          errors[index] = error;
          rj(errors.find(Boolean));
        }
      );
    });
  });

/** Monadic `chain` for continuations, same as Promise's `then` */
export const chain = (arg, fun, errFun) =>
  make((rs, rj) =>
    arg(
      value => fun(value)(rs, rj),
      errFun ? error => errFun(error)(rs, rj) : rj
    )
  );

export const pure = value => make(cont => cont(value));

/**
 * An API to be used in the code generated by hooks - a function
 * starting with "use"
 *
 * It's effectful value is a callback function taking another
 * callback as its only argument.
 */
class Hook {
  constructor() {
    /** default error continuation */
    this.$jobs = [];
    this.$running = false;
  }
  $err() {
    return 1;
  }
  $fin() {
    return 0;
  }
  /**
   * Runs the function from state `dest` the resumed expression will
   * receive `value` and the result will be sent to `cont`
   * continuation
   *
   * It just runs the function from `dest` state, the loop is needed
   * to simulate tail calls, otherwise this will crash after reaching
   * maximal stack size
   */
  jump(value, dest) {
    return (rs, rj) => {
      this.$jobs.push({ value, dest, rs, rj });
      if (this.$running) return;
      this.$running = true;
      try {
        while (this.$jobs.length) {
          const { dest, value, rs, rj } = this.$jobs.shift();
          try {
            this.$cur = dest;
            this.$run(dest, value)(rs, rj);
          } catch (error) {
            const errDest = this.$err(dest);
            if (errDest === 1) {
              if (rj) rj(error);
              else throw error;
            } else this.$jobs.push({ value: error, dest: errDest, rs, rj });
          }
        }
      } finally {
        this.$running = false;
      }
    };
  }
  throw(error) {
    return this.jump(error, this.$err(this.$cur));
  }
  /** Monadic `chain` except its callback is encoded as a number */
  chain(arg, dest) {
    const src = this.$cur;
    return chain(
      arg,
      value => this.jump(value, dest),
      error => ((this.$cur = src), this.throw(error))
    );
  }
  /** Forking a separate context for running a parallel computation thread */
  fork(tls, dest, value) {
    const res = new Hook();
    res.$tls = tls;
    res.$run = this.$run;
    return make(res.jump(value, dest));
  }
  /** This is `chain` followed by `fork` */
  chainFork(tls, arg, dest) {
    const src = this.$cur;
    return chain(
      arg,
      value => this.fork(tls, dest, value),
      error => ((this.$cur = src), this.throw(error))
    );
  }
  /** First operation in the function */
  scope(dest) {
    return make(this.jump(void 0, dest));
  }
}

/** Default React.Component to wrap effectful values */
class Effectful extends React.Component {
  constructor({ effect }) {
    super();
    this.state = { value: null };
    effect(
      value =>
        this.mounted ? this.setState({ value }) : (this.state = { value }),
      error =>
        this.mounted ? this.setState({ error }) : (this.state = { error })
    );
  }
  componentDidMount() {
    this.mounted = true;
  }
  render() {
    if (this.state.error) throw this.state.error;
    return this.state.value;
  }
}

/** This marks effectful components */
const classSym = Symbol("@effectful/react-do/class");

/** This function is injected by compiler for all component functions */
export function componentFunction(fun) {
  fun[classSym] = Effectful;
  return fun;
}

let keysCount = 0;

const ReactElementSymbol = React.createElement("div").$$typeof;

/**
 * Converts effectful value resolving to React elements into a React element.
 *
 * A faster alternative could be a custom JSX createElement function.
 */
function toReactElement(effectful) {
  const key = keysCount++;
  return React.createElement(Effectful, {
    effect: chain(effectful, v => jsxMap(v, key))
  });
  function jsxMap(el, key) {
    if (el == null) return pure(el);
    if (el[tagSymbol]) return el;
    if (el.$$typeof !== ReactElementSymbol) return pure(el);
    if (el.type[classSym]) {
      const effChildren = chain(
        join(toArray(el.props.children).map(jsxMap)),
        i => pure(i.map(setKey))
      );
      return el.type({ ...el.props, effChildren, children: null }).props.effect;
    }
    if (el.props.children)
      return chain(join(toArray(el.props.children).map(jsxMap)), children =>
        pure(React.cloneElement(el, { key }, ...children))
      );
    return pure(el);
  }
}

/** React.Children.toArray replacement which doesn't care about its content */
function toArray(children) {
  return !children ? [] : Array.isArray(children) ? children : [children];
}

/**
 * Adding position key to remove react warning this may not work if
 * the children are changing their positions
 */
function setKey(el, key) {
  return !el || el.$$typeof !== ReactElementSymbol || el.props.key != null
    ? el
    : React.cloneElement(el, { key });
}

/**
 * Same as `Hook` but for Component functions
 * Component functions are function with `"component"` block directive
 * e.g.
 *
 *      function Counter() {
 *         "component"
 *         const [counter, setCounter] = useState(0)
 *         return <div>
 *                  <p>Clicked {count} times</p>
 *                  <button onClick={() => setCount(count + 1)}>+</button>
 *                </div>
 *      }
 */
class Component extends Hook {
  scope(dest) {
    return toReactElement(super.scope(dest));
  }
}

/**
 * part of API, injected by the transpiler, builds object
 * to store hook's functions state
 */
export const hook = () => new Hook();

/**
 * part of API, injected by the transpiler, builds object
 * to store component's functions state
 */
export const component = fun => new Component(fun);

/**
 * React's useState implementation.
 *
 * It is an extended version and unlike React.useState it also returns
 * a third result which is error continuation, calling it results in
 * throwing an exception at the point where `useState` was invoked.
 *
 * WARNING: the continuations aren't cloned for simplicity, so there
 * can be data races if the former continuations aren't
 * ended. `React.useState` throws an exception in this case.
 *
 * Effectful.js provides tools to solve this in many ways. For example
 * by throwing an exception or running both continuations but with
 * cloned variables, or cancel the next one reverting variable values.
 *
 * But this is behind the scope of this demo.
 */
export const useState = initial =>
  make((rs, rj) =>
    rs([
      initial,
      function next(value) {
        rs([value, next, rj]);
      },
      function throws(error) {
        rj(error);
      }
    ])
  );

/** Fetching async data */
export const usePromise = promise => make((rs, rj) => promise.then(rs, rj));

/**
 * This injects effectful value into the control flow
 * it does nothing, it is more a transpiler's directive
 */
export const use = v => v;

/** React.Suspense replacement */
export const Suspense = ({ fallback, maxDuration = 5000, effChildren }) =>
  toReactElement(
    make((rs, rj) => {
      const timer = setTimeout(() => rs(fallback), maxDuration);
      effChildren(children => (clearTimeout(timer), rs(children)));
    })
  );

Suspense[classSym] = Effectful;

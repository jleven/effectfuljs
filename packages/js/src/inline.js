import * as Kit from "./kit"
import {Tag} from "./kit"
import * as Block from "./block"
import * as Bind from "./bind"
import * as Ctrl from "./control"
import * as assert from "assert"
import * as Except from "./exceptions"
import * as Branch from "./branch"
import * as Loop from "./loops"

const alreadyRunningSym = Kit.sysId("alreadyRunning")

/** marks frames with only jump in its payload, so no needs to check reentry */
export function markSimpleRedir(si) {
  const s = Kit.auto(si)
  return s.opts.inlineReentryCheck ? _markSimpleRedir() : s
  function* _markSimpleRedir() {
    for(const i of s) {
      if (i.enter && i.type === Block.frame) {
        const j = s.cur()
        i.value.simpleRedir = j.type === Block.letStmt && i.value.eff
          || j.type === Ctrl.jump
          || j.type === Block.app
      }
      yield i
    }
  }
}

/**
 * inline assignments to function's global continuations's fields at each step
 */
export function storeContinuations(si) {
  const s = Kit.auto(si)
  const root = s.first.value
  const {contextSym} = root
  const contextStore = contextSym && s.opts.contextMethodOps
  const noPureJumpsStore = !s.opts.defunct
        && !s.opts.invertForOf
        && s.opts.contextBy === "reference"
  const stateStorageField = s.opts.stateStorageField
  function makeSym(name,pat) {
    if (!name)
      throw s.error(
        "inlining continuation assignment requires store<...>Cont property")
    if (name && contextStore) {
      const res = Kit.sysId(name)
      res.ctxField = stateStorageField
      return res
    }
    const res = Bind.tempVarSym(root,pat)
    res.ctxField = stateStorageField
    res.fieldName = `$${pat}`
    return res
  }
  const res = root.resContSym = s.opts.inlineResultContAssign
        && makeSym(s.opts.storeResultCont,"rc")
  const err = root.errContSym = s.opts.inlineErrorContAssign
        && makeSym(s.opts.storeErrorCont,"ec")
  const cont = root.contSym = s.opts.inlineContAssign
        && makeSym(s.opts.storeCont,"sc")
  const errIgnore = s.opts.inlineErrorContAssign === "ignore"
  const resIgnore = s.opts.inlineResultContAssign === "ignore"
  const thisCtx = s.opts.contextBy === "this"
  if (s.opts.defunct)
    root.runSym = makeSym("$run","rn")
  const reentry = s.opts.inlineReentryCheck && cont
  if (reentry && s.opts.defunct)
    throw s.error(
      "`defunct:true` is not compatible with `inlineReentryCheck:true`")
  if (!err && !res && !cont)
    return s
  return _storeContinuations()
  function* assign(l,r) {
    yield s.enter(Tag.push,Tag.AssignmentExpression,{node:{operator:"="}})
    yield s.tok(Tag.left,Tag.Identifier,{sym:l,lhs:true,rhs:false,decl:false})
    yield s.tok(Tag.right,Tag.Identifier,{sym:r,lhs:false,rhs:true,decl:false})
    yield* s.leave()
  }
  function* _storeContinuations() {
    for(const i of s) {
      if (i.enter && i.type === Block.frame && i.value.errSym && errIgnore) {
        Kit.skip(s.copy(i))
        continue
      }
      yield i
      if (i.enter && i.type === Block.frame) {
        const f = i.value
        let assignResult = false, assignError = false, assignCont = false
        const rframe = f.resultContRedir
        const eframe = f.catchContRedir
        if (f.enters && f.enters.size) {
          if (rframe && res) {
            for(const j of f.enters) {
              if (j.ref.resultContRedir !== rframe) {
                assignResult = true
                break
              }
            }
          }
          if (eframe && err) {
            for(const j of f.enters) {
              if (eframe && err && j.ref.catchContRedir !== eframe) {
                assignError = true
                break
              }
            }
          }
        } else {
          assignResult = true
          assignError = true
        }
        if (res && rframe && !rframe.removed && assignResult && !resIgnore)
          yield* assign(res,rframe.declSym)
        if (err && eframe && !eframe.removed && assignError && !errIgnore)
          yield* assign(err,eframe.declSym)
        if (reentry && !f.first && !f.simpleRedir)
          yield* assign(reentry,alreadyRunningSym)
        for(const j of s.sub()) {
          if (j.enter) {
            switch(j.type) {
            case Block.letStmt:
              if (!j.value.eff)
                break
            case Ctrl.jump:
              if (noPureJumpsStore && j.type === Ctrl.jump
                  && !j.value.rec && !thisCtx)
                break
              const {goto} = j.value
              if (cont
                  // TODO: for pure jumps somtimes the destination isn't saved
                  /* && (f.first || goto !== f || reentry) */
                  && !j.value.delegateCtx)
                yield* assign(cont,goto.declSym)
            }
          }
          yield j
        }
      }
    }
  }
}

const delegateSym = Kit.sysId("delegate")

function* assignValue(s,contextSym) {
  yield s.enter(Tag.push,Tag.AssignmentExpression,
                {node:{operator:"="}})
  yield* s.toks(Tag.left,"=$I.value",contextSym)
  yield* s.curLev() ? Kit.reposOne(s.sub(),Tag.right)
    : Kit.scope.emitUndefined(Tag.right)
  yield* s.leave()
}

/**
 * inlining yield/yield* expressions for generators implementation
 * handles options:
 *  - `inlineYieldOp: "iterator"`
 *  - `inlineYieldStarOp: "iterator"`
 *  - `inlineScopeOp: "unwrap" | "context"`
 */
function generatorsYield(si) {
  const s = Kit.auto(si)
  const inlineYield = s.opts.inlineYieldOp === "iterator"
  const inlineYieldStar = s.opts.inlineYieldStarOp === "iterator"
  const inlineScopeUnwrap = s.opts.inlineScopeOp === "unwrap"
  const inlineScopeRetCtx = s.opts.inlineScopeOp === "context"
  const delegate = s.opts.invertForOf
  const cont = s.opts.storeCont
  if (!inlineYieldStar && !inlineYield
      && !inlineScopeUnwrap && !inlineScopeRetCtx)
    return s
  const {contextSym} = s.first.value
  const root = s.first.value
  if (!contextSym)
    throw s.error(
      "inlineYieldOp: 'iterator' can be used only with scope context")
  if ((inlineYield || inlineYieldStar) && !s.opts.inlineContAssign)
    throw s.error("inlineYieldOp: 'iterator' requires inlineContAssign: true")
  const noResult = s.opts.returnContext === false
  return _generatorsYield()
  function* _generatorsYield() {
    for(const i of s) {
      if (i.enter && i.type === Block.letStmt && i.value.eff) {
        switch(i.value.bindName) {
        case "yld":
          if (!inlineYield)
            break
          const ctx = contextSym
          yield* assignValue(s,ctx)
          if (!noResult)
            yield s.tok(Tag.push,Tag.Identifier,{result:true,sym:ctx})
          s.close(i)
          continue
        case "yldStar":
          if (!inlineYieldStar)
            break
          yield s.enter(Tag.push,Tag.CallExpression,{result:!noResult})
          yield s.tok(Tag.callee,Tag.Identifier,{sym:delegateSym})
          yield s.enter(Tag.arguments,Tag.Array)
          yield* s.sub()
          yield* s.leave()
          yield* s.leave()
          s.close(i)
          continue
        case "scope":
          if (inlineScopeUnwrap) {
            yield s.enter(Tag.push,Tag.MemberExpression,{result:true})
            yield s.tok(Tag.object,Tag.Identifier,{sym:contextSym})
            yield s.tok(Tag.property,Tag.Identifier,{node:{name:"unwrap"}})
            yield* s.leave()
            s.close(i)
            continue
          }
          if (inlineScopeRetCtx) {
            if (!noResult)
              yield s.tok(Tag.push,Tag.Identifier,{sym:contextSym,result:true})
            s.close(i)
            continue
          }
          break
        }
      }
      yield i
    }
  }
}

/**
 * inline chain operation as ES Promise operation
 * handles option `inlineChainOp === "promise"`
 */
export function promises(si) {
  const s = Kit.auto(si)
  if (s.opts.inlineChainOp !== "promise")
    return s
  const root = s.first.value
  const {errFrameRedir,resFrameRedir} = root
  return _promises()
  function* _promises() {
    for(const i of s) {
      if (i.enter && i.type === Block.letStmt
          && i.value.goto
          && i.value.bindName === "chain") {
        if (i.value.threadArgs && i.value.threadArgs.length)
          throw s.error("`inlineChainOp: promise` with threaded arguments")
        if (s.opts.contextBy !== "reference")
          throw s.error(
            "`inlineChainOp: promise` without `contextBy: reference`")
        const lab = s.label()
        const errCnt = i.value.ref.catchContRedir
        const needThen = i.value.goto !== resFrameRedir
              || (errCnt && errCnt !== errFrameRedir)
        if (needThen) {
          yield s.enter(i.pos,Tag.CallExpression,{result:true})
          yield s.enter(Tag.callee,Tag.MemberExpression)
          yield s.enter(Tag.object,Tag.CallExpression)
        } else
          yield s.enter(i.pos,Tag.CallExpression,{result:true})
        yield s.enter(Tag.callee,Tag.MemberExpression)
        yield s.tok(Tag.object,Tag.Identifier,{node:{name:"Promise"}})
        yield s.tok(Tag.property,Tag.Identifier,{node:{name:"resolve"}})
        yield* s.leave()
        yield s.enter(Tag.arguments,Tag.Array)
        if (!i.leave)
          yield* s.sub()
        yield* s.leave()
        yield* s.leave()
        if (needThen) {
          yield s.tok(Tag.property,Tag.Identifier,{node:{name:"then"}})
          yield* s.leave()
          yield s.enter(Tag.arguments,Tag.Array)
          yield s.tok(Tag.push,Tag.Identifier,{sym:i.value.goto.declSym})
          if (errCnt && errCnt !== errFrameRedir)
            yield s.tok(Tag.push,Tag.Identifier,
                        {sym:errCnt.declSym})
        }
        yield* lab()
        s.close(i)
        continue
      }
      yield i
    }
  }
}

/** 
 * handles `inlinePureJumps` option (inlines pure jumps between frames)
 * possible values:
 *    - 'call' - replaces with simple function call
 *    - 'tail' - moves the call to the end of frame
 *    - 'exit' - doesn't call anything and leaves it to caller to re-call
 */
export function jumpOps(si) {
  const s = Kit.auto(si)
  const inlineJumps = s.opts.inlinePureJumps === "call"
  const inlineScope = s.opts.inlineScopeOp === "call"
  const jumpsExit = s.opts.inlinePureJumps === "exit"
  if (s.opts.inlinePureJumps && !inlineJumps && !jumpsExit
      && s.opts.inlinePureJumps && s.opts.inlinePureJumps !== "tail") {
    throw s.error(
      `unsupported value ${s.opts.inlinePureJumps} for inlinePureJumps`)
  }
  if (!inlineJumps && !inlineScope && !jumpsExit)
    return s
  if (inlineScope && !s.opts.defunct)
    throw s.error("`inlineScope:'call'` requires `defunct:true`")
  if (jumpsExit) {
    if (!s.opts.inlineContAssign)
      throw s.error(
        "`inlineJumps:'exit' works only with `{inlineContAssign:true}`")
  }
  const {jsTailCalls} = s.opts
  const root = s.first.value
  const cont = s.opts.storeCont
  const {contextSym} = root
  if (!contextSym)
    throw s.error('`inlinePureJumps: "call"` requires context object')
  const jumpId = Kit.sysId(s.opts.pureBindName)
  const jumpRId = Kit.sysId(s.opts.pureBindName + "R")
  const scopeId = Kit.sysId("scope")
  const inlineCont = root.runSym || s.opts.inlineContAssign && root.contSym
  const refCtx = s.opts.contextBy === "reference"
  const paramCtx = s.opts.contextBy === "parameter"
  const thisCtx = s.opts.contextBy === "this"
  const noResult = s.opts.returnContext === false
  return Kit.toArray(_jumpOps())
  function* _jumpOps() {
    for(const i of s) {
      yield i
      if (i.enter && i.type === Block.frame) {
        let cnt = 0
        let catchClause = false
        for(const j of s.sub()) {
          if (j.enter) {
            switch(j.type) {
            case Block.app:
              if (j.value.sym === jumpId && inlineJumps
                  || j.value.sym == jumpRId && inlineJumps && jsTailCalls
                  || j.value.sym === scopeId && inlineScope) {
                if (!inlineCont
                    && !j.value.hasCont
                    && !j.value.hasErrorCont
                    && !j.value.hasResultCont) {
                  Kit.skip(s.copy(j))
                  if (!noResult)
                    yield s.tok(Tag.push,Tag.Identifier,
                                {result:true,sym:contextSym})
                  continue
                }
                const tail = !catchClause
                if (tail)
                  cnt++
                const lab = s.label()
                yield s.enter(j.pos,Tag.CallExpression,
                              {result:!noResult,tail})
                let bind = j.value.hasBindVal ? [...s.one()] : []
                if (refCtx && j.value.sym === scopeId) {
                  yield s.tok(Tag.callee,Tag.Identifier,
                              {sym:root.implFrame.value.declSym})
                } else if (j.value.passCont) {
                  yield* Kit.reposOne(s.one(),Tag.callee)
                } /* else if (thisCtx && cont) {
                     yield* s.toks(Tag.callee,`=$I.${cont}`,contextSym)
                     } */ else if ((refCtx || paramCtx) && j.value.goto
                                   && !j.value.delegateCtx) {
                       yield s.tok(Tag.callee,Tag.Identifier,{sym:j.value.goto})
                     } else if (j.value.delegateCtx) {
		                   yield* s.toks(Tag.callee,`=$I.$s.${cont}`,j.value.delegateCtx)
                     } else {
                       yield s.tok(Tag.callee,Tag.Identifier,{sym:inlineCont})
                     }
                yield s.enter(Tag.arguments,Tag.Array)
                if (paramCtx)
                  yield s.tok(Tag.push,Tag.Identifier,{sym:contextSym})
                yield* bind
                if (j.value.hasErrorCont)
                  Kit.skip(s.one())
                if (j.value.hasResultCont)
                  Kit.skip(s.one())
                yield* s.sub()
                yield* lab()
                s.close(j)
                continue
              }
              if (j.value.sym === jumpRId && (inlineJumps || jumpsExit)
                  || j.value.sym === jumpId && jumpsExit) {
                const ctx = j.value.delegateCtx || contextSym
                if (j.value.hasBindVal)
                  yield* assignValue(s,ctx)
                yield* s.toks(Tag.push,"$I.$running = true", ctx)
                Kit.skip(s.sub())
                s.close(j)
                if (!noResult)
                  yield s.tok(Tag.push,Tag.Identifier,{sym:ctx,result:true})
                continue
              }
              break
            case Tag.CatchClause:
              catchClause = true
              break
            case Tag.CallExpression:
              if (j.value.tail) {
                cnt++
              }
              break
            }
          }
          yield j
        }
        i.value.tailCallsNum = cnt
      }
    }
  }
}

/** 
 * wraps frames with try-catch blocks calling error handler in its catch 
 * runs with `inlineJsExceptions: true`
 */
export function jsExceptions(si) {
  const s = Kit.auto(si)
  if (!s.opts.inlineJsExceptions || s.opts.defunct)
    return s
  const root = s.first.value
  const skipFirst = s.opts.scopePrefix
  const {tailJumps} = s.opts
  let always = s.opts.inlineRaise !== "throw"
  const {errFrameRedir,resFrameRedir} = root
  return _jsExceptions()
  function* _jsExceptions() {
    if (skipFirst)
      yield* s.till(i => i.type === Block.frame && i.leave)
    for(const i of s) {
      yield i
      if (i.enter && i.type === Block.frame) {
        i.value.hasTryWrap = false
        const {catchContRedir:goto} = i.value
        const node = {}
        if (!goto || i.value === errFrameRedir
            || i.value === resFrameRedir
            || i.value.last
            || !always && (errFrameRedir === goto
                           || i.value.singleJump))
          continue
        i.value.hasTryWrap = true
        const lab = s.label()
        yield s.enter(Tag.push, Tag.TryStatement)
        yield s.enter(Tag.block, Tag.BlockStatement)
        yield s.enter(Tag.body, Tag.Array)
        let exits, exitLabSym
        if (tailJumps) {
          yield* s.sub()
        } else {
          for(const j of s.sub()) {
            if (j.enter && j.type === Ctrl.jump && j.value.goto
                && j.value.goto.catchContRedir !== goto
               ) {
              j.value.tail = true
              yield* s.copy(j)
              continue
            }
            yield j
          }
        }
        yield* s.leave()
        yield* s.leave()
        yield s.enter(Tag.handler,Tag.CatchClause)
        const sym = Kit.scope.newSym("ex")
        yield s.tok(Tag.param,Tag.Identifier,{sym})
        yield s.enter(Tag.body,Tag.BlockStatement)
        yield s.enter(Tag.body,Tag.Array)
        yield s.enter(Tag.push,Ctrl.jump,{
          goto,gotoDests:[goto],ref:i.value,sym:goto.errSym})
        if (goto.errSym) {
          goto.errSym.bound = true
          yield s.tok(Tag.push,Tag.Identifier,{sym})
        }
        yield* lab()
      }
    }
  }
}

/** 
 * handles `inlinePureOp` option (inline pure operation)
 * possible values are:
 *   - "noop" - removes pure calls
 *   - "iterator" - changes lean iterator context fields
 */
export function pureOp(si) {
  const s = Kit.auto(si)
  if (!s.opts.inlinePureOp)
    return s
  const template = s.opts.inlinePureOp
  const noop = template === "noop"
  const generators = template === "iterator"
  const promise = template === "promise"
  if (!noop && !generators && !promise)
    throw s.error(`unsupported value ${s.opts.inlinePureOp}`)
  const {contextSym} = s.first.value
  if (!contextSym && generators)
    throw s.error("not implemented inlinePure: 'iterator' without context")
  const field = s.opts.storeCont, exitField = s.opts.storeResultCont
  const noResult = s.opts.returnContext === false
  return _pureOp()
  function* val(pos) {
    const j = s.curLev()
    if (j) {
      if (!noResult)
        j.value.result = true
      yield* Kit.reposOne(s.sub(),pos)
    } else {
      if (!noResult)
        yield s.tok(Tag.push,Tag.Identifier,
                    {result:true,sym:Kit.scope.undefinedSym})
    }
  }
  function* _pureOp() {
    for(const i of s) {
      if (i.enter && i.type === Block.app && i.value.sym === Block.pureId) {
        if (noop) {
          yield* val(i.pos)
        } else if (promise) {
          yield s.enter(Tag.push,Tag.CallExpression,{result:!noResult})
          yield s.enter(Tag.callee,Tag.MemberExpression)
          yield s.tok(Tag.object,Tag.Identifier,{node:{name:"Promise"}})
          yield s.tok(Tag.property,Tag.Identifier,{node:{name:"resolve"}})
          yield* s.leave()
          yield s.enter(Tag.arguments,Tag.Array)
          if (s.curLev())
            yield* s.sub()
          yield* s.leave()
          yield* s.leave()
        } else {
          yield* s.toks(Tag.push,
                        `$1.${field} = $1.${exitField}, $1.done = true`,
                        contextSym)
          yield* assignValue(s,contextSym)
          if (!noResult)
            yield s.tok(Tag.push,Tag.Identifier,{sym:contextSym,result:true})
        }
        s.close(i)
        continue
      }
      yield i
    }
  }
}

/** 
 * handles `inlineRaiseOp` option (inlines `raise` operation)
 * possible values are:
 *   - 'throw' - replaces with `throw` statement
 *   - 'promise` - replaces with `Promise.reject`
 */
export function raiseOp(si) {
  const s = Kit.auto(si)
  if (!s.opts.inlineRaiseOp)
    return s
  const asThrow = s.opts.inlineRaiseOp === "throw"
  const asReject = s.opts.inlineRaiseOp === "promise"
  if (!asThrow && !asReject)
    throw new Error(`unknown 'inlineRaiseOp' option ${s.opts.inlineRaiseOp}`)
  return _raiseOp()
  function* _raiseOp() {
    for(const i of s) {
      const lab = s.label()
      if (i.enter && i.type === Block.app && i.value.sym === Except.raiseId) {
        if (asThrow) {
          yield s.enter(i.pos,Tag.ThrowStatement)
          yield* Kit.reposOne(s.sub(),Tag.argument)
        } else {
          yield s.enter(i.pos,Tag.CallExpression,{result:true})
          yield* s.toks(Tag.callee,"=Promise.reject")
          yield s.enter(Tag.arguments,Tag.Array)
          yield* Kit.reposOne(s.sub(),Tag.push)
        }
        yield* lab()
        s.close(i)
        continue
      }
      yield i
    }
  }
}

/** converts throw statements into `raise` operations `inlineThrow` option */
export function throwStatements(si) {
  const s = Kit.auto(si)
  if (!s.opts.inlineThrow)
    return s
  const {errFrameRedir} = s.first.value
  return _throwStatements()
  function* _throwStatements() {
    for(const i of s) {
      let goto
      if (i.enter && i.type === Block.frame
          && (goto = i.value.catchContRedir)) {
        yield i
        for(const j of s.sub()) {
          if (j.enter && j.type === Tag.ThrowStatement) {
            yield s.enter(j.pos,Ctrl.jump,{ref:j.value,goto,
                                           sym:goto.errSym,
                                           gotoDests:[goto]})
            if (!j.leave)
              yield* s.sub()
            yield* s.leave()
            s.close(j)
            if (j.pos === Tag.push)
              Kit.skip(s.sub())
            continue
          }
          yield j
        }
        continue
      }
      yield i
    }
  }
}

/** coerce checks inlining (`inlineCoerce:true`) */
export function coerce(si) {
  const s = Kit.auto(si)
  if (!s.opts.coerce || !s.opts.inlineCoerce)
    return s
  const root = s.first.value
  const {bindName,inlineCoerceCheckIsFunc:checkIsFunc} = s.opts
  return _coerce()
  function needsCoerce(n) {
    return !n || n === bindName || n === "map"
  }
  function* _coerce() {
    for(const i of s) {
      let name
      if (i.enter && i.type === Block.letStmt && i.value.eff
          && needsCoerce(name = i.value.bindName || bindName)) {
        const frame = i.value.ref
        const decls = frame.savedDecls || (frame.savedDecls = new Map())
        let sym, pos = i.pos
        const j = s.cur()
        const lab = s.label()
        if (j.type === Tag.Identifier && j.value.sym) {
          sym = j.value.sym
          Kit.skip(s.one())
        } else {
          sym = Kit.scope.newSym()
          decls.set(sym,{raw:null})
          yield s.enter(i.pos,Tag.SequenceExpression,{result:true})
          yield s.enter(Tag.expressions,Tag.Array)
          yield s.enter(Tag.push,Tag.AssignmentExpression,{node:{operator:"="}})
          yield s.tok(Tag.left,Tag.Identifier,{sym})
          yield* Kit.reposOne(s.one(),Tag.right)
          yield* s.leave()
          pos = Tag.push
        }
        yield s.enter(pos,Tag.ConditionalExpression,{result:true})
        let str = `=$1 && $1.${name}`
        if (checkIsFunc)
          str += `&& typeof $1.${name} === "function"`
        yield* s.toks(Tag.test,str,sym)
        yield s.enter(Tag.consequent,Block.letStmt,i.value)
        yield s.tok(Tag.push,Tag.Identifier,{sym})
        yield* s.leave()
        yield s.enter(Tag.alternate,Ctrl.jump,
                      Object.assign({},i.value,
                                    {bindJump:false,bindName:null}))
        yield s.tok(Tag.push,Tag.Identifier,{sym})
        yield* lab()
        s.close(i)
        continue
      }
      yield i
    }
  }
}

export function prepareInvertForOf(si) {
  const sa = Kit.toArray(si)
  const root = sa[0].value
  if (!root.opts.invertForOf)
    return sa
  if (!root.hasForOf)
    return sa
  recover(sa)
  return sa
  function recover() {
    const s = Kit.auto(sa)
    for(const i of s) {
      if (i.enter) {
        switch(i.type) {
        case Tag.IfStatement:
	        if (i.value.forOfExit) {
	          for(const k of s) {
	            if (k.enter && k.type === Ctrl.jump) {
	              k.value.ref.forOfFin = i.value.forOfExit
	              i.value.forOfExit.fin = k.value
                if (k.value.goto.dynamicJump) {
                  k.value.goto.declSym.dynForOf = i.value.forOfExit
                }
	              break
	            }
	          }
	        }
	        const j = s.cur()
          const {forOfInfo} = j.value
          if (!forOfInfo)
            continue
          i.value.forOfInfo = j.value.forOfInfo
          Kit.skip(s.one())
          Kit.skip(s.one())
          assert.ok(s.cur().pos === Tag.alternate)
          assert.ok(s.cur().type === Tag.BlockStatement)
          let jump
          for(const j of s.one())
            if (j.enter && j.type === Ctrl.jump)
              jump = j.value
          assert.ok(jump)
          jump.goto.catchContRedir.required = true
          jump.goto.required = true
          const frame = jump.ref
          const patSym = forOfInfo.patSym = frame.patSym =
	              frame.patSym
	              || root.commonPatSym
	              || Kit.scope.newSym("i")
          jump.ref.forOfInfo = forOfInfo
	        forOfInfo.body = jump.ref
          forOfInfo.exit = jump
          break
        case Ctrl.jump:
          const {goto} = i.value
          if (goto.dynamicJump) {
            goto.declSym.savedContext = null
            for(const j of i.value.gotoDests) {
              if (j.forOfInfo) {
                goto.declSym.savedContext = Bind.tempVarSym(root,"fx")                 
                break
              }
            }
          }
          break
        }
      }
    }
  }
}

/** injects interpretation `for-of` with `invertForOf:true` (CPS style) */
export function invertForOf(si) {
  const sa = Kit.toArray(si)
  const root = sa[0].value
  if (!root.opts.invertForOf || !root.hasForOf)
    return sa
  const jumpsExit = root.opts.inlinePureJumps === "exit"
  const dirCall = root.opts.storeCont === "step"
  return inject()
  function inject() {
    const s = Kit.auto(sa)
    const ctx = root.contextSym
    const {storeResultCont,storeCont:cont} = s.opts
    if (!ctx)
      throw s.error("not implemented: `invertForOf` without context object")
    if (s.opts.state)
      throw s.error("not implemented: `invertForOf` with `state`")
    if (!s.opts.inlineContAssign)
      throw s.error("not implemented: `invertForOf` without `inlineContAssign`")
    if (!s.opts.markRepeat)
      throw s.error("not implemented: `invertForOf` without `markRepeat`")
    if (s.opts.defunct)
      throw s.error("not implemented: `invertForOf` with `defunct`")
    const paramCtx = s.opts.contextBy === "parameter"
    const thisCtx = s.opts.contextBy === "reference"
    const frames = []
    const res = Kit.toArray(_inject(s))
    return res
    function* _inject(sw) {
      for(const i of sw) {
        if (i.enter) {
	        if ((i.type === Ctrl.jump || i.type === Block.letStmt)
	            && i.value.frameArgs) {
	          const args = i.value.frameArgs
	          for(const [n,v] of args) {
	            if (!v.substLoop)
		            continue
	            args.set(n, v.substLoop)
	          }
	        }
          switch(i.type) {
          case Tag.MemberExpression:
            if (!i.value.forOfInfo)
              break
            yield s.tok(i.pos,Tag.Identifier,{sym:i.value.forOfInfo.patSym})
            Kit.skip(s.copy(i))
            continue
          case Block.frame:
	          frames.push(i.value)
            i.value.declSym.forOfInfo = i.value.forOfInfo
	          if (i.value.forOfFin) {
	            const cur = i.value.forOfFin
	            const exit = cur.exit.goto
	            const up = cur.up
	            yield i
	            Kit.skip(s.sub())
	            yield* s.toks(Tag.push, `=$1.$exit()`,
			                      {result:true}, cur.sym)
	            yield s.close(i)
	            continue
	          }
            if (!i.value.forOfInfo)
              break
	          i.value.declSym.forOfInfo = i.value.forOfInfo
            yield i
            yield* s.toks(Tag.push,"=$2.$s = $1.unwrap.$t",
			                    ctx,i.value.forOfInfo.sym)
            continue
          case Block.letStmt:
            if (!i.value.eff || i.value.bindName === "yldStar")
              break
          case Ctrl.jump: {
            const {goto} = i.value
            const {forOfInfo} = goto
            if (!forOfInfo)
              break
            i.value.delegateCtx = goto.forOfInfo.sym
	          const exit = forOfInfo.exit.goto
	          const up = exit.forOfInfo
	          if (up) {
	            yield* s.toks(Tag.push,
			                      `=$1.$r = $2.$s, $1.$rstep = $2.$s.$step`,
			                      forOfInfo.sym, up.sym)
	          }
            yield* s.toks(Tag.push,`=$1.${cont} = $2`,
			                    ctx, goto.declSym)
            break }
          case Tag.IfStatement:
            if (!i.value.forOfInfo)
              break
            Kit.skip(s.one())
            yield* Kit.reposOne(_inject(s.one()),i.pos)
            Kit.skip(s.one())
            s.close(i)
            continue
          case Tag.AssignmentExpression:
            const j = s.cur()
            if (j.type !== Tag.Identifier || !j.value.forOfInfo)
              break
            const {forOfInfo} = j.value
	          let exit, up
	          if (forOfInfo.exit.indirJumps) {
	            for(const [dst,redir] of forOfInfo.exit.indirJumps) {
		            if (redir === forOfInfo.fin.goto) {
		              up = forOfInfo.up = dst.forOfInfo
                  dst.declSym.dynForOf = forOfInfo
                  break
		            }
	            }
	          }
            const lab = s.label()
            yield s.enter(i.pos,Tag.SequenceExpression)
            yield s.enter(Tag.expressions,Tag.Array)
	          if (forOfInfo.exit.indirJumps) {
	            for(const [dst,redir] of forOfInfo.exit.indirJumps)
		            yield* s.toks(Tag.push, `=$I = $I`, redir.declSym, dst.declSym)
	          }
            yield s.peel(Kit.setPos(i,Tag.push))
            yield* s.one()
            const call = s.take()
            yield call
            assert.ok(call.type === Tag.CallExpression)
            const iterSym = s.take()
            assert.ok(iterSym.value.sym === Loop.iteratorId)
            iterSym.value.sym = delegateSym
            yield* s.copy(iterSym)
            yield s.peel()
            yield* s.sub()
            yield s.tok(Tag.push,Tag.Identifier,{sym:ctx})
            if (up) {
              yield* s.toks(Tag.push, `=$I.$s`, up.sym)
              yield* s.toks(Tag.push, `=$I.$s.${cont}`, up.sym)
              yield s.tok(Tag.push,Tag.Identifier,{sym:up.body.declSym})
            } else {
              yield s.tok(Tag.push, Tag.Identifier, {sym:ctx})
              yield s.tok(Tag.push, Tag.Identifier,
                          {sym:forOfInfo.fin.goto.declSym})
            }
            yield* s.leave()
            yield s.close(call)
            yield* s.sub()
            yield* lab()
	          continue
          }
        }
        yield i
      }
    }
  }
}

/** inlines `yield*` operations for `invertForOf` */
function delegateYield(si) {
  const s = Kit.auto(si)
  const inlineYieldStar = s.opts.inlineYieldStarOp === "iterator"
  const cont = s.opts.storeCont
  if (!inlineYieldStar || !s.opts.invertForOf)
    return s
  const {contextSym:ctx} = s.first.value
  const root = s.first.value
  return _delegateYield()
  function* _delegateYield() {
    for(const i of s) {
      if (i.enter) {
	      switch(i.type) {
	      case Block.letStmt:
	        if (!i.value.eff)
	          break
          switch(i.value.bindName) {
          case "yldStar":
            const frame = i.value.ref
            const sym = i.value.delegateCtx = Kit.scope.newSym()
            frame.savedDecls.set(sym,{raw:null})
            yield* s.template(
              Tag.push,
              `=$2=$3($E,$1.$y,$E,$4)`,
              ctx, sym, delegateSym, i.value.goto.declSym)
            yield* s.sub()
            yield* s.refocus()
            const {forOfInfo:up} = i.value.goto
            if (up) {
              yield* s.toks(Tag.push,`=$I.$s`, up.sym)
              yield* s.toks(Tag.push,`=$I.$s.${cont}`, up.sym)
            } else {
              yield s.tok(Tag.push,Tag.Identifier,{sym:ctx})
              yield s.tok(Tag.push,Tag.Identifier,{sym:i.value.goto.declSym})
            }
            yield* s.leave()
            yield* s.toks(Tag.push,`=$I.${cont}()`,{name:null,result:true},sym)
            s.close(i)
            continue
          case "yld":
            if (i.value.goto.forOfInfo)
              yield* s.toks(Tag.push,`=$1.unwrap.$t = $2.$s`,
                            ctx, i.value.goto.forOfInfo.sym)
            else
              yield* s.toks(Tag.push,`=$1.unwrap.$t = $1`, ctx)
            break
          }
	      }
      }
      yield i
    }
  }
}

const yldId = Kit.sysId("yld")

/** injects delegating object fields `$r`, `$y`  */
function delegateOps(si) {
  const s = Kit.auto(si)
  if (!s.opts.invertForOf)
    return s
  const root = s.first.value
  const pure = mkSym("$res","$r")
  if (!s.opts.storeCont)
    throw s.error("not implemented: `invertForOf` without `storeCont`")
  if (!s.opts.storeErrorCont)
    throw s.error("not implemented: `invertForOf` without `storeErrorCont`")
  const raise = mkSym(s.opts.storeErrorCont,"$e")
  const yld = mkSym(s.opts.storeCont,"$y")
  const ctx = root.contextSym
  const cont = s.opts.storeCont
  return _delegateOps()
  function* _delegateOps() {
    for(const i of s) {
      if (i.enter && i.type === Block.app) {
        switch(i.value.sym) {
        case Except.raiseId:
	        yield* s.toks(Tag.push,`=$1.$i.$step = $1.$istep`,ctx)
          i.value.sym = raise
	        break
        case Block.pureId:
	        yield* s.toks(Tag.push,
			                  `=$1.$r.$res = $1.$rstep, $1.$i.$step = $1.$istep`,
			                  ctx)
          i.value.sym = pure
	        break
        case yldId:
          i.value.sym = yld
          break
        }
      }
      yield i
    }
  }
  function mkSym(pat,field) {
    const sym = Kit.scope.newSym(pat)
    sym.fieldName = pat
    sym.lib = true
    sym.ctxField = field
    return sym
  }
}

/**
 * handles indirect jumps to another context 
 * (e.g. if `finally` is the last block of `for-of`)
 */
function delegateIndirJumps(si) {
  const s = Kit.auto(si)
  if (!s.opts.invertForOf)
    return s
  const root = s.first.value
  const ctx = root.contextSym
  const cont = s.opts.storeCont
  return _delegateIndirJumps()
  function* _delegateIndirJumps() {
    for(const i of s) {
      if (i.enter) {
        switch(i.type) {
        case Block.frame:
          // TODO: result and error jumps
          break
        case Block.letStmt:
          if (!i.value.eff)
            break
        case Ctrl.jump:
          if (i.value.frameArgs) {
            for(const [fc,v] of i.value.frameArgs) {
              if (fc.dynForOf) {
                i.value.frameArgs.delete(fc)
                if (v.forOfInfo) {
                  yield* s.toks(Tag.push,
                                `=$1.$r = $2.$s, $1.$rstep = $2.$s.$step`,
                                fc.dynForOf.sym,
                                v.forOfInfo.sym)
                } else {
                  yield* s.toks(Tag.push,
                                `=$1.$r = $2, $1.$rstep = $3`,
                                fc.dynForOf.sym,ctx,v)
                }
              } else if (fc.savedContext) {
                i.value.frameArgs.delete(fc)
                if (v.forOfInfo) {
                  yield* s.toks(Tag.push,
                                `=$1 = $2, $3 = $4`,
                                fc.savedContext,
                                v.forOfInfo.sym,
                                fc, v)
                } else {
                  yield* s.toks(Tag.push,
                                `=$1 = $2, $3 = $4`,
                                fc.savedContext, ctx, fc, v)
                }
              }
            }
          }
          const {goto} = i.value
          if (goto && goto.dynamicJump && goto.declSym.savedContext) {
            yield* s.template(Tag.push,
                              `=$1.${cont}($E)`,
                              {result:true}, goto.declSym.savedContext)
            yield* s.sub()
            yield* s.leave()
            s.close(i)
            continue
          }
          break
        }
      }
      yield i
    }
  }
}

/** runs after `Flat.interpretJumps` */
export const control = Kit.pipe(
  delegateOps,
  jumpOps)

/** runs before `Flat.interpretApp` */
export const ops = Kit.pipe(
  pureOp,
  raiseOp)

export const vars = Kit.pipe(
  delegateIndirJumps)

/** runs before `Block.interpretJumps` */
export const jumps = Kit.pipe(
  promises,
  coerce,
  delegateYield,
  generatorsYield)

import * as Kit from "./kit"
import * as T from "babel-types"
import * as RT from "@effectful/transducers/rt"

const {Tag} = Kit

const emptyMap = new Map()

/** collects all symbol with library ns */
export function collect(s) {
  const sa = Kit.toArray(s)
  const root = sa[0].value
  const rootNs = root.$ns
  const mods = root.injectRT || emptyMap
  const ctxns = root.opts.transform
        && root.opts.contextMethodOps && root.contextSym
  for(const i of sa) {
    if (i.enter && i.type === Tag.Identifier
        && i.value.sym && i.value.sym.lib) {
      let ns = i.value.ns
      if (ns == null)
        ns = ctxns
      ns = ns || rootNs
      i.value.ns = ns
      const def = mods.get(ns)
      if (def)
        def.usages.add(i.value.sym)
    }
  }
  return sa
}

/**
 * injects import from `require` options if it doesn't exist already
 * if option `inject` is true, will use `ns` as namespace parameter if 
 * specified or some unique variable
 */
export function inject(si) {
  const s = Kit.auto(si)
  const root = s.first.value
  const mods = root.injectRT
  if (!mods.size)
    return s
  const rt = root.rt = {importSyms:[],
                        importNs:[],
                        inlineSyms:[]}
  for(const [ns,def] of mods) {
    if (!def.usages.size)
      continue
    if (def.content)
      rt.inlineSyms.push({syms:def.usages,content:def.content})
    else
      rt.importSyms.push({syms:def.usages,
                          ns:def.ns,
                          module:def.module})
  }
  return RT.importSyms(s)
}


export function* interpretLibSyms(si) {
  const s = Kit.auto(si)
  const root = s.first.value
  const ns = root.$ns
  for(const i of s) {
    if (i.enter && i.type === Tag.Identifier
        && i.pos !== Tag.property && !i.value.decl
        && i.value.sym && i.value.sym.lib) {
      const {sym} = i.value
      if (sym.nsDefault) {
        yield s.tok(i.pos,Tag.Identifier,{sym:ns})
      } else if (ns) {
        yield s.enter(i.pos,Tag.MemberExpression,{})
        yield s.tok(Tag.object,Tag.Identifier,{sym:ns})
        yield s.tok(Tag.property,Tag.Identifier,{sym,node:{name:sym.name}})
        yield* s.leave()
        s.close(i)
      } else
        yield i
    } else
      yield i
  }
}


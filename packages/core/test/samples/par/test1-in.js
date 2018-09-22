M.profile("es")

M.option({combineOps:true,
          scopeContext:true,
          scopePrefix:true,
          contextState:true,
          contextMethodOps:true,
          cleanupFrameVars:false,
          par: true})

async function p0(a,b) {
  await g_1(await f_3, await f_4)
}

async function p1(a,b) {
  const x = await f_3
  const y = await f_4
  await g_1(x, y)
}

async function p2() {
  await k_1(await a_1)
  await k_2(await a_2)
}

async function p3() {
  await f_2
  await g_1(await f_3, await f_4)
  await f_5
}

async function p4() {
  await f_2(await a_1)
  await g_1(await f_3, await f_4)
  await f_5
}

async function p5() {
  if (await f0) 
    await e0(await f2)
  else
    await f1
  await f_2
}

async function p6() {
  await f8(await f3, await f9(await f5))
  await g2(await g3, await g4)
  await f_3
}

async function p7() {
  await f_3
  await f8(await f3, await f9(await f5))
  await g2(await g3, await g4)
}

async function p8() {
  await k_0
  if (await f0) 
    await e0(await f2)
  else
    await f1
  await f_2
  await f_3
  await f8(await f3, await f9(await f5))
  await g2(await g3, await g4)
}

async function p9(a,b) {
  await m_1((await g_1(await f_3, await f_4)), await k_1)
}

async function p9_a(a,b) {
  await m_1(await k_1, (await g_1(await f_3, await f_4)))
}

async function p10() {
  const va = await a_1
  const vb = await a_2
  await k_1(va)
  await k_2(vb)
}

async function p11() {
  const i = await f_1()
  const x = await g_1(i)
  const y = await f_2()
  await k_1(x, y)
}

async function p12() {
  const i = await f_1()
  const x = await g_1(i)
  const y = await f_2()
  return await k_1(x, y)
}

async function p13() {
  const i = await f_1()
  const x = await g_1(i)
  const y = await f_2()
  const z = await k_1(x, y)
  return await fi_1(z)
}

async function p14() {
  let j,k
  const i = await init
  var a1 = await k_1(await a_1(i++), k+=await m2), a2 = await k_2(await a_2)
  j++
  await g(a1,a2)
  await f(a1,j,k)
  await f2(a2,j,k)
}

async function p15(a,b) {
  const x = await f_3(a)
  const y = await f_4(b)
  await g_1(x, y)
}

async function p16(a,b) {
  await g_1(await f_3(a), await f_4(b))
}

async function p17() {
  let j,k
  const w = await wery
  let i = await init(w)
  var a1 = await k_1(await a_1(i++,w), k+=await m2(w), w), a2 = await k_2(w, await a_2(w))
  return await g(a1,a2,w)
}

async function p18() {
  let j,k
  const w = await wery
  const i = await init(w)
  var a1 = await k_1(await a_1(i++,w), k+=await m2(w), w), a2 = await k_2(w, await a_2(w))
  j+= await m_1(w)
  await g(a1,a2,w)
}

async function p19() {
  let j,k
  const w = await wery
  const i = await init(w)
  var a1 = await k_1(await a_1(i++,w), k+=await m2(w), w), a2 = await k_2(w, await a_2(w))
  j+= await m_1(w)
  await g(a1,a2,w)
  await f(a1,j,k,w)
  await f2(a2,j,k,w)
}

async function p20() {
  let j,k
  const i = await init()
  var a1 = await k_1(await a_1(i++), k+=await m2()), a2 = await k_2(await a_2())
  j+= await m_1()
  await g(a1,a2)
  await f(a1,j,k)
  await f2(a2,j,k)
}

async function p21() {
  let j,k
  const i = await init()
  j = await g(i)
  k = await f(i)
  await m(j,k)
}

async function p22() {
  let j,k
  const i = await init()
  j = await g(i)
  jj = await j
  k = await f(i)
  await m(jj,k)
}

async function p23() {
  const i = await f_1()
  const x = await g_1(i)
  const y = await f_2()
  await k_1(x, y)
}

async function p24() {
  const i = await f_1()
  const x = await g_1(i)
  const y = await f_2()
  await k_1(x, y)
}


async function p25() {
  const i = await f_1()
  const x = await g_1(i)
  const y = await f_2()
  const z = await k_1(x, y)
  return await fi_1(z)
}

async function p26() {
  const x = await f_1()
  const y = await f_2()
  const z = await f_3()
  const a = await g_1(x, y)
  const b = await g_2(x, z)
  await k_1(a, b)
}

async function p27() {
  let j,k, jj, z, x
  z = await pre
  x = await mu
  jj = await bu(z,x)
  const i = await init()
  j = await g(i)
  k = await f(i)
  await m(jj,k,j)
}

async function p28() {
  let j,k, jj, z
  jj = await pre
  const i = await init()
  j = await g(i)
  k = await f(i)
  await m(jj,k,j)
}

async function p29() {
  const x = await init_x()
  const y = await init_y()
  await f_1(x, y)
  const y2 = await f_2(y)
  const y3 = await f_3(y)
  await f_4(y2, y3)
}

async function p30() {
  const i = await init()
  const x = await f_1()
  const y = await f_2()
  const y2 = await f_2_2(i, y)
  const z = await f_3()
  const a = await g_1(x, y)
  const b = await g_2(y, z)
  const b1 = await g_2_b1(b)
  const b2 = await g_2_b2(b)
  const c = await g_3(x, z)
  const d = await g_4(z, x)
  const m = await k_1(i, y, a, b, c, d, y2)
  const n = await k_2(i, y, a, b1, b2, c)
  await m_1(m, n)
}

async function p31() {
  let j,k, z, x
  z = await pre
  x = await mu
   await bu(z,x)
  const i = await init()
  j = await g(i)
  k = await f(i)
  await m(k,j)
}


function a() {
  var e;
  return M.jumpH(_1, _6);

  function _1() {
    return M.chainBH(eff(1), _4, _5);
  }

  function _2(ex) {
    e = ex;
    console.log(e, 1);
    return M.chainBH(eff(2), _3, _5);
  }

  function _3() {
    console.log(e, 2);
    return M.pure();
  }

  function _4() {
    return M.pure();
  }

  function _5(e) {
    return M.raise(e);
  }

  function _6(a) {
    return M.jumpH(_2, _5, a);
  }
}
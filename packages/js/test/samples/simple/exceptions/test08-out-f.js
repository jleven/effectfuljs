function a() {
  var fc, fe, err;
  return M.jumpH(_1, _6);

  function _1() {
    fc = _3, fe = _4;
    return M.chainBH(eff(1), _2, _4);
  }

  function _2() {
    console.log('fin');
    return M.jumpH(fc, fe);
  }

  function _3() {
    return M.pure();
  }

  function _4(e) {
    return M.raise(e);
  }

  function _5() {
    return M.raise(err);
  }

  function _6(a) {
    fc = _5, fe = _4, err = a;
    return M.jumpH(_2, _4);
  }
}
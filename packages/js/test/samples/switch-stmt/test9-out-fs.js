// *- with state
function a() {
  var i;
  i = 0;
  return M.chainBH(eff(), _1, _5, i);

  function _1(i) {
    var a;
    a = i += 1;
    return M.chainBH(eff(a), _2, _5, i);
  }

  function _2(a, i) {
    var b, c;

    switch (a) {
      case 1:
        b = i += 3;
        return M.chainBH(effB(b), _3, _5, i);

      case 2:
        c = i += 5;
        return M.chainBH(effB(c), _3, _5, i);

      case 3:
        {
          console.log('hi', i);
        }

      default:
        return M.jumpH(_3, _5, i);
    }
  }

  function _3(i) {
    return M.chainBH(eff(i), _4, _5);
  }

  function _4() {
    return M.pure();
  }

  function _5(e) {
    return M.raise(e);
  }
}
var $M = require("@effectful/debugger"),
    $yld = $M.yld,
    $context = $M.context,
    $ret = $M.ret,
    $retG = $M.retG,
    $unhandled = $M.unhandled,
    $unhandledG = $M.unhandledG,
    $brk = $M.brk,
    $lset = $M.lset,
    $m = $M.module("file.js", null, typeof module === "undefined" ? null : module, null, "$", {
  __webpack_require__: typeof __webpack_require__ !== "undefined" && __webpack_require__
}, null),
    $s$1 = [{
  _generators: [1, null],
  _interopRequireDefault: [2, null],
  a: [3, "3:10-3:11"]
}, null, 0],
    $s$2 = [{
  obj: [1, null]
}, $s$1, 1],
    $s$3 = [{}, $s$1, 1],
    $m$0 = $M.fun("m$0", "file.js", null, null, [], 0, 4, "1:0-7:0", 32, function file_js($, $l, $p) {
  for (;;) switch ($.state = $.goto) {
    case 0:
      $lset($l, 2,
      /*_interopRequireDefault*/
      $m$1($));
      $lset($l, 3,
      /*a*/
      $m$2($));
      $.goto = 1;
      $brk("1:0-1:38");
      $.state = 1;

    case 1:
      $.goto = 2;
      $p = ($context.moduleId = require.resolve("@effectful/generators"), $M.force(require("@effectful/generators")));
      $.state = 2;

    case 2:
      $.goto = 3;
      $p = ($context.call = $l[2])($p);
      $.state = 3;

    case 3:
      $lset($l, 1,
      /*_generators*/
      $p);
      $.goto = 5;
      continue;

    case 4:
      $.goto = 5;
      return $unhandled($.error);

    case 5:
      return $ret($.result);

    default:
      throw new Error("Invalid state");
  }
}, null, null, 0, [[4, "1:0-1:38", $s$1], [2, null, $s$1], [2, null, $s$1], [0, null, $s$1], [16, "7:0-7:0", $s$1], [16, "7:0-7:0", $s$1]]),
    $m$1 = $M.fun("m$1", "_interopRequireDefault", null, $m$0, ["obj"], 1, 2, null, 0, function _interopRequireDefault($, $l, $p) {
  var $1;

  for (;;) switch ($.state = $.goto) {
    case 0:
      $1 = $l[1];

      if ($1) {
        $1 = $l[1].__esModule;
        $.state = 1;
      } else {
        $.state = 1;
      }

    case 1:
      if ($1) {
        $.result = $l[1];
        $.state = 2;
      } else {
        $.result = {
          default: $l[1]
        };
        $.state = 2;
      }

    case 2:
      $.goto = 4;
      continue;

    case 3:
      $.goto = 4;
      return $unhandled($.error);

    case 4:
      return $ret($.result);

    default:
      throw new Error("Invalid state");
  }
}, null, null, 1, [[0, null, $s$2], [0, null, $s$2], [0, null, $s$2], [16, null, $s$2], [16, null, $s$2]]),
    $m$2 = $M.fun("m$2", "a", null, $m$0, [], 0, 1, "3:0-6:1", 2, function a($, $l, $p) {
  for (;;) switch ($.state = $.goto) {
    case 0:
      $.goto = 1;
      $brk("4:2-4:10");
      $.state = 1;

    case 1:
      $.goto = 2;
      return $yld(1);

    case 2:
      $.goto = 3;
      $brk("5:2-5:10");
      $.state = 3;

    case 3:
      $.goto = 5;
      return $yld(2);

    case 4:
      $.goto = 5;
      return $unhandledG($.error);

    case 5:
      return $retG($.result);

    default:
      throw new Error("Invalid state");
  }
}, null, null, 1, [[4, "4:2-4:10", $s$3], [2, "4:2-4:9", $s$3], [4, "5:2-5:10", $s$3], [2, "5:2-5:9", $s$3], [16, "6:1-6:1", $s$3], [16, "6:1-6:1", $s$3]]);

$M.moduleExports();
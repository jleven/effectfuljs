var $M = require("@effectful/debugger"),
    $forInIterator = $M.forInIterator,
    $awt = $M.awt,
    $context = $M.context,
    $ret = $M.ret,
    $retA = $M.retA,
    $unhandled = $M.unhandled,
    $unhandledA = $M.unhandledA,
    $brk = $M.brk,
    $mcall = $M.mcall,
    $m = $M.module("file.js", null, typeof module === "undefined" ? null : module, null, "$", {
  __webpack_require__: typeof __webpack_require__ !== "undefined" && __webpack_require__
}, null),
    $s$1 = [{
  _core: [1, null],
  _getRequireWildcardCache: [2, null],
  _interopRequireWildcard: [3, null],
  a: [4, "21:15-21:16"],
  b: [5, "30:15-30:16"],
  c: [6, "39:15-39:16"],
  d: [7, "48:15-48:16"]
}, null, 0],
    $s$2 = [{
  cache: [1, null]
}, $s$1, 1],
    $s$3 = [{}, $s$2, 2],
    $s$4 = [{
  obj: [1, null],
  cache: [2, null],
  newObj: [3, null],
  hasPropertyDescriptor: [4, null],
  key: [5, null],
  desc: [6, null]
}, $s$1, 1],
    $s$5 = [{}, $s$1, 1],
    $s$6 = [{}, $s$1, 1],
    $s$7 = [{}, $s$1, 1],
    $s$8 = [{}, $s$1, 1],
    $m$0 = $M.fun("m$0", "file.js", null, null, [], 0, 8, "1:0-56:0", 32, function file_js($, $l, $p) {
  for (;;) switch ($.state = $.goto) {
    case 0:
      $l[2] = $m$1($);
      $l[3] = $m$3($);
      $l[4] = $m$4($);
      $l[5] = $m$5($);
      $l[6] = $m$6($);
      $l[7] = $m$7($);
      $.goto = 1;
      $brk();
      $.state = 1;

    case 1:
      $.goto = 2;
      $p = ($context.moduleId = require.resolve("@effectful/core"), $M.force(require("@effectful/core")));
      $.state = 2;

    case 2:
      $.goto = 3;
      $p = ($context.call = $l[3])($p);
      $.state = 3;

    case 3:
      $l[1] = $p;
      $.goto = 4;
      $brk();
      $.state = 4;

    case 4:
      $.goto = 6;
      $mcall("option", $l[1].default, {
        combineOps: true,
        scopeContext: true,
        scopePrefix: true,
        contextState: false,
        topLevel: false,
        contextMethodOps: true,
        cleanupFrameVars: false,
        par: true,
        keepLastPure: true,
        defunct: true,
        storeCont: "$state",
        storeHandler: "$run",
        reuseTempVars: true,
        blockDirsFunc: "block"
      });
      continue;

    case 5:
      $.goto = 6;
      return $unhandled($.error);

    case 6:
      return $ret($.result);

    default:
      throw new Error("Invalid state");
  }
}, null, null, 0, [[4, "1:0-1:32", $s$1], [2, null, $s$1], [2, null, $s$1], [4, "4:0-19:3", $s$1], [2, "4:0-19:2", $s$1], [16, "56:0-56:0", $s$1], [16, "56:0-56:0", $s$1]]),
    $m$1 = $M.fun("m$1", "_getRequireWildcardCache", null, $m$0, [], 0, 2, null, 0, function _getRequireWildcardCache($, $l, $p) {
  for (;;) switch ($.state = $.goto) {
    case 0:
      if (typeof WeakMap !== "function") {
        $.state = 1;
      } else {
        $.goto = 2;
        continue;
      }

    case 1:
      $.result = null;
      $.goto = 5;
      continue;

    case 2:
      $.goto = 3;
      $p = new ($context.call = WeakMap)();
      $.state = 3;

    case 3:
      $l[1] = $p;
      $l[0][2] = $m$2($);
      $.result = $l[1];
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
}, null, null, 1, [[0, null, $s$2], [0, null, $s$2], [2, null, $s$2], [0, null, $s$2], [16, null, $s$2], [16, null, $s$2]]),
    $m$2 = $M.fun("m$2", null, null, $m$1, [], 0, 1, null, 0, function ($, $l, $p) {
  for (;;) switch ($.state = $.goto) {
    case 0:
      $.result = $l[0][1];
      $.goto = 2;
      continue;

    case 1:
      $.goto = 2;
      return $unhandled($.error);

    case 2:
      return $ret($.result);

    default:
      throw new Error("Invalid state");
  }
}, null, null, 2, [[0, null, $s$3], [16, null, $s$3], [16, null, $s$3]]),
    $m$3 = $M.fun("m$3", "_interopRequireWildcard", null, $m$0, ["obj"], 1, 9, null, 0, function _interopRequireWildcard($, $l, $p) {
  var $1;

  for (;;) switch ($.state = $.goto) {
    case 0:
      $1 = $l[1];

      if ($1) {
        $.state = 1;
      } else {
        $.goto = 2;
        continue;
      }

    case 1:
      $1 = $l[1].__esModule;
      $.state = 2;

    case 2:
      if ($1) {
        $.state = 3;
      } else {
        $.goto = 4;
        continue;
      }

    case 3:
      $.result = $l[1];
      $.goto = 42;
      continue;

    case 4:
      $1 = $l[1] === null;

      if ($1) {
        $.state = 5;
      } else {
        $.goto = 38;
        continue;
      }

    case 5:
      if ($1) {
        $.state = 6;
      } else {
        $.goto = 7;
        continue;
      }

    case 6:
      $.result = {
        default: $l[1]
      };
      $.goto = 42;
      continue;

    case 7:
      $.goto = 8;
      $p = ($context.call = $l[0][2])();
      $.state = 8;

    case 8:
      $l[2] = $p;
      $l[7] = $l[2];

      if ($l[7]) {
        $.state = 9;
      } else {
        $.goto = 11;
        continue;
      }

    case 9:
      $.goto = 10;
      $p = $mcall("has", $l[2], $l[1]);
      $.state = 10;

    case 10:
      $l[7] = $p;
      $.state = 11;

    case 11:
      if ($l[7]) {
        $.state = 12;
      } else {
        $.goto = 14;
        continue;
      }

    case 12:
      $.goto = 13;
      $p = $mcall("get", $l[2], $l[1]);
      $.state = 13;

    case 13:
      $.result = $p;
      $.goto = 42;
      continue;

    case 14:
      $l[3] = {};
      $1 = Object.defineProperty;

      if ($1) {
        $.state = 15;
      } else {
        $.goto = 16;
        continue;
      }

    case 15:
      $1 = Object.getOwnPropertyDescriptor;
      $.state = 16;

    case 16:
      $l[4] = $1;
      $.goto = 17;
      $p = $forInIterator($l[1]);
      $.state = 17;

    case 17:
      $l[7] = $p;
      $.state = 18;

    case 18:
      $context.call = $l[7].next;
      $.goto = 19;
      $p = $l[7].next();
      $.state = 19;

    case 19:
      if ($p.done) {
        $.state = 20;
      } else {
        $.goto = 23;
        continue;
      }

    case 20:
      $l[3].default = $l[1];

      if ($l[2]) {
        $.state = 21;
      } else {
        $.goto = 22;
        continue;
      }

    case 21:
      $.goto = 22;
      $mcall("set", $l[2], $l[1], $l[3]);
      $.state = 22;

    case 22:
      $.result = $l[3];
      $.goto = 42;
      continue;

    case 23:
      $l[5] = $p.value;
      $.goto = 24;
      $p = $mcall("call", Object.prototype.hasOwnProperty, $l[1], $l[5]);
      $.state = 24;

    case 24:
      if ($p) {
        $.state = 25;
      } else {
        $.goto = 37;
        continue;
      }

    case 25:
      if ($l[4]) {
        $.state = 26;
      } else {
        $.goto = 36;
        continue;
      }

    case 26:
      $.goto = 27;
      $p = $mcall("getOwnPropertyDescriptor", Object, $l[1], $l[5]);
      $.state = 27;

    case 27:
      $l[8] = $p;
      $.state = 28;

    case 28:
      $l[6] = $l[8];
      $1 = $l[6];

      if ($1) {
        $.state = 29;
      } else {
        $.goto = 32;
        continue;
      }

    case 29:
      $1 = $l[6].get;

      if ($1) {
        $.state = 30;
      } else {
        $.goto = 31;
        continue;
      }

    case 30:
      $.goto = 32;
      continue;

    case 31:
      $1 = $l[6].set;
      $.goto = 30;
      continue;

    case 32:
      if ($1) {
        $.state = 33;
      } else {
        $.goto = 35;
        continue;
      }

    case 33:
      $.goto = 34;
      $mcall("defineProperty", Object, $l[3], $l[5], $l[6]);
      $.state = 34;

    case 34:
      $.goto = 37;
      continue;

    case 35:
      $l[3][$l[5]] = $l[1][$l[5]];
      $.goto = 34;
      continue;

    case 36:
      $l[8] = null;
      $.goto = 28;
      continue;

    case 37:
      $.goto = 18;
      continue;

    case 38:
      $1 = typeof $l[1] !== "object";

      if ($1) {
        $.state = 39;
      } else {
        $.goto = 40;
        continue;
      }

    case 39:
      $1 = typeof $l[1] !== "function";
      $.state = 40;

    case 40:
      $.goto = 5;
      continue;

    case 41:
      $.goto = 42;
      return $unhandled($.error);

    case 42:
      return $ret($.result);

    default:
      throw new Error("Invalid state");
  }
}, null, null, 1, [[0, null, $s$4], [0, null, $s$4], [0, null, $s$4], [0, null, $s$4], [0, null, $s$4], [0, null, $s$4], [0, null, $s$4], [2, null, $s$4], [0, null, $s$4], [2, null, $s$4], [0, null, $s$4], [0, null, $s$4], [2, null, $s$4], [0, null, $s$4], [0, null, $s$4], [0, null, $s$4], [2, null, $s$4], [0, null, $s$4], [2, null, $s$4], [0, null, $s$4], [0, null, $s$4], [2, null, $s$4], [0, null, $s$4], [2, null, $s$4], [0, null, $s$4], [0, null, $s$4], [2, null, $s$4], [0, null, $s$4], [0, null, $s$4], [0, null, $s$4], [0, null, $s$4], [0, null, $s$4], [0, null, $s$4], [2, null, $s$4], [0, null, $s$4], [0, null, $s$4], [0, null, $s$4], [0, null, $s$4], [0, null, $s$4], [0, null, $s$4], [0, null, $s$4], [16, null, $s$4], [16, null, $s$4]]),
    $m$4 = $M.fun("m$4", "a", null, $m$0, [], 0, 1, "21:0-28:1", 1, function a($, $l, $p) {
  for (;;) switch ($.state = $.goto) {
    case 0:
      $.goto = 1;
      $brk();
      $.state = 1;

    case 1:
      $.goto = 2;
      return $awt(s_1);

    case 2:
      $.goto = 3;
      $brk();
      $.state = 3;

    case 3:
      $.goto = 4;
      $mcall("block", $l[0][1].default, "par");
      $.state = 4;

    case 4:
      $.goto = 5;
      $brk();
      $.state = 5;

    case 5:
      $.goto = 6;
      return $awt(p_1);

    case 6:
      $.goto = 7;
      $brk();
      $.state = 7;

    case 7:
      $.goto = 8;
      return $awt(p_2);

    case 8:
      $.goto = 9;
      $brk();
      $.state = 9;

    case 9:
      $.goto = 11;
      $brk();
      continue;

    case 10:
      $.goto = 11;
      return $unhandledA($.error);

    case 11:
      return $retA($.result);

    default:
      throw new Error("Invalid state");
  }
}, null, null, 1, [[4, "22:2-22:12", $s$5], [2, "22:2-22:11", $s$5], [4, "24:4-24:19", $s$5], [2, "24:4-24:18", $s$5], [4, "25:4-25:14", $s$5], [2, "25:4-25:13", $s$5], [4, "26:4-26:14", $s$5], [2, "26:4-26:13", $s$5], [36, "27:3-27:3", $s$5], [36, "28:1-28:1", $s$5], [16, "28:1-28:1", $s$5], [16, "28:1-28:1", $s$5]]),
    $m$5 = $M.fun("m$5", "b", null, $m$0, [], 0, 1, "30:0-37:1", 1, function b($, $l, $p) {
  for (;;) switch ($.state = $.goto) {
    case 0:
      $.goto = 1;
      $brk();
      $.state = 1;

    case 1:
      $.goto = 2;
      return $awt(s_1);

    case 2:
      $.goto = 3;
      $brk();
      $.state = 3;

    case 3:
      0;
      $.goto = 4;
      ($context.call = $l[0][1].block)("par");
      $.state = 4;

    case 4:
      $.goto = 5;
      $brk();
      $.state = 5;

    case 5:
      $.goto = 6;
      return $awt(p_1);

    case 6:
      $.goto = 7;
      $brk();
      $.state = 7;

    case 7:
      $.goto = 8;
      return $awt(p_2);

    case 8:
      $.goto = 9;
      $brk();
      $.state = 9;

    case 9:
      $.goto = 11;
      $brk();
      continue;

    case 10:
      $.goto = 11;
      return $unhandledA($.error);

    case 11:
      return $retA($.result);

    default:
      throw new Error("Invalid state");
  }
}, null, null, 1, [[4, "31:2-31:12", $s$6], [2, "31:2-31:11", $s$6], [4, "33:4-33:16", $s$6], [2, "33:4-33:15", $s$6], [4, "34:4-34:14", $s$6], [2, "34:4-34:13", $s$6], [4, "35:4-35:14", $s$6], [2, "35:4-35:13", $s$6], [36, "36:3-36:3", $s$6], [36, "37:1-37:1", $s$6], [16, "37:1-37:1", $s$6], [16, "37:1-37:1", $s$6]]),
    $m$6 = $M.fun("m$6", "c", null, $m$0, [], 0, 1, "39:0-46:1", 1, function c($, $l, $p) {
  for (;;) switch ($.state = $.goto) {
    case 0:
      $.goto = 1;
      $brk();
      $.state = 1;

    case 1:
      $.goto = 2;
      return $awt(s_1);

    case 2:
      $.goto = 3;
      $brk();
      $.state = 3;

    case 3:
      0;
      $.goto = 4;
      ($context.call = $l[0][1].block)("par");
      $.state = 4;

    case 4:
      $.goto = 5;
      $brk();
      $.state = 5;

    case 5:
      $.goto = 6;
      return $awt(p_1);

    case 6:
      $.goto = 7;
      $brk();
      $.state = 7;

    case 7:
      $.goto = 8;
      return $awt(p_2);

    case 8:
      $.goto = 9;
      $brk();
      $.state = 9;

    case 9:
      $.goto = 11;
      $brk();
      continue;

    case 10:
      $.goto = 11;
      return $unhandledA($.error);

    case 11:
      return $retA($.result);

    default:
      throw new Error("Invalid state");
  }
}, null, null, 1, [[4, "40:2-40:12", $s$7], [2, "40:2-40:11", $s$7], [4, "42:4-42:17", $s$7], [2, "42:4-42:16", $s$7], [4, "43:4-43:14", $s$7], [2, "43:4-43:13", $s$7], [4, "44:4-44:14", $s$7], [2, "44:4-44:13", $s$7], [36, "45:3-45:3", $s$7], [36, "46:1-46:1", $s$7], [16, "46:1-46:1", $s$7], [16, "46:1-46:1", $s$7]]),
    $m$7 = $M.fun("m$7", "d", null, $m$0, [], 0, 1, "48:0-55:1", 1, function d($, $l, $p) {
  for (;;) switch ($.state = $.goto) {
    case 0:
      $.goto = 1;
      $brk();
      $.state = 1;

    case 1:
      $.goto = 2;
      return $awt(s_1);

    case 2:
      $.goto = 3;
      $brk();
      $.state = 3;

    case 3:
      "par";
      $.goto = 4;
      $brk();
      $.state = 4;

    case 4:
      $.goto = 5;
      return $awt(p_1);

    case 5:
      $.goto = 6;
      $brk();
      $.state = 6;

    case 6:
      $.goto = 7;
      return $awt(p_2);

    case 7:
      $.goto = 8;
      $brk();
      $.state = 8;

    case 8:
      $.goto = 10;
      $brk();
      continue;

    case 9:
      $.goto = 10;
      return $unhandledA($.error);

    case 10:
      return $retA($.result);

    default:
      throw new Error("Invalid state");
  }
}, null, null, 1, [[4, "49:2-49:12", $s$8], [2, "49:2-49:11", $s$8], [4, "51:4-51:12", $s$8], [4, "52:4-52:14", $s$8], [2, "52:4-52:13", $s$8], [4, "53:4-53:14", $s$8], [2, "53:4-53:13", $s$8], [36, "54:3-54:3", $s$8], [36, "55:1-55:1", $s$8], [16, "55:1-55:1", $s$8], [16, "55:1-55:1", $s$8]]);

$M.moduleExports();
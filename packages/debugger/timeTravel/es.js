"use strict";

exports.__esModule = true;
exports.SetSnapshot = exports.setMeta = exports.MapSnapshot = exports.mapMeta = void 0;

var _config = require("../config");

var _core = require("./core");

var _serialization = require("@effectful/serialization");

function prototypeFwds(resProto) {
  const proto = Object.getPrototypeOf(resProto);

  for (const i of (0, _core.allProps)(proto)) {
    if (i === "constructor") continue;
    const descr = Object.getOwnPropertyDescriptor(proto, i);
    if (!descr) continue;
    const orig = descr.value;
    if (typeof orig !== "function") continue;
    if (resProto.hasOwnProperty(i)) continue;

    resProto[i] = function () {
      return orig.apply(this[_core.traceDataSymbol].target, arguments);
    };
  }

  return resProto;
}

const mapMeta = {
  wrap(target) {
    const res = (0, _core.defaultWrap)(this, target);
    res[_core.traceDataSymbol].lastContUpdate = _core.journal.now;
    return res;
  }

};
exports.mapMeta = mapMeta;
Map.prototype[_core.traceMetaSymbol] = mapMeta;

class MapSnapshot {
  constructor(data) {
    this.at = data.lastContUpdate;
    data.lastContUpdate = _core.journal.now;
    this.data = data;
    this.changes = [...data.target];
  }

  call() {
    const {
      data,
      changes,
      at
    } = this;

    if (_config.default.timeTravelForward) {
      data.lastContUpdate = null;
      mapSnapshot(data);
    }

    const {
      target
    } = data;
    target.clear();
    data.lastContUpdate = at;

    for (const [k, v] of changes) target.set(k, v);
  }

}

exports.MapSnapshot = MapSnapshot;
(0, _serialization.regConstructor)(MapSnapshot);

function mapSnapshot(data) {
  if (!_core.journal.now || data.lastContUpdate === _core.journal.now) return data.target;
  (0, _core.record)(new MapSnapshot(data));
  return data.target;
}

const mapProto = mapMeta.proto = Object.create(Map.prototype);

mapProto.set = function (k, v) {
  Map.prototype.set.call(mapSnapshot(this[_core.traceDataSymbol]), k, v);
  return this;
};

const mapSizeDescriptor = Object.getOwnPropertyDescriptor(Map.prototype, "size");

if (mapSizeDescriptor && mapSizeDescriptor.get) {
  Object.defineProperty(mapProto, "size", { ...mapSizeDescriptor,

    get() {
      return mapSizeDescriptor.get.call(this[_core.traceDataSymbol].target);
    }

  });
}

mapProto.delete = function (k) {
  return Map.prototype.delete.call(mapSnapshot(this[_core.traceDataSymbol]), k);
};

mapProto.clear = function () {
  return Map.prototype.clear.call(mapSnapshot(this[_core.traceDataSymbol]));
};

prototypeFwds(mapMeta.proto);
const setMeta = {
  wrap(target) {
    const res = (0, _core.defaultWrap)(this, target, _core.defaultTrapsWithGetter);
    res[_core.traceDataSymbol].lastContUpdate = _core.journal.now;
    return res;
  }

};
exports.setMeta = setMeta;
Set.prototype[_core.traceMetaSymbol] = setMeta;
const setProto = Object.create(Set.prototype);
setMeta.proto = setProto;
const setSizeDescriptor = Object.getOwnPropertyDescriptor(Set.prototype, "size");

if (setSizeDescriptor && setSizeDescriptor.get) {
  Object.defineProperty(setProto, "size", { ...setSizeDescriptor,

    get() {
      return setSizeDescriptor.get.call(this[_core.traceDataSymbol].target);
    }

  });
}

class SetSnapshot {
  constructor(data) {
    this.data = data;
    this.changes = [...data.target];
    this.at = data.lastContUpdate;
    data.lastContUpdate = _core.journal.now;
  }

  call() {
    const {
      data,
      at,
      changes
    } = this;

    if (_config.default.timeTravelForward) {
      data.lastContUpdate = null;
      setSnapshot(data);
    }

    const {
      target
    } = data;
    target.clear();
    data.lastContUpdate = at;
    changes.forEach(Set.prototype.add, target);
  }

}

exports.SetSnapshot = SetSnapshot;
(0, _serialization.regConstructor)(SetSnapshot);

function setSnapshot(data) {
  if (data.lastContUpdate === _core.journal.now) return data.target;
  (0, _core.captureSnapshot)(data);
  (0, _core.record)(new SetSnapshot(data));
  return data.target;
}

setProto.add = function (v) {
  Set.prototype.add.call(setSnapshot(this[_core.traceDataSymbol]), v);
  return this;
};

setProto.delete = function (v) {
  return Set.prototype.delete.call(setSnapshot(this[_core.traceDataSymbol]), v);
};

setProto.clear = function () {
  return Set.prototype.clear.call(setSnapshot(this[_core.traceDataSymbol]));
};

prototypeFwds(setMeta.proto);

if (_config.default.timeTravel) {
  Promise.prototype[_core.traceMetaSymbol] = _core.notTraceable;

  if (typeof MessageChannel !== "undefined") {
    MessageChannel.prototype[_core.traceMetaSymbol] = _core.notTraceable;
  }
}
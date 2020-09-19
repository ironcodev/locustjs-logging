"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DynamicLogger = exports.NullLogger = exports.DomLogger = exports.ConsoleLogger = exports.ArrayLogger = exports.ChainLogger = exports.LoggerBase = exports.Log = void 0;

var _locustjsBase = require("locustjs-base");

var _locustjsException = require("locustjs-exception");

function _readOnlyError(name) { throw new Error("\"" + name + "\" is read-only"); }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Log = function Log(category, data, host, exception) {
  _classCallCheck(this, Log);

  this.category = (0, _locustjsBase.isString)(category) ? category : '';
  this.data = data;
  this.host = (0, _locustjsBase.isString)(host) ? host : '';
  this.date = new Date();
  this.exception = (0, _locustjsBase.isEmpty)(exception) ? undefined : new _locustjsException.Exception(exception);
};

exports.Log = Log;

var LoggerBase = /*#__PURE__*/function () {
  function LoggerBase() {
    _classCallCheck(this, LoggerBase);

    (0, _locustjsException.throwIfInstantiateAbstract)(LoggerBase, this);
    this.category = '';
    this.host = '';
  }

  _createClass(LoggerBase, [{
    key: "_createLog",
    value: function _createLog() {
      var result;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var arg0 = args[0],
          arg1 = args[1],
          arg2 = args[2],
          arg3 = args[3];

      if ((0, _locustjsBase.isString)(arg0) && args.length == 1) {
        result = new Log(this.category, arg0);
      } else if (_instanceof(arg0, Log)) {
        result = arg0;
      } else if (_instanceof(arg0, _locustjsException.Exception)) {
        result = new Log(this.category, null, this.host, arg0);
      } else if (_instanceof(arg0, Error)) {
        result = new Log(this.category, null, this.host, new _locustjsException.Exception(arg0));
      } else {
        if ((0, _locustjsBase.isObject)(arg0)) {
          var propCount = Object.keys(arg0);
          var hasData = arg0.data != null;
          var hasCategory = arg0.category != null;
          var hasHost = arg0.host != null;
          var hasException = arg0.exception != null;
          var isLog = false;

          switch (propCount) {
            case 1:
              isLog = hasData;
              break;

            case 2:
              isLog = hasData && hasCategory || hasData && hasHost || hasData && hasException;
              break;

            case 3:
              isLog = hasData && hasCategory && hasHost || hasData && hasCategory && hasException || hasData && hasHost && hasException;
              break;

            case 4:
              isLog = hasData && hasCategory && hasHost && hasException;
              break;
          }

          if (isLog) {
            result = new Log(arg0.category, arg0.data, arg0.host, arg0.exception);
          } else {
            result = new Log(this.category, arg0, arg1, arg2);
          }
        } else {
          result = new Log(arg0 || this.category, arg1, arg2 || this.host, arg3);
        }
      }

      return result;
    }
  }, {
    key: "_logInternal",
    value: function _logInternal(type, log) {
      (0, _locustjsException.throwNotImplementedException)('_logInternal', this.host);
    }
  }, {
    key: "_log",
    value: function _log(type) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      var log = this._createLog.apply(this, args);

      this._logInternal(type, log);
    }
  }, {
    key: "log",
    value: function log() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      this._log.apply(this, ['log'].concat(args));
    }
  }, {
    key: "debug",
    value: function debug() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      this._log.apply(this, ['debug'].concat(args));
    }
  }, {
    key: "warn",
    value: function warn() {
      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      this._log.apply(this, ['warn'].concat(args));
    }
  }, {
    key: "danger",
    value: function danger() {
      for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }

      this._log.apply(this, ['danger'].concat(args));
    }
  }, {
    key: "info",
    value: function info() {
      for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }

      this._log.apply(this, ['info'].concat(args));
    }
  }, {
    key: "success",
    value: function success() {
      for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        args[_key8] = arguments[_key8];
      }

      this._log.apply(this, ['success'].concat(args));
    }
  }, {
    key: "fail",
    value: function fail() {
      for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
        args[_key9] = arguments[_key9];
      }

      this._log.apply(this, ['fail'].concat(args));
    }
  }, {
    key: "abort",
    value: function abort() {
      for (var _len10 = arguments.length, args = new Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
        args[_key10] = arguments[_key10];
      }

      this._log.apply(this, ['abort'].concat(args));
    }
  }, {
    key: "suggest",
    value: function suggest() {
      for (var _len11 = arguments.length, args = new Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
        args[_key11] = arguments[_key11];
      }

      this._log.apply(this, ['suggest'].concat(args));
    }
  }, {
    key: "trace",
    value: function trace() {
      for (var _len12 = arguments.length, args = new Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
        args[_key12] = arguments[_key12];
      }

      this._log.apply(this, ['trace'].concat(args));
    }
  }]);

  return LoggerBase;
}();

exports.LoggerBase = LoggerBase;

var ChainLogger = /*#__PURE__*/function (_LoggerBase) {
  _inherits(ChainLogger, _LoggerBase);

  var _super = _createSuper(ChainLogger);

  function ChainLogger(next) {
    var _this;

    _classCallCheck(this, ChainLogger);

    _this = _super.call(this);
    (0, _locustjsException.throwIfInstantiateAbstract)(ChainLogger, _assertThisInitialized(_this));
    (0, _locustjsException.throwIfNotInstanceOf)('next', LoggerBase, next, true);
    _this.next = next;
    return _this;
  }

  _createClass(ChainLogger, [{
    key: "canLog",
    value: function canLog(type) {
      return true;
    }
  }, {
    key: "_log",
    value: function _log(type) {
      for (var _len13 = arguments.length, args = new Array(_len13 > 1 ? _len13 - 1 : 0), _key13 = 1; _key13 < _len13; _key13++) {
        args[_key13 - 1] = arguments[_key13];
      }

      try {
        if (this.canLog(type)) {
          var log = this._createLog.apply(this, args);

          this._logInternal(type, log);
        } else {
          if (this.next) {
            var _this$next;

            (_this$next = this.next)[type].apply(_this$next, args);
          }
        }
      } catch (e) {
        if (this.next) {
          var _this$next2;

          this.next[type](e);

          (_this$next2 = this.next)[type].apply(_this$next2, args);
        }
      }
    }
  }, {
    key: "next",
    get: function get() {
      return this._next;
    },
    set: function set(value) {
      if (!(0, _locustjsBase.isEmpty)(value)) {
        (0, _locustjsException.throwIfNotInstanceOf)('value', LoggerBase, value);
        this._next = value;
      } else {
        this._next = null;
      }
    }
  }]);

  return ChainLogger;
}(LoggerBase);

exports.ChainLogger = ChainLogger;

var ArrayLogger = /*#__PURE__*/function (_ChainLogger) {
  _inherits(ArrayLogger, _ChainLogger);

  var _super2 = _createSuper(ArrayLogger);

  function ArrayLogger(next) {
    var _this2;

    _classCallCheck(this, ArrayLogger);

    _this2 = _super2.call(this, next);
    _this2._logs = [];
    return _this2;
  }

  _createClass(ArrayLogger, [{
    key: "_logInternal",
    value: function _logInternal(type, log) {
      this._logs.push(log);
    }
  }, {
    key: "clear",
    value: function clear() {
      this._logs = [];
    }
  }]);

  return ArrayLogger;
}(ChainLogger);

exports.ArrayLogger = ArrayLogger;

var ConsoleLogger = /*#__PURE__*/function (_ChainLogger2) {
  _inherits(ConsoleLogger, _ChainLogger2);

  var _super3 = _createSuper(ConsoleLogger);

  function ConsoleLogger(next) {
    _classCallCheck(this, ConsoleLogger);

    return _super3.call(this, next);
  }

  _createClass(ConsoleLogger, [{
    key: "_logInternal",
    value: function _logInternal(type, log) {
      switch (type) {
        case 'debug':
          console.debug(log);
          break;

        case 'danger':
          console.error(log);
          break;

        case 'trace':
          console.trace(log);
          break;

        case 'warn':
          console.warn(log);
          break;

        default:
          console.log(log);
          break;
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      console.clear();
    }
  }]);

  return ConsoleLogger;
}(ChainLogger);

exports.ConsoleLogger = ConsoleLogger;

var DomLogger = /*#__PURE__*/function (_ChainLogger3) {
  _inherits(DomLogger, _ChainLogger3);

  var _super4 = _createSuper(DomLogger);

  function DomLogger(target, next) {
    var _this3;

    _classCallCheck(this, DomLogger);

    _this3 = _super4.call(this, next);
    _this3.target = target;

    if ((0, _locustjsBase.isString)(_this3.target)) {
      _this3.target = _this3.target.trim();
    }

    _this3._init();

    return _this3;
  }

  _createClass(DomLogger, [{
    key: "formatData",
    value: function formatData(data) {
      return (0, _locustjsBase.isEmpty)(data) ? "" : JSON.stringify(data, null, 3).replace(/\n/g, "<br/>").replace(/\s/g, "&nbsp;");
    }
  }, {
    key: "formatException",
    value: function formatException(exception) {
      return (0, _locustjsBase.isEmpty)(exception) ? "" : JSON.stringify(exception, null, 3).replace(/\n/g, "<br/>").replace(/\s/g, "&nbsp;");
    }
  }, {
    key: "formatDate",
    value: function formatDate(date) {
      return date.getFullYear() + "/" + date.getMonth() + "/" + date.getDay() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "." + date.getMilliseconds();
    }
  }, {
    key: "_getTarget",
    value: function _getTarget() {
      var result;

      if ((0, _locustjsBase.isjQueryElement)(this.target)) {
        result = this.target[0];
      } else {
        if ((0, _locustjsBase.isSomeString)(this.target)) {
          if (this.target[0] == '#' || this.target[0] == '.' || this.target.indexOf(' ') > 0) {
            result = document.querySelector(this.target);
          } else {
            result = document.getElementById(this.target);
          }
        } else {
          result = (0, _locustjsBase.isObject)(this.target) ? this.target : null;
        }
      }

      return result;
    }
  }, {
    key: "_init",
    value: function _init() {
      var target = this._getTarget();

      if (target) {
        target.innerHTML = "\n              <table class=\"logs\">\n                  <thead>\n                      <tr>\n                          <th>Category</th>\n                          <th>Data</th>\n                          <th>Exception</th>\n                          <th>Host</th>\n                          <th>Date</th>\n                      </tr>\n                  </thead>\n                  <tbody>\n                  </tbody>\n              </table>";
      }
    }
  }, {
    key: "_logInternal",
    value: function _logInternal(type, log) {
      var target = this._getTarget();

      if (target && (0, _locustjsBase.isFunction)(target.querySelector)) {
        var body = target.querySelector('table.logs tbody');

        if (body) {
          var tr = document.createElement("TR");
          var tdCategory = document.createElement("TD");
          var tdData = document.createElement("TD");
          var tdHost = document.createElement("TD");
          var tdDate = document.createElement("TD");
          var tdException = document.createElement("TD");
          tdCategory.innerText = log.category;
          tdHost.innerText = log.host;
          tdData.innerHTML = this.formatData(log.data);
          tdDate.innerText = this.formatDate(log.date);
          tdException.innerHTML = this.formatException(log.exception);
          tr.setAttribute("class", type);
          tr.appendChild(tdCategory);
          tr.appendChild(tdData);
          tr.appendChild(tdException);
          tr.appendChild(tdHost);
          tr.appendChild(tdDate);
          body.appendChild(tr);
        }
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      this._init();
    }
  }]);

  return DomLogger;
}(ChainLogger);

exports.DomLogger = DomLogger;

var NullLogger = /*#__PURE__*/function (_LoggerBase2) {
  _inherits(NullLogger, _LoggerBase2);

  var _super5 = _createSuper(NullLogger);

  function NullLogger() {
    _classCallCheck(this, NullLogger);

    return _super5.apply(this, arguments);
  }

  _createClass(NullLogger, [{
    key: "_logInternal",
    value: function _logInternal(type, log) {}
  }, {
    key: "clear",
    value: function clear() {}
  }]);

  return NullLogger;
}(LoggerBase);

exports.NullLogger = NullLogger;

var DynamicLogger = /*#__PURE__*/function (_LoggerBase3) {
  _inherits(DynamicLogger, _LoggerBase3);

  var _super6 = _createSuper(DynamicLogger);

  function DynamicLogger(options) {
    var _this4;

    _classCallCheck(this, DynamicLogger);

    _this4 = _super6.call(this);
    _this4.options = Object.assign({
      DomTarget: '#logs',
      CustomLogger: null
    }, options);
    _this4._type = '';
    _this4._instance = null;
    return _this4;
  }

  _createClass(DynamicLogger, [{
    key: "_logInternal",
    value: function _logInternal(type, log) {
      if (this._instance) {
        this._instance._logInternal(type, log);
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      if (this._instance) {
        this._instance.clear();
      }
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    },
    set: function set(value) {
      if ((0, _locustjsBase.isString)(value)) {
        var ok = true;
        value = value.toLowerCase();

        switch (value) {
          case 'console':
            this._instance = new ConsoleLogger();
            break;

          case 'dom':
            this._instance = new DomLogger(this.options.DomTarget);
            break;

          case 'null':
            this._instance = null;

          case 'array':
            this._instance = new ArrayLogger();
            break;

          case 'custom':
            if ((0, _locustjsBase.isFunction)(this.options.CustomLogger)) {
              try {
                this._instance = this.options.CustomLogger();

                if (!_instanceof(this._instance, LoggerBase)) {
                  this._instance = null;
                  ok = (_readOnlyError("ok"), false);
                }
              } catch {
                this._instance = null;
                ok = (_readOnlyError("ok"), false);
              }
            } else {
              ok = (_readOnlyError("ok"), false);
            }

          default:
            ok = (_readOnlyError("ok"), false);
            throw 'invalid logger type.';
        }

        this._type = ok ? value : '';
      }
    }
  }]);

  return DynamicLogger;
}(LoggerBase);

exports.DynamicLogger = DynamicLogger;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NullLogger = exports.DomLogger = exports.ConsoleLogger = exports.ArrayLogger = exports.ChainLogger = exports.LoggerBase = void 0;

var _locustjsBase = require("locustjs-base");

var _locustjsException = require("locustjs-exception");

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

var Log = function Log(category, data, host, client, exception) {
  _classCallCheck(this, Log);

  this.category = (0, _locustjsBase.isString)(category) ? category : '';
  this.data = data;
  this.host = (0, _locustjsBase.isString)(host) ? host : '';
  this.date = new Date();
  this.client = (0, _locustjsBase.isString)(client) ? client : '';
  this.exception = (0, _locustjsBase.isEmpty)(exception) ? undefined : new _locustjsException.Exception(exception);
};

var LoggerBase = /*#__PURE__*/function () {
  function LoggerBase() {
    _classCallCheck(this, LoggerBase);

    (0, _locustjsException.throwIfInstantiateAbstract)(LoggerBase, this);
    this.category = '';
    this.host = '';
    this.client = '';
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
          arg3 = args[3],
          arg4 = args[4];

      if ((0, _locustjsBase.isString)(arg0) && args.length == 1) {
        result = new Log(this.category, arg0);
      } else if (_instanceof(arg0, Log)) {
        result = arg0;
      } else if (_instanceof(arg0, _locustjsException.Exception)) {
        result = new Log(this.category, null, this.host, this.client, arg0);
      } else if (_instanceof(arg0, Error)) {
        result = new Log(this.category, null, this.host, this.client, new _locustjsException.Exception(arg0));
      } else {
        if ((0, _locustjsBase.isObject)(arg0)) {
          var propCount = Object.keys(arg0);
          var hasData = arg0.data != null;
          var hasCategory = arg0.category != null;
          var hasHost = arg0.host != null;
          var hasClient = arg0.client != null;
          var hasException = arg0.exception != null;
          var isLog = false;

          switch (propCount) {
            case 1:
              isLog = hasData;
              break;

            case 2:
              isLog = hasData && hasCategory || hasData && hasHost || hasData && hasClient || hasData && hasException;
              break;

            case 3:
              isLog = hasData && hasCategory && hasHost || hasData && hasCategory && hasClient || hasData && hasCategory && hasException || hasData && hasHost && hasClient || hasData && hasHost && hasException || hasData && hasClient && hasException;
              break;

            case 4:
              isLog = hasData && hasCategory && hasHost && hasException || hasData && hasCategory && hasHost && hasClient || hasData && hasCategory && hasClient && hasException || hasData && hasHost && hasClient && hasException;
              break;

            case 5:
              isLog = hasData && hasCategory && hasHost && hasClient && hasException;
              break;
          }

          if (isLog) {
            result = new Log(arg0.category, arg0.data, arg0.host, arg0.client, arg0.exception);
          } else {
            result = new Log(this.category, arg0, arg1 || this.host, arg2 || this.client, arg3);
          }
        } else {
          result = new Log(arg0 || this.category, arg1, arg2 || this.host, arg3 || this.client, arg4);
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
    key: "_init",
    value: function _init() {
      if ((0, _locustjsBase.isSomeString)(this.target)) {
        var target = document.getElementById(this.target);

        if (target) {
          target.innerHTML = "\n\t\t\t\t<table class=\"logs\">\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td><b>client</b></td>\n\t\t\t\t\t\t<td><b>category</b></td>\n\t\t\t\t\t\t<td><b>data</b></td>\n\t\t\t\t\t\t<td><b>exception</b></td>\n\t\t\t\t\t\t<td><b>host</b></td>\n\t\t\t\t\t\t<td><b>date</b></td>\n\t\t\t\t\t</tr>\n\t\t\t\t</table>";
        }
      }
    }
  }, {
    key: "_logInternal",
    value: function _logInternal(type, log) {
      if ((0, _locustjsBase.isSomeString)(this.target)) {
        var target = document.getElementById(this.target);

        if (target) {
          var tr = document.createElement("TR");
          var tdClient = document.createElement("TD");
          var tdCategory = document.createElement("TD");
          var tdData = document.createElement("TD");
          var tdHost = document.createElement("TD");
          var tdDate = document.createElement("TD");
          var tdException = document.createElement("TD");
          tdClient.innerText = log.client;
          tdCategory.innerText = log.category;
          tdHost.innerText = log.host;
          tdData.innerHTML = this.formatData(log.data);
          tdDate.innerText = this.formatDate(log.date);
          tdException.innerHTML = this.formatException(log.exception);
          tr.setAttribute("class", type);
          tr.appendChild(tdClient);
          tr.appendChild(tdCategory);
          tr.appendChild(tdData);
          tr.appendChild(tdException);
          tr.appendChild(tdHost);
          tr.appendChild(tdDate);
          target.appendChild(tr);
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
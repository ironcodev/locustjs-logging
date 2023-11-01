import {
  isEmpty,
  isObject,
  isString,
  isSomeString,
  isFunction,
  isjQueryElement,
  isNull,
  isNumeric,
  isAnObject,
  isSomeArray,
  isNumber,
} from "locustjs-base";
import {
  LocalStorageJson,
  SessionStorageJson,
  StorageBase,
} from "locustjs-storage";
import {
  Exception,
  throwIfNotInstanceOf,
  throwIfInstantiateAbstract,
  throwNotImplementedException,
  throwNotSupportedException,
} from "locustjs-exception";
import Enum from "locustjs-enum";
import { htmlEncode } from "htmlencode";

const LogType = Enum.define(
  {
    info: 0,
    log: 1,
    debug: 2,
    trace: 3,
    warn: 4,
    danger: 5,
    success: 6,
    fail: 7,
    abort: 8,
    suggest: 9,
    cancel: 10,
  },
  "LogType"
);

const ConsoleColors = {
  BackColor: {
    Black: 40,
    Red: 41,
    Green: 42,
    Yellow: 43,
    Blue: 44,
    Magenta: 45,
    Cyan: 46,
    White: 47,
    Gray: 100,
    BrightRed: 101,
    BrightGreen: 102,
    BrightYellow: 103,
    BrightBlue: 104,
    BrightMagenta: 105,
    BrightCyan: 106,
    BrightWhite: 107,
  },
  ForeColor: {
    Black: 30,
    Red: 31,
    Green: 32,
    Yellow: 33,
    Blue: 34,
    Magenta: 35,
    Cyan: 36,
    White: 37,
    Gray: 90,
    BrightRed: 91,
    BrightGreen: 92,
    BrightYellow: 93,
    BrightBlue: 94,
    BrightMagenta: 95,
    BrightCyan: 96,
    BrightWhite: 97,
  },
  Modifier: {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",
  },
};

class InvalidLoggerTypeException extends Exception {}
class NoLoggerFactoryException extends Exception {}
class InvalidLoggerException extends Exception {}

class Log {
  constructor(type, host, scope, exception, ...data) {
    this.date = new Date();
    this.type = LogType.getString(type, LogType.log);
    this.scope = isString(scope) ? scope : undefined;
    this.data = data.length > 1 ? data : data.length > 0 ? data[0] : undefined;
    this.host = isString(host) ? host : undefined;
    this.exception = isEmpty(exception) ? undefined : new Exception(exception);
    this.batch = data.length > 1;
  }
}

function formatDate(d, type) {
  let result;

  if (type == "utc") {
    result =
      d.getUTCFullYear() +
      "/" +
      ("0" + d.getUTCDate()).slice(-2) +
      "/" +
      ("0" + (d.getUTCMonth() + 1)).slice(-2) +
      " " +
      ("0" + d.getUTCHours()).slice(-2) +
      ":" +
      ("0" + d.getUTCMinutes()).slice(-2) +
      ":" +
      ("0" + d.getUTCSeconds()).slice(-2) +
      "." +
      d.getUTCMilliseconds();
  } else {
    result =
      d.getFullYear() +
      "/" +
      ("0" + d.getDate()).slice(-2) +
      "/" +
      ("0" + (d.getMonth() + 1)).slice(-2) +
      " " +
      ("0" + d.getHours()).slice(-2) +
      ":" +
      ("0" + d.getMinutes()).slice(-2) +
      ":" +
      ("0" + d.getSeconds()).slice(-2) +
      "." +
      d.getMilliseconds();
  }

  return result;
}
function merge(obj, keyValueSeparator, itemSeparator) {
  return obj
    ? Object.keys(obj).reduce(
        (prev, curr) =>
          (prev ? prev + itemSeparator : "") +
          curr +
          keyValueSeparator +
          obj[curr],
        ""
      )
    : "";
}
function colorize(text, color, reset = true) {
  let result = "";

  if (color) {
    if (color.bc) {
      result += `\x1b[${color.bc}m`;
    }
    if (color.fc) {
      result += `\x1b[${color.fc}m`;
    }
    if (reset) {
      result += text + ConsoleColors.Modifier.Reset;
    }
  } else {
    result = text || "";
  }

  return result;
}

/*
options: {
  host: string, // host
}
*/
class LoggerBase {
  constructor(options) {
    throwIfInstantiateAbstract(LoggerBase, this);

    this.options = Object.assign({}, options);
    this._scopes = [];
    this.scope = '';
  }
  getScope() {
    return this.scope;
  }
  enterScope(value) {
    this._scopes.push(this.scope);
    this.scope = isFunction(value) ? value.name : isString(value) ? value: '';
  }
  exitScope() {
    this.scope = this._scopes.pop();
  }
  get host() {
    return this.options.host;
  }
  set host(value) {
    this.options.host = value;
  }
  /*
    overloads:
        _createLog(type, ...data)
        _createLog(type, Exception, ...data)  // locustjs Exception
        _createLog(type, Error, ...data)      // javascript error
    */
  _createLog(type, ...data) {
    let result;

    const arg0 = data.length > 0 ? data[0] : undefined;

    if (
      isAnObject(arg0) &&
      (arg0 instanceof Exception || arg0 instanceof Error)
    ) {
      result = new Log(
        type,
        this.options.host,
        this.scope,
        arg0,
        ...data.slice(1)
      );
    } else {
      result = new Log(type, this.options.host, this.scope, undefined, ...data);
    }

    return result;
  }
  _logInternal(log) {
    throwNotImplementedException("_logInternal", this.host);
  }
  clear() {
    throwNotImplementedException("clear", this.host);
  }
  getAll() {
    throwNotImplementedException("getAll", this.host);
  }
  /*
  // *********** UNDER DEVELOPMENT ***************
  // filters: fromIndex, toIndex, fromDate, toDate, types, host, categories
  // orderBy: 
  // orderDir
  // top
  // page: 
  // pageSize: 
  getRange(rangeOptions) {
    throwNotSpportedException("getRange", this.host);
  }
  // *********** UNDER DEVELOPMENT ***************
  */
  _log(type, ...args) {
    if (args && args.length) {
      const log = this._createLog(type, ...args);

      return this._logInternal(log);
    }
  }
  log(...args) {
    return this._log(LogType.log, ...args);
  }
  debug(...args) {
    return this._log(LogType.debug, ...args);
  }
  warn(...args) {
    return this._log(LogType.warn, ...args);
  }
  danger(...args) {
    return this._log(LogType.danger, ...args);
  }
  info(...args) {
    return this._log(LogType.info, ...args);
  }
  success(...args) {
    return this._log(LogType.success, ...args);
  }
  fail(...args) {
    return this._log(LogType.fail, ...args);
  }
  abort(...args) {
    return this._log(LogType.abort, ...args);
  }
  suggest(...args) {
    return this._log(LogType.suggest, ...args);
  }
  trace(...args) {
    return this._log(LogType.trace, ...args);
  }
  cancel(...args) {
    return this._log(LogType.cancel, ...args);
  }
}

/*
options: {
  next: LoggerBase, // next logger
  filter: array | string,  // list of log types to be logged; default = '*' i.e. all lgo types
  unattended: bool, // whether or not this logger acts in an unattended behavior,
                    // i.e. it actually logs, but pretends it does not, thus, logging is passed 
                    // to the next logger in the chain; default = undefiend = false
}
*/
class ChainLogger extends LoggerBase {
  constructor(options) {
    super(options);

    throwIfInstantiateAbstract(ChainLogger, this);

    if (isNull(this.options.next)) {
      this.options.next = new NullLogger();
    }

    throwIfNotInstanceOf(
      "options.next",
      LoggerBase,
      this.options.next,
      this.host
    );

    this.options.filter = "*";
    this.options.scopeFilter = "";
    this.options.unattended = false;
  }
  get next() {
    return this.options.next;
  }
  canLog(log) {
    let filter = isSomeArray(this.options.filter)
      ? this.options.filter
      : isSomeString(this.options.filter)
      ? this.options.filter.split(",")
      : ["*"];

    return (
      filter.findIndex((x) => {
        const type = isNumber(x)
          ? LogType.getString(x)
          : (x || "").toString().trim().toLowerCase();

        return type == "*" || type == "all" || type == log.type;
      }) >= 0 && (isEmpty(this.options.scopeFilter) || this.options.scopeFilter == log.scope)
    );
  }
  __logInternal(log) {
    throwNotImplementedException("__logInternal", this.host);
  }
  _logInternal(log) {
    let result = this.__logInternal(log);

    if (result === undefined) {
      result =
        this.options.unattended == false ||
        this.options.unattended == undefined;
    }

    return result;
  }
  _log(type, ...args) {
    try {
      if (args && args.length) {
        const log = this._createLog(type, ...args);
        let logged = false;

        if (this.canLog(log)) {
          logged = this._logInternal(log);
        }

        if (!(logged == null || logged == true)) {
          if (this.next instanceof LoggerBase) {
            this.next.log[type](...args);
          }
        }
      }
    } catch (e) {
      if (this.next && this.next instanceof LoggerBase) {
        const method = LogType.getString(type);

        this.next[method](e);
        this.next[method](...args);
      } else {
        throw e;
      }
    }
  }
  _clearInternal() { }
  clear() {
    this._clearInternal();

    current = this.options.next;
    
    while (current) {
      current.clear();

      current = current.next;
    }
  }
}

class ArrayLogger extends ChainLogger {
  constructor(options) {
    super(options);

    this._logs = [];
  }
  __logInternal(log) {
    this._logs.push(log);
  }
  getAll() {
    return this._logs;
  }
  _clearInternal() {
    this._logs = [];
  }
}

/*
  options: {
    styles: object,  // color customization object
    dateType: 'utc' | 'current' (default)
    env: 'node' | 'web' (default)
  }
*/
class ConsoleLogger extends ChainLogger {
  constructor(options) {
    super(options);

    if (!isObject(this.options.styles)) {
      this.options.styles = {};
    }

    if (this.options.env == "node") {
      this._initNodeColoring();
    } else {
      this._initWebColoring();
    }
  }
  _initNodeColoring() {
    const scope = {
      fc: ConsoleColors.ForeColor.Blue,
      bc: ConsoleColors.BackColor.Black,
    };
    const host = {
      fc: ConsoleColors.ForeColor.Black,
      bc: ConsoleColors.BackColor.BrightCyan,
    };
    const date = {
      fc: ConsoleColors.ForeColor.BrightYellow,
      bc: ConsoleColors.BackColor.Black,
    };

    this._initStyle(
      "log",
      this._labelNode(ConsoleColors.ForeColor.White),
      date,
      scope,
      host
    );
    this._initStyle(
      "info",
      this._labelNode(ConsoleColors.ForeColor.BrightBlue),
      date,
      scope,
      host
    );
    this._initStyle(
      "debug",
      this._labelNode(ConsoleColors.ForeColor.Magenta),
      date,
      scope,
      host
    );
    this._initStyle(
      "trace",
      this._labelNode(
        ConsoleColors.ForeColor.Black,
        ConsoleColors.BackColor.Cyan
      ),
      date,
      scope,
      host
    );
    this._initStyle(
      "warn",
      this._labelNode(
        ConsoleColors.ForeColor.White,
        ConsoleColors.BackColor.Magenta
      ),
      date,
      scope,
      host
    );
    this._initStyle(
      "danger",
      this._labelNode(ConsoleColors.ForeColor.BrightRed),
      date,
      scope,
      host
    );
    this._initStyle(
      "success",
      this._labelNode(ConsoleColors.ForeColor.Green),
      date,
      scope,
      host
    );
    this._initStyle(
      "fail",
      this._labelNode(ConsoleColors.ForeColor.Red),
      date,
      scope,
      host
    );
    this._initStyle(
      "abort",
      this._labelNode(
        ConsoleColors.ForeColor.Black,
        ConsoleColors.BackColor.White
      ),
      date,
      scope,
      host
    );
    this._initStyle(
      "suggest",
      this._labelNode(ConsoleColors.ForeColor.BrightMagenta),
      date,
      scope,
      host
    );
    this._initStyle(
      "cancel",
      this._labelNode(ConsoleColors.ForeColor.Yellow),
      date,
      scope,
      host
    );
  }
  _initWebColoring() {
    const scope = {
      color: "darkblue",
      "font-weight": "bold",
    };
    const host = {
      color: "black",
      "background-color": "lightcyan",
    };
    const date = {
      color: "blue",
    };

    this._initStyle("info", this._labelWeb("blue"), date, scope, host);
    this._initStyle("debug", this._labelWeb("darkmagenta"), date, scope, host);
    this._initStyle(
      "trace",
      this._labelWeb("cyan", "black"),
      date,
      scope,
      host
    );
    this._initStyle(
      "warn",
      this._labelWeb("magenta"),
      date,
      scope,
      host
    );
    this._initStyle("danger", this._labelWeb("red"), date, scope, host);
    this._initStyle("success", this._labelWeb("green"), date, scope, host);
    this._initStyle("fail", this._labelWeb("darkred"), date, scope, host);
    this._initStyle("abort", this._labelWeb("black"), date, scope, host);
    this._initStyle("suggest", this._labelWeb("purple"), date, scope, host);
    this._initStyle("cancel", this._labelWeb("darkorange"), date, scope, host);
  }
  _labelWeb(bg, fc = "white") {
    return { color: fc, "background-color": bg };
  }
  _labelNode(fc, bc = ConsoleColors.BackColor.Black) {
    return { fc, bc };
  }
  _initStyle(type, label, date, scope, host) {
    if (!isObject(this.options.styles[type])) {
      this.options.styles[type] = {};
    }
    if (!isObject(this.options.styles[type].label)) {
      this.options.styles[type].label = {};
    }
    if (!isObject(this.options.styles[type].date)) {
      this.options.styles[type].date = {};
    }
    if (!isObject(this.options.styles[type].scope)) {
      this.options.styles[type].scope = {};
    }
    if (!isObject(this.options.styles[type].host)) {
      this.options.styles[type].host = {};
    }

    this._assignStyle(this.options.styles[type].label, label);
    this._assignStyle(this.options.styles[type].scope, scope);
    this._assignStyle(this.options.styles[type].host, host);
    this._assignStyle(this.options.styles[type].date, date);
  }
  _assignStyle(obj, style) {
    Object.keys(style).forEach((key) => {
      if (!isString(obj[key])) {
        obj[key] = style[key];
      }
    });
  }
  __logInternal(log) {
    if (this.options.env == "node") {
      this._logNode(log);
    } else {
      this._logWeb(log);
    }
  }
  _logNode(log) {
    const style = this.options.styles[log.type] || {};
    
    let prefix = `${colorize(
      formatDate(log.date, this.options.dateType),
      style.date
    )} ${colorize(` ${log.type.toUpperCase()} `, style.label)}`;

    if (isSomeString(log.host)) {
      prefix += ` ${colorize(` ${log.host} `, style.host)} `;
    }
    if (isSomeString(log.scope)) {
      prefix += ` ${colorize(log.scope, style.scope)} `;
    }

    const args = [prefix];

    if (log.batch) {
      args.splice(args.length, 0, ...log.data);
    } else {
      args.push(log.data);
    }
    if (log.exception) {
      args.push(log.exception);
    }

    const type = LogType.getNumber(log.type);
    let method = "";

    switch (type) {
      case LogType.debug:
        method = "debug";
        break;
      case LogType.danger:
        method = "error";
        break;
      case LogType.trace:
        method = "trace";
        break;
      case LogType.warn:
        method = "warn";
        break;
      case LogType.info:
        method = "info";
        break;
      default:
        method = "log";
        break;
    }

    console[method](...args);
  }
  _logWeb(log) {
    let prefix = `%c${formatDate(log.date, this.options.dateType)} %c ${log.type.toUpperCase()} `;
    const style = this.options.styles[log.type] || {};
    const colors = [merge(style.date, ":", ";"), merge(style.label, ":", ";")];

    if (isSomeString(log.host)) {
      prefix += `%c ${log.host} `;
      colors.push(merge(style.host, ":", ";"));
    }
    if (isSomeString(log.scope)) {
      prefix += `%c ${log.scope} `;
      colors.push(merge(style.scope, ":", ";"));
    }

    const args = [prefix, ...colors];

    if (log.batch) {
      args.splice(args.length, 0, ...log.data);
    } else {
      args.push(log.data);
    }
    if (log.exception) {
      args.push(log.exception);
    }

    const type = LogType.getNumber(log.type);
    let method = "";

    switch (type) {
      case LogType.debug:
        method = "debug";
        break;
      case LogType.danger:
        method = "error";
        break;
      case LogType.trace:
        method = "trace";
        break;
      case LogType.warn:
        method = "warn";
        break;
      case LogType.info:
        method = "info";
        break;
      default:
        method = "log";
        break;
    }

    console[method](...args);
  }
  getAll() {
    throwNotSupportedException("getAll", this.host);
  }
  _clearInternal() {
    console.clear();
  }
}

/*
  options: {
    storeKey: string // storage item key where logs will be stored at. default = 'logs'
    store: 
    bufferSize: number // number of logs to be buffered before flushing into store. default = 5
  }
*/
class StorageLogger extends ArrayLogger {
  constructor(options) {
    super(options);

    throwIfInstantiateAbstract(StorageLogger, this);

    if (!isSomeString(this.options.storeKey)) {
      this.options.storeKey = "logs";
    }
    if (isEmpty(this.options.store)) {
      throwIfNotInstanceOf(
        "options.store",
        StorageBase,
        this.options.store,
        this.host
      );
    }
    if (!isNumeric(this.options.bufferSize)) {
      this.options.bufferSize = 5;
    }

    this._new_log_count = 0;
  }
  __logInternal(log) {
    super.__logInternal(log);
    
    if (this.options.bufferSize > 0) {
      this._new_log_count++;

      if (this._new_log_count >= this.options.bufferSize) {
        this.options.store.setItem(this.options.storeKey, this.getAll());

        this._new_log_count = 0;
      }
    } else {
      this.options.store.setItem(this.options.storeKey, this.getAll());
    }
  }
  _clearInternal() {
    super._clearInternal();

    this._new_log_count = 0;
    this.options.store.setItem(this.options.storeKey, []);
  }
}

class LocalStorageLogger extends StorageLogger {
  constructor(options) {
    super(Object.assign(options, { store: new LocalStorageJson() }));
  }
}
class SessionStorageLogger extends StorageLogger {
  constructor(options) {
    super(Object.assign(options, { store: new SessionStorageJson() }));
  }
}

/*
  options: {
    target: string (css selector) | object // a DOM node or css selector of a DOM node where logs should be appended to.
                                           // default = #dom-logger
    onInit: func // custom log table creator
    onNewLog: func // custom log table record
    className: string // css className of target node. default = dom-logger
    format: func // custom format
  }
*/
class DOMLogger extends ChainLogger {
  constructor(options) {
    super(options);

    this.target = this.options.target || "#dom-logger";
    this._init();
  }
  get target() {
    return this._target;
  }
  set target(value) {
    if (isjQueryElement(value)) {
      this._target = value.length ? value[0] : null;
    } else if (isString(value)) {
      this._target = document.querySelector(value);
    } else {
      this._target =
        isObject(value) && isFunction(value.querySelector) ? value : null;
    }
  }
  _init(recreate = false) {
    this._count = 0;

    if (this.target && (this.target.querySelectorAll('tbody tr').length == 0 || recreate)) {
      if (isFunction(this.options.onInit)) {
        const result = this.options.onInit(this);

        if (isSomeString(result)) {
          this.target.innerHTML = result;
        } else if (isObject(result) && isFunction(result.querySelector)) {
          this.target.appendChild(result);
        }
      } else {
        const className = this.options.className || "dom-logger";

        this.target.innerHTML = `
          <table class="${className}">
              <thead>
                  <tr>
                    <th>Row</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Scope/Host</th>
                    <th>Data/Exception</th>
                  </tr>
              </thead>
              <tbody>
              </tbody>
          </table>`;
      }

      if (isFunction(this.options.onRowClick)) {
        document
          .querySelectorAll(`${className} table tbody tr`)
          .forEach((tr) => {
            tr.onclick = this.options.onRowClick;
          });
      }
    }
  }
  __logInternal(log) {
    if (this.target) {
      let tr;

      if (isFunction(this.options.onNewLog)) {
        tr = this.options.onNewLog(this, log, this._count);
      } else {
        const body = this.target.querySelector("tbody");

        if (body) {
          tr = document.createElement("TR");

          tr.setAttribute('class', log.type);

          const tdRow = document.createElement("TD");
          const tdType = document.createElement("TD");
          const tdDate = document.createElement("TD");
          const tdScopeHost = document.createElement("TD");
          const tdDataException = document.createElement("TD");

          tdRow.innerHTML = `<div>${this._count + 1}</div>`;
          tdType.innerHTML = `<div>${log.type}</div>`;
          tdDate.innerHTML = `<div>${formatDate(log.date)}</div>`;
          tdScopeHost.innerHTML = `${
            log.scope ? `<span class="scope">${log.scope}</span>` : ""
          }${log.host ? `<span class="host">${log.host}</span>` : ""}`;

          let data;
          let exception;

          try {
            if (isFunction(this.options.format)) {
              data = this.options.format(this, log, 'data');
              exception = this.options.format(this, log, 'exception');
            } else {
              data = log.data ? JSON.stringify(log.data, null, 2): '';
              exception = log.exception ? JSON.stringify(log.exception, null, 2): '';
            }
          } catch (err) {
            this.danger(err);
          }

          const dataHtml = htmlEncode(data);
          const exceptionHtml = htmlEncode(exception);

          tdDataException.innerHTML = `${
            data ? `<div class="data" title="${dataHtml.replace(/"/g, '&quot;')}">${dataHtml}</div>` : ""
          }${
            exception ? `<div class="exception" title="${exceptionHtml.replace(/"/g, '&quot;')}">${exceptionHtml}</div>` : ""
          }`;

          tr.appendChild(tdRow);
          tr.appendChild(tdType);
          tr.appendChild(tdDate);
          tr.appendChild(tdScopeHost);
          tr.appendChild(tdDataException);
        }

        if (isObject(tr) && isFunction(tr.querySelector)) {
          body.appendChild(tr);
        }
      }

      this._count++;
    }
  }
  _clearInternal() {
    this._init(true);
  }
}

class NullLogger extends LoggerBase {
  _logInternal() {}
  clear() {}
  getAll() {
    return [];
  }
}

/*
  options: {
    dom: object // custom options for DOMLogger
    store: object // custom options for store logger types
    console: object // custom options for console logger
    factory: func // custom factory for creating loggers
    next: LoggerBase // default next logger
  }
*/
class DynamicLogger extends LoggerBase {
  constructor(options) {
    super(
      Object.assign(
        {
          dom: {},
          store: {},
          array: {},
          factory: null,
          console: {},
        },
        options
      )
    );

    this.type = "null";
  }
  getScope() {
    return this._instance.getScope();
  }
  enterScope(value) {
    this._instance.enterScope(value);
  }
  exitScope() {
    this._instance.exitScope();
  }
  _createLogger(factory, type, fallback) {
    let result;

    try {
      if (isFunction(factory)) {
        result = factory(this, type);
      }

      if (result == null) {
        if (isFunction(fallback)) {
          result = fallback();
        } else {
          throw new NoLoggerFactoryException();
        }
      }

      if (result == null) {
        throw new InvalidLoggerTypeException();
      } else {
        if (!(result instanceof LoggerBase)) {
          throw new InvalidLoggerException();
        }
      }
    } catch (e) {
      this.enterScope("DynamicLogger._createLogger");
      this.danger(e);
      this.exitScope();
    }

    return result;
  }
  get type() {
    return this._type;
  }
  set type(value) {
    let logger;
    let fallback;

    value = (value || "").toString().trim().toLowerCase();

    switch (value) {
      case "console":
        fallback = () =>
          new ConsoleLogger({
            host: this.options.host,
            next: this.options.next,
            ...this.options.console,
          });

        break;
      case "dom":
        fallback = () =>
          new DOMLogger({
            host: this.options.host,
            next: this.options.next,
            ...this.options.dom,
          });

        break;
      case "":
      case "null":
        fallback = () => new NullLogger();

        break;
      case "array":
        fallback = () => new ArrayLogger({
          host: this.options.host,
          next: this.options.next,
          ...this.options.array,
        });

        break;
      case "localstorage":
        fallback = () =>
          new LocalStorageLogger({
            host: this.options.host,
            next: this.options.next,
            ...this.options.store,
          });

        break;
      case "sessionstorage":
        fallback = () =>
          new SessionStorageLogger({
            host: this.options.host,
            next: this.options.next,
            ...this.options.store,
          });

        break;
      default:
        fallback = () => null;
        break;
    }

    logger = this._createLogger(this.options.factory, value, fallback);

    if (logger) {
      this._instance = logger;
      this._type = value;
    }
  }
  _log(type, ...args) {
    const _type = LogType.getString(type);

    if (isFunction(this._instance[_type])) {
      this._instance[_type](...args);
    }
  }
  clear() {
    this._instance.clear();
  }
  getAll() {
    return this._instance.getAll();
  }
}

export {
  Log,
  LogType,
  ConsoleColors,
  formatDate,
  merge,
  colorize,
  
  LoggerBase,
  ChainLogger,
  ArrayLogger,
  ConsoleLogger,
  DOMLogger,
  NullLogger,
  StorageLogger,
  LocalStorageLogger,
  SessionStorageLogger,
  DynamicLogger,

  NoLoggerFactoryException,
  InvalidLoggerTypeException,
  InvalidLoggerException,
};

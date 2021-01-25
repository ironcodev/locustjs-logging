import { isEmpty, isObject, isString, isSomeString, isFunction, isjQueryElement, isNull, isSomeObject, isNumeric } from 'locustjs-base';
import { InMemoryStorage } from 'locustjs-storage';
import {
    Exception,
    throwIfNotInstanceOf,
    throwIfInstantiateAbstract,
    throwNotImplementedException
} from 'locustjs-exception';

class InvalidLoggerTypeException extends Exception { }
class NoLoggerFactoryException extends Exception { }
class InvalidLoggerException extends Exception { }
class Log {
    constructor(type, category, data, host, exception) {
        this.type = isString(type) ? type : 'info';
        this.category = isString(category) ? category : '';
        this.data = data;
        this.host = isString(host) ? host : '';
        this.date = new Date();
        this.exception = isEmpty(exception) ? undefined : new Exception(exception);
    }
}

class LoggerBase {
    constructor() {
        throwIfInstantiateAbstract(LoggerBase, this);

        this.category = '';
        this.host = '';
    }
    _createLog(type, ...args) {
        let result;

        const [arg0, arg1, arg2, arg3] = args;

        if (isString(arg0) && args.length == 1) {
            result = new Log(type, this.category, arg0);
        } else if (arg0 instanceof Log) {
            result = arg0;
        } else if (arg0 instanceof Exception) {
            result = new Log(type, this.category, null, this.host, arg0);
        } else if (arg0 instanceof Error) {
            result = new Log(type, this.category, null, this.host, new Exception(arg0));
        } else {
            if (isObject(arg0)) {
                const propCount = Object.keys(arg0);
                const hasData = arg0.data != null;
                const hasCategory = arg0.category != null;
                const hasHost = arg0.host != null;
                const hasException = arg0.exception != null;

                let isLog = false;

                switch (propCount) {
                    case 1:
                        isLog = hasData;
                        break;
                    case 2:
                        isLog = (hasData && hasCategory) ||
                            (hasData && hasHost) ||
                            (hasData && hasException);
                        break;
                    case 3:
                        isLog = (hasData && hasCategory && hasHost) ||
                            (hasData && hasCategory && hasException) ||
                            (hasData && hasHost && hasException);
                        break;
                    case 4:
                        isLog = (hasData && hasCategory && hasHost && hasException);
                        break;
                }

                if (isLog) {
                    result = new Log(type, arg0.category, arg0.data, arg0.host, arg0.exception);
                } else {
                    result = new Log(type, this.category, arg0, arg1, arg2);
                }
            } else {
                result = new Log(type, (arg0 || this.category), arg1, (arg2 || this.host), arg3);
            }
        }

        return result;
    }
    _logInternal(log) {
        throwNotImplementedException('_logInternal', this.host);
    }
    _log(type, ...args) {
        const log = this._createLog(type, ...args);

        this._logInternal(log);
    }
    log(...args) {
        this._log('log', ...args);
    }
    debug(...args) {
        this._log('debug', ...args);
    }
    warn(...args) {
        this._log('warn', ...args);
    }
    danger(...args) {
        this._log('danger', ...args);
    }
    info(...args) {
        this._log('info', ...args);
    }
    success(...args) {
        this._log('success', ...args);
    }
    fail(...args) {
        this._log('fail', ...args);
    }
    abort(...args) {
        this._log('abort', ...args);
    }
    suggest(...args) {
        this._log('suggest', ...args);
    }
    trace(...args) {
        this._log('trace', ...args);
    }
}

class ChainLogger extends LoggerBase {
    constructor(next) {
        super();

        throwIfInstantiateAbstract(ChainLogger, this);

        if (isNull(next)) {
            next = new NullLogger();
        }

        throwIfNotInstanceOf('next', LoggerBase, next, true);

        this.next = next;
    }
    get next() {
        return this._next;
    }
    set next(value) {
        if (isNull(value)) {
            value = new NullLogger();
        }

        throwIfNotInstanceOf('value', LoggerBase, value);

        this._next = value;
    }
    canLog(type) {
        return true;
    }
    _log(type, ...args) {
        try {
            if (this.canLog(type)) {
                const log = this._createLog(type, ...args);

                this._logInternal(log);
            } else {
                if (this.next) {
                    this.next[type](...args);
                }
            }
        } catch (e) {
            if (this.next) {
                this.next[type](e);
                this.next[type](...args);
            }
        }
    }
}

class ArrayLogger extends ChainLogger {
    constructor(next) {
        super(next);

        this._logs = [];
    }
    _logInternal(log) {
        this._logs.push(log);
    }
    clear() {
        this._logs = [];
    }
}

class ConsoleLogger extends ChainLogger {
    constructor(next) {
        super(next);
    }
    _logInternal(log) {
        switch (log.type) {
            case 'debug': console.debug(log); break;
            case 'danger': console.error(log); break;
            case 'trace': console.trace(log); break;
            case 'warn': console.warn(log); break;
            default: console.log(log); break;
        }
    }
    clear() {
        console.clear();
    }
}

class StorageLogger extends ChainLogger {
    constructor(options, next) {
        super(next);

        this.options = Object.assign({ }, options);

        if (!isSomeString(this.options.storeKey)) {
            this.options.storeKey = 'logs';
        }
        if (!isSomeObject(this.options.store)) {
            this.options.store = new InMemoryStorage();
        }
        if (!isNumeric(this.options.throttleLevel)) {
            this.options.throttleLevel = 5;
        }

        this._logs = [];
        this._new_log_count = 0;
    }
    _logInternal(log) {
        this._logs.push(log);

        this._new_log_count++;

        if (this._new_log_count >= this.options.throttleLevel) {
            this.flush();
        }
    }
    flush() {
        const oldLogs = this.options.store.getItem(this.options.storeKey);
        const newLogs = [...oldLogs, ...this._logs];
        this.options.store.setItem(this.options.storeKey, newLogs);
        this._logs = [];
        this._new_log_count = 0;
    }
    clear() {
        this._logs = [];
        this._new_log_count = 0;
        this.options.store.clear();
    }
}
class DomLogger extends ChainLogger {
    constructor(target, next) {
        super(next);

        this.target = target;

        if (isString(this.target)) {
            this.target = this.target.trim();
        }

        this._init();
    }
    formatData(data) {
        return isEmpty(data) ? "" : JSON.stringify(data, null, 3)
            .replace(/\n/g, "<br/>")
            .replace(/\s/g, "&nbsp;");
    }
    formatException(exception) {
        return isEmpty(exception) ? "" : JSON.stringify(exception, null, 3)
            .replace(/\n/g, "<br/>")
            .replace(/\s/g, "&nbsp;");
    }
    formatDate(date) {
        return (
            date.getFullYear() +
            "/" +
            date.getMonth() +
            "/" +
            date.getDay() +
            " " +
            date.getHours() +
            ":" +
            date.getMinutes() +
            ":" +
            date.getSeconds() +
            "." +
            date.getMilliseconds()
        );
    }
    _getTarget() {
        let result;

        if (isjQueryElement(this.target)) {
            result = this.target[0];
        } else {
            if (isSomeString(this.target)) {
                if (this.target[0] == '#' || this.target[0] == '.' || this.target.indexOf(' ') > 0) {
                    result = document.querySelector(this.target);
                } else {
                    result = document.getElementById(this.target);
                }
            } else {
                result = isObject(this.target) ? this.target : null;
            }
        }

        return result;
    }
    _init() {
        const target = this._getTarget();

        if (target) {
            target.innerHTML = `
              <table class="logs">
                  <thead>
                      <tr>
                          <th>Category</th>
                          <th>Data</th>
                          <th>Exception</th>
                          <th>Host</th>
                          <th>Date</th>
                      </tr>
                  </thead>
                  <tbody>
                  </tbody>
              </table>`;
        }
    }
    _logInternal(log) {
        const target = this._getTarget();

        if (target && isFunction(target.querySelector)) {
            const body = target.querySelector('table.logs tbody');

            if (body) {
                const tr = document.createElement("TR");
                const tdCategory = document.createElement("TD");
                const tdData = document.createElement("TD");
                const tdHost = document.createElement("TD");
                const tdDate = document.createElement("TD");
                const tdException = document.createElement("TD");

                tdCategory.innerText = log.category;
                tdHost.innerText = log.host;
                tdData.innerHTML = this.formatData(log.data);
                tdDate.innerText = this.formatDate(log.date);
                tdException.innerHTML = this.formatException(log.exception);

                tr.setAttribute("class", log.type);

                tr.appendChild(tdCategory);
                tr.appendChild(tdData);
                tr.appendChild(tdException);
                tr.appendChild(tdHost);
                tr.appendChild(tdDate);

                body.appendChild(tr);
            }
        }
    }
    clear() {
        this._init();
    }
}

class NullLogger extends LoggerBase {
    _logInternal(log) { }
    clear() { }
}

class DynamicLogger extends LoggerBase {
    constructor(options) {
        super();

        this.options = Object.assign({
            DomTarget: '#logs',
            loggerFactory: null,
            localStorage: window && window.localStorage,
            loggerTypeKey: 'logger-type'
        }, options);

        this._type = 'null';
        this._instance = null;
        this._initLogger();
    }
    _initLogger() {
        if (this.options && this.options.store && isFunction(this.options.store.getItem)) {
            const loggerType = this.options.store.getItem(this.options.loggerTypeKey);

            if (loggerType) {
                try {
                    this.type = loggerType;
                } catch { }
            }
        }
    }
    _createLogger(factory, type, fallback) {
        let result;

        try {
            if (isFunction(factory)) {
                result = factory(type);
            }

            if (result == null) {
                if (isFunction(fallback)) {
                    result = fallback(type);
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
            this.danger(new Log('danger', 'DynamicLogger._createLogger', type, this.options.host, e));
        }

        return result;
    }
    get type() {
        return this._type;
    }
    set type(value) {
        let logger;

        switch (value) {
            case 'console':
                logger = this._createLogger(this.options.loggerFactory, value, () => new ConsoleLogger());

                break;
            case 'dom':
                logger = this._createLogger(this.options.loggerFactory, value, () => DomLogger(this.options.DomTarget));

                break;
            case 'null':
                logger = this._createLogger(this.options.loggerFactory, value, () => new NullLogger());
            case 'array':
                logger = this._createLogger(this.options.loggerFactory, value, () => new ArrayLogger());

                break;
            default:
                logger = this._createLogger(this.options.loggerFactory, value);

                break;
        }

        if (logger) {
            this._instance = logger instanceof NullLogger ? null : logger;
            this._type = value;
        }

        if (this.options && this.options.store && this.options.loggerTypeKey && isFunction(this.options.store.setItem)) {
            this.options.store.setItem(this.options.loggerTypeKey, value);
        }
    }
    _logInternal(log) {
        if (this._instance) {
            this._instance._logInternal(log);
        }
    }
    clear() {
        if (this._instance) {
            this._instance.clear();
        }
    }
}

export {
    Log,
    LoggerBase,
    ChainLogger,
    ArrayLogger,
    ConsoleLogger,
    DomLogger,
    NullLogger,
    StorageLogger,
    DynamicLogger,
    NoLoggerFactoryException,
    InvalidLoggerTypeException,
    InvalidLoggerException
}
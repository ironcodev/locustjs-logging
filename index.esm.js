import { isEmpty, isObject, isString, isSomeString } from 'locustjs-base';
import {
	Exception,
	throwIfNotInstanceOf,
	throwIfInstantiateAbstract,
	throwNotImplementedException
} from 'locustjs-exception';

class Log {
    constructor(category, data, host, client, exception) {
        this.category = isString(category) ? category: '';
        this.data = data;
        this.host = isString(host) ? host: '';
        this.date = new Date();
        this.client = isString(client) ? client : '';
        this.exception = isEmpty(exception) ? undefined : new Exception(exception);
    }
}

class LoggerBase {
    constructor() {
        throwIfInstantiateAbstract(LoggerBase, this);

        this.category = '';
        this.host = '';
        this.client = '';
    }
    _createLog(...args) {
        let result;

        const [arg0, arg1, arg2, arg3, arg4] = args;

        if (isString(arg0) && args.length == 1) {
            result = new Log(this.category, arg0);
        } else if (arg0 instanceof Log) {
            result = arg0;
        } else if (arg0 instanceof Exception) {
            result = new Log(this.category, null, this.host, this.client, arg0);
        } else if (arg0 instanceof Error) {
            result = new Log(this.category, null, this.host, this.client, new Exception(arg0));
        } else {
            if (isObject(arg0)) {
                const propCount = Object.keys(arg0);
                const hasData = arg0.data != null;
                const hasCategory = arg0.category != null;
                const hasHost = arg0.host != null;
                const hasClient = arg0.client != null;
                const hasException = arg0.exception != null;

                let isLog = false;

                switch (propCount) {
                    case 1:
                        isLog = hasData;
                        break;
                    case 2:
                        isLog = (hasData && hasCategory) ||
                                (hasData && hasHost) ||
                                (hasData && hasClient) ||
                                (hasData && hasException);
                        break;
                    case 3:
                        isLog = (hasData && hasCategory && hasHost) ||
                                (hasData && hasCategory && hasClient) ||
                                (hasData && hasCategory && hasException) ||
                                (hasData && hasHost && hasClient) ||
                                (hasData && hasHost && hasException) ||
                                (hasData && hasClient && hasException);
                        break;
                    case 4:
                        isLog = (hasData && hasCategory && hasHost && hasException) ||
                                (hasData && hasCategory && hasHost && hasClient) ||
                                (hasData && hasCategory && hasClient && hasException) ||
                                (hasData && hasHost && hasClient && hasException);
                        break;
                    case 5:
                        isLog = (hasData && hasCategory && hasHost && hasClient && hasException);
                        break;
                }

                if (isLog) {
                    result = new Log(arg0.category, arg0.data, arg0.host, arg0.client, arg0.exception);
                } else {
                    result = new Log(this.category, arg0, (arg1 || this.host), (arg2 || this.client), arg3);
                }
            } else {
                result = new Log((arg0 || this.category), arg1, (arg2 || this.host), (arg3 || this.client), arg4);
            }
        }

        return result;
    }
    _logInternal(type, log) {
        throwNotImplementedException('_logInternal', this.host);
    }
    _log(type, ...args) {
        const log = this._createLog(...args);

        this._logInternal(type, log);
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
        throwIfNotInstanceOf('next', LoggerBase, next, true);

        this.next = next;
    }
    get next() {
        return this._next;
    }
    set next(value) {
        if (!isEmpty(value)) {
            throwIfNotInstanceOf('value', LoggerBase, value);

            this._next = value;
        } else {
            this._next = null;
        }
    }
    canLog(type) {
        return true;
    }
    _log(type, ...args) {
        try {
            if (this.canLog(type)) {
                const log = this._createLog(...args);

                this._logInternal(type, log);
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
    _logInternal(type, log) {
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
    _logInternal(type, log) {
        switch (type) {
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

class DomLogger extends ChainLogger {
  constructor(target, next) {
    super(next);

    this.target = target;
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
  _init() {
	  if (isSomeString(this.target)) {
		const target = document.getElementById(this.target);

		if (target) {
		  target.innerHTML = `
				<table class="logs">
					<tr>
						<td><b>client</b></td>
						<td><b>category</b></td>
						<td><b>data</b></td>
						<td><b>exception</b></td>
						<td><b>host</b></td>
						<td><b>date</b></td>
					</tr>
				</table>`;
		}
	  }
  }
  _logInternal(type, log) {
	  if (isSomeString(this.target)) {
		const target = document.getElementById(this.target);

		if (target) {
		  const tr = document.createElement("TR");
		  const tdClient = document.createElement("TD");
		  const tdCategory = document.createElement("TD");
		  const tdData = document.createElement("TD");
		  const tdHost = document.createElement("TD");
		  const tdDate = document.createElement("TD");
		  const tdException = document.createElement("TD");

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
  clear() {
    this._init();
  }
}

class NullLogger extends LoggerBase {
    _logInternal(type, log) { }
    clear() { }
}

export {
	Log,
	LoggerBase,
	ChainLogger,
	ArrayLogger,
	ConsoleLogger,
	DomLogger,
	NullLogger
}
import { DynamicLogger } from "../../index.esm";

window.onload = function() {
    const logger = new DynamicLogger({
        host: 'Web',
        store: {
            bufferSize: 0
        }
    });

    function init() {
        const logType = (window.localStorage.getItem('log-type') || 'null').toLowerCase();

        try {
            if (logType) {
                logger.type = logType;

                document.querySelectorAll('input[name="log-type"]').forEach(el => {
                    if (el.value.toLowerCase() == logType) {
                        el.checked = true;
                    }
                });
            }
        } catch (e) {
            console.error(e);
        }
    }
    
    function onLogTypeChanged(e) {
        logger.type = e.target.value;

        window.localStorage.setItem('log-type', logger.type);
    }

    function onLogClicked(e) {
        logger.enterScope(onLogClicked);
        
        const method = e.target.innerText.toLowerCase();

        if (typeof logger[method] == 'function') {
            logger[method](`Button '${e.target.innerText}' was clicked.`, { name: 'john doe', age: 24}, method)
        }

        logger.exitScope();
    }

    document.querySelectorAll('input[name="log-type"]').forEach(el => el.onclick = onLogTypeChanged);
    document.querySelectorAll('button.btn-log').forEach(el => el.onclick = onLogClicked);
    document.querySelector("button.btn-clear").onclick = function(e) {
        logger.clear();
    }

    init();
}
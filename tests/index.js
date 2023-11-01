const { ConsoleLogger } = require('../index.esm');

function test1() {
    const logger = new ConsoleLogger({ env: 'node' });
    const data = [{ status: 'failed', success: false, scores: [10, 20, 30] }, true, 'tblCategories'];
    
    logger.enterScope('global:test1');
    
    logger.debug(...data);
    logger.log(...data);
    logger.info(...data);
    logger.warn(...data);
    logger.success(...data);
    logger.suggest(...data);
    logger.danger(...data);
    logger.fail(...data);
    logger.abort(...data);
    logger.cancel(...data);
    logger.trace(...data);

    logger.exitScope();
}

test1();
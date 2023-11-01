function run(Logger) {
  describe("Testing ArrayLogger", () => {
    test("log(): should send log data into logging medium", () => {
      expect(() => {
        const logger = new Logger();

        logger.log("hello");

        expect(logger._logs.length).toBe(1);
        expect(logger._logs[0].data).toBe("hello");
      });
    });
  });

  describe("Testing ArrayLogger + filter", () => {
    test("log(): should log only 'debug' & 'warn' logs", () => {
      expect(() => {
        const logger = new Logger({ filter: "debug,warn" });

        logger.log("hello");
        logger.info("hello");
        logger.success("hello");

        expect(logger._logs.length).toBe(0);

        logger.debug("foo");

        expect(logger._logs.length).toBe(1);

        expect(logger._logs[0].data).toBe("foo");

        logger.warn("foo");
        logger.fail("foo");

        expect(logger._logs.length).toBe(2);
      });
    });
  });

  describe("Testing ArrayLogger + scopeFilter", () => {
    test("log(): should log only 'debug' logs", () => {
      expect(() => {
        const logger = new Logger({ scopeFilter: "f1" });

        function f1() {
          logger.enterScope("f1");
          logger.log("I am f1");
          logger.exitScope();
        }
        function f2() {
          logger.enterScope("f2");
          logger.log("I am f2()");
          logger.debug("calling f1 ...");
          f1();
          logger.debug("f1 was called");
          logger.exitScope();
        }
        function f3() {
          logger.enterScope("f3");
          logger.log("I am f2()");
          logger.debug("calling f2 ...");
          f2();
          logger.debug("f2 was called");
          logger.exitScope();
        }

        f3();

        expect(logger._logs.length).toBe(1);

        expect(logger._logs[0].data).toBe("I am f1");
      });
    });
  });

  describe("Testing ArrayLogger + filter + scopeFilter", () => {
    test("log(): should log only 'debug' logs", () => {
      expect(() => {
        const logger = new Logger({ filter: "debug", scopeFilter: "f2" });

        function f1() {
          logger.enterScope("f1");
          logger.log("I am f1");
          logger.exitScope();
        }
        function f2() {
          logger.enterScope("f2");
          logger.log("I am f2()");
          logger.debug("calling f1 ...");
          f1();
          logger.debug("f1 was called");
          logger.exitScope();
        }
        function f3() {
          logger.enterScope("f3");
          logger.log("I am f2()");
          logger.debug("calling f2 ...");
          f2();
          logger.debug("f2 was called");
          logger.exitScope();
        }

        f3();

        expect(logger._logs.length).toBe(2);
      });
    });
  });

  describe("Testing ChainLogger", () => {
    test("only ArrayLogger should be able to log", () => {
      expect(() => {
        const logger1 = new Logger({ filter: "debug" });
        const logger = new Logger({ filter: "warn", next: logger1 });

        // no logger can log this log, since it is of 'info' type
        logger.info("hello");

        expect(logger._logs.length).toBe(0);
        expect(logger1._logs.length).toBe(0);

        // only logger can log this log
        logger.warn("hello");

        expect(logger._logs.length).toBe(1);
        expect(logger1._logs.length).toBe(0);

        logger.clear();
        // only logger1 can log this log
        logger.debug("hello");

        expect(logger._logs.length).toBe(0);
        expect(logger1._logs.length).toBe(1);
      });
    });
  });

  describe("Testing ChainLogger + unattended logger", () => {
    test("only ArrayLogger should be able to log", () => {
      expect(() => {
        const logger0 = new Logger({ filter: "debug" });
        const logger1 = new Logger({ unattended: true });
        const logger = new Logger({ filter: "warn", next: logger1 });

        // only logger1 can log this log
        logger.info("hello");

        expect(logger._logs.length).toBe(0);
        expect(logger0._logs.length).toBe(0);
        expect(logger1._logs.length).toBe(1);

        logger.clear();
        // only logger & logger1 can log this log
        logger.warn("hello");

        expect(logger._logs.length).toBe(1);
        expect(logger0._logs.length).toBe(0);
        expect(logger1._logs.length).toBe(1);

        logger.clear();
        // only logger0 & logger1 can log this log
        logger.debug("hello");

        expect(logger._logs.length).toBe(0);
        expect(logger0._logs.length).toBe(1);
        expect(logger1._logs.length).toBe(1);
      });
    });
  });
}

export default run;

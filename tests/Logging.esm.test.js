import { ArrayLogger } from '../index.esm.js'

(function (...factoryConfigs) {
    for (let factoryConfig of factoryConfigs) {
        describe('Testing ' + factoryConfig.name, () => {
            // --------------------- register -------------------

            test('log(): should send log data into logging medium', () => {
                expect(() => {
                    const obj = factoryConfig.factory();

                    obj.log('hello')

                    if (obj instanceof ArrayLogger) {
                        expect(obj._logs.length).toBe(1)
                        expect(obj._logs[0].data).toBe('hello')
                    } else {
                        expect(true).toBeTrue();
                    }
                })
            });
        });
    }
})({    // factory config items
    name: 'ArrayLogger',
    factory: function () {
        return new ArrayLogger();
    }
});
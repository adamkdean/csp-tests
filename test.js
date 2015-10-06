'use strict';

var co = require('co'),
    csp = require('js-csp'),
    debug = require('debug')('csp-test');

function sleep(ms) {
    var ch = csp.chan();
    setTimeout(function () {
        csp.putAsync(ch, {});
    }, ms);
    return ch;
}

function *generator(ch) {
    while (true) {
        var payload = yield csp.take(ch);
        if (payload !== csp.CLOSED) {
            debug('waiting 1000 ms');
            yield csp.take(sleep(1000));
            debug('done waiting');

            yield csp.put(ch, payload);
        }
    }
}

csp.go(function *() {
    var ch = csp.chan();

    csp.go(generator, [ch]);
    csp.go(generator, [ch]);

    yield csp.put(ch, {});
    yield csp.timeout(1000);

    debug('closing channel');
    ch.close();
});

// co(function *() {
//     debug('before yield');
//     yield function (done) { setTimeout(done, 1000); };
//     debug('after yield');
// });


//
//
// co(function *() {
//     debug('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
//
//     yield function (done) {
//         csp.go(function *() {
//             var ch = csp.chan();
//
//             csp.go(generator, [ch]);
//             csp.go(generator, [ch]);
//
//             yield csp.put(ch, {});
//             yield csp.timeout(1000);
//
//             debug('closing channel');
//             ch.close();
//
//             done();
//         });
//     };
//
//     debug('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
//
// });

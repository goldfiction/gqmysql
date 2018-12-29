/**
 * Created by happy on 2/21/17.
 */
var assert = require("assert");
require('./server.js');
var _ = require('underscore');
var lib = require('./../lib.js');
var log = lib.tryLog;
var gqmysql = require('./../gqmysql.js');

var result, o, o2;

Object.prototype.noise=function(){  // newest tweak allowing noise functions inherited from object tolerated against queries
    return "";
}

before(function (done) {
    gqmysql.mysqlConnect2({
        host: "mysql",
        port: 3306,
        user: "admin",
        password: "",
        database: "db",
        route: "/api/db"
    }, function (e, r) {
        global.connection = r;
        global.connection.db = "db";
        global.connection.table = "test";
        global.connection.limit = 10;
        global.connection.count = false;
        global.connection.fasthash = "D";

        o = {
            key: {
                name: "333"
            },
            data: {
                name: "333",
                value: "456",
                fasthash: "D"
            }
        };

        o = _.extend(_.clone(global.connection), _.clone(o));

        done(e)
    })
});

after(function (done) {
    global.connection.connection.end();
    done();
});


it("should be able to put 2", function (done) {
    gqmysql.q_update(_.clone(o)).then(function (o) {
        o.result = JSON.parse(o.result);
        assert(o.result.affectedRows, 1);
        done();
    });
});

it('should be able to get 2', function (done) {
    o2 = _.clone(o);
    o2.count = true;
    gqmysql.q_get(o2).then(function (o) {
        o.result = JSON.parse(o.result);
        result = o.result[0]["COUNT(*)"];
        assert(result == 1);
        done();
    });
});

it('should be able to post 2', function (done) {
    o2 = _.clone(o);
    o2.like = true;

    gqmysql.q_get(o2).then(function (o) {
        log(o.result);
        o.result = JSON.parse(o.result);
        log(o.result);
        result = o.result[0]['value'];
        assert(result == '456');
        done();
    });
});

it('should be able to post-2 2', function (done) {
    o2 = _.clone(o);
    o2.SQL = "select * from test where name=333 limit 1;";
    gqmysql.q_get(o2).then(function (o) {
        log(typeof o.result);
        o.result = JSON.parse(o.result);
        result = o.result[0]['value'];
        assert(result == '456');
        done();
    });
});

it('should be able to delete 2', function (done) {
    gqmysql.q_delete(_.clone(o)).then(function (o) {
        log(o.result);
        o.result = JSON.parse(o.result);
        assert(o.result.affectedRows == 1);
        done();
    });
});

it('should find 0 entry 2', function (done) {
    o2 = _.clone(o);
    o2.count = true;
    gqmysql.q_get(o2).then(function (o) {
        log(o);
        o.result = JSON.parse(o.result);
        log(o.result);
        result = o.result[0]["COUNT(*)"];
        assert(result == 0);
        done();
    });
});

// protocal
// head: 1.upsert new data, 2.get this item and assert, 3.head this item and assert
// get: 1. upsert new data, 2.get this item and assert
// for get/post, need to test id=123 and name=123 as key
// post: 1.upsert new data, 2.post this item and assert (new)
// update: 1.upsert new data, 2.get this item (included above)
// delete: 1.upsert new data, 2.delete item, 3.head item




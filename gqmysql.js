/**
 * Created by happy on 2/21/17.
 */
var lib = require("./lib.js");
var log = lib.tryLog;
var doQ = lib.doQ;
var mysql = require('mysql');
var connection = require('express-myconnection');
var _ = require('underscore');

var oDefault2 = {
    key: {},
    data: {},
    db:"db",
    table: "test",
    limit: 1000000
};

function getKeyString(key) {
    var keys = [];
    for (var i in key) {
        if (typeof key[i] === "string") {
            keys.push("t." + i + "='" + key[i] + "'");
        }
        else {
            keys.push("t." + i + "=" + key[i]);
        }
    }
    var keyString = keys.join(' ,');
    if (keyString != "") {
        keyString = "WHERE "+keyString;
    }else{
        keyString = "WHERE TRUE"
    }
    log(keys)
    log(keyString)
    return keyString;
}

function getKeyStringForUpsert(key) {
    var keys = [];
    for (var i in key) {
        if (typeof key[i] === "string") {
            keys.push("" + i + "=" + key[i] + "");
        }
        else {
            keys.push("" + i + "=" + key[i]);
        }
    }
    var keyString = keys.join(' ,');
    if (keyString != "") {
        keyString = "WHERE "+keyString;
    }
    return keyString;
}

function getFieldString(data) {
    var fields = [];
    var values = [];
    var setData = [];
    for (var i in data) {
        fields.push("" + i + "");
        if (typeof data[i] === "string") {
            values.push("" + data[i] + "");
            setData.push("" + i + "=" + data[i] + "");
        }
        else {
            values.push(data[i]);
            setData.push("" + i + "=" + data[i]+"");
        }
    }
    var fieldString = fields.join(', ');
    var valueString = values.join(', ');
    var setDataString = setData.join(', ');

    return {
        fieldString: fieldString,
        valueString: valueString,
        setDataString: setDataString
    }
}


// in: o.getConnection
// in: [o.key={}]
// in: [o.table="test"]
// in: [o.limit=1000000]
// out: o.result
// out: o.error
function m_get(o, cb) {
    o = _.defaults(o, oDefault2);

    o.getConnection(function (err, connection) {
        o.queryString='SELECT * FROM ' + o.table + ' as t WHERE ' + getKeyString(o.key) + ' Limit ' + o.limit + ';';
        var query = connection.query(o.queryString, function (err, rows) {
            log(o.queryString)
            try {
                log("Error reading: ");
                log(err);
                o.error = err;
                o.result = JSON.stringify(rows, null, 2);
                cb(o)
            } catch (e) {
            }
        });
    });
}

// in: o.getConnection
// in: [o.key={}]
// in: [o.data={}]
// in: [o.table="test"]
// in: [o.limit=1000000]
// out: o.result
// out: o.error
function m_update(o, cb) {
    //o = _.defaults(o, oDefault2);
    o.database= o.db;
    o.f = getFieldString(o.data);
    //log(o.f)
    //log(o.key)
    //console.log(o)

    o.getConnection(function (err, connection) {
//        connection.query("INSERT INTO `" + o.table + "` (" + o.f.fieldString + ") VALUES (" + o.f.valueString + ") " +
//        "ON DUPLICATE KEY UPDATE " + o.f.setDataString + " WHERE " + getKeyString(o.key) + " LIMIT " + o.limit + ";", function (err, rows) {
        o.queryString="INSERT INTO " + o.table + " (" + o.f.fieldString + ") VALUES (" + o.f.valueString + ") " +
        "ON DUPLICATE KEY UPDATE " + o.f.setDataString + ";";
        log(o.queryString)
        connection.query(o.queryString, function (err, rows) {
            try {
                //log("Error upserting: ");
                //log(err);
                //console.log(err)
                o.error = err;
                o.result = JSON.stringify(rows,null,2);
                //log(o.result)
                cb(err,o);
            } catch (e) {
            }
        });

    });
}

// in: o.getConnection
// in: [o.key={}]
// in: [o.table="test"]
// in: [o.limit=1]  ***
// out: o.result
// out: o.error
function m_delete(o, cb) {
    o.limit = o.limit || 1;  // default delete 1 item
    o = _.defaults(o, oDefault2);
    o.getConnection(function (err, connection) {
        var query = connection.query('DELETE FROM ' + o.table + ' as t WHERE ' + getKeyString(o.key) + ' Limit ' + o.limit + ';', function (err, rows) {
            try {
                log("Error deleting: ");
                log(err);
                o.error = err;
                o.result = JSON.stringify(rows, null, 2);
                cb(err,o)
            } catch (e) {
            }
        });
    });
}

// in: o.getConnection
// in: [o.key={}]
// in: [o.table="test"]
// in: [o.limit=1000000]
// out: o.result
// out: o.error
function m_head(o, cb) {
    o = _.defaults(o, oDefault2);
    o.getConnection(function (err, connection) {
        o.queryString='SELECT COUNT(*) FROM ' + o.table + ' ' + getKeyString(o.key) + ' Limit ' + o.limit + ';';
        log(o.queryString)
        var query = connection.query(o.queryString, function (err, rows) {
            try {
                //log("Error counting: ");
                //log(err);
                o.error = err;
                //log(rows)
                o.result = rows[0]['COUNT(*)']+"";
                log(o.result)
                cb(err,o)
            } catch (e) {
            }
        });

    });

}

function q_get(o) {
    o.query = m_get;
    return doQ(o);
}

function q_update(o) {
    o.query = m_update;
    return doQ(o);
}

function q_delete(o) {
    o.query = m_delete;
    return doQ(o);
}

function q_head(o) {
    o.query = m_head;
    return doQ(o);
}

exports.q_get = q_get;
exports.q_update = q_update;
exports.q_delete = q_delete;
exports.q_head = q_head;

function doRes(o) {
    //console.log("doRes")
    //console.log(o.result);
    o.res.statusCode = 200;
    o.res.write(o.result);
    o.res.end();
    //o.res.send(JSON.stringify(o.result, null, 2));
}

function doReq(req,res,o){
    //console.log("doReq")
    o = o||JSON.parse(JSON.stringify(req.body));
    o = _.defaults(o,oDefault2);
    o=lib.doParse(o)
    //console.log(o)
    o.getConnection = req.getConnection;
    o.req = req;
    o.res = res;
    return o;
}

function r_get(req, res) {
    var o = JSON.parse(JSON.stringify(req.query));
    o=doReq(req,res,o);
    return q_get(o).then(doRes);
}

function r_post(req, res) {
    var o = doReq(req,res);
    return q_get(o).then(doRes);
}

function r_update(req, res) {
    var o = doReq(req,res);
    return q_update(o).then(doRes);
}

function r_delete(req, res) {
    var o = doReq(req,res);
    return q_delete(o).then(doRes);
}

function r_head(req, res) {
    //var o = JSON.parse(JSON.stringify(req.query));
    var o = doReq(req,res);
    return q_head(o).then(doRes);
}

function defaultauth(req, res, next) {
    next();
}

// create a crud route for given mysql db and table
// in: o.app
// in: o.route="/api/db"
// in: o.password
// in: [o.db="db"]
// in: [o.table="test"]
// in: [o.auth=defaultauth]
// in: [o.host="localhost"]
// in: [o.port=3306]
// in: [o.user="root"]
function mysqlRoute(o) {
    // defaults
    var oDefault = {
        db: "db",
        table: "test",
        host: "localhost",
        port: 3306,
        user: "root",
        route: "/api/db",
    };
    o = _.defaults(o, oDefault);
    o.auth= o.auth||defaultauth;
    o.database = o.db;

    // shorts
    var app = o.app;
    var route = o.route;
    var auth = o.auth;

    // start mysql connection
    app.use(
        connection(mysql, {
            host: o.host,
            port: o.port,
            user: o.user,
            password: o.password,
            database: o.database
        }, 'pool') //or single
    );

    // routes
    app.head(route, auth, r_head);
    app.get(route, auth, r_get);
    app.post(route, auth, r_post);
    app.put(route, auth, r_update);
    app.delete(route, auth, r_delete);

    return app;
}

exports.mysqlRoute = mysqlRoute;
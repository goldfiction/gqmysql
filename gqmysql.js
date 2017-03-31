/**
 * Created by happy on 2/21/17.
 */
var lib = require("./lib.js");
var log = lib.tryLog;
var doQ = lib.doQ;
var esc = lib.escapeMysqlString;
var mysql = require('mysql');
var connection = require('express-myconnection');
var _ = require('underscore');

var allowDirectQuery=true;// allow o.SQL to be used as direct query in get/post queries
var allowDelete=true;// allow delete route being avaiable in the route

var oDefault2 = {
    key: {},
    data: {},
    database: "db",
    table: "test",
    limit: 1000000
};

function getKeyString(o) {
    var keys = [];
    var selectKeys=[];
    selectKeys.push("COUNT(*)");
    var tablePrepend="t.";
    var joinStr=' and ';
    var selectAll="TRUE";
    var selectStr="*";
    var key= o.key;
    if(o.del){
        tablePrepend="";
        joinStr = ',';
        selectAll="FALSE";
    }
    if(!o.like) {
        for (var i in key) {
            if (typeof key[i] === "string" && key[i].indexOf(' ') !== -1) {
                keys.push(tablePrepend+"`" + esc(i) + "`='" + esc(key[i]) + "'");
                //selectKeys.push(esc(i));
            }
            else if (typeof key[i] !== "object") {
                keys.push(tablePrepend+"`" + esc(i) + "`=" + esc(key[i]));
                //selectKeys.push(esc(i));
            }
        }
    } else {
        for (var i in key) {
            if (typeof key[i] === "string") {
                keys.push(tablePrepend+"`" + esc(i) + "` like '%" + esc(key[i]) + "%'");
                //selectKeys.push(esc(i));
            }
            else if (typeof key[i] !== "object") {
                keys.push(tablePrepend+"`" + esc(i) + "` like %" + esc(key[i]) + "%");
                //selectKeys.push(esc(i));
            }
        }
    }
    var keyString = keys.join(joinStr);
    if (keyString != "") {
        keyString = "WHERE " + keyString;
    } else {
        keyString = "WHERE " + selectAll;
    }

    if(o.count){
        selectStr=selectKeys.join(',');
    }
    //log(keys)
    //log(keyString)
    return {keyStr:keyString,selectStr:selectStr};
}

function getFieldString(data) {
    var fields = [];
    var values = [];
    var setData = [];
    for (var i in data) {
        if (typeof data[i] === "string") {
            values.push("'" + esc(data[i]) + "'");
            setData.push("`" + i + "`='" + esc(data[i]) + "'");
            fields.push("" + esc(i) + "");
        }
        else if(typeof data[i]!=="object"){
            values.push(esc(data[i]));
            setData.push("`" + esc(i) + "`=" + esc(data[i]) + "");
            fields.push("" + esc(i) + "");
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
// in: [o.count=false]  whether return count(*) instead of actual results
// in: [o.like=false]  whether use like %...% in search
// in: [o.fasthash=null]  whether use fasthash, if true, please make fashhash equal to a singal varchar as fasthash

// fast hash can improve search speed drastically for very large data set
// To explain, fasthash is an 8bit value (1byte) where 5 bits are from
// 0%, 25%, 50%, 75% and 100% position of the index string converted to string buffer(such as t.`name`)
// and 1 bit using the sum of these bits and
// 0 for the rest of the bits. This single char can be used
// instead of string index such as username and email
// if there are multiple primary index, one can concatenate them
// to form the string for fast hash

// for example, if index is "abcdefg", and fast hash suppose is "01001", single bit is 0
// fasthash is 0+01001+00 one can save this byte and use as preceding search before using string index
// this can improve search speed drastically

// fasthash should be varchar(1), null as default, index

// out: o.result
// out: o.error

function m_get(o, cb) {
    o.getConnection(function (err, connection) {
        if(o.SQL && allowDirectQuery){
            o.queryString= o.SQL;
        }else {
            var keyStr=getKeyString(o);
            o.keyString=keyStr.keyStr;
            o.select=keyStr.selectStr;

            if (o.fasthash) {
                o.queryString = 'SELECT ' + o.select + ' FROM ( SELECT * FROM `' + o.table + '` t1 WHERE t1.fasthash=\'' + o.fasthash + '\' ) t ' + o.keyString + ' LIMIT ' + o.limit + ';';
            } else {
                o.queryString = 'SELECT ' + o.select + ' FROM `' + o.table + '` t ' + o.keyString + ' LIMIT ' + o.limit + ';';
            }
        }

        connection.query(o.queryString, function (err, rows) {
            log(o.queryString)
            try {
                //log("Error reading: ");
                log(err);
                o.error = err;
                o.result = JSON.stringify(rows, null, 2);
                log(o.result)
                cb(err, o)
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
    o.f = getFieldString(o.data);

    o.getConnection(function (err, connection) {
        o.queryString = "INSERT INTO `" + o.table + "` (" + o.f.fieldString + ") VALUES (" + o.f.valueString + ") " +
        "ON DUPLICATE KEY UPDATE " + o.f.setDataString + ";";
        log(o.queryString)
        connection.query(o.queryString, function (err, rows) {
            try {
                log(err);
                o.error = err;
                o.result = JSON.stringify(rows);
                //log(o.result)
                cb(err, o);
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
    o.querystring = 'DELETE FROM `' + o.table + '` ' + getKeyString({key:o.key,del:1}).keyStr + ' LIMIT ' + o.limit + ';';
    log(o.querystring);
    o.getConnection(function (err, connection) {
        var query = connection.query(o.querystring, function (err, rows) {
            try {
                log(err);
                o.error = err;
                o.result = JSON.stringify(rows);
                //log(o.result)
                cb(err, o)
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

exports.q_get = q_get;
exports.q_update = q_update;
exports.q_delete = q_delete;

function doRes(o) {
    o.res.send(200, o.result);
}

function doReq(req, res, o) {
    //console.log("doReq")
    o = o || JSON.parse(JSON.stringify(req.body));
    o = _.defaults(o, oDefault2);
    o = lib.doParse(o)
    //console.log(o)
    o.getConnection = req.getConnection;
    o.req = req;
    o.res = res;
    return o;
}

function r_get(req, res) {
    var o = JSON.parse(JSON.stringify(req.query));
    o = doReq(req, res, o);
    return q_get(o).then(doRes);
}

function r_post(req, res) {
    var o = doReq(req, res);
    return q_get(o).then(doRes);
}

function r_update(req, res) {
    var o = doReq(req, res);
    return q_update(o).then(doRes);
}

function r_delete(req, res) {
    var o = doReq(req, res);
    return q_delete(o).then(doRes);
}

function defaultauth(req, res, next) {
    next();
}

function mysqlConnect(o) {
    // defaults
    var oDefault = {
        database: "db",
        table: "test",
        host: "localhost",
        port: 3306,
        user: "root",
        route: "/api/db"
    };
    o = _.defaults(o, oDefault);

    // shorts
    var app = o.app;

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

    return app;
}

exports.mysqlConnect = mysqlConnect;

// create a crud route for given mysql db and table
// in: o.app
// in: o.route="/api/db"
// in: o.password
// in: [o.database="db"]
// in: [o.table="test"]
// in: [o.auth=defaultauth]
// in: [o.host="localhost"]
// in: [o.port=3306]
// in: [o.user="root"]
function mysqlRoute(o) {
    // shorts
    o.auth = o.auth || defaultauth;
    var app = o.app;
    var route = o.route;
    var auth = o.auth;

    // routes
    app.get(route, auth, r_get);
    app.post(route, auth, r_post);
    app.put(route, auth, r_update);
    if(allowDelete) {
        app.delete(route, auth, r_delete);
    }

    return app;
}

exports.mysqlRoute = mysqlRoute;
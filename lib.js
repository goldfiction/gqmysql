/**
 * Created by happy on 2/21/17.
 */
var Q=require('q');

function log(text) {
    setTimeout(function () {
        try {
            console.log(text);
        } catch (e) {
        }
    }, 5);
}
exports.log=log;

function tryLog(text){
    if(text)
        log(text);
}
exports.tryLog=tryLog;

function doParse(obj){
    try{
        if(typeof obj === 'string' || obj instanceof String) {
            obj = JSON.parse(obj);
        }
    }catch(e){}
    if(typeof obj === 'object') {
        for (var i in obj) {
            if(typeof obj[i] === 'string' || obj[i] instanceof String) {
                obj[i] = doParse(obj[i]);
            }
        }
    }
    return obj;
}
exports.doParse=doParse;

function doQ(o) {
    // doQ(o)
    // in: o.query
    // out: o.result
    // promise return: doQ({query:query,...other parameter query needs})
    var deferred = Q.defer();
    o.query(o, function (e, o2) {
        tryLog(e);
        deferred.resolve(o2);
    });
    return deferred.promise;
}
exports.doQ = doQ;

function objectToUrl(obj){
    var urls=[];
    for(var i in obj){
        if(typeof obj[i]==='object'){
            urls.push(encodeURIComponent(i)+'='+encodeURIComponent(JSON.stringify(obj[i])));
        }else{
            urls.push(encodeURIComponent(i)+'='+encodeURIComponent(obj[i]+''));
        }
    }
    return urls.join('&');
}

exports.objectToUrl=objectToUrl;

var regex = new RegExp(/[\0\x08\x09\x1a\n\r"'\\\%]/g);
var escaper = function(char){
    var m = ['\\0', '\\x08', '\\x09', '\\x1a', '\\n', '\\r', "'", '"', "\\", '\\\\', "%"];
    var r = ['\\\\0', '\\\\b', '\\\\t', '\\\\z', '\\\\n', '\\\\r', "''", '""', '\\\\', '\\\\\\\\', '\\%'];
    return r[m.indexOf(char)];
};
function escapeMysqlString(str){
    return (typeof str === "string")?str.replace(regex, escaper):str;
}

exports.escapeMysqlString=escapeMysqlString;



// sample doQ methods
//function m_create(o, cb) {
//    // this operation is create only
//    // in: o.db
//    // in: o.collection
//    // in: o.data
//    // in: o.option
//
//    o=doParse(o);
//
//    o.data = o.data || {};
//    o.option = o.option || {upsert: true};
//
//    o.data.createTime = new Date();
//    o.data.updateTime = new Date();
//    o.mongoquery = function (o, cb) {
//        //console.log(o)
//        o.col.insertOne(o.data, o.option, function (e, r) {
//            o.result = JSON.stringify(r);
//            cb(e, o);
//        });
//    }
//
//    mongo(o, cb);
//}
//exports.m_create = m_create;
//
//function q_create(o) {
//    o.query = m_create;
//    return doQ(o);
//}
//exports.q_create = q_create;

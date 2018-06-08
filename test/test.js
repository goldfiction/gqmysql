/**
 * Created by happy on 2/21/17.
 */
var assert=require("assert");
var server=require('./server.js');
var needle=require('needle');
var _=require('underscore');
var lib=require('./../lib.js');
var log=lib.tryLog;

Object.prototype.noise=function(){    // newest tweak allowing noise functions inherited from object tolerated against queries
    return "";
}

before(function(done){
    server.runserver({
        host:"localhost",
        port:3306,
        user:"root",
        password:"",
        database:"db",
        route:"/api/db"
    },function(e){
        setTimeout(function(){
            log(e);
            done(e);
        },1000);
    });
});

var o={
    key:{
        name:"333"
    },
    data:{
        name:"333",
        value:"456",
        fasthash:"D"
    },
    db: "db",
    table: "test",
    limit: 10,
    count: true,
    fasthash: "D"
};

it("should be able to put",function(done){
    needle.put('http://localhost:10080/api/db',o,function(e,r){
        var result= JSON.parse(r.body.toString());
        //log(result);
        assert(result.affectedRows,1);
        done(e);
    });
});

it('should be able to get',function(done){
    needle.get('http://localhost:10080/api/db'+'?'+lib.objectToUrl(o),function(e,r){
        var result= JSON.parse(r.body.toString());
        //log(result)
        result=result[0]["COUNT(*)"];
        assert(result==1);
        done(e);
    });
});

it('should be able to post',function(done){
    o.count=false;
    o.like=true;
    needle.post('http://localhost:10080/api/db',o,function(e,r){
        var result= JSON.parse(r.body.toString());
        result=result[0]['value'];
        assert(result=='456');
        done(e);
    });
});

it('should be able to post-2',function(done){
    var o2= _.clone(o);
    o2.SQL="select * from test where name=333 limit 1;";
    needle.post('http://localhost:10080/api/db',o2,function(e,r){
        var result= JSON.parse(r.body.toString());
        result=result[0]['value'];
        assert(result=='456');
        done(e);
    });
});

it('should be able to delete',function(done){
    needle.delete('http://localhost:10080/api/db',o,function(e,r){
        var result= JSON.parse(r.body.toString());
        assert(result.affectedRows==1);
        done(e);
    });
});

it('should find 0 entry',function(done){
    o.count=true;
    needle.post('http://localhost:10080/api/db',o,function(e,r){
        var result= JSON.parse(r.body.toString());
        result=result[0]["COUNT(*)"];
        assert(result==0);
        done(e);
    });
});

// protocal
// head: 1.upsert new data, 2.get this item and assert, 3.head this item and assert
// get: 1. upsert new data, 2.get this item and assert
// for get/post, need to test id=123 and name=123 as key
// post: 1.upsert new data, 2.post this item and assert (new)
// update: 1.upsert new data, 2.get this item (included above)
// delete: 1.upsert new data, 2.delete item, 3.head item




/**
 * Created by happy on 2/21/17.
 */
var assert=require("assert");
var server=require('./server.js');
var needle=require('needle');
var lib=require('./../lib.js');
var log=lib.tryLog;

before(function(done){
    server.runserver({setup:null},function(){
        setTimeout(function(){
            done();
        },100);
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




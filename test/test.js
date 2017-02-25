/**
 * Created by happy on 2/21/17.
 */
var assert=require("assert");
var server=require('./server.js');
var gqmysql=require('./../gqmysql.js');
var needle=require('needle');
var lib=require('./../lib.js');
var log=lib.tryLog;

before(function(done){
    server.runserver({setup:null},function(){
        setTimeout(function(){
            done();
        },100)
    })
})

// todo: __q_    these cases tests q methods such as q_get
// todo: head
it("should be able to head",function(done){
    needle.put('http://localhost:10080/api/db',{
        data:{
            name:"333",
            value:456
        },
        db:"db",
        table:"test"
    },function(e,r){
        var result= JSON.parse(r.body.toString());
        console.log(result)
        assert(result.affectedRows,1);
        assert(e===null);
        needle.head('http://localhost:10080/api/db',{
            key:{name:"333"},
            db:"db",
            table:"test",
            limit:1
        },function(e,r){
            var result= Number(r.body.toString());
            //log(result)
            assert(result>=1);
            done(e);
        })
    })
});
// todo: get
// todo: post
// todo: update
// todo: delete

// todo: setup server
// todo: __needle
// todo: head
// todo: get
// todo: post
// todo: update
// todo: delete

// protocal
// head: 1.upsert new data, 2.get this item and assert, 3.head this item and assert
// get: 1. upsert new data, 2.get this item and assert
// for get/post, need to test id=123 and name=123 as key
// post: 1.upsert new data, 2.post this item and assert (new)
// update: 1.upsert new data, 2.get this item (included above)
// delete: 1.upsert new data, 2.delete item, 3.head item




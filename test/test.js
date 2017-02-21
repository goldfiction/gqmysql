/**
 * Created by happy on 2/21/17.
 */
var assert=require("assert");
var server=require('./server.js');

    it("should be able to start",function(done){
        server.runserver({setup:null},function(){
        done();
        })
    })

// todo: __q_
// todo: head
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

//
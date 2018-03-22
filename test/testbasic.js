/**
 * Created by happy on 2/25/17.
 */
var assert=require("assert");
it("sanity: should not crash",function(done){
    assert(require("./../gqmysql.js"));
    done();
});


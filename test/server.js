/**
 * Created by happy on 2/21/17.
 */

    //this is a sample server

    var express = require('express');
    var routes = require('routes');
    var http = require('http')
    var path = require('path');

    //load customers route
    //var customers = require('./routes/customers');
    var app = express();
    var gqmysql=require('./../gqmysql.js');

    // all environments
    app.set('port', process.env.PORT || 10080);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());

    //app.use(express.static(path.join(__dirname, 'public')));
    // development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }

function runserver(o,cb) {
    app=gqmysql.mysqlRoute({
        app:app,
        route:"/api/db",
        user:"root",
        password:"78567856"
    });
    o.app=app;
    try{
        o.setup(o);
    }catch(e){}
    http.createServer(app).listen(app.get('port'), function () {
        console.log('Server listening on port ' + app.get('port'));
        try {
            cb(o);
        }catch(e){}
    });
}

exports.runserver=runserver;














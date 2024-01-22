//create web server
//create web server
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var template = require('./lib/template.js');
var db = require('./lib/db.js');
var shortid = require('shortid');
var cookie = require('cookie');
var auth = require('./lib/auth.js');

//auth
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

//passport strategy
passport.use(new LocalStrategy(
  function(username, password, done) {
    var user = auth.users[0];
    if(username === user.username){
      if(password === user.password){
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    } else {
      return done(null, false, { message: 'Incorrect username.' });
    }
  }
));
//serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(id, done) {
  var user = auth.users[0];
  done(null, user);
});

//create app
var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url,true).pathname;
    var title = queryData.id;
    var cookies = {};
    if(request.headers.cookie !== undefined){
      cookies = cookie.parse(request.headers.cookie);
    }
    if(pathname === '/login'){
      var description = `
        <form action="login_process" method="post">
          <p><input type="text" name="username" placeholder="username"></p>
          <p><input type="password" name="password" placeholder="password"></p>
          <p><input type="submit"></p>
        </form>
      `;
      var list = template.list(request.list);
      var html = template.HTML(title, list,
        `
        <h2>${title}</h2>
        <p>${description}</p>
        `,
        ''
      );
      response.writeHead(200);
      response.end(html);
    } else if(pathname === '/login_process'){
      var body = '';
      request.on('data',function(data){
        body +=
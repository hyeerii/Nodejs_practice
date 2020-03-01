const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const template = require('./lib/template.js')
const db = require('./lib/db');
const topic = require('./lib/topic');
const author = require('./lib/author');

var app = http.createServer((request, response) => {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  //console.log(url.parse(_url, true)) 해보면 pathname에 어떤값이 있는지 알수 있음
  let pathname = url.parse(_url, true).pathname;

  if (pathname === '/') {
    if (queryData.id === undefined) {
        topic.home(request, response);
    } else {
      topic.page(request, response);
    }
  }
  else if(pathname === '/create'){
    topic.create(request,response);
  } else if(pathname === '/create_process'){
    topic.create_process(request, response);
  }
  else if(pathname === '/update') {
    topic.update(request, response);
  }
  else if(pathname === '/update_process') {
    topic.update_process(request, response);
  }
  else if(pathname === '/delete_process') {
    topic.delete_process(request, response);
  }
  else if(pathname === '/author') {
    author.home(request, response);
  }
  else if(pathname === '/author/create_process') {
    author.create_process(request, response);
  }
  else if(pathname === '/author/update') {
    author.update(request, response);
  }
  else if(pathname === '/author/update_process') {
    author.update_process(request, response);
  }
  else if(pathname === '/author/delete_process') {
    author.delete_process(request, response);
  }
  else {
    response.writeHead(404);  //실패
    response.end('Not found');
  }
});
app.listen(3000);
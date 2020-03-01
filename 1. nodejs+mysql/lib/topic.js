const url = require('url');
const qs = require('querystring');
//사용자가 입력하는 정보는 항상 의심! 그래서 sanitize-html 필요
const sanitizeHTML = require('sanitize-html');
const db = require('./db');
const template = require('./template.js');

//하나의 API만 제공할 때는 module.exports
//여러개일 때는 exports
exports.home = function (request, response) {
    db.query(`SELECT * FROM topic`, (err, results) => {  //sql문이 실행된 후에 서버가 응답한 결과를 처리할 수 있도록 callback func
        //console.log(results);
        let title = 'Welcome';
        let description = "Hello, Node.js";
        let list = template.list(results);
        let html = template.HTML(title, list, `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`);

        response.writeHead(200);
        response.end(html);
    });
}


exports.page = function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    db.query(`SELECT * FROM topic`, (err, results) => {
        if (err) throw err;
        //                                  id=?${queryData.id} 도 가능하지만 보안상 아래방식으로!!
        db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], (err2, topic) => {
            //                                   ?에 다음위치에 있는 것으로 치환됨(queryData.id로) --- 공격에 의도가 있는 코드를 세탁해줌
            if (err2) throw err2;
            //console.log(topic);
            let title = topic[0].title;
            let description = topic[0].description;
            let list = template.list(results);
            let html = template.HTML(title, list,
                ` 
        <h2>${sanitizeHTML(title)}</h2>
        ${sanitizeHTML(description)}
        <p>by ${sanitizeHTML(topic[0].name)}</p>`,
                `<a href="/create">create</a>
        <a href="/update?id=${queryData.id}">update</a>
        <form action="delete_process" method="post">
          <input type="hidden" name="id" value="${queryData.id}">
          <input type="submit" value="delete">
        </form>`);

            response.writeHead(200);
            response.end(html);
        });
    });
}


exports.create = function (request, response) {
    db.query(`SELECT * FROM topic`, function (err, results) {
        db.query('SELECT * FROM author', function (err2, authors) {
            var title = 'Create';
            var list = template.list(results);
            var html = template.HTML(sanitizeHTML(title), list,
                `
        <form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            ${template.authorSelect(authors)}
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
                `<a href="/create">create</a>`
            );
            response.writeHead(200);
            response.end(html);
        });
    });
}


exports.create_process = function (request, response) {
    var body = '';
    request.on('data', function (data) {
        body = body + data;
    });
    request.on('end', function () {
        var post = qs.parse(body);
        db.query(`
          INSERT INTO topic (title, description, created, author_id) 
            VALUES(?, ?, NOW(), ?)`,
            [post.title, post.description, post.author],
            function (error, result) {
                if (error) {
                    throw error;
                }
                response.writeHead(302, { Location: `/?id=${result.insertId}` });   //insertId: 삽입한 행의 id값 알아내기
                response.end();
            }
        )
    });
}


exports.update = function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    db.query(`SELECT * FROM topic`, (err, results) => {
        if (err) throw err;
        db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], (err2, topic) => {
            if (err2) throw err2;
            db.query('SELECT * FROM author', (err3, authors) => {
                if (err3) throw err3;

                let list = template.list(results);
                let html = template.HTML(sanitizeHTML(topic[0].title), list,
                    `
              <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${topic[0].id}">             <!--hidden type은 사용자에게 보이지 않음. 수정할 파일의 이름을 알기위해-->
                <p><input type="text" name="title" placeholder="title" value="${sanitizeHTML(topic[0].title)}"></p>
                <p>
                  <textarea name="description" placeholder="description">${sanitizeHTML(topic[0].description)}</textarea>       <!--input태그에서 value 넣는방식이 이 태그에선 태그사이에 넣는거-->
                </p>
                <p>
                  ${template.authorSelect(authors, topic[0].author_id)}
                </p>
                <p>
                  <input type="submit">
                </p>
              </form>
              `,
                    `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`);

                response.writeHead(200);
                response.end(html);
            });
        });
    });
}

exports.update_process = function(request, response) {
    let body ='';
    request.on('data', (data)=> {
      body += data;
    });
    request.on('end', function() {  
      let post = qs.parse(body); 

      db.query(`UPDATE topic SET title=?, description=?, author_id=? WHERE id=?`, [post.title, post.description, post.author, post.id],
        (err, results) => {
          response.writeHead(302, { Location: `/?id=${post.id}` });
          response.end();
        });
    });
}


exports.delete_process = function(request, response) {
    let body ='';
    request.on('data', (data)=> {
      body += data;
    });
    request.on('end', function() {  
      let post = qs.parse(body); 
      db.query(`DELETE FROM topic WHERE id=?`,[post.id], (err, result)=> {
        if(err) throw err;
        response.writeHead(302, {Location: `/`});
        response.end();
      });
    });
}
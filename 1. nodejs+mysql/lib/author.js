const url = require('url');
const sanitizeHTML = require('sanitize-html');
const db = require('./db');
const template = require('./template.js');
const qs = require('querystring');

exports.home = function (req, res) {
    db.query(`SELECT * FROM topic`, (err, results) => {  //sql문이 실행된 후에 서버가 응답한 결과를 처리할 수 있도록 callback func
        db.query(`SELECT * FROM author`, (err2, authors) => {
            let title = 'author';
            let list = template.list(results);
            let html = template.HTML(title, list,
                `
                ${template.authorTable(authors)}
            <!--html에서는 style태그안에 css를 넣음-->
            <style>
                table{
                    border-collapse: collapse;
                }
                td{
                    border:1px solid black;
                }
            </style>

            <form action="/author/create_process" method="post">
            <p>
                <input type="text" name="name" placeholder="name">
            </p>
            <p>
                <textarea name="profile" placeholder="description"></textarea>
            </p>
            <p><input type="submit" value="create"></p>
            </form>
            `, ``);

            res.writeHead(200);
            res.end(html);
        });
    });
}


exports.create_process = function (req, res) {
    var body = '';
    req.on('data', function (data) {
        body = body + data;
    });
    req.on('end', function () {
        var post = qs.parse(body);
        db.query(`
          INSERT INTO author (name, profile) 
            VALUES(?, ?)`,
            [sanitizeHTML(post.name), sanitizeHTML(post.profile)],
            function (err, result) {
                if (err) throw err;
                res.writeHead(302, { Location: `/author` });
                res.end();
            }
        )
    });
}


exports.update = function (req, res) {
    var _url = req.url;
    var queryData = url.parse(_url, true).query;

    db.query(`SELECT * FROM topic`, (err, results) => {
        if (err) throw err;
        db.query(`SELECT * FROM author`, (err2, authors) => {
            if (err2) throw err2;
            db.query(`SELECT * FROM author WHERE id=?`, [queryData.id], (err3, author) => {
                if (err3) throw err3;
                    let list = template.list(results);
                    let html = template.HTML('author', list,
                        `
                        <form action="/author/update_process" method="post">
                            <input type="hidden" name="id" value="${author[0].id}">             <!--hidden type은 사용자에게 보이지 않음. 수정할 파일의 이름을 알기위해-->
                            <p><input type="text" name="name" placeholder="name" value="${sanitizeHTML(author[0].name)}"></p>
                            <p>
                            <textarea name="profile" placeholder="description">${sanitizeHTML(author[0].profile)}</textarea>       <!--input태그에서 value 넣는방식이 이 태그에선 태그사이에 넣는거-->
                            </p>
                            <p>
                            <input type="submit" value="update">
                            </p>
                        </form>
                        `,
                        `${template.authorTable(authors)}
                        <style>
                            table{
                                border-collapse: collapse;
                            }
                            td{
                                border:1px solid black;
                            }
                        </style>
                        `);
    
                    res.writeHead(200);
                    res.end(html);
            });
        });
    });
}


exports.update_process = function(req, res) {
    let body ='';
    req.on('data', (data)=> {
      body += data;
    });
    req.on('end', function() {  
      let post = qs.parse(body); 

      db.query(`UPDATE author SET name=?, profile=? WHERE id=?`, [post.name, post.profile, post.id],
        (err, results) => {
          res.writeHead(302, { Location: `/author` });
          res.end();
        });
    });
}


exports.delete_process = function (req, res) {
    let body = '';
    req.on('data', (data) => {
        body += data;
    });
    req.on('end', function () {
        let post = qs.parse(body);
        db.query(`DELETE FROM topic WHERE author_id=?`,
            [post.id], (error, result1) => {
                if (error) throw error;
                db.query(`DELETE FROM author WHERE id=?`, [post.id],
                    (err, result) => {
                        if (err) throw err;
                        res.writeHead(302, { Location: `/author` });
                        res.end();
                    });
            });
    });
}
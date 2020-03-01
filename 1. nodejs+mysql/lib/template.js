const sanitizeHTML = require('sanitize-html');
module.exports = {
    HTML:function (title, list, body, control) {
      return `
      <!doctype html>
    <html>
      <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">WEB</a></h1>
        <a href="/author">author</a>
        ${list}
        ${control}
        ${body}
      </body>
    </html>
      `;
    },
    list: function (topics) {
      /*
            let list = `<ol>
            <li><a href="/?id=HTML">HTML</a></li>
            <li><a href="/?id=CSS">CSS</a></li>
            <li><a href="/?id=JavaScript">JavaScript</a></li>
          </ol>`;
            */
      let list = '<ul>';
      for (let i = 0; i < topics.length; i++) {
        list = list + `<li><a href="/?id=${topics[i].id}">${sanitizeHTML(topics[i].title)}</a></li>`;
      }
      list = list + '</ul>';
      return list;
    },
    authorSelect: function(authors, author_id) {
      let tag ='';
      for(let i=0; i<authors.length; i++) {
        let selected = '';
        if(authors[i].id === author_id) {
          selected = 'selected';
        }
        tag += `<option value="${authors[i].id}"${selected}>${sanitizeHTML(authors[i].name)}</option>`;
      }
      return `
      <select name="author">
        ${tag}
      </select>
      `
  },
  authorTable: function (authors) {
    let tag = '<table>';
    for (let i = 0; i < authors.length; i++) {
      tag += `
        <tr>
            <td>${sanitizeHTML(authors[i].name)}</td>
            <td>${sanitizeHTML(authors[i].profile)}</td>
            <td><a href="/author/update?id=${authors[i].id}">update</td>
            <td>
              <form action="/author/delete_process" method="post">
                <input type="hidden" name ="id" value="${authors[i].id}">
                <input type="submit" value="delete">
              </form>
            </td>
        </tr>
    `
    }
    tag += '</table>';
    return tag;
  }
};
const Koa = require('koa');
const app = new Koa();
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '10.2.17.208',
  user     : 'root',
  password : 'mysql',
  database : 'financial'
});

const mysqlQuery = function(connection, sql, param){
  return new Promise(function(res, rej){
    connection.query(sql, param || [],  function (error, results, fields) {
      if (error) {
        rej(error)
      }else{
        res(results)
      }
    });
  })
}
connection.connect();
app.use(async ctx => {
    ctx.set('Access-Control-Allow-Origin','*');
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    ctx.set('Access-Control-Allow-Headers', 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization');

    try{
      var rst = await mysqlQuery(connection, 'SELECT id,title,url,net_name,date_format(ent_time,\'%Y-%m-%d\') as ent_time,keyword,digest,content,hot_degree from netfin_source_message where id > ? and DATE_FORMAT(ent_time,\'%Y-%m-%d\')>=? and DATE_FORMAT(ent_time,\'%Y-%m-%d\')<=? and keyword like CONCAT(\'%\',?,\'%\') order by id asc limit 500;', [ctx.request.query.id, ctx.request.query.sday, ctx.request.query.eday, ctx.request.query.keyword])
    }catch(e){
      console.error(e)
    }
    
    ctx.body = rst;
  });
  
  app.listen(3000);
  // connection.end();
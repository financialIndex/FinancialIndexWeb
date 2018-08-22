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

    var sql1 = 'SELECT id,title,url,net_name,date_format(ent_time,\'%Y-%m-%d\') as ent_time,keyword,digest,content,hot_degree from netfin_filtered_message as tt1 inner join (SELECT id as inid, count(1) as tc from netfin_keyword_search where id >? and DATE_FORMAT(ent_time,\'%Y-%m-%d\')>=? and DATE_FORMAT(ent_time,\'%Y-%m-%d\')<=?';
    var paramList = [];
    var sql2 = '';
    var rst;
    try{
      if(ctx.request.query.fields=='2'){
        sql1 += ' and ((n_type=\'企业\' and keyword=?) or (n_type=\'前沿技术\' and keyword=?)) GROUP BY id having tc=2) as tt2 where tt1.id = tt2.inid order by id asc limit 200;';
        paramList = [ctx.request.query.id, ctx.request.query.sday, ctx.request.query.eday, ctx.request.query.key1,ctx.request.query.key2];
        rst = await mysqlQuery(connection,sql1,paramList);

      }else if(ctx.request.query.fields=='1'){
        if(ctx.request.query.key1!=''){
          sql1 += ' and n_type=\'企业\' and keyword=? GROUP BY id having tc=1) as tt2 where tt1.id = tt2.inid order by id asc limit 200;';
          paramList = [ctx.request.query.id, ctx.request.query.sday, ctx.request.query.eday, ctx.request.query.key1];
        }else if(ctx.request.query.key2!=''){
          sql1 += ' and n_type=\'前沿技术\' and keyword=? GROUP BY id having tc=1) as tt2 where tt1.id = tt2.inid order by id asc limit 200;';
          paramList = [ctx.request.query.id, ctx.request.query.sday, ctx.request.query.eday, ctx.request.query.key2];
        }
        rst = await mysqlQuery(connection,sql1,paramList)

      }else if(ctx.request.query.fields=='0'){
        sql2 = 'SELECT id,title,url,net_name,date_format(ent_time,\'%Y-%m-%d\') as ent_time,keyword,digest,content,hot_degree from netfin_filtered_message where id > ? and DATE_FORMAT(ent_time,\'%Y-%m-%d\')>=? and DATE_FORMAT(ent_time,\'%Y-%m-%d\')<=? order by id asc limit 200;'
        paramList = [ctx.request.query.id, ctx.request.query.sday, ctx.request.query.eday];
        rst = await mysqlQuery(connection, sql2, paramList);
      }
    }catch(e){
      console.error(e)
    }
    ctx.body = rst;
  });
  
  app.listen(3000);
  // connection.end();

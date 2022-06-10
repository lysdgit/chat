var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'mysql.sqlpub.com',
  user     : 'lysdsql',
  password : '46771b53bb625790',
  database : 'lystest'
});
 
connection.connect();
 
var  sql = 'SELECT * FROM chat';
//查
connection.query(sql,function (err, result) {
        if(err){
          console.log('[SELECT ERROR] - ',err.message);
          return;
        }
 
       console.log('--------------------------SELECT----------------------------');
       console.log(result);
       console.log('------------------------------------------------------------\n\n');  
});
 
connection.end();
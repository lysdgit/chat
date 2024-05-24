var express=require('express');
var app=express();
var mysql=require('mysql');

// 配置MySql
var connection = mysql.createConnection({
host:"mysql.sqlpub.com",
user:"lysdsql",
password:"46771b53bb6257901",
database:"lystest",
port:'3306'
});

connection.connect();
app.get('/',function (req,res) {
 res.sendfile(__dirname + "/" + "index.html" );
})


// 实现登录验证功能

app.get('/login',function (req,res) {
 var name=req.query.name;
 var pwd=req.query.pwd;

 var selectSQL = "select * from chat where id= '"+name+"' and pwd = '"+pwd+"'";
 connection.query(selectSQL,function (err,results,rs) {
   if (err) throw err;
if (results.length > 0) {
          console.log(rs);
console.log('登录成功');
res.sendfile(__dirname + "/" + "ok.html" );
        } else {
          console.log('登录错误');
res.sendfile(__dirname + "/" + "404.html" );
        }
 })
})


 //实现注册功能

app.get('/register.html',function (req,res) {
 res.sendfile(__dirname+"/"+"register.html");
})

app.get('/register',function (req,res) {
 var name=req.query.name;
 var pwd=req.query.pwd;
 var id={id:name,pwd:pwd};
 connection.query('insert into chat set ?',id ,function (err,rs) {
  if (err) throw err;
  console.log('注册成功');
  res.sendfile(__dirname + "/" + "index.html" );
 })
})


var server=app.listen(3000,function () {
 console.log("start 3000 port");
}) 

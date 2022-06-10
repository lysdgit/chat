const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 5000;

//上传文件
var fs = require("fs");
var bodyParser = require('body-parser');
var multer  = require('multer');


// 设置静态资源根目录
app.use('/', express.static(__dirname + '/static'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
})
let users = [];//存储当前用户名的数组
let userInfo = [];//存储当前用户信息
io.on('connection', function (socket) {
  console.log('建立服务器端链接');
  // 监听客户端发送来的登录消息
  socket.on('login', function (user) {

    const { username } = user;
    if (users.indexOf(username) > -1) {
      //用户名重复了
      socket.emit('loginError')
    } else {
      users.push(username);
      userInfo.push(user);

      // 存储当前用户名
      socket.nickName = username;

      // 通知客户端登录成功
      io.emit('loginSuc');
      // 用户进入聊天室提示信息
      io.emit('system', {
        name: username,
        status: '进入'
      })
      // 显示在线人员，给客户端返回消息
      io.emit('disUser', userInfo);
      console.log('一个用户登录了');
    }
  })

  // 监听发送消息事件
  socket.on('sendMsg', (data) => {

    let imgSrc = '';
    // 谁发送消息  头像地址就是谁的，因为socket.nickname 是当前用户登录时存储的名字
    for (let i = 0; i < userInfo.length; i++) {
      if (userInfo[i].username === socket.nickName){
        imgSrc = userInfo[i].imgSrc;
      }
    }

    // 广播给除发送人之外的所有人
    socket.broadcast.emit('receiveMsg', {
      name: socket.nickName,
      imgSrc:imgSrc,
      msg:data.msgVal,
      color:data.color,
      // 颜色 类型
      side:'left',
      isUser:true,
    })
    socket.emit('receiveMsg',{
      name: socket.nickName,
      imgSrc: imgSrc,
      msg: data.msgVal,
      color: data.color,
      // 颜色 类型
      side: 'right',
      isUser: true,
    })

  })

  // 发送窗口震动事件
  socket.on('shake',()=>{
    socket.emit('shake',{
      name:'您'
    })
    // 广播消息 给其它的用户
    socket.broadcast.emit('shake',{
      name:socket.nickName
    })
  })


  // 断开链接时的操作
  socket.on('disconnect', () => {
    // [a,b,c] //1   users  userInfo
    let index = users.indexOf(socket.nickName);
    if (index > -1) {
      users.splice(index, 1); //删除用户名
      userInfo.splice(index, 1);//删除用户信息
      // 通知给客户端  告知什么时间 xxx离开了
      io.emit('system', {
        name: socket.nickName,
        status: '离开'
      })
      // 告知客户端重新渲染
      io.emit('disUser', userInfo);
 console.log('一个用户退出了');
    }
  })

});

http.listen(3001, () => {
  console.log('listen on 3001 port!');

})

// npm i express socket.io -S
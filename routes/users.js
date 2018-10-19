var express = require('express');
var router = express.Router();
const usersModel = require('../model/usersModel.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//注册操作
router.post('/register',function(req,res){
  console.log('输出请求过来的数据');
  console.log(req.body);
  if(!/^\w{3,8}$/.test(req.body.username)){
    // res.send('用户名必须是3到8位');
    res.render('weerror',{ code : -1, msg : '用户名必须是3到8位' });
    return;
  }


  usersModel.add(req.body,function(err){
    if(err){
      res.render('weerror',err);
    }else{
      //注册成功，跳到登录页面

      //不能渲染，要跳转
      //res.render('login');
      res.redirect('/login.html');
    }
  });
});
module.exports = router;

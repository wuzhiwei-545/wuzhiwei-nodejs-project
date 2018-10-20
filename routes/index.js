var express = require('express');
var router = express.Router();

//首页
router.get('/', function(req, res, next) {
  // 判断用户是否已经登录，如果登录就返回首页，否则返回登录页面
  if(req.cookies.username){
    //需要将用户登录信息传递给页面
    res.render('index', {
      username: req.cookies.username,
      nickname: req.cookies.nickname,
      isAdmin: parseInt(req.cookies.isAdmin) ? '(管理员)' : ''
    });
  }else{
    //跳转到登录页面
    res.redirect('/login.html');
  }

});

//注册操作
router.get('/register.html',function(req,res){
  res.render('register');
})

//登录操作
router.get('/login.html',function(req,res){
  res.render('login');
})
module.exports = router;









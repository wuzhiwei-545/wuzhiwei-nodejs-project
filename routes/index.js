var express = require('express');
var router = express.Router();

//首页
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
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









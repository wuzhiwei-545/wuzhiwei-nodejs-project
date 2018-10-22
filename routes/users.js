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

//登录操作
router.post('/login',function(req,res){
  //调用 userModel 里面的 login 方法
  usersModel.login(req.body,function(err,data){
    if(err){
      res.render('weerror',err);
    }else{
      //跳转到首页
      console.log('当前登录用户的信息是',data);
      //写 cookie
      res.cookie('username',data.username,{
        maxAge: 1000 * 60 * 60
      })
      res.cookie('nickname',data.nickname,{
        maxAge: 1000 * 60 * 60
      })
      res.cookie('isAdmin',data.isAdmin,{
        maxAge: 1000 * 60 * 60
      })
      res.redirect('/')
    }
  })
})

//退出登录
router.get('/logout',function(req,res){
  // if(!req.cookies.username){
  //   res.redirect('/login.html');
  // }
  res.clearCookie('username');
  res.clearCookie('nickname');
  res.clearCookie('isAdmin');
  // res.redirect('/login.html');
  res.send('<script>location.replace("/")</script>');
})
module.exports = router;

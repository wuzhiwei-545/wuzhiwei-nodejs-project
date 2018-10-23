var express = require('express');
var router = express.Router();
var usersModel = require('../model/usersModel.js')

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

//用户管理页面
router.get('/user-manages.html',function(req,res){
  //同首页，需要判断是否用户登录，并且判断用户是否是管理员
  if(req.cookies.username && parseInt(req.cookies.isAdmin)){
    //需要查询数据库
    //从前端取得2个参数
    let page = req.query.page || 1; //页码
    let pageSize = req.query.pageSize || 5; //每页显示条数
    if(req.query.nickname){
      usersModel.finduser(req.query.nickname,function(err,data){
        if(err){
          res.render('weerror',err);
        }else{
          res.render('user-manages',{
            username: req.cookies.username,
            nickname: req.cookies.nickname,
            isAdmin: parseInt(req.cookies.isAdmin) ? '(管理员)' : '',
            userList: data,
            totalPage: 1,
            page: 1
          })
        }
      })
    }else{
      usersModel.getUserList({
        page: page,
        pageSize: pageSize
      },function(err,data){
        if(err){
          res.render('weerror',err);
        }else{
          res.render('user-manages',{
            username: req.cookies.username,
            nickname: req.cookies.nickname,
            isAdmin: parseInt(req.cookies.isAdmin) ? '(管理员)' : '',
            userList: data.userList,
            totalPage: data.totalPage,
            page: data.page
          })
        }
      });
    }  
  }else{
    res.redirect('/login.html');
  }
})

//手机管理页面
router.get('/mobile-manages.html',function(req,res){
  if(req.cookies.username){
    res.render('mobile-manages');
  }else{
    res.redirect('/login.html');
  }
})
module.exports = router;









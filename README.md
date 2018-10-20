# 数据库表结构设计

### 用户表

- username  not null
- password  not null
- nickname  not null
- sex  default 0
- age  default ''
- phone default ''
- is_admin default  0 - 不是管理员 0 - 是管理员


# 登录

userModel.js 定义 login 的方法，查找数据库
.find({username: username, password: password}).count(err,num)

登录之后会跳转到首页，首页需要当前登录用户的用户名、是否是管理员

.find({username: username, password: password}).toArray(function(err,data){
    data 不为空数组，就说明可以登录
    data[0]{}
})

# 一般网站的实现
如果用户没有登录的话，不能看到首页或其他出了（登录、注册）的页面

？怎么判断用户在网站上是否登录

cookies  localstorage

用户在登录的时候，如果登录成功就将用户的一些信息写入 cookie 或者本地存储

其余需要验证用户是否登录的页面，就验证一下是否有cookie或者本地存储，有的话就正常显示，没有则回到登录页面。
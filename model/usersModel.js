//模块，是用来操作users相关的后台数据库处理的代码

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
const async = require('async');

const usersModel = {
    /**
     * 注册操作
     * @param {Object} data 注册信息
     * @param {Function} cb 回调函数
     */
    add(data,cb){
        MongoClient.connect(url,function(err,client){
            if(err){
                console.log('连接数据库失败',err);
                cb({ code : -100, msg : '连接数据库失败'});
                return;
            };
            const db = client.db('firstProject');


            //1. 对 data 里面的 isAdmin 修改为 is_admin
            //2. 写一个 _id 为1 下一个注册，先得到之前的用户表的记录条数，+1 操作之后写给下一个注册的人
            //3. 不允许用户名相同

            let saveData = {
                username : data.username,
                password : data.password,
                nickname : data.nickname,
                phone : data.phone,
                is_admin : data.isAdmin
            };


//==============以下是async的写法===================
            async.series([
                function(callback){
                    //查询是否已注册
                    db.collection('users').find({username: saveData.username}).count(function(err,num){
                        if(err){
                            callback({ code: -101, msg: '查询是否已注册失败' });
                        }else if(num !== 0){
                            console.log('用户已注册');
                            callback({ code: -102, msg: '用户已注册'});
                        }else{
                            console.log('当前用户可以注册');
                            callback(null);
                        }
                    });
                },
                function(callback){
                    //查询表的所有记录条数
                    db.collection('users').find().count(function(err,num){
                        if(err){
                            callback({ code: -101, msg: '查询所有记录条数失败' });
                        }else{
                            saveData._id = num + 1;
                            callback(null);
                        }
                    })
                },
                function(callback){
                    //写入数据库的操作
                    db.collection('users').insertOne(saveData,function(err){
                        if(err){
                            callback({ code: -101, msg: '写入数据库失败'});
                        }else{
                            console.log('注册成功');
                            callback(null);
                        }
                    })
                }
            ],function(err,results){
                //不管上面三步是否成功，都会进入最终的这个回调
                if(err){
                    console.log('上面三步操作可能出了问题',err);
                    //告诉前端错误的信息
                    cb(err);
                }else{
                    cb(null);
                }
                client.close();
            });

//=========================以下是回调地狱的写法==========================
            // db.collection('users').find({username : saveData.username}).count(function(err,num){
            //     if(err){
            //         cb({ code : -101, msg : '查询用户是否已注册失败'});
            //         client.close();
            //     }else if(num !== 0){
            //         console.log('用户已注册');
            //         cb({ code : -102, msg : '用户已注册'});
            //         client.close();
            //     }else{
            //         //自增操作
            //         console.log('用户没有注册，可以进行操作');
            //         db.collection('users').find().count(function(err,num){
            //             if(err){
            //                 console.log('查询用户记录条数失败');
            //                 cb({ code : -101, msg : '查询用户记录条数失败'});
            //                 client.close();
            //             }else{
            //                 saveData._id = num + 1;
            //                 db.collection('users').insertOne(saveData,function(err){
            //                     if(err){
            //                         cb({ code : -101, msg : '用户注册失败'});
            //                     }else{
            //                         console.log('用户注册成功');
            //                         cb(null);
            //                     }
            //                     client.close();
            //                 })
            //             }
            //         })
            //     }
            // })
        });
    },

    /**
     * 登录方法
     * @param {Object} data 登录信息 {username: '', password: ''}
     * @param {Function} cb 回调函数
     */
    login(data,cb){
        MongoClient.connect(url,function(err,client){
            if(err){
                cb({ code: -100, msg: '数据库连接失败'});
            }else{
                const db = client.db('firstProject');
                db.collection('users').find({
                    username: data.username,
                    password: data.password
                }).toArray(function(err,data){
                    if(err){
                        console.log('查询数据库失败');
                        cb({code: -101, msg: err});
                        client.close();
                    }else if(data.length <= 0){
                        //没有找到，用户不能登录
                        console.log('用户不能登录');
                        cb({code: -102, msg: '用户名或密码错误'});
                    }else{
                        console.log('用户可以登录');
                        //这里需要将用户名与是否是管理员这两个字段告诉前端
                        cb(null,{
                            username: data[0].username,
                            nickname: data[0].nickname,
                            isAdmin: data[0].is_admin
                        });
                    }
                    client.close();
                })
            }
        })
    },

    /**
     * 获取用户列表
     * @param {Object} data 页码信息与每页显示条数信息
     * @param {Function} cb 回调函数
     */
    getUserList(data,cb){
        MongoClient.connect(url,function(err,client){
            if(err){
                cb({ code: -100, msg: '连接数据库失败'});
            }else{
                var db = client.db('firstProject');
                var skipNum = data.page * data.pageSize - data.pageSize;
                var limitNum = parseInt(data.pageSize);
                async.parallel([
                    function(callback){
                        //查询所有记录
                        db.collection('users').find().count(function(err,num){
                            if(err){
                                callback({code: -101, msg: '查询数据库失败'});
                            }else{
                                callback(null,num);
                            }
                        })
                    },
                    function(callback){
                        //查询分页的数据
                        db.collection('users').find().limit(limitNum).skip(skipNum).toArray(function(err,data){
                            if(err){
                                callback({code: -101, msg: '查询数据库失败'});
                            }else{
                                callback(null,data);
                            }
                        });
                    }
                ],function(err,results){
                    if(err){
                        cb(err);
                    }else{
                        cb(null,{
                            totalPage: Math.ceil(results[0] / data.pageSize),
                            userList: results[1],
                            page: data.page
                        })
                    }
                    //关闭连接
                    client.close();
                })
            }
        })
    }
}
module.exports = usersModel;

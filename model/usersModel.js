//模块，是用来操作users相关的后台数据库处理的代码

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';

const usersModel = {
    /**
     * 注册操作
     * @param {object} data 注册信息
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


            db.collection('users').find({username : saveData.username}).count(function(err,num){
                if(err){
                    cb({ code : -101, msg : '查询用户是否已注册失败'});
                    client.close();
                }else if(num !== 0){
                    console.log('用户已注册');
                    cb({ code : -102, msg : '用户已注册'});
                    client.close();
                }else{
                    //自增操作
                    console.log('用户没有注册，可以进行操作');
                    db.collection('users').find().count(function(err,num){
                        if(err){
                            console.log('查询用户记录条数失败');
                            cb({ code : -101, msg : '查询用户记录条数失败'});
                            client.close();
                        }else{
                            saveData._id = num + 1;
                            db.collection('users').insertOne(saveData,function(err){
                                if(err){
                                    cb({ code : -101, msg : '用户注册失败'});
                                }else{
                                    console.log('用户注册成功');
                                    cb(null);
                                }
                                client.close();
                            })
                        }
                    })
                }
            })
        });
    }
}
module.exports = usersModel;

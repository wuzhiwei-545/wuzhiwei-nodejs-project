var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://127.0.0.1:27017';
//引入 multer 并设置好默认的一个缓存(tmp)目录
const multer = require('multer');
const upload = multer({
    dest: 'C:/tmp/'
})
const fs = require('fs');
const path = require('path');
const async = require('async');

//访问数据库初始化手机页面
router.get('/list',function(req,res){
    var page = parseInt(req.query.page);
    var pageSize = parseInt(req.query.pageSize);
    var totalPage = 0; //总页数
    MongoClient.connect(url,function(err,client){
        if(err){
            console.log('数据库连接失败');
            res.send({ code: -101, msg: '连接数据库失败' });
        }else{
            var db = client.db('firstProject');
            // 2 个异步操作
            async.parallel([
                function(callback){
                    db.collection('mobiles').find().count(function(err,num){
                        if(err){
                            callback({ code: -102, msg: '查询失败'});
                            console.log('查询失败');
                        }else{
                            totalPage = Math.ceil(num / pageSize);
                            callback(null);
                        }
                    })
                },
                function(callback){
                    //分页查询
                    db.collection('mobiles').find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function(err,data){
                        if(err){
                            callback({ code: -102, msg: '查询失败'});
                        }else{
                            callback(null,data);
                        }
                    })
                }
            ],function(err,results){
                if(err){
                    res.send(err);
                }else{
                    res.send({ code: 100, msg: '查询成功', data: {
                        list: results[1],
                        totalPage: totalPage
                    }});
                }
                client.close();
            })
        }
    })
})


//手机新增
router.post('/add',upload.single('mobileImg'),function(req,res){
    //这时候 req 上面就有一个 req.file 这个属性，这个属性是一个对象，对象里面就是我上传的这个文件的一些属性
    //并且 multer 还会把其余的一些 文本框或其余数据放到 req.body 里面
    // console.log(req.file);
    // console.log(req.body);

    //1. 需要将临时目录下的文件，移动到 public 里面的 mobiles 下面 fs
    // 1.1 读
    fs.readFile(req.file.path,function(err,data){
        if(err){
            console.log('读文件失败',err);
            res.send({ code: -1 , msg : '新增手机失败'});
        }else{
            //1.2 写
            // 为了解决文件名冲突的问题，可以怎么处理
            var fileName = new Date().getTime() + "_" + req.file.originalname
            var des_file = path.resolve(__dirname,'../public/mobiles',fileName);
            console.log(des_file);
            fs.writeFile(des_file,data,function(err){
                if(err){
                    console.log('写入失败',err);
                    res.send({ code: -1, msg: '新增手机失败'});
                }else{
                    console.log('写入成功');
                    //可以将数据写入数据库中
                    // 1
                    MongoClient.connect(url,function(err,client){
                        if(err){
                            console.log('连接数据库失败');
                            res.send({ code: -101, msg: '连接数据库失败'})
                        }else{
                            var db = client.db('firstProject');
                            var saveData = req.body;
                            saveData.fileName = fileName;//图片的文件名
                            db.collection('mobiles').insertOne(saveData,function(err){
                                if(err){
                                    console.log('插入数据库失败');
                                    res.send({ code: -102, msg: '插入数据库失败'});
                                }else{
                                    console.log('成功了');
                                    res.send({ code: 100, msg: '新增成功'});
                                }
                                client.close();
                            })
                        }
                    })
                }
            })
        }
    })
})

//删除手机
router.get('/delete',function(req,res){
    var fileName = req.query.fileName;
    MongoClient.connect(url,function(err,client){
        if(err){
            console.log('数据库连接失败');
            res.send({ code: -101, msg: '连接数据库失败' });
        }else{
            var db = client.db('firstProject');
            db.collection('mobiles').remove({fileName:fileName},function(err){
                if(err){
                    console.log('删除失败');
                    res.send({ code: -102, msg: '删除失败' });
                }else{
                    console.log('删除成功');
                    res.send({ code: 100, msg: '删除成功'});
                }
                client.close();
            })
        }
    })
})

//修改手机数据
router.post('/update',upload.single('mobileImg'),function(req,res){
    if(req.body.mobileImg == 'undefined'){
        MongoClient.connect(url,function(err,client){
            if(err){
                console.log('连接数据库失败');
                res.send({ code: -101, msg: '连接数据库失败'});
            }else{
                var db = client.db('firstProject');
                var saveData = req.body;
                console.log('11111111111', req.body)
                db.collection('mobiles').updateOne({fileName:saveData.oldImg},{$set:{
                    mobileName:saveData.mobileName,
                    brand:saveData.brand,
                    officialPrice:saveData.officialPrice,
                    secondPrice:saveData.secondPrice
                }},function(err){
                    if(err){
                        console.log('修改失败');
                        res.send({ code: -102, msg: '修改失败'});
                    }else{
                        console.log('成功了');
                        console.log('22222222222',saveData);
                        res.send({ code: 100, msg: '修改成功'});
                    }
                    client.close();
                })
            }
        })
    }else{
        fs.readFile(req.file.path,function(err,data){
            if(err){
                console.log('读文件失败',err);
                res.send({ code: -1 , msg : '删除失败'});
            }else{
                var fileName = new Date().getTime() + '_' + req.file.originalname;
                var des_file = path.resolve(__dirname,'../public/mobiles',fileName);
                fs.writeFile(des_file,data,function(err){
                    if(err){
                        console.log(err);
                        res.send({ code: -2 ,msg : '删除失败'});
                    }else{
                        console.log('写入成功');
                        MongoClient.connect(url,function(err,client){
                            if(err){
                                console.log('连接数据库失败');
                                res.send({ code: -101, msg: '连接数据库失败'});
                            }else{
                                var db = client.db('firstProject');
                                var saveData = req.body;
                                db.collection('mobiles').updateOne({fileName:saveData.oldImg},{$set:{
                                    mobileName:saveData.mobileName,
                                    brand:saveData.brand,
                                    officialPrice:saveData.officialPrice,
                                    secondPrice:saveData.secondPrice,
                                    fileName:fileName
                                }},function(err){
                                    if(err){
                                        console.log('修改失败');
                                        res.send({ code: -102, msg: '修改失败'});
                                    }else{
                                        console.log('成功了');
                                        console.log(saveData);
                                        res.send({ code: 100, msg: '修改成功'});
                                    }
                                    client.close();
                                })
                            }
                        })
                    }
                })
            }
        })
    }
})

module.exports = router;
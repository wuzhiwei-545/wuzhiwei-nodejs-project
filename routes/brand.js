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

//访问数据库初始化品牌管理页面
router.get('/list',function(req,res){
    var page = parseInt(req.query.page);
    var pageSize = parseInt(req.query.pageSize);
    var totalPage = 0; // 总页数
    MongoClient.connect(url,function(err,client){
        if(err){
            console.log('连接数据库失败');
            res.send({ code: -100, msg: '连接数据库失败 '});
        }else{
            var db = client.db('firstProject');
            // 2个异步操作
            async.parallel([
                function(callback){
                    db.collection('mobileLogos').find().count(function(err,num){
                        if(err){
                            console.log('查询失败');
                            callback({ code: -102, msg: '查询数据表失败' });
                        }else{
                            totalPage = Math.ceil(num / pageSize);
                            callback(null);
                        }
                    })
                },
                function(callback){
                    //分页查询
                    db.collection('mobileLogos').find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function(err,data){
                        if(err){
                            callback({ code: -102, msg: '查询数据表失败'});
                        }else{
                            callback(null,data);
                        }
                    })
                }
            ],function(err,results){
                if(err){
                    res.send(err);
                }else{
                    res.send({ code: 100, msg: '查询成功', data:{
                        list: results[1],
                        totalPage: totalPage
                    }});
                }
                client.close();
            })
        }
    })
})

//品牌新增
router.post('/add',upload.single('logoImg'),function(req,res){
    fs.readFile(req.file.path,function(err,data){
        if(err){
            console.log('读文件失败',err);
        }else{
            var logoImg = new Date().getTime() + "_" + req.file.originalname;
            var des_file = path.resolve(__dirname,'../public/mobiles',logoImg);
            console.log(des_file);
            fs.writeFile(des_file,data,function(err){
                if(err){
                    console.log('写入失败',err);
                    res.send({ code: -1, msg: '新增品牌失败' });
                }else{
                    console.log('写入成功');
                    MongoClient.connect(url,function(err,client){
                        if(err){
                            console.log('连接数据库失败');
                            res.send({ code: -101, msg: '连接数据库失败' });
                        }else{
                            var db = client.db('firstProject');
                            var saveDate = req.body;
                            saveDate.logoImg = logoImg;
                            db.collection('mobileLogos').insertOne(saveDate,function(err){
                                if(err){
                                    console.log('插入数据库失败');
                                    res.send({ code: -102, msg: '插入数据库失败' });
                                }else{
                                    console.log('成功了');
                                    res.send({ code: 100, msg: '新增成功' });
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

//品牌删除
router.get('/delete',function(req,res){
    var logoImg = req.query.logoImg;
    MongoClient.connect(url,function(err,client){
        if(err){
            console.log('数据库连接失败');
            res.send({ code: -101, msg: '数据库连接失败' });
        }else{
            var db = client.db('firstProject');
            db.collection('mobileLogos').remove({logoImg:logoImg},function(err){
                if(err){
                    console.log('删除失败');
                    res.send({ code: -102, msg: '删除失败' });
                }else{
                    console.log('删除成功')
                    res.send({ code: 100, msg: '删除成功' });
                }
                client.close();
            })
        }
    })
})

//品牌修改
router.post('/update',upload.single('logoImg'),function(req,res){
    var saveDate = req.body;
    if(req.body.logoImg == 'undefined'){
        MongoClient.connect(url,function(err,client){
            if(err){
                console.log('连接数据库失败');
                res.send({ code: -101, msg: '连接数据库失败' });
            }else{
                var db = client.db('firstProject');
                db.collection('mobileLogos').update({logoImg:saveDate.logo},{$set:{
                    brand: saveDate.brand
                }},function(err){
                    if(err){
                        console.log('修改失败');
                        res.send({ code: -102, msg: '修改失败' });
                    }else{
                        console.log('修改成功');
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
                res.send({ code: -1, msg: '修改失败' });
            }else{
                var fileName = new Date().getTime() + '_' + req.file.originalname;
                var des_file = path.resolve(__dirname,'../public/mobiles',fileName);
                fs.writeFile(des_file,data,function(err){
                    if(err){
                        console.log(err);
                        res.send({ code: -2, msg: '修改失败' });
                    }else{
                        console.log('写入文件成功');
                        MongoClient.connect(url,function(err,client){
                            if(err){
                                console.log('连接数据库失败');
                                res.send({ code: -101, msg: '连接数据库失败' });
                            }else{
                                var db = client.db('firstProject');
                                db.collection('mobileLogos').update({logoImg:saveDate.logo},{$set:{
                                    brand: saveDate.brand,
                                    logoImg: fileName
                                }},function(err){
                                    if(err){
                                        console.log('修改失败');
                                        res.send({ code: -102, msg: '修改失败' });
                                    }else{
                                        console.log('修改成功');
                                        res.send({ code: 100, msg: '修改成功' });
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
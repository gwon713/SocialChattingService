const fs = require('fs');
const express = require('express');
const engines = require('consolidate');
const path = require('path');
const app = express();
const router = express.Router();

const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: conf.host,
    user: conf.user,
    password: conf.password,
    port: conf.port,
    database: conf.database
})

app.set('views', path.join(__dirname, 'views'));

app.engine('html', engines.mustache);
app.set('view engine', 'html');

router.get("/:id/roomList", (req, res) => {
    res.render('roomList')
});

router.get("/:id/users", (req, res) => {
    res.render('users')
});

router.get("/:id/friends", (req, res) => {
    res.render('friends')
});

router.get("/:id/friendsReq", (req, res) => {
    res.render('friendsReq')
});

router.get("/:id/friendsList", (req, res) => {
    res.render('friendsList')
});




router.get("/:id/userList", (req, res) => {//유저 목록
    var sql = 'select * from user where not id in (select to_id from friendshipreq where from_id=?) and id !=?'
    // var sql = 'select * ,if(id=(select to_id from friendshipreq where ?=from_id and enable=1),"1","0") frdship from user where id !=?' //친구 버튼 활성화 비활성화
    var data =[req.params.id,req.params.id]
    console.log("유저 리스트 출력")
    connection.query(sql, data,(err, result) => {
        if (err)
            console.log("userList err:" +err);
        res.send(result);
    });
});

router.get("/:id/frdcount", (req, res) => {//친구 수 
    var sql = 'select COUNT(*) friend from user where id in (select to_id from friendshipreq where ?=from_id and enable=1)'
    var data =[req.params.id,req.params.id]
    console.log("친구수 얻기")
    connection.query(sql, data,(err, result) => {
        if (err)
            console.log("frdcount err:" +err);
        res.send(result);
    });
});

router.put("/:id/frdcntUpdate", (req, res) => {//친구 수 업데이트
    var sql = 'update user set friend = ? where id=?'
    var data =[req.body.friend,req.params.id]
    console.log("친구수 업데이트 ")
    connection.query(sql, data,(err, result) => {
        if (err)
            console.log("frdcntUpdate err:" +err);
        res.redirect();
    });
});

router.get("/:id/frdreqList", (req, res) => {//친구 신청 목록
    var sql = 'select * from user where id in (select from_id from friendshipreq where ?=to_id and enable=0)and id!=?'
    var data =[req.params.id,req.params.id]
    console.log("친구신청 리스트 출력")
    connection.query(sql, data,(err, result) => {
        if (err)
            console.log("frdreqList err:" +err);
        res.send(result);
    });
});

router.get("/:id/frdList", (req, res) => {//친구 목록
    var sql = 'select * from user where id in (select to_id from friendshipreq where ?=from_id and enable=1)and id!=?'
    var data =[req.params.id,req.params.id]
    console.log("친구목록 리스트 출력")
    connection.query(sql, data,(err, result) => {
        if (err)
            console.log("frdList err:" +err);
        res.send(result);
    });
});


router.post("/:id/frdreq", (req, res) => {//친구신청
    var sql = 'INSERT INTO friendshipreq VALUES (null,?,?,0)';
    var from_id = req.params.id;
    var to_id = req.body.frdreqBtn;
    var data = [from_id, to_id];
    connection.query(sql, data, function (err, result, fields) {
        console.log("친구신청 post");
        if (err) {
            console.log('frdreq err :' + err);
            return res.send(err);
        }
        res.redirect("/"+from_id+"/users");
    });
});


router.put("/:id/frdreqAcpt", (req, res) => {//친구 요청 수락
    var sql = 'update friendshipreq set enable = 1 where from_id=? and to_id=?';
    var from_id = req.body.AcceptBtn;
    var to_id = req.params.id;
    var data = [from_id, to_id];
    connection.query(sql, data, function (err, result, fields) {
        console.log("친구요청수락 put data : "+data);
        if (err) {
            console.log('frdreqAcpt err :' + err);
            return res.send(err);
        } 
        res.redirect();
    });
});


router.delete("/:id/frdreqAcpt", (req, res) => {//친구 요청 수락 하면 필요없는 요청 삭제하기
    var sql = 'delete from friendshipreq where from_id in (?,?) and to_id in (?,?)and enable = 0'
    var from_id = req.params.id;
    var to_id = req.body.AcceptBtn;
    var data = [from_id, to_id,from_id, to_id];
    connection.query(sql, data, function (err, result, fields) {
        console.log("친구요청수락 delete data : "+data);
        if (err) {
            console.log('frdreqAcpt err :' + err);
            return res.send(err);
        } 
        res.redirect();
    });
});


router.post("/:id/frdreqAcpt", (req, res) => {//친구 요청 수락  sql from_id to_id 바꿔서 집어넣기
    var sql = 'INSERT INTO friendshipreq VALUES (null,?,?,1)';
    var from_id = req.body.AcceptBtn;
    var to_id = req.params.id;
    var data = [to_id,from_id];
    connection.query(sql, data, function (err, result, fields) {
        console.log("친구요청수락 post data : "+data);
        if (err) {
            console.log('frdreqAcpt err :' + err);
            return res.send(err);
        } 
        res.redirect();
    });
});

router.delete("/:id/frdreqRef", (req, res) => {//친구 요청 거절
    var sql = 'delete from friendshipreq where from_id=? and to_id=?';
    var from_id = req.body.RefBtn;
    var to_id = req.params.id;
    var data = [from_id, to_id];
    connection.query(sql, data, function (err, result, fields) {
        console.log("친구요청거절 delete data : "+data);
        if (err) {
            console.log('frdreqRef err :' + err);
            return res.send(err);
        } 
        res.redirect();
    });
});

router.delete("/:id/frdDel", (req, res) => {//친구 삭제
    var sql = 'delete from friendshipreq where from_id in (?,?) and to_id in (?,?)';
    var from_id = req.params.id;
    var to_id = req.body.DelBtn;
    var data = [from_id, to_id,from_id, to_id];
    connection.query(sql, data, function (err, result, fields) {
        console.log("친구삭제 delete data : "+data);
        if (err) {
            console.log('frdDel err :' + err);
            return res.send(err);
        }
        res.redirect();
    });
});


module.exports = router;
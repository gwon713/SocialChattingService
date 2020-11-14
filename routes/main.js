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

router.get('/', (req,res)=>{
    res.render('login');
})

router.get("/login", (req, res) => {
    res.render('login')
});

router.get("/signUp", (req, res) => {
    res.render('signUp')
});

router.post('/login', (req, res) => {//login 요청
    var sql = 'select * from user where id=? and password=?';
    var user_id = req.body.id;
    var password = req.body.password;
    var data = [user_id, password];
    console.log(user_id, password);
    connection.query(sql, data, function (err, result, fields) {
        console.log('login data :' + data);
        console.log('login result :' + result);
        if (err) {
            res.send(err);
        } else {
            if (result.length > 0) {
                if (result[0].password == password) {
                    return res.redirect(user_id + '/roomList');
                } else {
                    return res.send("id,password 오류");
                }
            } else {
                return res.send("id,password 오류");
            }
        }
    });
});

router.post("/signUp", (req, res) => {//회원가입 요청
    var sql = 'insert into user values (null,?,?,now(),0)';
    var data = [req.body.id, req.body.password];
    if(req.body.id=="")
        data[0] = null;
    if(req.body.password=="")
        data[1] = null;
    connection.query(sql, data, function (err, result, fields) {
        if (err) {
            console.log(err);
            return res.send('<script type="text/javascript">alert("ID error"); window.location="/signUp";</script>');
        }
        if(result){
            console.log('signup data :' + data);
            console.log('signup result :' + result);
            return res.send('<script type="text/javascript">alert("SignUp Success"); window.location="/login";</script>');
        }else{
            return res.send('<script type="text/javascript">alert("error"); window.location="/signUp";</script>');
        }
    })
});

module.exports = router;
const fs = require('fs');
const express = require('express');
const engines = require('consolidate');
const path = require('path');
const app = express();
const router = express.Router();

const http = require('http').Server(app); 
const io = require('socket.io')(http);   

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


router.get("/:id/chatRoom1", (req, res) => {
    res.render('chatRoom')
});

router.get("/:id/chatRoom2", (req, res) => {
    res.render('chatRoom')
});

router.get("/:id/testchat", (req, res) => {
    res.render('testchat')
});

io.on('connection', function(socket){ 
  	console.log('user connected');  
  	io.to(socket.id).emit('create name');   
	io.emit('new_connect');
	
	socket.on('disconnect', function(){ 
	  console.log('user disconnected');
	  io.emit('new_disconnect');
	});

	socket.on('send message', function(text){ 
		var msg = text;
    	console.log(msg);
    	io.emit('receive message', msg);
	});
	
});

module.exports = router;
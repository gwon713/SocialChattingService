const fs = require('fs'); 
const engines = require('consolidate');
const express = require('express'); 
const bodyParser = require('body-parser'); 
const path = require('path');
const app = express(); 
const main = require('./routes/main');
const page = require('./routes/page');
const socket_route = require('./routes/socket');

const router = express.Router();
const port = process.env.PORT || 5000; 

const http = require('http');
const socket = require('socket.io');
const server = http.createServer(app);//express http 서버
const io = socket(server);

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false})); 

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.engine('html', engines.mustache);
app.set('view engine', 'html');

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
connection.connect((err) => {
  if(err){
    console.log(err)
  }else{
    console.log("MySQL Connect")
  }
});  //mysql 연동

app.use(router);
app.use(main);
app.use(page);
app.use(socket_route);

app.listen(port, () => console.log(`Listening on port ${port}`));
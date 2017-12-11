const express = require("express");
const app = express();
app.use(express.static(__dirname));

var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket){
    console.log('a user connected');

    // recieve eye-tracker position
    socket.on('eyemove', function(x, y){
        io.emit('eyemove', x, y);
    });

    // recieve swiping event
    socket.on('swipe', function(dir){
        console.log('swipe' + dir);
        io.emit('swipe', dir);
    });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

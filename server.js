var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

server.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});


var players = []
io.on("connection", (socket) => {
  
  socket.on("button pressed", (id, beep, pitch) => {
    var exists = false
    for (let play of players) {
      if (play.id == id) {
        play.pitch = pitch
        play.beep = beep
        exists = true
      }
    }
    if(exists == false) {
      players.push({
        id: id,
        index: players.length,
        beep: beep,
        pitch: pitch
      })
      socket.index = players.length
    }
    
    socket.broadcast.emit("start beep", players, id);
  })
  
  socket.on("button released", id => {
    socket.broadcast.emit("end beep", id, socket.index);
  })
  
})
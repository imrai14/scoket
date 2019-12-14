var WebSocketServer = require("ws").Server,
    express = require("express"),
    http = require("http"),
    app = express(),
    server = http.createServer(app)
	
	
	
server.listen(3001, () => {
 console.log("Server running on port 3001");

});

var wss = new WebSocketServer({server: server});

wss.on("connection", function(ws){
   // ...
});
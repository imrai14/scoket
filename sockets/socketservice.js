// Node.js WebSocket server script
const http = require('http');
const cors = require('cors')
const express = require('express');
const WebSocketServer = require('websocket').server;
const bodyParser = require('body-parser')
const randomlocation = require('random-location');
const axios = require('axios')

const url = require('url');
var app = express();
app.use(cors())
const server = http.Server(app);

server.listen(9898, () => {
    console.log("Server running on port 9898");

});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({"limit":"100mb"} ));

const wsServer = new WebSocketServer({
    httpServer: server
});
var connection;
wsServer.on('request', function (request) {

    console.log("connected")
    connection = request.accept(null, request.origin);
    count = 0;
    connection.on('message', function (message) {
        console.log('Received Message:', message.utf8Data);
        const readline = require('readline');

    });

    connection.on('close', function (reasonCode, description) {
        console.log('Client has disconnected.');
    });


    var stdin = process.openStdin();

    stdin.addListener("data", function (d) {
        // note:  d is an object, and when converted to a string it will
        // end with a linefeed.  so we (rather crudely) account for that  
        // with toString() and then trim() 
        console.log("you sent:" +
            d.toString().trim());
        connection.sendUTF(d.toString().trim());
    });
});
temperaturestate = 'minToMax';
var interval;
// server.on('request',(req,res)=>{
app.get('/dispatch', (req, res) => {

    startTime = new Date();
    temperature = 10.0;
    count = 100;
    destinationReached = false;

    startCoordinate = {
        latitude: 37.7768006,
        longitude: -122.4187928
    }

    interval = setInterval(() => {
        dispatch(temperature, startCoordinate);
        const R = 500 // meters           
        startCoordinate = randomlocation.randomCirclePoint(startCoordinate, R);
        temperature = calculateTemperature(temperature);

    }, 2000);
    res.write('<h1>Voila</h1><br /><br />This api was called ' + req.url);
    res.end();
});


app.get('/pealandpackage', (req, res) => {
    if(interval !== undefined){
        clearInterval(interval);
    }
    connection.send(JSON.stringify({ "workflow": "Peel" }));
    res.end();

});

app.get('/package', (req, res) => {
    connection.send(JSON.stringify({ "Packets":200 , "Packet Quantity": 200,"Source": "Silkboard","Destination":"Siemens Kalwa Works", "workflow": "Package" }));
    res.end();
});

var virusAffected = {
    workflow:"fda",
    "startingFarm" : {"latitude":24.879999 , "longitude":74.629997},
    "citieswithinfectedFarm":10,
    "packagessold":2000,
    "packageavaialble":1500,
    "virus":"Zika",
    "infectionSite": {latitude:28.440554,longitude:74.493011},
    "shops" : 
    [
        {shop: "Store 1",latitude: 16.994444, longitude:73.300003,sold: 200,contact:98861098947},
        {shop: "Store 2",latitude: 19.155001,longitude:72.849998,sold: 200,contact:98861098947},
        {shop: "Store 5",latitude: 28.610001,longitude:77.230003,sold: 200,contact:98861098947},
        {shop: "Store 6",latitude: 19.07609,longitude:72.877426,sold: 200,contact:98861098947},
        {shop: "Store 7",latitude: 14.16704,longitude:75.040298,sold: 200,contact:98861098947},
        {shop: "Store 8",latitude: 26.540457,longitude:88.719391,sold: 200,contact:98861098947},
        {shop: "Store 9",latitude: 24.633568,longitude:87.849251,sold: 200,contact:98861098947},
    
    ]
}

app.post('/fda', (req, res) => {

    connection.send(JSON.stringify(virusAffected));
    res.end();

});

app.post('/customer', (req, res) => {

    connection.send(JSON.stringify(req.body));
    res.end();

});

app.post('/scanmango', (req, res) => {
    // console.log(JSON.stringify(req.body))
     //var base64Data="iVBORw0KGgoAAAANSUhEUgAAAuAAAACFCAIAAACVGtqeAAAAA3NCSVQICAjb4U/gAAAAGXRFWHRTb2Z0d2FyZQBnbm9tZS1zY3JlZW5zaG907wO/PgAAIABJREFUeJzsnXc81d8fx9+fe695rYwIaa"
     var base64Data = JSON.parse(JSON.stringify(req.body))
     //console.log("string is:" + base64Data.str)
     require("fs").writeFile("C:/Users/Z003YYZA/Desktop/F&B/Deployment_images/mangoimage.jpg", base64Data.str, 'base64', function (err) {
         console.log("Error:" + err);
     });
     return res.send({message:"OK"}); 
 ;
 
 });
 
 app.post('/scanspectroimage', (req, res) => {
     //console.log(JSON.stringify(req.body))
     var base64Data = JSON.parse(JSON.stringify(req.body))
    // console.log("string is:" + base64Data.str)
     require("fs").writeFile("C:/Users/Z003YYZA/Desktop/F&B/Deployment_images/spectrograph.jpg", base64Data.str, 'base64', function (err) {
         console.log("Error:" + err);
     });
     return res.send({message:"OK"}); 
 ;
 });

function calculateTemperature(temperature) {
    if (temperature == 24)
        temperaturestate = 'maxToMin';
    else if (temperature == 9)
        temperaturestate = 'minToMax';

    if (temperaturestate == 'MaxToMin')
        return --temperature;
     return ++temperature;

 
     

}

function dispatch(temperature, startCoordinate) {
    let dispatchData = {}
    dispatchData['workflow'] = 'Dispatch';
    dispatchData['coordinates'] = startCoordinate;
    dispatchData['temperatureStatus'] = callPython(temperature);
    dispatchData['temperature'] = temperature;
    dispatchData['destinationReached'] = destinationReached;

    connection.send(JSON.stringify(dispatchData));
}

function callPython(temperature) {
 
console.log(temperature);
    axios.post('https://172.20.10.3/status', {
        temp: temperature
      })
      .then((res) => {
        console.log(`statusCode: ${res.statusCode}`)
        console.log(res);
        return res;
      })
      .catch((error) => {
        console.error(error)
        return "Error reaching anamoly";
      })
     // return res;
}

app.get('/updateUI', (req, res) => {
    console.log(req.body);
    const P = {
        latitude: 37.7768006,
        longitude: -122.4187928
    }

    const R = 500 // meters

    const randomPoint = randomlocation.randomCirclePoint(P, R);
    console.log(randomPoint);
    res.write('<h1>Voila</h1><br /><br />This api was called ' + req.url);

    res.end();
});

app.post('/updateUI', (req, res) => {
    console.log(req.body);
    console.log('post');
    connection.send(JSON.stringify(req.body));
    res.end();

    // const reqUrl=url.parse(req.url,true);   
    //         console.log(req.query.message);
    //         res.write('<h1>Voila</h1><br /><br />This api was called ' + req.url);
    //         res.end();    
});

app.get('/clearsocketdata', (req, res)=>{
    connection.send(JSON.stringify({"workflow": "Refresh"}));
    return res.send({message:"OK"});
})

app.get('/storepackage', (req, res)=>{
    connection.send(JSON.stringify({"workflow": "StorePackage"}));
    return res.send({message:"OK"});
})

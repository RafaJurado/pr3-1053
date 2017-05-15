const application_root=__dirname,
    express = require("express"),
    path = require("path"),
    bodyparser=require("body-parser");

const db=require('./myStorage');
const controller=require('./controller.js');

var app = express();
app.use(express.static(path.join(application_root,"public")));
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

//REPOSITORIO GIT PRACTICA 3///////////////////

//https://github.com/RafaJurado/pr3-1053.git

///////////////////////////////////////////////

// **USO**
// en consola ejecutar node myServer.js
//una vez funciona, en un navegador ir a url:
// http://localhost:puerto/servicio

//Cross-domain headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.listen(8080, function () {
  console.log("the server is running!");
});

var DB=new myDB('./data');

app.get('/',function(req,res){
    res.sendFile("public/index.html",{root:application_root});
});

app.get('/dataset',function(req,res){
    res.send({result: DB.getDatasets()});
});

app.get('/dataset/:name',function(req,res){
    var n = (req.query.n == null) ? 10 : parseInt(req.query.n);
    DB.getLastObjects(req.params.name,n,function(data){
        res.send(data);
    })
});

app.get('/stream', function(req,res){
    controller.getStreams(function(data){
      res.send(data);
    });
});

//devuelve la lista de polaridad de los tuits de un stream
app.get('/stream/:name/polaridad', function(req,res){
    var name = req.params.name;//recoge nombre stream
    controller.getPolarity(name,function(data){
      res.send(data);
    });
});
//recoge las top palabras mas usadas de los tuits del stream
app.get('/stream/:name/words', function(req,res){
    //el parametro es top --> /stream/:name/words?top=20
    var topWords = (req.query.top == null) ? 1 : parseInt(req.query.top);
    controller.getWords(req.params.name,topWords,function(data){
        res.send(data);
    });
})

app.get('/stream/:name/geo', function(req, res){
    var geoTuits = req.params.name;
    controller.getGeo(req.params.name,function(data){
        res.send(data);
    })
})
//Dado el nombre de un stream y un número natural n>0, devuelve los id_str de los
//últimos n tweets del stream según el formato que se indica en la tabla 1.
app.get('/stream/:name/id', function(req, res){
    var numIds = (req.query.n == null) ? 1 : parseInt(req.query.n);
    controller.getIds(req.params.name,numIds,function(data){
        res.send(data);
    });
})

app.post('/stream/', function(req,res){
    var name = req.body.name;
    var track = req.body.track;
    controller.createStream(name, track, function(data){
        res.send(data);
    });
});
/*

*/
app.get('/stream/graph', function(req,res){
  controller.getGraph(function(data){
    res.send(data);
  })
})
//Levanta el servidor cuando la BD este lista
db.warmupEmmitter.once("warmup",() => {
   console.log("Web server running on port 8000");
   app.listen(8000);
});

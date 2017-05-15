var db=require('./myStorage'),
    DB=new myDB('./data'),
    util=require('util'),//para la salida por pantalla de objetos complejos
    str=require('./myStream'),
    stream=new str.StreamManager();

//importar mongoose para el uso de la api de mongodb en mongolab
//npm install --save mongoose
const	mng=require('mongoose');
const	my_conn_data="mongodb://al286335:lalala1234@ds133981.mlab.com:33981/mydb"


//dado que necesitamos acceder al schema tanto desde la creacion de stream como
// desde la funcion graph, creamos una variable global que nos devuelva el Schema
//porque no tiene sentido crear dos veces el mismo objeto con el mismo contenido
var	itemSchema	=	new	mng.Schema({
              "@context": String,
              "@type": String,
              "agent": {
                "@type": String,
                "name": String
              },
              "startTime": Date,
              "@id": String,
              "identifier": String,
              "query": String
});
//esta es la variable global, necesitamos tener el schema de mongoose definido antes
const	ItemModel	=	mng.model('Item',	itemSchema);


//devuelve una lista [nombreStream, numerDeTuits] ordenada por numero de tuis
function getStreams(callback){
  var datasets = DB.getDatasetCount();
  var streams = [];
  for (var clave in datasets){
    streams.push([clave, datasets[clave]]);
  }
  //especificamos a la funcion sort que ordene por los valores
  streams.sort(function (a, b) {
    if (a[1] < b[1]) {
      return 1;
    }
    if (a[1] > b[1]) {
      return -1;
    }
    // a debe ser igual que b
    return 0;
  });
  callback({result:streams});
}


function getPolarity(name, callback){

  DB.getLastObjects(name,100,function(data, name){
    var pos = 0;
    var neg = 0;
    var neu = 0;
    var lista = data.result;
    for (var t of lista){
      var pol = t.polarity;
      //console.log(pol);
      if (pol<0){neg++;}
      else if (pol>0) {pos++;}
      else {neu++;}

    }
    callback({result:{"positive":pos,"negative":neg,"neutral":neu}});
    //console.log(data);
  });
  //DB.insertObject(name,{'id_str':id,'coordinates':coor,'text':text,'polarity':polarity})
  //para que sea asincrono
  //callback de objeto json
}

function getWords(name, top, callback){
  DB.getLastObjects(name,50,function(data){
    var textList = data.result;
    var text = "";
    var wordMap = {};
    textList.forEach(function (word) {
     text = text+word.text+" ";
    });
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#special-word-boundary
    var wordList = text.split(/\b/);
    //filtra aquellos grupos de caracteres de la lista que sean palabras
    //asi es posible eliminar espacios, comas y puntos de la lista
    //ademas normalizamos todas las palabras a minuscula
    //https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/map
    wordList = wordList.filter(isWord).map(toLowerCase);

    //ahora tenemos una lista de palabras limpia, la recorremos para crear el
    //diccionario cuya clave seran las palabras y valor las veces que aparece
    //https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Sentencias/for...of
    wordList.forEach(function(word){
      if (!wordMap.hasOwnProperty(word)){
        wordMap[word] = 0;
      }
      wordMap[word]++;

      //console.log("wordmap["+word+"] = "+wordMap[word]);
    });

    //una vez construido el diccionario, hemos de convertirlo a una lista
    //de parejas [clave, valor] y ordenarla
    var finalWordList = [];
    for (var clave in wordMap){
      finalWordList.push([clave, wordMap[clave]*2]);
    }
    //especificamos a la funcion sort que ordene por los valores
    finalWordList.sort(function (a, b) {
      if (a[1] < b[1]) {
        return 1;
      }
      if (a[1] > b[1]) {
        return -1;
      }
      // a debe ser igual que b
      return 0;
    });
    finalWordList = finalWordList.slice(0,top);
    //console.log(finalWordList);
    callback( { result: finalWordList } );
  });
}
//devuelve true si candidate es una palabra
function isWord(candidate) {
  return /\w+/.test(candidate);
}
//pasa una palabra a minusculas
function toLowerCase(word) {
  return word.toLowerCase();
}

function getGeo(name, callback){

  DB.getLastObjects(name,100,function(data){
    var tuits = data.result;
    var lista = {};
    tuits.forEach(function (tuit) {
      var id = tuit.id_str;
     var c = tuit.coordinates;
     if (c != null){
       lista[id]=c.coordinates;
     }
    });
    callback({result:lista});

  });
}

function getIds(name, n, callback){
  DB.getLastObjects(name,n,function(data){
    var tuits = data.result;
    var listId = [];
    tuits.forEach(function (tuit){
      listId.push(tuit.id_str);
    });
    callback({result:listId});
  });
}

function createStream(name, track, callback){
  var cacaEnorme=  {
      "@context": "http://schema.org",
      "@type": "SearchAction",
      "agent": {
        "@type": "Person",
        "name": "Persona"
      },
      "startTime": Date.now(),
      "@id": "./data/"+name+".data",
      "identifier": name,
      "query": track
    };
  stream.addStream(name, cacaEnorme);
  //agregado para mongoose
  //	Creamos	la	conexión	con	mLab

  mng.connect(my_conn_data);

  //	Creamos	el	esquema	(los	esquemas	suelen	estar	definidos	en	módulos	aparte)
  //	Usamos	los	tipos	predefinidos	de	Mongoose:	String,	Boolean,	Date,	etc.

  // var	itemSchema	=	new	mng.Schema({
  //               "@context": String,
  //               "@type": String,
  //               "agent": {
  //                 "@type": String,
  //                 "name": String
  //               },
  //               "startTime": Date,
  //               "@id": String,
  //               "identifier": String,
  //               "query": String
  // });

  //	Creamos	la	colección	de	datos	(el	nombre	de	la	colección	en	mlab	será	items)

  //var	ItemModel	=	mng.model('Item',	itemSchema);

  //	Creamos	un	dato	para	la	colección	items
  var	midato	=	new	ItemModel(cacaEnorme);

  //	Guardamos	el	dato	en	mLab

  midato.save(function(err){
  						if	(err)	throw	err;
  						console.log("Guardado!");

  						//ahora	consultamos	el	dato	guardado,	simplemente	para	ilustrar	una	consulta
  						ItemModel.findOne({name:name},	function(err	,	dato){
  											if	(err)	throw	err;
  											console.log(dato);
  											mng.connection.close();	//	cerramos	la	conexión,	si	no,	no	termina
  						});
  });
  //fin agregado
  callback({result:"success"});
}


function getGraph(callback){
  //las promesas se utilizan para no bloquear el sistema mientras se piden los datos
  //la lista de promesas se ira completando y hasta que no se complete, no se envia

  //DB.datasets devuelve una lista con los nombres de los datasets o streams
  // var promesas = DB.datasets.map(
  //   function(name){
  //     return new Promise( (resolve, reject)=> {
  //       DB.getDatasetInfo(name, function(data){
  //       resolve(data.result);
  //       });
  //     });
  //   });
  //
  // Promise.all(promesas).then(
  //   (values)=>{
  //     callback({"@context":"http://schema.org",
  //               "@graph":values});
  // });
  mng.connect(my_conn_data);
  ItemModel.find(function (err, cosas) {
    if (err) return console.error(err);
    console.log(cosas);
    callback({"@context":"http://schema.org",
                "@graph":cosas});
  })
}
//aqui maprearemos los nombres de los datasets a promesas en una lista


//exports de funciones
exports.getStreams = getStreams;
exports.getPolarity = getPolarity;
exports.getWords = getWords;
exports.getGeo = getGeo;
exports.getIds = getIds;
exports.createStream = createStream;
exports.getGraph = getGraph;

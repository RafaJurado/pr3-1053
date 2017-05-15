const Twitter = require('twitter');
//const myCreds = require('./credentials/my-credential.json');
const DataSet = require('./myStorage.js');


const client = new Twitter(myCreds);
const sentiment = require('sentiment-spanish');
var DB=new myDB('./data');
class StreamManager {
    constructor(){
      this.streams={}//diccionario de streams
    };

    addStream(name,jsonld){//agrega streams al diccionario
      //var stream = client.stream('statuses/filter', {track: track,locations:"36.4924397,-9.2456858,43.3213238,3.1983902"});
      //var cosas = generateLD(name, track);
      var stream = client.stream('statuses/filter', {track: jsonld.query});
      this.streams[name]=stream;
      DB.createDataset(name, jsonld)
      stream.on('data', function(tweet) {
        //filter lang here?
        var text = tweet.text;
        var coor = tweet.coordinates;
        var id = tweet.id_str;
        var polarity = sentiment(tweet.text).score;
        DB.insertObject(name,{'id_str':id,'coordinates':coor,'text':text,'polarity':polarity});
        //console.log(name+" "+text+" -Coord: "+coor+" -id_str:"+id);
        //console.log(sentiment(tweet.text).score);
      });

      stream.on('error', function(err){
        console.log(err);
      });
    }

    deleteStream(name){
      //setTimeout(()=>{stream.destroy()},20000);
    }


}


exports.StreamManager = StreamManager;

// var myStream = new StreamManager();
// //myStream.addStream("coches", "opel,mercedes,bmw");
// //myStream.deleteStream("coches");
// myStream.addStream("motos", "yamaha,bmw");
// myStream.deleteStream("motos");
// //myStream.addStream("camiones", "mercedes,pegaso");
// //myStream.deleteStream("camiones");

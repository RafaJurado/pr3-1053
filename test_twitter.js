const Twitter = require('twitter')
const myCreds = require('./credentials/my-credential.json');

const client = new Twitter(myCreds);
const sentiment = require('sentiment-spanish');

var stream = client.stream('statuses/filter', {track: 'opel,mercedes,bmw'});

stream.on('data', function(tweet) {
  //filter lang here?
  console.log(tweet.text);
  console.log(sentiment(tweet.text).score);
});

stream.on('error', function(err){
  console.log(err);
});

setTimeout(()=>{stream.destroy()},10000);

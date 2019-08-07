// Send a request to the Heroku app to wake up the dyno in
// anticip...pation of the user navigating there.
// The response is ignored.
function wakeUpHeroku() {
  var xmlHttp = new XMLHttpRequest();
  // xmlHttp.open("POST", "http://www.audalai.com/graphql?reason=prefetch", true);
  xmlHttp.open("POST", "http://audalai.herokuapp.com/graphql?reason=prefetch", true);
  xmlHttp.send(null);
}

wakeUpHeroku();

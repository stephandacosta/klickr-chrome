/* ------------------------------------------------------------------------------------*/
/* HELPER FUNCTIONS
/* ------------------------------------------------------------------------------------*/

var helpers = {};
window.helpers = helpers;

/* Parses a URL into its components */
helpers.parseUrl = function(url){
  var params = {};
  var parser = document.createElement('a');
  params.href      = parser.href = url;
  params.protocol  = parser.protocol; // => "http:"
  params.host      = parser.host;     // => "example.com:3000"
  params.hostname  = parser.hostname; // => "example.com"
  params.port      = parser.port;     // => "3000"
  params.pathname  = parser.pathname; // => "/pathname/"
  params.hash      = parser.hash;     // => "#hash"
  params.search    = parser.search;   // => "?search=test"
  params.query     = {};              // => "{search: test, foo: bar}"

  // split query into pairs
  var query = params.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    params.query[pair[0]] = pair[1];
  }

  return params;
};

/* Sends message to last focused tab */
helpers.activeTabSendMessage = function(message, responseCallback) {
  responseCallback = responseCallback || function(){};

  chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message, responseCallback);
  });
};

/* Sends message to all tabs */
helpers.sendMessage = function (message, responseCallback){
  responseCallback = responseCallback || function(){};

  chrome.tabs.query({}, function(tabs) {
    for (var i = 0; i < tabs.length; i++){
      chrome.tabs.sendMessage(tabs[i].id, message, responseCallback);
    }
  });
};

/* Bind function to context */
helpers.bind = function(fn, context){
  return function(){
    return fn.apply(context, arguments);
  };
};
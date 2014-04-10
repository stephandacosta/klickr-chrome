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

helpers.activeTabSendMessage = function (message, responseCallback) {
  responseCallback = responseCallback || (function (response) { console.log(response); });

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message, responseCallback);
  });
};

helpers.consolidateKlickObjects = function (arrayOfKlicks) {
  var len = arrayOfKlicks.length;
  if (len === 0) {
    return {};
  } else if (len === 1) {
    return arrayOfKlicks[0];
  } else {
    var newTicks = [];
    for (var i = 0; i < arrayOfKlicks.length; i += 1) {
      newTicks = newTicks.concat(arrayOfKlicks[i].ticks);
    }

    var result = {
      width: arrayOfKlicks[0].width,
      height: arrayOfKlicks[0].height,
      description: arrayOfKlicks[0].description,
      ticks: newTicks
    };

    return result;
  }
};
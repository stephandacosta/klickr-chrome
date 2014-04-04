/* ------------------------------------------------------------------------------------*/
/* RECORDER
/* - Content script that records mouse movements and sends data to server
/* - Exists on a page, has access to DOM elements, but not to window object
/* - Communicates with background using events
/* TODO: Send click, url, width, height
/* ------------------------------------------------------------------------------------*/

/* ------------------------------------------------------------------------------------*/
/* Recorder Class
/* Records a klick and sends to server
/* ------------------------------------------------------------------------------------*/
var Recorder = function(){
  console.log('Initializing recorder...');
  this.server = "http://127.0.0.1:4568";
  this.rate = 100;
  this.mousePos = undefined;
  this.isRecording = false;

  // Create empty klick
  this.klick = this.createKlick();

  // Add listners
  this.addListeners();

  // Keep track of cursor positions
  // (cursor positions are logged using setInterval to prevent excessive logging)
  var self = this;
  window.onmousemove = function(event){
    self.mouseMove.apply(self, event);
  };
};

window.Recorder = Recorder;

/* Gets URL from Background */
Recorder.prototype.getUrl = function(){

};

/* Add other event listeners */
Recorder.prototype.addListeners = function(){
  var self = this;
  $('html').click(function(event){
    self.log(event.type, event.pageX, event.pageY, event.timeStamp, event.target.outerHTML, undefined, event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
  });
  $('html').keypress(function(event){
    console.log('Keypress', event);
    var charCode = event.which || event.keyCode;
    self.log(event.type, event.pageX, event.pageY, event.timeStamp, event.target.outerHTML, charCode, event.altKey, event.ctrlKey, event.metaKey, event.shiftKey);
  });
};

/* Creates a new Klick */
Recorder.prototype.createKlick = function(){
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    ticks: []
  };
};

/* Records cursor positions */
Recorder.prototype.mouseMove = function(event) {
  event = event || window.event; // IE
  this.mousePos = {
    x: event.pageX,
    y: event.pageY
  };
};

/* Logs to output */
Recorder.prototype.log = function(action, x, y, timestamp, target, charCode, altKey, ctrlKey, metaKey, shiftKey){
  if (mousePos){
  action = action || 'move';
  x = x || this.mousePos.x;
  y = y || this.mousePos.y;
  timestamp = timestamp || Date.now();
  this.klick.ticks.push({
    action: action,
    x: x,
    y: y,
    timestamp: timestamp,
    target: target,
    charCode: charCode,
    altKey: altKey,
    ctrlKey: ctrlKey,
    metaKey: metaKey,
    shiftKey: shiftKey
  });
  }
};

/* Start recording */
Recorder.prototype.start = function(){
  console.log('Recorder: Started');
  if (!this.isRecording){
    var self = this;
    this.isRecording = true;
    timer = setInterval(function(){
      self.log();
    }, this.rate);
  }
};

/* Stop recording */
Recorder.prototype.stop = function(){
  console.log('Recorder: Stopped');
  if (this.isRecording){
    this.isRecording = false;
    clearInterval(timer);
    this.send(this.klick);
    this.klick = this.createKlick();
  }
};

/* Send output to server */
Recorder.prototype.send = function(klick){
  console.log('Recorder: Push to server...', JSON.stringify(klick));
  jQuery.ajax({
    type: 'POST',
    url: this.server + '/klicks',
    data: JSON.stringify(klick),
    contentType: 'application/json',
    success: function(data) {
      console.log('Recorder: Klick sent', data);
    },
    error: function(data){
      console.log('Recorder: Klick send failed', data);
    }
  });
};

/* ------------------------------------------------------------------------------------*/
/* Init
/* ------------------------------------------------------------------------------------*/

$(function(){

  // Helper for routing actions
  var recorder = new Recorder();

// moves mouse to given destination with duration
  var move = function (endX, endY, duration){
    d3.selectAll('.mouse')
    .transition()
    .duration(duration)
    .style({'top':  endY + 'px', 'left': endX + 'px'});
  };

  // chains mouse moves together
  var processData = function(arr, index, xScale, yScale){
    index = index || 0;
    xScale = xScale || 1;
    yScale = yScale || 1;
    if ( index === arr.length ) {
      return;
    } else {
      move(arr[index].x,arr[index].y,arr[index].t );
      setTimeout(function(){
        processData(arr, index+1);
      }, arr[index].t );
    }
  };

  //test data *** need to be cleared out ******
  var test=
  {
    "width": 1148,
    "height": 618,
    "ticks": [
      {
        "action": "move",
        "x": 1076,
        "y": 0,
        "timestamp": 1396638369535
      },
      {
        "action": "move",
        "x": 909,
        "y": 109,
        "timestamp": 1396638369635
      },
      {
        "action": "move",
        "x": 909,
        "y": 109,
        "timestamp": 1396638369736
      },
      {
        "action": "move",
        "x": 909,
        "y": 109,
        "timestamp": 1396638369837
      },
      {
        "action": "move",
        "x": 909,
        "y": 109,
        "timestamp": 1396638369938
      },
      {
        "action": "move",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370039
      },
      {
        "action": "move",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370140
      },
      {
        "action": "move",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370240
      },
      {
        "action": "keypress",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370326,
        "target": "<input id=\"gbqfq\" class=\"gbqfif\" name=\"q\" type=\"text\" autocomplete=\"off\" value=\"\" dir=\"ltr\" spellcheck=\"false\" style=\"border: none; padding: 0px; margin: -0.0625em 0px 0px; height: 1.25em; width: 100%; background-image: url(data:image\/gif;base64,R0lGODlhAQABAID\/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw%3D%3D); background-color: transparent; position: absolute; z-index: 6; left: 0px; outline: none; background-position: initial initial; background-repeat: initial initial;\">",
        "charCode": 97,
        "altKey": false,
        "ctrlKey": false,
        "metaKey": false,
        "shiftKey": false
      },
      {
        "action": "move",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370344
      },
      {
        "action": "keypress",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370354,
        "target": "<input id=\"gbqfq\" class=\"gbqfif\" name=\"q\" type=\"text\" autocomplete=\"off\" value=\"\" dir=\"ltr\" spellcheck=\"false\" style=\"border: none; padding: 0px; margin: -0.0625em 0px 0px; height: 1.25em; width: 100%; background-image: url(data:image\/gif;base64,R0lGODlhAQABAID\/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw%3D%3D); background-color: transparent; position: absolute; z-index: 6; left: 0px; outline: none; background-position: initial initial; background-repeat: initial initial;\">",
        "charCode": 100,
        "altKey": false,
        "ctrlKey": false,
        "metaKey": false,
        "shiftKey": false
      },
      {
        "action": "keypress",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370426,
        "target": "<input id=\"gbqfq\" class=\"gbqfif\" name=\"q\" type=\"text\" autocomplete=\"off\" value=\"\" dir=\"ltr\" spellcheck=\"false\" style=\"border: none; padding: 0px; margin: -0.0625em 0px 0px; height: 1.25em; width: 100%; background-image: url(data:image\/gif;base64,R0lGODlhAQABAID\/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw%3D%3D); background-color: transparent; position: absolute; z-index: 6; left: 0px; outline: none; background-position: initial initial; background-repeat: initial initial;\">",
        "charCode": 102,
        "altKey": false,
        "ctrlKey": false,
        "metaKey": false,
        "shiftKey": false
      },
      {
        "action": "move",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370445
      },
      {
        "action": "keypress",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370507,
        "target": "<input id=\"gbqfq\" class=\"gbqfif\" name=\"q\" type=\"text\" autocomplete=\"off\" value=\"\" dir=\"ltr\" spellcheck=\"false\" style=\"border: none; padding: 0px; margin: -0.0625em 0px 0px; height: 1.25em; width: 100%; background-image: url(data:image\/gif;base64,R0lGODlhAQABAID\/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw%3D%3D); background-color: transparent; position: absolute; z-index: 6; left: 0px; outline: none; background-position: initial initial; background-repeat: initial initial;\">",
        "charCode": 97,
        "altKey": false,
        "ctrlKey": false,
        "metaKey": false,
        "shiftKey": false
      },
      {
        "action": "move",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370546
      },
      {
        "action": "keypress",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370563,
        "target": "<input id=\"gbqfq\" class=\"gbqfif\" name=\"q\" type=\"text\" autocomplete=\"off\" value=\"\" dir=\"ltr\" spellcheck=\"false\" style=\"border: none; padding: 0px; margin: -0.0625em 0px 0px; height: 1.25em; width: 100%; background-image: url(data:image\/gif;base64,R0lGODlhAQABAID\/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw%3D%3D); background-color: transparent; position: absolute; z-index: 6; left: 0px; outline: none; background-position: initial initial; background-repeat: initial initial;\">",
        "charCode": 108,
        "altKey": false,
        "ctrlKey": false,
        "metaKey": false,
        "shiftKey": false
      },
      {
        "action": "keypress",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370579,
        "target": "<input id=\"gbqfq\" class=\"gbqfif\" name=\"q\" type=\"text\" autocomplete=\"off\" value=\"\" dir=\"ltr\" spellcheck=\"false\" style=\"border: none; padding: 0px; margin: -0.0625em 0px 0px; height: 1.25em; width: 100%; background-image: url(data:image\/gif;base64,R0lGODlhAQABAID\/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw%3D%3D); background-color: transparent; position: absolute; z-index: 6; left: 0px; outline: none; background-position: initial initial; background-repeat: initial initial;\">",
        "charCode": 100,
        "altKey": false,
        "ctrlKey": false,
        "metaKey": false,
        "shiftKey": false
      },
      {
        "action": "keypress",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370644,
        "target": "<input id=\"gbqfq\" class=\"gbqfif\" name=\"q\" type=\"text\" autocomplete=\"off\" value=\"\" dir=\"ltr\" spellcheck=\"false\" style=\"border: none; padding: 0px; margin: -0.0625em 0px 0px; height: 1.25em; width: 100%; background-image: url(data:image\/gif;base64,R0lGODlhAQABAID\/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw%3D%3D); background-color: transparent; position: absolute; z-index: 6; left: 0px; outline: none; background-position: initial initial; background-repeat: initial initial;\">",
        "charCode": 102,
        "altKey": false,
        "ctrlKey": false,
        "metaKey": false,
        "shiftKey": false
      },
      {
        "action": "move",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370657
      },
      {
        "action": "keypress",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370691,
        "target": "<input id=\"gbqfq\" class=\"gbqfif\" name=\"q\" type=\"text\" autocomplete=\"off\" value=\"\" dir=\"ltr\" spellcheck=\"false\" style=\"border: none; padding: 0px; margin: -0.0625em 0px 0px; height: 1.25em; width: 100%; background-image: url(data:image\/gif;base64,R0lGODlhAQABAID\/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw%3D%3D); background-color: transparent; position: absolute; z-index: 6; left: 0px; outline: none; background-position: initial initial; background-repeat: initial initial;\">",
        "charCode": 107,
        "altKey": false,
        "ctrlKey": false,
        "metaKey": false,
        "shiftKey": false
      },
      {
        "action": "move",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370757
      },
      {
        "action": "keypress",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370819,
        "target": "<input id=\"gbqfq\" class=\"gbqfif\" name=\"q\" type=\"text\" autocomplete=\"off\" value=\"\" dir=\"ltr\" spellcheck=\"false\" style=\"border: none; padding: 0px; margin: -0.0625em 0px 0px; height: 1.25em; width: 100%; background-image: url(data:image\/gif;base64,R0lGODlhAQABAID\/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw%3D%3D); background-color: transparent; position: absolute; z-index: 6; left: 0px; outline: none; background-position: initial initial; background-repeat: initial initial;\">",
        "charCode": 106,
        "altKey": false,
        "ctrlKey": false,
        "metaKey": false,
        "shiftKey": false
      },
      {
        "action": "move",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370858
      },
      {
        "action": "keypress",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370956,
        "target": "<input id=\"gbqfq\" class=\"gbqfif\" name=\"q\" type=\"text\" autocomplete=\"off\" value=\"\" dir=\"ltr\" spellcheck=\"false\" style=\"border: none; padding: 0px; margin: -0.0625em 0px 0px; height: 1.25em; width: 100%; background-image: url(data:image\/gif;base64,R0lGODlhAQABAID\/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw%3D%3D); background-color: transparent; position: absolute; z-index: 6; left: 0px; outline: none; background-position: initial initial; background-repeat: initial initial;\">",
        "charCode": 102,
        "altKey": false,
        "ctrlKey": false,
        "metaKey": false,
        "shiftKey": false
      },
      {
        "action": "move",
        "x": 909,
        "y": 109,
        "timestamp": 1396638370961
      },
      {
        "action": "move",
        "x": 909,
        "y": 109,
        "timestamp": 1396638371064
      },
      {
        "action": "move",
        "x": 909,
        "y": 109,
        "timestamp": 1396638371164
      },
      {
        "action": "move",
        "x": 909,
        "y": 109,
        "timestamp": 1396638371265
      },
      {
        "action": "move",
        "x": 909,
        "y": 109,
        "timestamp": 1396638371371
      },
      {
        "action": "move",
        "x": 909,
        "y": 109,
        "timestamp": 1396638371471
      },
      {
        "action": "move",
        "x": 857,
        "y": 263,
        "timestamp": 1396638371572
      },
      {
        "action": "move",
        "x": 848,
        "y": 298,
        "timestamp": 1396638371672
      },
      {
        "action": "move",
        "x": 850,
        "y": 298,
        "timestamp": 1396638371773
      },
      {
        "action": "move",
        "x": 859,
        "y": 295,
        "timestamp": 1396638371887
      },
      {
        "action": "move",
        "x": 865,
        "y": 277,
        "timestamp": 1396638371989
      },
      {
        "action": "click",
        "x": 866,
        "y": 277,
        "timestamp": 1396638372000,
        "target": "<div id=\"rcnt\" style=\"clear:both;position:relative;zoom:1\"><div data-jibp=\"h\" data-jiis=\"uc\" id=\"gko-srp-sp\" style=\"\"><\/div><div id=\"er\" style=\"display: none;\"><\/div><div class=\"col\" style=\"width:0\"><div data-jibp=\"h\" data-jiis=\"uc\" id=\"leftnavc\" style=\"\"><\/div><\/div><div class=\"col\" style=\"width:0\"><div id=\"center_col\" style=\"padding-top: 0px; visibility: visible;\"><div data-jibp=\"h\" data-jiis=\"uc\" id=\"taw\" style=\"margin-right: 0px;\"><div><\/div><div style=\"padding:0 8px\"><div class=\"med\"><p class=\"sp_cnt _l\"><span class=\"spell\">Showing results for<\/span> <a class=\"spell\" href=\"\/search?biw=1148&amp;bih=618&amp;q=a+sldfkj&amp;spell=1&amp;sa=X&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;ved=0CCQQvwUoAA\"><b><i>a sldfkj<\/i><\/b><\/a><br><span class=\"spell_orig\">No results found for <b>adfaldfkjf<\/b><\/span> <br><\/p><hr class=\"rgsep\" style=\"margin-top:22px\"><\/div><\/div><div id=\"tvcap\"><\/div><\/div><div class=\"med\" id=\"res\" role=\"main\"><div data-jibp=\"h\" data-jiis=\"uc\" id=\"topstuff\" style=\"\"><\/div><div data-jibp=\"h\" data-jiis=\"uc\" id=\"search\" style=\"\"><style>.crl{color:#777;cursor:pointer;display:inline-block}.crl:hover{color:#222}.cri{display:none !important}.crp{color:#444;z-index:3;width:350px;margin-left:-160px;margin-top:3px;background:#fff;border:1px solid #d6d6d6;-webkit-box-shadow:0px 2px 4px #d6d6d6;-moz-box-shadow:0px 2px 4px #d6d6d6;box-shadow:0 2px 4px #d6d6d6;padding:16px;-webkit-border-radius:2px;-moz-border-radius:2px;border-radius:2px;white-space:normal;position:absolute}.crp .crt{position:initial;max-width:40px;max-height:40px;margin-right:10px;border:0px}.crc{display:inline-block;position:relative;margin-left:4px}.crc .cr-load{display:none}.crc .yp.yl .cr-load{display:block}.cr-dwn-arw{border-color:#aaa transparent !important;border-style:solid;border-width:4px 4px 0px 4px;width:0;height:0;top:50%;position:absolute;margin-left:6px;margin-top:-3px}.crl:hover .cr-dwn-arw{border-color:#222 transparent !important}.crp table{margin-bottom:6px}.crp .cr-summary{margin-bottom:4px}.crp .cr-debug{color:red}.crp .cr-hdr{margin-top:12px;font-weight:bold;margin-bottom:2px}.cr-wikicite{color:#777 !important;font-size:11px;text-decoration:none}.cr-wikicite:hover{text-decoration:underline}.cr-quote{margin-top:15px;margin-bottom:15px;color:#666}.cr-quote-first a{font-weight:bold}.cr-quote a{color:#777 !important;text-decoration:none}.cr-quote a:hover{text-decoration:underline}.cr-summary b{font-weight:normal}.cr-sitename{font-size:15px;font-weight:bold}.cr-award,.cr-nomination,.cr-owner,.cr-date{font-weight:normal;margin-top:5px}.cr-sitetype{color:#777;font-weight:normal;margin-top:1px}.cr-misc{margin-top:15px}.cr-l-debug{color:red;cursor:pointer}.cr-sep{margin-left:13px}a.cr-owner:link,a.cr-owner:visited{color:#2518b5;text-decoration:none}a.cr-owner:hover{color:#2518b5;text-decoration:underline}._bi{margin-bottom:20px}._uG .gl a:visited{color:#1e0fbe}._gM{display:-moz-inline-box;display:inline-block;text-align:center;vertical-align:top;margin-bottom:6px}.ri_of,.ri_iur,.iri{}.ri_of{opacity:0.4}._gM img{vertical-align:bottom}.ri_iur .bili{text-align:center}.ri_iur .bili .iri{display:inline-block;margin:4px 0 6px}.rhstc4 ._Uj .rhsg4,.rhstc3 ._Uj .rhsg4,.rhstc3 ._Uj .rhsg3{background:inherit !important;display:inherit !important;visibility:hidden}.rhstc5 ._Uj .rhsl5,.rhstc5 ._Uj .rhsl4,.rhstc4 ._Uj .rhsl4{background:inherit !important;display:inherit !important;visibility:hidden}.kno-cdta .kno-ibrg._Jl._Uj .img-brk{visibility:inherit}.kno-cdta.xpdclose .kno-ibrg._Jl{max-height:inherit}.kno-cdta ._uf{display:none}.kno-mrg .kno-ibrg{float:left}.kno-mrg-hnm .kno-ibrg{float:inherit}.kno-mrg-hnm .kno-ibrg{display:block}#iur .kno-ibrg{display:block}.img-brk{}.img-brk{display:block;overflow:hidden}._uf a.fl{display:inline-block;padding:5px 8px 7px}._uf{bottom:1px;letter-spacing:1px;padding:0;position:absolute;right:0}.kno-mrg ._uf a.fl,#iur ._uf a.fl{color:#fff;font-size:16px;text-decoration:none}._uf:hover{background:#000}#iur ._uf{bottom:2px;margin-bottom:0px}.kno-fb-on ._uf{display:none}._uf{background:#000000;background:rgba(0,0,0,0.4);-webkit-transition:all 0.2s ease-in-out}.kno-mrg ._uf a.fl,#iur ._uf a.fl{text-shadow:0 0 2px black,0 0 3px black}.birrg{font-size:13px;overflow:hidden}.rg_ul{white-space:normal}.img-kc-m,.bi-io{}.bili{vertical-align:top;display:inline-block;margin-top:0;margin-right:6px;margin-bottom:6px;margin-left:0;overflow:hidden;position:relative}.bicc{line-height:0;overflow:hidden;position:relative}._xi{margin-right:1px;margin-bottom:1px;float:left}.kno-mrg-si ._xi,._xi._TQ{margin:0 0 1px 0}._xi a img{border:0}._xi div img{border:0}.kno-mrg-si ._xi{margin-bottom:0px}._xD{margin-right:2px;margin-bottom:2px}.xpdclps .kno-mrg-si ._xi{margin:0}.bia{display:block;position:absolute}.img-kc-m{position:absolute}.kno-mrg-hnm .img-kc-m{position:relative}.kno-mrg .bili div.krable{height:1em;margin:3px}.rg_il,.rg_ilbg{bottom:0;color:#fff;font-size:11px;line-height:100%;position:absolute;right:0;padding:3px 4px 5px;text-decoration:none}.rg_ilbg{background:#333}.rg_ilbg{background:rgba(51,51,51,0.8)}.bi-io{border-bottom:1px solid #FFF;border-left:1px solid #FFF;right:0;top:0;z-index:1}._tD{bottom:0;position:absolute;width:100%}._uD{background-image:-webkit-linear-gradient(top,rgba(0,0,0,0),rgba(0,0,0,0.75));color:#CCC;font-size:13px;height:13px;line-height:13px;padding:7px 10px;text-align:right;text-shadow:0 0 4px rgba(0,0,0,0.2)}.bili .rg_meta{display:none}._GJ{height:30px;position:absolute;right:0;top:0;width:31px}._HJ{position:relative}._ct{height:31px;position:absolute;right:0;top:0;width:30px}._ct{background:rgba(0,0,0,0.4)}._Sy{cursor:pointer;filter:alpha(opacity=100);height:21px;opacity:1.0;padding:5px;position:absolute;right:0;top:0;-webkit-transition:all 0.2s ease-in-out;width:20px}._Sy:hover{background:black}<\/style><!--a--><h2 class=\"hd\">Search Results<\/h2><div data-async-econtext=\"query:a%20sldfkj\" data-async-context=\"query:a%20sldfkj\" id=\"ires\"><ol eid=\"nAI_U5SUKeqGyAGvt4H4BQ\" id=\"rso\"><div class=\"srg\"><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"40\"><h3 class=\"r\"><a href=\"http:\/\/www.tumblr.com\/tagged\/a%3Bsldfkj\" onmousedown=\"return rwt(this,'','','','1','AFQjCNHCfG0YdoVpxUsGiFkbdkDOlv0M-g','G9rdCB-vIUrZwHSAW_dXTA','0CCkQFjAA','','',event)\"><em>a;sldfkj<\/em> on Tumblr<\/a><\/h3><div class=\"s\"><div><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">www.tumblr.com\/tagged\/a%3Bsldfkj<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b0\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CCoQ7B0wAA\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CCsQqR8wAA\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\"><a class=\"fl\" href=\"http:\/\/webcache.googleusercontent.com\/search?q=cache:JjLKCJlNy1kJ:www.tumblr.com\/tagged\/a%253Bsldfkj+&amp;cd=1&amp;hl=en&amp;ct=clnk&amp;gl=us\" onmousedown=\"return rwt(this,'','','','1','AFQjCNHZ3EanadapptRx2V5V8MfmUtLm5A','_XYhwdJK38y74vLrzHKLZA','0CCwQIDAA','','',event)\">Cached<\/a><\/li><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CC0Q5hkwAA\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CC4Q5xkwAA\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><\/div><div class=\"f slp\"><\/div><span class=\"st\">Find and follow posts tagged <em>a;sldfkj<\/em> on Tumblr. ... #me#idek#<em>a;sldfkj<\/em> \u00b7 2 notes. Want to see more posts tagged #<em>a;sldfkj<\/em>? Sign up for Tumblr. Quantcast.<\/span><\/div><\/div><\/div><!--n--><\/li><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"47\"><h3 class=\"r\"><a href=\"http:\/\/www.youtube.com\/watch?v=b16HvVwCWBQ\" onmousedown=\"return rwt(this,'','','','2','AFQjCNHVVFMFWfaXXkQmSPuasl_DZM6Z-w','YlTaF0TcIAkMnN6Y9HdjBA','0CDAQtwIwAQ','','',event)\"><em>a;sldfkj<\/em>;alskdjf;ak - YouTube<\/a><\/h3><div class=\"s\"><div><div class=\"th _nj _kN\" style=\"height:65px;width:116px\"><a href=\"http:\/\/www.youtube.com\/watch?v=b16HvVwCWBQ\" onmousedown=\"return rwt(this,'','','','2','AFQjCNHVVFMFWfaXXkQmSPuasl_DZM6Z-w','YlTaF0TcIAkMnN6Y9HdjBA','0CDEQuAIwAQ','','',event)\"><span class=\"_vA\" style=\"top:-11px\"><img height=\"87\" id=\"vidthumb2\" src=\"data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQAAAQABAAD\/2wBDAAoHBwgHBgoICAgLCgoL\u2026E\/wDdc+KD\/wC0tLHzNdK7\/ib61sS21NZsio8jYoZd8e031rnmLZySfjRgVpnrK4PWspkn\/9k=\" width=\"116\" border=\"0\"><\/span><span class=\"vdur _Hm _wA\">\u25ba&nbsp;1:31<\/span><span class=\"vdur _Hm _cu\">\u25ba&nbsp;1:31<\/span><\/a><\/div><\/div><div style=\"margin-left:125px\"><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">www.youtube.com\/watch?v...<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b1\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CDIQ7B0wAQ\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CDMQqR8wAQ\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CDQQ5hkwAQ\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CDUQ5xkwAQ\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><div class=\"crc\"><div class=\"crl\" data-async-econtext=\"ri:;site:youtube.com\" data-async-context=\"ri:;site:youtube.com\" data-async-trigger=\"cra-1\" jsaction=\"crd.tglpop\" data-ved=\"0CDYQ5CswAQ\">YouTube<span class=\"cr-dwn-arw\"><\/span><\/div><div class=\"cri y yp ys\" jsaction=\"crd.popclk\" id=\"cra-1\" data-async-type=\"cra\" data-async-context-required=\"site,ri\"><div class=\"filled\" id=\"cra-1-filled\"><\/div><div class=\"cr-load preload\">Loading...<\/div><\/div><\/div><\/div><div class=\"f slp\">Aug 8, 2008 - Uploaded by codyarchuletatube<\/div><span class=\"st\"><em>a;sldfkj<\/em>;alskdjf;ak. codyarchuletatube\u00b728 videos .... <em>sldfkj<\/em> by heatherpether 2,385 views; 0:08. Watch Later ...<\/span><\/div><div style=\"clear:left\"><\/div><\/div><\/div><!--n--><\/li><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"55\"><h3 class=\"r\"><a href=\"http:\/\/www.youtube.com\/watch?v=QlOFnE33YC8\" onmousedown=\"return rwt(this,'','','','3','AFQjCNGcYUVIz10R8DI95zeXkOXfwvlJ5Q','Li2DOfw7Oc0SeG7NEXzSlA','0CDgQtwIwAg','','',event)\"><em>sldfkj<\/em> - YouTube<\/a><\/h3><div class=\"s\"><div><div class=\"th _nj _kN\" style=\"height:65px;width:116px\"><a href=\"http:\/\/www.youtube.com\/watch?v=QlOFnE33YC8\" onmousedown=\"return rwt(this,'','','','3','AFQjCNGcYUVIz10R8DI95zeXkOXfwvlJ5Q','Li2DOfw7Oc0SeG7NEXzSlA','0CDkQuAIwAg','','',event)\"><span class=\"_vA\" style=\"top:-11px\"><img height=\"87\" id=\"vidthumb3\" src=\"data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQAAAQABAAD\/2wBDAAoHBwgHBgoICAgLCgoL\u2026Pbt\/ipckMW\/Plpn\/1FcEMXH4Sdf5RRKCFvJIiCfJObPTv3\/6pUa5t4BjEMY5\/lFKr6IJN0f\/Z\" width=\"116\" border=\"0\"><\/span><span class=\"vdur _Hm _wA\">\u25ba&nbsp;0:10<\/span><span class=\"vdur _Hm _cu\">\u25ba&nbsp;0:10<\/span><\/a><\/div><\/div><div style=\"margin-left:125px\"><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">www.youtube.com\/watch?v...<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b2\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CDoQ7B0wAg\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CDsQqR8wAg\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CDwQ5hkwAg\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CD0Q5xkwAg\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><div class=\"crc\"><div class=\"crl\" data-async-econtext=\"ri:;site:youtube.com\" data-async-context=\"ri:;site:youtube.com\" data-async-trigger=\"cra-2\" jsaction=\"crd.tglpop\" data-ved=\"0CD4Q5CswAg\">YouTube<span class=\"cr-dwn-arw\"><\/span><\/div><div class=\"cri y yp ys\" jsaction=\"crd.popclk\" id=\"cra-2\" data-async-type=\"cra\" data-async-context-required=\"site,ri\"><div class=\"filled\" id=\"cra-2-filled\"><\/div><div class=\"cr-load preload\">Loading...<\/div><\/div><\/div><\/div><div class=\"f slp\">Jul 12, 2006 - Uploaded by heatherpether<\/div><span class=\"st\"><em>sldfkj<\/em> by carolynechristine 209 views \u00b7 2:29. Watch Later <em>sldfkj<\/em> by Corie987 146 views \u00b7 0:30. Watch Later ...<\/span><\/div><div style=\"clear:left\"><\/div><\/div><\/div><!--n--><\/li><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"63\"><h3 class=\"r\"><a href=\"http:\/\/quizlet.com\/22910946\/53-asldfkj-flash-cards\/\" onmousedown=\"return rwt(this,'','','','4','AFQjCNGHxvRHUP1GyEDMQaF3qUUji4lhxg','iEdcdVViIfAllEtgxt0gWA','0CEAQFjAD','','',event)\">5\/3 <em>a;sldfkj<\/em> flashcards | Quizlet<\/a><\/h3><div class=\"s\"><div><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">quizlet.com\/22910946\/53-asldfkj-flash-cards\/<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b3\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CEEQ7B0wAw\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CEIQqR8wAw\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\"><a class=\"fl\" href=\"http:\/\/webcache.googleusercontent.com\/search?q=cache:2FvUGNRCYP8J:quizlet.c\u20262910946\/53-asldfkj-flash-cards\/+&amp;cd=4&amp;hl=en&amp;ct=clnk&amp;gl=us\" onmousedown=\"return rwt(this,'','','','4','AFQjCNG0aGtDQBKFyB1b9eKhCzvPPvc67w','KunHeUs6b3MHsCTAg7ua4w','0CEMQIDAD','','',event)\">Cached<\/a><\/li><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CEQQ5hkwAw\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CEUQ5xkwAw\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><div class=\"crc\"><div class=\"crl\" data-async-econtext=\"ri:;site:quizlet.com\" data-async-context=\"ri:;site:quizlet.com\" data-async-trigger=\"cra-3\" jsaction=\"crd.tglpop\" data-ved=\"0CEYQ5CswAw\">Quizlet<span class=\"cr-dwn-arw\"><\/span><\/div><div class=\"cri y yp ys\" jsaction=\"crd.popclk\" id=\"cra-3\" data-async-type=\"cra\" data-async-context-required=\"site,ri\"><div class=\"filled\" id=\"cra-3-filled\"><\/div><div class=\"cr-load preload\">Loading...<\/div><\/div><\/div><\/div><div class=\"f slp\"><\/div><span class=\"st\">Vocabulary words for as;ldfkj. Includes studying games and tools such as flashcards.<\/span><\/div><\/div><\/div><!--n--><\/li><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"71\"><h3 class=\"r\"><a href=\"http:\/\/bitchesbecrazay.blogspot.com\/2011\/01\/asldfkj.html\" onmousedown=\"return rwt(this,'','','','5','AFQjCNEncF0ad46GjR-CiGX4eZuhi8ieVQ','NvDxEXsfcJPNL-oHQ5Y7PQ','0CEgQFjAE','','',event)\">im boring.: <em>a;sldfkj<\/em><\/a><\/h3><div class=\"s\"><div><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">bitchesbecrazay.blogspot.com\/2011\/01\/asldfkj.html<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b4\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CEkQ7B0wBA\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CEoQqR8wBA\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\"><a class=\"fl\" href=\"http:\/\/webcache.googleusercontent.com\/search?q=cache:bwJ0TiTHinQJ:bitchesbe\u2026ogspot.com\/2011\/01\/asldfkj.html+&amp;cd=5&amp;hl=en&amp;ct=clnk&amp;gl=us\" onmousedown=\"return rwt(this,'','','','5','AFQjCNH594FZJxUiioMiQ_3STI_lc9LpsA','BfNoqtyY7n7xIdsV_iCmow','0CEsQIDAE','','',event)\">Cached<\/a><\/li><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CEwQ5hkwBA\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CE0Q5xkwBA\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><\/div><div class=\"f slp\"><\/div><span class=\"st\"><span class=\"f\">Jan 7, 2011 - <\/span><em>a;sldfkj<\/em>. i woke up and realized that i was still a little tipsy. and realized that i.had.<wbr>no.food. who the fuck do i think i am? i kind of sat in bed for a&nbsp;...<\/span><\/div><\/div><\/div><!--n--><\/li><\/div><hr class=\"rgsep\"><li class=\"g\" id=\"imagebox_bigimages\"><div class=\"_bi _Pb\"><a href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;tbm=isch&amp;tbo=u&amp;source=univ&amp;sa=X&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;ved=0CFAQsAQ\">Images for <em>a sldfkj<\/em><\/a><span class=\"_uG bl\"><span class=\"gl\" id=\"irl_r\"><a href=\"javascript:;\" jsaction=\"riu.r\" id=\"irl_r_a\">Report images<\/a><\/span><span id=\"irl_t\" style=\"display:none\">Thank you for the feedback.<\/span><span class=\"gl\" id=\"irl_m\" style=\"display:none\">&nbsp;<a href=\"javascript:;\" jsaction=\"riu.r\" id=\"irl_m_a\">Report another image<\/a><\/span><span id=\"irl_p\" style=\"display:none\">Please report the offensive image.<\/span><span class=\"gl\" id=\"irl_c\" style=\"display:none\">&nbsp;<a href=\"javascript:;\" jsaction=\"riu.c\" id=\"irl_c_a\">Cancel<\/a><\/span><span class=\"gl\" id=\"irl_d\" style=\"display:none\"><a href=\"javascript:;\" jsaction=\"riu.d\" id=\"irl_d_a\">Done<\/a><\/span><\/span><\/div><div class=\"rg_r\" id=\"iur\" style=\"margin-top:3px\"><div jsl=\"$ue bind('t-W2rDs_51QkE',{__tag:true});$t t-W2rDs_51QkE;\" style=\"display:none\" class=\"r-search1\"><\/div><div class=\"_Uj kno-ibrg\"><div class=\"img-brk\"><div class=\"birrg\" style=\"margin-right:-3px\"><ul class=\"rg_ul\"><!--m--><li class=\"_xD bili uh_r\" style=\"width:83px\"><div style=\"height:90px;width:83px\" class=\"bicc\"><a jsl=\"$ue bind('t-c8vu0GbqXuM',{__tag:true});$t t-c8vu0GbqXuM;$rj;\" data-rtid=\"search2\" jsaction=\"r.3corYLRu5kg\" class=\"r-search2 bia uh_rl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;tbm=isch&amp;imgil=OYVs5v_TvB0XrM%253A%253Bhttps%253A%252F%252Fencrypted-tbn0.gstatic.com%252Fimages%253Fq%253Dtbn%253AANd9GcRuQkOmloRICtTMqKVxY6Fs1NI5Xeqn5AR3-7Xcx-2THQpgX-nd%253B467%253B444%253BpoQVczMfS4DKaM%253Bhttp%25253A%25252F%25252Fwww.scoop.it%25252Ft%25252Fsecondlife-fashion%25252Fp%25252F3996279890%2525\u2026ouVnp0X9E3s%3D&amp;sa=X&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;ved=0CFMQ9QEwBQ\" id=\"OYVs5v_TvB0XrM:\" style=\"height:90px;margin-left:0px;margin-right:0px;margin-top:0px;width:83px\" tag=\"bia\"><img class=\"th\" height=\"90\" name=\"imgthumb6\" src=\"data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQAAAQABAAD\/2wCEAAkGBwgHBgkIBwgKCgkL\u2026Vq8HT52fIccZXP5muf8YXJlv44cbkXV7k\/wCKM96b8A24Cpg7qg3KnzurqieaVQ1UqzP\/2Q==\" style=\"margin-top:0px;margin-right:-9px;margin-bottom:0;margin-left:-3px\" title=\"http:\/\/www.scoop.it\/t\/secondlife-fashion\/p\/3996279890\/2013\/02\/09\/new-blacklace-and-a-sldfkj\" width=\"95\" align=\"middle\" alt=\"\" border=\"0\"><\/a><\/div><div class=\"rg_meta\">{\"os\":\"75KB\",\"ou\":\"http:\/\/img.scoop.it\/Dywj04qCY_FGmaJCNXnW6jl72eJkfbmt4t8yenImKBVvK0kTmF0xjctABnaLJIm9\",\"rh\":\"scoop.it\",\"ow\":467,\"th\":94,\"id\":\"OYVs5v_TvB0XrM:\",\"cr\":15,\"s\":\"New @Blacklace and \\u003cb\\u003ea\\u003c\\\/b\\u003e;\\u003cb\\u003esldfkj\\u003c\\\/b\\u003e | Second Life Fashi...\",\"tu\":\"https:\/\/encrypted-tbn0.gstatic.com\/images?q\\u003dtbn:ANd9GcQ_veXI8ZkfEuNQcDmFBCJENIkb0YI84J6OB8BbUiGI2voNXFj7jS9_Hg\",\"tw\":99,\"cl\":6,\"ru\":\"http:\/\/www.scoop.it\/t\/secondlife-fashion\/p\/3996279890\/2013\/02\/09\/new-blacklace-and-a-sldfkj\",\"oh\":444}<\/div><\/li><!--n--><!--m--><li class=\"_xD bili uh_r\" style=\"width:80px\"><div style=\"height:90px;width:80px\" class=\"bicc\"><a jsl=\"$ue bind('t-c8vu0GbqXuM',{__tag:true});$t t-c8vu0GbqXuM;$rj;\" data-rtid=\"search3\" jsaction=\"r.3corYLRu5kg\" class=\"r-search3 bia uh_rl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;tbm=isch&amp;imgil=3lxyQzQenwUGBM%253A%253Bhttps%253A%252F%252Fencrypted-tbn2.gstatic.com%252Fimages%253Fq%253Dtbn%253AANd9GcT9pKAzxlHzTp9gBY7oMqsFDN6yhfLAGy52AVckTPAexQJbwD1tUw%253B180%253B180%253BVVvoILJU0yfdCM%253Bhttp%25253A%25252F%25252Fwww.wayn.com%25252Fprofiles%25252Fmamon_mealex&amp;source=iu&amp;usg=__mnID\u20268xACihxnwas%3D&amp;sa=X&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;ved=0CFUQ9QEwBg\" id=\"3lxyQzQenwUGBM:\" style=\"height:90px;margin-left:0px;margin-right:0px;margin-top:0px;width:80px\" tag=\"bia\"><img class=\"th\" height=\"90\" name=\"imgthumb7\" src=\"data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQAAAQABAAD\/2wCEAAkGBwgHBgkIBwgKCgkL\u2026UaJHn0rYU5YN3RmgDxelTNL\/438xrhc3AsUtDou0QRp0\/XYHwJpfs+bzT9VWpNNrFYR\/\/2Q==\" style=\"margin-top:0px;margin-right:-7px;margin-bottom:0;margin-left:-3px\" title=\"http:\/\/www.wayn.com\/profiles\/mamon_mealex\" width=\"90\" align=\"middle\" alt=\"\" border=\"0\"><div class=\"rg_ilbg\"><span>3 days ago<\/span><\/div><\/a><\/div><div class=\"rg_meta\">{\"os\":\"12KB\",\"cb\":6,\"ou\":\"http:\/\/pictures.wayn.com\/photos\/180c\/002783915_459600029.jpg\",\"rh\":\"wayn.com\",\"ow\":180,\"ct\":9,\"th\":90,\"id\":\"3lxyQzQenwUGBM:\",\"cr\":12,\"s\":\"\\u003cb\\u003eA\\u003c\\\/b\\u003e;\\u003cb\\u003esldfkj\\u003c\\\/b\\u003e; As;ldfkj from Hinche, Haiti - WAYN.\",\"tu\":\"https:\/\/encrypted-tbn2.gstatic.com\/images?q\\u003dtbn:ANd9GcQdyXbN1aH8cPAmdT3xdS7y560ljDsG9Rjveh2ip44pSVtF_flBj2OS0tw\",\"tw\":90,\"cl\":6,\"ru\":\"http:\/\/www.wayn.com\/profiles\/mamon_mealex\",\"oh\":180}<\/div><\/li><!--n--><!--m--><li class=\"_xD bili uh_r\" style=\"width:120px\"><div style=\"height:90px;width:120px\" class=\"bicc\"><a jsl=\"$ue bind('t-c8vu0GbqXuM',{__tag:true});$t t-c8vu0GbqXuM;$rj;\" data-rtid=\"search4\" jsaction=\"r.3corYLRu5kg\" class=\"r-search4 bia uh_rl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;tbm=isch&amp;imgil=QNCMkMQjoMipqM%253A%253Bhttps%253A%252F%252Fencrypted-tbn0.gstatic.com%252Fimages%253Fq%253Dtbn%253AANd9GcTGSJNxh5DzAfyKmsj_HcYZ33ypRiZoEooZZ7DFa942DeUkl4cNGg%253B604%253B453%253BTrmbMB9375gkZM%253Bhttp%25253A%25252F%25252Fmemecrunch.com%25252Fmeme%25252FJA62%25252Fa-sldfkj&amp;source=iu&amp;usg=__U9-j8SfgrcXr7EuGqX8y-hrUtEU%3D&amp;sa=X&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;ved=0CFcQ9QEwBw\" id=\"QNCMkMQjoMipqM:\" style=\"height:90px;margin-left:0px;margin-right:0px;margin-top:0px;width:120px\" tag=\"bia\"><img class=\"th\" height=\"90\" name=\"imgthumb8\" src=\"data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQAAAQABAAD\/2wCEAAkGBwgHBgkIBwgKCgkL\u2026J96GT70Aav1z1D0rr3T7afZ6tLE8N9eX0Y+Uc+IzlmVOcYyW7+ntWT0eT70VAAoUKFAH\/2Q==\" style=\"margin-top:0px;margin-right:0px;margin-bottom:0;margin-left:0px\" title=\"http:\/\/memecrunch.com\/meme\/JA62\/a-sldfkj\" width=\"120\" align=\"middle\" alt=\"\" border=\"0\"><\/a><\/div><div class=\"rg_meta\">{\"id\":\"QNCMkMQjoMipqM:\",\"os\":\"202KB\",\"ou\":\"http:\/\/memecrunch.com\/meme\/JA62\/a-sldfkj\/image.png\",\"tu\":\"https:\/\/encrypted-tbn0.gstatic.com\/images?q\\u003dtbn:ANd9GcTsLMfezCLNjTyratb8fmS7iHvOIL99aLz6pDjPkWbNskltGtrM-psGWkw\",\"s\":\"\\u003cb\\u003ea\\u003c\\\/b\\u003e;\",\"tw\":120,\"rh\":\"memecrunch.com\",\"ru\":\"http:\/\/memecrunch.com\/meme\/JA62\/a-sldfkj\",\"ow\":604,\"th\":90,\"oh\":453}<\/div><\/li><!--n--><!--m--><li class=\"_xD bili uh_r\" style=\"width:107px\"><div style=\"height:90px;width:107px\" class=\"bicc\"><a jsl=\"$ue bind('t-c8vu0GbqXuM',{__tag:true});$t t-c8vu0GbqXuM;$rj;\" data-rtid=\"search5\" jsaction=\"r.3corYLRu5kg\" class=\"r-search5 bia uh_rl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;tbm=isch&amp;imgil=SdPIRyJUrIoOSM%253A%253Bhttps%253A%252F%252Fencrypted-tbn0.gstatic.com%252Fimages%253Fq%253Dtbn%253AANd9GcRQMdls7kZLMM8EzhQo4wuNNKEWeaPe4a0X0z3aqevk5lyq2HDz%253B1024%253B768%253Bo6s2o26HX_6lcM%253Bhttp%25253A%25252F%25252Fs475.photobucket.com%25252Fuser%25252Fzindsay%25252Fmedia%25252FCIMG3730.jpg.html&amp;source=iu&amp;usg=__1UgT9559N7lJKjtA4bKwCo5y3GM%3D&amp;sa=X&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;ved=0CFkQ9QEwCA\" id=\"SdPIRyJUrIoOSM:\" style=\"height:90px;margin-left:0px;margin-right:0px;margin-top:0px;width:107px\" tag=\"bia\"><img class=\"th\" height=\"90\" name=\"imgthumb9\" src=\"data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQAAAQABAAD\/2wCEAAkGBwgHBgkIBwgKCgkL\u20263X4UX3SAO2VyM4RiPdwom+K0B29hfZW7sVq4kuCsjIce7NKihPE+92z8zXtTNtvYykj\/\/2Q==\" style=\"margin-top:0px;margin-right:-5px;margin-bottom:0;margin-left:-8px\" title=\"http:\/\/s475.photobucket.com\/user\/zindsay\/media\/CIMG3730.jpg.html\" width=\"120\" align=\"middle\" alt=\"\" border=\"0\"><\/a><\/div><div class=\"rg_meta\">{\"os\":\"139KB\",\"cb\":6,\"ou\":\"http:\/\/i475.photobucket.com\/albums\/rr119\/zindsay\/CIMG3730.jpg\",\"rh\":\"s475.photobucket.com\",\"ow\":1024,\"th\":90,\"id\":\"SdPIRyJUrIoOSM:\",\"cr\":6,\"s\":\"\\u003cb\\u003eA\\u003c\\\/b\\u003e;\\u003cb\\u003esldfkj\\u003c\\\/b\\u003e Photo by zindsay | Photobucket\",\"tu\":\"https:\/\/encrypted-tbn0.gstatic.com\/images?q\\u003dtbn:ANd9GcQd44_XA2T10FdOCV-iAsx6omujlGgt0TUuTzBuN8cDJ5_GsNCCEq6eXA\",\"tw\":120,\"cl\":12,\"ru\":\"http:\/\/s475.photobucket.com\/user\/zindsay\/media\/CIMG3730.jpg.html\",\"oh\":768}<\/div><\/li><!--n--><!--m--><li class=\"_xD bili uh_r\" style=\"width:114px\"><div style=\"height:90px;width:114px\" class=\"bicc\"><a jsl=\"$ue bind('t-c8vu0GbqXuM',{__tag:true});$t t-c8vu0GbqXuM;$rj;\" data-rtid=\"search6\" jsaction=\"r.3corYLRu5kg\" class=\"r-search6 bia uh_rl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;tbm=isch&amp;imgil=w-D8gCWynpKFQM%253A%253Bhttps%253A%252F%252Fencrypted-tbn0.gstatic.com%252Fimages%253Fq%253Dtbn%253AANd9GcTs7e_N6FgGuYJWatIjoGpuVfjpYhpdcMHi-oxNmIdSE2Btr4N8xQ%253B480%253B360%253BCsXCRofFjsTAgM%253Bhttp%25253A%25252F%25252Fwww.youtube.com%25252Fwatch%25253Fv%2525253Db16HvVwCWBQ&amp;source=iu&amp;u\u2026fg-LXqW-MFA%3D&amp;sa=X&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;ved=0CFsQ9QEwCQ\" id=\"w-D8gCWynpKFQM:\" style=\"height:90px;margin-left:0px;margin-right:0px;margin-top:0px;width:114px\" tag=\"bia\"><img class=\"th\" height=\"90\" name=\"imgthumb10\" src=\"data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQAAAQABAAD\/2wCEAAkGBwgHBgkIBwgKCgkL\u2026SfVBFCizYPvH70uKR8fG3TzWxP5Wp7NkGo0jYpsyP+dvvSAS2ckn61oXqku9bptutZTJ2v\/\/Z\" style=\"margin-top:0px;margin-right:-6px;margin-bottom:0;margin-left:0px\" title=\"http:\/\/www.youtube.com\/watch?v=b16HvVwCWBQ\" width=\"120\" align=\"middle\" alt=\"\" border=\"0\"><\/a><\/div><div class=\"rg_meta\">{\"id\":\"w-D8gCWynpKFQM:\",\"cr\":6,\"os\":\"8KB\",\"ou\":\"http:\/\/i1.ytimg.com\/vi\/b16HvVwCWBQ\/hqdefault.jpg\",\"tu\":\"https:\/\/encrypted-tbn0.gstatic.com\/images?q\\u003dtbn:ANd9GcRz4PVhJEtYRXNg4UGQJ61WLsMynbd6gWVoiHi-eOL66SEVg8o8JaU9vac\",\"s\":\"hqdefault.jpg\",\"tw\":120,\"rh\":\"youtube.com\",\"ru\":\"http:\/\/www.youtube.com\/watch?v\\u003db16HvVwCWBQ\",\"ow\":480,\"th\":90,\"oh\":360}<\/div><\/li><!--n--><\/ul><\/div><\/div><\/div><\/div><a class=\"_Qe irg-footer\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;tbm=isch&amp;tbo=u&amp;source=univ&amp;sa=X&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;ved=0CFwQ7Ak\">More images for <b>a sldfkj<\/b><\/a><\/li><hr class=\"rgsep\"><div class=\"srg\"><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"94\"><h3 class=\"r\"><a href=\"http:\/\/www.wayn.com\/profiles\/mamon_mealex\" onmousedown=\"return rwt(this,'','','','11','AFQjCNEAaZRvgSUDyPwT-QNK7yCzoomCMg','GMq-QWsS5NCZWWqIAI1wLA','0CF8QFjAK','','',event)\"><em>A;sldfkj<\/em>; As;ldfkj from Hinche, Haiti - WAYN.COM<\/a><\/h3><div class=\"s\"><div><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">www.wayn.com\/profiles\/mamon_mealex<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b10\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CGAQ7B0wCg\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CGEQqR8wCg\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\"><a class=\"fl\" href=\"http:\/\/webcache.googleusercontent.com\/search?q=cache:VVvoILJU0ycJ:www.wayn.com\/profiles\/mamon_mealex+&amp;cd=11&amp;hl=en&amp;ct=clnk&amp;gl=us\" onmousedown=\"return rwt(this,'','','','11','AFQjCNGdmPQnt4gFdSMSTBqyaCRzPFvyDQ','6t-5mVDAw1HdzEu5ZbBPPg','0CGIQIDAK','','',event)\">Cached<\/a><\/li><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CGMQ5hkwCg\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CGQQ5xkwCg\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><\/div><div class=\"f slp\"><\/div><span class=\"st\">Hi, my name is <em>A;sldfkj<\/em>;. I'm a 27 year-old Falkland Islander female, and I live in Hinche Haiti. Enjoy my profile on WAYN.COM.<\/span><\/div><\/div><\/div><!--n--><\/li><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"101\"><h3 class=\"r\"><a href=\"http:\/\/answers.yahoo.com\/question\/index?qid=20110921181722AAn3vx3\" onmousedown=\"return rwt(this,'','','','12','AFQjCNGQRJUqkPw7BzbdwyGQp14WMCGUzQ','x6TNvCKdZ8gV0tn24I_KXA','0CGYQFjAL','','',event)\"><em>a;sldfkj<\/em> - Answers - Yahoo<\/a><\/h3><div class=\"s\"><div><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">answers.yahoo.com\/question\/index?qid=20110921181722AAn3vx3<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b11\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CGcQ7B0wCw\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CGgQqR8wCw\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\"><a class=\"fl\" href=\"http:\/\/webcache.googleusercontent.com\/search?q=cache:qgQ_cR11pg8J:answers.y\u2026%3Fqid%3D20110921181722AAn3vx3+&amp;cd=12&amp;hl=en&amp;ct=clnk&amp;gl=us\" onmousedown=\"return rwt(this,'','','','12','AFQjCNHHftvCzUvNkyRDoyz-NTynF9lXUg','ZjCCc9Fpo8N8EGKgSGM0zQ','0CGkQIDAL','','',event)\">Cached<\/a><\/li><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CGoQ5hkwCw\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CGsQ5xkwCw\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><\/div><div class=\"f slp\"><\/div><span class=\"st\"><span class=\"f\">Sep 21, 2011 - <\/span>You could easily build a budget pc for $650. Try to learn to build your own and you can take that playing wow on low settings to putting to ultra!<\/span><\/div><\/div><\/div><!--n--><\/li><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"109\"><h3 class=\"r\"><a href=\"http:\/\/www.scribd.com\/collections\/4091241\/A-SLDFKJ\" onmousedown=\"return rwt(this,'','','','13','AFQjCNEIq1CczOHoq6G7eaAQPDrHkYvGsg','UaTN6LY-2KRdHonDeFsvFg','0CG4QFjAM','','',event)\"><em>A;SLDFKJ<\/em> | Scribd<\/a><\/h3><div class=\"s\"><div><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">www.scribd.com\/collections\/4091241\/A-SLDFKJ<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b12\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CG8Q7B0wDA\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CHAQqR8wDA\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\"><a class=\"fl\" href=\"http:\/\/webcache.googleusercontent.com\/search?q=cache:V8c4o_DD2oIJ:www.scrib\u2026m\/collections\/4091241\/A-SLDFKJ+&amp;cd=13&amp;hl=en&amp;ct=clnk&amp;gl=us\" onmousedown=\"return rwt(this,'','','','13','AFQjCNHPWyvTYpLm4chypeRn9r5bsIM5wA','Ju2woaTm96qSWQHF3YIIzw','0CHEQIDAM','','',event)\">Cached<\/a><\/li><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CHIQ5hkwDA\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CHMQ5xkwDA\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><\/div><div class=\"f slp\"><\/div><span class=\"st\"><em>A;SLDFKJ<\/em> collection (1). by cntstc. No Documents or Books. LOAD MOREEND. About. Browse \u00b7 About Scribd \u00b7 Team \u00b7 Blog \u00b7 Join our team! Contact Us.<\/span><\/div><\/div><\/div><!--n--><\/li><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"116\"><h3 class=\"r\"><a href=\"http:\/\/spring.me\/sldjflksdjfkldj\" onmousedown=\"return rwt(this,'','','','14','AFQjCNHwqHhePLAiilAtZbFHnwhVW0aCew','8ZAh6SoP_Z_K6St_xXpuxQ','0CHUQFjAN','','',event)\"><em>a;sldfkj<\/em> (sldjflksdjfkldj) | Spring.me<\/a><\/h3><div class=\"s\"><div><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">spring.me\/sldjflksdjfkldj<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b13\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CHYQ7B0wDQ\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CHcQqR8wDQ\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\"><a class=\"fl\" href=\"http:\/\/webcache.googleusercontent.com\/search?q=cache:1XEPntBa-HQJ:spring.me\/sldjflksdjfkldj+&amp;cd=14&amp;hl=en&amp;ct=clnk&amp;gl=us\" onmousedown=\"return rwt(this,'','','','14','AFQjCNFeSqCpLr-UgqSEPvejvuOpontfog','PqhttEzWxgSAB2ZuuvnhCg','0CHgQIDAN','','',event)\">Cached<\/a><\/li><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CHkQ5hkwDQ\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CHoQ5xkwDQ\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><\/div><div class=\"f slp\"><\/div><span class=\"st\">View <em>a;sldfkj's<\/em> profile on Spring.me. Spring.me is the place to share your perspective on anything.<\/span><\/div><\/div><\/div><!--n--><\/li><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"123\"><h3 class=\"r\"><a href=\"http:\/\/prezi.com\/j8mdn3ltqsrb\/nathans-athletics\/\" onmousedown=\"return rwt(this,'','','','15','AFQjCNHZcAMrii64ypbwLNZFeLH8VuMe5g','pYorZFEXMmxgEXp_n8E_JQ','0CHwQFjAO','','',event)\">Nathan's Athletics by <em>a;sldfkj<\/em> asdf on Prezi<\/a><\/h3><div class=\"s\"><div><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">prezi.com\/j8mdn3ltqsrb\/nathans-athletics\/<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b14\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CH0Q7B0wDg\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CH4QqR8wDg\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\"><a class=\"fl\" href=\"http:\/\/webcache.googleusercontent.com\/search?q=cache:FvittBuLuYAJ:prezi.com\u20268mdn3ltqsrb\/nathans-athletics\/+&amp;cd=15&amp;hl=en&amp;ct=clnk&amp;gl=us\" onmousedown=\"return rwt(this,'','','','15','AFQjCNGIHD-pAzImJIjuimODUmN9OPp_Wg','ezwkltYBBbwNyXA5P1GV0g','0CH8QIDAO','','',event)\">Cached<\/a><\/li><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CIABEOYZMA4\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CIEBEOcZMA4\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><div class=\"crc\"><div class=\"crl\" data-async-econtext=\"ri:;site:prezi.com\" data-async-context=\"ri:;site:prezi.com\" data-async-trigger=\"cra-14\" jsaction=\"crd.tglpop\" data-ved=\"0CIIBEOQrMA4\">Prezi<span class=\"cr-dwn-arw\"><\/span><\/div><div class=\"cri y yp ys\" jsaction=\"crd.popclk\" id=\"cra-14\" data-async-type=\"cra\" data-async-context-required=\"site,ri\"><div class=\"filled\" id=\"cra-14-filled\"><\/div><div class=\"cr-load preload\">Loading...<\/div><\/div><\/div><\/div><div class=\"f slp\"><\/div><span class=\"st\"><span class=\"f\">Feb 28, 2014 - <\/span>Started in 1999. Founded by Nathan LeRoy (The awesomest guy ever) $1.25. Monday, February 17, 2014. Vol XCIII, No. 311. About us. History<\/span><\/div><\/div><\/div><!--n--><\/li><\/div><hr class=\"rgsep\"><\/ol><\/div><!--z--><\/div><\/div><div data-jibp=\"h\" data-jiis=\"uc\" id=\"bottomads\" style=\"\"><\/div><div class=\"med\" id=\"extrares\" style=\"padding:0 8px\"><div><div data-jibp=\"h\" data-jiis=\"uc\" id=\"botstuff\" style=\"\"><style>.mfr{margin-top:1em;margin-bottom:1em}.uh_h,.uh_hp,.uh_hv{display:none;position:fixed}.uh_h{height:0px;left:0px;top:0px;width:0px}.uh_hv{background:#fff;border:1px solid #ccc;-webkit-box-shadow:0 4px 16px rgba(0,0,0,0.2);margin:-8px;padding:8px;background-color:#fff}.uh_hp,.uh_hv,#uh_hp.v{display:block;z-index:5000}#uh_hp{-webkit-box-shadow:0px 2px 4px rgba(0,0,0,0.2);display:none;opacity:.7;position:fixed}#uh_hpl{cursor:pointer;display:block;height:100%;outline-color:-moz-use-text-color;outline-style:none;outline-width:medium;width:100%}.uh_hi{border:0;display:block;margin:0 auto 4px}.uh_hx{opacity:0.5}.uh_hx:hover{opacity:1}.uh_hn,.uh_hr,.uh_hs,.uh_ht,.uh_ha{margin:0 1px -1px;padding-bottom:1px;overflow:hidden}.uh_ht{font-size:123%;line-height:120%;max-height:1.2em;word-wrap:break-word}.uh_hn{line-height:120%;max-height:2.4em}.uh_hr{color:#093;white-space:nowrap}.uh_hs{color:#093;white-space:normal}.uh_ha{color:#777;white-space:nowrap}a.uh_hal{color:#36c;text-decoration:none}a:hover.uh_hal{text-decoration:underline}<\/style><div id=\"uh_hp\"><a href=\"#\" id=\"uh_hpl\"><\/a><\/div><div id=\"uh_h\"><a id=\"uh_hl\"><\/a><\/div><\/div><\/div><\/div><div><div id=\"foot\" role=\"contentinfo\" style=\"\"><div data-jibp=\"h\" data-jiis=\"uc\" id=\"cljs\" style=\"\"><\/div><span data-jibp=\"h\" data-jiis=\"uc\" id=\"xjs\" style=\"\"><div id=\"navcnt\"><table id=\"nav\" style=\"border-collapse:collapse;text-align:left;margin:30px auto 30px\"><tbody><tr valign=\"top\"><td class=\"b navend\"><span class=\"csb gbil\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-24px 0;background-size:167px;width:28px\"><\/span><\/td><td class=\"cur\"><span class=\"csb gbil\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-53px 0;background-size:167px;width:20px\"><\/span>1<\/td><td><a class=\"fl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=10&amp;sa=N\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-74px 0;background-size:167px;width:20px\"><\/span>2<\/a><\/td><td><a class=\"fl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=20&amp;sa=N\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-74px 0;background-size:167px;width:20px\"><\/span>3<\/a><\/td><td><a class=\"fl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=30&amp;sa=N\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-74px 0;background-size:167px;width:20px\"><\/span>4<\/a><\/td><td><a class=\"fl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=40&amp;sa=N\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-74px 0;background-size:167px;width:20px\"><\/span>5<\/a><\/td><td><a class=\"fl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=50&amp;sa=N\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-74px 0;background-size:167px;width:20px\"><\/span>6<\/a><\/td><td><a class=\"fl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=60&amp;sa=N\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-74px 0;background-size:167px;width:20px\"><\/span>7<\/a><\/td><td><a class=\"fl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=70&amp;sa=N\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-74px 0;background-size:167px;width:20px\"><\/span>8<\/a><\/td><td><a class=\"fl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=80&amp;sa=N\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-74px 0;background-size:167px;width:20px\"><\/span>9<\/a><\/td><td><a class=\"fl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=90&amp;sa=N\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-74px 0;background-size:167px;width:20px\"><\/span>10<\/a><\/td><td class=\"b navend\"><a class=\"pn\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=10&amp;sa=N\" id=\"pnnext\" style=\"text-decoration:none;text-align:left\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-96px 0;background-size:167px;width:71px\"><\/span><span style=\"display:block;margin-left:53px;text-decoration:underline\">Next<\/span><\/a><\/td><\/tr><\/tbody><\/table><\/div><\/span><div data-jibp=\"h\" data-jiis=\"uc\" id=\"gfn\" style=\"\"><\/div><\/div><\/div><\/div><\/div><div class=\"col\"><div data-jibp=\"h\" data-jiis=\"uc\" id=\"rhscol\" style=\"\"><div id=\"rhs\"><div id=\"rhs_block\" class=\" rhstc4\"><script>(function(){var c4=1072;var c5=1160;var bc=1250;var bd=0;try{var w=document.body.offsetWidth,n=3;if(w>bc){c4+=bd;c5+=bd;}\nif(w>=c4)n=w<c5?4:5;document.getElementById('rhs_block').className+=' rhstc'+n;}catch(e){}\n})();<\/script> <\/div><\/div><\/div><\/div><div style=\"clear:both\"><\/div><\/div>",
        "altKey": false,
        "ctrlKey": false,
        "metaKey": false,
        "shiftKey": false
      },
      {
        "action": "move",
        "x": 889,
        "y": 280,
        "timestamp": 1396638372089
      },
      {
        "action": "click",
        "x": 892,
        "y": 281,
        "timestamp": 1396638372185,
        "target": "<div id=\"rcnt\" style=\"clear:both;position:relative;zoom:1\"><div data-jibp=\"h\" data-jiis=\"uc\" id=\"gko-srp-sp\" style=\"\"><\/div><div id=\"er\" style=\"display: none;\"><\/div><div class=\"col\" style=\"width:0\"><div data-jibp=\"h\" data-jiis=\"uc\" id=\"leftnavc\" style=\"\"><\/div><\/div><div class=\"col\" style=\"width:0\"><div id=\"center_col\" style=\"padding-top: 0px; visibility: visible;\"><div data-jibp=\"h\" data-jiis=\"uc\" id=\"taw\" style=\"margin-right: 0px;\"><div><\/div><div style=\"padding:0 8px\"><div class=\"med\"><p class=\"sp_cnt _l\"><span class=\"spell\">Showing results for<\/span> <a class=\"spell\" href=\"\/search?biw=1148&amp;bih=618&amp;q=a+sldfkj&amp;spell=1&amp;sa=X&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;ved=0CCQQvwUoAA\"><b><i>a sldfkj<\/i><\/b><\/a><br><span class=\"spell_orig\">No results found for <b>adfaldfkjf<\/b><\/span> <br><\/p><hr class=\"rgsep\" style=\"margin-top:22px\"><\/div><\/div><div id=\"tvcap\"><\/div><\/div><div class=\"med\" id=\"res\" role=\"main\"><div data-jibp=\"h\" data-jiis=\"uc\" id=\"topstuff\" style=\"\"><\/div><div data-jibp=\"h\" data-jiis=\"uc\" id=\"search\" style=\"\"><style>.crl{color:#777;cursor:pointer;display:inline-block}.crl:hover{color:#222}.cri{display:none !important}.crp{color:#444;z-index:3;width:350px;margin-left:-160px;margin-top:3px;background:#fff;border:1px solid #d6d6d6;-webkit-box-shadow:0px 2px 4px #d6d6d6;-moz-box-shadow:0px 2px 4px #d6d6d6;box-shadow:0 2px 4px #d6d6d6;padding:16px;-webkit-border-radius:2px;-moz-border-radius:2px;border-radius:2px;white-space:normal;position:absolute}.crp .crt{position:initial;max-width:40px;max-height:40px;margin-right:10px;border:0px}.crc{display:inline-block;position:relative;margin-left:4px}.crc .cr-load{display:none}.crc .yp.yl .cr-load{display:block}.cr-dwn-arw{border-color:#aaa transparent !important;border-style:solid;border-width:4px 4px 0px 4px;width:0;height:0;top:50%;position:absolute;margin-left:6px;margin-top:-3px}.crl:hover .cr-dwn-arw{border-color:#222 transparent !important}.crp table{margin-bottom:6px}.crp .cr-summary{margin-bottom:4px}.crp .cr-debug{color:red}.crp .cr-hdr{margin-top:12px;font-weight:bold;margin-bottom:2px}.cr-wikicite{color:#777 !important;font-size:11px;text-decoration:none}.cr-wikicite:hover{text-decoration:underline}.cr-quote{margin-top:15px;margin-bottom:15px;color:#666}.cr-quote-first a{font-weight:bold}.cr-quote a{color:#777 !important;text-decoration:none}.cr-quote a:hover{text-decoration:underline}.cr-summary b{font-weight:normal}.cr-sitename{font-size:15px;font-weight:bold}.cr-award,.cr-nomination,.cr-owner,.cr-date{font-weight:normal;margin-top:5px}.cr-sitetype{color:#777;font-weight:normal;margin-top:1px}.cr-misc{margin-top:15px}.cr-l-debug{color:red;cursor:pointer}.cr-sep{margin-left:13px}a.cr-owner:link,a.cr-owner:visited{color:#2518b5;text-decoration:none}a.cr-owner:hover{color:#2518b5;text-decoration:underline}._bi{margin-bottom:20px}._uG .gl a:visited{color:#1e0fbe}._gM{display:-moz-inline-box;display:inline-block;text-align:center;vertical-align:top;margin-bottom:6px}.ri_of,.ri_iur,.iri{}.ri_of{opacity:0.4}._gM img{vertical-align:bottom}.ri_iur .bili{text-align:center}.ri_iur .bili .iri{display:inline-block;margin:4px 0 6px}.rhstc4 ._Uj .rhsg4,.rhstc3 ._Uj .rhsg4,.rhstc3 ._Uj .rhsg3{background:inherit !important;display:inherit !important;visibility:hidden}.rhstc5 ._Uj .rhsl5,.rhstc5 ._Uj .rhsl4,.rhstc4 ._Uj .rhsl4{background:inherit !important;display:inherit !important;visibility:hidden}.kno-cdta .kno-ibrg._Jl._Uj .img-brk{visibility:inherit}.kno-cdta.xpdclose .kno-ibrg._Jl{max-height:inherit}.kno-cdta ._uf{display:none}.kno-mrg .kno-ibrg{float:left}.kno-mrg-hnm .kno-ibrg{float:inherit}.kno-mrg-hnm .kno-ibrg{display:block}#iur .kno-ibrg{display:block}.img-brk{}.img-brk{display:block;overflow:hidden}._uf a.fl{display:inline-block;padding:5px 8px 7px}._uf{bottom:1px;letter-spacing:1px;padding:0;position:absolute;right:0}.kno-mrg ._uf a.fl,#iur ._uf a.fl{color:#fff;font-size:16px;text-decoration:none}._uf:hover{background:#000}#iur ._uf{bottom:2px;margin-bottom:0px}.kno-fb-on ._uf{display:none}._uf{background:#000000;background:rgba(0,0,0,0.4);-webkit-transition:all 0.2s ease-in-out}.kno-mrg ._uf a.fl,#iur ._uf a.fl{text-shadow:0 0 2px black,0 0 3px black}.birrg{font-size:13px;overflow:hidden}.rg_ul{white-space:normal}.img-kc-m,.bi-io{}.bili{vertical-align:top;display:inline-block;margin-top:0;margin-right:6px;margin-bottom:6px;margin-left:0;overflow:hidden;position:relative}.bicc{line-height:0;overflow:hidden;position:relative}._xi{margin-right:1px;margin-bottom:1px;float:left}.kno-mrg-si ._xi,._xi._TQ{margin:0 0 1px 0}._xi a img{border:0}._xi div img{border:0}.kno-mrg-si ._xi{margin-bottom:0px}._xD{margin-right:2px;margin-bottom:2px}.xpdclps .kno-mrg-si ._xi{margin:0}.bia{display:block;position:absolute}.img-kc-m{position:absolute}.kno-mrg-hnm .img-kc-m{position:relative}.kno-mrg .bili div.krable{height:1em;margin:3px}.rg_il,.rg_ilbg{bottom:0;color:#fff;font-size:11px;line-height:100%;position:absolute;right:0;padding:3px 4px 5px;text-decoration:none}.rg_ilbg{background:#333}.rg_ilbg{background:rgba(51,51,51,0.8)}.bi-io{border-bottom:1px solid #FFF;border-left:1px solid #FFF;right:0;top:0;z-index:1}._tD{bottom:0;position:absolute;width:100%}._uD{background-image:-webkit-linear-gradient(top,rgba(0,0,0,0),rgba(0,0,0,0.75));color:#CCC;font-size:13px;height:13px;line-height:13px;padding:7px 10px;text-align:right;text-shadow:0 0 4px rgba(0,0,0,0.2)}.bili .rg_meta{display:none}._GJ{height:30px;position:absolute;right:0;top:0;width:31px}._HJ{position:relative}._ct{height:31px;position:absolute;right:0;top:0;width:30px}._ct{background:rgba(0,0,0,0.4)}._Sy{cursor:pointer;filter:alpha(opacity=100);height:21px;opacity:1.0;padding:5px;position:absolute;right:0;top:0;-webkit-transition:all 0.2s ease-in-out;width:20px}._Sy:hover{background:black}<\/style><!--a--><h2 class=\"hd\">Search Results<\/h2><div data-async-econtext=\"query:a%20sldfkj\" data-async-context=\"query:a%20sldfkj\" id=\"ires\"><ol eid=\"nAI_U5SUKeqGyAGvt4H4BQ\" id=\"rso\"><div class=\"srg\"><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"40\"><h3 class=\"r\"><a href=\"http:\/\/www.tumblr.com\/tagged\/a%3Bsldfkj\" onmousedown=\"return rwt(this,'','','','1','AFQjCNHCfG0YdoVpxUsGiFkbdkDOlv0M-g','G9rdCB-vIUrZwHSAW_dXTA','0CCkQFjAA','','',event)\"><em>a;sldfkj<\/em> on Tumblr<\/a><\/h3><div class=\"s\"><div><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">www.tumblr.com\/tagged\/a%3Bsldfkj<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b0\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CCoQ7B0wAA\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CCsQqR8wAA\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\"><a class=\"fl\" href=\"http:\/\/webcache.googleusercontent.com\/search?q=cache:JjLKCJlNy1kJ:www.tumblr.com\/tagged\/a%253Bsldfkj+&amp;cd=1&amp;hl=en&amp;ct=clnk&amp;gl=us\" onmousedown=\"return rwt(this,'','','','1','AFQjCNHZ3EanadapptRx2V5V8MfmUtLm5A','_XYhwdJK38y74vLrzHKLZA','0CCwQIDAA','','',event)\">Cached<\/a><\/li><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CC0Q5hkwAA\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CC4Q5xkwAA\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><\/div><div class=\"f slp\"><\/div><span class=\"st\">Find and follow posts tagged <em>a;sldfkj<\/em> on Tumblr. ... #me#idek#<em>a;sldfkj<\/em> \u00b7 2 notes. Want to see more posts tagged #<em>a;sldfkj<\/em>? Sign up for Tumblr. Quantcast.<\/span><\/div><\/div><\/div><!--n--><\/li><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"47\"><h3 class=\"r\"><a href=\"http:\/\/www.youtube.com\/watch?v=b16HvVwCWBQ\" onmousedown=\"return rwt(this,'','','','2','AFQjCNHVVFMFWfaXXkQmSPuasl_DZM6Z-w','YlTaF0TcIAkMnN6Y9HdjBA','0CDAQtwIwAQ','','',event)\"><em>a;sldfkj<\/em>;alskdjf;ak - YouTube<\/a><\/h3><div class=\"s\"><div><div class=\"th _nj _kN\" style=\"height:65px;width:116px\"><a href=\"http:\/\/www.youtube.com\/watch?v=b16HvVwCWBQ\" onmousedown=\"return rwt(this,'','','','2','AFQjCNHVVFMFWfaXXkQmSPuasl_DZM6Z-w','YlTaF0TcIAkMnN6Y9HdjBA','0CDEQuAIwAQ','','',event)\"><span class=\"_vA\" style=\"top:-11px\"><img height=\"87\" id=\"vidthumb2\" src=\"data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQAAAQABAAD\/2wBDAAoHBwgHBgoICAgLCgoL\u2026E\/wDdc+KD\/wC0tLHzNdK7\/ib61sS21NZsio8jYoZd8e031rnmLZySfjRgVpnrK4PWspkn\/9k=\" width=\"116\" border=\"0\"><\/span><span class=\"vdur _Hm _wA\">\u25ba&nbsp;1:31<\/span><span class=\"vdur _Hm _cu\">\u25ba&nbsp;1:31<\/span><\/a><\/div><\/div><div style=\"margin-left:125px\"><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">www.youtube.com\/watch?v...<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b1\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CDIQ7B0wAQ\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CDMQqR8wAQ\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CDQQ5hkwAQ\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CDUQ5xkwAQ\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><div class=\"crc\"><div class=\"crl\" data-async-econtext=\"ri:;site:youtube.com\" data-async-context=\"ri:;site:youtube.com\" data-async-trigger=\"cra-1\" jsaction=\"crd.tglpop\" data-ved=\"0CDYQ5CswAQ\">YouTube<span class=\"cr-dwn-arw\"><\/span><\/div><div class=\"cri y yp ys\" jsaction=\"crd.popclk\" id=\"cra-1\" data-async-type=\"cra\" data-async-context-required=\"site,ri\"><div class=\"filled\" id=\"cra-1-filled\"><\/div><div class=\"cr-load preload\">Loading...<\/div><\/div><\/div><\/div><div class=\"f slp\">Aug 8, 2008 - Uploaded by codyarchuletatube<\/div><span class=\"st\"><em>a;sldfkj<\/em>;alskdjf;ak. codyarchuletatube\u00b728 videos .... <em>sldfkj<\/em> by heatherpether 2,385 views; 0:08. Watch Later ...<\/span><\/div><div style=\"clear:left\"><\/div><\/div><\/div><!--n--><\/li><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"55\"><h3 class=\"r\"><a href=\"http:\/\/www.youtube.com\/watch?v=QlOFnE33YC8\" onmousedown=\"return rwt(this,'','','','3','AFQjCNGcYUVIz10R8DI95zeXkOXfwvlJ5Q','Li2DOfw7Oc0SeG7NEXzSlA','0CDgQtwIwAg','','',event)\"><em>sldfkj<\/em> - YouTube<\/a><\/h3><div class=\"s\"><div><div class=\"th _nj _kN\" style=\"height:65px;width:116px\"><a href=\"http:\/\/www.youtube.com\/watch?v=QlOFnE33YC8\" onmousedown=\"return rwt(this,'','','','3','AFQjCNGcYUVIz10R8DI95zeXkOXfwvlJ5Q','Li2DOfw7Oc0SeG7NEXzSlA','0CDkQuAIwAg','','',event)\"><span class=\"_vA\" style=\"top:-11px\"><img height=\"87\" id=\"vidthumb3\" src=\"data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQAAAQABAAD\/2wBDAAoHBwgHBgoICAgLCgoL\u2026Pbt\/ipckMW\/Plpn\/1FcEMXH4Sdf5RRKCFvJIiCfJObPTv3\/6pUa5t4BjEMY5\/lFKr6IJN0f\/Z\" width=\"116\" border=\"0\"><\/span><span class=\"vdur _Hm _wA\">\u25ba&nbsp;0:10<\/span><span class=\"vdur _Hm _cu\">\u25ba&nbsp;0:10<\/span><\/a><\/div><\/div><div style=\"margin-left:125px\"><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">www.youtube.com\/watch?v...<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b2\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CDoQ7B0wAg\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CDsQqR8wAg\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CDwQ5hkwAg\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CD0Q5xkwAg\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><div class=\"crc\"><div class=\"crl\" data-async-econtext=\"ri:;site:youtube.com\" data-async-context=\"ri:;site:youtube.com\" data-async-trigger=\"cra-2\" jsaction=\"crd.tglpop\" data-ved=\"0CD4Q5CswAg\">YouTube<span class=\"cr-dwn-arw\"><\/span><\/div><div class=\"cri y yp ys\" jsaction=\"crd.popclk\" id=\"cra-2\" data-async-type=\"cra\" data-async-context-required=\"site,ri\"><div class=\"filled\" id=\"cra-2-filled\"><\/div><div class=\"cr-load preload\">Loading...<\/div><\/div><\/div><\/div><div class=\"f slp\">Jul 12, 2006 - Uploaded by heatherpether<\/div><span class=\"st\"><em>sldfkj<\/em> by carolynechristine 209 views \u00b7 2:29. Watch Later <em>sldfkj<\/em> by Corie987 146 views \u00b7 0:30. Watch Later ...<\/span><\/div><div style=\"clear:left\"><\/div><\/div><\/div><!--n--><\/li><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"63\"><h3 class=\"r\"><a href=\"http:\/\/quizlet.com\/22910946\/53-asldfkj-flash-cards\/\" onmousedown=\"return rwt(this,'','','','4','AFQjCNGHxvRHUP1GyEDMQaF3qUUji4lhxg','iEdcdVViIfAllEtgxt0gWA','0CEAQFjAD','','',event)\">5\/3 <em>a;sldfkj<\/em> flashcards | Quizlet<\/a><\/h3><div class=\"s\"><div><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">quizlet.com\/22910946\/53-asldfkj-flash-cards\/<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b3\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CEEQ7B0wAw\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CEIQqR8wAw\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\"><a class=\"fl\" href=\"http:\/\/webcache.googleusercontent.com\/search?q=cache:2FvUGNRCYP8J:quizlet.c\u20262910946\/53-asldfkj-flash-cards\/+&amp;cd=4&amp;hl=en&amp;ct=clnk&amp;gl=us\" onmousedown=\"return rwt(this,'','','','4','AFQjCNG0aGtDQBKFyB1b9eKhCzvPPvc67w','KunHeUs6b3MHsCTAg7ua4w','0CEMQIDAD','','',event)\">Cached<\/a><\/li><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CEQQ5hkwAw\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CEUQ5xkwAw\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><div class=\"crc\"><div class=\"crl\" data-async-econtext=\"ri:;site:quizlet.com\" data-async-context=\"ri:;site:quizlet.com\" data-async-trigger=\"cra-3\" jsaction=\"crd.tglpop\" data-ved=\"0CEYQ5CswAw\">Quizlet<span class=\"cr-dwn-arw\"><\/span><\/div><div class=\"cri y yp ys\" jsaction=\"crd.popclk\" id=\"cra-3\" data-async-type=\"cra\" data-async-context-required=\"site,ri\"><div class=\"filled\" id=\"cra-3-filled\"><\/div><div class=\"cr-load preload\">Loading...<\/div><\/div><\/div><\/div><div class=\"f slp\"><\/div><span class=\"st\">Vocabulary words for as;ldfkj. Includes studying games and tools such as flashcards.<\/span><\/div><\/div><\/div><!--n--><\/li><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"71\"><h3 class=\"r\"><a href=\"http:\/\/bitchesbecrazay.blogspot.com\/2011\/01\/asldfkj.html\" onmousedown=\"return rwt(this,'','','','5','AFQjCNEncF0ad46GjR-CiGX4eZuhi8ieVQ','NvDxEXsfcJPNL-oHQ5Y7PQ','0CEgQFjAE','','',event)\">im boring.: <em>a;sldfkj<\/em><\/a><\/h3><div class=\"s\"><div><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">bitchesbecrazay.blogspot.com\/2011\/01\/asldfkj.html<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b4\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CEkQ7B0wBA\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CEoQqR8wBA\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\"><a class=\"fl\" href=\"http:\/\/webcache.googleusercontent.com\/search?q=cache:bwJ0TiTHinQJ:bitchesbe\u2026ogspot.com\/2011\/01\/asldfkj.html+&amp;cd=5&amp;hl=en&amp;ct=clnk&amp;gl=us\" onmousedown=\"return rwt(this,'','','','5','AFQjCNH594FZJxUiioMiQ_3STI_lc9LpsA','BfNoqtyY7n7xIdsV_iCmow','0CEsQIDAE','','',event)\">Cached<\/a><\/li><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CEwQ5hkwBA\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CE0Q5xkwBA\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><\/div><div class=\"f slp\"><\/div><span class=\"st\"><span class=\"f\">Jan 7, 2011 - <\/span><em>a;sldfkj<\/em>. i woke up and realized that i was still a little tipsy. and realized that i.had.<wbr>no.food. who the fuck do i think i am? i kind of sat in bed for a&nbsp;...<\/span><\/div><\/div><\/div><!--n--><\/li><\/div><hr class=\"rgsep\"><li class=\"g\" id=\"imagebox_bigimages\"><div class=\"_bi _Pb\"><a href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;tbm=isch&amp;tbo=u&amp;source=univ&amp;sa=X&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;ved=0CFAQsAQ\">Images for <em>a sldfkj<\/em><\/a><span class=\"_uG bl\"><span class=\"gl\" id=\"irl_r\"><a href=\"javascript:;\" jsaction=\"riu.r\" id=\"irl_r_a\">Report images<\/a><\/span><span id=\"irl_t\" style=\"display:none\">Thank you for the feedback.<\/span><span class=\"gl\" id=\"irl_m\" style=\"display:none\">&nbsp;<a href=\"javascript:;\" jsaction=\"riu.r\" id=\"irl_m_a\">Report another image<\/a><\/span><span id=\"irl_p\" style=\"display:none\">Please report the offensive image.<\/span><span class=\"gl\" id=\"irl_c\" style=\"display:none\">&nbsp;<a href=\"javascript:;\" jsaction=\"riu.c\" id=\"irl_c_a\">Cancel<\/a><\/span><span class=\"gl\" id=\"irl_d\" style=\"display:none\"><a href=\"javascript:;\" jsaction=\"riu.d\" id=\"irl_d_a\">Done<\/a><\/span><\/span><\/div><div class=\"rg_r\" id=\"iur\" style=\"margin-top:3px\"><div jsl=\"$ue bind('t-W2rDs_51QkE',{__tag:true});$t t-W2rDs_51QkE;\" style=\"display:none\" class=\"r-search1\"><\/div><div class=\"_Uj kno-ibrg\"><div class=\"img-brk\"><div class=\"birrg\" style=\"margin-right:-3px\"><ul class=\"rg_ul\"><!--m--><li class=\"_xD bili uh_r\" style=\"width:83px\"><div style=\"height:90px;width:83px\" class=\"bicc\"><a jsl=\"$ue bind('t-c8vu0GbqXuM',{__tag:true});$t t-c8vu0GbqXuM;$rj;\" data-rtid=\"search2\" jsaction=\"r.3corYLRu5kg\" class=\"r-search2 bia uh_rl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;tbm=isch&amp;imgil=OYVs5v_TvB0XrM%253A%253Bhttps%253A%252F%252Fencrypted-tbn0.gstatic.com%252Fimages%253Fq%253Dtbn%253AANd9GcRuQkOmloRICtTMqKVxY6Fs1NI5Xeqn5AR3-7Xcx-2THQpgX-nd%253B467%253B444%253BpoQVczMfS4DKaM%253Bhttp%25253A%25252F%25252Fwww.scoop.it%25252Ft%25252Fsecondlife-fashion%25252Fp%25252F3996279890%2525\u2026ouVnp0X9E3s%3D&amp;sa=X&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;ved=0CFMQ9QEwBQ\" id=\"OYVs5v_TvB0XrM:\" style=\"height:90px;margin-left:0px;margin-right:0px;margin-top:0px;width:83px\" tag=\"bia\"><img class=\"th\" height=\"90\" name=\"imgthumb6\" src=\"data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQAAAQABAAD\/2wCEAAkGBwgHBgkIBwgKCgkL\u2026Vq8HT52fIccZXP5muf8YXJlv44cbkXV7k\/wCKM96b8A24Cpg7qg3KnzurqieaVQ1UqzP\/2Q==\" style=\"margin-top:0px;margin-right:-9px;margin-bottom:0;margin-left:-3px\" title=\"http:\/\/www.scoop.it\/t\/secondlife-fashion\/p\/3996279890\/2013\/02\/09\/new-blacklace-and-a-sldfkj\" width=\"95\" align=\"middle\" alt=\"\" border=\"0\"><\/a><\/div><div class=\"rg_meta\">{\"os\":\"75KB\",\"ou\":\"http:\/\/img.scoop.it\/Dywj04qCY_FGmaJCNXnW6jl72eJkfbmt4t8yenImKBVvK0kTmF0xjctABnaLJIm9\",\"rh\":\"scoop.it\",\"ow\":467,\"th\":94,\"id\":\"OYVs5v_TvB0XrM:\",\"cr\":15,\"s\":\"New @Blacklace and \\u003cb\\u003ea\\u003c\\\/b\\u003e;\\u003cb\\u003esldfkj\\u003c\\\/b\\u003e | Second Life Fashi...\",\"tu\":\"https:\/\/encrypted-tbn0.gstatic.com\/images?q\\u003dtbn:ANd9GcQ_veXI8ZkfEuNQcDmFBCJENIkb0YI84J6OB8BbUiGI2voNXFj7jS9_Hg\",\"tw\":99,\"cl\":6,\"ru\":\"http:\/\/www.scoop.it\/t\/secondlife-fashion\/p\/3996279890\/2013\/02\/09\/new-blacklace-and-a-sldfkj\",\"oh\":444}<\/div><\/li><!--n--><!--m--><li class=\"_xD bili uh_r\" style=\"width:80px\"><div style=\"height:90px;width:80px\" class=\"bicc\"><a jsl=\"$ue bind('t-c8vu0GbqXuM',{__tag:true});$t t-c8vu0GbqXuM;$rj;\" data-rtid=\"search3\" jsaction=\"r.3corYLRu5kg\" class=\"r-search3 bia uh_rl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;tbm=isch&amp;imgil=3lxyQzQenwUGBM%253A%253Bhttps%253A%252F%252Fencrypted-tbn2.gstatic.com%252Fimages%253Fq%253Dtbn%253AANd9GcT9pKAzxlHzTp9gBY7oMqsFDN6yhfLAGy52AVckTPAexQJbwD1tUw%253B180%253B180%253BVVvoILJU0yfdCM%253Bhttp%25253A%25252F%25252Fwww.wayn.com%25252Fprofiles%25252Fmamon_mealex&amp;source=iu&amp;usg=__mnID\u20268xACihxnwas%3D&amp;sa=X&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;ved=0CFUQ9QEwBg\" id=\"3lxyQzQenwUGBM:\" style=\"height:90px;margin-left:0px;margin-right:0px;margin-top:0px;width:80px\" tag=\"bia\"><img class=\"th\" height=\"90\" name=\"imgthumb7\" src=\"data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQAAAQABAAD\/2wCEAAkGBwgHBgkIBwgKCgkL\u2026UaJHn0rYU5YN3RmgDxelTNL\/438xrhc3AsUtDou0QRp0\/XYHwJpfs+bzT9VWpNNrFYR\/\/2Q==\" style=\"margin-top:0px;margin-right:-7px;margin-bottom:0;margin-left:-3px\" title=\"http:\/\/www.wayn.com\/profiles\/mamon_mealex\" width=\"90\" align=\"middle\" alt=\"\" border=\"0\"><div class=\"rg_ilbg\"><span>3 days ago<\/span><\/div><\/a><\/div><div class=\"rg_meta\">{\"os\":\"12KB\",\"cb\":6,\"ou\":\"http:\/\/pictures.wayn.com\/photos\/180c\/002783915_459600029.jpg\",\"rh\":\"wayn.com\",\"ow\":180,\"ct\":9,\"th\":90,\"id\":\"3lxyQzQenwUGBM:\",\"cr\":12,\"s\":\"\\u003cb\\u003eA\\u003c\\\/b\\u003e;\\u003cb\\u003esldfkj\\u003c\\\/b\\u003e; As;ldfkj from Hinche, Haiti - WAYN.\",\"tu\":\"https:\/\/encrypted-tbn2.gstatic.com\/images?q\\u003dtbn:ANd9GcQdyXbN1aH8cPAmdT3xdS7y560ljDsG9Rjveh2ip44pSVtF_flBj2OS0tw\",\"tw\":90,\"cl\":6,\"ru\":\"http:\/\/www.wayn.com\/profiles\/mamon_mealex\",\"oh\":180}<\/div><\/li><!--n--><!--m--><li class=\"_xD bili uh_r\" style=\"width:120px\"><div style=\"height:90px;width:120px\" class=\"bicc\"><a jsl=\"$ue bind('t-c8vu0GbqXuM',{__tag:true});$t t-c8vu0GbqXuM;$rj;\" data-rtid=\"search4\" jsaction=\"r.3corYLRu5kg\" class=\"r-search4 bia uh_rl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;tbm=isch&amp;imgil=QNCMkMQjoMipqM%253A%253Bhttps%253A%252F%252Fencrypted-tbn0.gstatic.com%252Fimages%253Fq%253Dtbn%253AANd9GcTGSJNxh5DzAfyKmsj_HcYZ33ypRiZoEooZZ7DFa942DeUkl4cNGg%253B604%253B453%253BTrmbMB9375gkZM%253Bhttp%25253A%25252F%25252Fmemecrunch.com%25252Fmeme%25252FJA62%25252Fa-sldfkj&amp;source=iu&amp;usg=__U9-j8SfgrcXr7EuGqX8y-hrUtEU%3D&amp;sa=X&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;ved=0CFcQ9QEwBw\" id=\"QNCMkMQjoMipqM:\" style=\"height:90px;margin-left:0px;margin-right:0px;margin-top:0px;width:120px\" tag=\"bia\"><img class=\"th\" height=\"90\" name=\"imgthumb8\" src=\"data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQAAAQABAAD\/2wCEAAkGBwgHBgkIBwgKCgkL\u2026J96GT70Aav1z1D0rr3T7afZ6tLE8N9eX0Y+Uc+IzlmVOcYyW7+ntWT0eT70VAAoUKFAH\/2Q==\" style=\"margin-top:0px;margin-right:0px;margin-bottom:0;margin-left:0px\" title=\"http:\/\/memecrunch.com\/meme\/JA62\/a-sldfkj\" width=\"120\" align=\"middle\" alt=\"\" border=\"0\"><\/a><\/div><div class=\"rg_meta\">{\"id\":\"QNCMkMQjoMipqM:\",\"os\":\"202KB\",\"ou\":\"http:\/\/memecrunch.com\/meme\/JA62\/a-sldfkj\/image.png\",\"tu\":\"https:\/\/encrypted-tbn0.gstatic.com\/images?q\\u003dtbn:ANd9GcTsLMfezCLNjTyratb8fmS7iHvOIL99aLz6pDjPkWbNskltGtrM-psGWkw\",\"s\":\"\\u003cb\\u003ea\\u003c\\\/b\\u003e;\",\"tw\":120,\"rh\":\"memecrunch.com\",\"ru\":\"http:\/\/memecrunch.com\/meme\/JA62\/a-sldfkj\",\"ow\":604,\"th\":90,\"oh\":453}<\/div><\/li><!--n--><!--m--><li class=\"_xD bili uh_r\" style=\"width:107px\"><div style=\"height:90px;width:107px\" class=\"bicc\"><a jsl=\"$ue bind('t-c8vu0GbqXuM',{__tag:true});$t t-c8vu0GbqXuM;$rj;\" data-rtid=\"search5\" jsaction=\"r.3corYLRu5kg\" class=\"r-search5 bia uh_rl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;tbm=isch&amp;imgil=SdPIRyJUrIoOSM%253A%253Bhttps%253A%252F%252Fencrypted-tbn0.gstatic.com%252Fimages%253Fq%253Dtbn%253AANd9GcRQMdls7kZLMM8EzhQo4wuNNKEWeaPe4a0X0z3aqevk5lyq2HDz%253B1024%253B768%253Bo6s2o26HX_6lcM%253Bhttp%25253A%25252F%25252Fs475.photobucket.com%25252Fuser%25252Fzindsay%25252Fmedia%25252FCIMG3730.jpg.html&amp;source=iu&amp;usg=__1UgT9559N7lJKjtA4bKwCo5y3GM%3D&amp;sa=X&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;ved=0CFkQ9QEwCA\" id=\"SdPIRyJUrIoOSM:\" style=\"height:90px;margin-left:0px;margin-right:0px;margin-top:0px;width:107px\" tag=\"bia\"><img class=\"th\" height=\"90\" name=\"imgthumb9\" src=\"data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQAAAQABAAD\/2wCEAAkGBwgHBgkIBwgKCgkL\u20263X4UX3SAO2VyM4RiPdwom+K0B29hfZW7sVq4kuCsjIce7NKihPE+92z8zXtTNtvYykj\/\/2Q==\" style=\"margin-top:0px;margin-right:-5px;margin-bottom:0;margin-left:-8px\" title=\"http:\/\/s475.photobucket.com\/user\/zindsay\/media\/CIMG3730.jpg.html\" width=\"120\" align=\"middle\" alt=\"\" border=\"0\"><\/a><\/div><div class=\"rg_meta\">{\"os\":\"139KB\",\"cb\":6,\"ou\":\"http:\/\/i475.photobucket.com\/albums\/rr119\/zindsay\/CIMG3730.jpg\",\"rh\":\"s475.photobucket.com\",\"ow\":1024,\"th\":90,\"id\":\"SdPIRyJUrIoOSM:\",\"cr\":6,\"s\":\"\\u003cb\\u003eA\\u003c\\\/b\\u003e;\\u003cb\\u003esldfkj\\u003c\\\/b\\u003e Photo by zindsay | Photobucket\",\"tu\":\"https:\/\/encrypted-tbn0.gstatic.com\/images?q\\u003dtbn:ANd9GcQd44_XA2T10FdOCV-iAsx6omujlGgt0TUuTzBuN8cDJ5_GsNCCEq6eXA\",\"tw\":120,\"cl\":12,\"ru\":\"http:\/\/s475.photobucket.com\/user\/zindsay\/media\/CIMG3730.jpg.html\",\"oh\":768}<\/div><\/li><!--n--><!--m--><li class=\"_xD bili uh_r\" style=\"width:114px\"><div style=\"height:90px;width:114px\" class=\"bicc\"><a jsl=\"$ue bind('t-c8vu0GbqXuM',{__tag:true});$t t-c8vu0GbqXuM;$rj;\" data-rtid=\"search6\" jsaction=\"r.3corYLRu5kg\" class=\"r-search6 bia uh_rl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;tbm=isch&amp;imgil=w-D8gCWynpKFQM%253A%253Bhttps%253A%252F%252Fencrypted-tbn0.gstatic.com%252Fimages%253Fq%253Dtbn%253AANd9GcTs7e_N6FgGuYJWatIjoGpuVfjpYhpdcMHi-oxNmIdSE2Btr4N8xQ%253B480%253B360%253BCsXCRofFjsTAgM%253Bhttp%25253A%25252F%25252Fwww.youtube.com%25252Fwatch%25253Fv%2525253Db16HvVwCWBQ&amp;source=iu&amp;u\u2026fg-LXqW-MFA%3D&amp;sa=X&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;ved=0CFsQ9QEwCQ\" id=\"w-D8gCWynpKFQM:\" style=\"height:90px;margin-left:0px;margin-right:0px;margin-top:0px;width:114px\" tag=\"bia\"><img class=\"th\" height=\"90\" name=\"imgthumb10\" src=\"data:image\/jpeg;base64,\/9j\/4AAQSkZJRgABAQAAAQABAAD\/2wCEAAkGBwgHBgkIBwgKCgkL\u2026SfVBFCizYPvH70uKR8fG3TzWxP5Wp7NkGo0jYpsyP+dvvSAS2ckn61oXqku9bptutZTJ2v\/\/Z\" style=\"margin-top:0px;margin-right:-6px;margin-bottom:0;margin-left:0px\" title=\"http:\/\/www.youtube.com\/watch?v=b16HvVwCWBQ\" width=\"120\" align=\"middle\" alt=\"\" border=\"0\"><\/a><\/div><div class=\"rg_meta\">{\"id\":\"w-D8gCWynpKFQM:\",\"cr\":6,\"os\":\"8KB\",\"ou\":\"http:\/\/i1.ytimg.com\/vi\/b16HvVwCWBQ\/hqdefault.jpg\",\"tu\":\"https:\/\/encrypted-tbn0.gstatic.com\/images?q\\u003dtbn:ANd9GcRz4PVhJEtYRXNg4UGQJ61WLsMynbd6gWVoiHi-eOL66SEVg8o8JaU9vac\",\"s\":\"hqdefault.jpg\",\"tw\":120,\"rh\":\"youtube.com\",\"ru\":\"http:\/\/www.youtube.com\/watch?v\\u003db16HvVwCWBQ\",\"ow\":480,\"th\":90,\"oh\":360}<\/div><\/li><!--n--><\/ul><\/div><\/div><\/div><\/div><a class=\"_Qe irg-footer\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;tbm=isch&amp;tbo=u&amp;source=univ&amp;sa=X&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;ved=0CFwQ7Ak\">More images for <b>a sldfkj<\/b><\/a><\/li><hr class=\"rgsep\"><div class=\"srg\"><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"94\"><h3 class=\"r\"><a href=\"http:\/\/www.wayn.com\/profiles\/mamon_mealex\" onmousedown=\"return rwt(this,'','','','11','AFQjCNEAaZRvgSUDyPwT-QNK7yCzoomCMg','GMq-QWsS5NCZWWqIAI1wLA','0CF8QFjAK','','',event)\"><em>A;sldfkj<\/em>; As;ldfkj from Hinche, Haiti - WAYN.COM<\/a><\/h3><div class=\"s\"><div><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">www.wayn.com\/profiles\/mamon_mealex<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b10\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CGAQ7B0wCg\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CGEQqR8wCg\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\"><a class=\"fl\" href=\"http:\/\/webcache.googleusercontent.com\/search?q=cache:VVvoILJU0ycJ:www.wayn.com\/profiles\/mamon_mealex+&amp;cd=11&amp;hl=en&amp;ct=clnk&amp;gl=us\" onmousedown=\"return rwt(this,'','','','11','AFQjCNGdmPQnt4gFdSMSTBqyaCRzPFvyDQ','6t-5mVDAw1HdzEu5ZbBPPg','0CGIQIDAK','','',event)\">Cached<\/a><\/li><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CGMQ5hkwCg\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CGQQ5xkwCg\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><\/div><div class=\"f slp\"><\/div><span class=\"st\">Hi, my name is <em>A;sldfkj<\/em>;. I'm a 27 year-old Falkland Islander female, and I live in Hinche Haiti. Enjoy my profile on WAYN.COM.<\/span><\/div><\/div><\/div><!--n--><\/li><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"101\"><h3 class=\"r\"><a href=\"http:\/\/answers.yahoo.com\/question\/index?qid=20110921181722AAn3vx3\" onmousedown=\"return rwt(this,'','','','12','AFQjCNGQRJUqkPw7BzbdwyGQp14WMCGUzQ','x6TNvCKdZ8gV0tn24I_KXA','0CGYQFjAL','','',event)\"><em>a;sldfkj<\/em> - Answers - Yahoo<\/a><\/h3><div class=\"s\"><div><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">answers.yahoo.com\/question\/index?qid=20110921181722AAn3vx3<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b11\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CGcQ7B0wCw\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CGgQqR8wCw\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\"><a class=\"fl\" href=\"http:\/\/webcache.googleusercontent.com\/search?q=cache:qgQ_cR11pg8J:answers.y\u2026%3Fqid%3D20110921181722AAn3vx3+&amp;cd=12&amp;hl=en&amp;ct=clnk&amp;gl=us\" onmousedown=\"return rwt(this,'','','','12','AFQjCNHHftvCzUvNkyRDoyz-NTynF9lXUg','ZjCCc9Fpo8N8EGKgSGM0zQ','0CGkQIDAL','','',event)\">Cached<\/a><\/li><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CGoQ5hkwCw\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CGsQ5xkwCw\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><\/div><div class=\"f slp\"><\/div><span class=\"st\"><span class=\"f\">Sep 21, 2011 - <\/span>You could easily build a budget pc for $650. Try to learn to build your own and you can take that playing wow on low settings to putting to ultra!<\/span><\/div><\/div><\/div><!--n--><\/li><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"109\"><h3 class=\"r\"><a href=\"http:\/\/www.scribd.com\/collections\/4091241\/A-SLDFKJ\" onmousedown=\"return rwt(this,'','','','13','AFQjCNEIq1CczOHoq6G7eaAQPDrHkYvGsg','UaTN6LY-2KRdHonDeFsvFg','0CG4QFjAM','','',event)\"><em>A;SLDFKJ<\/em> | Scribd<\/a><\/h3><div class=\"s\"><div><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">www.scribd.com\/collections\/4091241\/A-SLDFKJ<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b12\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CG8Q7B0wDA\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CHAQqR8wDA\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\"><a class=\"fl\" href=\"http:\/\/webcache.googleusercontent.com\/search?q=cache:V8c4o_DD2oIJ:www.scrib\u2026m\/collections\/4091241\/A-SLDFKJ+&amp;cd=13&amp;hl=en&amp;ct=clnk&amp;gl=us\" onmousedown=\"return rwt(this,'','','','13','AFQjCNHPWyvTYpLm4chypeRn9r5bsIM5wA','Ju2woaTm96qSWQHF3YIIzw','0CHEQIDAM','','',event)\">Cached<\/a><\/li><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CHIQ5hkwDA\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CHMQ5xkwDA\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><\/div><div class=\"f slp\"><\/div><span class=\"st\"><em>A;SLDFKJ<\/em> collection (1). by cntstc. No Documents or Books. LOAD MOREEND. About. Browse \u00b7 About Scribd \u00b7 Team \u00b7 Blog \u00b7 Join our team! Contact Us.<\/span><\/div><\/div><\/div><!--n--><\/li><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"116\"><h3 class=\"r\"><a href=\"http:\/\/spring.me\/sldjflksdjfkldj\" onmousedown=\"return rwt(this,'','','','14','AFQjCNHwqHhePLAiilAtZbFHnwhVW0aCew','8ZAh6SoP_Z_K6St_xXpuxQ','0CHUQFjAN','','',event)\"><em>a;sldfkj<\/em> (sldjflksdjfkldj) | Spring.me<\/a><\/h3><div class=\"s\"><div><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">spring.me\/sldjflksdjfkldj<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b13\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CHYQ7B0wDQ\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CHcQqR8wDQ\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\"><a class=\"fl\" href=\"http:\/\/webcache.googleusercontent.com\/search?q=cache:1XEPntBa-HQJ:spring.me\/sldjflksdjfkldj+&amp;cd=14&amp;hl=en&amp;ct=clnk&amp;gl=us\" onmousedown=\"return rwt(this,'','','','14','AFQjCNFeSqCpLr-UgqSEPvejvuOpontfog','PqhttEzWxgSAB2ZuuvnhCg','0CHgQIDAN','','',event)\">Cached<\/a><\/li><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CHkQ5hkwDQ\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CHoQ5xkwDQ\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><\/div><div class=\"f slp\"><\/div><span class=\"st\">View <em>a;sldfkj's<\/em> profile on Spring.me. Spring.me is the place to share your perspective on anything.<\/span><\/div><\/div><\/div><!--n--><\/li><li class=\"g\"><!--m--><div class=\"rc\" data-hveid=\"123\"><h3 class=\"r\"><a href=\"http:\/\/prezi.com\/j8mdn3ltqsrb\/nathans-athletics\/\" onmousedown=\"return rwt(this,'','','','15','AFQjCNHZcAMrii64ypbwLNZFeLH8VuMe5g','pYorZFEXMmxgEXp_n8E_JQ','0CHwQFjAO','','',event)\">Nathan's Athletics by <em>a;sldfkj<\/em> asdf on Prezi<\/a><\/h3><div class=\"s\"><div><div class=\"f kv _du\" style=\"white-space:nowrap\"><cite class=\"_Vc\">prezi.com\/j8mdn3ltqsrb\/nathans-athletics\/<\/cite>\u200e<div class=\"action-menu ab_ctl\"><a class=\"clickable-dropdown-arrow ab_button\" href=\"#\" id=\"am-b14\" aria-label=\"Result details\" jsaction=\"ab.tdd;keydown:ab.hbke;keypress:ab.mskpe\" aria-expanded=\"false\" aria-haspopup=\"true\" role=\"button\" data-ved=\"0CH0Q7B0wDg\"><span class=\"mn-dwn-arw\"><\/span><\/a><div class=\"action-menu-panel ab_dropdown\" jsaction=\"keydown:ab.hdke;mouseover:ab.hdhne;mouseout:ab.hdhue\" role=\"menu\" tabindex=\"-1\" data-ved=\"0CH4QqR8wDg\"><ul><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\"><a class=\"fl\" href=\"http:\/\/webcache.googleusercontent.com\/search?q=cache:FvittBuLuYAJ:prezi.com\u20268mdn3ltqsrb\/nathans-athletics\/+&amp;cd=15&amp;hl=en&amp;ct=clnk&amp;gl=us\" onmousedown=\"return rwt(this,'','','','15','AFQjCNGIHD-pAzImJIjuimODUmN9OPp_Wg','ezwkltYBBbwNyXA5P1GV0g','0CH8QIDAO','','',event)\">Cached<\/a><\/li><li class=\"action-menu-item ab_dropdownitem\" role=\"menuitem\" data-type=\"share\"><div class=\"action-menu-button\" jsaction=\"am.itemclk\" role=\"menuitem\" tabindex=\"-1\" data-ved=\"0CIABEOYZMA4\">Share<\/div><span class=\"action-menu-toggled-item\" style=\"display:none\" data-ved=\"0CIEBEOcZMA4\"><a class=\"fl\" href=\"#\">View shared post<\/a><\/span><\/li><\/ul><\/div><\/div><div class=\"crc\"><div class=\"crl\" data-async-econtext=\"ri:;site:prezi.com\" data-async-context=\"ri:;site:prezi.com\" data-async-trigger=\"cra-14\" jsaction=\"crd.tglpop\" data-ved=\"0CIIBEOQrMA4\">Prezi<span class=\"cr-dwn-arw\"><\/span><\/div><div class=\"cri y yp ys\" jsaction=\"crd.popclk\" id=\"cra-14\" data-async-type=\"cra\" data-async-context-required=\"site,ri\"><div class=\"filled\" id=\"cra-14-filled\"><\/div><div class=\"cr-load preload\">Loading...<\/div><\/div><\/div><\/div><div class=\"f slp\"><\/div><span class=\"st\"><span class=\"f\">Feb 28, 2014 - <\/span>Started in 1999. Founded by Nathan LeRoy (The awesomest guy ever) $1.25. Monday, February 17, 2014. Vol XCIII, No. 311. About us. History<\/span><\/div><\/div><\/div><!--n--><\/li><\/div><hr class=\"rgsep\"><\/ol><\/div><!--z--><\/div><\/div><div data-jibp=\"h\" data-jiis=\"uc\" id=\"bottomads\" style=\"\"><\/div><div class=\"med\" id=\"extrares\" style=\"padding:0 8px\"><div><div data-jibp=\"h\" data-jiis=\"uc\" id=\"botstuff\" style=\"\"><style>.mfr{margin-top:1em;margin-bottom:1em}.uh_h,.uh_hp,.uh_hv{display:none;position:fixed}.uh_h{height:0px;left:0px;top:0px;width:0px}.uh_hv{background:#fff;border:1px solid #ccc;-webkit-box-shadow:0 4px 16px rgba(0,0,0,0.2);margin:-8px;padding:8px;background-color:#fff}.uh_hp,.uh_hv,#uh_hp.v{display:block;z-index:5000}#uh_hp{-webkit-box-shadow:0px 2px 4px rgba(0,0,0,0.2);display:none;opacity:.7;position:fixed}#uh_hpl{cursor:pointer;display:block;height:100%;outline-color:-moz-use-text-color;outline-style:none;outline-width:medium;width:100%}.uh_hi{border:0;display:block;margin:0 auto 4px}.uh_hx{opacity:0.5}.uh_hx:hover{opacity:1}.uh_hn,.uh_hr,.uh_hs,.uh_ht,.uh_ha{margin:0 1px -1px;padding-bottom:1px;overflow:hidden}.uh_ht{font-size:123%;line-height:120%;max-height:1.2em;word-wrap:break-word}.uh_hn{line-height:120%;max-height:2.4em}.uh_hr{color:#093;white-space:nowrap}.uh_hs{color:#093;white-space:normal}.uh_ha{color:#777;white-space:nowrap}a.uh_hal{color:#36c;text-decoration:none}a:hover.uh_hal{text-decoration:underline}<\/style><div id=\"uh_hp\"><a href=\"#\" id=\"uh_hpl\"><\/a><\/div><div id=\"uh_h\"><a id=\"uh_hl\"><\/a><\/div><\/div><\/div><\/div><div><div id=\"foot\" role=\"contentinfo\" style=\"\"><div data-jibp=\"h\" data-jiis=\"uc\" id=\"cljs\" style=\"\"><\/div><span data-jibp=\"h\" data-jiis=\"uc\" id=\"xjs\" style=\"\"><div id=\"navcnt\"><table id=\"nav\" style=\"border-collapse:collapse;text-align:left;margin:30px auto 30px\"><tbody><tr valign=\"top\"><td class=\"b navend\"><span class=\"csb gbil\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-24px 0;background-size:167px;width:28px\"><\/span><\/td><td class=\"cur\"><span class=\"csb gbil\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-53px 0;background-size:167px;width:20px\"><\/span>1<\/td><td><a class=\"fl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=10&amp;sa=N\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-74px 0;background-size:167px;width:20px\"><\/span>2<\/a><\/td><td><a class=\"fl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=20&amp;sa=N\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-74px 0;background-size:167px;width:20px\"><\/span>3<\/a><\/td><td><a class=\"fl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=30&amp;sa=N\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-74px 0;background-size:167px;width:20px\"><\/span>4<\/a><\/td><td><a class=\"fl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=40&amp;sa=N\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-74px 0;background-size:167px;width:20px\"><\/span>5<\/a><\/td><td><a class=\"fl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=50&amp;sa=N\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-74px 0;background-size:167px;width:20px\"><\/span>6<\/a><\/td><td><a class=\"fl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=60&amp;sa=N\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-74px 0;background-size:167px;width:20px\"><\/span>7<\/a><\/td><td><a class=\"fl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=70&amp;sa=N\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-74px 0;background-size:167px;width:20px\"><\/span>8<\/a><\/td><td><a class=\"fl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=80&amp;sa=N\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-74px 0;background-size:167px;width:20px\"><\/span>9<\/a><\/td><td><a class=\"fl\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=90&amp;sa=N\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-74px 0;background-size:167px;width:20px\"><\/span>10<\/a><\/td><td class=\"b navend\"><a class=\"pn\" href=\"\/search?q=a+sldfkj&amp;biw=1148&amp;bih=618&amp;ei=nAI_U5SUKeqGyAGvt4H4BQ&amp;start=10&amp;sa=N\" id=\"pnnext\" style=\"text-decoration:none;text-align:left\"><span class=\"csb gbil ch\" style=\"background:url(\/images\/nav_logo170_hr.png) no-repeat;background-position:-96px 0;background-size:167px;width:71px\"><\/span><span style=\"display:block;margin-left:53px;text-decoration:underline\">Next<\/span><\/a><\/td><\/tr><\/tbody><\/table><\/div><\/span><div data-jibp=\"h\" data-jiis=\"uc\" id=\"gfn\" style=\"\"><\/div><\/div><\/div><\/div><\/div><div class=\"col\"><div data-jibp=\"h\" data-jiis=\"uc\" id=\"rhscol\" style=\"\"><div id=\"rhs\"><div id=\"rhs_block\" class=\" rhstc4\"><script>(function(){var c4=1072;var c5=1160;var bc=1250;var bd=0;try{var w=document.body.offsetWidth,n=3;if(w>bc){c4+=bd;c5+=bd;}\nif(w>=c4)n=w<c5?4:5;document.getElementById('rhs_block').className+=' rhstc'+n;}catch(e){}\n})();<\/script> <\/div><\/div><\/div><\/div><div style=\"clear:both\"><\/div><\/div>",
        "altKey": false,
        "ctrlKey": false,
        "metaKey": false,
        "shiftKey": false
      },
      {
        "action": "move",
        "x": 892,
        "y": 281,
        "timestamp": 1396638372190
      },
      {
        "action": "move",
        "x": 889,
        "y": 292,
        "timestamp": 1396638372291
      },
      {
        "action": "move",
        "x": 898,
        "y": 308,
        "timestamp": 1396638372392
      },
      {
        "action": "move",
        "x": 901,
        "y": 309,
        "timestamp": 1396638372494
      },
      {
        "action": "move",
        "x": 912,
        "y": 301,
        "timestamp": 1396638372595
      },
      {
        "action": "move",
        "x": 1035,
        "y": 88,
        "timestamp": 1396638372696
      },
      {
        "action": "move",
        "x": 1072,
        "y": 22,
        "timestamp": 1396638372797
      },
      {
        "action": "move",
        "x": 1082,
        "y": 0,
        "timestamp": 1396638372897
      },
      {
        "action": "move",
        "x": 1082,
        "y": 0,
        "timestamp": 1396638372998
      },
      {
        "action": "move",
        "x": 1082,
        "y": 0,
        "timestamp": 1396638373099
      },
      {
        "action": "move",
        "x": 1082,
        "y": 0,
        "timestamp": 1396638373201
      },
      {
        "action": "move",
        "x": 1082,
        "y": 0,
        "timestamp": 1396638373302
      },
      {
        "action": "move",
        "x": 1082,
        "y": 0,
        "timestamp": 1396638373404
      },
      {
        "action": "move",
        "x": 1082,
        "y": 0,
        "timestamp": 1396638373506
      },
      {
        "action": "move",
        "x": 1082,
        "y": 0,
        "timestamp": 1396638373607
      },
      {
        "action": "move",
        "x": 1082,
        "y": 0,
        "timestamp": 1396638373708
      },
      {
        "action": "move",
        "x": 1082,
        "y": 0,
        "timestamp": 1396638373809
      },
      {
        "action": "move",
        "x": 1082,
        "y": 0,
        "timestamp": 1396638373910
      }
    ]
  };

  var playRecording = function(){
    var xScale = window.width / test["width"];
    var yScale = window.height / test["height"];
    var movement = test["ticks"];
    movement[0].t = 0;
    for (var i = 1; i < movement.length-1; i++){
      movement[i].t = movement[i]["timestamp"] - movement[i-1]["timestamp"];
    }
    processData(movement, 0, xScale, yScale);
  };

  // Listens to messages from background
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'startRecording'){
      recorder.start();
      sendResponse({response: "done"});
    } else if (request.action === 'stopRecording'){
      recorder.stop();
      sendResponse({response: "done"});
    } else if (request.action === 'playRecording'){
      $('body').append('<div class="mouse" style="position:absolute; background: red; width: 15px; height:15px; border-radius: 7.5px; top: 100px; left:100px;"></div>');
      playRecording();
    }
  });

});


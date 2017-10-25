function sendPost(url, params, clbk)
{
	var http = new XMLHttpRequest();
  http.open("POST", url, true);
	var bdy = "";
  var i = 0;
  var length = 0;
  for(var key in params) length++;
	for(var key in params) {
  	if(params.hasOwnProperty(key)) {
    i++;
    	var pr = (params[key]).split(' ').join('+');
    	bdy += key + "=" + pr;
      if(length!=i)bdy+="&";
    }
  }
  //console.log(bdy);
  http.onreadystatechange = function() {//Call a function when the state changes.
    if(http.readyState == 4 && http.status == 200) {
        //alert(http.responseText);
        clbk(http);
    }
	}
  http.send(bdy);
}

var waitingResponse = false;
var sendqueue = [];
var hostURL="http://localhost/dump";

function write(str){
  sendqueue.push(str);
  trySend();
}

function trySend()
{
	//console.log(sendqueue.length,waitingResponse);
  if(!waitingResponse){
    //console.log("same:"+sendqueue.reduce(function(a,b){return a==b;}));
    var d = sendqueue.join('');
    sendqueue = [];
    setTimeout(function(){sendPost(hostURL,{data:d},queueCheck)},1000);
    waitingResponse = true;
  }
}

function queueCheck()
{
  waitingResponse = false;
  if(sendqueue.length > 0)trySend();
}

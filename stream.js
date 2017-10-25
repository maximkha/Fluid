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
  if(!waitingResponse){
    //console.log("Sent queue");
    var d = sendqueue.join('');
    sendqueue = [];
    sendPost(hostURL,{data:d},queueCheck);
    waitingResponse = true;
  }
}

function queueCheck()
{
  waitingResponse = false;
  if(sendqueue.length > 0)trySend();
}

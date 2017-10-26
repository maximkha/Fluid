var context = null;
var stream = false;
var logIter = 1000;
var speed = 12;

window.onload = function(){
	document.getElementById("myCan").width = window.innerWidth;//500;
	document.getElementById("myCan").height = window.innerHeight;//500;
	context = document.getElementById("myCan").getContext("2d");

	//var d = new this.jsPhi.point2D(10,6);
	//var s = new this.jsPhi.FluidSimulation(50,25,d);
	var d = new this.jsPhi.point2D(5,3);
	var s = new this.jsPhi.FluidSimulation(100,50,d);
	s.draw(context,window.innerWidth,window.innerHeight);
	//s.update(thatScope.jsPhi.Fluid.updateCalls.fhp1);
	//s.draw(context,window.innerWidth,window.innerHeight);
	if(!stream) window.stop = setInterval(function(){
    s.update(jsPhi.Fluid.updateCalls.fhp1);
    s.draw(context,window.innerWidth,window.innerHeight);},100);
  var i = 0;
  if(stream)  window.stop = setInterval(function(){
    s.update(jsPhi.Fluid.updateCalls.fhp1);
    s.draw(context,window.innerWidth,window.innerHeight);
    write(s.vs1+"/n");
    console.log("Current Iter: "+i);
    i++;
    if(i>=logIter)clearInterval(window.stop);},speed);
};

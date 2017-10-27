var context = null;
var stream = false;
var speed = 12;
var logIter = 0;
var holeWidth = 18;
var curI = 0;
var streamBatches = [[18,1000],[32,2000]];
var fsx = 100;
var fsy = 50;

window.onload = function(){
	if(stream) {
		setPath("W" + streamBatches[curI][0] + "P" + streamBatches[curI][1]);
		holeWidth = streamBatches[curI][0];
		logIter = streamBatches[curI][1];
	}
	document.getElementById("myCan").width = window.innerWidth;//500;
	document.getElementById("myCan").height = window.innerHeight;//500;
	context = document.getElementById("myCan").getContext("2d");

	//var d = new this.jsPhi.point2D(10,6);
	//var s = new this.jsPhi.FluidSimulation(50,25,d);
	var d = new this.jsPhi.point2D(5,3);
	var s = new this.jsPhi.FluidSimulation(fsx,fsy,d);

	// borders
	for (var i = 0; i < fsx; i++) {
		s.cells[i][0].state = 63;
		s.cells[i][fsy-1].state = 63;
	}
	for (var j = 0; j < fsy; j++) {
		s.cells[0][j].state = 63;
		s.cells[fsx-1][j].state = 63;
	}
	// Trump's wall
	for (var j = 0; j < 10; j++) s.cells[fsx/2][j].state = 63;
	for (var j = (10+holeWidth); j < fsy; j++) s.cells[fsx/2][j].state = 63;

	s.draw(context,window.innerWidth,window.innerHeight);

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
    if(i>=logIter){clearInterval(window.stop);if(streamBatches.index(curI+1))setTimeout(()=>{curI++;window.onload();},2000);}
		},speed);
};

Array.prototype.subset = function(i)
{
	var r = Array();
	this.forEach((v)=>{r.push(v[i]);});
	return r;
}

Array.prototype.index = function(i)
{
	return this.includes(this[i]);
}

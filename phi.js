this.jsPhi = {};
var that = this;

this.jsPhi.point2D = function(_x, _y)
{
	this.x = _x;
	this.y = _y;
}

this.jsPhi.Hexagon = function(_p, _d, _state)
{
	this.p = _p;
	this.d = _d;
	this.state = _state;
	//this.color = "#000000";
	//this.color = 0;

	this.draw = function(c){
		//var t = c.fillStyle;
		//c.fillStyle = this.color;
		var p1 = new that.jsPhi.point2D(0, 0);
		var p2 = new that.jsPhi.point2D(0, 0);
		if(this.state & 1){
			p1.x = this.p.x;
			p1.y = this.p.y - 2*this.d.y;
			p2.x = this.p.x + this.d.x;
			p2.y = this.p.y - this.d.y;
			var t = new that.jsPhi.Triangle(this.p, p1, p2);
			t.draw(c);
		}

		if(this.state & 2){
			p1.x = this.p.x + this.d.x;
			p1.y = this.p.y - this.d.y;
			p2.x = this.p.x + this.d.x;
			p2.y = this.p.y + this.d.y;
			var t = new that.jsPhi.Triangle(this.p, p1, p2);
			t.draw(c);
		}

		if(this.state & 4){
			p1.x = this.p.x + this.d.x;
			p1.y = this.p.y + this.d.y;
			p2.x = this.p.x;
			p2.y = this.p.y + 2*this.d.y;
			var t = new that.jsPhi.Triangle(this.p, p1, p2);
			t.draw(c);
		}

		if(this.state & 8){
			p1.x = this.p.x;
			p1.y = this.p.y + 2*this.d.y;
			p2.x = this.p.x - this.d.x;
			p2.y = this.p.y + this.d.y;
			var t = new that.jsPhi.Triangle(this.p, p1, p2);
			t.draw(c);
		}

		if(this.state & 16){
			p1.x = this.p.x - this.d.x;
			p1.y = this.p.y + this.d.y;
			p2.x = this.p.x - this.d.x;
			p2.y = this.p.y - this.d.y;
			var t = new that.jsPhi.Triangle(this.p, p1, p2);
			t.draw(c);
		}

		if(this.state & 32){
			p1.x = this.p.x - this.d.x;
			p1.y = this.p.y - this.d.y;
			p2.x = this.p.x;
			p2.y = this.p.y - 2*this.d.y;
			var t = new that.jsPhi.Triangle(this.p, p1, p2);
			t.draw(c);
		}
	}
}

this.jsPhi.Triangle = function(p1,p2,p3){
	this.draw = function(c){
		c.beginPath();
		c.moveTo(p1.x,p1.y);
		c.lineTo(p2.x,p2.y);
		c.lineTo(p3.x,p3.y);
		c.fill();
		c.closePath();
	}
}

this.jsPhi.Fluid = {};
this.jsPhi.Fluid.updateCalls = {};

this.jsPhi.Fluid.updateCalls.default = function(scope,nx,ny,i,j){
	//invert the cell states
	var c = scope.cells[i][j].state;
	//c ^= 63;
	var c1 = ((2*c)&63); if (c>=32) c1++; c = c1;
	scope.changeCell(i,j,c);
};

this.jsPhi.Fluid.updateCalls.fhp1 = function(scope,nx,ny,i,j){
	// do not touch solid cells
	if (scope.cells[i][j].state==63) return;
	// indices of adjacent cells
	var inext = new Array(6);
	var jnext = new Array(6);
	var k = i; if (j%2==0) --k;
	inext[0] = k  ; jnext[0] = j+1;
	inext[1] = i-1; jnext[1] = j;
	inext[2] = k  ; jnext[2] = j-1;
	inext[3] = k+1; jnext[3] = j-1;
	inext[4] = i+1; jnext[4] = j;
	inext[5] = k+1; jnext[5] = j+1;
	// toroid wrapping
	for (var k = 0; k<6; k++) {
		if (inext[k]<0) inext[k] = nx-1;
		if (jnext[k]<0) jnext[k] = ny-1;
		if (inext[k]>=nx) inext[k] = 0;
		if (jnext[k]>=ny) jnext[k] = 0;
	}
	for (var k = 0; k<6; k++) {
		var m = 1<<k;
		if (((scope.cells[i][j].state&m) != 0) && ((scope.cells[inext[k]][jnext[k]].state&m) == 0)) {
			// particle propagation
			var s = scope.cells[i][j].state;
			scope.changeCell(i,j,s^m);
			s = scope.cells[inext[k]][jnext[k]].state;
			scope.changeCell(inext[k],jnext[k],s^m);
			// particle collision
			s = scope.cells[inext[k]][jnext[k]].state;
			var s1 = -1;
			if (s==9) s1 = Math.random()<0.5 ? 18:36;
			else if (s==18) s1 = Math.random()<0.5 ? 9:36;
			else if (s==36) s1 = Math.random()<0.5 ? 9:18;
			else if (s==21) s1 = 42;
			else if (s==42) s1 = 21;
			if (s1>=0) scope.changeCell(inext[k],jnext[k],s1);
		} else if (((scope.cells[i][j].state&m) != 0) && (scope.cells[inext[k]][jnext[k]].state == 63)) {
			// bounce off the wall
			var s = scope.cells[i][j].state;
			var k1 = (k+3)%6;
			var m1 = 1<<k1;
			// make sure that the bouncing particle goes to a free slot
			if ((scope.cells[i][j].state&m1) == 0) scope.changeCell(i,j,s^(m|m1));
		}
	}
};

this.jsPhi.FluidSimulation = function(nx,ny,d){
	this.counter = 0;
	this.cells = new Array();
	for (var i = 0; i < nx; i++) {
		this.cells[i] = [];
		//this.cells2[i] = [];
		for (var j = 0; j < ny; j++) {
			var x = d.x + 2*i*d.x;
			var y = 2*d.y + 3*j*d.y;
			if(j%2==1) x += 2*d.x/2;
			var p = new that.jsPhi.point2D(x,y);
			//var state = 0; if (i==10 && j==10) state = 8;
			//var state = 0; if (i%4==0 && j%4==0) state = 8;
			var state = 0; if (i%3==0 && j%3==0 && i<nx/2-1) state = 1<<Math.floor(Math.random()*6);
			//var state = 0; if (i%4==0 && j%4==0) state = 1<<Math.floor(Math.random()*6);
			//var state = Math.floor(Math.random()*64);
			//var state = 0; if (i>=23 && i<=27 && j>=10 && j<=15) state = 63;
			this.cells[i][j] = new that.jsPhi.Hexagon(p,d,state);
			//if (i>=10 && i<=15 && j>=10 && j<=15) this.cells[i][j].color = "#00FFFF";
			//this.cells2[i][j] = new that.jsPhi.Hexagon(p,d,state);
		}
	}

	this.nn = new Array();
	for (var v = 0; v < nx*ny; v++) this.nn[v] = v;

	this.draw = function(c,w,h){
		//console.log(c.width,c.height);
		c.fillStyle = "#FFFFFF";
		c.fillRect(0,0,w,h);
		c.fillStyle = "#000000";
		for (var i = 0; i < nx; i++) {
			for (var j = 0; j < ny; j++) {
				this.cells[i][j].draw(c);
			}
		}

		/*count particles moving in various directions
		var vcount = [0,0,0,0,0,0];
		var vsum = 0;
		for (var i = 0; i < nx; i++) {
			for (var j = 0; j < ny; j++) {
				for (var k = 0; k<6; k++) {
					var m = 1<<k;
					if ((this.cells[i][j].state&m) != 0) { vcount[k]++; vsum++; }
				}
			}
		}
		var text = "";
		for (var k = 0; k<6; k++) {
			if (k!=0) text += "+";
			text += vcount[k];
		}
		text += " = "; text += vsum;*/

		// count particles in different regions
		var vsum1 = 0, vsum2 = 0;
		for (var i = 0; i < nx; i++) {
			for (var j = 0; j < ny; j++) {
				if (this.cells[i][j].state==63) continue;
				for (var k = 0; k<6; k++) {
					var m = 1<<k;
					if ((this.cells[i][j].state&m) != 0) {
						if (i<nx/2) vsum1++; else vsum2++;
					}
				}
			}
		}
		this.counter++;
		var text = this.counter + ": " + vsum1 + "+" + vsum2;
		this.vs1 = vsum1;

		// status line
		c.fillText(text,10,h-20);
	}

	this.changeCell = function(i,j,v){
		this.cells[i][j].state=v;
	}

	this.update = function(upCall){

		var n = this.nn.length;
		for (var i = 0; i < n; i++){
			var i1 = 0; var i2 = 0;
			while (i1==i2) {
			  i1 = Math.floor(Math.random() * n);
			  i2 = Math.floor(Math.random() * n);
		  }
			var t = this.nn[i1];
			this.nn[i1] = this.nn[i2];
			this.nn[i2] = t;
		}

		for (var v = 0; v < n; v++) {
			var i = this.nn[v];
			var x = i % nx;
			var y = Math.floor(i / nx);
			upCall(this,nx,ny,x,y);
		}
	}
}

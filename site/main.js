const canvas = obj('canvas');
const ctx = canvas.getContext('2d');


function loop(){
	setTimeout(loop,1000/30);
	drawBoard();
}

let circles = [];

class Spot{
	constructor(x,y){
		this.x = x;
		this.y = y;
		this.n = 0;
		this.stoneLocations = [];
		circles.push(this);
		this.generateLocations();
	}
	draw(){
		let sp = (canvas.width-80)/8;
		ctx.beginPath();
		ctx.lineWidth = 5;
		ctx.arc(this.x,this.y,sp/2,sp/2,0,Math.PI*2);
		ctx.strokeStyle = 'white';
		ctx.stroke();
		this.drawPebbles();
	}
	drawPebbles(){
		if(this.n==0) return;
		let n = this.n;
		for(let j=0;j<3;j++){
			let r = j==2?8:4;
			for(let i=0;i<r;i++){
				let offsetAngle = j==2?22.5:(j%2)*45;
				let pt = Vector.getPointIn(Vector.rad(offsetAngle+i*360/r),(j+1)*10);
				ctx.beginPath();
				ctx.arc(this.x+pt.x,this.y+pt.y,5,0,Math.PI*2);
				ctx.fillStyle = 'green'
				ctx.fill();
				n--;
				if(n==0) return;
			}
		}
	}
	generateLocations(){
		for(let j=0;j<3;j++){
			let r = j==2?8:4;
			for(let i=0;i<r;i++){
				let offsetAngle = j==2?22.5:(j%2)*45;
				let pt = Vector.getPointIn(Vector.rad(offsetAngle+i*360/r),(j+1)*10);
				this.stoneLocations.push(pt.add(this.x,this.y));
			}
		}
	}
}

function drawBoard(){
	for(let s of circles) s.draw();
	let sp = (canvas.width-80)/8;
	ctx.beginPath();
	ctx.arc(3+sp*.5,canvas.height/4,sp/2,0,Math.PI,true);
	ctx.lineTo(3+sp*.5-sp/2,canvas.height*3/4)
	ctx.arc(3+sp*.5,canvas.height*3/4,sp/2,Math.PI,Math.PI*2,true);
	ctx.lineTo(3+sp*1.5-sp/2,canvas.height/4)
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(canvas.width-3-sp*.5,canvas.height/4,sp/2,0,Math.PI,true);
	ctx.lineTo(canvas.width-3-sp*.5-sp/2,canvas.height*3/4)
	ctx.arc(canvas.width-3-sp*.5,canvas.height*3/4,sp/2,Math.PI,Math.PI*2,true);
	ctx.lineTo(canvas.width-3,canvas.height/4)
	ctx.stroke();
}

function setup(){
	let sp = (canvas.width-80)/8;
	for(let j=0;j<2;j++){
		for(let i=0;i<6;i++){
			new Spot(sp*1.5+sp*(i*1.15+.14),j==0?canvas.height/4:canvas.height*3/4);
		}
	}
}

setup();
loop();
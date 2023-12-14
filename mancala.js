var c = require('./iostream.js');
class Mancala{
	constructor(){
		this.spots = [4,4,4,4,4,4,0,4,4,4,4,4,4,0]; // g1: 6, g2: 13
		this.turn = 0;
	}
	printBoard(){
		const slot1 = (String(this.spots[13])+'  ').slice(0,2);
		const slot2 = (String(this.spots[6])+'  ').slice(0,2);
		console.log(`|${slot1}|(`+this.spots.slice(7,13).reverse().join(')(')+`)|${slot2}|`)
		console.log('|  |('+this.spots.slice(0,6).join(')(')+`)|  |`);
	}
	makeMove(slotSide){
		const THIS = this;
		if(slotSide < 1 || slotSide > 6) return false;
		let ix = slotSide - 1 + this.turn*7;
		if(this.spots[ix] == 0) return false;
		let temp = this.spots[ix];
		this.spots[ix] = 0;
		while(temp >= 1){
			nextSpot();
			this.spots[ix]++;
			temp--;
		}
		if(ix==6&&this.turn==0) return false;
		if(ix==13&&this.turn==1) return false;
		if(this.turn==0&&ix<6&&this.spots[ix]==1){
			let stealIx = (ix+7)%this.spots.length;
			this.spots[6] += this.spots[ix] + this.spots[stealIx];
			this.spots[ix] = 0;
			this.spots[stealIx] = 0;
		}
		if(this.turn==1&&ix<13&&ix>6&&this.spots[ix]==1){
			let stealIx = (ix+7)%this.spots.length;
			this.spots[13] += this.spots[ix] + this.spots[stealIx];
			this.spots[ix] = 0;
			this.spots[stealIx] = 0;
		}
		return true;
		function nextSpot(){
			ix++;
			if(ix==6&&THIS.turn==1) ix++;
			if(ix==13&&THIS.turn==0) ix++;
			ix = ix % THIS.spots.length;
		}
	}
	nextTurn(){
		this.turn = +!this.turn;
		console.log(`Player ${this.turn+1}'s Turn!`)
	}
}

exports.print = async function(){
	let m = new Mancala;
	m.printBoard();
	while(1){
		let n = await c.in('Enter Number: ')
		if(m.makeMove(Number(n))){
			m.nextTurn();
		}
		m.printBoard();
	}
}
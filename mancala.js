var c = require('./iostream.js');
const AUTOPLAY = true;
class Mancala{
	constructor(){
		this.spots = [4,4,4,4,4,4,0,4,4,4,4,4,4,0]; // g1: 6, g2: 13
		this.turn = 0;
	}
	printBoard(){
		console.clear();
		const slot1 = (String(this.spots[13])+'  ').slice(0,2);
		const slot2 = (String(this.spots[6])+'  ').slice(0,2);
		console.log(`Player ${this.turn+1}'s Turn!`);
		console.log(`|${slot1}|(`+this.spots.slice(7,13).reverse().join(')(')+`)|${slot2}|`)
		console.log('|  |('+this.spots.slice(0,6).join(')(')+`)|  |`);
	}
	movePieces(slotSide){
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
			let stealIx = 12-ix;
			if(this.spots[stealIx]>0){
				this.spots[6] += this.spots[ix] + this.spots[stealIx];
				this.spots[ix] = 0;
				this.spots[stealIx] = 0;
			}
		}
		if(this.turn==1&&ix<13&&ix>6&&this.spots[ix]==1){
			let stealIx = 12-ix;
			if(this.spots[stealIx]>0){
				this.spots[13] += this.spots[ix] + this.spots[stealIx];
				this.spots[ix] = 0;
				this.spots[stealIx] = 0;
			}
		}
		let sum1 = this.spots.slice(0,6).reduce(sum);
		let sum2 = this.spots.slice(7,13).reduce(sum)
		if(sum1==0||sum2==0){
			this.spots[6] += sum1;
			this.spots[13] += sum2;
			for(let i=0;i<6;i++) this.spots[i]=0;
			for(let i=7;i<13;i++) this.spots[i]=0;
			throw 'Game Over';
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
	}
	makeMove(n){
		try{
			if(this.movePieces(Number(n))){
				this.nextTurn();
			}
			this.printBoard();
			if(this.turn == 1 && AUTOPLAY){
				const THIS = this;
				setTimeout(()=>{
					THIS.makeRandomMove.bind(THIS).call();
				},500);
			}

		} catch(e){
			if(typeof e == 'string'){
				this.printBoard();
				return true;
			} else {
				throw e;
			}
		}
		return false;
	}
	evaluate(){
		let s1 = this.spots[6];
		let s2 = this.spots[13];
		let w = s1==s2?'Even':s1>s2?'Player 1':'Player 2';
		return {
			p1: s1,
			p2: s2,
			diff: s2-s2,
			winning: w
		}
	}
	getPossibleMoves(){
		let possibilities = [];
		if(this.turn == 0){
			for(let i=0;i<6;i++) if(this.spots[i]!=0) possibilities.push(i+1);
		} else {
			for(let i=7;i<13;i++) if(this.spots[i]!=0) possibilities.push(i-6);
		}
		return possibilities;
	}
	makeRandomMove(){
		let pos = this.getPossibleMoves().sort(()=>Math.random()-.5);
		if(pos.length == 0){
			this.end();
			return;
		}
		this.makeMove(pos[0]);
	}
	end(){
		this.printBoard();
		console.log('Game Over!');
		console.log(this.evaluate().winning+' won!');
	}
}

const sum=(a,b)=>a+b;

exports.print = async function(){
	let m = new Mancala;
	m.printBoard();
	while(1){
		let n = await c.in('Enter Number: ');
		if(m.makeMove(n)) break;
	}
	m.end();
}
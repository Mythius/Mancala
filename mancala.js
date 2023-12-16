var c = require('./iostream.js');
const AUTOPLAY = false;
const BOT_DEPTH = 9;
class Mancala{
	constructor(){
		this.spots = [4,4,4,4,4,4,0,4,4,4,4,4,4,0]; // g1: 6, g2: 13
		// this.spots = [5,4,0,5,5,0,2,5,5,0,6,5,5,1];
		this.turn = 0;
		this.branches = [];
		this.apoints = 0;
		this.moveMade = 0;
		this.over = false;
		this.moves = [];
	}
	printBoard(){
		console.clear();
		const slot1 = (String(this.spots[13])+'  ').slice(0,2);
		const slot2 = (String(this.spots[6])+'  ').slice(0,2);
		console.log(`Moves: `+this.moves.join(','));
		console.log(`Player ${this.turn+1}'s Turn!`);
		console.log(`|${slot1}|(`+this.spots.slice(7,13).reverse().join(')(')+`)|${slot2}|`)
		console.log('|  |('+this.spots.slice(0,6).join(')(')+`)|  |`);
		console.log('Current Eval: '+this.evaluate().diff);
		// if(!this.over) this.chooseBestMove(BOT_DEPTH,true);
		// console.log(this.spots.join(','));
		// console.log(this);
	}
	loadPosition(pos){
		for(let i=0;i<this.spots.length;i++) this.spots[i] = pos.spots[i];
		this.turn = pos.turn;
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
		if(ix==6&&this.turn==0) return false;
		if(ix==13&&this.turn==1) return false;
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
	makeMove(n,ap=true){
		this.moveMade = n;
		this.moves.push(n);
		try{
			if(this.movePieces(Number(n))){
				this.nextTurn();
			}
			if(ap) this.printBoard();
			if(this.turn == 1 && ap && AUTOPLAY){
				const THIS = this;
				setTimeout(()=>{
					if(this.getPossibleMoves().length>0) THIS.makeComputerMove.bind(THIS).call();
				},500);
			}

		} catch(e){
			if(typeof e == 'string'){
				this.over = true;
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
			diff: s1-s2,
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
	makeComputerMove(){
		if(this.getPossibleMoves().length>0){
			this.makeMove(this.chooseBestMove(BOT_DEPTH));
		} else {
			throw 'Game Over';
		}
	}
	end(){
		this.printBoard();
		console.log('Game Over!');
		console.log(this.evaluate().winning+' won!');
	}
	generateBranches(depth=1,log=false){
		if(depth==0){
			this.apoints = this.evaluate().diff;
			return this;
		}
		for(let pos of this.getPossibleMoves()){
			let ng = this.clone();
			ng.makeMove(pos,false);
			ng.generateBranches(depth-1,log);
			this.branches.push(ng);
		}
		this.branches.sort((a,b)=>b.apoints-a.apoints);
		if(this.branches.length==0){
			this.apoints = this.evaluate().diff;
			return this;
		} else {
			if(this.turn == 0){
				this.apoints = this.branches[0].apoints;
				if(log) console.log('DEPTH: '+depth+', CHOICE:'+this.branches[0].moveMade+', EVAL: '+this.apoints)
				return this.branches[0];
			} else {
				this.apoints = this.branches[this.branches.length-1].apoints;
				if(log) console.log('DEPTH: '+depth+', CHOICE:'+this.branches[this.branches.length-1].moveMade+', EVAL: '+this.apoints)
				return this.branches[this.branches.length-1];
			}
		}
	}
	chooseBestMove(depth=1,log=false){
		this.branches = [];
		let branch = this.generateBranches(depth,false);
		if(log) console.log(`Best Move: ${branch.moveMade} (${branch.apoints})`)
		return branch.moveMade;
	}
	clone(){
		let nm = new Mancala;
		for(let i=0;i<this.spots.length;i++) nm.spots[i] = this.spots[i];
		nm.turn = this.turn;
		return nm;
	}
}

const sum=(a,b)=>a+b;

exports.evaluate = function(pos,d=BOT_DEPTH){
	let m = new Mancala;
	m.loadPosition(pos);
	return m.chooseBestMove(d);
}

exports.print = async function(){
	let m = new Mancala;
	m.printBoard();
	while(1){
		let n = await c.in('Enter Number: ');
		if(m.makeMove(n)) break;
	}
	m.end();
	m.makeRandomMove();
}
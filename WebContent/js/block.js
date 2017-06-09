/*
 * define different kinds of blocks
 */
var BlockBase = function(x, y, img, cxt, panelInfo) {// block base

	this.x = x;
	this.y = y;
	this.img = img;
	this.cxt = cxt;
	this.pinfo = panelInfo;

	this.yspeed = -4;// all blocks move up

	this.sprite = null;

	this.dismiss = false;// block disappear
};
BlockBase.prototype = {

	init : function() {// init

		this.initSprite();
	},
	initSprite : function() {},
	draw : function() {// draw the sprite

		this.sprite.draw();
	},
	update : function() {// update

		this.sprite.update();

		this.childUpdate();
	},
	childUpdate : function() {},
	checkMap : function() {// check block whether beyond the edge

		var size = this.sprite.size();

		if (size.y <= 0)
			return true;

		return false;
	},
	ManOn : function(man) {},// is man on block?

	size : function() {// block size

		return this.sprite.size();
	}
};

var NormalBlock = function(x, y, img, cxt, panelInfo) {// Normal Block

	/**
	 * var a={name:"haha"}; function b(){alert(this.name);} var test =
	 * function() { return b.apply(a,arguments); }; test();
	 */
	// transfer all the values from normal block to block base
	BlockBase.apply(this, arguments);
};
NormalBlock.prototype = new BlockBase();

NormalBlock.prototype.initSprite = function() {// init normal block

	var sprite = new WF.sprite.Sprite(this.img, this.cxt, 1, {x : this.x,y : this.y,yspeed : this.yspeed});

	sprite.add("normal", new WF.sprite.Animation({sw : 200,sh : 32,width : 100,height : 16,dir : "down"}));

	this.sprite = sprite;
};
NormalBlock.prototype.ManOn = function(man) {

	man.changeSpeed(0, this.yspeed);
};

var MissBlock = function(x, y, img, cxt, panelInfo) {// Miss block
	BlockBase.apply(this, arguments);

	this.restTime = 30;

	this.isStand = false;
};
MissBlock.prototype = new BlockBase();

MissBlock.prototype.initSprite = function() {// init miss block

	var sprite = new WF.sprite.Sprite(this.img, this.cxt, 1, {x : this.x,y : this.y,yspeed : this.yspeed});

	sprite.add("normal", new WF.sprite.Animation({startY : 32,sw : 200,sh : 32,width : 100,height : 16,dir : "down"}));

	this.sprite = sprite;
};
MissBlock.prototype.ManOn = function(man) {// is man on this miss block

	man.changeSpeed(0, this.yspeed);

	this.isStand = true;
};
MissBlock.prototype.childUpdate = function() {//

	// isStand is Stand?
	if (!this.isStand)
		return false;

	this.restTime--;// break time

	if (this.restTime <= 0) {
		// the block will be disappeared
		this.dismiss = true;
	}
};

var LeftBlock = function(x, y, img, cxt, panelInfo) {// Left Move Block
	BlockBase.apply(this, arguments);

	this.xforce = -4;
};
LeftBlock.prototype = new BlockBase();

LeftBlock.prototype.initSprite = function() {// init
	var sprite = new WF.sprite.Sprite(this.img, this.cxt, 5, {x : this.x,y : this.y,yspeed : this.yspeed});

	sprite.add("normal", new WF.sprite.Animation({sw : 200,sh : 32,width : 100,height : 16,dir : "down",fs : 2,loop : true}));

	this.sprite = sprite;
};
LeftBlock.prototype.ManOn = function(man) {

	man.changeSpeed(0, this.yspeed);

	man.setXForce(this.xforce);
};

var RightBlock = function(x, y, img, cxt, panelInfo) {// Right Move Block

	BlockBase.apply(this, arguments);

	this.xforce = 4;
};
RightBlock.prototype = new BlockBase();

RightBlock.prototype.initSprite = function() {// init
	var sprite = new WF.sprite.Sprite(this.img, this.cxt, 5, {x : this.x,y : this.y,yspeed : this.yspeed});

	sprite.add("normal", new WF.sprite.Animation({startY : 64,sw : 200,sh : 32,width : 100,height : 16,dir : "down",fs : 2,loop : true}));

	this.sprite = sprite;
};
RightBlock.prototype.ManOn = function(man) {

	man.changeSpeed(0, this.yspeed);

	man.setXForce(this.xforce);
};

var ThornBlock = function(x, y, img, cxt, panelInfo) {// Thorn Block

	BlockBase.apply(this, arguments);

	this.cut = 50;
};
ThornBlock.prototype = new BlockBase();

ThornBlock.prototype.initSprite = function() {// init

	var sprite = new WF.sprite.Sprite(this.img, this.cxt, 1, {x : this.x,y : this.y,yspeed : this.yspeed});

	sprite.add("normal", new WF.sprite.Animation({sw : 200,sh : 32,width : 100,height : 16,dir : "down"}));

	this.sprite = sprite;
};
ThornBlock.prototype.ManOn = function(man) {

	man.cutLift(this.cut);//HP change

	man.changeSpeed(0, this.yspeed);
};

var FlipBlock = function(x,y,img,cxt,panelInfo){//Flip Block

	BlockBase.apply(this,arguments);

	this.flipcount = 5;

	this.isStand = false;
};
FlipBlock.prototype = new BlockBase();

FlipBlock.prototype.initSprite = function(){//init

	var sprite = new WF.sprite.Sprite(this.img,this.cxt,1,{x:this.x,y:this.y,yspeed:this.yspeed});
	//three status for the flip,so create three frame animations
	sprite.add("normal",new WF.sprite.Animation({sw:200,sh:32,width:100,height:16,dir:"down"}));
	sprite.add("down",new WF.sprite.Animation({startY:32,sw:200,sh:24,width:100,height:12,dir:"down"}));
	sprite.add("up",new WF.sprite.Animation({startY:56,sw:200,sh:43,width:100,height:22,dir:"down"}));

	this.sprite = sprite;
};
FlipBlock.prototype.changeDir = function(dir){//when the flip status change
											//y-axis speed change as well
	var o_size = this.sprite.size();

	this.sprite.change(dir);

	var n_size = this.sprite.size();

	var y = (o_size.h - n_size.h) + o_size.y;

	this.sprite.move(o_size.x,y);
};
FlipBlock.prototype.ManOn = function(man){//Man on, flip status change to "down"

	this.changeDir("down");

	man.changeSpeed(0,this.yspeed);

	this.isStand = true;

	man.goUp();//flip
};
FlipBlock.prototype.childUpdate = function(){
	
	//isStand
	if(!this.isStand)return false;

	this.flipcount--;//flip count default as 5

	if(this.flipcount <= 0){

		this.isStand = false;
		this.flipcount = 5;

		this.changeDir("up");
	}
};

var BlockFactory = {//block factory
		imgs : {
			"block":null,
			"move":null,
			"flip":null,
			"thorn":null
		},
		gameinfo : null,
		cxt : null,
		init : function(param){//init

			this.imgs.block = param.block;
			this.imgs.move = param.move;
			this.imgs.flip = param.flip;
			this.imgs.thorn = param.thorn;

			this.gameinfo = param.gameinfo;
			this.cxt = param.cxt;
		},
		create : function(){//create blocks randomly
			//Math.random()*14 return a number between 0-13
			var rnd = Math.floor(Math.random()*14);

			var rnd_x = Math.floor(Math.random()*224);

			var x = rnd_x;
			var y = 460;

			var block;

			switch(rnd){
				case 0:
				case 1:
				case 2:
					block = new NormalBlock(x,y,this.imgs.block,this.cxt,this.gameinfo);
					break;
				case 3:
				case 4:
					block = new MissBlock(x,y,this.imgs.block,this.cxt,this.gameinfo);
					break;
				case 5:
				case 6:
				case 7:
					block = new LeftBlock(x,y,this.imgs.move,this.cxt,this.gameinfo);
					break;
				case 8:
				case 9:
				case 10:
					block = new RightBlock(x,y,this.imgs.move,this.cxt,this.gameinfo);
					break;
				case 11:
				case 12:
					block = new FlipBlock(x,y,this.imgs.flip,this.cxt,this.gameinfo);
					break;
				case 13:
					block = new ThornBlock(x,y,this.imgs.thorn,this.cxt,this.gameinfo);
					break;
			}

			block.init();

			return block;
		}
};

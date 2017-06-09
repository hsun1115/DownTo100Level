/*
 * Person Definition
 */
var Person = function(x,y,img,cxt,panelInfo) {
	this.x = x;
	this.y = y;
	this.img = img;
	this.cxt = cxt;
	this.pinfo = panelInfo;// game panel

	this.xspeed = 7;// x-axis speed***
	this.yspeed = 4;// y-axis speed***

	this.yaspeed = 0.2;// y-axis accelerate

	this.life = 10;// HP***

	this.lifeAdd = 0.5;// HP healing speed

	this.dir = "down";// direction

	this.lastKey = "";// 

	this.sprite = null;// sprite

	this.isJump = true;// check whether falling(not on any block)

	this.isFilp = false;// check whether up from filp

	this.block = null;// block

	this.isDead = false;// whether Dead

	this.init();// init
};
Person.prototype = {
	init : function() {// init

		this.initSprite();

		this.sprite.setYSpeed(this.yspeed, this.yaspeed);
	},
	initSprite : function() {// init the sprite
		// function in WFN can create sprite(person here)
		var sprite = new WF.sprite.Sprite(this.img, this.cxt, 10, {
			x : this.x,
			y : this.y
		});

		sprite.add("down", new WF.sprite.Animation({
			startX : 64,
			sw : 64,
			sh : 64,
			width : 32,
			height : 32
		}));
		sprite.add("normal", new WF.sprite.Animation({
			sw : 64,
			sh : 64,
			width : 32,
			height : 32
		}));
		sprite.add("up", new WF.sprite.Animation({
			startX : 128,
			sw : 64,
			sh : 64,
			width : 32,
			height : 32
		}));
		sprite.add("right", new WF.sprite.Animation({
			startX : 320,
			fs : 2,
			sw : 64,
			sh : 64,
			width : 32,
			height : 32,
			loop : true
		}));
		sprite.add("left", new WF.sprite.Animation({
			startX : 192,
			fs : 2,
			sw : 64,
			sh : 64,
			width : 32,
			height : 32,
			loop : true
		}));

		this.sprite = sprite;
	},

	changeDir : function(dir, flag) {// change direction

		this.lastKey = dir;

		if (this.isDead)return false;

		if (dir == this.dir && (dir == "left" || dir == "right"))return false;

		if (this.isJump == false || dir == "down" || dir == "up") {

			this.dir = dir;

			this.sprite.change(this.dir);
		}

		var xforce = this.block ? this.block.xforce || 0 : 0;// x-axis block
		// push force

		// set the x-axis speed based on the direction
		if (dir == "left")
			this.sprite.setXSpeed(this.xspeed * -1 + xforce);
		else if (dir == "right")
			this.sprite.setXSpeed(this.xspeed + xforce);
		else if (dir == "normal" && !flag)
			this.sprite.setXSpeed(xforce);
	},

	draw : function() {// draw person

		this.sprite.draw();
	},

	update : function() {// update

		this.sprite.update();
		// update HP
		this.life += this.lifeAdd;
		if (this.life >= 100)
			this.life = 100;

		//alert("1");
		// detect the edge(Person x-axis range 0px - 320px)
		var f_size = this.size();
		//alert("2");
		var x = f_size.x;
		var y = f_size.y;

		// whether person beyond the left edge
		if (x <= 0)
			x = 0;
		// whether person beyond the right edge
		if (f_size.r >= this.pinfo.w)
			x = this.pinfo.w - f_size.w;

		// whether person beyond the bottom edge and also in jump status
		if (f_size.b >= this.pinfo.h && this.isJump == true) {
			// Person's y-axis location
			y = this.pinfo.h - f_size.h;

			// if person beyond the bottom edge and also in jump\
			// status, then game over
			this.dead();
		}

		// whether person beyond the top edge
		// if yes, game over
		if (f_size.y <= 0)this.dead();

		// leave the block?
		if (this.block) {

			var b_size = this.block.size();
			// person not on the block then go down
			if (f_size.r <= b_size.x || f_size.x >= b_size.r) {

				this.goDown();
			}
		}

		// leave the Flip block and y-axis speed>0
		if (this.isFilp && this.sprite.yspeed >= 0) {

			this.goDown();
		}
		// person move
		this.move(x, y);
	},

	dead : function() {// dead

		this.sprite.setXSpeed(0);
		this.sprite.setYSpeed(0);

		this.changeDir("normal");

		this.isDead = true;
	},

	setXForce : function(xforce) {// set X-axis force

		if (this.dir == "left") {
			this.sprite.setXSpeed(this.xspeed * -1 + xforce);
		} else if (this.dir == "right") {
			this.sprite.setXSpeed(this.xspeed + xforce);
		} else if (this.dir == "normal") {
			this.sprite.setXSpeed(xforce);
		}
	},
	cutLift : function(cut) {// cut HP

		this.life -= cut;

		if (this.life <= 0)
			this.dead();
	},

	goDown : function() {
		// direction normal, x-axis speed=0
		if (this.dir == "normal")
			this.sprite.setXSpeed(0);
		// y-axis speed increase based on its accelerate
		this.sprite.setYSpeed(this.yspeed, this.yaspeed);
		this.changeDir("down");
		this.isJump = true;
		this.isFilp = false;

		this.block = null;// no block
	},

	goUp : function() {

		this.changeDir("up");

		this.isJump = true;

		this.isFilp = true;

		this.block = null;

		// y-axis speed, accelerate
		this.sprite.setYSpeed(this.yspeed * -2, 0.4);
	},

	move : function(x, y) {// move

		this.sprite.move(x, y);
	},

	checkBlockOn : function(block) {// check person on the block?

		if (!this.isJump)return false;

		var m_size = this.size();
		var b_size = block.sprite.size();

		if (m_size.r > b_size.x && m_size.x < b_size.r) {

			if (m_size.b >= b_size.y && m_size.b <= b_size.b + 4) {

				this.standBlock(m_size.x, b_size.y - m_size.h);

				this.block = block;

				block.ManOn(this);

				return true;
			}
		}

		return false;
	},

	standBlock : function(x, y) {// on the block==true
		// change person's status
		this.move(x, y);

		this.isJump = false;

		if (this.lastKey == "left" || this.lastKey == "right") {
			this.changeDir(this.lastKey);
		} else {
			this.changeDir("normal", true);
		}
	},

	size : function() {// size

		return this.sprite.size();
	},
	
	changeSpeed : function(xspeed,yspeed){//change the x and y-axis speed

		if(xspeed)this.sprite.setXSpeed(xspeed);
		if(yspeed)this.sprite.setYSpeed(yspeed);
	}


};
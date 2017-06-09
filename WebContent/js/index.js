/*
 * Game main logical portal, processing main logical issues
 */
var Main = {
	gameInfo : {w : 0,h : 0},// game display size
	cxt : null, // context
	person : null,
	timeQueue : null, // time queue
	time : 0,
	leveltime : 0, // level time
	level : 0, // level
	imgs : [], // graphs
	blocks : [], // blocks
	init : function() {// initialization

		Main.initStart();
	},

	initStart : function() {// init start

		Main.initData();
	},

	initData : function() {// init data
		// WF.file.imgs Image operation
		// getId() get page element
		WF.file.imgs([ "https://rawgit.com/hsun1115/hsun115.github.io/master/WebContent/img/man.png", "https://rawgit.com/hsun1115/hsun115.github.io/master/WebContent/img/block.png", "https://rawgit.com/hsun1115/hsun115.github.io/master/WebContent/img/move.png",
				"https://rawgit.com/hsun1115/hsun115.github.io/master/WebContent/img/thorn.png", "https://rawgit.com/hsun1115/hsun115.github.io/master/WebContent/img/flip.png", "https://rawgit.com/hsun1115/hsun115.github.io/master/WebContent/img/thorn_bg.png" ],
				function(imgs) {
					Main.imgs = imgs;// save the image array onload from
										// wfn.js

					var canvas = WF.getId("canvas");

					Main.gameInfo.w = canvas.offsetWidth;// offset width
					Main.gameInfo.h = canvas.offsetHeight;// offset height

					Main.cxt = canvas.getContext("2d");// get a drawable
														// context from the page
					// block=display div; none=hide div
					WF.getId("js_start_loading").style.display = "none";// hide
																		// the
																		// loading
																		// text
					WF.getId("js_start_btn").style.display = "block";// display
																		// the
																		// play
																		// btn
				});
	},
	start : function() {// start
		WF.getId("js_start_flush").style.display = "none";
		// Three Main things init Person,Blocks,Event
		// init the Person
		Main.person = new Person(150, 0, Main.imgs[0], Main.cxt, Main.gameInfo);
		// init Blocks
		Main.initBlock(Main.imgs);
		// init event
		Main.initEvent();

		// start the game and play
		Main.process();
	},

	initBlock : function(imgs) {// init block

		BlockFactory.init({ // init the block factory
			block : imgs[1],
			move : imgs[2],
			flip : imgs[4],
			thorn : imgs[3],
			cxt : Main.cxt,
			gameinfo : Main.gameInfo
		});

		var block = new NormalBlock(120, 460, imgs[1], Main.cxt, Main.gameInfo);

		block.init();

		Main.blocks.push(block); // push all inited blocks into an array
	},

	initEvent : function() {// init event

		WF.getId("js_main").onkeydown = function(e) {Main.keyDown(e);};
		WF.getId("js_main").onkeyup = function(e) {Main.keyUp(e);};

	},

	keyDown : function(e) {// key pressed

		if (e.keyCode == 37) {

			this.person.changeDir("left");
		}
		if (e.keyCode == 39) {

			this.person.changeDir("right");
		}

		e.preventDefault();// prevent the other keys work
	},

	keyUp : function(e) {// key released

		if (e.keyCode == 37 || e.keyCode == 39) {

			this.person.changeDir("normal");
		}

		e.preventDefault();
	},
	process : function() {// game processing
		// create a time process
		
		var tq = new WF.time.TimeProcess();

		tq.add(Main.draw, null, Main);
		tq.add(Main.update, null, Main);

		this.timeQuene = tq; // game time process
		this.timeQuene.start();
	},
	draw : function() {

		Main.cxt.clearRect(0, 0, Main.gameInfo.w, Main.gameInfo.h);// clear the
																	// game area

		Main.drawThornBg();// draw thorn background

		Main.person.draw();// draw person

		// draw blocks
		for ( var i = 0, l = Main.blocks.length; i < l; i++) {

			if (!Main.blocks[i])continue;

			Main.blocks[i].draw();
		}

		// Set Person's HP
		WF.getId("js_life").style.width = Main.person.life + "px";
		// Set Level
		WF.getId("js_level").innerHTML = Main.level;
	},
	drawThornBg : function() {

		for ( var i = 0; i <= 35; i++) {
			// cxt.drawImage(image,8 parameters)
			// this will draw 35 thorns on the top of the game window
			Main.cxt.drawImage(Main.imgs[5], 0, 0, 18, 21, i * 9, 0, 9, 11);
		}
	},
	update : function() {// update

		// update time
		Main.time++;

		// update level
		if (Main.time >= 40) {

			Main.blocks.push(BlockFactory.create());

			Main.time = 0;// time
			Main.leveltime += 2;// level time

			// Math.floor(4.6)==>>4。
			Main.level = Math.floor(Main.leveltime / 10);// level
		}

		// Person update
		Main.person.update();

		if (Main.person.isDead) {

			Main.over();// game over

			WF.getId("js_life").style.width = "0px";

			return false;
		}
		

		// block update
		for ( var i = 0, l = Main.blocks.length; i < l; i++) {

			var block = Main.blocks[i];

			if (!block)continue;

			block.update();

			// check block status
			if (block.checkMap() || block.dismiss) {
				// remove block
				Main.removeBlock(block);

				i--;
				// block dismiss and person on a block!=null
				if (block.dismiss && Main.person.block)Main.person.goDown();
				// block is empty
				block = null;

				continue;
			}
			// Man on a block?
			if (Main.person.checkBlockOn(block)) {}
		}

	},

	over : function() {

		// time queue stopped

		this.timeQuene.stop();

		// display the game over info
		WF.getId("js_end_flush").style.display = "block";
		if (this.level >= 3) {

			WF.getId("js_end_flush").getElementsByTagName("p")[0].innerHTML = "Good Job! You reach the Level<label>"+ this.level + "</label> Well Done!";
			WF.getId("js_end_flush").getElementsByTagName("a")[0].innerHTML = "Want start again?";
			WF.getId("js_end_flush").getElementsByTagName("span")[0].className = "icon happy";
		} else {
			WF.getId("js_end_flush").getElementsByTagName("p")[0].innerHTML = "You only reach the Level <label>"+ this.level + "</label>!";
			WF.getId("js_end_flush").getElementsByTagName("a")[0].innerHTML = "Try harder next time!";
			WF.getId("js_end_flush").getElementsByTagName("span")[0].className = "icon";
		}

	},
	removeBlock : function(block) {
		// here block is an array
		Main.blocks.splice(Main.blocks.indexOf(block), 1);
	},	
	replay : function(){

		Main.blocks = [];
		Main.time = 0;
		Main.leveltime = 0;
		Main.level = 0;
		Main.person.life = 100;

		Main.start();

		WF.getId("js_end_flush").style.display = "none";
	}
};
Main.init();
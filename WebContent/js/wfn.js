/*
 * public method, basic file
 */
var WF = function() {
	function getId(id) { // get a certain element from the page
		return typeof id == "string" ? document.getElementById(id) : id;
	}
	function reg(space, obj) {// name space
		var namespace = exports[space] || {};
		for ( var key in obj) {
			namespace[key] = obj[key];
		}
		exports[space] = namespace;
	}
	var exports = {
			getId : getId,
			reg : reg
		};
	
	return exports;
}();

WF.reg("file", function() {

	function imgs(arrUrl, cb) {// arrUrl: img array URL, cb: callback
		var count = 0;
		var imgs = [];// return image array

		for ( var i = 0; i < arrUrl.length; i++) {
			var img = new Image();
			img.onload = function() {
				this.onload = null;
				imgs.push(this);
				count += 1;
				img = null;
				if (count >= arrUrl.length) {
					imgs.sort(function(a, b) {
						return a.index - b.index;
					});
					;
					cb && cb(imgs);
				}
			};
			img.index = i;
			img.src = arrUrl[i];
		}
	}
	var exports = {
		imgs : imgs,
	};
	return exports;
}());

WF.reg("sprite", function() {// person or block

	// definition of frame
	/**
	 * @param x
	 *            int f In game person start x-axis
	 * @param y
	 *            int f In game person start y-axis
	 * @param w
	 *            int f in game person width
	 * @param h
	 *            int f in game person height
	 * @param dw
	 *            int f real width
	 * @param dh
	 *            int f real height
	 */
	var Frame = function(x,y,w,h,dw,dh){
		
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.dw = dw;
		this.dh = dh;	
	};

	// define a sprite animation
	/**
	 * {startX:192,fs:2,sw:64,sh:64,width:32,height:32,loop:true}
	 * 
	 * @param arr
	 *            Array frame array
	 * @param repeat
	 *            boolean animation repeat?
	 */
	var Animation = function(param) {

		this.startX = param.startX || 0;
		this.startY = param.startY || 0;
		this.fs = param.fs || 1;
		this.sw = param.sw || 0;// width and height from image
		this.sh = param.sh || 0;
		this.width = param.width || param.sw; // draw width and height for
		// play
		this.height = param.height || param.sh;
		this.dir = param.dir || "right";
		this.loop = !!param.loop;
		// this.fps = param.fps || 30;

		// this.lazy = 1000 / this.fps;
		// this.last = 0;

		// put frame image here
		this.ls = [];
		// current frame
		this.current = null;
		// current frame index
		this.index = -1;

		this.init();
	};
	Animation.prototype = {
		init : function() {// init frame animation(person)

			for ( var i = 0; i < this.fs; i++) {

				var x = this.startX + (this.dir == "right" ? i * this.sw : 0);
				var y = this.startY + (this.dir == "down" ? i * this.sh : 0);

				var frame = new Frame(x, y, this.sw, this.sh, this.width,
						this.height);
				// push frame into the array
				this.ls.push(frame);
			}

			this.index = 0;
			this.current = this.ls[0];
		},
		// next frame
		next : function() {

			if (this.index + 1 >= this.ls.length) {// current frame index+1 >=
				// ls length

				if (this.loop) {// is loop?
					//
					this.current = this.ls[0];// current frame
					this.index = 0;// current fame index
				}
			} else {// current frame index+1 < ls length

				this.index += 1;// current frame index++

				this.current = this.ls[this.index];// get the current
			}
		},
		// reset the animation
		reset : function() {

			this.current = this.ls[0];
			this.index = 0;
		},
		size : function() {// Person size

			return {
				w : this.width,
				h : this.height
			};
		}
	};

	// Definition of a sprite
	/**
	 * @param objParam
	 *            object json animation object
	 *            {"left":[frame1,frame2],"right":[frame1,frame2]}
	 * @param def
	 *            string default animation index
	 * @param img
	 *            object sprite image
	 * @param cxt
	 *            object canvas object
	 * @param x
	 *            int sprite start position x
	 * @param y
	 *            int sprite end position y
	 */
	var Sprite = function(img, cxt, fps, param) {

		this.animations = {};
		this.img = img;
		this.cxt = cxt;
		this.x = param.x || 0; // if param has value use that value
		this.y = param.y || 0;
		this.fps = fps;// frame per second

		this.xspeed = param.xspeed || 0;// x speed
		this.yspeed = param.yspeed || 0;// y speed

		this.yaspeed = param.yaspeed || 0;// y accelerate

		this.lazy = 1000 / this.fps;// delay
		this.last = 0;// continuous

		this.moveLazy = 33;// delay movement
		this.moveLast = 0;// continuous movement

		// current animation
		this.index = null;

		this.key = "";// current key
	};
	Sprite.prototype = {// set the key animation
		add : function(key, animation) {

			this.animations[key] = animation;

			if (!this.index) {
				this.index = animation;
				this.key = key;
			}
		},
		// ********
		// modify the current animation
		change : function(key) {

			if (key == this.key)return false;

			var index = this.animations[key];

			if (!index)return false;

			this.index = index;
			this.okey = this.key;// the last pressed key
			this.key = key;
			this.index.reset();// reset animation
		},
		// draw the current frame
		draw : function() {

			if (!this.index || !this.img)return false;

			var frame = this.index.current;

			this.cxt.drawImage(this.img, frame.x, frame.y, frame.w, frame.h,
					this.x, this.y, frame.dw, frame.dh);
		},
		// update the current sprite frame animation
		update : function() {
			// get the current time
			// return the ms value start from Jan, 1st, 1970
			var t = new Date().getTime();

			// time difference=current time-duration
			var diff = t - this.last;

			// move difference = current time-move duration
			var moveDiff = t - this.moveLast;

			if (this.last == 0) {// duration(start time)
				diff = this.lazy;// time difference is the delay time
				moveDiff = this.moveLazy;// move difference is the move delay
			}

			if (diff >= this.lazy) {// time difference >= delay

				this.index.next();// the next frame of current animation

				this.last = t;
			}

			if (moveDiff >= this.moveLazy) {
				// y-axis accelerate is not null
				if (this.yaspeed)
					this.yspeed += this.yaspeed;

				if (this.xspeed)
					this.x += this.xspeed;// increase x-axis speed

				if (this.yspeed)
					this.y += this.yspeed;// increase y-axis speed

				this.moveLast = t;
			}
		},

		setXSpeed : function(xs) {

			this.xspeed = xs;
		},
		// set Y-axis speed and accelerate
		setYSpeed : function(ys, yas) {

			this.yspeed = ys;
			this.yaspeed = yas || 0;
		},
		// return the size of current sprite
		size : function() {

			var frame = this.index.current;

			return {
				w : frame.dw,
				h : frame.dh,
				x : this.x,
				y : this.y,
				r : this.x + frame.dw,
				b : this.y + frame.dh
			};
		},
		// move
		move : function(x, y) {

			this.x = x;
			this.y = y;
		}
	};

	var exports = {// return the current person frame animation
		Frame : Frame,
		Animation : Animation,
		Sprite : Sprite
	};
	return exports;

}());

WF.reg("time", function() {

	// define a frame management class, compatible
	var requestAnimationFrame = window.requestAnimationFrame
								|| window.mozRequestAnimationFrame
								|| window.webkitRequestAnimationFrame
								|| function(cb){setTimeout(cb,1000/60)};
				//first three lines allow all kinds of browsers able to use the API

	var TimeProcess = function() {//Timer

		this.list = [];
		this.isStart = false;
	}
	TimeProcess.prototype = {

		add : function(cb, param, context) {

			this.list.push({
				cb : cb,
				param : param,
				context : context
			});
		},
		start : function() {

			this.isStart = true;

			var self = this;// TimeProcess
			//Auto get the current animation frame
			requestAnimationFrame(function(){
				
				var item = null,
					p = [];
							
				for(var i=0;i<self.list.length;i++){

					item = self.list[i];// timeQuene request item during game
										// processing

					item.cb.apply(item.context, item.param);// 1¡¢Main.draw
														// 2¡¢Main.update
				}
				/**
				 * requestAnimationFrame API manage and detect the frame use
				 * requestAnimationFrame£¬send a callback parameter£¬ so for the
				 * next frame, will use callback¡£
				 */
				if(self.isStart)requestAnimationFrame(arguments.callee);
					
				/**
				 * arguments.callee call itself 1¡¢Arguments
				 * [function.]arguments[n] function £ºthe current processing
				 * function object name ¶þ¡¢callee [function.]arguments.callee
				 * optional
				 */

			});
		},
		stop : function() {

			this.isStart = false;
			
		}
	}

	var exports = {
		TimeProcess : TimeProcess
	};
	return exports;

}());

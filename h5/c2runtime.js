
window["cr_getC2Runtime"] = function()
{
	var canvas = document.getElementById("c2canvas");
	if (canvas)
		return canvas["c2runtime"];
	else if (window["c2runtime"])
		return window["c2runtime"];
	else
		return null;
}
window["cr_setSuspended"] = function(s) {
	var runtime = window["cr_getC2Runtime"]();
	if (runtime)
		runtime["setSuspended"](s);
}


cr.plugins_.Sprite = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var pluginProto = cr.plugins_.Sprite.prototype;
	pluginProto.Type = function (plugin) {
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;

	function frame_getDataUri() {
		if (this.datauri.length === 0) {
			var tmpcanvas = document.createElement("canvas");
			tmpcanvas.width = this.width;
			tmpcanvas.height = this.height;
			var tmpctx = tmpcanvas.getContext("2d");
			if (this.spritesheeted) {
				tmpctx.drawImage(this.texture_img, this.offx, this.offy, this.width, this.height,
					0, 0, this.width, this.height);
			}
			else {
				tmpctx.drawImage(this.texture_img, 0, 0, this.width, this.height);
			}
			this.datauri = tmpcanvas.toDataURL("image/png");
		}
		return this.datauri;
	};
	typeProto.onCreate = function () {
		if (this.is_family)
			return;
		var i, leni, j, lenj;
		var anim, frame, animobj, frameobj, wt, uv;
		this.all_frames = [];
		this.has_loaded_textures = false;
		for (i = 0, leni = this.animations.length; i < leni; i++) {
			anim = this.animations[i];
			animobj = {};
			animobj.name = anim[0];
			animobj.speed = anim[1];
			animobj.loop = anim[2];
			animobj.repeatcount = anim[3];
			animobj.repeatto = anim[4];
			animobj.pingpong = anim[5];
			animobj.sid = anim[6];
			animobj.frames = [];
			for (j = 0, lenj = anim[7].length; j < lenj; j++) {
				frame = anim[7][j];
				frameobj = {};
				frameobj.texture_file = frame[0];
				frameobj.texture_filesize = frame[1];
				frameobj.offx = frame[2];
				frameobj.offy = frame[3];
				frameobj.width = frame[4];
				frameobj.height = frame[5];
				frameobj.duration = frame[6];
				frameobj.hotspotX = frame[7];
				frameobj.hotspotY = frame[8];
				frameobj.image_points = frame[9];
				frameobj.poly_pts = frame[10];
				frameobj.pixelformat = frame[11];
				frameobj.spritesheeted = (frameobj.width !== 0);
				frameobj.datauri = "";		// generated on demand and cached
				frameobj.getDataUri = frame_getDataUri;
				uv = {};
				uv.left = 0;
				uv.top = 0;
				uv.right = 1;
				uv.bottom = 1;
				frameobj.sheetTex = uv;
				frameobj.webGL_texture = null;
				wt = this.runtime.findWaitingTexture(frame[0]);
				if (wt) {
					frameobj.texture_img = wt;
				}
				else {
					frameobj.texture_img = new Image();
					frameobj.texture_img.cr_src = frame[0];
					frameobj.texture_img.cr_filesize = frame[1];
					frameobj.texture_img.c2webGL_texture = null;
					this.runtime.waitForImageLoad(frameobj.texture_img, frame[0]);
				}
				cr.seal(frameobj);
				animobj.frames.push(frameobj);
				this.all_frames.push(frameobj);
			}
			cr.seal(animobj);
			this.animations[i] = animobj;		// swap array data for object
		}
	};
	typeProto.updateAllCurrentTexture = function () {
		var i, len, inst;
		for (i = 0, len = this.instances.length; i < len; i++) {
			inst = this.instances[i];
			inst.curWebGLTexture = inst.curFrame.webGL_texture;
		}
	};
	typeProto.onLostWebGLContext = function () {
		if (this.is_family)
			return;
		var i, len, frame;
		for (i = 0, len = this.all_frames.length; i < len; ++i) {
			frame = this.all_frames[i];
			frame.texture_img.c2webGL_texture = null;
			frame.webGL_texture = null;
		}
		this.has_loaded_textures = false;
		this.updateAllCurrentTexture();
	};
	typeProto.onRestoreWebGLContext = function () {
		if (this.is_family || !this.instances.length)
			return;
		var i, len, frame;
		for (i = 0, len = this.all_frames.length; i < len; ++i) {
			frame = this.all_frames[i];
			frame.webGL_texture = this.runtime.glwrap.loadTexture(frame.texture_img, false, this.runtime.linearSampling, frame.pixelformat);
		}
		this.updateAllCurrentTexture();
	};
	typeProto.loadTextures = function () {
		if (this.is_family || this.has_loaded_textures || !this.runtime.glwrap)
			return;
		var i, len, frame;
		for (i = 0, len = this.all_frames.length; i < len; ++i) {
			frame = this.all_frames[i];
			frame.webGL_texture = this.runtime.glwrap.loadTexture(frame.texture_img, false, this.runtime.linearSampling, frame.pixelformat);
		}
		this.has_loaded_textures = true;
	};
	typeProto.unloadTextures = function () {
		if (this.is_family || this.instances.length || !this.has_loaded_textures)
			return;
		var i, len, frame;
		for (i = 0, len = this.all_frames.length; i < len; ++i) {
			frame = this.all_frames[i];
			this.runtime.glwrap.deleteTexture(frame.webGL_texture);
			frame.webGL_texture = null;
		}
		this.has_loaded_textures = false;
	};
	var already_drawn_images = [];
	typeProto.preloadCanvas2D = function (ctx) {
		var i, len, frameimg;
		cr.clearArray(already_drawn_images);
		for (i = 0, len = this.all_frames.length; i < len; ++i) {
			frameimg = this.all_frames[i].texture_img;
			if (already_drawn_images.indexOf(frameimg) !== -1)
				continue;
			ctx.drawImage(frameimg, 0, 0);
			already_drawn_images.push(frameimg);
		}
	};
	pluginProto.Instance = function (type) {
		this.type = type;
		this.runtime = type.runtime;
		var poly_pts = this.type.animations[0].frames[0].poly_pts;
		if (this.recycled)
			this.collision_poly.set_pts(poly_pts);
		else
			this.collision_poly = new cr.CollisionPoly(poly_pts);
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function () {
		this.visible = (this.properties[0] === 0);	// 0=visible, 1=invisible
		this.isTicking = false;
		this.inAnimTrigger = false;
		this.collisionsEnabled = (this.properties[3] !== 0);
		this.cur_animation = this.getAnimationByName(this.properties[1]) || this.type.animations[0];
		this.cur_frame = this.properties[2];
		if (this.cur_frame < 0)
			this.cur_frame = 0;
		if (this.cur_frame >= this.cur_animation.frames.length)
			this.cur_frame = this.cur_animation.frames.length - 1;
		var curanimframe = this.cur_animation.frames[this.cur_frame];
		this.collision_poly.set_pts(curanimframe.poly_pts);
		this.hotspotX = curanimframe.hotspotX;
		this.hotspotY = curanimframe.hotspotY;
		this.cur_anim_speed = this.cur_animation.speed;
		this.cur_anim_repeatto = this.cur_animation.repeatto;
		if (!(this.type.animations.length === 1 && this.type.animations[0].frames.length === 1) && this.cur_anim_speed !== 0) {
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
		if (this.recycled)
			this.animTimer.reset();
		else
			this.animTimer = new cr.KahanAdder();
		this.frameStart = this.getNowTime();
		this.animPlaying = true;
		this.animRepeats = 0;
		this.animForwards = true;
		this.animTriggerName = "";
		this.changeAnimName = "";
		this.changeAnimFrom = 0;
		this.changeAnimFrame = -1;
		this.type.loadTextures();
		var i, leni, j, lenj;
		var anim, frame, uv, maintex;
		for (i = 0, leni = this.type.animations.length; i < leni; i++) {
			anim = this.type.animations[i];
			for (j = 0, lenj = anim.frames.length; j < lenj; j++) {
				frame = anim.frames[j];
				if (frame.width === 0) {
					frame.width = frame.texture_img.width;
					frame.height = frame.texture_img.height;
				}
				if (frame.spritesheeted) {
					maintex = frame.texture_img;
					uv = frame.sheetTex;
					uv.left = frame.offx / maintex.width;
					uv.top = frame.offy / maintex.height;
					uv.right = (frame.offx + frame.width) / maintex.width;
					uv.bottom = (frame.offy + frame.height) / maintex.height;
					if (frame.offx === 0 && frame.offy === 0 && frame.width === maintex.width && frame.height === maintex.height) {
						frame.spritesheeted = false;
					}
				}
			}
		}
		this.curFrame = this.cur_animation.frames[this.cur_frame];
		this.curWebGLTexture = this.curFrame.webGL_texture;
	};
	instanceProto.saveToJSON = function () {
		var o = {
			"a": this.cur_animation.sid,
			"f": this.cur_frame,
			"cas": this.cur_anim_speed,
			"fs": this.frameStart,
			"ar": this.animRepeats,
			"at": this.animTimer.sum,
			"rt": this.cur_anim_repeatto
		};
		if (!this.animPlaying)
			o["ap"] = this.animPlaying;
		if (!this.animForwards)
			o["af"] = this.animForwards;
		return o;
	};
	instanceProto.loadFromJSON = function (o) {
		var anim = this.getAnimationBySid(o["a"]);
		if (anim)
			this.cur_animation = anim;
		this.cur_frame = o["f"];
		if (this.cur_frame < 0)
			this.cur_frame = 0;
		if (this.cur_frame >= this.cur_animation.frames.length)
			this.cur_frame = this.cur_animation.frames.length - 1;
		this.cur_anim_speed = o["cas"];
		this.frameStart = o["fs"];
		this.animRepeats = o["ar"];
		this.animTimer.reset();
		this.animTimer.sum = o["at"];
		this.animPlaying = o.hasOwnProperty("ap") ? o["ap"] : true;
		this.animForwards = o.hasOwnProperty("af") ? o["af"] : true;
		if (o.hasOwnProperty("rt"))
			this.cur_anim_repeatto = o["rt"];
		else
			this.cur_anim_repeatto = this.cur_animation.repeatto;
		this.curFrame = this.cur_animation.frames[this.cur_frame];
		this.curWebGLTexture = this.curFrame.webGL_texture;
		this.collision_poly.set_pts(this.curFrame.poly_pts);
		this.hotspotX = this.curFrame.hotspotX;
		this.hotspotY = this.curFrame.hotspotY;
	};
	instanceProto.animationFinish = function (reverse) {
		this.cur_frame = reverse ? 0 : this.cur_animation.frames.length - 1;
		this.animPlaying = false;
		this.animTriggerName = this.cur_animation.name;
		this.inAnimTrigger = true;
		this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnAnyAnimFinished, this);
		this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnAnimFinished, this);
		this.inAnimTrigger = false;
		this.animRepeats = 0;
	};
	instanceProto.getNowTime = function () {
		return this.animTimer.sum;
	};
	instanceProto.tick = function () {
		this.animTimer.add(this.runtime.getDt(this));
		if (this.changeAnimName.length)
			this.doChangeAnim();
		if (this.changeAnimFrame >= 0)
			this.doChangeAnimFrame();
		var now = this.getNowTime();
		var cur_animation = this.cur_animation;
		var prev_frame = cur_animation.frames[this.cur_frame];
		var next_frame;
		var cur_frame_time = prev_frame.duration / this.cur_anim_speed;
		if (this.animPlaying && now >= this.frameStart + cur_frame_time) {
			if (this.animForwards) {
				this.cur_frame++;
			}
			else {
				this.cur_frame--;
			}
			this.frameStart += cur_frame_time;
			if (this.cur_frame >= cur_animation.frames.length) {
				if (cur_animation.pingpong) {
					this.animForwards = false;
					this.cur_frame = cur_animation.frames.length - 2;
				}
				else if (cur_animation.loop) {
					this.cur_frame = this.cur_anim_repeatto;
				}
				else {
					this.animRepeats++;
					if (this.animRepeats >= cur_animation.repeatcount) {
						this.animationFinish(false);
					}
					else {
						this.cur_frame = this.cur_anim_repeatto;
					}
				}
			}
			if (this.cur_frame < 0) {
				if (cur_animation.pingpong) {
					this.cur_frame = 1;
					this.animForwards = true;
					if (!cur_animation.loop) {
						this.animRepeats++;
						if (this.animRepeats >= cur_animation.repeatcount) {
							this.animationFinish(true);
						}
					}
				}
				else {
					if (cur_animation.loop) {
						this.cur_frame = this.cur_anim_repeatto;
					}
					else {
						this.animRepeats++;
						if (this.animRepeats >= cur_animation.repeatcount) {
							this.animationFinish(true);
						}
						else {
							this.cur_frame = this.cur_anim_repeatto;
						}
					}
				}
			}
			if (this.cur_frame < 0)
				this.cur_frame = 0;
			else if (this.cur_frame >= cur_animation.frames.length)
				this.cur_frame = cur_animation.frames.length - 1;
			if (now > this.frameStart + (cur_animation.frames[this.cur_frame].duration / this.cur_anim_speed)) {
				this.frameStart = now;
			}
			next_frame = cur_animation.frames[this.cur_frame];
			this.OnFrameChanged(prev_frame, next_frame);
			this.runtime.redraw = true;
		}
	};
	instanceProto.getAnimationByName = function (name_) {
		var i, len, a;
		for (i = 0, len = this.type.animations.length; i < len; i++) {
			a = this.type.animations[i];
			if (cr.equals_nocase(a.name, name_))
				return a;
		}
		return null;
	};
	instanceProto.getAnimationBySid = function (sid_) {
		var i, len, a;
		for (i = 0, len = this.type.animations.length; i < len; i++) {
			a = this.type.animations[i];
			if (a.sid === sid_)
				return a;
		}
		return null;
	};
	instanceProto.doChangeAnim = function () {
		var prev_frame = this.cur_animation.frames[this.cur_frame];
		var anim = this.getAnimationByName(this.changeAnimName);
		this.changeAnimName = "";
		if (!anim)
			return;
		if (cr.equals_nocase(anim.name, this.cur_animation.name) && this.animPlaying)
			return;
		this.cur_animation = anim;
		this.cur_anim_speed = anim.speed;
		this.cur_anim_repeatto = anim.repeatto;
		if (this.cur_frame < 0)
			this.cur_frame = 0;
		if (this.cur_frame >= this.cur_animation.frames.length)
			this.cur_frame = this.cur_animation.frames.length - 1;
		if (this.changeAnimFrom === 1)
			this.cur_frame = 0;
		this.animPlaying = true;
		this.frameStart = this.getNowTime();
		this.animForwards = true;
		this.OnFrameChanged(prev_frame, this.cur_animation.frames[this.cur_frame]);
		this.runtime.redraw = true;
	};
	instanceProto.doChangeAnimFrame = function () {
		var prev_frame = this.cur_animation.frames[this.cur_frame];
		var prev_frame_number = this.cur_frame;
		this.cur_frame = cr.floor(this.changeAnimFrame);
		if (this.cur_frame < 0)
			this.cur_frame = 0;
		if (this.cur_frame >= this.cur_animation.frames.length)
			this.cur_frame = this.cur_animation.frames.length - 1;
		if (prev_frame_number !== this.cur_frame) {
			this.OnFrameChanged(prev_frame, this.cur_animation.frames[this.cur_frame]);
			this.frameStart = this.getNowTime();
			this.runtime.redraw = true;
		}
		this.changeAnimFrame = -1;
	};
	instanceProto.OnFrameChanged = function (prev_frame, next_frame) {
		var oldw = prev_frame.width;
		var oldh = prev_frame.height;
		var neww = next_frame.width;
		var newh = next_frame.height;
		if (oldw != neww)
			this.width *= (neww / oldw);
		if (oldh != newh)
			this.height *= (newh / oldh);
		this.hotspotX = next_frame.hotspotX;
		this.hotspotY = next_frame.hotspotY;
		this.collision_poly.set_pts(next_frame.poly_pts);
		this.set_bbox_changed();
		this.curFrame = next_frame;
		this.curWebGLTexture = next_frame.webGL_texture;
		var i, len, b;
		for (i = 0, len = this.behavior_insts.length; i < len; i++) {
			b = this.behavior_insts[i];
			if (b.onSpriteFrameChanged)
				b.onSpriteFrameChanged(prev_frame, next_frame);
		}
		this.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnFrameChanged, this);
	};
	instanceProto.draw = function (ctx) {
		ctx.globalAlpha = this.opacity;
		var cur_frame = this.curFrame;
		var spritesheeted = cur_frame.spritesheeted;
		var cur_image = cur_frame.texture_img;
		var myx = this.x;
		var myy = this.y;
		var w = this.width;
		var h = this.height;
		if (this.angle === 0 && w >= 0 && h >= 0) {
			myx -= this.hotspotX * w;
			myy -= this.hotspotY * h;
			if (this.runtime.pixel_rounding) {
				myx = Math.round(myx);
				myy = Math.round(myy);
			}
			if (spritesheeted) {
				ctx.drawImage(cur_image, cur_frame.offx, cur_frame.offy, cur_frame.width, cur_frame.height,
					myx, myy, w, h);
			}
			else {
				ctx.drawImage(cur_image, myx, myy, w, h);
			}
		}
		else {
			if (this.runtime.pixel_rounding) {
				myx = Math.round(myx);
				myy = Math.round(myy);
			}
			ctx.save();
			var widthfactor = w > 0 ? 1 : -1;
			var heightfactor = h > 0 ? 1 : -1;
			ctx.translate(myx, myy);
			if (widthfactor !== 1 || heightfactor !== 1)
				ctx.scale(widthfactor, heightfactor);
			ctx.rotate(this.angle * widthfactor * heightfactor);
			var drawx = 0 - (this.hotspotX * cr.abs(w))
			var drawy = 0 - (this.hotspotY * cr.abs(h));
			if (spritesheeted) {
				ctx.drawImage(cur_image, cur_frame.offx, cur_frame.offy, cur_frame.width, cur_frame.height,
					drawx, drawy, cr.abs(w), cr.abs(h));
			}
			else {
				ctx.drawImage(cur_image, drawx, drawy, cr.abs(w), cr.abs(h));
			}
			ctx.restore();
		}
		/*
		 ctx.strokeStyle = "#f00";
		 ctx.lineWidth = 3;
		 ctx.beginPath();
		 this.collision_poly.cache_poly(this.width, this.height, this.angle);
		 var i, len, ax, ay, bx, by;
		 for (i = 0, len = this.collision_poly.pts_count; i < len; i++)
		 {
		 ax = this.collision_poly.pts_cache[i*2] + this.x;
		 ay = this.collision_poly.pts_cache[i*2+1] + this.y;
		 bx = this.collision_poly.pts_cache[((i+1)%len)*2] + this.x;
		 by = this.collision_poly.pts_cache[((i+1)%len)*2+1] + this.y;
		 ctx.moveTo(ax, ay);
		 ctx.lineTo(bx, by);
		 }
		 ctx.stroke();
		 ctx.closePath();
		 */
		/*
		 if (this.behavior_insts.length >= 1 && this.behavior_insts[0].draw)
		 {
		 this.behavior_insts[0].draw(ctx);
		 }
		 */
	};
	instanceProto.drawGL_earlyZPass = function (glw) {
		this.drawGL(glw);
	};
	instanceProto.drawGL = function (glw) {
		glw.setTexture(this.curWebGLTexture);
		glw.setOpacity(this.opacity);
		var cur_frame = this.curFrame;
		var q = this.bquad;
		if (this.runtime.pixel_rounding) {
			var ox = Math.round(this.x) - this.x;
			var oy = Math.round(this.y) - this.y;
			if (cur_frame.spritesheeted)
				glw.quadTex(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy, cur_frame.sheetTex);
			else
				glw.quad(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy);
		}
		else {
			if (cur_frame.spritesheeted)
				glw.quadTex(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly, cur_frame.sheetTex);
			else
				glw.quad(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly);
		}
	};
	instanceProto.getImagePointIndexByName = function (name_) {
		var cur_frame = this.curFrame;
		var i, len;
		for (i = 0, len = cur_frame.image_points.length; i < len; i++) {
			if (cr.equals_nocase(name_, cur_frame.image_points[i][0]))
				return i;
		}
		return -1;
	};
	instanceProto.getImagePoint = function (imgpt, getX) {
		var cur_frame = this.curFrame;
		var image_points = cur_frame.image_points;
		var index;
		if (cr.is_string(imgpt))
			index = this.getImagePointIndexByName(imgpt);
		else
			index = imgpt - 1;	// 0 is origin
		index = cr.floor(index);
		if (index < 0 || index >= image_points.length)
			return getX ? this.x : this.y;	// return origin
		var x = (image_points[index][1] - cur_frame.hotspotX) * this.width;
		var y = image_points[index][2];
		y = (y - cur_frame.hotspotY) * this.height;
		var cosa = Math.cos(this.angle);
		var sina = Math.sin(this.angle);
		var x_temp = (x * cosa) - (y * sina);
		y = (y * cosa) + (x * sina);
		x = x_temp;
		x += this.x;
		y += this.y;
		return getX ? x : y;
	};

	function Cnds() {
	};
	var arrCache = [];

	function allocArr() {
		if (arrCache.length)
			return arrCache.pop();
		else
			return [0, 0, 0];
	};

	function freeArr(a) {
		a[0] = 0;
		a[1] = 0;
		a[2] = 0;
		arrCache.push(a);
	};

	function makeCollKey(a, b) {
		if (a < b)
			return "" + a + "," + b;
		else
			return "" + b + "," + a;
	};

	function collmemory_add(collmemory, a, b, tickcount) {
		var a_uid = a.uid;
		var b_uid = b.uid;
		var key = makeCollKey(a_uid, b_uid);
		if (collmemory.hasOwnProperty(key)) {
			collmemory[key][2] = tickcount;
			return;
		}
		var arr = allocArr();
		arr[0] = a_uid;
		arr[1] = b_uid;
		arr[2] = tickcount;
		collmemory[key] = arr;
	};

	function collmemory_remove(collmemory, a, b) {
		var key = makeCollKey(a.uid, b.uid);
		if (collmemory.hasOwnProperty(key)) {
			freeArr(collmemory[key]);
			delete collmemory[key];
		}
	};

	function collmemory_removeInstance(collmemory, inst) {
		var uid = inst.uid;
		var p, entry;
		for (p in collmemory) {
			if (collmemory.hasOwnProperty(p)) {
				entry = collmemory[p];
				if (entry[0] === uid || entry[1] === uid) {
					freeArr(collmemory[p]);
					delete collmemory[p];
				}
			}
		}
	};
	var last_coll_tickcount = -2;

	function collmemory_has(collmemory, a, b) {
		var key = makeCollKey(a.uid, b.uid);
		if (collmemory.hasOwnProperty(key)) {
			last_coll_tickcount = collmemory[key][2];
			return true;
		}
		else {
			last_coll_tickcount = -2;
			return false;
		}
	};
	var candidates1 = [];
	Cnds.prototype.OnCollision = function (rtype) {
		if (!rtype)
			return false;
		var runtime = this.runtime;
		var cnd = runtime.getCurrentCondition();
		var ltype = cnd.type;
		var collmemory = null;
		if (cnd.extra["collmemory"]) {
			collmemory = cnd.extra["collmemory"];
		}
		else {
			collmemory = {};
			cnd.extra["collmemory"] = collmemory;
		}
		if (!cnd.extra["spriteCreatedDestroyCallback"]) {
			cnd.extra["spriteCreatedDestroyCallback"] = true;
			runtime.addDestroyCallback(function (inst) {
				collmemory_removeInstance(cnd.extra["collmemory"], inst);
			});
		}
		var lsol = ltype.getCurrentSol();
		var rsol = rtype.getCurrentSol();
		var linstances = lsol.getObjects();
		var rinstances;
		var l, linst, r, rinst;
		var curlsol, currsol;
		var tickcount = this.runtime.tickcount;
		var lasttickcount = tickcount - 1;
		var exists, run;
		var current_event = runtime.getCurrentEventStack().current_event;
		var orblock = current_event.orblock;
		for (l = 0; l < linstances.length; l++) {
			linst = linstances[l];
			if (rsol.select_all) {
				linst.update_bbox();
				this.runtime.getCollisionCandidates(linst.layer, rtype, linst.bbox, candidates1);
				rinstances = candidates1;
			}
			else
				rinstances = rsol.getObjects();
			for (r = 0; r < rinstances.length; r++) {
				rinst = rinstances[r];
				if (runtime.testOverlap(linst, rinst) || runtime.checkRegisteredCollision(linst, rinst)) {
					exists = collmemory_has(collmemory, linst, rinst);
					run = (!exists || (last_coll_tickcount < lasttickcount));
					collmemory_add(collmemory, linst, rinst, tickcount);
					if (run) {
						runtime.pushCopySol(current_event.solModifiers);
						curlsol = ltype.getCurrentSol();
						currsol = rtype.getCurrentSol();
						curlsol.select_all = false;
						currsol.select_all = false;
						if (ltype === rtype) {
							curlsol.instances.length = 2;	// just use lsol, is same reference as rsol
							curlsol.instances[0] = linst;
							curlsol.instances[1] = rinst;
							ltype.applySolToContainer();
						}
						else {
							curlsol.instances.length = 1;
							currsol.instances.length = 1;
							curlsol.instances[0] = linst;
							currsol.instances[0] = rinst;
							ltype.applySolToContainer();
							rtype.applySolToContainer();
						}
						current_event.retrigger();
						runtime.popSol(current_event.solModifiers);
					}
				}
				else {
					collmemory_remove(collmemory, linst, rinst);
				}
			}
			cr.clearArray(candidates1);
		}
		return false;
	};
	var rpicktype = null;
	var rtopick = new cr.ObjectSet();
	var needscollisionfinish = false;
	var candidates2 = [];
	var temp_bbox = new cr.rect(0, 0, 0, 0);

	function DoOverlapCondition(rtype, offx, offy) {
		if (!rtype)
			return false;
		var do_offset = (offx !== 0 || offy !== 0);
		var oldx, oldy, ret = false, r, lenr, rinst;
		var cnd = this.runtime.getCurrentCondition();
		var ltype = cnd.type;
		var inverted = cnd.inverted;
		var rsol = rtype.getCurrentSol();
		var orblock = this.runtime.getCurrentEventStack().current_event.orblock;
		var rinstances;
		if (rsol.select_all) {
			this.update_bbox();
			temp_bbox.copy(this.bbox);
			temp_bbox.offset(offx, offy);
			this.runtime.getCollisionCandidates(this.layer, rtype, temp_bbox, candidates2);
			rinstances = candidates2;
		}
		else if (orblock) {
			if (this.runtime.isCurrentConditionFirst() && !rsol.else_instances.length && rsol.instances.length)
				rinstances = rsol.instances;
			else
				rinstances = rsol.else_instances;
		}
		else {
			rinstances = rsol.instances;
		}
		rpicktype = rtype;
		needscollisionfinish = (ltype !== rtype && !inverted);
		if (do_offset) {
			oldx = this.x;
			oldy = this.y;
			this.x += offx;
			this.y += offy;
			this.set_bbox_changed();
		}
		for (r = 0, lenr = rinstances.length; r < lenr; r++) {
			rinst = rinstances[r];
			if (this.runtime.testOverlap(this, rinst)) {
				ret = true;
				if (inverted)
					break;
				if (ltype !== rtype)
					rtopick.add(rinst);
			}
		}
		if (do_offset) {
			this.x = oldx;
			this.y = oldy;
			this.set_bbox_changed();
		}
		cr.clearArray(candidates2);
		return ret;
	};
	typeProto.finish = function (do_pick) {
		if (!needscollisionfinish)
			return;
		if (do_pick) {
			var orblock = this.runtime.getCurrentEventStack().current_event.orblock;
			var sol = rpicktype.getCurrentSol();
			var topick = rtopick.valuesRef();
			var i, len, inst;
			if (sol.select_all) {
				sol.select_all = false;
				cr.clearArray(sol.instances);
				for (i = 0, len = topick.length; i < len; ++i) {
					sol.instances[i] = topick[i];
				}
				if (orblock) {
					cr.clearArray(sol.else_instances);
					for (i = 0, len = rpicktype.instances.length; i < len; ++i) {
						inst = rpicktype.instances[i];
						if (!rtopick.contains(inst))
							sol.else_instances.push(inst);
					}
				}
			}
			else {
				if (orblock) {
					var initsize = sol.instances.length;
					for (i = 0, len = topick.length; i < len; ++i) {
						sol.instances[initsize + i] = topick[i];
						cr.arrayFindRemove(sol.else_instances, topick[i]);
					}
				}
				else {
					cr.shallowAssignArray(sol.instances, topick);
				}
			}
			rpicktype.applySolToContainer();
		}
		rtopick.clear();
		needscollisionfinish = false;
	};
	Cnds.prototype.IsOverlapping = function (rtype) {
		return DoOverlapCondition.call(this, rtype, 0, 0);
	};
	Cnds.prototype.IsOverlappingOffset = function (rtype, offx, offy) {
		return DoOverlapCondition.call(this, rtype, offx, offy);
	};
	Cnds.prototype.IsAnimPlaying = function (animname) {
		if (this.changeAnimName.length)
			return cr.equals_nocase(this.changeAnimName, animname);
		else
			return cr.equals_nocase(this.cur_animation.name, animname);
	};
	Cnds.prototype.CompareFrame = function (cmp, framenum) {
		return cr.do_cmp(this.cur_frame, cmp, framenum);
	};
	Cnds.prototype.CompareAnimSpeed = function (cmp, x) {
		var s = (this.animForwards ? this.cur_anim_speed : -this.cur_anim_speed);
		return cr.do_cmp(s, cmp, x);
	};
	Cnds.prototype.OnAnimFinished = function (animname) {
		return cr.equals_nocase(this.animTriggerName, animname);
	};
	Cnds.prototype.OnAnyAnimFinished = function () {
		return true;
	};
	Cnds.prototype.OnFrameChanged = function () {
		return true;
	};
	Cnds.prototype.IsMirrored = function () {
		return this.width < 0;
	};
	Cnds.prototype.IsFlipped = function () {
		return this.height < 0;
	};
	Cnds.prototype.OnURLLoaded = function () {
		return true;
	};
	Cnds.prototype.IsCollisionEnabled = function () {
		return this.collisionsEnabled;
	};
	pluginProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.Spawn = function (obj, layer, imgpt) {
		if (!obj || !layer)
			return;
		var inst = this.runtime.createInstance(obj, layer, this.getImagePoint(imgpt, true), this.getImagePoint(imgpt, false));
		if (!inst)
			return;
		if (typeof inst.angle !== "undefined") {
			inst.angle = this.angle;
			inst.set_bbox_changed();
		}
		this.runtime.isInOnDestroy++;
		var i, len, s;
		this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);
		if (inst.is_contained) {
			for (i = 0, len = inst.siblings.length; i < len; i++) {
				s = inst.siblings[i];
				this.runtime.trigger(Object.getPrototypeOf(s.type.plugin).cnds.OnCreated, s);
			}
		}
		this.runtime.isInOnDestroy--;
		var cur_act = this.runtime.getCurrentAction();
		var reset_sol = false;
		if (cr.is_undefined(cur_act.extra["Spawn_LastExec"]) || cur_act.extra["Spawn_LastExec"] < this.runtime.execcount) {
			reset_sol = true;
			cur_act.extra["Spawn_LastExec"] = this.runtime.execcount;
		}
		var sol;
		if (obj != this.type) {
			sol = obj.getCurrentSol();
			sol.select_all = false;
			if (reset_sol) {
				cr.clearArray(sol.instances);
				sol.instances[0] = inst;
			}
			else
				sol.instances.push(inst);
			if (inst.is_contained) {
				for (i = 0, len = inst.siblings.length; i < len; i++) {
					s = inst.siblings[i];
					sol = s.type.getCurrentSol();
					sol.select_all = false;
					if (reset_sol) {
						cr.clearArray(sol.instances);
						sol.instances[0] = s;
					}
					else
						sol.instances.push(s);
				}
			}
		}
	};
	Acts.prototype.SetEffect = function (effect) {
		this.blend_mode = effect;
		this.compositeOp = cr.effectToCompositeOp(effect);
		cr.setGLBlend(this, effect, this.runtime.gl);
		this.runtime.redraw = true;
	};
	Acts.prototype.StopAnim = function () {
		this.animPlaying = false;
	};
	Acts.prototype.StartAnim = function (from) {
		this.animPlaying = true;
		this.frameStart = this.getNowTime();
		if (from === 1 && this.cur_frame !== 0) {
			this.changeAnimFrame = 0;
			if (!this.inAnimTrigger)
				this.doChangeAnimFrame();
		}
		if (!this.isTicking) {
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
	};
	Acts.prototype.SetAnim = function (animname, from) {
		this.changeAnimName = animname;
		this.changeAnimFrom = from;
		if (!this.isTicking) {
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
		if (!this.inAnimTrigger)
			this.doChangeAnim();
	};
	Acts.prototype.SetAnimFrame = function (framenumber) {
		this.changeAnimFrame = framenumber;
		if (!this.isTicking) {
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
		if (!this.inAnimTrigger)
			this.doChangeAnimFrame();
	};
	Acts.prototype.SetAnimSpeed = function (s) {
		this.cur_anim_speed = cr.abs(s);
		this.animForwards = (s >= 0);
		if (!this.isTicking) {
			this.runtime.tickMe(this);
			this.isTicking = true;
		}
	};
	Acts.prototype.SetAnimRepeatToFrame = function (s) {
		s = Math.floor(s);
		if (s < 0)
			s = 0;
		if (s >= this.cur_animation.frames.length)
			s = this.cur_animation.frames.length - 1;
		this.cur_anim_repeatto = s;
	};
	Acts.prototype.SetMirrored = function (m) {
		var neww = cr.abs(this.width) * (m === 0 ? -1 : 1);
		if (this.width === neww)
			return;
		this.width = neww;
		this.set_bbox_changed();
	};
	Acts.prototype.SetFlipped = function (f) {
		var newh = cr.abs(this.height) * (f === 0 ? -1 : 1);
		if (this.height === newh)
			return;
		this.height = newh;
		this.set_bbox_changed();
	};
	Acts.prototype.SetScale = function (s) {
		var cur_frame = this.curFrame;
		var mirror_factor = (this.width < 0 ? -1 : 1);
		var flip_factor = (this.height < 0 ? -1 : 1);
		var new_width = cur_frame.width * s * mirror_factor;
		var new_height = cur_frame.height * s * flip_factor;
		if (this.width !== new_width || this.height !== new_height) {
			this.width = new_width;
			this.height = new_height;
			this.set_bbox_changed();
		}
	};
	Acts.prototype.LoadURL = function (url_, resize_, crossOrigin_) {
		var img = new Image();
		var self = this;
		var curFrame_ = this.curFrame;
		img.onload = function () {
			if (curFrame_.texture_img.src === img.src) {
				if (self.runtime.glwrap && self.curFrame === curFrame_)
					self.curWebGLTexture = curFrame_.webGL_texture;
				if (resize_ === 0)		// resize to image size
				{
					self.width = img.width;
					self.height = img.height;
					self.set_bbox_changed();
				}
				self.runtime.redraw = true;
				self.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnURLLoaded, self);
				return;
			}
			curFrame_.texture_img = img;
			curFrame_.offx = 0;
			curFrame_.offy = 0;
			curFrame_.width = img.width;
			curFrame_.height = img.height;
			curFrame_.spritesheeted = false;
			curFrame_.datauri = "";
			curFrame_.pixelformat = 0;	// reset to RGBA, since we don't know what type of image will have come in
			if (self.runtime.glwrap) {
				if (curFrame_.webGL_texture)
					self.runtime.glwrap.deleteTexture(curFrame_.webGL_texture);
				curFrame_.webGL_texture = self.runtime.glwrap.loadTexture(img, false, self.runtime.linearSampling);
				if (self.curFrame === curFrame_)
					self.curWebGLTexture = curFrame_.webGL_texture;
				self.type.updateAllCurrentTexture();
			}
			if (resize_ === 0)		// resize to image size
			{
				self.width = img.width;
				self.height = img.height;
				self.set_bbox_changed();
			}
			self.runtime.redraw = true;
			self.runtime.trigger(cr.plugins_.Sprite.prototype.cnds.OnURLLoaded, self);
		};
		if (url_.substr(0, 5) !== "data:" && crossOrigin_ === 0)
			img["crossOrigin"] = "anonymous";
		this.runtime.setImageSrc(img, url_);
	};
	Acts.prototype.SetCollisions = function (set_) {
		if (this.collisionsEnabled === (set_ !== 0))
			return;		// no change
		this.collisionsEnabled = (set_ !== 0);
		if (this.collisionsEnabled)
			this.set_bbox_changed();		// needs to be added back to cells
		else {
			if (this.collcells.right >= this.collcells.left)
				this.type.collision_grid.update(this, this.collcells, null);
			this.collcells.set(0, 0, -1, -1);
		}
	};
	pluginProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.AnimationFrame = function (ret) {
		ret.set_int(this.cur_frame);
	};
	Exps.prototype.AnimationFrameCount = function (ret) {
		ret.set_int(this.cur_animation.frames.length);
	};
	Exps.prototype.AnimationName = function (ret) {
		ret.set_string(this.cur_animation.name);
	};
	Exps.prototype.AnimationSpeed = function (ret) {
		ret.set_float(this.animForwards ? this.cur_anim_speed : -this.cur_anim_speed);
	};
	Exps.prototype.ImagePointX = function (ret, imgpt) {
		ret.set_float(this.getImagePoint(imgpt, true));
	};
	Exps.prototype.ImagePointY = function (ret, imgpt) {
		ret.set_float(this.getImagePoint(imgpt, false));
	};
	Exps.prototype.ImagePointCount = function (ret) {
		ret.set_int(this.curFrame.image_points.length);
	};
	Exps.prototype.ImageWidth = function (ret) {
		ret.set_float(this.curFrame.width);
	};
	Exps.prototype.ImageHeight = function (ret) {
		ret.set_float(this.curFrame.height);
	};
	pluginProto.exps = new Exps();
}());

cr.plugins_.Text = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var pluginProto = cr.plugins_.Text.prototype;
	pluginProto.onCreate = function () {
		pluginProto.acts.SetWidth = function (w) {
			if (this.width !== w) {
				this.width = w;
				this.text_changed = true;	// also recalculate text wrapping
				this.set_bbox_changed();
			}
		};
	};
	pluginProto.Type = function (plugin) {
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function () {
	};
	typeProto.onLostWebGLContext = function () {
		if (this.is_family)
			return;
		var i, len, inst;
		for (i = 0, len = this.instances.length; i < len; i++) {
			inst = this.instances[i];
			inst.mycanvas = null;
			inst.myctx = null;
			inst.mytex = null;
		}
	};
	pluginProto.Instance = function (type) {
		this.type = type;
		this.runtime = type.runtime;
		if (this.recycled)
			cr.clearArray(this.lines);
		else
			this.lines = [];		// for word wrapping
		this.text_changed = true;
	};
	var instanceProto = pluginProto.Instance.prototype;
	var requestedWebFonts = {};		// already requested web fonts have an entry here
	instanceProto.onCreate = function () {
		this.text = this.properties[0];
		this.visible = (this.properties[1] === 0);		// 0=visible, 1=invisible
		this.font = this.properties[2];
		this.color = this.properties[3];
		this.halign = this.properties[4];				// 0=left, 1=center, 2=right
		this.valign = this.properties[5];				// 0=top, 1=center, 2=bottom
		this.wrapbyword = (this.properties[7] === 0);	// 0=word, 1=character
		this.lastwidth = this.width;
		this.lastwrapwidth = this.width;
		this.lastheight = this.height;
		this.line_height_offset = this.properties[8];
		this.facename = "";
		this.fontstyle = "";
		this.ptSize = 0;
		this.textWidth = 0;
		this.textHeight = 0;
		this.parseFont();
		this.mycanvas = null;
		this.myctx = null;
		this.mytex = null;
		this.need_text_redraw = false;
		this.last_render_tick = this.runtime.tickcount;
		if (this.recycled)
			this.rcTex.set(0, 0, 1, 1);
		else
			this.rcTex = new cr.rect(0, 0, 1, 1);
		if (this.runtime.glwrap)
			this.runtime.tickMe(this);
		;
	};
	instanceProto.parseFont = function () {
		var arr = this.font.split(" ");
		var i;
		for (i = 0; i < arr.length; i++) {
			if (arr[i].substr(arr[i].length - 2, 2) === "pt") {
				this.ptSize = parseInt(arr[i].substr(0, arr[i].length - 2));
				this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4;	// assume 96dpi...
				if (i > 0)
					this.fontstyle = arr[i - 1];
				this.facename = arr[i + 1];
				for (i = i + 2; i < arr.length; i++)
					this.facename += " " + arr[i];
				break;
			}
		}
	};
	instanceProto.saveToJSON = function () {
		return {
			"t": this.text,
			"f": this.font,
			"c": this.color,
			"ha": this.halign,
			"va": this.valign,
			"wr": this.wrapbyword,
			"lho": this.line_height_offset,
			"fn": this.facename,
			"fs": this.fontstyle,
			"ps": this.ptSize,
			"pxh": this.pxHeight,
			"tw": this.textWidth,
			"th": this.textHeight,
			"lrt": this.last_render_tick
		};
	};
	instanceProto.loadFromJSON = function (o) {
		this.text = o["t"];
		this.font = o["f"];
		this.color = o["c"];
		this.halign = o["ha"];
		this.valign = o["va"];
		this.wrapbyword = o["wr"];
		this.line_height_offset = o["lho"];
		this.facename = o["fn"];
		this.fontstyle = o["fs"];
		this.ptSize = o["ps"];
		this.pxHeight = o["pxh"];
		this.textWidth = o["tw"];
		this.textHeight = o["th"];
		this.last_render_tick = o["lrt"];
		this.text_changed = true;
		this.lastwidth = this.width;
		this.lastwrapwidth = this.width;
		this.lastheight = this.height;
	};
	instanceProto.tick = function () {
		if (this.runtime.glwrap && this.mytex && (this.runtime.tickcount - this.last_render_tick >= 300)) {
			var layer = this.layer;
			this.update_bbox();
			var bbox = this.bbox;
			if (bbox.right < layer.viewLeft || bbox.bottom < layer.viewTop || bbox.left > layer.viewRight || bbox.top > layer.viewBottom) {
				this.runtime.glwrap.deleteTexture(this.mytex);
				this.mytex = null;
				this.myctx = null;
				this.mycanvas = null;
			}
		}
	};
	instanceProto.onDestroy = function () {
		this.myctx = null;
		this.mycanvas = null;
		if (this.runtime.glwrap && this.mytex)
			this.runtime.glwrap.deleteTexture(this.mytex);
		this.mytex = null;
	};
	instanceProto.updateFont = function () {
		this.font = this.fontstyle + " " + this.ptSize.toString() + "pt " + this.facename;
		this.text_changed = true;
		this.runtime.redraw = true;
	};
	instanceProto.draw = function (ctx, glmode) {
		ctx.font = this.font;
		ctx.textBaseline = "top";
		ctx.fillStyle = this.color;
		ctx.globalAlpha = glmode ? 1 : this.opacity;
		var myscale = 1;
		if (glmode) {
			myscale = Math.abs(this.layer.getScale());
			ctx.save();
			ctx.scale(myscale, myscale);
		}
		if (this.text_changed || this.width !== this.lastwrapwidth) {
			this.type.plugin.WordWrap(this.text, this.lines, ctx, this.width, this.wrapbyword);
			this.text_changed = false;
			this.lastwrapwidth = this.width;
		}
		this.update_bbox();
		var penX = glmode ? 0 : this.bquad.tlx;
		var penY = glmode ? 0 : this.bquad.tly;
		if (this.runtime.pixel_rounding) {
			penX = (penX + 0.5) | 0;
			penY = (penY + 0.5) | 0;
		}
		if (this.angle !== 0 && !glmode) {
			ctx.save();
			ctx.translate(penX, penY);
			ctx.rotate(this.angle);
			penX = 0;
			penY = 0;
		}
		var endY = penY + this.height;
		var line_height = this.pxHeight;
		line_height += this.line_height_offset;
		var drawX;
		var i;
		if (this.valign === 1)		// center
			penY += Math.max(this.height / 2 - (this.lines.length * line_height) / 2, 0);
		else if (this.valign === 2)	// bottom
			penY += Math.max(this.height - (this.lines.length * line_height) - 2, 0);
		for (i = 0; i < this.lines.length; i++) {
			drawX = penX;
			if (this.halign === 1)		// center
				drawX = penX + (this.width - this.lines[i].width) / 2;
			else if (this.halign === 2)	// right
				drawX = penX + (this.width - this.lines[i].width);
			ctx.fillText(this.lines[i].text, drawX, penY);
			penY += line_height;
			if (penY >= endY - line_height)
				break;
		}
		if (this.angle !== 0 || glmode)
			ctx.restore();
		this.last_render_tick = this.runtime.tickcount;
	};
	instanceProto.drawGL = function (glw) {
		if (this.width < 1 || this.height < 1)
			return;
		var need_redraw = this.text_changed || this.need_text_redraw;
		this.need_text_redraw = false;
		var layer_scale = this.layer.getScale();
		var layer_angle = this.layer.getAngle();
		var rcTex = this.rcTex;
		var floatscaledwidth = layer_scale * this.width;
		var floatscaledheight = layer_scale * this.height;
		var scaledwidth = Math.ceil(floatscaledwidth);
		var scaledheight = Math.ceil(floatscaledheight);
		var absscaledwidth = Math.abs(scaledwidth);
		var absscaledheight = Math.abs(scaledheight);
		var halfw = this.runtime.draw_width / 2;
		var halfh = this.runtime.draw_height / 2;
		if (!this.myctx) {
			this.mycanvas = document.createElement("canvas");
			this.mycanvas.width = absscaledwidth;
			this.mycanvas.height = absscaledheight;
			this.lastwidth = absscaledwidth;
			this.lastheight = absscaledheight;
			need_redraw = true;
			this.myctx = this.mycanvas.getContext("2d");
		}
		if (absscaledwidth !== this.lastwidth || absscaledheight !== this.lastheight) {
			this.mycanvas.width = absscaledwidth;
			this.mycanvas.height = absscaledheight;
			if (this.mytex) {
				glw.deleteTexture(this.mytex);
				this.mytex = null;
			}
			need_redraw = true;
		}
		if (need_redraw) {
			this.myctx.clearRect(0, 0, absscaledwidth, absscaledheight);
			this.draw(this.myctx, true);
			if (!this.mytex)
				this.mytex = glw.createEmptyTexture(absscaledwidth, absscaledheight, this.runtime.linearSampling, this.runtime.isMobile);
			glw.videoToTexture(this.mycanvas, this.mytex, this.runtime.isMobile);
		}
		this.lastwidth = absscaledwidth;
		this.lastheight = absscaledheight;
		glw.setTexture(this.mytex);
		glw.setOpacity(this.opacity);
		glw.resetModelView();
		glw.translate(-halfw, -halfh);
		glw.updateModelView();
		var q = this.bquad;
		var tlx = this.layer.layerToCanvas(q.tlx, q.tly, true, true);
		var tly = this.layer.layerToCanvas(q.tlx, q.tly, false, true);
		var trx = this.layer.layerToCanvas(q.trx, q.try_, true, true);
		var try_ = this.layer.layerToCanvas(q.trx, q.try_, false, true);
		var brx = this.layer.layerToCanvas(q.brx, q.bry, true, true);
		var bry = this.layer.layerToCanvas(q.brx, q.bry, false, true);
		var blx = this.layer.layerToCanvas(q.blx, q.bly, true, true);
		var bly = this.layer.layerToCanvas(q.blx, q.bly, false, true);
		if (this.runtime.pixel_rounding || (this.angle === 0 && layer_angle === 0)) {
			var ox = ((tlx + 0.5) | 0) - tlx;
			var oy = ((tly + 0.5) | 0) - tly
			tlx += ox;
			tly += oy;
			trx += ox;
			try_ += oy;
			brx += ox;
			bry += oy;
			blx += ox;
			bly += oy;
		}
		if (this.angle === 0 && layer_angle === 0) {
			trx = tlx + scaledwidth;
			try_ = tly;
			brx = trx;
			bry = tly + scaledheight;
			blx = tlx;
			bly = bry;
			rcTex.right = 1;
			rcTex.bottom = 1;
		}
		else {
			rcTex.right = floatscaledwidth / scaledwidth;
			rcTex.bottom = floatscaledheight / scaledheight;
		}
		glw.quadTex(tlx, tly, trx, try_, brx, bry, blx, bly, rcTex);
		glw.resetModelView();
		glw.scale(layer_scale, layer_scale);
		glw.rotateZ(-this.layer.getAngle());
		glw.translate((this.layer.viewLeft + this.layer.viewRight) / -2, (this.layer.viewTop + this.layer.viewBottom) / -2);
		glw.updateModelView();
		this.last_render_tick = this.runtime.tickcount;
	};
	var wordsCache = [];
	pluginProto.TokeniseWords = function (text) {
		cr.clearArray(wordsCache);
		var cur_word = "";
		var ch;
		var i = 0;
		while (i < text.length) {
			ch = text.charAt(i);
			if (ch === "\n") {
				if (cur_word.length) {
					wordsCache.push(cur_word);
					cur_word = "";
				}
				wordsCache.push("\n");
				++i;
			}
			else if (ch === " " || ch === "\t" || ch === "-") {
				do {
					cur_word += text.charAt(i);
					i++;
				}
				while (i < text.length && (text.charAt(i) === " " || text.charAt(i) === "\t"));
				wordsCache.push(cur_word);
				cur_word = "";
			}
			else if (i < text.length) {
				cur_word += ch;
				i++;
			}
		}
		if (cur_word.length)
			wordsCache.push(cur_word);
	};
	var linesCache = [];

	function allocLine() {
		if (linesCache.length)
			return linesCache.pop();
		else
			return {};
	};

	function freeLine(l) {
		linesCache.push(l);
	};

	function freeAllLines(arr) {
		var i, len;
		for (i = 0, len = arr.length; i < len; i++) {
			freeLine(arr[i]);
		}
		cr.clearArray(arr);
	};
	pluginProto.WordWrap = function (text, lines, ctx, width, wrapbyword) {
		if (!text || !text.length) {
			freeAllLines(lines);
			return;
		}
		if (width <= 2.0) {
			freeAllLines(lines);
			return;
		}
		if (text.length <= 100 && text.indexOf("\n") === -1) {
			var all_width = ctx.measureText(text).width;
			if (all_width <= width) {
				freeAllLines(lines);
				lines.push(allocLine());
				lines[0].text = text;
				lines[0].width = all_width;
				return;
			}
		}
		this.WrapText(text, lines, ctx, width, wrapbyword);
	};

	function trimSingleSpaceRight(str) {
		if (!str.length || str.charAt(str.length - 1) !== " ")
			return str;
		return str.substring(0, str.length - 1);
	};
	pluginProto.WrapText = function (text, lines, ctx, width, wrapbyword) {
		var wordArray;
		if (wrapbyword) {
			this.TokeniseWords(text);	// writes to wordsCache
			wordArray = wordsCache;
		}
		else
			wordArray = text;
		var cur_line = "";
		var prev_line;
		var line_width;
		var i;
		var lineIndex = 0;
		var line;
		for (i = 0; i < wordArray.length; i++) {
			if (wordArray[i] === "\n") {
				if (lineIndex >= lines.length)
					lines.push(allocLine());
				cur_line = trimSingleSpaceRight(cur_line);		// for correct center/right alignment
				line = lines[lineIndex];
				line.text = cur_line;
				line.width = ctx.measureText(cur_line).width;
				lineIndex++;
				cur_line = "";
				continue;
			}
			prev_line = cur_line;
			cur_line += wordArray[i];
			line_width = ctx.measureText(cur_line).width;
			if (line_width >= width) {
				if (lineIndex >= lines.length)
					lines.push(allocLine());
				prev_line = trimSingleSpaceRight(prev_line);
				line = lines[lineIndex];
				line.text = prev_line;
				line.width = ctx.measureText(prev_line).width;
				lineIndex++;
				cur_line = wordArray[i];
				if (!wrapbyword && cur_line === " ")
					cur_line = "";
			}
		}
		if (cur_line.length) {
			if (lineIndex >= lines.length)
				lines.push(allocLine());
			cur_line = trimSingleSpaceRight(cur_line);
			line = lines[lineIndex];
			line.text = cur_line;
			line.width = ctx.measureText(cur_line).width;
			lineIndex++;
		}
		for (i = lineIndex; i < lines.length; i++)
			freeLine(lines[i]);
		lines.length = lineIndex;
	};

	function Cnds() {
	};
	Cnds.prototype.CompareText = function (text_to_compare, case_sensitive) {
		if (case_sensitive)
			return this.text == text_to_compare;
		else
			return cr.equals_nocase(this.text, text_to_compare);
	};
	pluginProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.SetText = function (param) {
		if (cr.is_number(param) && param < 1e9)
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
		var text_to_set = param.toString();
		if (this.text !== text_to_set) {
			this.text = text_to_set;
			this.text_changed = true;
			this.runtime.redraw = true;
		}
	};
	Acts.prototype.AppendText = function (param) {
		if (cr.is_number(param))
			param = Math.round(param * 1e10) / 1e10;	// round to nearest ten billionth - hides floating point errors
		var text_to_append = param.toString();
		if (text_to_append)	// not empty
		{
			this.text += text_to_append;
			this.text_changed = true;
			this.runtime.redraw = true;
		}
	};
	Acts.prototype.SetFontFace = function (face_, style_) {
		var newstyle = "";
		switch (style_) {
			case 1:
				newstyle = "bold";
				break;
			case 2:
				newstyle = "italic";
				break;
			case 3:
				newstyle = "bold italic";
				break;
		}
		if (face_ === this.facename && newstyle === this.fontstyle)
			return;		// no change
		this.facename = face_;
		this.fontstyle = newstyle;
		this.updateFont();
	};
	Acts.prototype.SetFontSize = function (size_) {
		if (this.ptSize === size_)
			return;
		this.ptSize = size_;
		this.pxHeight = Math.ceil((this.ptSize / 72.0) * 96.0) + 4;	// assume 96dpi...
		this.updateFont();
	};
	Acts.prototype.SetFontColor = function (rgb) {
		var newcolor = "rgb(" + cr.GetRValue(rgb).toString() + "," + cr.GetGValue(rgb).toString() + "," + cr.GetBValue(rgb).toString() + ")";
		if (newcolor === this.color)
			return;
		this.color = newcolor;
		this.need_text_redraw = true;
		this.runtime.redraw = true;
	};
	Acts.prototype.SetWebFont = function (familyname_, cssurl_) {
		if (this.runtime.isDomFree) {
			cr.logexport("[Construct 2] Text plugin: 'Set web font' not supported on this platform - the action has been ignored");
			return;		// DC todo
		}
		var self = this;
		var refreshFunc = (function () {
			self.runtime.redraw = true;
			self.text_changed = true;
		});
		if (requestedWebFonts.hasOwnProperty(cssurl_)) {
			var newfacename = "'" + familyname_ + "'";
			if (this.facename === newfacename)
				return;	// no change
			this.facename = newfacename;
			this.updateFont();
			for (var i = 1; i < 10; i++) {
				setTimeout(refreshFunc, i * 100);
				setTimeout(refreshFunc, i * 1000);
			}
			return;
		}
		var wf = document.createElement("link");
		wf.href = cssurl_;
		wf.rel = "stylesheet";
		wf.type = "text/css";
		wf.onload = refreshFunc;
		document.getElementsByTagName('head')[0].appendChild(wf);
		requestedWebFonts[cssurl_] = true;
		this.facename = "'" + familyname_ + "'";
		this.updateFont();
		for (var i = 1; i < 10; i++) {
			setTimeout(refreshFunc, i * 100);
			setTimeout(refreshFunc, i * 1000);
		}
		;
	};
	Acts.prototype.SetEffect = function (effect) {
		this.blend_mode = effect;
		this.compositeOp = cr.effectToCompositeOp(effect);
		cr.setGLBlend(this, effect, this.runtime.gl);
		this.runtime.redraw = true;
	};
	pluginProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.Text = function (ret) {
		ret.set_string(this.text);
	};
	Exps.prototype.FaceName = function (ret) {
		ret.set_string(this.facename);
	};
	Exps.prototype.FaceSize = function (ret) {
		ret.set_int(this.ptSize);
	};
	Exps.prototype.TextWidth = function (ret) {
		var w = 0;
		var i, len, x;
		for (i = 0, len = this.lines.length; i < len; i++) {
			x = this.lines[i].width;
			if (w < x)
				w = x;
		}
		ret.set_int(w);
	};
	Exps.prototype.TextHeight = function (ret) {
		ret.set_int(this.lines.length * (this.pxHeight + this.line_height_offset) - this.line_height_offset);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.TextBox = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var pluginProto = cr.plugins_.TextBox.prototype;
	pluginProto.Type = function (plugin) {
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function () {
	};
	pluginProto.Instance = function (type) {
		this.type = type;
		this.runtime = type.runtime;
	};
	var instanceProto = pluginProto.Instance.prototype;
	var elemTypes = ["text", "password", "email", "number", "tel", "url"];
	if (navigator.userAgent.indexOf("MSIE 9") > -1) {
		elemTypes[2] = "text";
		elemTypes[3] = "text";
		elemTypes[4] = "text";
		elemTypes[5] = "text";
	}
	instanceProto.onCreate = function () {
		if (this.runtime.isDomFree) {
			cr.logexport("[Construct 2] Textbox plugin not supported on this platform - the object will not be created");
			return;
		}
		if (this.properties[7] === 6)	// textarea
		{
			this.elem = document.createElement("textarea");
			// $(this.elem).css("resize", "none");
			this.elem.style.resize = "none"
		}
		else {
			this.elem = document.createElement("input");
			this.elem.type = elemTypes[this.properties[7]];
		}
		this.elem.id = this.properties[9];
		var el = this.runtime.canvasdiv ? this.runtime.canvasdiv : "body"
		el.append(this.elem)
		// $(this.elem).appendTo(this.runtime.canvasdiv ? this.runtime.canvasdiv : "body");
		this.elem["autocomplete"] = "off";
		this.elem.value = this.properties[0];
		this.elem["placeholder"] = this.properties[1];
		this.elem.title = this.properties[2];
		this.elem.disabled = (this.properties[4] === 0);
		this.elem["readOnly"] = (this.properties[5] === 1);
		this.elem["spellcheck"] = (this.properties[6] === 1);
		this.autoFontSize = (this.properties[8] !== 0);
		this.element_hidden = false;
		if (this.properties[3] === 0) {
			// $(this.elem).hide();
			this.elem.style.display = 'none'
			this.visible = false;
			this.element_hidden = true;
		}
		var onchangetrigger = (function (self) {
			return function () {
				self.runtime.trigger(cr.plugins_.TextBox.prototype.cnds.OnTextChanged, self);
			};
		})(this);
		this.elem["oninput"] = onchangetrigger;
		if (navigator.userAgent.indexOf("MSIE") !== -1)
			this.elem["oncut"] = onchangetrigger;
		this.elem.onclick = (function (self) {
			return function (e) {
				e.stopPropagation();
				self.runtime.isInUserInputEvent = true;
				self.runtime.trigger(cr.plugins_.TextBox.prototype.cnds.OnClicked, self);
				self.runtime.isInUserInputEvent = false;
			};
		})(this);
		this.elem.ondblclick = (function (self) {
			return function (e) {
				e.stopPropagation();
				self.runtime.isInUserInputEvent = true;
				self.runtime.trigger(cr.plugins_.TextBox.prototype.cnds.OnDoubleClicked, self);
				self.runtime.isInUserInputEvent = false;
			};
		})(this);
		this.elem.addEventListener("touchstart", function (e) {
			e.stopPropagation();
		}, false);
		this.elem.addEventListener("touchmove", function (e) {
			e.stopPropagation();
		}, false);
		this.elem.addEventListener("touchend", function (e) {
			e.stopPropagation();
		}, false);
		this.elem.addEventListener("mousedown", function (e) {
			e.stopPropagation();
		}, false);
		this.elem.addEventListener("mouseup", function (e) {
			e.stopPropagation();
		}, false);
		this.elem.addEventListener("keydown", function (e) {
			if (e.which !== 13 && e.which != 27)	// allow enter and escape
				e.stopPropagation();
		}, false);
		this.elem.addEventListener("mousedown", function (e) {
			if (e.which !== 13 && e.which != 27)	// allow enter and escape
				e.stopPropagation();
		}, false);
		// $(this.elem).mousedown(function (e) {
		// 	e.stopPropagation();
		// });
		// $(this.elem).mouseup(function (e) {
		// 	e.stopPropagation();
		// });
		// $(this.elem).keydown(function (e) {
		// 	if (e.which !== 13 && e.which != 27)	// allow enter and escape
		// 		e.stopPropagation();
		// });
		// $(this.elem).keyup(function (e) {
		// 	if (e.which !== 13 && e.which != 27)	// allow enter and escape
		// 		e.stopPropagation();
		// });
		this.lastLeft = 0;
		this.lastTop = 0;
		this.lastRight = 0;
		this.lastBottom = 0;
		this.lastWinWidth = 0;
		this.lastWinHeight = 0;
		this.updatePosition(true);
		this.runtime.tickMe(this);
	};
	instanceProto.saveToJSON = function () {
		return {
			"text": this.elem.value,
			"placeholder": this.elem.placeholder,
			"tooltip": this.elem.title,
			"disabled": !!this.elem.disabled,
			"readonly": !!this.elem.readOnly,
			"spellcheck": !!this.elem["spellcheck"]
		};
	};
	instanceProto.loadFromJSON = function (o) {
		this.elem.value = o["text"];
		this.elem.placeholder = o["placeholder"];
		this.elem.title = o["tooltip"];
		this.elem.disabled = o["disabled"];
		this.elem.readOnly = o["readonly"];
		this.elem["spellcheck"] = o["spellcheck"];
	};
	instanceProto.onDestroy = function () {
		if (this.runtime.isDomFree)
			return;
		// $(this.elem).remove();
		this.elem = null;
	};
	instanceProto.tick = function () {
		this.updatePosition();
	};
	instanceProto.updatePosition = function (first) {
		if (this.runtime.isDomFree)
			return;
		var left = this.layer.layerToCanvas(this.x, this.y, true);
		var top = this.layer.layerToCanvas(this.x, this.y, false);
		var right = this.layer.layerToCanvas(this.x + this.width, this.y + this.height, true);
		var bottom = this.layer.layerToCanvas(this.x + this.width, this.y + this.height, false);
		var rightEdge = this.runtime.width / this.runtime.devicePixelRatio;
		var bottomEdge = this.runtime.height / this.runtime.devicePixelRatio;
		if (!this.visible || !this.layer.visible || right <= 0 || bottom <= 0 || left >= rightEdge || top >= bottomEdge) {
			// if (!this.element_hidden)
			// $(this.elem).hide();
			this.element_hidden = true;
			return;
		}
		if (left < 1)
			left = 1;
		if (top < 1)
			top = 1;
		if (right >= rightEdge)
			right = rightEdge - 1;
		if (bottom >= bottomEdge)
			bottom = bottomEdge - 1;
		var curWinWidth = window.innerWidth;
		var curWinHeight = window.innerHeight;
		if (!first && this.lastLeft === left && this.lastTop === top && this.lastRight === right && this.lastBottom === bottom && this.lastWinWidth === curWinWidth && this.lastWinHeight === curWinHeight) {
			if (this.element_hidden) {
				// $(this.elem).show();
				this.element_hidden = false;
			}
			return;
		}
		this.lastLeft = left;
		this.lastTop = top;
		this.lastRight = right;
		this.lastBottom = bottom;
		this.lastWinWidth = curWinWidth;
		this.lastWinHeight = curWinHeight;
		if (this.element_hidden) {
			// $(this.elem).show();
			this.element_hidden = false;
		}
		var offx = Math.round(left) + offset(this.runtime.canvas).left;
		var offy = Math.round(top) + offset(this.runtime.canvas).top;
		this.elem.style.position = 'absolute'
		this.elem.offsetLeft = offx
		this.elem.offsetTop = offy

		this.elem.style.width = Math.round(right - left)
		this.elem.style.height = Math.round(right - left)

		if (this.autoFontSize)
			this.elem.style.fontSize = ((this.layer.getScale(true) / this.runtime.devicePixelRatio) - 0.2) + "em"

		// var offx = Math.round(left) + $(this.runtime.canvas).offset().left;
		// var offy = Math.round(top) + $(this.runtime.canvas).offset().top;
		// $(this.elem).css("position", "absolute");
		// $(this.elem).offset({left: offx, top: offy});
		// $(this.elem).width(Math.round(right - left));
		// $(this.elem).height(Math.round(bottom - top));
		// if (this.autoFontSize)
		// 	$(this.elem).css("font-size", ((this.layer.getScale(true) / this.runtime.devicePixelRatio) - 0.2) + "em");
	};
	instanceProto.draw = function (ctx) {
	};
	instanceProto.drawGL = function (glw) {
	};

	function Cnds() {
	};
	Cnds.prototype.CompareText = function (text, case_) {
		if (this.runtime.isDomFree)
			return false;
		if (case_ === 0)	// insensitive
			return cr.equals_nocase(this.elem.value, text);
		else
			return this.elem.value === text;
	};
	Cnds.prototype.OnTextChanged = function () {
		return true;
	};
	Cnds.prototype.OnClicked = function () {
		return true;
	};
	Cnds.prototype.OnDoubleClicked = function () {
		return true;
	};
	pluginProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.SetText = function (text) {
		if (this.runtime.isDomFree)
			return;
		this.elem.value = text;
	};
	Acts.prototype.SetPlaceholder = function (text) {
		if (this.runtime.isDomFree)
			return;
		this.elem.placeholder = text;
	};
	Acts.prototype.SetTooltip = function (text) {
		if (this.runtime.isDomFree)
			return;
		this.elem.title = text;
	};
	Acts.prototype.SetVisible = function (vis) {
		if (this.runtime.isDomFree)
			return;
		this.visible = (vis !== 0);
	};
	Acts.prototype.SetEnabled = function (en) {
		if (this.runtime.isDomFree)
			return;
		this.elem.disabled = (en === 0);
	};
	Acts.prototype.SetReadOnly = function (ro) {
		if (this.runtime.isDomFree)
			return;
		this.elem.readOnly = (ro === 0);
	};
	Acts.prototype.SetFocus = function () {
		if (this.runtime.isDomFree)
			return;
		this.elem.focus();
	};
	pluginProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.Text = function (ret) {
		if (this.runtime.isDomFree) {
			ret.set_string("");
			return;
		}
		ret.set_string(this.elem.value);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.TiledBg = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var pluginProto = cr.plugins_.TiledBg.prototype;
	pluginProto.Type = function (plugin) {
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function () {
		if (this.is_family)
			return;
		this.texture_img = new Image();
		this.texture_img.cr_filesize = this.texture_filesize;
		this.runtime.waitForImageLoad(this.texture_img, this.texture_file);
		this.pattern = null;
		this.webGL_texture = null;
	};
	typeProto.onLostWebGLContext = function () {
		if (this.is_family)
			return;
		this.webGL_texture = null;
	};
	typeProto.onRestoreWebGLContext = function () {
		if (this.is_family || !this.instances.length)
			return;
		if (!this.webGL_texture) {
			this.webGL_texture = this.runtime.glwrap.loadTexture(this.texture_img, true, this.runtime.linearSampling, this.texture_pixelformat);
		}
		var i, len;
		for (i = 0, len = this.instances.length; i < len; i++)
			this.instances[i].webGL_texture = this.webGL_texture;
	};
	typeProto.loadTextures = function () {
		if (this.is_family || this.webGL_texture || !this.runtime.glwrap)
			return;
		this.webGL_texture = this.runtime.glwrap.loadTexture(this.texture_img, true, this.runtime.linearSampling, this.texture_pixelformat);
	};
	typeProto.unloadTextures = function () {
		if (this.is_family || this.instances.length || !this.webGL_texture)
			return;
		this.runtime.glwrap.deleteTexture(this.webGL_texture);
		this.webGL_texture = null;
	};
	typeProto.preloadCanvas2D = function (ctx) {
		ctx.drawImage(this.texture_img, 0, 0);
	};
	pluginProto.Instance = function (type) {
		this.type = type;
		this.runtime = type.runtime;
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function () {
		this.visible = (this.properties[0] === 0);							// 0=visible, 1=invisible
		this.rcTex = new cr.rect(0, 0, 0, 0);
		this.has_own_texture = false;										// true if a texture loaded in from URL
		this.texture_img = this.type.texture_img;
		if (this.runtime.glwrap) {
			this.type.loadTextures();
			this.webGL_texture = this.type.webGL_texture;
		}
		else {
			if (!this.type.pattern)
				this.type.pattern = this.runtime.ctx.createPattern(this.type.texture_img, "repeat");
			this.pattern = this.type.pattern;
		}
	};
	instanceProto.afterLoad = function () {
		this.has_own_texture = false;
		this.texture_img = this.type.texture_img;
	};
	instanceProto.onDestroy = function () {
		if (this.runtime.glwrap && this.has_own_texture && this.webGL_texture) {
			this.runtime.glwrap.deleteTexture(this.webGL_texture);
			this.webGL_texture = null;
		}
	};
	instanceProto.draw = function (ctx) {
		ctx.globalAlpha = this.opacity;
		ctx.save();
		ctx.fillStyle = this.pattern;
		var myx = this.x;
		var myy = this.y;
		if (this.runtime.pixel_rounding) {
			myx = Math.round(myx);
			myy = Math.round(myy);
		}
		var drawX = -(this.hotspotX * this.width);
		var drawY = -(this.hotspotY * this.height);
		var offX = drawX % this.texture_img.width;
		var offY = drawY % this.texture_img.height;
		if (offX < 0)
			offX += this.texture_img.width;
		if (offY < 0)
			offY += this.texture_img.height;
		ctx.translate(myx, myy);
		ctx.rotate(this.angle);
		ctx.translate(offX, offY);
		ctx.fillRect(drawX - offX,
			drawY - offY,
			this.width,
			this.height);
		ctx.restore();
	};
	instanceProto.drawGL_earlyZPass = function (glw) {
		this.drawGL(glw);
	};
	instanceProto.drawGL = function (glw) {
		glw.setTexture(this.webGL_texture);
		glw.setOpacity(this.opacity);
		var rcTex = this.rcTex;
		rcTex.right = this.width / this.texture_img.width;
		rcTex.bottom = this.height / this.texture_img.height;
		var q = this.bquad;
		if (this.runtime.pixel_rounding) {
			var ox = Math.round(this.x) - this.x;
			var oy = Math.round(this.y) - this.y;
			glw.quadTex(q.tlx + ox, q.tly + oy, q.trx + ox, q.try_ + oy, q.brx + ox, q.bry + oy, q.blx + ox, q.bly + oy, rcTex);
		}
		else
			glw.quadTex(q.tlx, q.tly, q.trx, q.try_, q.brx, q.bry, q.blx, q.bly, rcTex);
	};

	function Cnds() {
	};
	Cnds.prototype.OnURLLoaded = function () {
		return true;
	};
	pluginProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.SetEffect = function (effect) {
		this.blend_mode = effect;
		this.compositeOp = cr.effectToCompositeOp(effect);
		cr.setGLBlend(this, effect, this.runtime.gl);
		this.runtime.redraw = true;
	};
	Acts.prototype.LoadURL = function (url_, crossOrigin_) {
		var img = new Image();
		var self = this;
		img.onload = function () {
			self.texture_img = img;
			if (self.runtime.glwrap) {
				if (self.has_own_texture && self.webGL_texture)
					self.runtime.glwrap.deleteTexture(self.webGL_texture);
				self.webGL_texture = self.runtime.glwrap.loadTexture(img, true, self.runtime.linearSampling);
			}
			else {
				self.pattern = self.runtime.ctx.createPattern(img, "repeat");
			}
			self.has_own_texture = true;
			self.runtime.redraw = true;
			self.runtime.trigger(cr.plugins_.TiledBg.prototype.cnds.OnURLLoaded, self);
		};
		if (url_.substr(0, 5) !== "data:" && crossOrigin_ === 0)
			img.crossOrigin = "anonymous";
		this.runtime.setImageSrc(img, url_);
	};
	pluginProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.ImageWidth = function (ret) {
		ret.set_float(this.texture_img.width);
	};
	Exps.prototype.ImageHeight = function (ret) {
		ret.set_float(this.texture_img.height);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.Touch = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var pluginProto = cr.plugins_.Touch.prototype;
	pluginProto.Type = function (plugin) {
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function () {
	};
	pluginProto.Instance = function (type) {
		this.type = type;
		this.runtime = type.runtime;
		this.touches = [];
		this.mouseDown = false;
	};
	var instanceProto = pluginProto.Instance.prototype;
	var dummyoffset = {left: 0, top: 0};
	instanceProto.findTouch = function (id) {
		var i, len;
		for (i = 0, len = this.touches.length; i < len; i++) {
			if (this.touches[i]["id"] === id)
				return i;
		}
		return -1;
	};
	var appmobi_accx = 0;
	var appmobi_accy = 0;
	var appmobi_accz = 0;

	function AppMobiGetAcceleration(evt) {
		appmobi_accx = evt.x;
		appmobi_accy = evt.y;
		appmobi_accz = evt.z;
	};
	var pg_accx = 0;
	var pg_accy = 0;
	var pg_accz = 0;

	function PhoneGapGetAcceleration(evt) {
		pg_accx = evt.x;
		pg_accy = evt.y;
		pg_accz = evt.z;
	};
	var theInstance = null;
	var touchinfo_cache = [];

	function AllocTouchInfo(x, y, id, index) {
		var ret;
		if (touchinfo_cache.length)
			ret = touchinfo_cache.pop();
		else
			ret = new TouchInfo();
		ret.init(x, y, id, index);
		return ret;
	};

	function ReleaseTouchInfo(ti) {
		if (touchinfo_cache.length < 100)
			touchinfo_cache.push(ti);
	};
	var GESTURE_HOLD_THRESHOLD = 15;		// max px motion for hold gesture to register
	var GESTURE_HOLD_TIMEOUT = 500;			// time for hold gesture to register
	var GESTURE_TAP_TIMEOUT = 333;			// time for tap gesture to register
	var GESTURE_DOUBLETAP_THRESHOLD = 25;	// max distance apart for taps to be
	function TouchInfo() {
		this.starttime = 0;
		this.time = 0;
		this.lasttime = 0;
		this.startx = 0;
		this.starty = 0;
		this.x = 0;
		this.y = 0;
		this.lastx = 0;
		this.lasty = 0;
		this["id"] = 0;
		this.startindex = 0;
		this.triggeredHold = false;
		this.tooFarForHold = false;
	};
	TouchInfo.prototype.init = function (x, y, id, index) {
		var nowtime = cr.performance_now();
		this.time = nowtime;
		this.lasttime = nowtime;
		this.starttime = nowtime;
		this.startx = x;
		this.starty = y;
		this.x = x;
		this.y = y;
		this.lastx = x;
		this.lasty = y;
		this.width = 0;
		this.height = 0;
		this.pressure = 0;
		this["id"] = id;
		this.startindex = index;
		this.triggeredHold = false;
		this.tooFarForHold = false;
	};
	TouchInfo.prototype.update = function (nowtime, x, y, width, height, pressure) {
		this.lasttime = this.time;
		this.time = nowtime;
		this.lastx = this.x;
		this.lasty = this.y;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.pressure = pressure;
		if (!this.tooFarForHold && cr.distanceTo(this.startx, this.starty, this.x, this.y) >= GESTURE_HOLD_THRESHOLD) {
			this.tooFarForHold = true;
		}
	};
	TouchInfo.prototype.maybeTriggerHold = function (inst, index) {
		if (this.triggeredHold)
			return;		// already triggered this gesture
		var nowtime = cr.performance_now();
		if (nowtime - this.starttime >= GESTURE_HOLD_TIMEOUT && !this.tooFarForHold && cr.distanceTo(this.startx, this.starty, this.x, this.y) < GESTURE_HOLD_THRESHOLD) {
			this.triggeredHold = true;
			inst.trigger_index = this.startindex;
			inst.trigger_id = this["id"];
			inst.getTouchIndex = index;
			inst.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnHoldGesture, inst);
			inst.curTouchX = this.x;
			inst.curTouchY = this.y;
			inst.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnHoldGestureObject, inst);
			inst.getTouchIndex = 0;
		}
	};
	var lastTapX = -1000;
	var lastTapY = -1000;
	var lastTapTime = -10000;
	TouchInfo.prototype.maybeTriggerTap = function (inst, index) {
		if (this.triggeredHold)
			return;
		var nowtime = cr.performance_now();
		if (nowtime - this.starttime <= GESTURE_TAP_TIMEOUT && !this.tooFarForHold && cr.distanceTo(this.startx, this.starty, this.x, this.y) < GESTURE_HOLD_THRESHOLD) {
			inst.trigger_index = this.startindex;
			inst.trigger_id = this["id"];
			inst.getTouchIndex = index;
			if ((nowtime - lastTapTime <= GESTURE_TAP_TIMEOUT * 2) && cr.distanceTo(lastTapX, lastTapY, this.x, this.y) < GESTURE_DOUBLETAP_THRESHOLD) {
				inst.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnDoubleTapGesture, inst);
				inst.curTouchX = this.x;
				inst.curTouchY = this.y;
				inst.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnDoubleTapGestureObject, inst);
				lastTapX = -1000;
				lastTapY = -1000;
				lastTapTime = -10000;
			}
			else {
				inst.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTapGesture, inst);
				inst.curTouchX = this.x;
				inst.curTouchY = this.y;
				inst.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTapGestureObject, inst);
				lastTapX = this.x;
				lastTapY = this.y;
				lastTapTime = nowtime;
			}
			inst.getTouchIndex = 0;
		}
	};
	instanceProto.onCreate = function () {
		theInstance = this;
		this.isWindows8 = !!(typeof window["c2isWindows8"] !== "undefined" && window["c2isWindows8"]);
		this.orient_alpha = 0;
		this.orient_beta = 0;
		this.orient_gamma = 0;
		this.acc_g_x = 0;
		this.acc_g_y = 0;
		this.acc_g_z = 0;
		this.acc_x = 0;
		this.acc_y = 0;
		this.acc_z = 0;
		this.curTouchX = 0;
		this.curTouchY = 0;
		this.trigger_index = 0;
		this.trigger_id = 0;
		this.getTouchIndex = 0;
		this.useMouseInput = (this.properties[0] !== 0);
		var elem = (this.runtime.fullscreen_mode > 0) ? document : this.runtime.canvas;
		var elem2 = document;
		if (this.runtime.isDirectCanvas)
			elem2 = elem = window["Canvas"];
		else if (this.runtime.isCocoonJs)
			elem2 = elem = window;
		var self = this;
		if (typeof PointerEvent !== "undefined") {
			elem.addEventListener("pointerdown",
				function (info) {
					self.onPointerStart(info);
				},
				false
			);
			elem.addEventListener("pointermove",
				function (info) {
					self.onPointerMove(info);
				},
				false
			);
			elem2.addEventListener("pointerup",
				function (info) {
					self.onPointerEnd(info, false);
				},
				false
			);
			elem2.addEventListener("pointercancel",
				function (info) {
					self.onPointerEnd(info, true);
				},
				false
			);
			if (this.runtime.canvas) {
				this.runtime.canvas.addEventListener("MSGestureHold", function (e) {
					e.preventDefault();
				}, false);
				document.addEventListener("MSGestureHold", function (e) {
					e.preventDefault();
				}, false);
				this.runtime.canvas.addEventListener("gesturehold", function (e) {
					e.preventDefault();
				}, false);
				document.addEventListener("gesturehold", function (e) {
					e.preventDefault();
				}, false);
			}
		}
		else if (window.navigator["msPointerEnabled"]) {
			elem.addEventListener("MSPointerDown",
				function (info) {
					self.onPointerStart(info);
				},
				false
			);
			elem.addEventListener("MSPointerMove",
				function (info) {
					self.onPointerMove(info);
				},
				false
			);
			elem2.addEventListener("MSPointerUp",
				function (info) {
					self.onPointerEnd(info, false);
				},
				false
			);
			elem2.addEventListener("MSPointerCancel",
				function (info) {
					self.onPointerEnd(info, true);
				},
				false
			);
			if (this.runtime.canvas) {
				this.runtime.canvas.addEventListener("MSGestureHold", function (e) {
					e.preventDefault();
				}, false);
				document.addEventListener("MSGestureHold", function (e) {
					e.preventDefault();
				}, false);
			}
		}
		else {
			elem.addEventListener("touchstart",
				function (info) {
					self.onTouchStart(info);
				},
				false
			);
			elem.addEventListener("touchmove",
				function (info) {
					self.onTouchMove(info);
				},
				false
			);
			elem2.addEventListener("touchend",
				function (info) {
					self.onTouchEnd(info, false);
				},
				false
			);
			elem2.addEventListener("touchcancel",
				function (info) {
					self.onTouchEnd(info, true);
				},
				false
			);
		}
		if (this.isWindows8) {
			var win8accelerometerFn = function (e) {
				var reading = e["reading"];
				self.acc_x = reading["accelerationX"];
				self.acc_y = reading["accelerationY"];
				self.acc_z = reading["accelerationZ"];
			};
			var win8inclinometerFn = function (e) {
				var reading = e["reading"];
				self.orient_alpha = reading["yawDegrees"];
				self.orient_beta = reading["pitchDegrees"];
				self.orient_gamma = reading["rollDegrees"];
			};
			var accelerometer = Windows["Devices"]["Sensors"]["Accelerometer"]["getDefault"]();
			if (accelerometer) {
				accelerometer["reportInterval"] = Math.max(accelerometer["minimumReportInterval"], 16);
				accelerometer.addEventListener("readingchanged", win8accelerometerFn);
			}
			var inclinometer = Windows["Devices"]["Sensors"]["Inclinometer"]["getDefault"]();
			if (inclinometer) {
				inclinometer["reportInterval"] = Math.max(inclinometer["minimumReportInterval"], 16);
				inclinometer.addEventListener("readingchanged", win8inclinometerFn);
			}
			document.addEventListener("visibilitychange", function (e) {
				if (document["hidden"] || document["msHidden"]) {
					if (accelerometer)
						accelerometer.removeEventListener("readingchanged", win8accelerometerFn);
					if (inclinometer)
						inclinometer.removeEventListener("readingchanged", win8inclinometerFn);
				}
				else {
					if (accelerometer)
						accelerometer.addEventListener("readingchanged", win8accelerometerFn);
					if (inclinometer)
						inclinometer.addEventListener("readingchanged", win8inclinometerFn);
				}
			}, false);
		}
		else {
			window.addEventListener("deviceorientation", function (eventData) {
				self.orient_alpha = eventData["alpha"] || 0;
				self.orient_beta = eventData["beta"] || 0;
				self.orient_gamma = eventData["gamma"] || 0;
			}, false);
			window.addEventListener("devicemotion", function (eventData) {
				if (eventData["accelerationIncludingGravity"]) {
					self.acc_g_x = eventData["accelerationIncludingGravity"]["x"] || 0;
					self.acc_g_y = eventData["accelerationIncludingGravity"]["y"] || 0;
					self.acc_g_z = eventData["accelerationIncludingGravity"]["z"] || 0;
				}
				if (eventData["acceleration"]) {
					self.acc_x = eventData["acceleration"]["x"] || 0;
					self.acc_y = eventData["acceleration"]["y"] || 0;
					self.acc_z = eventData["acceleration"]["z"] || 0;
				}
			}, false);
		}
		if (this.useMouseInput && !this.runtime.isDomFree) {
			document.addEventListener("mousemove", function (info) {
				self.onMouseMove(info);
			}, false);
			document.addEventListener("mousedown", function (info) {
				self.onMouseDown(info);
			}, false);
			document.addEventListener("mouseup", function (info) {
				self.onMouseUp(info);
			}, false);
			// $(document).mousemove(
			// 	function(info) {
			// 		self.onMouseMove(info);
			// 	}
			// );
			// $(document).mousedown(
			// 	function(info) {
			// 		self.onMouseDown(info);
			// 	}
			// );
			// $(document).mouseup(
			// 	function(info) {
			// 		self.onMouseUp(info);
			// 	}
			// );
		}
		if (!this.runtime.isiOS && this.runtime.isCordova && navigator["accelerometer"] && navigator["accelerometer"]["watchAcceleration"]) {
			navigator["accelerometer"]["watchAcceleration"](PhoneGapGetAcceleration, null, {"frequency": 40});
		}
		this.runtime.tick2Me(this);
	};

	function offsetFun(elem) {
		var obj = {
			left: elem.offsetLeft,
			top: elem.offsetTop,
			width: elem.offsetWidth,
			height: elem.offsetHeight
		}
		return obj;
	}

	instanceProto.onPointerMove = function (info) {
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"] || info["pointerType"] === "mouse")
			return;
		if (info.preventDefault)
			info.preventDefault();
		var i = this.findTouch(info["pointerId"]);
		var nowtime = cr.performance_now();
		if (i >= 0) {
			var offset = this.runtime.isDomFree ? dummyoffset : offsetFun(this.runtime.canvas);
			var t = this.touches[i];
			if (nowtime - t.time < 2)
				return;
			t.update(nowtime, info.pageX - offset.left, info.pageY - offset.top, info.width || 0, info.height || 0, info.pressure || 0);
		}
	};
	instanceProto.onPointerStart = function (info) {
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"] || info["pointerType"] === "mouse")
			return;
		if (info.preventDefault && cr.isCanvasInputEvent(info))
			info.preventDefault();
		var offset = this.runtime.isDomFree ? dummyoffset : offsetFun(this.runtime.canvas);
		var touchx = info.pageX - offset.left;
		var touchy = info.pageY - offset.top;
		var nowtime = cr.performance_now();
		this.trigger_index = this.touches.length;
		this.trigger_id = info["pointerId"];
		this.touches.push(AllocTouchInfo(touchx, touchy, info["pointerId"], this.trigger_index));
		this.runtime.isInUserInputEvent = true;
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchStart, this);
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchStart, this);
		this.curTouchX = touchx;
		this.curTouchY = touchy;
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchObject, this);
		this.runtime.isInUserInputEvent = false;
	};
	instanceProto.onPointerEnd = function (info, isCancel) {
		if (info["pointerType"] === info["MSPOINTER_TYPE_MOUSE"] || info["pointerType"] === "mouse")
			return;
		if (info.preventDefault && cr.isCanvasInputEvent(info))
			info.preventDefault();
		var i = this.findTouch(info["pointerId"]);
		this.trigger_index = (i >= 0 ? this.touches[i].startindex : -1);
		this.trigger_id = (i >= 0 ? this.touches[i]["id"] : -1);
		this.runtime.isInUserInputEvent = true;
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchEnd, this);
		this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchEnd, this);
		if (i >= 0) {
			if (!isCancel)
				this.touches[i].maybeTriggerTap(this, i);
			ReleaseTouchInfo(this.touches[i]);
			this.touches.splice(i, 1);
		}
		this.runtime.isInUserInputEvent = false;
	};
	instanceProto.onTouchMove = function (info) {
		if (info.preventDefault)
			info.preventDefault();
		var nowtime = cr.performance_now();
		var i, len, t, u;
		for (i = 0, len = info.changedTouches.length; i < len; i++) {
			t = info.changedTouches[i];
			var j = this.findTouch(t["identifier"]);
			if (j >= 0) {
				var offset = this.runtime.isDomFree ? dummyoffset : offsetFun(this.runtime.canvas);
				u = this.touches[j];
				if (nowtime - u.time < 2)
					continue;
				var touchWidth = (t.radiusX || t.webkitRadiusX || t.mozRadiusX || t.msRadiusX || 0) * 2;
				var touchHeight = (t.radiusY || t.webkitRadiusY || t.mozRadiusY || t.msRadiusY || 0) * 2;
				var touchForce = t.force || t.webkitForce || t.mozForce || t.msForce || 0;
				u.update(nowtime, t.pageX - offset.left, t.pageY - offset.top, touchWidth, touchHeight, touchForce);
			}
		}
	};
	instanceProto.onTouchStart = function (info) {
		if (info.preventDefault && cr.isCanvasInputEvent(info))
			info.preventDefault();
		var offset = this.runtime.isDomFree ? dummyoffset : offsetFun(this.runtime.canvas)
		var nowtime = cr.performance_now();
		this.runtime.isInUserInputEvent = true;
		var i, len, t, j;
		for (i = 0, len = info.changedTouches.length; i < len; i++) {
			t = info.changedTouches[i];
			j = this.findTouch(t["identifier"]);
			if (j !== -1)
				continue;
			var touchx = t.pageX - offset.left;
			var touchy = t.pageY - offset.top;
			this.trigger_index = this.touches.length;
			this.trigger_id = t["identifier"];
			this.touches.push(AllocTouchInfo(touchx, touchy, t["identifier"], this.trigger_index));
			this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchStart, this);
			this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchStart, this);
			this.curTouchX = touchx;
			this.curTouchY = touchy;
			this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchObject, this);
		}
		this.runtime.isInUserInputEvent = false;
	};
	instanceProto.onTouchEnd = function (info, isCancel) {
		if (info.preventDefault && cr.isCanvasInputEvent(info))
			info.preventDefault();
		this.runtime.isInUserInputEvent = true;
		var i, len, t, j;
		for (i = 0, len = info.changedTouches.length; i < len; i++) {
			t = info.changedTouches[i];
			j = this.findTouch(t["identifier"]);
			if (j >= 0) {
				this.trigger_index = this.touches[j].startindex;
				this.trigger_id = this.touches[j]["id"];
				this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnNthTouchEnd, this);
				this.runtime.trigger(cr.plugins_.Touch.prototype.cnds.OnTouchEnd, this);
				if (!isCancel)
					this.touches[j].maybeTriggerTap(this, j);
				ReleaseTouchInfo(this.touches[j]);
				this.touches.splice(j, 1);
			}
		}
		this.runtime.isInUserInputEvent = false;
	};
	instanceProto.getAlpha = function () {
		if (this.runtime.isCordova && this.orient_alpha === 0 && pg_accz !== 0)
			return pg_accz * 90;
		else
			return this.orient_alpha;
	};
	instanceProto.getBeta = function () {
		if (this.runtime.isCordova && this.orient_beta === 0 && pg_accy !== 0)
			return pg_accy * 90;
		else
			return this.orient_beta;
	};
	instanceProto.getGamma = function () {
		if (this.runtime.isCordova && this.orient_gamma === 0 && pg_accx !== 0)
			return pg_accx * 90;
		else
			return this.orient_gamma;
	};
	var noop_func = function () {
	};
	instanceProto.onMouseDown = function (info) {
		var t = {pageX: info.pageX, pageY: info.pageY, "identifier": 0};
		var fakeinfo = {changedTouches: [t]};
		this.onTouchStart(fakeinfo);
		this.mouseDown = true;
	};
	instanceProto.onMouseMove = function (info) {
		if (!this.mouseDown)
			return;
		var t = {pageX: info.pageX, pageY: info.pageY, "identifier": 0};
		var fakeinfo = {changedTouches: [t]};
		this.onTouchMove(fakeinfo);
	};
	instanceProto.onMouseUp = function (info) {
		if (info.preventDefault && this.runtime.had_a_click && !this.runtime.isMobile)
			info.preventDefault();
		this.runtime.had_a_click = true;
		var t = {pageX: info.pageX, pageY: info.pageY, "identifier": 0};
		var fakeinfo = {changedTouches: [t]};
		this.onTouchEnd(fakeinfo);
		this.mouseDown = false;
	};
	instanceProto.tick2 = function () {
		var i, len, t;
		var nowtime = cr.performance_now();
		for (i = 0, len = this.touches.length; i < len; ++i) {
			t = this.touches[i];
			if (t.time <= nowtime - 50)
				t.lasttime = nowtime;
			t.maybeTriggerHold(this, i);
		}
	};

	function Cnds() {
	};
	Cnds.prototype.OnTouchStart = function () {
		return true;
	};
	Cnds.prototype.OnTouchEnd = function () {
		return true;
	};
	Cnds.prototype.IsInTouch = function () {
		return this.touches.length;
	};
	Cnds.prototype.OnTouchObject = function (type) {
		if (!type)
			return false;
		return this.runtime.testAndSelectCanvasPointOverlap(type, this.curTouchX, this.curTouchY, false);
	};
	var touching = [];
	Cnds.prototype.IsTouchingObject = function (type) {
		if (!type)
			return false;
		var sol = type.getCurrentSol();
		var instances = sol.getObjects();
		var px, py;
		var i, leni, j, lenj;
		for (i = 0, leni = instances.length; i < leni; i++) {
			var inst = instances[i];
			inst.update_bbox();
			for (j = 0, lenj = this.touches.length; j < lenj; j++) {
				var touch = this.touches[j];
				px = inst.layer.canvasToLayer(touch.x, touch.y, true);
				py = inst.layer.canvasToLayer(touch.x, touch.y, false);
				if (inst.contains_pt(px, py)) {
					touching.push(inst);
					break;
				}
			}
		}
		if (touching.length) {
			sol.select_all = false;
			cr.shallowAssignArray(sol.instances, touching);
			type.applySolToContainer();
			cr.clearArray(touching);
			return true;
		}
		else
			return false;
	};
	Cnds.prototype.CompareTouchSpeed = function (index, cmp, s) {
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length)
			return false;
		var t = this.touches[index];
		var dist = cr.distanceTo(t.x, t.y, t.lastx, t.lasty);
		var timediff = (t.time - t.lasttime) / 1000;
		var speed = 0;
		if (timediff > 0)
			speed = dist / timediff;
		return cr.do_cmp(speed, cmp, s);
	};
	Cnds.prototype.OrientationSupported = function () {
		return typeof window["DeviceOrientationEvent"] !== "undefined";
	};
	Cnds.prototype.MotionSupported = function () {
		return typeof window["DeviceMotionEvent"] !== "undefined";
	};
	Cnds.prototype.CompareOrientation = function (orientation_, cmp_, angle_) {
		var v = 0;
		if (orientation_ === 0)
			v = this.getAlpha();
		else if (orientation_ === 1)
			v = this.getBeta();
		else
			v = this.getGamma();
		return cr.do_cmp(v, cmp_, angle_);
	};
	Cnds.prototype.CompareAcceleration = function (acceleration_, cmp_, angle_) {
		var v = 0;
		if (acceleration_ === 0)
			v = this.acc_g_x;
		else if (acceleration_ === 1)
			v = this.acc_g_y;
		else if (acceleration_ === 2)
			v = this.acc_g_z;
		else if (acceleration_ === 3)
			v = this.acc_x;
		else if (acceleration_ === 4)
			v = this.acc_y;
		else if (acceleration_ === 5)
			v = this.acc_z;
		return cr.do_cmp(v, cmp_, angle_);
	};
	Cnds.prototype.OnNthTouchStart = function (touch_) {
		touch_ = Math.floor(touch_);
		return touch_ === this.trigger_index;
	};
	Cnds.prototype.OnNthTouchEnd = function (touch_) {
		touch_ = Math.floor(touch_);
		return touch_ === this.trigger_index;
	};
	Cnds.prototype.HasNthTouch = function (touch_) {
		touch_ = Math.floor(touch_);
		return this.touches.length >= touch_ + 1;
	};
	Cnds.prototype.OnHoldGesture = function () {
		return true;
	};
	Cnds.prototype.OnTapGesture = function () {
		return true;
	};
	Cnds.prototype.OnDoubleTapGesture = function () {
		return true;
	};
	Cnds.prototype.OnHoldGestureObject = function (type) {
		if (!type)
			return false;
		return this.runtime.testAndSelectCanvasPointOverlap(type, this.curTouchX, this.curTouchY, false);
	};
	Cnds.prototype.OnTapGestureObject = function (type) {
		if (!type)
			return false;
		return this.runtime.testAndSelectCanvasPointOverlap(type, this.curTouchX, this.curTouchY, false);
	};
	Cnds.prototype.OnDoubleTapGestureObject = function (type) {
		if (!type)
			return false;
		return this.runtime.testAndSelectCanvasPointOverlap(type, this.curTouchX, this.curTouchY, false);
	};
	pluginProto.cnds = new Cnds();

	function Exps() {
	};
	Exps.prototype.TouchCount = function (ret) {
		ret.set_int(this.touches.length);
	};
	Exps.prototype.X = function (ret, layerparam) {
		var index = this.getTouchIndex;
		if (index < 0 || index >= this.touches.length) {
			ret.set_float(0);
			return;
		}
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
		if (cr.is_undefined(layerparam)) {
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1.0;
			layer.parallaxX = 1.0;
			layer.angle = 0;
			ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxX = oldParallaxX;
			layer.angle = oldAngle;
		}
		else {
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.XAt = function (ret, index, layerparam) {
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length) {
			ret.set_float(0);
			return;
		}
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
		if (cr.is_undefined(layerparam)) {
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1.0;
			layer.parallaxX = 1.0;
			layer.angle = 0;
			ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxX = oldParallaxX;
			layer.angle = oldAngle;
		}
		else {
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, true));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.XForID = function (ret, id, layerparam) {
		var index = this.findTouch(id);
		if (index < 0) {
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		var layer, oldScale, oldZoomRate, oldParallaxX, oldAngle;
		if (cr.is_undefined(layerparam)) {
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxX = layer.parallaxX;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1.0;
			layer.parallaxX = 1.0;
			layer.angle = 0;
			ret.set_float(layer.canvasToLayer(touch.x, touch.y, true));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxX = oldParallaxX;
			layer.angle = oldAngle;
		}
		else {
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(touch.x, touch.y, true));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.Y = function (ret, layerparam) {
		var index = this.getTouchIndex;
		if (index < 0 || index >= this.touches.length) {
			ret.set_float(0);
			return;
		}
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
		if (cr.is_undefined(layerparam)) {
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1.0;
			layer.parallaxY = 1.0;
			layer.angle = 0;
			ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxY = oldParallaxY;
			layer.angle = oldAngle;
		}
		else {
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.YAt = function (ret, index, layerparam) {
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length) {
			ret.set_float(0);
			return;
		}
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
		if (cr.is_undefined(layerparam)) {
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1.0;
			layer.parallaxY = 1.0;
			layer.angle = 0;
			ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxY = oldParallaxY;
			layer.angle = oldAngle;
		}
		else {
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(this.touches[index].x, this.touches[index].y, false));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.YForID = function (ret, id, layerparam) {
		var index = this.findTouch(id);
		if (index < 0) {
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		var layer, oldScale, oldZoomRate, oldParallaxY, oldAngle;
		if (cr.is_undefined(layerparam)) {
			layer = this.runtime.getLayerByNumber(0);
			oldScale = layer.scale;
			oldZoomRate = layer.zoomRate;
			oldParallaxY = layer.parallaxY;
			oldAngle = layer.angle;
			layer.scale = 1;
			layer.zoomRate = 1.0;
			layer.parallaxY = 1.0;
			layer.angle = 0;
			ret.set_float(layer.canvasToLayer(touch.x, touch.y, false));
			layer.scale = oldScale;
			layer.zoomRate = oldZoomRate;
			layer.parallaxY = oldParallaxY;
			layer.angle = oldAngle;
		}
		else {
			if (cr.is_number(layerparam))
				layer = this.runtime.getLayerByNumber(layerparam);
			else
				layer = this.runtime.getLayerByName(layerparam);
			if (layer)
				ret.set_float(layer.canvasToLayer(touch.x, touch.y, false));
			else
				ret.set_float(0);
		}
	};
	Exps.prototype.AbsoluteX = function (ret) {
		if (this.touches.length)
			ret.set_float(this.touches[0].x);
		else
			ret.set_float(0);
	};
	Exps.prototype.AbsoluteXAt = function (ret, index) {
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length) {
			ret.set_float(0);
			return;
		}
		ret.set_float(this.touches[index].x);
	};
	Exps.prototype.AbsoluteXForID = function (ret, id) {
		var index = this.findTouch(id);
		if (index < 0) {
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		ret.set_float(touch.x);
	};
	Exps.prototype.AbsoluteY = function (ret) {
		if (this.touches.length)
			ret.set_float(this.touches[0].y);
		else
			ret.set_float(0);
	};
	Exps.prototype.AbsoluteYAt = function (ret, index) {
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length) {
			ret.set_float(0);
			return;
		}
		ret.set_float(this.touches[index].y);
	};
	Exps.prototype.AbsoluteYForID = function (ret, id) {
		var index = this.findTouch(id);
		if (index < 0) {
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		ret.set_float(touch.y);
	};
	Exps.prototype.SpeedAt = function (ret, index) {
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length) {
			ret.set_float(0);
			return;
		}
		var t = this.touches[index];
		var dist = cr.distanceTo(t.x, t.y, t.lastx, t.lasty);
		var timediff = (t.time - t.lasttime) / 1000;
		if (timediff === 0)
			ret.set_float(0);
		else
			ret.set_float(dist / timediff);
	};
	Exps.prototype.SpeedForID = function (ret, id) {
		var index = this.findTouch(id);
		if (index < 0) {
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		var dist = cr.distanceTo(touch.x, touch.y, touch.lastx, touch.lasty);
		var timediff = (touch.time - touch.lasttime) / 1000;
		if (timediff === 0)
			ret.set_float(0);
		else
			ret.set_float(dist / timediff);
	};
	Exps.prototype.AngleAt = function (ret, index) {
		index = Math.floor(index);
		if (index < 0 || index >= this.touches.length) {
			ret.set_float(0);
			return;
		}
		var t = this.touches[index];
		ret.set_float(cr.to_degrees(cr.angleTo(t.lastx, t.lasty, t.x, t.y)));
	};
	Exps.prototype.AngleForID = function (ret, id) {
		var index = this.findTouch(id);
		if (index < 0) {
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		ret.set_float(cr.to_degrees(cr.angleTo(touch.lastx, touch.lasty, touch.x, touch.y)));
	};
	Exps.prototype.Alpha = function (ret) {
		ret.set_float(this.getAlpha());
	};
	Exps.prototype.Beta = function (ret) {
		ret.set_float(this.getBeta());
	};
	Exps.prototype.Gamma = function (ret) {
		ret.set_float(this.getGamma());
	};
	Exps.prototype.AccelerationXWithG = function (ret) {
		ret.set_float(this.acc_g_x);
	};
	Exps.prototype.AccelerationYWithG = function (ret) {
		ret.set_float(this.acc_g_y);
	};
	Exps.prototype.AccelerationZWithG = function (ret) {
		ret.set_float(this.acc_g_z);
	};
	Exps.prototype.AccelerationX = function (ret) {
		ret.set_float(this.acc_x);
	};
	Exps.prototype.AccelerationY = function (ret) {
		ret.set_float(this.acc_y);
	};
	Exps.prototype.AccelerationZ = function (ret) {
		ret.set_float(this.acc_z);
	};
	Exps.prototype.TouchIndex = function (ret) {
		ret.set_int(this.trigger_index);
	};
	Exps.prototype.TouchID = function (ret) {
		ret.set_float(this.trigger_id);
	};
	Exps.prototype.WidthForID = function (ret, id) {
		var index = this.findTouch(id);
		if (index < 0) {
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		ret.set_float(touch.width);
	};
	Exps.prototype.HeightForID = function (ret, id) {
		var index = this.findTouch(id);
		if (index < 0) {
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		ret.set_float(touch.height);
	};
	Exps.prototype.PressureForID = function (ret, id) {
		var index = this.findTouch(id);
		if (index < 0) {
			ret.set_float(0);
			return;
		}
		var touch = this.touches[index];
		ret.set_float(touch.pressure);
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.plugins_.vooxe = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var pluginProto = cr.plugins_.vooxe.prototype;
	pluginProto.Type = function (plugin) {
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function () {
	};
	pluginProto.Instance = function (type) {
		this.type = type;
		this.runtime = type.runtime;
		window["vooxe"] = {};
	};
	var instanceProto = pluginProto.Instance.prototype;
	var isSupported = false;
	instanceProto.onCreate = function () {
		if (!window["vooxe"]) {
			cr.logexport("[Construct 2] Vooxe Googleads plugin is required to show googleads ads with Cordova; other platforms are not supported");
			return;
		}
		isSupported = true;
		this.vooxe = window["vooxe"];
		var self = this;
		this.vooxe["onInit"] = function (data) {
			cr.logexport(data.Msg);
			self.isShowingBannerAd = false;
			self.runtime.trigger(cr.plugins_.vooxe.prototype.cnds.onInit, self);
		};
		this.vooxe["onError"] = function (data) {
			cr.logexport("Vooxe Googleads Plugin onError: " + data);
			self.isShowingBannerAd = true;
			self.runtime.trigger(cr.plugins_.vooxe.prototype.cnds.onError, self);
		};
		this.vooxe["onResumeGame"] = function () {
			cr.logexport("Vooxe Googleads Plugin: onResume");
			self.isShowingBannerAd = false;
			self.runtime.trigger(cr.plugins_.vooxe.prototype.cnds.onResumeGame, self);
		};
		this.vooxe["onPauseGame"] = function () {
			cr.logexport("Vooxe Googleads Plugin: onPauseGame");
			self.isShowingBannerAd = true;
			self.runtime.trigger(cr.plugins_.vooxe.prototype.cnds.onPauseGame, self);
		};
		this.vooxe["InitAds"] = function () {
			var settings = {
				gameId: self.properties[0],
				userId: self.properties[1],
				resumeGame: self.vooxe.onResumeGame,
				pauseGame: self.vooxe.onPauseGame,
				onInit: self.vooxe.onInit,
				onError: self.vooxe.onError
			};
			(function (i, s, o, g, r, a, m) {
				i['GameDistribution'] = r;
				i[r] = i[r] || function () {
					(i[r].q = i[r].q || []).push(arguments)
				};
				i[r].l = 1 * new Date();
				a = s.createElement(o);
				m = s.getElementsByTagName(o)[0];
				a.async = 1;
				a.src = g;
				m.parentNode.insertBefore(a, m);
			})(window, document, 'script', '//html5.api.gamedistribution.com/libs/gd/api.js', 'gdApi');
			gdApi(settings);
		}
	};

	function Cnds() {
	};
	Cnds.prototype.IsShowingBanner = function () {
		return this.isShowingBannerAd;
	};
	Cnds.prototype.onInit = function () {
		return true;
	};
	Cnds.prototype.onError = function (data) {
		return true;
	};
	Cnds.prototype.onResumeGame = function (data) {
		return true;
	};
	Cnds.prototype.onPauseGame = function (data) {
		return true;
	};
	pluginProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.ShowBanner = function (key) {
		if (!isSupported) return;
		if (typeof (gdApi.showBanner) === "undefined") {
			cr.logexport("Vooxe Googleads Plugin is not initiliazed or AdBlocker");
			this.vooxe["onResumeGame"]();
			return;
		}
		gdApi.showBanner("{_key:" + key + "}");
		cr.logexport("ShowBanner Key: " + key);
		this.isShowingBannerAd = true;
	};
	Acts.prototype.PlayLog = function () {
		if (!isSupported) return;
		if (typeof (gdApi.play) === "undefined") {
			cr.logexport("Vooxe Googleads Plugin is not initiliazed.");
			this.vooxe["onResumeGame"]();
			return;
		}
		gdApi.play();
	};
	Acts.prototype.CustomLog = function (key) {
		if (!isSupported) return;
		if (typeof (gdApi.customLog) === "undefined") {
			cr.logexport("Vooxe Googleads Plugin is not initiliazed.");
			this.vooxe["onResumeGame"]();
			return;
		}
		gdApi.customLog(key)
	};
	Acts.prototype.InitAds = function () {
		if (!isSupported) return;
		this.vooxe["InitAds"]();
	};
	pluginProto.acts = new Acts();

	function Exps() {
	};
	pluginProto.exps = new Exps();
}());
;
;
cr.behaviors.Bullet = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var behaviorProto = cr.behaviors.Bullet.prototype;
	behaviorProto.Type = function (behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function () {
	};
	behaviorProto.Instance = function (type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function () {
		var speed = this.properties[0];
		this.acc = this.properties[1];
		this.g = this.properties[2];
		this.bounceOffSolid = (this.properties[3] !== 0);
		this.setAngle = (this.properties[4] !== 0);
		this.dx = Math.cos(this.inst.angle) * speed;
		this.dy = Math.sin(this.inst.angle) * speed;
		this.lastx = this.inst.x;
		this.lasty = this.inst.y;
		this.lastKnownAngle = this.inst.angle;
		this.travelled = 0;
		this.enabled = (this.properties[5] !== 0);
	};
	behinstProto.saveToJSON = function () {
		return {
			"acc": this.acc,
			"g": this.g,
			"dx": this.dx,
			"dy": this.dy,
			"lx": this.lastx,
			"ly": this.lasty,
			"lka": this.lastKnownAngle,
			"t": this.travelled,
			"e": this.enabled
		};
	};
	behinstProto.loadFromJSON = function (o) {
		this.acc = o["acc"];
		this.g = o["g"];
		this.dx = o["dx"];
		this.dy = o["dy"];
		this.lastx = o["lx"];
		this.lasty = o["ly"];
		this.lastKnownAngle = o["lka"];
		this.travelled = o["t"];
		this.enabled = o["e"];
	};
	behinstProto.tick = function () {
		if (!this.enabled)
			return;
		var dt = this.runtime.getDt(this.inst);
		var s, a;
		var bounceSolid, bounceAngle;
		if (this.inst.angle !== this.lastKnownAngle) {
			if (this.setAngle) {
				s = cr.distanceTo(0, 0, this.dx, this.dy);
				this.dx = Math.cos(this.inst.angle) * s;
				this.dy = Math.sin(this.inst.angle) * s;
			}
			this.lastKnownAngle = this.inst.angle;
		}
		if (this.acc !== 0) {
			s = cr.distanceTo(0, 0, this.dx, this.dy);
			if (this.dx === 0 && this.dy === 0)
				a = this.inst.angle;
			else
				a = cr.angleTo(0, 0, this.dx, this.dy);
			s += this.acc * dt;
			if (s < 0)
				s = 0;
			this.dx = Math.cos(a) * s;
			this.dy = Math.sin(a) * s;
		}
		if (this.g !== 0)
			this.dy += this.g * dt;
		this.lastx = this.inst.x;
		this.lasty = this.inst.y;
		if (this.dx !== 0 || this.dy !== 0) {
			this.inst.x += this.dx * dt;
			this.inst.y += this.dy * dt;
			this.travelled += cr.distanceTo(0, 0, this.dx * dt, this.dy * dt)
			if (this.setAngle) {
				this.inst.angle = cr.angleTo(0, 0, this.dx, this.dy);
				this.inst.set_bbox_changed();
				this.lastKnownAngle = this.inst.angle;
			}
			this.inst.set_bbox_changed();
			if (this.bounceOffSolid) {
				bounceSolid = this.runtime.testOverlapSolid(this.inst);
				if (bounceSolid) {
					this.runtime.registerCollision(this.inst, bounceSolid);
					s = cr.distanceTo(0, 0, this.dx, this.dy);
					bounceAngle = this.runtime.calculateSolidBounceAngle(this.inst, this.lastx, this.lasty);
					this.dx = Math.cos(bounceAngle) * s;
					this.dy = Math.sin(bounceAngle) * s;
					this.inst.x += this.dx * dt;			// move out for one tick since the object can't have spent a tick in the solid
					this.inst.y += this.dy * dt;
					this.inst.set_bbox_changed();
					if (this.setAngle) {
						this.inst.angle = bounceAngle;
						this.lastKnownAngle = bounceAngle;
						this.inst.set_bbox_changed();
					}
					if (!this.runtime.pushOutSolid(this.inst, this.dx / s, this.dy / s, Math.max(s * 2.5 * dt, 30)))
						this.runtime.pushOutSolidNearest(this.inst, 100);
				}
			}
		}
	};

	function Cnds() {
	};
	Cnds.prototype.CompareSpeed = function (cmp, s) {
		return cr.do_cmp(cr.distanceTo(0, 0, this.dx, this.dy), cmp, s);
	};
	Cnds.prototype.CompareTravelled = function (cmp, d) {
		return cr.do_cmp(this.travelled, cmp, d);
	};
	behaviorProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.SetSpeed = function (s) {
		var a = cr.angleTo(0, 0, this.dx, this.dy);
		this.dx = Math.cos(a) * s;
		this.dy = Math.sin(a) * s;
	};
	Acts.prototype.SetAcceleration = function (a) {
		this.acc = a;
	};
	Acts.prototype.SetGravity = function (g) {
		this.g = g;
	};
	Acts.prototype.SetAngleOfMotion = function (a) {
		a = cr.to_radians(a);
		var s = cr.distanceTo(0, 0, this.dx, this.dy)
		this.dx = Math.cos(a) * s;
		this.dy = Math.sin(a) * s;
	};
	Acts.prototype.Bounce = function (objtype) {
		if (!objtype)
			return;
		var otherinst = objtype.getFirstPicked(this.inst);
		if (!otherinst)
			return;
		var dt = this.runtime.getDt(this.inst);
		var s = cr.distanceTo(0, 0, this.dx, this.dy);
		var bounceAngle = this.runtime.calculateSolidBounceAngle(this.inst, this.lastx, this.lasty, otherinst);
		this.dx = Math.cos(bounceAngle) * s;
		this.dy = Math.sin(bounceAngle) * s;
		this.inst.x += this.dx * dt;			// move out for one tick since the object can't have spent a tick in the solid
		this.inst.y += this.dy * dt;
		this.inst.set_bbox_changed();
		if (this.setAngle) {
			this.inst.angle = bounceAngle;
			this.lastKnownAngle = bounceAngle;
			this.inst.set_bbox_changed();
		}
		if (this.bounceOffSolid) {
			if (!this.runtime.pushOutSolid(this.inst, this.dx / s, this.dy / s, Math.max(s * 2.5 * dt, 30)))
				this.runtime.pushOutSolidNearest(this.inst, 100);
		}
		else if (s !== 0) {
			this.runtime.pushOut(this.inst, this.dx / s, this.dy / s, Math.max(s * 2.5 * dt, 30), otherinst)
		}
	};
	Acts.prototype.SetDistanceTravelled = function (d) {
		this.travelled = d;
	};
	Acts.prototype.SetEnabled = function (en) {
		this.enabled = (en === 1);
	};
	behaviorProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.Speed = function (ret) {
		var s = cr.distanceTo(0, 0, this.dx, this.dy);
		s = cr.round6dp(s);
		ret.set_float(s);
	};
	Exps.prototype.Acceleration = function (ret) {
		ret.set_float(this.acc);
	};
	Exps.prototype.AngleOfMotion = function (ret) {
		ret.set_float(cr.to_degrees(cr.angleTo(0, 0, this.dx, this.dy)));
	};
	Exps.prototype.DistanceTravelled = function (ret) {
		ret.set_float(this.travelled);
	};
	Exps.prototype.Gravity = function (ret) {
		ret.set_float(this.g);
	};
	behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.Fade = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var behaviorProto = cr.behaviors.Fade.prototype;
	behaviorProto.Type = function (behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function () {
	};
	behaviorProto.Instance = function (type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function () {
		this.activeAtStart = this.properties[0] === 1;
		this.setMaxOpacity = false;					// used to retrieve maxOpacity once in first 'Start fade' action if initially inactive
		this.fadeInTime = this.properties[1];
		this.waitTime = this.properties[2];
		this.fadeOutTime = this.properties[3];
		this.destroy = this.properties[4];			// 0 = no, 1 = after fade out
		this.stage = this.activeAtStart ? 0 : 3;		// 0 = fade in, 1 = wait, 2 = fade out, 3 = done
		if (this.recycled)
			this.stageTime.reset();
		else
			this.stageTime = new cr.KahanAdder();
		this.maxOpacity = (this.inst.opacity ? this.inst.opacity : 1.0);
		if (this.activeAtStart) {
			if (this.fadeInTime === 0) {
				this.stage = 1;
				if (this.waitTime === 0)
					this.stage = 2;
			}
			else {
				this.inst.opacity = 0;
				this.runtime.redraw = true;
			}
		}
	};
	behinstProto.saveToJSON = function () {
		return {
			"fit": this.fadeInTime,
			"wt": this.waitTime,
			"fot": this.fadeOutTime,
			"s": this.stage,
			"st": this.stageTime.sum,
			"mo": this.maxOpacity,
		};
	};
	behinstProto.loadFromJSON = function (o) {
		this.fadeInTime = o["fit"];
		this.waitTime = o["wt"];
		this.fadeOutTime = o["fot"];
		this.stage = o["s"];
		this.stageTime.reset();
		this.stageTime.sum = o["st"];
		this.maxOpacity = o["mo"];
	};
	behinstProto.tick = function () {
		this.stageTime.add(this.runtime.getDt(this.inst));
		if (this.stage === 0) {
			this.inst.opacity = (this.stageTime.sum / this.fadeInTime) * this.maxOpacity;
			this.runtime.redraw = true;
			if (this.inst.opacity >= this.maxOpacity) {
				this.inst.opacity = this.maxOpacity;
				this.stage = 1;	// wait stage
				this.stageTime.reset();
				this.runtime.trigger(cr.behaviors.Fade.prototype.cnds.OnFadeInEnd, this.inst);
			}
		}
		if (this.stage === 1) {
			if (this.stageTime.sum >= this.waitTime) {
				this.stage = 2;	// fade out stage
				this.stageTime.reset();
				this.runtime.trigger(cr.behaviors.Fade.prototype.cnds.OnWaitEnd, this.inst);
			}
		}
		if (this.stage === 2) {
			if (this.fadeOutTime !== 0) {
				this.inst.opacity = this.maxOpacity - ((this.stageTime.sum / this.fadeOutTime) * this.maxOpacity);
				this.runtime.redraw = true;
				if (this.inst.opacity < 0) {
					this.inst.opacity = 0;
					this.stage = 3;	// done
					this.stageTime.reset();
					this.runtime.trigger(cr.behaviors.Fade.prototype.cnds.OnFadeOutEnd, this.inst);
					if (this.destroy === 1)
						this.runtime.DestroyInstance(this.inst);
				}
			}
		}
	};
	behinstProto.doStart = function () {
		this.stage = 0;
		this.stageTime.reset();
		if (this.fadeInTime === 0) {
			this.stage = 1;
			if (this.waitTime === 0)
				this.stage = 2;
		}
		else {
			this.inst.opacity = 0;
			this.runtime.redraw = true;
		}
	};

	function Cnds() {
	};
	Cnds.prototype.OnFadeOutEnd = function () {
		return true;
	};
	Cnds.prototype.OnFadeInEnd = function () {
		return true;
	};
	Cnds.prototype.OnWaitEnd = function () {
		return true;
	};
	behaviorProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.StartFade = function () {
		if (!this.activeAtStart && !this.setMaxOpacity) {
			this.maxOpacity = (this.inst.opacity ? this.inst.opacity : 1.0);
			this.setMaxOpacity = true;
		}
		if (this.stage === 3)
			this.doStart();
	};
	Acts.prototype.RestartFade = function () {
		this.doStart();
	};
	Acts.prototype.SetFadeInTime = function (t) {
		if (t < 0)
			t = 0;
		this.fadeInTime = t;
	};
	Acts.prototype.SetWaitTime = function (t) {
		if (t < 0)
			t = 0;
		this.waitTime = t;
	};
	Acts.prototype.SetFadeOutTime = function (t) {
		if (t < 0)
			t = 0;
		this.fadeOutTime = t;
	};
	behaviorProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.FadeInTime = function (ret) {
		ret.set_float(this.fadeInTime);
	};
	Exps.prototype.WaitTime = function (ret) {
		ret.set_float(this.waitTime);
	};
	Exps.prototype.FadeOutTime = function (ret) {
		ret.set_float(this.fadeOutTime);
	};
	behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.LOS = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var behaviorProto = cr.behaviors.LOS.prototype;
	behaviorProto.Type = function (behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function () {
		this.obstacleTypes = [];						// object types to check for as obstructions
	};
	behtypeProto.findLosBehavior = function (inst) {
		var i, len, b;
		for (i = 0, len = inst.behavior_insts.length; i < len; ++i) {
			b = inst.behavior_insts[i];
			if (b instanceof cr.behaviors.LOS.prototype.Instance && b.type === this)
				return b;
		}
		return null;
	};
	behaviorProto.Instance = function (type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function () {
		this.obstacleMode = this.properties[0];		// 0 = solids, 1 = custom
		this.range = this.properties[1];
		this.cone = cr.to_radians(this.properties[2]);
		this.useCollisionCells = (this.properties[3] !== 0);
	};
	behinstProto.onDestroy = function () {
	};
	behinstProto.saveToJSON = function () {
		var o = {
			"r": this.range,
			"c": this.cone,
			"t": []
		};
		var i, len;
		for (i = 0, len = this.type.obstacleTypes.length; i < len; i++) {
			o["t"].push(this.type.obstacleTypes[i].sid);
		}
		return o;
	};
	behinstProto.loadFromJSON = function (o) {
		this.range = o["r"];
		this.cone = o["c"];
		cr.clearArray(this.type.obstacleTypes);
		var i, len, t;
		for (i = 0, len = o["t"].length; i < len; i++) {
			t = this.runtime.getObjectTypeBySid(o["t"][i]);
			if (t)
				this.type.obstacleTypes.push(t);
		}
	};
	behinstProto.tick = function () {
	};
	var candidates = [];
	var tmpRect = new cr.rect(0, 0, 0, 0);
	behinstProto.hasLOSto = function (x_, y_) {
		var startx = this.inst.x;
		var starty = this.inst.y;
		var myangle = this.inst.angle;
		if (this.inst.width < 0)
			myangle += Math.PI;
		if (cr.distanceTo(startx, starty, x_, y_) > this.range)
			return false;		// too far away
		var a = cr.angleTo(startx, starty, x_, y_);
		if (cr.angleDiff(myangle, a) > this.cone / 2)
			return false;		// outside cone of view
		var i, leni, rinst, solid;
		tmpRect.set(startx, starty, x_, y_);
		tmpRect.normalize();
		if (this.obstacleMode === 0) {
			if (this.useCollisionCells) {
				this.runtime.getSolidCollisionCandidates(this.inst.layer, tmpRect, candidates);
			}
			else {
				solid = this.runtime.getSolidBehavior();
				if (solid)
					cr.appendArray(candidates, solid.my_instances.valuesRef());
			}
			for (i = 0, leni = candidates.length; i < leni; ++i) {
				rinst = candidates[i];
				if (!rinst.extra["solidEnabled"] || rinst === this.inst)
					continue;
				if (this.runtime.testSegmentOverlap(startx, starty, x_, y_, rinst)) {
					cr.clearArray(candidates);
					return false;
				}
			}
		}
		else {
			if (this.useCollisionCells) {
				this.runtime.getTypesCollisionCandidates(this.inst.layer, this.type.obstacleTypes, tmpRect, candidates);
			}
			else {
				for (i = 0, leni = this.type.obstacleTypes.length; i < leni; ++i) {
					cr.appendArray(candidates, this.type.obstacleTypes[i].instances);
				}
			}
			for (i = 0, leni = candidates.length; i < leni; ++i) {
				rinst = candidates[i];
				if (rinst === this.inst)
					continue;
				if (this.runtime.testSegmentOverlap(startx, starty, x_, y_, rinst)) {
					cr.clearArray(candidates);
					return false;
				}
			}
		}
		cr.clearArray(candidates);
		return true;
	};

	function Cnds() {
	};
	var ltopick = new cr.ObjectSet();
	var rtopick = new cr.ObjectSet();
	Cnds.prototype.HasLOSToObject = function (obj_) {
		if (!obj_)
			return false;
		var i, j, leni, lenj, linst, losbeh, rinst, pick;
		var lsol = this.runtime.getCurrentConditionObjectType().getCurrentSol();
		var rsol = obj_.getCurrentSol();
		var linstances = lsol.getObjects();
		var rinstances = rsol.getObjects();
		if (lsol.select_all)
			cr.clearArray(lsol.else_instances);
		if (rsol.select_all)
			cr.clearArray(rsol.else_instances);
		var inverted = this.runtime.getCurrentCondition().inverted;
		for (i = 0, leni = linstances.length; i < leni; ++i) {
			linst = linstances[i];
			pick = false;
			losbeh = this.findLosBehavior(linst);
			;
			for (j = 0, lenj = rinstances.length; j < lenj; ++j) {
				rinst = rinstances[j];
				if (linst !== rinst && cr.xor(losbeh.hasLOSto(rinst.x, rinst.y), inverted)) {
					pick = true;
					rtopick.add(rinst);
				}
			}
			if (pick)
				ltopick.add(linst);
		}
		var lpicks = ltopick.valuesRef();
		var rpicks = rtopick.valuesRef();
		lsol.select_all = false;
		rsol.select_all = false;
		cr.shallowAssignArray(lsol.instances, lpicks);
		cr.shallowAssignArray(rsol.instances, rpicks);
		ltopick.clear();
		rtopick.clear();
		return lsol.hasObjects();
	};
	Cnds.prototype.HasLOSToPosition = function (x_, y_) {
		return this.hasLOSto(x_, y_);
	};
	behaviorProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.SetRange = function (r) {
		this.range = r;
	};
	Acts.prototype.SetCone = function (c) {
		this.cone = cr.to_radians(c);
	};
	Acts.prototype.AddObstacle = function (obj_) {
		var obstacleTypes = this.type.obstacleTypes;
		if (obstacleTypes.indexOf(obj_) !== -1)
			return;
		var i, len, t;
		for (i = 0, len = obstacleTypes.length; i < len; i++) {
			t = obstacleTypes[i];
			if (t.is_family && t.members.indexOf(obj_) !== -1)
				return;
		}
		obstacleTypes.push(obj_);
	};
	Acts.prototype.ClearObstacles = function () {
		cr.clearArray(this.type.obstacleTypes);
	};
	behaviorProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.Range = function (ret) {
		ret.set_float(this.range);
	};
	Exps.prototype.ConeOfView = function (ret) {
		ret.set_float(cr.to_degrees(this.cone));
	};
	behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.Pin = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var behaviorProto = cr.behaviors.Pin.prototype;
	behaviorProto.Type = function (behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function () {
	};
	behaviorProto.Instance = function (type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function () {
		this.pinObject = null;
		this.pinObjectUid = -1;		// for loading
		this.pinAngle = 0;
		this.pinDist = 0;
		this.myStartAngle = 0;
		this.theirStartAngle = 0;
		this.lastKnownAngle = 0;
		this.mode = 0;				// 0 = position & angle; 1 = position; 2 = angle; 3 = rope; 4 = bar
		var self = this;
		if (!this.recycled) {
			this.myDestroyCallback = (function (inst) {
				self.onInstanceDestroyed(inst);
			});
		}
		this.runtime.addDestroyCallback(this.myDestroyCallback);
	};
	behinstProto.saveToJSON = function () {
		return {
			"uid": this.pinObject ? this.pinObject.uid : -1,
			"pa": this.pinAngle,
			"pd": this.pinDist,
			"msa": this.myStartAngle,
			"tsa": this.theirStartAngle,
			"lka": this.lastKnownAngle,
			"m": this.mode
		};
	};
	behinstProto.loadFromJSON = function (o) {
		this.pinObjectUid = o["uid"];		// wait until afterLoad to look up
		this.pinAngle = o["pa"];
		this.pinDist = o["pd"];
		this.myStartAngle = o["msa"];
		this.theirStartAngle = o["tsa"];
		this.lastKnownAngle = o["lka"];
		this.mode = o["m"];
	};
	behinstProto.afterLoad = function () {
		if (this.pinObjectUid === -1)
			this.pinObject = null;
		else {
			this.pinObject = this.runtime.getObjectByUID(this.pinObjectUid);
			;
		}
		this.pinObjectUid = -1;
	};
	behinstProto.onInstanceDestroyed = function (inst) {
		if (this.pinObject == inst)
			this.pinObject = null;
	};
	behinstProto.onDestroy = function () {
		this.pinObject = null;
		this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};
	behinstProto.tick = function () {
	};
	behinstProto.tick2 = function () {
		if (!this.pinObject)
			return;
		if (this.lastKnownAngle !== this.inst.angle)
			this.myStartAngle = cr.clamp_angle(this.myStartAngle + (this.inst.angle - this.lastKnownAngle));
		var newx = this.inst.x;
		var newy = this.inst.y;
		if (this.mode === 3 || this.mode === 4)		// rope mode or bar mode
		{
			var dist = cr.distanceTo(this.inst.x, this.inst.y, this.pinObject.x, this.pinObject.y);
			if ((dist > this.pinDist) || (this.mode === 4 && dist < this.pinDist)) {
				var a = cr.angleTo(this.pinObject.x, this.pinObject.y, this.inst.x, this.inst.y);
				newx = this.pinObject.x + Math.cos(a) * this.pinDist;
				newy = this.pinObject.y + Math.sin(a) * this.pinDist;
			}
		}
		else {
			newx = this.pinObject.x + Math.cos(this.pinObject.angle + this.pinAngle) * this.pinDist;
			newy = this.pinObject.y + Math.sin(this.pinObject.angle + this.pinAngle) * this.pinDist;
		}
		var newangle = cr.clamp_angle(this.myStartAngle + (this.pinObject.angle - this.theirStartAngle));
		this.lastKnownAngle = newangle;
		if ((this.mode === 0 || this.mode === 1 || this.mode === 3 || this.mode === 4)
			&& (this.inst.x !== newx || this.inst.y !== newy)) {
			this.inst.x = newx;
			this.inst.y = newy;
			this.inst.set_bbox_changed();
		}
		if ((this.mode === 0 || this.mode === 2) && (this.inst.angle !== newangle)) {
			this.inst.angle = newangle;
			this.inst.set_bbox_changed();
		}
	};

	function Cnds() {
	};
	Cnds.prototype.IsPinned = function () {
		return !!this.pinObject;
	};
	behaviorProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.Pin = function (obj, mode_) {
		if (!obj)
			return;
		var otherinst = obj.getFirstPicked(this.inst);
		if (!otherinst)
			return;
		this.pinObject = otherinst;
		this.pinAngle = cr.angleTo(otherinst.x, otherinst.y, this.inst.x, this.inst.y) - otherinst.angle;
		this.pinDist = cr.distanceTo(otherinst.x, otherinst.y, this.inst.x, this.inst.y);
		this.myStartAngle = this.inst.angle;
		this.lastKnownAngle = this.inst.angle;
		this.theirStartAngle = otherinst.angle;
		this.mode = mode_;
	};
	Acts.prototype.Unpin = function () {
		this.pinObject = null;
	};
	behaviorProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.PinnedUID = function (ret) {
		ret.set_int(this.pinObject ? this.pinObject.uid : -1);
	};
	behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.Rex_MoveTo = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var behaviorProto = cr.behaviors.Rex_MoveTo.prototype;
	behaviorProto.Type = function (behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function () {
	};
	behaviorProto.Instance = function (type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function () {
		this.enabled = (this.properties[0] === 1);
		if (!this.recycled) {
			this.moveParams = {};
		}
		this.moveParams["max"] = this.properties[1];
		this.moveParams["acc"] = this.properties[2];
		this.moveParams["dec"] = this.properties[3];
		this.soildStopEnable = (this.properties[4] === 1);
		this.isContinueMode = (this.properties[5] === 1);
		if (!this.recycled) {
			this.target = {"x": 0, "y": 0, "a": 0};
		}
		this.isMoving = false;
		this.currentSpeed = 0;
		this.remainDistance = 0;
		this.remainDt = 0;
		if (!this.recycled) {
			this.prePosition = {"x": 0, "y": 0};
		}
		this.prePosition["x"] = 0;
		this.prePosition["y"] = 0;
		this.movingAngleData = newPointData(this.movingAngleData);
		this.movingAngleStartData = newPointData(this.movingAngleStartData);
		this.lastTick = null;
		this.isMyCall = false;
	};
	var newPointData = function (point) {
		if (point == null)
			point = {};
		point["x"] = 0;
		point["y"] = 0;
		point["a"] = -1;
		return point;
	};
	behinstProto.tick = function () {
		this.remainDt = 0;
		if ((!this.enabled) || (!this.isMoving))
			return;
		var dt = this.runtime.getDt(this.inst);
		this.move(dt);
	};
	behinstProto.move = function (dt) {
		if (dt == 0)   // can not move if dt == 0
			return;
		if ((this.prePosition["x"] !== this.inst.x) || (this.prePosition["y"] !== this.inst.y))
			this.resetCurrentPosition();    // reset this.remainDistance
		var isSlowDown = false;
		if (this.moveParams["dec"] != 0) {
			var d = (this.currentSpeed * this.currentSpeed) / (2 * this.moveParams["dec"]); // (v*v)/(2*a)
			isSlowDown = (d >= this.remainDistance);
		}
		var acc = (isSlowDown) ? (-this.moveParams["dec"]) : this.moveParams["acc"];
		if (acc != 0) {
			this.setCurrentSpeed(this.currentSpeed + (acc * dt));
		}
		var distance = this.currentSpeed * dt;
		this.remainDistance -= distance;
		var isHitTarget = false;
		var angle = this.target["a"];
		var ux = Math.cos(angle);
		var uy = Math.sin(angle);
		if ((this.remainDistance <= 0) || (this.currentSpeed <= 0)) {
			isHitTarget = true;
			this.inst.x = this.target["x"];
			this.inst.y = this.target["y"];
			if (this.currentSpeed > 0)
				this.remainDt = (-this.remainDistance) / this.currentSpeed;
			this.getMovingAngle();
			this.setCurrentSpeed(0);
		}
		else {
			var angle = this.target["a"];
			this.inst.x += (distance * ux);
			this.inst.y += (distance * uy);
		}
		this.inst.set_bbox_changed();
		var isSolidStop = false;
		if (this.soildStopEnable) {
			var collobj = this.runtime.testOverlapSolid(this.inst);
			if (collobj) {
				this.runtime.registerCollision(this.inst, collobj);
				this.runtime.pushOutSolid(this.inst, -ux, -uy, Math.max(distance, 50));
				isSolidStop = true;
			}
		}
		this.prePosition["x"] = this.inst.x;
		this.prePosition["y"] = this.inst.y;
		if (isSolidStop) {
			this.isMoving = false;  // stop
			this.isMyCall = true;
			this.runtime.trigger(cr.behaviors.Rex_MoveTo.prototype.cnds.OnSolidStop, this.inst);
			this.isMyCall = false;
		}
		else if (isHitTarget) {
			this.isMoving = false;  // stop
			this.isMyCall = true;
			this.runtime.trigger(cr.behaviors.Rex_MoveTo.prototype.cnds.OnHitTarget, this.inst);
			this.isMyCall = false;
		}
	};
	behinstProto.tick2 = function () {
		this.movingAngleData["x"] = this.inst.x;
		this.movingAngleData["y"] = this.inst.y;
	};
	behinstProto.setCurrentSpeed = function (speed) {
		if (speed != null) {
			this.currentSpeed = (speed > this.moveParams["max"]) ?
				this.moveParams["max"] : speed;
		}
		else if (this.moveParams["acc"] == 0) {
			this.currentSpeed = this.moveParams["max"];
		}
	};
	behinstProto.resetCurrentPosition = function () {
		var dx = this.target["x"] - this.inst.x;
		var dy = this.target["y"] - this.inst.y;
		this.target["a"] = Math.atan2(dy, dx);
		this.remainDistance = Math.sqrt((dx * dx) + (dy * dy));
		this.prePosition["x"] = this.inst.x;
		this.prePosition["y"] = this.inst.y;
	};
	behinstProto.setTargetPos = function (_x, _y) {
		this.target["x"] = _x;
		this.target["y"] = _y;
		this.setCurrentSpeed(null);
		this.resetCurrentPosition();
		this.movingAngleData["x"] = this.inst.x;
		this.movingAngleData["y"] = this.inst.y;
		this.isMoving = true;
		this.movingAngleStartData["x"] = this.inst.x;
		this.movingAngleStartData["y"] = this.inst.y;
		this.movingAngleStartData["a"] = cr.to_clamped_degrees(cr.angleTo(this.inst.x, this.inst.y, _x, _y));
		if (this.isContinueMode)
			this.move(this.remainDt);
	};
	behinstProto.isTickChanged = function () {
		var curTick = this.runtime.tickcount;
		var tickChanged = (this.lastTick != curTick);
		this.lastTick = curTick;
		return tickChanged;
	};
	behinstProto.getMovingAngle = function (ret) {
		if (this.isTickChanged()) {
			var dx = this.inst.x - this.movingAngleData["x"];
			var dy = this.inst.y - this.movingAngleData["y"];
			if ((dx != 0) || (dy != 0))
				this.movingAngleData["a"] = cr.to_clamped_degrees(Math.atan2(dy, dx));
		}
		return this.movingAngleData["a"];
	};

	function clone(obj) {
		if (null == obj || "object" != typeof obj)
			return obj;
		var result = obj.constructor();
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr))
				result[attr] = obj[attr];
		}
		return result;
	};
	behinstProto.saveToJSON = function () {
		return {
			"en": this.enabled,
			"v": clone(this.moveParams),
			"t": clone(this.target),
			"is_m": this.isMoving,
			"c_spd": this.currentSpeed,
			"rd": this.remainDistance,
			"pp": clone(this.prePosition),
			"ma": clone(this.movingAngleData),
			"ms": clone(this.movingAngleStartData),
			"lt": this.lastTick,
		};
	};
	behinstProto.loadFromJSON = function (o) {
		this.enabled = o["en"];
		this.moveParams = o["v"];
		this.target = o["t"];
		this.isMoving = o["is_m"];
		this.currentSpeed = o["c_spd"];
		this.remainDistance = o["rd"];
		this.prePosition = o["pp"];
		this.movingAngleData = o["ma"];
		this.movingAngleStartData = o["ms"];
		this.lastTick = o["lt"];
	};

	function Cnds() {
	};
	behaviorProto.cnds = new Cnds();
	Cnds.prototype.OnHitTarget = function () {
		return (this.isMyCall);
	};
	Cnds.prototype.CompareSpeed = function (cmp, s) {
		return cr.do_cmp(this.currentSpeed, cmp, s);
	};
	Cnds.prototype.OnMoving = function ()  // deprecated
	{
		return false;
	};
	Cnds.prototype.IsMoving = function () {
		return (this.enabled && this.isMoving);
	};
	Cnds.prototype.CompareMovingAngle = function (cmp, s) {
		var angle = this.getMovingAngle();
		if (angle != (-1))
			return cr.do_cmp(this.getMovingAngle(), cmp, s);
		else
			return false;
	};
	Cnds.prototype.OnSolidStop = function () {
		return this.isMyCall;
	};

	function Acts() {
	};
	behaviorProto.acts = new Acts();
	Acts.prototype.SetEnabled = function (en) {
		this.enabled = (en === 1);
	};
	Acts.prototype.SetMaxSpeed = function (s) {
		this.moveParams["max"] = s;
		this.setCurrentSpeed(null);
	};
	Acts.prototype.SetAcceleration = function (a) {
		this.moveParams["acc"] = a;
		this.setCurrentSpeed(null);
	};
	Acts.prototype.SetDeceleration = function (a) {
		this.moveParams["dec"] = a;
	};
	Acts.prototype.SetTargetPos = function (x, y) {
		this.setTargetPos(x, y)
	};
	Acts.prototype.SetCurrentSpeed = function (s) {
		this.setCurrentSpeed(s);
	};
	Acts.prototype.SetTargetPosOnObject = function (objtype) {
		if (!objtype)
			return;
		var inst = objtype.getFirstPicked();
		if (inst != null)
			this.setTargetPos(inst.x, inst.y);
	};
	Acts.prototype.SetTargetPosByDeltaXY = function (dx, dy) {
		this.setTargetPos(this.inst.x + dx, this.inst.y + dy);
	};
	Acts.prototype.SetTargetPosByDistanceAngle = function (distance, angle) {
		var a = cr.to_clamped_radians(angle);
		var dx = distance * Math.cos(a);
		var dy = distance * Math.sin(a);
		this.setTargetPos(this.inst.x + dx, this.inst.y + dy);
	};
	Acts.prototype.Stop = function () {
		this.isMoving = false;
	};
	Acts.prototype.SetTargetPosOnUID = function (uid) {
		var inst = this.runtime.getObjectByUID(uid);
		if (inst != null)
			this.setTargetPos(inst.x, inst.y);
	};
	Acts.prototype.SetStopBySolid = function (en) {
		this.soildStopEnable = (en === 1);
	};

	function Exps() {
	};
	behaviorProto.exps = new Exps();
	Exps.prototype.Activated = function (ret) {
		ret.set_int((this.enabled) ? 1 : 0);
	};
	Exps.prototype.Speed = function (ret) {
		ret.set_float(this.currentSpeed);
	};
	Exps.prototype.MaxSpeed = function (ret) {
		ret.set_float(this.moveParams["max"]);
	};
	Exps.prototype.Acc = function (ret) {
		ret.set_float(this.moveParams["acc"]);
	};
	Exps.prototype.Dec = function (ret) {
		ret.set_float(this.moveParams["dec"]);
	};
	Exps.prototype.TargetX = function (ret) {
		ret.set_float(this.target["x"]);
	};
	Exps.prototype.TargetY = function (ret) {
		ret.set_float(this.target["y"]);
	};
	Exps.prototype.MovingAngle = function (ret) {
		ret.set_float(this.getMovingAngle());
	};
	Exps.prototype.MovingAngleStart = function (ret) {
		ret.set_float(this.movingAngleStartData["a"]);
	};
}());
cr.behaviors.Rex_RotateTo = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var behaviorProto = cr.behaviors.Rex_RotateTo.prototype;
	behaviorProto.Type = function (behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function () {
	};
	behaviorProto.Instance = function (type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function () {
		this.activated = (this.properties[0] == 1);
		this.move = {
			"max": this.properties[1],
			"acc": this.properties[2],
			"dec": this.properties[3]
		};
		this.target = {"a": 0, "cw": true};
		this.is_rotating = false;
		this.current_speed = 0;
		this.remain_distance = 0;
		this.is_my_call = false;
	};
	behinstProto.tick = function () {
		if ((!this.activated) || (!this.is_rotating)) {
			return;
		}
		var dt = this.runtime.getDt(this.inst);
		if (dt == 0)   // can not move if dt == 0
			return;
		var is_slow_down = false;
		if (this.move["dec"] != 0) {
			var _speed = this.current_speed;
			var _distance = (_speed * _speed) / (2 * this.move["dec"]); // (v*v)/(2*a)
			is_slow_down = (_distance >= this.remain_distance);
		}
		var acc = (is_slow_down) ? (-this.move["dec"]) : this.move["acc"];
		if (acc != 0) {
			this.SetCurrentSpeed(this.current_speed + (acc * dt));
		}
		var distance = this.current_speed * dt;
		this.remain_distance -= distance;
		var is_hit_target = false;
		if ((this.remain_distance <= 0) || (this.current_speed <= 0)) {
			this.is_rotating = false;
			this.inst.angle = cr.to_clamped_radians(this.target["a"]);
			this.SetCurrentSpeed(0);
			is_hit_target = true;
		}
		else {
			if (this.target["cw"])
				this.inst.angle += cr.to_clamped_radians(distance);
			else
				this.inst.angle -= cr.to_clamped_radians(distance);
		}
		this.inst.set_bbox_changed();
		if (is_hit_target) {
			this.is_my_call = true;
			this.runtime.trigger(cr.behaviors.Rex_RotateTo.prototype.cnds.OnHitTarget, this.inst);
			this.is_my_call = false;
		}
	};
	behinstProto.tick2 = function () {
	};
	behinstProto.SetCurrentSpeed = function (speed) {
		if (speed != null) {
			this.current_speed = (speed > this.move["max"]) ?
				this.move["max"] : speed;
		}
		else if (this.move["acc"] == 0) {
			this.current_speed = this.move["max"];
		}
	};
	behinstProto.SetTargetAngle = function (target_angle_radians, clockwise_mode)  // in radians
	{
		this.is_rotating = true;
		var cur_angle_radians = this.inst.angle;
		this.target["cw"] = (clockwise_mode == 2) ? cr.angleClockwise(target_angle_radians, cur_angle_radians) :
			(clockwise_mode == 1);
		var remain_distance = (clockwise_mode == 2) ? cr.angleDiff(cur_angle_radians, target_angle_radians) :
			(clockwise_mode == 1) ? (target_angle_radians - cur_angle_radians) :
				(cur_angle_radians - target_angle_radians);
		this.remain_distance = cr.to_clamped_degrees(remain_distance);
		this.target["a"] = cr.to_clamped_degrees(target_angle_radians);
		this.SetCurrentSpeed(null);
	};
	behinstProto.saveToJSON = function () {
		return {
			"en": this.activated,
			"v": this.move,
			"t": this.target,
			"ir": this.is_rotating,
			"cs": this.current_speed,
			"rd": this.remain_distance
		};
	};
	behinstProto.loadFromJSON = function (o) {
		this.activated = o["en"];
		this.move = o["v"];
		this.target = o["t"];
		this.is_rotating = o["ir"];
		this.current_speed = o["cs"];
		this.remain_distance = o["rd"];
	};

	function Cnds() {
	};
	behaviorProto.cnds = new Cnds();
	Cnds.prototype.OnHitTarget = function () {
		return (this.is_my_call);
	};
	Cnds.prototype.CompareSpeed = function (cmp, s) {
		return cr.do_cmp(this.current_speed, cmp, s);
	};
	Cnds.prototype.OnMoving = function ()  // deprecated
	{
		return false;
	};
	Cnds.prototype.IsRotating = function () {
		return (this.activated && this.is_rotating);
	};

	function Acts() {
	};
	behaviorProto.acts = new Acts();
	Acts.prototype.SetActivated = function (s) {
		this.activated = (s == 1);
	};
	Acts.prototype.SetMaxSpeed = function (s) {
		this.move["max"] = s;
		this.SetCurrentSpeed(null);
	};
	Acts.prototype.SetAcceleration = function (a) {
		this.move["acc"] = a;
		this.SetCurrentSpeed(null);
	};
	Acts.prototype.SetDeceleration = function (a) {
		this.move["dec"] = a;
	};
	Acts.prototype.SetTargetAngle = function (angle, clockwise_mode) {
		this.SetTargetAngle(cr.to_clamped_radians(angle), clockwise_mode)
	};
	Acts.prototype.SetCurrentSpeed = function (s) {
		this.SetCurrentSpeed(s);
	};
	Acts.prototype.SetTargetAngleOnObject = function (objtype, clockwise_mode) {
		if (!objtype)
			return;
		var inst = objtype.getFirstPicked();
		if (inst != null) {
			var angle = Math.atan2(inst.y - this.inst.y, inst.x - this.inst.x);
			this.SetTargetAngle(angle, clockwise_mode);
		}
	};
	Acts.prototype.SetTargetAngleByDeltaAngle = function (dA, clockwise_mode) {
		var dA_rad = cr.to_clamped_radians(dA);
		if (clockwise_mode == 0)
			dA_rad = -dA_rad;
		var angle = this.inst.angle + dA_rad;
		this.SetTargetAngle(angle, clockwise_mode);
	};
	Acts.prototype.SetTargetAngleToPos = function (tx, ty, clockwise_mode) {
		var angle = Math.atan2(ty - this.inst.y, tx - this.inst.x);
		this.SetTargetAngle(angle, clockwise_mode);
	};
	Acts.prototype.Stop = function () {
		this.is_rotating = false;
	};

	function Exps() {
	};
	behaviorProto.exps = new Exps();
	Exps.prototype.Activated = function (ret) {
		ret.set_int((this.activated) ? 1 : 0);
	};
	Exps.prototype.Speed = function (ret) {
		ret.set_float(this.current_speed);
	};
	Exps.prototype.MaxSpeed = function (ret) {
		ret.set_float(this.move["max"]);
	};
	Exps.prototype.Acc = function (ret) {
		ret.set_float(this.move["acc"]);
	};
	Exps.prototype.Dec = function (ret) {
		ret.set_float(this.move["dec"]);
	};
	Exps.prototype.TargetAngle = function (ret) {
		var x = (this.is_rotating) ? this.target["a"] : 0;
		ret.set_float(x);
	};
}())

cr.behaviors.Sin = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var behaviorProto = cr.behaviors.Sin.prototype;
	behaviorProto.Type = function (behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function () {
	};
	behaviorProto.Instance = function (type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
		this.i = 0;		// period offset (radians)
	};
	var behinstProto = behaviorProto.Instance.prototype;
	var _2pi = 2 * Math.PI;
	var _pi_2 = Math.PI / 2;
	var _3pi_2 = (3 * Math.PI) / 2;
	behinstProto.onCreate = function () {
		this.active = (this.properties[0] === 1);
		this.movement = this.properties[1]; // 0=Horizontal|1=Vertical|2=Size|3=Width|4=Height|5=Angle|6=Opacity|7=Value only
		this.wave = this.properties[2];		// 0=Sine|1=Triangle|2=Sawtooth|3=Reverse sawtooth|4=Square
		this.period = this.properties[3];
		this.period += Math.random() * this.properties[4];								// period random
		if (this.period === 0)
			this.i = 0;
		else {
			this.i = (this.properties[5] / this.period) * _2pi;								// period offset
			this.i += ((Math.random() * this.properties[6]) / this.period) * _2pi;			// period offset random
		}
		this.mag = this.properties[7];													// magnitude
		this.mag += Math.random() * this.properties[8];									// magnitude random
		this.initialValue = 0;
		this.initialValue2 = 0;
		this.ratio = 0;
		this.init();
	};
	behinstProto.saveToJSON = function () {
		return {
			"i": this.i,
			"a": this.active,
			"mv": this.movement,
			"w": this.wave,
			"p": this.period,
			"mag": this.mag,
			"iv": this.initialValue,
			"iv2": this.initialValue2,
			"r": this.ratio,
			"lkv": this.lastKnownValue,
			"lkv2": this.lastKnownValue2
		};
	};
	behinstProto.loadFromJSON = function (o) {
		this.i = o["i"];
		this.active = o["a"];
		this.movement = o["mv"];
		this.wave = o["w"];
		this.period = o["p"];
		this.mag = o["mag"];
		this.initialValue = o["iv"];
		this.initialValue2 = o["iv2"] || 0;
		this.ratio = o["r"];
		this.lastKnownValue = o["lkv"];
		this.lastKnownValue2 = o["lkv2"] || 0;
	};
	behinstProto.init = function () {
		switch (this.movement) {
			case 0:		// horizontal
				this.initialValue = this.inst.x;
				break;
			case 1:		// vertical
				this.initialValue = this.inst.y;
				break;
			case 2:		// size
				this.initialValue = this.inst.width;
				this.ratio = this.inst.height / this.inst.width;
				break;
			case 3:		// width
				this.initialValue = this.inst.width;
				break;
			case 4:		// height
				this.initialValue = this.inst.height;
				break;
			case 5:		// angle
				this.initialValue = this.inst.angle;
				this.mag = cr.to_radians(this.mag);		// convert magnitude from degrees to radians
				break;
			case 6:		// opacity
				this.initialValue = this.inst.opacity;
				break;
			case 7:
				this.initialValue = 0;
				break;
			case 8:		// forwards/backwards
				this.initialValue = this.inst.x;
				this.initialValue2 = this.inst.y;
				break;
			default:
				;
		}
		this.lastKnownValue = this.initialValue;
		this.lastKnownValue2 = this.initialValue2;
	};
	behinstProto.waveFunc = function (x) {
		x = x % _2pi;
		switch (this.wave) {
			case 0:		// sine
				return Math.sin(x);
			case 1:		// triangle
				if (x <= _pi_2)
					return x / _pi_2;
				else if (x <= _3pi_2)
					return 1 - (2 * (x - _pi_2) / Math.PI);
				else
					return (x - _3pi_2) / _pi_2 - 1;
			case 2:		// sawtooth
				return 2 * x / _2pi - 1;
			case 3:		// reverse sawtooth
				return -2 * x / _2pi + 1;
			case 4:		// square
				return x < Math.PI ? -1 : 1;
		}
		;
		return 0;
	};
	behinstProto.tick = function () {
		var dt = this.runtime.getDt(this.inst);
		if (!this.active || dt === 0)
			return;
		if (this.period === 0)
			this.i = 0;
		else {
			this.i += (dt / this.period) * _2pi;
			this.i = this.i % _2pi;
		}
		this.updateFromPhase();
	};
	behinstProto.updateFromPhase = function () {
		switch (this.movement) {
			case 0:		// horizontal
				if (this.inst.x !== this.lastKnownValue)
					this.initialValue += this.inst.x - this.lastKnownValue;
				this.inst.x = this.initialValue + this.waveFunc(this.i) * this.mag;
				this.lastKnownValue = this.inst.x;
				break;
			case 1:		// vertical
				if (this.inst.y !== this.lastKnownValue)
					this.initialValue += this.inst.y - this.lastKnownValue;
				this.inst.y = this.initialValue + this.waveFunc(this.i) * this.mag;
				this.lastKnownValue = this.inst.y;
				break;
			case 2:		// size
				this.inst.width = this.initialValue + this.waveFunc(this.i) * this.mag;
				this.inst.height = this.inst.width * this.ratio;
				break;
			case 3:		// width
				this.inst.width = this.initialValue + this.waveFunc(this.i) * this.mag;
				break;
			case 4:		// height
				this.inst.height = this.initialValue + this.waveFunc(this.i) * this.mag;
				break;
			case 5:		// angle
				if (this.inst.angle !== this.lastKnownValue)
					this.initialValue = cr.clamp_angle(this.initialValue + (this.inst.angle - this.lastKnownValue));
				this.inst.angle = cr.clamp_angle(this.initialValue + this.waveFunc(this.i) * this.mag);
				this.lastKnownValue = this.inst.angle;
				break;
			case 6:		// opacity
				this.inst.opacity = this.initialValue + (this.waveFunc(this.i) * this.mag) / 100;
				if (this.inst.opacity < 0)
					this.inst.opacity = 0;
				else if (this.inst.opacity > 1)
					this.inst.opacity = 1;
				break;
			case 8:		// forwards/backwards
				if (this.inst.x !== this.lastKnownValue)
					this.initialValue += this.inst.x - this.lastKnownValue;
				if (this.inst.y !== this.lastKnownValue2)
					this.initialValue2 += this.inst.y - this.lastKnownValue2;
				this.inst.x = this.initialValue + Math.cos(this.inst.angle) * this.waveFunc(this.i) * this.mag;
				this.inst.y = this.initialValue2 + Math.sin(this.inst.angle) * this.waveFunc(this.i) * this.mag;
				this.lastKnownValue = this.inst.x;
				this.lastKnownValue2 = this.inst.y;
				break;
		}
		this.inst.set_bbox_changed();
	};
	behinstProto.onSpriteFrameChanged = function (prev_frame, next_frame) {
		switch (this.movement) {
			case 2:	// size
				this.initialValue *= (next_frame.width / prev_frame.width);
				this.ratio = next_frame.height / next_frame.width;
				break;
			case 3:	// width
				this.initialValue *= (next_frame.width / prev_frame.width);
				break;
			case 4:	// height
				this.initialValue *= (next_frame.height / prev_frame.height);
				break;
		}
	};

	function Cnds() {
	};
	Cnds.prototype.IsActive = function () {
		return this.active;
	};
	Cnds.prototype.CompareMovement = function (m) {
		return this.movement === m;
	};
	Cnds.prototype.ComparePeriod = function (cmp, v) {
		return cr.do_cmp(this.period, cmp, v);
	};
	Cnds.prototype.CompareMagnitude = function (cmp, v) {
		if (this.movement === 5)
			return cr.do_cmp(this.mag, cmp, cr.to_radians(v));
		else
			return cr.do_cmp(this.mag, cmp, v);
	};
	Cnds.prototype.CompareWave = function (w) {
		return this.wave === w;
	};
	behaviorProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.SetActive = function (a) {
		this.active = (a === 1);
	};
	Acts.prototype.SetPeriod = function (x) {
		this.period = x;
	};
	Acts.prototype.SetMagnitude = function (x) {
		this.mag = x;
		if (this.movement === 5)	// angle
			this.mag = cr.to_radians(this.mag);
	};
	Acts.prototype.SetMovement = function (m) {
		if (this.movement === 5)
			this.mag = cr.to_degrees(this.mag);
		this.movement = m;
		this.init();
	};
	Acts.prototype.SetWave = function (w) {
		this.wave = w;
	};
	Acts.prototype.SetPhase = function (x) {
		this.i = (x * _2pi) % _2pi;
		this.updateFromPhase();
	};
	Acts.prototype.UpdateInitialState = function () {
		this.init();
	};
	behaviorProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.CyclePosition = function (ret) {
		ret.set_float(this.i / _2pi);
	};
	Exps.prototype.Period = function (ret) {
		ret.set_float(this.period);
	};
	Exps.prototype.Magnitude = function (ret) {
		if (this.movement === 5)	// angle
			ret.set_float(cr.to_degrees(this.mag));
		else
			ret.set_float(this.mag);
	};
	Exps.prototype.Value = function (ret) {
		ret.set_float(this.waveFunc(this.i) * this.mag);
	};
	behaviorProto.exps = new Exps();
}());

cr.behaviors.Timer = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var behaviorProto = cr.behaviors.Timer.prototype;
	behaviorProto.Type = function (behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function () {
	};
	behaviorProto.Instance = function (type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function () {
		this.timers = {};
	};
	behinstProto.onDestroy = function () {
		cr.wipe(this.timers);
	};
	behinstProto.saveToJSON = function () {
		var o = {};
		var p, t;
		for (p in this.timers) {
			if (this.timers.hasOwnProperty(p)) {
				t = this.timers[p];
				o[p] = {
					"c": t.current.sum,
					"t": t.total.sum,
					"d": t.duration,
					"r": t.regular
				};
			}
		}
		return o;
	};
	behinstProto.loadFromJSON = function (o) {
		this.timers = {};
		var p;
		for (p in o) {
			if (o.hasOwnProperty(p)) {
				this.timers[p] = {
					current: new cr.KahanAdder(),
					total: new cr.KahanAdder(),
					duration: o[p]["d"],
					regular: o[p]["r"]
				};
				this.timers[p].current.sum = o[p]["c"];
				this.timers[p].total.sum = o[p]["t"];
			}
		}
	};
	behinstProto.tick = function () {
		var dt = this.runtime.getDt(this.inst);
		var p, t;
		for (p in this.timers) {
			if (this.timers.hasOwnProperty(p)) {
				t = this.timers[p];
				t.current.add(dt);
				t.total.add(dt);
			}
		}
	};
	behinstProto.tick2 = function () {
		var p, t;
		for (p in this.timers) {
			if (this.timers.hasOwnProperty(p)) {
				t = this.timers[p];
				if (t.current.sum >= t.duration) {
					if (t.regular)
						t.current.sum -= t.duration;
					else
						delete this.timers[p];
				}
			}
		}
	};

	function Cnds() {
	};
	Cnds.prototype.OnTimer = function (tag_) {
		tag_ = tag_.toLowerCase();
		var t = this.timers[tag_];
		if (!t)
			return false;
		return t.current.sum >= t.duration;
	};
	behaviorProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.StartTimer = function (duration_, type_, tag_) {
		this.timers[tag_.toLowerCase()] = {
			current: new cr.KahanAdder(),
			total: new cr.KahanAdder(),
			duration: duration_,
			regular: (type_ === 1)
		};
	};
	Acts.prototype.StopTimer = function (tag_) {
		tag_ = tag_.toLowerCase();
		if (this.timers.hasOwnProperty(tag_))
			delete this.timers[tag_];
	};
	behaviorProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.CurrentTime = function (ret, tag_) {
		var t = this.timers[tag_.toLowerCase()];
		ret.set_float(t ? t.current.sum : 0);
	};
	Exps.prototype.TotalTime = function (ret, tag_) {
		var t = this.timers[tag_.toLowerCase()];
		ret.set_float(t ? t.total.sum : 0);
	};
	Exps.prototype.Duration = function (ret, tag_) {
		var t = this.timers[tag_.toLowerCase()];
		ret.set_float(t ? t.duration : 0);
	};
	behaviorProto.exps = new Exps();
}());

function trim (str) {
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}
cr.behaviors.lunarray_Tween = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var behaviorProto = cr.behaviors.lunarray_Tween.prototype;
	behaviorProto.Type = function (behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function () {
	};
	behaviorProto.Instance = function (type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
		this.i = 0;		// progress
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.groupUpdateProgress = function (v) {
		if (v > 1) v = 1;
		if (cr.lunarray_tweenProgress[this.group] = -1) cr.lunarray_tweenProgress[this.group] = v;
		if (cr.lunarray_tweenProgress[this.group] >= v) cr.lunarray_tweenProgress[this.group] = v;
	}
	behinstProto.groupSync = function () {
		if (this.group != "") {
			if (typeof cr.lunarray_tweenGroup === "undefined") {
				cr.lunarray_tweenGroup = {};
				cr.lunarray_tweenProgress = {};
			}
			if (typeof cr.lunarray_tweenGroup[this.group] === "undefined") {
				cr.lunarray_tweenGroup[this.group] = [];
				cr.lunarray_tweenProgress[this.group] = -1;
			}
			if (cr.lunarray_tweenGroup[this.group].indexOf(this) == -1) {
				cr.lunarray_tweenGroup[this.group].push(this);
			}
		}
	}
	behinstProto.saveState = function () {
		this.tweenSaveWidth = this.inst.width;
		this.tweenSaveHeight = this.inst.height;
		this.tweenSaveAngle = this.inst.angle;
		this.tweenSaveOpacity = this.inst.opacity;
		this.tweenSaveX = this.inst.x;
		this.tweenSaveY = this.inst.y;
		this.tweenSaveValue = this.value;
	}
	behinstProto.onCreate = function () {
		this.active = (this.properties[0] === 1);
		this.tweened = this.properties[1]; // 0=Position|1=Size|2=Width|3=Height|4=Angle|5=Opacity|6=Value only|7=Pixel Size
		this.easing = this.properties[2];
		this.initial = this.properties[3];
		this.target = this.properties[4];
		this.duration = this.properties[5];
		this.wait = this.properties[6];
		this.playmode = this.properties[7]; //0=Play Once|1=Repeat|2=Ping Pong|3=Play once and destroy|4=Loop|5=Ping Pong Stop|6=Play and stop
		this.value = this.properties[8];
		this.coord_mode = this.properties[9]; //0=Absolute|1=Relative
		this.forceInit = (this.properties[10] === 1);
		this.group = this.properties[11];
		this.targetObject = null;
		this.pingpongCounter = 0;
		if (this.playmode == 5) this.pingpongCounter = 1;
		this.groupSync();
		this.isPaused = false;
		this.initialX = this.inst.x;
		this.initialY = this.inst.y;
		this.targetX = parseFloat(this.target.split(",")[0]);
		this.targetY = parseFloat(this.target.split(",")[1]);
		this.saveState();
		this.tweenInitialX = 0;
		this.tweenInitialY = 0;
		this.tweenTargetX = 0;
		this.tweenTargetY = 0;
		this.tweenTargetAngle = 0;
		this.ratio = this.inst.height / this.inst.width;
		this.reverse = false;
		this.rewindMode = false;
		this.doTweenX = true;
		this.doTweenY = true;
		this.loop = false;
		this.initiating = 0;
		this.cooldown = 0;
		this.lastPlayMode = this.playmode;
		this.lastKnownValue = this.tweenInitialX;
		this.lastKnownX = this.tweenInitialX;
		this.lastKnownY = this.tweenInitialY;
		if (this.forceInit) this.init();
		if (this.initial == "") this.initial = "current";
		this.onStarted = false;
		this.onStartedDone = false;
		this.onWaitEnd = false;
		this.onWaitEndDone = false;
		this.onEnd = false;
		this.onEndDone = false;
		this.onCooldown = false;
		this.onCooldownDone = false;
		if (this.active) {
			this.init();
		}
	};
	behinstProto.init = function () {
		this.onStarted = false;
		if (this.initial === "") this.initial = "current";
		if (this.target === "") this.target = "current";
		var isCurrent = (this.initial === "current");
		var targetIsCurrent = (this.target === "current");
		var isTargettingObject = (this.target === "OBJ");
		if (this.target === "OBJ") {
			if (this.targetObject != null) {
				if (this.tweened == 0) {
					if (this.coord_mode == 1) //relative mode
						this.target = (this.targetObject.x - this.inst.x) + "," + (this.targetObject.y - this.inst.y);
					else //absolute mode
						this.target = (this.targetObject.x) + "," + (this.targetObject.y);
				} else if ((this.tweened == 1) || (this.tweened == 2) || (this.tweened == 3) || (this.tweened == 7)) {
					if (this.coord_mode == 1) { //relative mode
						this.target = ((this.tweened == 2) ? 1 : (this.targetObject.width)) + "," + ((this.tweened == 3) ? 1 : (this.targetObject.height));
					} else {
						this.target = ((this.tweened == 2) ? 1 : (this.targetObject.width / this.tweenSaveWidth)) + "," + ((this.tweened == 3) ? 1 : (this.targetObject.height / this.tweenSaveHeight));
					}
				} else if (this.tweened == 4) {
					if (this.coord_mode == 1) //relative mode
						this.target = cr.to_degrees(this.targetObject.angle - this.inst.angle) + "";
					else //absolute mode
						this.target = cr.to_degrees(this.targetObject.angle) + "";
				} else if (this.tweened == 5) {
					if (this.coord_mode == 1) //relative mode
						this.target = ((this.targetObject.opacity - this.inst.opacity) * 100) + "";
					else //absolute mode
						this.target = (this.targetObject.opacity * 100) + "";
				}
			}
		}
		if (this.tweened == 0) {
			if (targetIsCurrent) this.target = this.inst.x + "," + this.inst.y;
			if (!isCurrent) {
				if (!this.reverse) {
					if (this.playmode != 1) {
						this.inst.x = parseFloat(this.initial.split(",")[0]);
						this.inst.y = parseFloat(this.initial.split(",")[1]);
					}
				}
			} else {
				if (this.coord_mode == 1) {
					this.initial = this.inst.x + "," + this.inst.y;
				} else {
					this.initial = this.tweenSaveX + "," + this.tweenSaveY;
				}
			}
			if (this.coord_mode == 1) {
				if (this.loop) {
					this.inst.x = this.tweenSaveX;
					this.inst.y = this.tweenSaveY;
				}
				this.initialX = this.inst.x;
				this.initialY = this.inst.y;
				if (!this.reverse) {
					this.targetX = parseFloat(this.target.split(",")[0]);
					this.targetY = parseFloat(this.target.split(",")[1]);
				} else {
					this.targetX = -parseFloat(this.target.split(",")[0]);
					this.targetY = -parseFloat(this.target.split(",")[1]);
				}
				this.tweenInitialX = this.initialX;
				this.tweenInitialY = this.initialY;
				this.tweenTargetX = this.tweenInitialX + this.targetX;
				this.tweenTargetY = this.tweenInitialY + this.targetY;
			} else {
				if (!this.reverse) {
					this.inst.x = this.tweenSaveX;
					this.inst.y = this.tweenSaveY;
					this.targetX = parseFloat(this.target.split(",")[0]);
					this.targetY = parseFloat(this.target.split(",")[1]);
				} else {
					this.inst.x = parseFloat(this.target.split(",")[0]);
					this.inst.y = parseFloat(this.target.split(",")[1]);
					this.targetX = this.tweenSaveX;
					this.targetY = this.tweenSaveY;
				}
				this.initialX = this.inst.x;
				this.initialY = this.inst.y;
				this.tweenInitialX = this.initialX;
				this.tweenInitialY = this.initialY;
				this.tweenTargetX = this.targetX;
				this.tweenTargetY = this.targetY;
				if (this.playmode == -6) {
					this.tweenTargetX = this.tweenSaveX;
					this.tweenTargetY = this.tweenSaveY;
				}
			}
		} else if ((this.tweened == 1) || (this.tweened == 2) || (this.tweened == 3)) {
			if (targetIsCurrent) this.target = "1,1";
			if (this.initial == "current") this.initial = "1,1";
			this.initial = "" + this.initial;
			this.target = "" + this.target;
			if (this.tweened == 2) {
				if (this.initial.indexOf(',') == -1) this.initial = parseFloat(this.initial) + ",1";
				if (this.target.indexOf(',') == -1) this.target = parseFloat(this.target) + ",1";
			} else if (this.tweened == 3) {
				if (this.initial.indexOf(',') == -1) this.initial = "1," + parseFloat(this.initial);
				if (this.target.indexOf(',') == -1) this.target = "1," + parseFloat(this.target);
			} else {
				if (this.initial.indexOf(',') == -1) this.initial = parseFloat(this.initial) + "," + parseFloat(this.initial);
				if (this.target.indexOf(',') == -1) this.target = parseFloat(this.target) + "," + parseFloat(this.target);
			}
			var ix = parseFloat(this.initial.split(",")[0]);
			var iy = parseFloat(this.initial.split(",")[1]);
			this.doTweenX = true;
			var tx = parseFloat(this.target.split(",")[0]);
			if ((tx == 0) || (isNaN(tx))) this.doTweenX = false;
			if (this.tweened == 3) this.doTweenX = false;
			this.doTweenY = true;
			var ty = parseFloat(this.target.split(",")[1]);
			if ((ty == 0) || (isNaN(ty))) this.doTweenY = false;
			if (this.tweened == 2) this.doTweenY = false;
			if (this.coord_mode == 1) {
				if (this.loop) {
					this.inst.width = this.tweenSaveWidth;
					this.inst.height = this.tweenSaveHeight;
				}
				if (!isCurrent) {
					if (!this.reverse) {
						this.inst.width = this.inst.width * ix;
						this.inst.height = this.inst.height * iy;
					} else {
						this.inst.width = this.inst.width * tx;
						this.inst.height = this.inst.height * ty;
					}
				}
				this.initialX = this.inst.width;
				this.initialY = this.inst.height;
				this.tweenInitialX = this.initialX;
				this.tweenInitialY = this.initialY;
				if (!this.reverse) {
					this.targetX = this.initialX * tx;
					this.targetY = this.initialY * ty;
				} else {
					this.targetX = this.initialX * ix / tx;
					this.targetY = this.initialY * iy / ty;
				}
				this.tweenTargetX = this.targetX;
				this.tweenTargetY = this.targetY;
			} else {
				if (!isCurrent) {
					if (!this.reverse) {
						this.inst.width = this.tweenSaveWidth * ix;
						this.inst.height = this.tweenSaveHeight * iy;
					} else {
						this.inst.width = this.tweenSaveWidth * tx;
						this.inst.height = this.tweenSaveHeight * ty;
					}
				}
				this.initialX = this.inst.width;
				this.initialY = this.inst.height;
				this.tweenInitialX = this.initialX;
				this.tweenInitialY = this.initialY;
				if (!this.reverse) {
					this.targetX = this.tweenSaveWidth * tx;
					this.targetY = this.tweenSaveHeight * ty;
				} else {
					this.targetX = this.tweenSaveWidth * ix;
					this.targetY = this.tweenSaveHeight * iy;
				}
				this.tweenTargetX = this.targetX;
				this.tweenTargetY = this.targetY;
			}
			if (this.playmode == -6) {
				this.tweenTargetX = this.tweenSaveWidth * ix;
				this.tweenTargetY = this.tweenSaveHeight * iy;
			}
		} else if (this.tweened == 4) {
			if (targetIsCurrent) this.target = cr.to_degrees(this.inst.angle);
			if (this.initial != "current") {
				if (!this.reverse) {
					if (this.playmode != 1) { //if repeat, don't initialize
						this.inst.angle = cr.to_radians(parseFloat(this.initial.split(",")[0]));
					}
				}
			}
			if (this.coord_mode == 1) {
				if (this.loop) {
					this.inst.angle = this.tweenSaveAngle;
				}
				this.initialX = this.inst.angle;
				if (this.reverse) {
					this.targetX = this.inst.angle - cr.to_radians(parseFloat(this.target.split(",")[0]));
				} else {
					this.targetX = this.inst.angle + cr.to_radians(parseFloat(this.target.split(",")[0]));
				}
				this.tweenInitialX = this.initialX;
				this.tweenTargetX = cr.to_degrees(this.targetX);
			} else {
				if (this.reverse) {
					this.inst.angle = cr.to_radians(parseFloat(this.target.split(",")[0]));
					;
					this.initialX = this.inst.angle;
					this.targetX = this.tweenSaveAngle;
					this.tweenInitialX = this.initialX;
					this.tweenTargetX = cr.to_degrees(this.targetX);
				} else {
					this.inst.angle = this.tweenSaveAngle;
					this.initialX = this.inst.angle;
					this.targetX = cr.to_radians(parseFloat(this.target.split(",")[0]));
					this.tweenInitialX = this.initialX;
					this.tweenTargetX = cr.to_degrees(this.targetX);
				}
			}
			if (this.playmode == -6) {
				this.tweenTargetX = cr.to_degrees(this.tweenSaveAngle);
			}
			this.tweenTargetAngle = cr.to_radians(this.tweenTargetX);
		} else if (this.tweened == 5) {
			if (this.initial == "current") this.initial = this.inst.opacity;
			if (targetIsCurrent) this.target = "" + this.inst.opacity;
			if (!isCurrent) {
				if (!this.reverse) {
					if (this.playmode != 1) { //if repeat, don't initialize
						this.inst.opacity = parseFloat(this.initial.split(",")[0]) / 100;
					}
				}
			}
			if (this.coord_mode == 1) {
				if (this.loop) {
					this.inst.opacity = this.tweenSaveOpacity;
				}
				this.initialX = this.inst.opacity;
				this.tweenInitialX = this.initialX;
				if (!this.reverse) {
					this.targetX = parseFloat(this.target.split(",")[0]) / 100;
				} else {
					this.targetX = -parseFloat(this.target.split(",")[0]) / 100;
				}
				this.tweenTargetX = this.tweenInitialX + this.targetX;
			} else {
				this.initialX = this.inst.opacity;
				if (!this.reverse) {
					this.tweenInitialX = this.initialX;
					this.targetX = parseFloat(this.target.split(",")[0]) / 100;
				} else {
					this.tweenInitialX = parseFloat(this.target.split(",")[0]) / 100;
					this.targetX = parseFloat(this.initial.split(",")[0]) / 100;
				}
				this.tweenTargetX = this.targetX;
			}
			if (this.playmode == -6) {
				this.tweenTargetX = this.tweenSaveOpacity;
			}
		} else if (this.tweened == 6) {
			if (isNaN(this.value)) this.value = 0;
			if (this.initial == "current") this.initial = "" + this.value;
			if (targetIsCurrent) this.target = "" + this.value;
			if (!isCurrent) {
				if (!this.reverse) {
					if (this.playmode != 1) { //if repeat, don't initialize
						this.value = parseFloat(this.initial.split(",")[0]);
					}
				}
			}
			if (this.coord_mode == 1) {
				if (this.loop) {
					this.value = this.tweenSaveValue;
				}
				if (!isCurrent) {
					if (!this.reverse) {
						this.value = parseFloat(this.initial.split(",")[0]);
					} else {
						this.value = parseFloat(this.target.split(",")[0]);
					}
				}
				this.initialX = this.value;
				if (!this.reverse) {
					this.targetX = this.initialX + parseFloat(this.target.split(",")[0]);
				} else {
					this.targetX = this.initialX - parseFloat(this.target.split(",")[0]);
				}
				this.tweenInitialX = this.initialX;
				this.tweenTargetX = this.targetX;
			} else {
				if (!isCurrent) {
					if (!this.reverse) {
						this.value = parseFloat(this.initial.split(",")[0]);
					} else {
						this.value = parseFloat(this.target.split(",")[0]);
					}
				}
				this.initialX = this.value;
				if (!this.reverse) {
					this.targetX = parseFloat(this.target.split(",")[0]);
				} else {
					this.targetX = parseFloat(this.initial.split(",")[0]);
				}
				this.tweenInitialX = this.initialX;
				this.tweenTargetX = this.targetX;
			}
			if (this.playmode == -6) {
				this.tweenTargetX = this.tweenSaveValue;
			}
		} else if (this.tweened == 7) {
			if (targetIsCurrent) this.target = this.inst.width + "," + this.inst.height;
			if (this.initial != "current") {
				if (!this.reverse) {
					if (this.playmode != 1) { //if repeat, don't initialize
						this.inst.width = parseFloat(this.initial.split(",")[0]);
						this.inst.height = parseFloat(this.initial.split(",")[1]);
					}
				}
			}
			this.doTweenX = true;
			var tx = parseFloat(this.target.split(",")[0]);
			if ((tx < 0) || (isNaN(tx))) this.doTweenX = false;
			this.doTweenY = true;
			var ty = parseFloat(this.target.split(",")[1]);
			if ((ty < 0) || (isNaN(ty))) this.doTweenY = false;
			if (this.coord_mode == 1) {
				if (this.loop) {
					this.inst.width = this.tweenSaveWidth;
					this.inst.height = this.tweenSaveHeight;
				}
				this.initialX = this.inst.width;
				this.initialY = this.inst.height;
				if (!this.reverse) {
					this.targetX = this.initialX + parseFloat(this.target.split(",")[0]);
					this.targetY = this.initialY + parseFloat(this.target.split(",")[1]);
				} else {
					this.targetX = this.initialX - parseFloat(this.target.split(",")[0]);
					this.targetY = this.initialY - parseFloat(this.target.split(",")[1]);
				}
				this.tweenInitialX = this.initialX;
				this.tweenInitialY = this.initialY;
				this.tweenTargetX = this.targetX;
				this.tweenTargetY = this.targetY;
			} else {
				if (!isCurrent) {
					if (!this.reverse) {
						this.inst.width = this.tweenSaveWidth;
						this.inst.height = this.tweenSaveHeight;
					} else {
						this.inst.width = parseFloat(this.target.split(",")[0]);
						this.inst.height = parseFloat(this.target.split(",")[1]);
					}
				}
				this.initialX = this.inst.width;
				this.initialY = this.inst.height;
				if (!this.reverse) {
					this.targetX = parseFloat(this.target.split(",")[0]);
					this.targetY = parseFloat(this.target.split(",")[1]);
				} else {
					this.targetX = this.tweenSaveWidth;
					this.targetY = this.tweenSaveHeight;
				}
				this.tweenInitialX = this.initialX;
				this.tweenInitialY = this.initialY;
				this.tweenTargetX = this.targetX;
				this.tweenTargetY = this.targetY;
			}
			if (this.playmode == -6) {
				this.tweenTargetX = this.tweenSaveWidth;
				this.tweenTargetY = this.tweenSaveHeight;
			}
		} else {
			;
		}
		this.lastKnownValue = this.tweenInitialX;
		this.lastKnownX = this.tweenInitialX;
		this.lastKnownY = this.tweenInitialY;
		this.initiating = parseFloat(this.wait.split(",")[0]);
		this.cooldown = parseFloat(this.wait.split(",")[1]);
		if ((this.initiating < 0) || (isNaN(this.initiating))) this.initiating = 0;
		if ((this.cooldown < 0) || (isNaN(this.cooldown))) this.cooldown = 0;
		if (isCurrent) this.initial = "current";
		if (targetIsCurrent) this.target = "current";
		if (isTargettingObject) this.target = "OBJ";
	};

	function easeOutBounce(t, b, c, d) {
		if ((t /= d) < (1 / 2.75)) {
			return c * (7.5625 * t * t) + b;
		} else if (t < (2 / 2.75)) {
			return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
		} else if (t < (2.5 / 2.75)) {
			return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
		} else {
			return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
		}
	}

	behinstProto.easeFunc = function (t, b, c, d) {
		switch (this.easing) {
			case 0:		// linear
				return c * t / d + b;
			case 1:		// easeInQuad
				return c * (t /= d) * t + b;
			case 2:		// easeOutQuad
				return -c * (t /= d) * (t - 2) + b;
			case 3:		// easeInOutQuad
				if ((t /= d / 2) < 1) return c / 2 * t * t + b;
				return -c / 2 * ((--t) * (t - 2) - 1) + b;
			case 4:		// easeInCubic
				return c * (t /= d) * t * t + b;
			case 5:		// easeOutCubic
				return c * ((t = t / d - 1) * t * t + 1) + b;
			case 6:		// easeInOutCubic
				if ((t /= d / 2) < 1)
					return c / 2 * t * t * t + b;
				return c / 2 * ((t -= 2) * t * t + 2) + b;
			case 7:		// easeInQuart
				return c * (t /= d) * t * t * t + b;
			case 8:		// easeOutQuart
				return -c * ((t = t / d - 1) * t * t * t - 1) + b;
			case 9:		// easeInOutQuart
				if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
				return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
			case 10:		// easeInQuint
				return c * (t /= d) * t * t * t * t + b;
			case 11:		// easeOutQuint
				return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
			case 12:		// easeInOutQuint
				if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
				return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
			case 13:		// easeInCircle
				return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
			case 14:		// easeOutCircle
				return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
			case 15:		// easeInOutCircle
				if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
				return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
			case 16:		// easeInBack
				var s = 0;
				if (s == 0) s = 1.70158;
				return c * (t /= d) * t * ((s + 1) * t - s) + b;
			case 17:		// easeOutBack
				var s = 0;
				if (s == 0) s = 1.70158;
				return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
			case 18:		// easeInOutBack
				var s = 0;
				if (s == 0) s = 1.70158;
				if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
				return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
			case 19:	//easeInElastic
				var a = 0;
				var p = 0;
				if (t == 0) return b;
				if ((t /= d) == 1) return b + c;
				if (p == 0) p = d * .3;
				if (a == 0 || a < Math.abs(c)) {
					a = c;
					var s = p / 4;
				}
				else var s = p / (2 * Math.PI) * Math.asin(c / a);
				return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
			case 20:	//easeOutElastic
				var a = 0;
				var p = 0;
				if (t == 0) return b;
				if ((t /= d) == 1) return b + c;
				if (p == 0) p = d * .3;
				if (a == 0 || a < Math.abs(c)) {
					a = c;
					var s = p / 4;
				}
				else var s = p / (2 * Math.PI) * Math.asin(c / a);
				return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
			case 21:	//easeInOutElastic
				var a = 0;
				var p = 0;
				if (t == 0) return b;
				if ((t /= d / 2) == 2) return b + c;
				if (p == 0) p = d * (.3 * 1.5);
				if (a == 0 || a < Math.abs(c)) {
					a = c;
					var s = p / 4;
				}
				else var s = p / (2 * Math.PI) * Math.asin(c / a);
				if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
				return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
			case 22:	//easeInBounce
				return c - easeOutBounce(d - t, 0, c, d) + b;
			case 23:	//easeOutBounce
				return easeOutBounce(t, b, c, d);
			case 24:	//easeInOutBounce
				if (t < d / 2) return (c - easeOutBounce(d - (t * 2), 0, c, d) + b) * 0.5 + b;
				else return easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
			case 25:	//easeInSmoothstep
				var mt = (t / d) / 2;
				return (2 * (mt * mt * (3 - 2 * mt)));
			case 26:	//easeOutSmoothstep
				var mt = ((t / d) + 1) / 2;
				return ((2 * (mt * mt * (3 - 2 * mt))) - 1);
			case 27:	//easeInOutSmoothstep
				var mt = (t / d);
				return (mt * mt * (3 - 2 * mt));
		}
		;
		return 0;
	};
	behinstProto.saveToJSON = function () {
		return {
			"i": this.i,
			"active": this.active,
			"tweened": this.tweened,
			"easing": this.easing,
			"initial": this.initial,
			"target": this.target,
			"duration": this.duration,
			"wait": this.wait,
			"playmode": this.playmode,
			"value": this.value,
			"coord_mode": this.coord_mode,
			"forceInit": this.forceInit,
			"group": this.group,
			"targetObject": this.targetObject,
			"pingpongCounter": this.pingpongCounter,
			"isPaused": this.isPaused,
			"initialX": this.initialX,
			"initialY": this.initialY,
			"targetX": this.targetX,
			"targetY": this.targetY,
			"tweenSaveWidth": this.tweenSaveWidth,
			"tweenSaveHeight": this.tweenSaveHeight,
			"tweenSaveAngle": this.tweenSaveAngle,
			"tweenSaveX": this.tweenSaveX,
			"tweenSaveY": this.tweenSaveY,
			"tweenSaveValue": this.tweenSaveValue,
			"tweenInitialX": this.tweenInitialX,
			"tweenInitialY": this.tweenInitialY,
			"tweenTargetX": this.tweenTargetX,
			"tweenTargetY": this.tweenTargetY,
			"tweenTargetAngle": this.tweenTargetAngle,
			"ratio": this.ratio,
			"reverse": this.reverse,
			"rewindMode": this.rewindMode,
			"doTweenX": this.doTweenX,
			"doTweenY": this.doTweenY,
			"loop": this.loop,
			"initiating": this.initiating,
			"cooldown": this.cooldown,
			"lastPlayMode": this.lastPlayMode,
			"lastKnownValue": this.lastKnownValue,
			"lastKnownX": this.lastKnownX,
			"lastKnownY": this.lastKnownY,
			"onStarted": this.onStarted,
			"onStartedDone": this.onStartedDone,
			"onWaitEnd": this.onWaitEnd,
			"onWaitEndDone": this.onWaitEndDone,
			"onEnd": this.onEnd,
			"onEndDone": this.onEndDone,
			"onCooldown": this.onCooldown,
			"onCooldownDone": this.onCooldownDone
		};
	};
	behinstProto.loadFromJSON = function (o) {
		this.i = o["i"];
		this.active = o["active"];
		this.tweened = o["tweened"];
		this.easing = o["easing"];
		this.initial = o["initial"];
		this.target = o["target"];
		this.duration = o["duration"];
		this.wait = o["wait"];
		this.playmode = o["playmode"];
		this.value = o["value"];
		this.coord_mode = o["coord_mode"];
		this.forceInit = o["forceInit"];
		this.group = o["group"];
		this.targetObject = o["targetObject"];
		this.pingpongCounter = o["pingpongCounter"];
		this.isPaused = o["isPaused"];
		this.initialX = o["initialX"];
		this.initialY = o["initialY"];
		this.targetX = o["targetX"];
		this.targetY = o["targetY"];
		this.tweenSaveWidth = o["tweenSaveWidth"];
		this.tweenSaveHeight = o["tweenSaveHeight"];
		this.tweenSaveAngle = o["tweenSaveAngle"];
		this.tweenSaveX = o["tweenSaveX"];
		this.tweenSaveY = o["tweenSaveY"];
		this.tweenSaveValue = o["tweenSaveValue"];
		this.tweenInitialX = o["tweenInitialX"];
		this.tweenInitialY = o["tweenInitialY"];
		this.tweenTargetX = o["tweenTargetX"];
		this.tweenTargetY = o["tweenTargetY"];
		this.tweenTargetAngle = o["tweenTargetAngle"];
		this.ratio = o["ratio"];
		this.reverse = o["reverse"];
		this.rewindMode = o["rewindMode"];
		this.doTweenX = o["doTweenX"];
		this.doTweenY = o["doTweenY"];
		this.loop = o["loop"];
		this.initiating = o["initiating"];
		this.cooldown = o["cooldown"];
		this.lastPlayMode = o["lastPlayMode"];
		this.lastKnownValue = o["lastKnownValue"];
		this.lastKnownX = o["lastKnownX"];
		this.lastKnownY = o["lastKnownY"];
		this.onStarted = o["onStarted"];
		this.onStartedDone = o["onStartedDone"];
		this.onWaitEnd = o["onWaitEnd"];
		this.onWaitEndDone = o["onWaitEndDone"]
		this.onEnd = o["onEnd"];
		this.onEndDone = o["onEndDone"];
		this.onCooldown = o["onCooldown"];
		this.onCooldownDone = o["onCooldownDone"];
		this.groupSync();
	};
	behinstProto.tick = function () {
		var dt = this.runtime.getDt(this.inst);
		var isForceStop = (this.i == -1);
		if (!this.active || dt === 0)
			return;
		if (this.i == 0) {
			if (!this.onStarted) {
				this.onStarted = true;
				this.onStartedDone = false;
				this.onWaitEnd = false;
				this.onWaitEndDone = false;
				this.onEnd = false;
				this.onEndDone = false;
				this.onCooldown = false;
				this.onCooldownDone = false;
				this.runtime.trigger(cr.behaviors.lunarray_Tween.prototype.cnds.OnStart, this.inst);
				this.onStartedDone = true;
			}
		}
		if (this.i == -1) {
			this.i = this.initiating + this.duration + this.cooldown;
		} else {
			this.i += dt;
		}
		if (this.i <= this.initiating) {
			return;
		} else {
			if (this.onWaitEnd == false) {
				this.onWaitEnd = true;
				this.runtime.trigger(cr.behaviors.lunarray_Tween.prototype.cnds.OnWaitEnd, this.inst);
				this.onWaitEndDone = true;
			}
		}
		if (this.i <= (this.duration + this.initiating)) {
			var factor = this.easeFunc(this.i - this.initiating, 0, 1, this.duration);
			if (this.tweened == 0) {
				if (this.coord_mode == 1) {
					if (this.inst.x !== this.lastKnownX) {
						this.tweenInitialX += (this.inst.x - this.lastKnownX);
						this.tweenTargetX += (this.inst.x - this.lastKnownX);
					}
					if (this.inst.y !== this.lastKnownY) {
						this.tweenInitialY += (this.inst.y - this.lastKnownY);
						this.tweenTargetY += (this.inst.y - this.lastKnownY);
					}
				} else {
					if (this.inst.x !== this.lastKnownX)
						this.tweenInitialX += (this.inst.x - this.lastKnownX);
					if (this.inst.y !== this.lastKnownY)
						this.tweenInitialY += (this.inst.y - this.lastKnownY);
				}
				this.inst.x = this.tweenInitialX + (this.tweenTargetX - this.tweenInitialX) * factor;
				this.inst.y = this.tweenInitialY + (this.tweenTargetY - this.tweenInitialY) * factor;
				this.lastKnownX = this.inst.x;
				this.lastKnownY = this.inst.y;
			} else if ((this.tweened == 1) || (this.tweened == 2) || (this.tweened == 3)) {
				if (this.inst.width !== this.lastKnownX)
					this.tweenInitialX = this.inst.width;
				if (this.inst.height !== this.lastKnownY)
					this.tweenInitialY = this.inst.height;
				if (this.doTweenX) {
					this.inst.width = this.tweenInitialX + (this.tweenTargetX - this.tweenInitialX) * factor;
				}
				if (this.doTweenY) {
					this.inst.height = this.tweenInitialY + (this.tweenTargetY - this.tweenInitialY) * factor;
				} else {
					if (this.tweened == 1) {
						this.inst.height = this.inst.width * this.ratio;
					}
				}
				this.lastKnownX = this.inst.width;
				this.lastKnownY = this.inst.height;
			} else if (this.tweened == 4) {
				var tangle = this.tweenInitialX + (this.tweenTargetAngle - this.tweenInitialX) * factor;
				if (this.i >= (this.duration + this.initiating))
					tangle = this.tweenTargetAngle;
				this.inst.angle = cr.clamp_angle(tangle);
			} else if (this.tweened == 5) {
				if (this.coord_mode == 1) {
					if (this.inst.opacity !== this.lastKnownX)
						this.tweenInitialX = this.inst.opacity;
				}
				this.inst.opacity = this.tweenInitialX + (this.tweenTargetX - this.tweenInitialX) * factor;
				this.lastKnownX = this.inst.opacity;
			} else if (this.tweened == 6) {
				this.value = this.tweenInitialX + (this.tweenTargetX - this.tweenInitialX) * factor;
			} else if (this.tweened == 7) {
				if (this.coord_mode == 1) {
					if (this.inst.width !== this.lastKnownX)
						this.tweenInitialX = this.inst.width;
					if (this.inst.height !== this.lastKnownY)
						this.tweenInitialY = this.inst.height;
				}
				if (this.doTweenX) this.inst.width = this.tweenInitialX + (this.tweenTargetX - this.tweenInitialX) * factor;
				if (this.doTweenY) this.inst.height = this.tweenInitialY + (this.tweenTargetY - this.tweenInitialY) * factor;
				this.lastKnownX = this.inst.width;
				this.lastKnownY = this.inst.height;
			}
			this.inst.set_bbox_changed();
		}
		if (this.i >= this.duration + this.initiating) {
			this.doEndFrame(isForceStop);
			this.inst.set_bbox_changed();
			if (this.onEnd == false) {
				this.onEnd = true;
				this.runtime.trigger(cr.behaviors.lunarray_Tween.prototype.cnds.OnEnd, this.inst);
				this.onEndDone = true;
			}
		}
		;
	};
	behinstProto.doEndFrame = function (isForceStop) {
		switch (this.tweened) {
			case 0:		// position
				this.inst.x = this.tweenTargetX;
				this.inst.y = this.tweenTargetY;
				break;
			case 1:		// size
				if (this.doTweenX) this.inst.width = this.tweenTargetX;
				if (this.doTweenY) {
					this.inst.height = this.tweenTargetY;
				} else {
					this.inst.height = this.inst.width * this.ratio;
				}
				break;
			case 2:		// width
				this.inst.width = this.tweenTargetX;
				break;
			case 3:		// height
				this.inst.height = this.tweenTargetY;
				break;
			case 4:		// angle
				var tangle = this.tweenTargetAngle;
				this.inst.angle = cr.clamp_angle(tangle);
				this.lastKnownValue = this.inst.angle;
				break;
			case 5:		// opacity
				this.inst.opacity = this.tweenTargetX;
				break;
			case 6:		// value
				this.value = this.tweenTargetX;
				break;
			case 7:		// size
				if (this.doTweenX) this.inst.width = this.tweenTargetX;
				if (this.doTweenY) this.inst.height = this.tweenTargetY;
				break;
		}
		if (this.i >= this.duration + this.initiating + this.cooldown) {
			if (this.playmode == 0) {
				this.active = false;
				this.reverse = false;
				this.i = this.duration + this.initiating + this.cooldown;
			} else if (this.playmode == 1) {
				this.i = 0;
				this.init();
				this.active = true;
			} else if (this.playmode == 2) {
				if (isForceStop) {
					this.reverse = false;
					this.init();
				} else {
					this.reverse = !this.reverse;
					this.i = 0;
					this.init();
					this.active = true;
				}
			} else if (this.playmode == 3) {
				this.runtime.DestroyInstance(this.inst);
			} else if (this.playmode == 4) {
				this.loop = true;
				this.i = 0;
				this.init();
				this.active = true;
			} else if (this.playmode == 5) {
				if (isForceStop) {
					this.reverse = false;
					this.init();
				} else {
					if (this.pingpongCounter <= 0) {
						this.i = this.duration + this.initiating + this.cooldown;
						this.active = false;
					} else {
						if (!this.reverse) {
							this.pingpongCounter -= 1;
							this.reverse = true;
							this.i = 0;
							this.init();
							this.active = true;
						} else {
							this.pingpongCounter -= 1;
							this.reverse = false;
							this.i = 0;
							this.init();
							this.active = true;
						}
					}
				}
			} else if (this.playmode == -6) {
				this.playmode = this.lastPlayMode;
				this.reverse = false;
				this.i = 0;
				this.active = false;
			} else if (this.playmode == 6) {
				this.reverse = false;
				this.i = this.duration + this.initiating + this.cooldown;
				this.active = false;
			}
		}
		if (this.onCooldown == false) {
			this.onCooldown = true;
			this.runtime.trigger(cr.behaviors.lunarray_Tween.prototype.cnds.OnCooldownEnd, this.inst);
			this.onCooldownDone = true;
		}
	}
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;
	cnds.IsActive = function () {
		return this.active;
	};
	cnds.CompareGroupProgress = function (cmp, v) {
		var x = [];
		cr.lunarray_tweenGroup[this.group].forEach(function (value) {
			x.push((value.i / (value.duration + value.initiating + value.cooldown)));
		});
		return cr.do_cmp(Math.min.apply(null, x), cmp, v);
	}
	cnds.CompareProgress = function (cmp, v) {
		return cr.do_cmp((this.i / (this.duration + this.initiating + this.cooldown)), cmp, v);
	};
	cnds.OnStart = function () {
		if (this.onStartedDone === false) {
			return this.onStarted;
		}
	};
	cnds.OnWaitEnd = function () {
		if (this.onWaitEndDone === false) {
			return this.onWaitEnd;
		}
	};
	cnds.OnEnd = function (a, b, c) {
		if (this.onEndDone === false) {
			return this.onEnd;
		}
	};
	cnds.OnCooldownEnd = function () {
		if (this.onCooldownDone === false) {
			return this.onCooldown;
		}
	};
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;
	acts.SetActive = function (a) {
		this.active = (a === 1);
	};
	acts.StartGroup = function (force, sgroup) {
		if (sgroup === "") sgroup = this.group;
		var groupReady = (force === 1) || cr.lunarray_tweenGroup[sgroup].every(function (value2) {
			return !value2.active;
		});
		if (groupReady) {
			cr.lunarray_tweenGroup[sgroup].forEach(
				function (value) {
					if (force === 1) {
						acts.Force.apply(value);
					} else {
						acts.Start.apply(value);
					}
				}
			);
		}
	}
	acts.StopGroup = function (stopmode, sgroup) {
		if (sgroup === "") sgroup = this.group;
		cr.lunarray_tweenGroup[sgroup].forEach(function (value) {
			acts.Stop.apply(value, [stopmode]);
		});
	}
	acts.ReverseGroup = function (force, rewindMode, sgroup) {
		if (sgroup === "") sgroup = this.group;
		var groupReady = (force === 1) || cr.lunarray_tweenGroup[sgroup].every(function (value2) {
			return !value2.active;
		});
		if (groupReady) {
			cr.lunarray_tweenGroup[sgroup].forEach(
				function (value) {
					if (force === 1) {
						acts.ForceReverse.apply(value, [rewindMode]);
					} else {
						acts.Reverse.apply(value, [rewindMode]);
					}
				}
			);
		}
	}
	acts.Force = function () {
		this.loop = (this.playmode === 4);
		if (this.playmode == 5) this.pingpongCounter = 1;
		if ((this.playmode == 6) || (this.playmode == -6)) {
			if (this.i < this.duration + this.cooldown + this.initiating) {
				this.reverse = false;
				this.init();
				this.active = true;
			}
		} else {
			this.reverse = false;
			this.i = 0;
			this.init();
			this.active = true;
		}
	};
	acts.ForceReverse = function (rewindMode) {
		this.rewindMode = (rewindMode == 1);
		this.loop = (this.playmode === 4);
		if (this.playmode == 5) this.pingpongCounter = 1;
		if ((this.playmode == 6) || (this.playmode == -6)) {
			if (this.i < this.duration + this.cooldown + this.initiating) {
				this.reverse = true;
				this.init();
				this.active = true;
			}
		} else {
			if (rewindMode) {
				if (this.pingpongCounter == 1) {
					if (this.i >= this.duration + this.cooldown + this.initiating) {
						this.reverse = true;
						this.i = 0;
						this.pingpongCounter = 2;
						this.init();
						this.active = true;
					}
				}
			} else {
				this.reverse = true;
				this.i = 0;
				this.init();
				this.active = true;
			}
		}
	};
	acts.Start = function () {
		if (!this.active) {
			this.loop = (this.playmode === 4);
			if (this.playmode == 5) this.pingpongCounter = 1;
			if ((this.playmode == 6) || (this.playmode == -6)) {
				if (this.i < this.duration + this.cooldown + this.initiating) {
					this.reverse = false;
					this.init();
					this.active = true;
				}
			} else {
				this.pingpongCounter = 1;
				this.reverse = false;
				this.i = 0;
				this.init();
				this.active = true;
			}
		}
	};
	acts.Stop = function (stopmode) {
		if (this.active) {
			if ((this.playmode == 2) || (this.playmode == 4)) {
				if (this.reverse) {
					this.i = 0;
				} else {
					this.i = -1;
				}
			} else {
				if (stopmode == 1) {
					this.saveState();
				} else if (stopmode == 0) {
					this.i = this.initiating + this.cooldown + this.duration;
				} else {
					this.i = 0;
				}
			}
			this.tick();
			this.active = false;
		}
	};
	acts.Pause = function () {
		if (this.active) {
			this.isPaused = true;
			this.active = false;
		}
	}
	acts.Resume = function () {
		if (this.isPaused) {
			this.active = true;
			this.isPaused = false;
		} else {
			if (!this.active) {
				this.reverse = false;
				this.i = 0;
				this.init();
				this.active = true;
			}
		}
	}
	acts.Reverse = function (rewindMode) {
		this.rewindMode = (rewindMode == 1);
		if (!this.active) {
			this.loop = (this.playmode === 4);
			if (this.playmode == 5) this.pingpongCounter = 1;
			if ((this.playmode == 6) || (this.playmode == -6)) {
				if (this.i < this.duration + this.cooldown + this.initiating) {
					this.reverse = true;
					this.init();
					this.active = true;
				}
			} else {
				if (rewindMode) {
					if (this.pingpongCounter == 1) {
						if (this.i >= this.duration + this.cooldown + this.initiating) {
							this.reverse = true;
							this.i = 0;
							this.pingpongCounter = 2;
							this.init();
							this.active = true;
						}
					}
				} else {
					this.reverse = true;
					this.i = 0;
					this.init();
					this.active = true;
				}
			}
		}
	};
	acts.SetDuration = function (x) {
		this.duration = x;
	};
	acts.SetWait = function (x) {
		this.wait = x;
		this.initiating = parseFloat(this.wait.split(",")[0]);
		this.cooldown = parseFloat(this.wait.split(",")[1]);
		if ((this.initiating < 0) || (isNaN(this.initiating))) this.initiating = 0;
		if ((this.cooldown < 0) || (isNaN(this.cooldown))) this.cooldown = 0;
	};
	acts.SetTarget = function (x) {
		if (typeof(x) == "string") {
			this.target = x;
			this.targetX = parseFloat(x.split(",")[0]);
			this.targetY = parseFloat(x.split(",")[1]);
		} else {
			this.target = x;
			this.targetX = x;
		}
		if (!this.active) {
			this.init();
		} else {
		}
	};
	acts.SetTargetObject = function (obj) {
		if (!obj)
			return;
		var otherinst = obj.getFirstPicked();
		if (!otherinst)
			return;
		this.targetObject = otherinst;
		this.target = "OBJ";
	};
	acts.SetTargetX = function (x) {
		if ((this.tweened == 2) || (this.tweened == 3) || (this.tweened == 4) || (this.tweened == 5) || (this.tweened == 6)) {
			if (typeof(x) == "string") {
				this.target = parseFloat(x.split(",")[0]);
			} else {
				this.target = "" + x + "," + this.targetY;
			}
			this.targetX = this.target;
		} else {
			var currY = this.target.split(",")[1];
			this.target = String(x) + "," + currY;
			this.targetX = parseFloat(this.target.split(",")[0]);
			this.targetY = parseFloat(this.target.split(",")[1]);
		}
		if (!this.active) {
			this.saveState();
			this.init();
		} else {
		}
	};
	acts.SetTargetY = function (x) {
		if ((this.tweened == 2) || (this.tweened == 3) || (this.tweened == 4) || (this.tweened == 5) || (this.tweened == 6)) {
			if (typeof(x) == "string") {
				this.target = parseFloat(x) + "";
			} else {
				this.target = this.targetX + "," + x;
			}
			this.targetX = this.target;
		} else {
			var currX = this.target.split(",")[0];
			this.target = currX + "," + String(x);
			this.targetX = parseFloat(this.target.split(",")[0]);
			this.targetY = parseFloat(this.target.split(",")[1]);
		}
		if (!this.active) {
			this.saveState();
			this.init();
		} else {
		}
	};
	acts.SetInitial = function (x) {
		if (typeof(x) == "string") {
			this.initial = x;
			this.initialX = parseFloat(x.split(",")[0]);
			this.initialY = parseFloat(x.split(",")[1]);
		} else {
			this.initial = "" + x;
			this.initialX = x;
		}
		if (this.tweened == 6) {
			this.value = this.initialX;
		}
		if (!this.active) {
			this.saveState();
			this.init();
		} else {
		}
	};
	acts.SetInitialX = function (x) {
		if ((this.tweened == 2) || (this.tweened == 3) || (this.tweened == 4) || (this.tweened == 5) || (this.tweened == 6)) {
			if (typeof(x) == "string") {
				this.initial = parseFloat(x);
			} else {
				this.initial = "" + x + "," + this.initialY;
			}
			this.initialX = this.initial;
		} else {
			if (this.initial == "") this.initial = "current";
			if (this.initial == "current") {
				var currY = this.tweenSaveY;
			} else {
				var currY = this.initial.split(",")[1];
			}
			this.initial = String(x) + "," + currY;
			this.initialX = parseFloat(this.initial.split(",")[0]);
			this.initialY = parseFloat(this.initial.split(",")[1]);
		}
		if (this.tweened == 6) {
			this.value = this.initialX;
		}
		if (!this.active) {
			this.saveState();
			this.init();
		} else {
		}
	};
	acts.SetInitialY = function (x) {
		if ((this.tweened == 2) || (this.tweened == 3) || (this.tweened == 4) || (this.tweened == 5) || (this.tweened == 6)) {
			if (typeof(x) == "string") {
				this.initial = parseFloat(x);
			} else {
				this.initial = "" + this.initialX + "," + x;
			}
			this.initialX = this.initial;
		} else {
			if (this.initial == "") this.initial = "current";
			if (this.initial == "current") {
				var currX = this.tweenSaveX;
			} else {
				var currX = this.initial.split(",")[0];
			}
			this.initial = currX + "," + String(x);
			this.initialX = parseFloat(this.initial.split(",")[0]);
			this.initialY = parseFloat(this.initial.split(",")[1]);
		}
		if (!this.active) {
			this.saveState();
			this.init();
		} else {
		}
	};
	acts.SetValue = function (x) {
		this.value = x;
	};
	acts.SetTweenedProperty = function (m) {
		this.tweened = m;
	};
	acts.SetEasing = function (w) {
		this.easing = w;
	};
	acts.SetPlayback = function (x) {
		this.playmode = x;
	};
	acts.SetParameter = function (tweened, playmode, easefunction, initial, target, duration, wait, cmode) {
		this.tweened = tweened;
		this.playmode = playmode;
		this.easing = easefunction;
		acts.SetInitial.apply(this, [initial]);
		acts.SetTarget.apply(this, [target]);
		acts.SetDuration.apply(this, [duration]);
		acts.SetWait.apply(this, [wait]);
		this.coord_mode = cmode;
		this.saveState();
	};
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;
	exps.Progress = function (ret) {
		ret.set_float(this.i / (this.duration + this.initiating + this.cooldown));
	};
	exps.ProgressTime = function (ret) {
		ret.set_float(this.i);
	};
	exps.Duration = function (ret) {
		ret.set_float(this.duration);
	};
	exps.Initiating = function (ret) {
		ret.set_float(this.initiating);
	};
	exps.Cooldown = function (ret) {
		ret.set_float(this.cooldown);
	};
	exps.Target = function (ret) {
		ret.set_string(this.target);
	};
	exps.Value = function (ret) {
		ret.set_float(this.value);
	};
	exps.isPaused = function (ret) {
		ret.set_int(this.isPaused ? 1 : 0);
	};
}());

cr.behaviors.rex_Anchor2 = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var behaviorProto = cr.behaviors.rex_Anchor2.prototype;
	behaviorProto.Type = function (behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function () {
	};
	behaviorProto.Instance = function (type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function () {
		this.alignModeX = this.properties[0]; // 0=left, 1=right, 2=center, 3=hotspot, 4=none
		this.viewPortScaleX = this.properties[1]; // 0=window left, 0.5=window center, 1=window right
		this.alignModeY = this.properties[2]; // 0=top, 1=bottom, 2=center, 3=hotspot, 4=none
		this.viewPortScaleY = this.properties[3]; // 0=window top, 0.5=window center, 1=window bottom
		this.enabled = (this.properties[4] !== 0);
		this.set_once = (this.properties[5] == 1);
		this.update_cnt = 0;
		this.viewLeft_saved = null;
		this.viewRight_saved = null;
		this.viewTop_saved = null;
		this.viewBottom_saved = null;
	};
	behinstProto.is_layer_size_changed = function () {
		var layer = this.inst.layer;
		return (this.viewLeft_saved != layer.viewLeft) ||
			(this.viewRight_saved != layer.viewRight) ||
			(this.viewTop_saved != layer.viewTop) ||
			(this.viewBottom_saved != layer.viewBottom);
	};
	behinstProto.set_update_flag = function () {
		if (this.update_cnt === 0)
			this.update_cnt = 1;
	};
	behinstProto.tick = function () {
		if (!this.enabled)
			return;
		if (this.set_once) {
			if (this.is_layer_size_changed()) {
				var layer = this.inst.layer;
				this.viewLeft_saved = layer.viewLeft;
				this.viewRight_saved = layer.viewRight;
				this.viewTop_saved = layer.viewTop;
				this.viewBottom_saved = layer.viewBottom;
				this.update_cnt = 2;
			}
			if (this.update_cnt == 0)  // no need to update
				return;
			else                       // update once
				this.update_cnt -= 1;
		}
		var enableX = (this.alignModeX !== 4);
		var enableY = (this.alignModeY !== 4);
		if (!enableX && !enableY)
			return;
		var layer = this.inst.layer;
		var targetX = (enableX) ? layer.viewLeft + ( (layer.viewRight - layer.viewLeft) * this.viewPortScaleX ) : 0;
		var targetY = (enableY) ? layer.viewTop + ( (layer.viewBottom - layer.viewTop) * this.viewPortScaleY ) : 0;
		var inst = this.inst;
		var bbox = this.inst.bbox;
		inst.update_bbox();
		var nx = 0, ny = 0;
		switch (this.alignModeX) {
			case 0:    // set left edge to targetX
				nx = targetX + ( this.inst.x - bbox.left );
				break;
			case 1:    // set right edge to targetX
				nx = targetX + ( this.inst.x - bbox.right );
				break;
			case 2:    // cneter
				nx = targetX + ( this.inst.x - (bbox.right + bbox.left) / 2 );
				break;
			case 3:    // hotspot
				nx = targetX;
				break;
			case 4:    // None
				nx = this.inst.x;
				break;
		}
		switch (this.alignModeY) {
			case 0:    // top edge
				ny = targetY + ( this.inst.y - bbox.top );
				break;
			case 1:    // bottom edge
				ny = targetY + ( this.inst.y - bbox.bottom );
				break;
			case 2:    // cneter
				ny = targetY + ( this.inst.y - (bbox.bottom + bbox.top) / 2 );
				break;
			case 3:    // hotspot
				ny = targetY;
				break;
			case 4:    // None
				ny = this.inst.y;
				break;
		}
		if ((nx !== this.inst.x) || (ny !== this.inst.y)) {
			inst.x = nx;
			inst.y = ny;
			inst.set_bbox_changed();
		}
		if (this.set_once)
			this.runtime.trigger(cr.behaviors.rex_Anchor2.prototype.cnds.OnAnchored, this.inst);
	};
	behinstProto.saveToJSON = function () {
		return {
			"enabled": this.enabled,
			"amx": this.alignModeX,
			"vx": this.viewPortScaleX,
			"amy": this.alignModeY,
			"vy": this.viewPortScaleY,
		};
	};
	behinstProto.loadFromJSON = function (o) {
		this.enabled = o["enabled"];
		this.alignModeX = o["amx"];
		this.viewPortScaleX = o["vx"];
		this.alignModeY = o["amy"];
		this.viewPortScaleY = o["vy"];
	};

	function Cnds() {
	};
	behaviorProto.cnds = new Cnds();
	Cnds.prototype.OnAnchored = function () {
		return true;
	};

	function Acts() {
	};
	behaviorProto.acts = new Acts();
	Acts.prototype.SetEnabled = function (e) {
		var e = (e === 1);
		if (!this.enabled && e)
			this.set_update_flag();
		this.enabled = e;
	};
	Acts.prototype.SetHorizontalAlignMode = function (m) {
		if (m !== 4)
			this.set_update_flag();
		this.alignModeX = m;
	};
	Acts.prototype.SetHorizontalPosition = function (p) {
		this.set_update_flag();
		this.viewPortScaleX = p;
	};
	Acts.prototype.SetVerticalAlignMode = function (m) {
		if (m !== 4)
			this.set_update_flag();
		this.alignModeY = m;
	};
	Acts.prototype.SetVerticalPosition = function (p) {
		this.set_update_flag();
		this.viewPortScaleY = p;
	};

	function Exps() {
	};
	behaviorProto.exps = new Exps();
}());

cr.behaviors.scrollto = function(runtime)
{
	this.runtime = runtime;
	this.shakeMag = 0;
	this.shakeStart = 0;
	this.shakeEnd = 0;
	this.shakeMode = 0;
};
(function () {
	var behaviorProto = cr.behaviors.scrollto.prototype;
	behaviorProto.Type = function (behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function () {
	};
	behaviorProto.Instance = function (type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function () {
		this.enabled = (this.properties[0] !== 0);
	};
	behinstProto.saveToJSON = function () {
		return {
			"smg": this.behavior.shakeMag,
			"ss": this.behavior.shakeStart,
			"se": this.behavior.shakeEnd,
			"smd": this.behavior.shakeMode
		};
	};
	behinstProto.loadFromJSON = function (o) {
		this.behavior.shakeMag = o["smg"];
		this.behavior.shakeStart = o["ss"];
		this.behavior.shakeEnd = o["se"];
		this.behavior.shakeMode = o["smd"];
	};
	behinstProto.tick = function () {
	};

	function getScrollToBehavior(inst) {
		var i, len, binst;
		for (i = 0, len = inst.behavior_insts.length; i < len; ++i) {
			binst = inst.behavior_insts[i];
			if (binst.behavior instanceof cr.behaviors.scrollto)
				return binst;
		}
		return null;
	};
	behinstProto.tick2 = function () {
		if (!this.enabled)
			return;
		var all = this.behavior.my_instances.valuesRef();
		var sumx = 0, sumy = 0;
		var i, len, binst, count = 0;
		for (i = 0, len = all.length; i < len; i++) {
			binst = getScrollToBehavior(all[i]);
			if (!binst || !binst.enabled)
				continue;
			sumx += all[i].x;
			sumy += all[i].y;
			++count;
		}
		var layout = this.inst.layer.layout;
		var now = this.runtime.kahanTime.sum;
		var offx = 0, offy = 0;
		if (now >= this.behavior.shakeStart && now < this.behavior.shakeEnd) {
			var mag = this.behavior.shakeMag * Math.min(this.runtime.timescale, 1);
			if (this.behavior.shakeMode === 0)
				mag *= 1 - (now - this.behavior.shakeStart) / (this.behavior.shakeEnd - this.behavior.shakeStart);
			var a = Math.random() * Math.PI * 2;
			var d = Math.random() * mag;
			offx = Math.cos(a) * d;
			offy = Math.sin(a) * d;
		}
		layout.scrollToX(sumx / count + offx);
		layout.scrollToY(sumy / count + offy);
	};

	function Acts() {
	};
	Acts.prototype.Shake = function (mag, dur, mode) {
		this.behavior.shakeMag = mag;
		this.behavior.shakeStart = this.runtime.kahanTime.sum;
		this.behavior.shakeEnd = this.behavior.shakeStart + dur;
		this.behavior.shakeMode = mode;
	};
	Acts.prototype.SetEnabled = function (e) {
		this.enabled = (e !== 0);
	};
	behaviorProto.acts = new Acts();
}());
cr.getObjectRefTable = function () {
	return [
		cr.plugins_.AJAX,
		cr.plugins_.Arr,
		cr.plugins_.Audio,
		cr.plugins_.Dictionary,
		cr.plugins_.Browser,
		cr.plugins_.Function,
		cr.plugins_.Keyboard,
		cr.plugins_.LocalStorage,
		cr.plugins_.vooxe,
		cr.plugins_.MM_Preloader,
		cr.plugins_.Particles,
		cr.plugins_.Rex_Date,
		cr.plugins_.Rex_Hash,
		cr.plugins_.Touch,
		cr.plugins_.Sprite,
		cr.plugins_.Text,
		cr.plugins_.TiledBg,
		cr.plugins_.Rex_ZSorter,
		cr.plugins_.TextBox,
		cr.behaviors.lunarray_Tween,
		cr.behaviors.Pin,
		cr.behaviors.Fade,
		cr.behaviors.Sin,
		cr.behaviors.Timer,
		cr.behaviors.Rex_MoveTo,
		cr.behaviors.scrollto,
		cr.behaviors.LOS,
		cr.behaviors.Bullet,
		cr.behaviors.Rex_RotateTo,
		cr.behaviors.rex_Anchor2,
		cr.system_object.prototype.cnds.OnLayoutStart,
		cr.plugins_.Audio.prototype.cnds.IsTagPlaying,
		cr.system_object.prototype.acts.SetVar,
		cr.system_object.prototype.acts.SetLayerVisible,
		cr.plugins_.Function.prototype.acts.CallFunction,
		cr.system_object.prototype.cnds.CompareVar,
		cr.system_object.prototype.cnds.For,
		cr.system_object.prototype.exps.loopindex,
		cr.system_object.prototype.cnds.Every,
		cr.system_object.prototype.cnds.Compare,
		cr.plugins_.Arr.prototype.exps.Width,
		cr.system_object.prototype.acts.AddVar,
		cr.system_object.prototype.cnds.EveryTick,
		cr.plugins_.Rex_ZSorter.prototype.acts.SortObjsLayerByY,
		cr.plugins_.Sprite.prototype.exps.Angle,
		cr.system_object.prototype.acts.SetLayerScale,
		cr.system_object.prototype.acts.SetLayerAngle,
		cr.system_object.prototype.cnds.PickOverlappingPoint,
		cr.plugins_.Sprite.prototype.exps.X,
		cr.plugins_.Sprite.prototype.exps.Y,
		cr.system_object.prototype.exps["int"],
		cr.system_object.prototype.cnds.PickAll,
		cr.system_object.prototype.cnds.PickByComparison,
		cr.system_object.prototype.cnds.TriggerOnce,
		cr.system_object.prototype.acts.CreateObject,
		cr.plugins_.Sprite.prototype.acts.SetAnimFrame,
		cr.behaviors.Rex_RotateTo.prototype.acts.SetTargetAngle,
		cr.system_object.prototype.acts.SetGroupActive,
		cr.plugins_.Sprite.prototype.cnds.CompareY,
		cr.plugins_.Sprite.prototype.acts.Destroy,
		cr.plugins_.Function.prototype.cnds.OnFunction,
		cr.plugins_.Function.prototype.cnds.CompareParam,
		cr.plugins_.Arr.prototype.exps.At,
		cr.plugins_.Sprite.prototype.acts.SetSize,
		cr.plugins_.Sprite.prototype.acts.SetVisible,
		cr.plugins_.Audio.prototype.acts.PlayByName,
		cr.system_object.prototype.acts.Wait,
		cr.behaviors.Pin.prototype.acts.Pin,
		cr.system_object.prototype.cnds.Else,
		cr.plugins_.Function.prototype.exps.Param,
		cr.plugins_.Sprite.prototype.acts.SetInstanceVar,
		cr.plugins_.Sprite.prototype.acts.SetScale,
		cr.system_object.prototype.exps.random,
		cr.system_object.prototype.cnds.CompareBetween,
		cr.system_object.prototype.exps.choose,
		cr.plugins_.Sprite.prototype.acts.SetAnim,
		cr.behaviors.lunarray_Tween.prototype.acts.SetParameter,
		cr.behaviors.Sin.prototype.acts.SetMagnitude,
		cr.behaviors.Sin.prototype.acts.SetPhase,
		cr.behaviors.Sin.prototype.acts.SetMovement,
		cr.plugins_.Sprite.prototype.acts.SetEffect,
		cr.plugins_.Sprite.prototype.acts.SetOpacity,
		cr.behaviors.Fade.prototype.acts.SetWaitTime,
		cr.behaviors.Fade.prototype.acts.SetFadeOutTime,
		cr.behaviors.Sin.prototype.acts.SetActive,
		cr.plugins_.Sprite.prototype.acts.MoveToBottom,
		cr.plugins_.Audio.prototype.exps.CurrentTime,
		cr.system_object.prototype.exps.layoutwidth,
		cr.system_object.prototype.exps.layoutheight,
		cr.plugins_.Text.prototype.acts.SetText,
		cr.system_object.prototype.exps.cpuutilisation,
		cr.system_object.prototype.exps.fps,
		cr.plugins_.Audio.prototype.exps.Duration,
		cr.system_object.prototype.cnds.IsMobile,
		cr.plugins_.TiledBg.prototype.acts.SetSize,
		cr.plugins_.Browser.prototype.exps.ScreenWidth,
		cr.plugins_.Browser.prototype.exps.ScreenHeight,
		cr.plugins_.Keyboard.prototype.cnds.OnKey,
		cr.plugins_.Arr.prototype.acts.JSONDownload,
		cr.plugins_.Arr.prototype.acts.Push,
		cr.plugins_.Arr.prototype.acts.SetXY,
		cr.plugins_.Touch.prototype.cnds.OnTouchStart,
		cr.system_object.prototype.cnds.IsGroupActive,
		cr.plugins_.Touch.prototype.cnds.OnTapGesture,
		cr.behaviors.Rex_MoveTo.prototype.acts.SetTargetPosByDeltaXY,
		cr.behaviors.Rex_MoveTo.prototype.acts.SetMaxSpeed,
		cr.behaviors.Rex_MoveTo.prototype.cnds.OnHitTarget,
		cr.plugins_.Audio.prototype.acts.SetPaused,
		cr.behaviors.Bullet.prototype.acts.SetEnabled,
		cr.behaviors.Bullet.prototype.acts.SetAngleOfMotion,
		cr.behaviors.Bullet.prototype.acts.SetSpeed,
		cr.behaviors.scrollto.prototype.acts.Shake,
		cr.plugins_.Sprite.prototype.cnds.IsOverlapping,
		cr.plugins_.Sprite.prototype.cnds.IsOverlappingOffset,
		cr.behaviors.LOS.prototype.cnds.HasLOSToObject,
		cr.plugins_.Sprite.prototype.cnds.CompareInstanceVar,
		cr.plugins_.Sprite.prototype.cnds.IsBoolInstanceVarSet,
		cr.plugins_.Sprite.prototype.exps.AnimationFrame,
		cr.plugins_.Sprite.prototype.acts.AddInstanceVar,
		cr.plugins_.Sprite.prototype.acts.SetBoolInstanceVar,
		cr.behaviors.Timer.prototype.acts.StartTimer,
		cr.behaviors.lunarray_Tween.prototype.acts.Start,
		cr.behaviors.Fade.prototype.acts.StartFade,
		cr.behaviors.Timer.prototype.cnds.OnTimer,
		cr.plugins_.Sprite.prototype.cnds.OnCollision,
		cr.plugins_.Sprite.prototype.acts.MoveToLayer,
		cr.plugins_.Sprite.prototype.acts.Spawn,
		cr.plugins_.Audio.prototype.acts.Play,
		cr.plugins_.Sprite.prototype.cnds.IsAnimPlaying,
		cr.plugins_.Text.prototype.cnds.CompareInstanceVar,
		cr.plugins_.Text.prototype.acts.SetVisible,
		cr.plugins_.Touch.prototype.cnds.OnTouchObject,
		cr.system_object.prototype.cnds.LayerVisible,
		cr.plugins_.Sprite.prototype.cnds.IsVisible,
		cr.plugins_.Text.prototype.acts.SetFontSize,
		cr.system_object.prototype.acts.RestartLayout,
		cr.plugins_.AJAX.prototype.acts.RequestFile,
		cr.plugins_.AJAX.prototype.cnds.OnComplete,
		cr.plugins_.Arr.prototype.acts.JSONLoad,
		cr.plugins_.AJAX.prototype.exps.LastData,
		cr.plugins_.Arr.prototype.acts.Reverse,
		cr.system_object.prototype.acts.GoToLayout,
		cr.system_object.prototype.exps.originalwindowheight,
		cr.system_object.prototype.exps.originalwindowwidth,
		cr.plugins_.MM_Preloader.prototype.acts.AddFromLayoutByName,
		cr.plugins_.MM_Preloader.prototype.acts.AddC2EngineProgress,
		cr.plugins_.MM_Preloader.prototype.acts.StabilizerSetState,
		cr.plugins_.MM_Preloader.prototype.acts.Start,
		cr.plugins_.Audio.prototype.acts.PreloadByName,
		cr.plugins_.Audio.prototype.cnds.PreloadsComplete,
		cr.plugins_.MM_Preloader.prototype.acts.SetItemState,
		cr.plugins_.MM_Preloader.prototype.cnds.OnProgress,
		cr.plugins_.MM_Preloader.prototype.exps.Progress,
		cr.system_object.prototype.exps.floor,
		cr.behaviors.Rex_MoveTo.prototype.acts.SetTargetPosOnObject,
		cr.plugins_.MM_Preloader.prototype.cnds.OnCompleted,
		cr.system_object.prototype.acts.GoToLayoutByName,
		cr.plugins_.Browser.prototype.cnds.OnResize,
		cr.system_object.prototype.exps.tokenat,
		cr.plugins_.Browser.prototype.exps.Domain,
		cr.plugins_.Browser.prototype.exps.URL,
		cr.plugins_.Rex_Date.prototype.exps.UnixTimestamp,
		cr.plugins_.Rex_Date.prototype.exps.Date2UnixTimestamp,
		cr.system_object.prototype.exps.viewportright,
		cr.system_object.prototype.exps.viewportleft,
		cr.system_object.prototype.exps.viewportbottom,
		cr.system_object.prototype.exps.viewporttop,
		cr.plugins_.Browser.prototype.acts.ExecJs
	]
}

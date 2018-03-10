(function () {
	cr.plugins_.TiledBg = function(runtime)
	{
		this.runtime = runtime;
	};
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
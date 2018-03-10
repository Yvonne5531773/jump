(function () {
	cr.plugins_.Particles = function(runtime) {
		this.runtime = runtime;
	}
	var pluginProto = cr.plugins_.Particles.prototype;
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
		this.webGL_texture = null;
		this.runtime.waitForImageLoad(this.texture_img, this.texture_file);
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

	function Particle(owner) {
		this.owner = owner;
		this.active = false;
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.angle = 0;
		this.opacity = 1;
		this.grow = 0;
		this.size = 0;
		this.gs = 0;			// gravity speed
		this.age = 0;
		cr.seal(this);
	};
	Particle.prototype.init = function () {
		var owner = this.owner;
		this.x = owner.x - (owner.xrandom / 2) + (Math.random() * owner.xrandom);
		this.y = owner.y - (owner.yrandom / 2) + (Math.random() * owner.yrandom);
		this.speed = owner.initspeed - (owner.speedrandom / 2) + (Math.random() * owner.speedrandom);
		this.angle = owner.angle - (owner.spraycone / 2) + (Math.random() * owner.spraycone);
		this.opacity = owner.initopacity;
		this.size = owner.initsize - (owner.sizerandom / 2) + (Math.random() * owner.sizerandom);
		this.grow = owner.growrate - (owner.growrandom / 2) + (Math.random() * owner.growrandom);
		this.gs = 0;
		this.age = 0;
	};
	Particle.prototype.tick = function (dt) {
		var owner = this.owner;
		this.x += Math.cos(this.angle) * this.speed * dt;
		this.y += Math.sin(this.angle) * this.speed * dt;
		this.y += this.gs * dt;
		this.speed += owner.acc * dt;
		this.size += this.grow * dt;
		this.gs += owner.g * dt;
		this.age += dt;
		if (this.size < 1) {
			this.active = false;
			return;
		}
		if (owner.lifeanglerandom !== 0)
			this.angle += (Math.random() * owner.lifeanglerandom * dt) - (owner.lifeanglerandom * dt / 2);
		if (owner.lifespeedrandom !== 0)
			this.speed += (Math.random() * owner.lifespeedrandom * dt) - (owner.lifespeedrandom * dt / 2);
		if (owner.lifeopacityrandom !== 0) {
			this.opacity += (Math.random() * owner.lifeopacityrandom * dt) - (owner.lifeopacityrandom * dt / 2);
			if (this.opacity < 0)
				this.opacity = 0;
			else if (this.opacity > 1)
				this.opacity = 1;
		}
		if (owner.destroymode <= 1 && this.age >= owner.timeout) {
			this.active = false;
		}
		if (owner.destroymode === 2 && this.speed <= 0) {
			this.active = false;
		}
	};
	Particle.prototype.draw = function (ctx) {
		var curopacity = this.owner.opacity * this.opacity;
		if (curopacity === 0)
			return;
		if (this.owner.destroymode === 0)
			curopacity *= 1 - (this.age / this.owner.timeout);
		ctx.globalAlpha = curopacity;
		var drawx = this.x - this.size / 2;
		var drawy = this.y - this.size / 2;
		if (this.owner.runtime.pixel_rounding) {
			drawx = (drawx + 0.5) | 0;
			drawy = (drawy + 0.5) | 0;
		}
		ctx.drawImage(this.owner.type.texture_img, drawx, drawy, this.size, this.size);
	};
	Particle.prototype.drawGL = function (glw) {
		var curopacity = this.owner.opacity * this.opacity;
		if (this.owner.destroymode === 0)
			curopacity *= 1 - (this.age / this.owner.timeout);
		var drawsize = this.size;
		var scaleddrawsize = drawsize * this.owner.particlescale;
		var drawx = this.x - drawsize / 2;
		var drawy = this.y - drawsize / 2;
		if (this.owner.runtime.pixel_rounding) {
			drawx = (drawx + 0.5) | 0;
			drawy = (drawy + 0.5) | 0;
		}
		if (scaleddrawsize < 1 || curopacity === 0)
			return;
		if (scaleddrawsize < glw.minPointSize || scaleddrawsize > glw.maxPointSize) {
			glw.setOpacity(curopacity);
			glw.quad(drawx, drawy, drawx + drawsize, drawy, drawx + drawsize, drawy + drawsize, drawx, drawy + drawsize);
		}
		else
			glw.point(this.x, this.y, scaleddrawsize, curopacity);
	};
	Particle.prototype.left = function () {
		return this.x - this.size / 2;
	};
	Particle.prototype.right = function () {
		return this.x + this.size / 2;
	};
	Particle.prototype.top = function () {
		return this.y - this.size / 2;
	};
	Particle.prototype.bottom = function () {
		return this.y + this.size / 2;
	};
	pluginProto.Instance = function (type) {
		this.type = type;
		this.runtime = type.runtime;
	};
	var instanceProto = pluginProto.Instance.prototype;
	var deadparticles = [];
	instanceProto.onCreate = function () {
		var props = this.properties;
		this.rate = props[0];
		this.spraycone = cr.to_radians(props[1]);
		this.spraytype = props[2];			// 0 = continuous, 1 = one-shot
		this.spraying = true;				// for continuous mode only
		this.initspeed = props[3];
		this.initsize = props[4];
		this.initopacity = props[5] / 100.0;
		this.growrate = props[6];
		this.xrandom = props[7];
		this.yrandom = props[8];
		this.speedrandom = props[9];
		this.sizerandom = props[10];
		this.growrandom = props[11];
		this.acc = props[12];
		this.g = props[13];
		this.lifeanglerandom = props[14];
		this.lifespeedrandom = props[15];
		this.lifeopacityrandom = props[16];
		this.destroymode = props[17];		// 0 = fade, 1 = timeout, 2 = stopped
		this.timeout = props[18];
		this.particleCreateCounter = 0;
		this.particlescale = 1;
		this.particleBoxLeft = this.x;
		this.particleBoxTop = this.y;
		this.particleBoxRight = this.x;
		this.particleBoxBottom = this.y;
		this.add_bbox_changed_callback(function (self) {
			self.bbox.set(self.particleBoxLeft, self.particleBoxTop, self.particleBoxRight, self.particleBoxBottom);
			self.bquad.set_from_rect(self.bbox);
			self.bbox_changed = false;
			self.update_collision_cell();
			self.update_render_cell();
		});
		if (!this.recycled)
			this.particles = [];
		this.runtime.tickMe(this);
		this.type.loadTextures();
		if (this.spraytype === 1) {
			for (var i = 0; i < this.rate; i++)
				this.allocateParticle().opacity = 0;
		}
		this.first_tick = true;		// for re-init'ing one-shot particles on first tick so they assume any new angle/position
	};
	instanceProto.saveToJSON = function () {
		var o = {
			"r": this.rate,
			"sc": this.spraycone,
			"st": this.spraytype,
			"s": this.spraying,
			"isp": this.initspeed,
			"isz": this.initsize,
			"io": this.initopacity,
			"gr": this.growrate,
			"xr": this.xrandom,
			"yr": this.yrandom,
			"spr": this.speedrandom,
			"szr": this.sizerandom,
			"grnd": this.growrandom,
			"acc": this.acc,
			"g": this.g,
			"lar": this.lifeanglerandom,
			"lsr": this.lifespeedrandom,
			"lor": this.lifeopacityrandom,
			"dm": this.destroymode,
			"to": this.timeout,
			"pcc": this.particleCreateCounter,
			"ft": this.first_tick,
			"p": []
		};
		var i, len, p;
		var arr = o["p"];
		for (i = 0, len = this.particles.length; i < len; i++) {
			p = this.particles[i];
			arr.push([p.x, p.y, p.speed, p.angle, p.opacity, p.grow, p.size, p.gs, p.age]);
		}
		return o;
	};
	instanceProto.loadFromJSON = function (o) {
		this.rate = o["r"];
		this.spraycone = o["sc"];
		this.spraytype = o["st"];
		this.spraying = o["s"];
		this.initspeed = o["isp"];
		this.initsize = o["isz"];
		this.initopacity = o["io"];
		this.growrate = o["gr"];
		this.xrandom = o["xr"];
		this.yrandom = o["yr"];
		this.speedrandom = o["spr"];
		this.sizerandom = o["szr"];
		this.growrandom = o["grnd"];
		this.acc = o["acc"];
		this.g = o["g"];
		this.lifeanglerandom = o["lar"];
		this.lifespeedrandom = o["lsr"];
		this.lifeopacityrandom = o["lor"];
		this.destroymode = o["dm"];
		this.timeout = o["to"];
		this.particleCreateCounter = o["pcc"];
		this.first_tick = o["ft"];
		deadparticles.push.apply(deadparticles, this.particles);
		cr.clearArray(this.particles);
		var i, len, p, d;
		var arr = o["p"];
		for (i = 0, len = arr.length; i < len; i++) {
			p = this.allocateParticle();
			d = arr[i];
			p.x = d[0];
			p.y = d[1];
			p.speed = d[2];
			p.angle = d[3];
			p.opacity = d[4];
			p.grow = d[5];
			p.size = d[6];
			p.gs = d[7];
			p.age = d[8];
		}
	};
	instanceProto.onDestroy = function () {
		deadparticles.push.apply(deadparticles, this.particles);
		cr.clearArray(this.particles);
	};
	instanceProto.allocateParticle = function () {
		var p;
		if (deadparticles.length) {
			p = deadparticles.pop();
			p.owner = this;
		}
		else
			p = new Particle(this);
		this.particles.push(p);
		p.active = true;
		return p;
	};
	instanceProto.tick = function () {
		var dt = this.runtime.getDt(this);
		var i, len, p, n, j;
		if (this.spraytype === 0 && this.spraying) {
			this.particleCreateCounter += dt * this.rate;
			n = cr.floor(this.particleCreateCounter);
			this.particleCreateCounter -= n;
			for (i = 0; i < n; i++) {
				p = this.allocateParticle();
				p.init();
			}
		}
		this.particleBoxLeft = this.x;
		this.particleBoxTop = this.y;
		this.particleBoxRight = this.x;
		this.particleBoxBottom = this.y;
		for (i = 0, j = 0, len = this.particles.length; i < len; i++) {
			p = this.particles[i];
			this.particles[j] = p;
			this.runtime.redraw = true;
			if (this.spraytype === 1 && this.first_tick)
				p.init();
			p.tick(dt);
			if (!p.active) {
				deadparticles.push(p);
				continue;
			}
			if (p.left() < this.particleBoxLeft)
				this.particleBoxLeft = p.left();
			if (p.right() > this.particleBoxRight)
				this.particleBoxRight = p.right();
			if (p.top() < this.particleBoxTop)
				this.particleBoxTop = p.top();
			if (p.bottom() > this.particleBoxBottom)
				this.particleBoxBottom = p.bottom();
			j++;
		}
		cr.truncateArray(this.particles, j);
		this.set_bbox_changed();
		this.first_tick = false;
		if (this.spraytype === 1 && this.particles.length === 0)
			this.runtime.DestroyInstance(this);
	};
	instanceProto.draw = function (ctx) {
		var i, len, p, layer = this.layer;
		for (i = 0, len = this.particles.length; i < len; i++) {
			p = this.particles[i];
			if (p.right() >= layer.viewLeft && p.bottom() >= layer.viewTop && p.left() <= layer.viewRight && p.top() <= layer.viewBottom) {
				p.draw(ctx);
			}
		}
	};
	instanceProto.drawGL = function (glw) {
		this.particlescale = this.layer.getScale();
		glw.setTexture(this.type.webGL_texture);
		var i, len, p, layer = this.layer;
		for (i = 0, len = this.particles.length; i < len; i++) {
			p = this.particles[i];
			if (p.right() >= layer.viewLeft && p.bottom() >= layer.viewTop && p.left() <= layer.viewRight && p.top() <= layer.viewBottom) {
				p.drawGL(glw);
			}
		}
	};

	function Cnds() {
	};
	Cnds.prototype.IsSpraying = function () {
		return this.spraying;
	};
	pluginProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.SetSpraying = function (set_) {
		this.spraying = (set_ !== 0);
	};
	Acts.prototype.SetEffect = function (effect) {
		this.blend_mode = effect;
		this.compositeOp = cr.effectToCompositeOp(effect);
		cr.setGLBlend(this, effect, this.runtime.gl);
		this.runtime.redraw = true;
	};
	Acts.prototype.SetRate = function (x) {
		this.rate = x;
		var diff, i;
		if (this.spraytype === 1 && this.first_tick) {
			if (x < this.particles.length) {
				diff = this.particles.length - x;
				for (i = 0; i < diff; i++)
					deadparticles.push(this.particles.pop());
			}
			else if (x > this.particles.length) {
				diff = x - this.particles.length;
				for (i = 0; i < diff; i++)
					this.allocateParticle().opacity = 0;
			}
		}
	};
	Acts.prototype.SetSprayCone = function (x) {
		this.spraycone = cr.to_radians(x);
	};
	Acts.prototype.SetInitSpeed = function (x) {
		this.initspeed = x;
	};
	Acts.prototype.SetInitSize = function (x) {
		this.initsize = x;
	};
	Acts.prototype.SetInitOpacity = function (x) {
		this.initopacity = x / 100;
	};
	Acts.prototype.SetGrowRate = function (x) {
		this.growrate = x;
	};
	Acts.prototype.SetXRandomiser = function (x) {
		this.xrandom = x;
	};
	Acts.prototype.SetYRandomiser = function (x) {
		this.yrandom = x;
	};
	Acts.prototype.SetSpeedRandomiser = function (x) {
		this.speedrandom = x;
	};
	Acts.prototype.SetSizeRandomiser = function (x) {
		this.sizerandom = x;
	};
	Acts.prototype.SetGrowRateRandomiser = function (x) {
		this.growrandom = x;
	};
	Acts.prototype.SetParticleAcc = function (x) {
		this.acc = x;
	};
	Acts.prototype.SetGravity = function (x) {
		this.g = x;
	};
	Acts.prototype.SetAngleRandomiser = function (x) {
		this.lifeanglerandom = x;
	};
	Acts.prototype.SetLifeSpeedRandomiser = function (x) {
		this.lifespeedrandom = x;
	};
	Acts.prototype.SetOpacityRandomiser = function (x) {
		this.lifeopacityrandom = x;
	};
	Acts.prototype.SetTimeout = function (x) {
		this.timeout = x;
	};
	pluginProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.ParticleCount = function (ret) {
		ret.set_int(this.particles.length);
	};
	Exps.prototype.Rate = function (ret) {
		ret.set_float(this.rate);
	};
	Exps.prototype.SprayCone = function (ret) {
		ret.set_float(cr.to_degrees(this.spraycone));
	};
	Exps.prototype.InitSpeed = function (ret) {
		ret.set_float(this.initspeed);
	};
	Exps.prototype.InitSize = function (ret) {
		ret.set_float(this.initsize);
	};
	Exps.prototype.InitOpacity = function (ret) {
		ret.set_float(this.initopacity * 100);
	};
	Exps.prototype.InitGrowRate = function (ret) {
		ret.set_float(this.growrate);
	};
	Exps.prototype.XRandom = function (ret) {
		ret.set_float(this.xrandom);
	};
	Exps.prototype.YRandom = function (ret) {
		ret.set_float(this.yrandom);
	};
	Exps.prototype.InitSpeedRandom = function (ret) {
		ret.set_float(this.speedrandom);
	};
	Exps.prototype.InitSizeRandom = function (ret) {
		ret.set_float(this.sizerandom);
	};
	Exps.prototype.InitGrowRandom = function (ret) {
		ret.set_float(this.growrandom);
	};
	Exps.prototype.ParticleAcceleration = function (ret) {
		ret.set_float(this.acc);
	};
	Exps.prototype.Gravity = function (ret) {
		ret.set_float(this.g);
	};
	Exps.prototype.ParticleAngleRandom = function (ret) {
		ret.set_float(this.lifeanglerandom);
	};
	Exps.prototype.ParticleSpeedRandom = function (ret) {
		ret.set_float(this.lifespeedrandom);
	};
	Exps.prototype.ParticleOpacityRandom = function (ret) {
		ret.set_float(this.lifeopacityrandom);
	};
	Exps.prototype.Timeout = function (ret) {
		ret.set_float(this.timeout);
	};
	pluginProto.exps = new Exps();
}());
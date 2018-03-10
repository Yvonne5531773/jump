(function() {
	var MAX_VERTICES = 8000;						// equates to 2500 objects being drawn
	var MAX_INDICES = (MAX_VERTICES / 2) * 3;		// 6 indices for every 4 vertices
	var MAX_POINTS = 8000;
	var MULTI_BUFFERS = 4;							// cycle 4 buffers to try and avoid blocking
	var BATCH_NULL = 0;
	var BATCH_QUAD = 1;
	var BATCH_SETTEXTURE = 2;
	var BATCH_SETOPACITY = 3;
	var BATCH_SETBLEND = 4;
	var BATCH_UPDATEMODELVIEW = 5;
	var BATCH_RENDERTOTEXTURE = 6;
	var BATCH_CLEAR = 7;
	var BATCH_POINTS = 8;
	var BATCH_SETPROGRAM = 9;
	var BATCH_SETPROGRAMPARAMETERS = 10;
	var BATCH_SETTEXTURE1 = 11;
	var BATCH_SETCOLOR = 12;
	var BATCH_SETDEPTHTEST = 13;
	var BATCH_SETEARLYZMODE = 14;
	var tempMat4 = mat4.create();

	function GLWrap_(gl, isMobile, enableFrontToBack) {
		this.isIE = /msie/i.test(navigator.userAgent) || /trident/i.test(navigator.userAgent);
		this.width = 0;		// not yet known, wait for call to setSize()
		this.height = 0;
		this.enableFrontToBack = !!enableFrontToBack;
		this.isEarlyZPass = false;
		this.isBatchInEarlyZPass = false;
		this.currentZ = 0;
		this.zNear = 1;
		this.zFar = 1000;
		this.zIncrement = ((this.zFar - this.zNear) / 32768);
		this.zA = this.zFar / (this.zFar - this.zNear);
		this.zB = this.zFar * this.zNear / (this.zNear - this.zFar);
		this.kzA = 65536 * this.zA;
		this.kzB = 65536 * this.zB;
		this.cam = vec3.create([0, 0, 100]);			// camera position
		this.look = vec3.create([0, 0, 0]);				// lookat position
		this.up = vec3.create([0, 1, 0]);				// up vector
		this.worldScale = vec3.create([1, 1, 1]);		// world scaling factor
		this.enable_mipmaps = true;
		this.matP = mat4.create();						// perspective matrix
		this.matMV = mat4.create();						// model view matrix
		this.lastMV = mat4.create();
		this.currentMV = mat4.create();
		this.gl = gl;
		this.version = (this.gl.getParameter(this.gl.VERSION).indexOf("WebGL 2") === 0 ? 2 : 1);
		this.initState();
	};
	GLWrap_.prototype.initState = function () {
		var gl = this.gl;
		var i, len;
		this.lastOpacity = 1;
		this.lastTexture0 = null;			// last bound to TEXTURE0
		this.lastTexture1 = null;			// last bound to TEXTURE1
		this.currentOpacity = 1;
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
		gl.disable(gl.CULL_FACE);
		gl.disable(gl.STENCIL_TEST);
		gl.disable(gl.DITHER);
		if (this.enableFrontToBack) {
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);
		}
		else {
			gl.disable(gl.DEPTH_TEST);
		}
		this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
		this.lastSrcBlend = gl.ONE;
		this.lastDestBlend = gl.ONE_MINUS_SRC_ALPHA;
		this.vertexData = new Float32Array(MAX_VERTICES * (this.enableFrontToBack ? 3 : 2));
		this.texcoordData = new Float32Array(MAX_VERTICES * 2);
		this.pointData = new Float32Array(MAX_POINTS * 4);
		this.pointBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.pointData.byteLength, gl.DYNAMIC_DRAW);
		this.vertexBuffers = new Array(MULTI_BUFFERS);
		this.texcoordBuffers = new Array(MULTI_BUFFERS);
		for (i = 0; i < MULTI_BUFFERS; i++) {
			this.vertexBuffers[i] = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[i]);
			gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.byteLength, gl.DYNAMIC_DRAW);
			this.texcoordBuffers[i] = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffers[i]);
			gl.bufferData(gl.ARRAY_BUFFER, this.texcoordData.byteLength, gl.DYNAMIC_DRAW);
		}
		this.curBuffer = 0;
		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		var indexData = new Uint16Array(MAX_INDICES);
		i = 0, len = MAX_INDICES;
		var fv = 0;
		while (i < len) {
			indexData[i++] = fv;		// top left
			indexData[i++] = fv + 1;	// top right
			indexData[i++] = fv + 2;	// bottom right (first tri)
			indexData[i++] = fv;		// top left
			indexData[i++] = fv + 2;	// bottom right
			indexData[i++] = fv + 3;	// bottom left
			fv += 4;
		}
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);
		this.vertexPtr = 0;
		this.texPtr = 0;
		this.pointPtr = 0;
		var fsSource, vsSource;
		this.shaderPrograms = [];
		fsSource = [
			"varying mediump vec2 vTex;",
			"uniform lowp float opacity;",
			"uniform lowp sampler2D samplerFront;",
			"void main(void) {",
			"	gl_FragColor = texture2D(samplerFront, vTex);",
			"	gl_FragColor *= opacity;",
			"}"
		].join("\n");
		if (this.enableFrontToBack) {
			vsSource = [
				"attribute highp vec3 aPos;",
				"attribute mediump vec2 aTex;",
				"varying mediump vec2 vTex;",
				"uniform highp mat4 matP;",
				"uniform highp mat4 matMV;",
				"void main(void) {",
				"	gl_Position = matP * matMV * vec4(aPos.x, aPos.y, aPos.z, 1.0);",
				"	vTex = aTex;",
				"}"
			].join("\n");
		}
		else {
			vsSource = [
				"attribute highp vec2 aPos;",
				"attribute mediump vec2 aTex;",
				"varying mediump vec2 vTex;",
				"uniform highp mat4 matP;",
				"uniform highp mat4 matMV;",
				"void main(void) {",
				"	gl_Position = matP * matMV * vec4(aPos.x, aPos.y, 0.0, 1.0);",
				"	vTex = aTex;",
				"}"
			].join("\n");
		}
		var shaderProg = this.createShaderProgram({src: fsSource}, vsSource, "<default>");
		;
		this.shaderPrograms.push(shaderProg);		// Default shader is always shader 0
		fsSource = [
			"uniform mediump sampler2D samplerFront;",
			"varying lowp float opacity;",
			"void main(void) {",
			"	gl_FragColor = texture2D(samplerFront, gl_PointCoord);",
			"	gl_FragColor *= opacity;",
			"}"
		].join("\n");
		var pointVsSource = [
			"attribute vec4 aPos;",
			"varying float opacity;",
			"uniform mat4 matP;",
			"uniform mat4 matMV;",
			"void main(void) {",
			"	gl_Position = matP * matMV * vec4(aPos.x, aPos.y, 0.0, 1.0);",
			"	gl_PointSize = aPos.z;",
			"	opacity = aPos.w;",
			"}"
		].join("\n");
		shaderProg = this.createShaderProgram({src: fsSource}, pointVsSource, "<point>");
		;
		this.shaderPrograms.push(shaderProg);		// Point shader is always shader 1
		fsSource = [
			"varying mediump vec2 vTex;",
			"uniform lowp sampler2D samplerFront;",
			"void main(void) {",
			"	if (texture2D(samplerFront, vTex).a < 1.0)",
			"		discard;",						// discarding non-opaque fragments
			"}"
		].join("\n");
		var shaderProg = this.createShaderProgram({src: fsSource}, vsSource, "<earlyz>");
		;
		this.shaderPrograms.push(shaderProg);		// Early-Z shader is always shader 2
		fsSource = [
			"uniform lowp vec4 colorFill;",
			"void main(void) {",
			"	gl_FragColor = colorFill;",
			"}"
		].join("\n");
		var shaderProg = this.createShaderProgram({src: fsSource}, vsSource, "<fill>");
		;
		this.shaderPrograms.push(shaderProg);		// Fill-color shader is always shader 3
		for (var shader_name in cr.shaders) {
			if (cr.shaders.hasOwnProperty(shader_name))
				this.shaderPrograms.push(this.createShaderProgram(cr.shaders[shader_name], vsSource, shader_name));
		}
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.batch = [];
		this.batchPtr = 0;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
		this.lastProgram = -1;				// start -1 so first switchProgram can do work
		this.currentProgram = -1;			// current program during batch execution
		this.currentShader = null;
		this.fbo = gl.createFramebuffer();
		this.renderToTex = null;
		this.depthBuffer = null;
		this.attachedDepthBuffer = false;	// wait until first size call to attach, otherwise it has no storage
		if (this.enableFrontToBack) {
			this.depthBuffer = gl.createRenderbuffer();
		}
		this.tmpVec3 = vec3.create([0, 0, 0]);
		;
		var pointsizes = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
		this.minPointSize = pointsizes[0];
		this.maxPointSize = pointsizes[1];
		if (this.maxPointSize > 2048)
			this.maxPointSize = 2048;
		;
		this.switchProgram(0);
		cr.seal(this);
	};

	function GLShaderProgram(gl, shaderProgram, name) {
		this.gl = gl;
		this.shaderProgram = shaderProgram;
		this.name = name;
		this.locAPos = gl.getAttribLocation(shaderProgram, "aPos");
		this.locATex = gl.getAttribLocation(shaderProgram, "aTex");
		this.locMatP = gl.getUniformLocation(shaderProgram, "matP");
		this.locMatMV = gl.getUniformLocation(shaderProgram, "matMV");
		this.locOpacity = gl.getUniformLocation(shaderProgram, "opacity");
		this.locColorFill = gl.getUniformLocation(shaderProgram, "colorFill");
		this.locSamplerFront = gl.getUniformLocation(shaderProgram, "samplerFront");
		this.locSamplerBack = gl.getUniformLocation(shaderProgram, "samplerBack");
		this.locDestStart = gl.getUniformLocation(shaderProgram, "destStart");
		this.locDestEnd = gl.getUniformLocation(shaderProgram, "destEnd");
		this.locSeconds = gl.getUniformLocation(shaderProgram, "seconds");
		this.locPixelWidth = gl.getUniformLocation(shaderProgram, "pixelWidth");
		this.locPixelHeight = gl.getUniformLocation(shaderProgram, "pixelHeight");
		this.locLayerScale = gl.getUniformLocation(shaderProgram, "layerScale");
		this.locLayerAngle = gl.getUniformLocation(shaderProgram, "layerAngle");
		this.locViewOrigin = gl.getUniformLocation(shaderProgram, "viewOrigin");
		this.locScrollPos = gl.getUniformLocation(shaderProgram, "scrollPos");
		this.hasAnyOptionalUniforms = !!(this.locPixelWidth || this.locPixelHeight || this.locSeconds || this.locSamplerBack || this.locDestStart || this.locDestEnd || this.locLayerScale || this.locLayerAngle || this.locViewOrigin || this.locScrollPos);
		this.lpPixelWidth = -999;		// set to something unlikely so never counts as cached on first set
		this.lpPixelHeight = -999;
		this.lpOpacity = 1;
		this.lpDestStartX = 0.0;
		this.lpDestStartY = 0.0;
		this.lpDestEndX = 1.0;
		this.lpDestEndY = 1.0;
		this.lpLayerScale = 1.0;
		this.lpLayerAngle = 0.0;
		this.lpViewOriginX = 0.0;
		this.lpViewOriginY = 0.0;
		this.lpScrollPosX = 0.0;
		this.lpScrollPosY = 0.0;
		this.lpSeconds = 0.0;
		this.lastCustomParams = [];
		this.lpMatMV = mat4.create();
		if (this.locOpacity)
			gl.uniform1f(this.locOpacity, 1);
		if (this.locColorFill)
			gl.uniform4f(this.locColorFill, 1.0, 1.0, 1.0, 1.0);
		if (this.locSamplerFront)
			gl.uniform1i(this.locSamplerFront, 0);
		if (this.locSamplerBack)
			gl.uniform1i(this.locSamplerBack, 1);
		if (this.locDestStart)
			gl.uniform2f(this.locDestStart, 0.0, 0.0);
		if (this.locDestEnd)
			gl.uniform2f(this.locDestEnd, 1.0, 1.0);
		if (this.locLayerScale)
			gl.uniform1f(this.locLayerScale, 1.0);
		if (this.locLayerAngle)
			gl.uniform1f(this.locLayerAngle, 0.0);
		if (this.locViewOrigin)
			gl.uniform2f(this.locViewOrigin, 0.0, 0.0);
		if (this.locScrollPos)
			gl.uniform2f(this.locScrollPos, 0.0, 0.0);
		if (this.locSeconds)
			gl.uniform1f(this.locSeconds, 0.0);
		this.hasCurrentMatMV = false;		// matMV needs updating
	};

	function areMat4sEqual(a, b) {
		return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] &&
			a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] &&
			a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] &&
			a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
	};
	GLShaderProgram.prototype.updateMatMV = function (mv) {
		if (areMat4sEqual(this.lpMatMV, mv))
			return;		// no change, save the expensive GL call
		mat4.set(mv, this.lpMatMV);
		this.gl.uniformMatrix4fv(this.locMatMV, false, mv);
	};
	GLWrap_.prototype.createShaderProgram = function (shaderEntry, vsSource, name) {
		var gl = this.gl;
		var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShader, shaderEntry.src);
		gl.compileShader(fragmentShader);
		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
			;
			gl.deleteShader(fragmentShader);
			return null;
		}
		var vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, vsSource);
		gl.compileShader(vertexShader);
		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
			;
			gl.deleteShader(fragmentShader);
			gl.deleteShader(vertexShader);
			return null;
		}
		var shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, fragmentShader);
		gl.attachShader(shaderProgram, vertexShader);
		gl.linkProgram(shaderProgram);
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			;
			gl.deleteShader(fragmentShader);
			gl.deleteShader(vertexShader);
			gl.deleteProgram(shaderProgram);
			return null;
		}
		gl.useProgram(shaderProgram);
		gl.deleteShader(fragmentShader);
		gl.deleteShader(vertexShader);
		var ret = new GLShaderProgram(gl, shaderProgram, name);
		ret.extendBoxHorizontal = shaderEntry.extendBoxHorizontal || 0;
		ret.extendBoxVertical = shaderEntry.extendBoxVertical || 0;
		ret.crossSampling = !!shaderEntry.crossSampling;
		ret.preservesOpaqueness = !!shaderEntry.preservesOpaqueness;
		ret.animated = !!shaderEntry.animated;
		ret.parameters = shaderEntry.parameters || [];
		var i, len;
		for (i = 0, len = ret.parameters.length; i < len; i++) {
			ret.parameters[i][1] = gl.getUniformLocation(shaderProgram, ret.parameters[i][0]);
			ret.lastCustomParams.push(0);
			gl.uniform1f(ret.parameters[i][1], 0);
		}
		cr.seal(ret);
		return ret;
	};
	GLWrap_.prototype.getShaderIndex = function (name_) {
		var i, len;
		for (i = 0, len = this.shaderPrograms.length; i < len; i++) {
			if (this.shaderPrograms[i].name === name_)
				return i;
		}
		return -1;
	};
	GLWrap_.prototype.project = function (x, y, out) {
		var mv = this.matMV;
		var proj = this.matP;
		var fTempo = [0, 0, 0, 0, 0, 0, 0, 0];
		fTempo[0] = mv[0] * x + mv[4] * y + mv[12];
		fTempo[1] = mv[1] * x + mv[5] * y + mv[13];
		fTempo[2] = mv[2] * x + mv[6] * y + mv[14];
		fTempo[3] = mv[3] * x + mv[7] * y + mv[15];
		fTempo[4] = proj[0] * fTempo[0] + proj[4] * fTempo[1] + proj[8] * fTempo[2] + proj[12] * fTempo[3];
		fTempo[5] = proj[1] * fTempo[0] + proj[5] * fTempo[1] + proj[9] * fTempo[2] + proj[13] * fTempo[3];
		fTempo[6] = proj[2] * fTempo[0] + proj[6] * fTempo[1] + proj[10] * fTempo[2] + proj[14] * fTempo[3];
		fTempo[7] = -fTempo[2];
		if (fTempo[7] === 0.0)	//The w value
			return;
		fTempo[7] = 1.0 / fTempo[7];
		fTempo[4] *= fTempo[7];
		fTempo[5] *= fTempo[7];
		fTempo[6] *= fTempo[7];
		out[0] = (fTempo[4] * 0.5 + 0.5) * this.width;
		out[1] = (fTempo[5] * 0.5 + 0.5) * this.height;
	};
	GLWrap_.prototype.setSize = function (w, h, force) {
		if (this.width === w && this.height === h && !force)
			return;
		this.endBatch();
		var gl = this.gl;
		this.width = w;
		this.height = h;
		gl.viewport(0, 0, w, h);
		mat4.lookAt(this.cam, this.look, this.up, this.matMV);
		if (this.enableFrontToBack) {
			mat4.ortho(-w / 2, w / 2, h / 2, -h / 2, this.zNear, this.zFar, this.matP);
			this.worldScale[0] = 1;
			this.worldScale[1] = 1;
		}
		else {
			mat4.perspective(45, w / h, this.zNear, this.zFar, this.matP);
			var tl = [0, 0];
			var br = [0, 0];
			this.project(0, 0, tl);
			this.project(1, 1, br);
			this.worldScale[0] = 1 / (br[0] - tl[0]);
			this.worldScale[1] = -1 / (br[1] - tl[1]);
		}
		var i, len, s;
		for (i = 0, len = this.shaderPrograms.length; i < len; i++) {
			s = this.shaderPrograms[i];
			s.hasCurrentMatMV = false;
			if (s.locMatP) {
				gl.useProgram(s.shaderProgram);
				gl.uniformMatrix4fv(s.locMatP, false, this.matP);
			}
		}
		gl.useProgram(this.shaderPrograms[this.lastProgram].shaderProgram);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.activeTexture(gl.TEXTURE0);
		this.lastTexture0 = null;
		this.lastTexture1 = null;
		if (this.depthBuffer) {
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
			gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
			if (!this.attachedDepthBuffer) {
				gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);
				this.attachedDepthBuffer = true;
			}
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			this.renderToTex = null;
		}
	};
	GLWrap_.prototype.resetModelView = function () {
		mat4.lookAt(this.cam, this.look, this.up, this.matMV);
		mat4.scale(this.matMV, this.worldScale);
	};
	GLWrap_.prototype.translate = function (x, y) {
		if (x === 0 && y === 0)
			return;
		this.tmpVec3[0] = x;// * this.worldScale[0];
		this.tmpVec3[1] = y;// * this.worldScale[1];
		this.tmpVec3[2] = 0;
		mat4.translate(this.matMV, this.tmpVec3);
	};
	GLWrap_.prototype.scale = function (x, y) {
		if (x === 1 && y === 1)
			return;
		this.tmpVec3[0] = x;
		this.tmpVec3[1] = y;
		this.tmpVec3[2] = 1;
		mat4.scale(this.matMV, this.tmpVec3);
	};
	GLWrap_.prototype.rotateZ = function (a) {
		if (a === 0)
			return;
		mat4.rotateZ(this.matMV, a);
	};
	GLWrap_.prototype.updateModelView = function () {
		if (areMat4sEqual(this.lastMV, this.matMV))
			return;
		var b = this.pushBatch();
		b.type = BATCH_UPDATEMODELVIEW;
		if (b.mat4param)
			mat4.set(this.matMV, b.mat4param);
		else
			b.mat4param = mat4.create(this.matMV);
		mat4.set(this.matMV, this.lastMV);
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	}
	GLWrap_.prototype.setEarlyZIndex = function (i) {
		if (!this.enableFrontToBack)
			return;
		if (i > 32760)
			i = 32760;
		this.currentZ = this.cam[2] - this.zNear - i * this.zIncrement;
	};

	function GLBatchJob(type_, glwrap_) {
		this.type = type_;
		this.glwrap = glwrap_;
		this.gl = glwrap_.gl;
		this.opacityParam = 0;		// for setOpacity()
		this.startIndex = 0;		// for quad()
		this.indexCount = 0;		// "
		this.texParam = null;		// for setTexture()
		this.mat4param = null;		// for updateModelView()
		this.shaderParams = [];		// for user parameters
		cr.seal(this);
	};
	GLBatchJob.prototype.doSetEarlyZPass = function () {
		var gl = this.gl;
		var glwrap = this.glwrap;
		if (this.startIndex !== 0)		// enable
		{
			gl.depthMask(true);			// enable depth writes
			gl.colorMask(false, false, false, false);	// disable color writes
			gl.disable(gl.BLEND);		// no color writes so disable blend
			gl.bindFramebuffer(gl.FRAMEBUFFER, glwrap.fbo);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
			gl.clear(gl.DEPTH_BUFFER_BIT);		// auto-clear depth buffer
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			glwrap.isBatchInEarlyZPass = true;
		}
		else {
			gl.depthMask(false);		// disable depth writes, only test existing depth values
			gl.colorMask(true, true, true, true);		// enable color writes
			gl.enable(gl.BLEND);		// turn blending back on
			glwrap.isBatchInEarlyZPass = false;
		}
	};
	GLBatchJob.prototype.doSetTexture = function () {
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texParam);
	};
	GLBatchJob.prototype.doSetTexture1 = function () {
		var gl = this.gl;
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.texParam);
		gl.activeTexture(gl.TEXTURE0);
	};
	GLBatchJob.prototype.doSetOpacity = function () {
		var o = this.opacityParam;
		var glwrap = this.glwrap;
		glwrap.currentOpacity = o;
		var curProg = glwrap.currentShader;
		if (curProg.locOpacity && curProg.lpOpacity !== o) {
			curProg.lpOpacity = o;
			this.gl.uniform1f(curProg.locOpacity, o);
		}
	};
	GLBatchJob.prototype.doQuad = function () {
		this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, this.startIndex);
	};
	GLBatchJob.prototype.doSetBlend = function () {
		this.gl.blendFunc(this.startIndex, this.indexCount);
	};
	GLBatchJob.prototype.doUpdateModelView = function () {
		var i, len, s, shaderPrograms = this.glwrap.shaderPrograms, currentProgram = this.glwrap.currentProgram;
		for (i = 0, len = shaderPrograms.length; i < len; i++) {
			s = shaderPrograms[i];
			if (i === currentProgram && s.locMatMV) {
				s.updateMatMV(this.mat4param);
				s.hasCurrentMatMV = true;
			}
			else
				s.hasCurrentMatMV = false;
		}
		mat4.set(this.mat4param, this.glwrap.currentMV);
	};
	GLBatchJob.prototype.doRenderToTexture = function () {
		var gl = this.gl;
		var glwrap = this.glwrap;
		if (this.texParam) {
			if (glwrap.lastTexture1 === this.texParam) {
				gl.activeTexture(gl.TEXTURE1);
				gl.bindTexture(gl.TEXTURE_2D, null);
				glwrap.lastTexture1 = null;
				gl.activeTexture(gl.TEXTURE0);
			}
			gl.bindFramebuffer(gl.FRAMEBUFFER, glwrap.fbo);
			if (!glwrap.isBatchInEarlyZPass) {
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texParam, 0);
			}
		}
		else {
			if (!glwrap.enableFrontToBack) {
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
			}
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}
	};
	GLBatchJob.prototype.doClear = function () {
		var gl = this.gl;
		var mode = this.startIndex;
		if (mode === 0)			// clear whole surface
		{
			gl.clearColor(this.mat4param[0], this.mat4param[1], this.mat4param[2], this.mat4param[3]);
			gl.clear(gl.COLOR_BUFFER_BIT);
		}
		else if (mode === 1)	// clear rectangle
		{
			gl.enable(gl.SCISSOR_TEST);
			gl.scissor(this.mat4param[0], this.mat4param[1], this.mat4param[2], this.mat4param[3]);
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.disable(gl.SCISSOR_TEST);
		}
		else					// clear depth
		{
			gl.clear(gl.DEPTH_BUFFER_BIT);
		}
	};
	GLBatchJob.prototype.doSetDepthTestEnabled = function () {
		var gl = this.gl;
		var enable = this.startIndex;
		if (enable !== 0) {
			gl.enable(gl.DEPTH_TEST);
		}
		else {
			gl.disable(gl.DEPTH_TEST);
		}
	};
	GLBatchJob.prototype.doPoints = function () {
		var gl = this.gl;
		var glwrap = this.glwrap;
		if (glwrap.enableFrontToBack)
			gl.disable(gl.DEPTH_TEST);
		var s = glwrap.shaderPrograms[1];
		gl.useProgram(s.shaderProgram);
		if (!s.hasCurrentMatMV && s.locMatMV) {
			s.updateMatMV(glwrap.currentMV);
			s.hasCurrentMatMV = true;
		}
		gl.enableVertexAttribArray(s.locAPos);
		gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.pointBuffer);
		gl.vertexAttribPointer(s.locAPos, 4, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.POINTS, this.startIndex / 4, this.indexCount);
		s = glwrap.currentShader;
		gl.useProgram(s.shaderProgram);
		if (s.locAPos >= 0) {
			gl.enableVertexAttribArray(s.locAPos);
			gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.vertexBuffers[glwrap.curBuffer]);
			gl.vertexAttribPointer(s.locAPos, glwrap.enableFrontToBack ? 3 : 2, gl.FLOAT, false, 0, 0);
		}
		if (s.locATex >= 0) {
			gl.enableVertexAttribArray(s.locATex);
			gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.texcoordBuffers[glwrap.curBuffer]);
			gl.vertexAttribPointer(s.locATex, 2, gl.FLOAT, false, 0, 0);
		}
		if (glwrap.enableFrontToBack)
			gl.enable(gl.DEPTH_TEST);
	};
	GLBatchJob.prototype.doSetProgram = function () {
		var gl = this.gl;
		var glwrap = this.glwrap;
		var s = glwrap.shaderPrograms[this.startIndex];		// recycled param to save memory
		glwrap.currentProgram = this.startIndex;			// current batch program
		glwrap.currentShader = s;
		gl.useProgram(s.shaderProgram);						// switch to
		if (!s.hasCurrentMatMV && s.locMatMV) {
			s.updateMatMV(glwrap.currentMV);
			s.hasCurrentMatMV = true;
		}
		if (s.locOpacity && s.lpOpacity !== glwrap.currentOpacity) {
			s.lpOpacity = glwrap.currentOpacity;
			gl.uniform1f(s.locOpacity, glwrap.currentOpacity);
		}
		if (s.locAPos >= 0) {
			gl.enableVertexAttribArray(s.locAPos);
			gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.vertexBuffers[glwrap.curBuffer]);
			gl.vertexAttribPointer(s.locAPos, glwrap.enableFrontToBack ? 3 : 2, gl.FLOAT, false, 0, 0);
		}
		if (s.locATex >= 0) {
			gl.enableVertexAttribArray(s.locATex);
			gl.bindBuffer(gl.ARRAY_BUFFER, glwrap.texcoordBuffers[glwrap.curBuffer]);
			gl.vertexAttribPointer(s.locATex, 2, gl.FLOAT, false, 0, 0);
		}
	}
	GLBatchJob.prototype.doSetColor = function () {
		var s = this.glwrap.currentShader;
		var mat4param = this.mat4param;
		this.gl.uniform4f(s.locColorFill, mat4param[0], mat4param[1], mat4param[2], mat4param[3]);
	};
	GLBatchJob.prototype.doSetProgramParameters = function () {
		var i, len, s = this.glwrap.currentShader;
		var gl = this.gl;
		var mat4param = this.mat4param;
		if (s.locSamplerBack && this.glwrap.lastTexture1 !== this.texParam) {
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this.texParam);
			this.glwrap.lastTexture1 = this.texParam;
			gl.activeTexture(gl.TEXTURE0);
		}
		var v = mat4param[0];
		var v2;
		if (s.locPixelWidth && v !== s.lpPixelWidth) {
			s.lpPixelWidth = v;
			gl.uniform1f(s.locPixelWidth, v);
		}
		v = mat4param[1];
		if (s.locPixelHeight && v !== s.lpPixelHeight) {
			s.lpPixelHeight = v;
			gl.uniform1f(s.locPixelHeight, v);
		}
		v = mat4param[2];
		v2 = mat4param[3];
		if (s.locDestStart && (v !== s.lpDestStartX || v2 !== s.lpDestStartY)) {
			s.lpDestStartX = v;
			s.lpDestStartY = v2;
			gl.uniform2f(s.locDestStart, v, v2);
		}
		v = mat4param[4];
		v2 = mat4param[5];
		if (s.locDestEnd && (v !== s.lpDestEndX || v2 !== s.lpDestEndY)) {
			s.lpDestEndX = v;
			s.lpDestEndY = v2;
			gl.uniform2f(s.locDestEnd, v, v2);
		}
		v = mat4param[6];
		if (s.locLayerScale && v !== s.lpLayerScale) {
			s.lpLayerScale = v;
			gl.uniform1f(s.locLayerScale, v);
		}
		v = mat4param[7];
		if (s.locLayerAngle && v !== s.lpLayerAngle) {
			s.lpLayerAngle = v;
			gl.uniform1f(s.locLayerAngle, v);
		}
		v = mat4param[8];
		v2 = mat4param[9];
		if (s.locViewOrigin && (v !== s.lpViewOriginX || v2 !== s.lpViewOriginY)) {
			s.lpViewOriginX = v;
			s.lpViewOriginY = v2;
			gl.uniform2f(s.locViewOrigin, v, v2);
		}
		v = mat4param[10];
		v2 = mat4param[11];
		if (s.locScrollPos && (v !== s.lpScrollPosX || v2 !== s.lpScrollPosY)) {
			s.lpScrollPosX = v;
			s.lpScrollPosY = v2;
			gl.uniform2f(s.locScrollPos, v, v2);
		}
		v = mat4param[12];
		if (s.locSeconds && v !== s.lpSeconds) {
			s.lpSeconds = v;
			gl.uniform1f(s.locSeconds, v);
		}
		if (s.parameters.length) {
			for (i = 0, len = s.parameters.length; i < len; i++) {
				v = this.shaderParams[i];
				if (v !== s.lastCustomParams[i]) {
					s.lastCustomParams[i] = v;
					gl.uniform1f(s.parameters[i][1], v);
				}
			}
		}
	};
	GLWrap_.prototype.pushBatch = function () {
		if (this.batchPtr === this.batch.length)
			this.batch.push(new GLBatchJob(BATCH_NULL, this));
		return this.batch[this.batchPtr++];
	};
	GLWrap_.prototype.endBatch = function () {
		if (this.batchPtr === 0)
			return;
		if (this.gl.isContextLost())
			return;
		var gl = this.gl;
		if (this.pointPtr > 0) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffer);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.pointData.subarray(0, this.pointPtr));
			if (s && s.locAPos >= 0 && s.name === "<point>")
				gl.vertexAttribPointer(s.locAPos, 4, gl.FLOAT, false, 0, 0);
		}
		if (this.vertexPtr > 0) {
			var s = this.currentShader;
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffers[this.curBuffer]);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexData.subarray(0, this.vertexPtr));
			if (s && s.locAPos >= 0 && s.name !== "<point>")
				gl.vertexAttribPointer(s.locAPos, this.enableFrontToBack ? 3 : 2, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffers[this.curBuffer]);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.texcoordData.subarray(0, this.texPtr));
			if (s && s.locATex >= 0 && s.name !== "<point>")
				gl.vertexAttribPointer(s.locATex, 2, gl.FLOAT, false, 0, 0);
		}
		var i, len, b;
		for (i = 0, len = this.batchPtr; i < len; i++) {
			b = this.batch[i];
			switch (b.type) {
				case 1:
					b.doQuad();
					break;
				case 2:
					b.doSetTexture();
					break;
				case 3:
					b.doSetOpacity();
					break;
				case 4:
					b.doSetBlend();
					break;
				case 5:
					b.doUpdateModelView();
					break;
				case 6:
					b.doRenderToTexture();
					break;
				case 7:
					b.doClear();
					break;
				case 8:
					b.doPoints();
					break;
				case 9:
					b.doSetProgram();
					break;
				case 10:
					b.doSetProgramParameters();
					break;
				case 11:
					b.doSetTexture1();
					break;
				case 12:
					b.doSetColor();
					break;
				case 13:
					b.doSetDepthTestEnabled();
					break;
				case 14:
					b.doSetEarlyZPass();
					break;
			}
		}
		this.batchPtr = 0;
		this.vertexPtr = 0;
		this.texPtr = 0;
		this.pointPtr = 0;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
		this.isBatchInEarlyZPass = false;
		this.curBuffer++;
		if (this.curBuffer >= MULTI_BUFFERS)
			this.curBuffer = 0;
	};
	GLWrap_.prototype.setOpacity = function (op) {
		if (op === this.lastOpacity)
			return;
		if (this.isEarlyZPass)
			return;		// ignore
		var b = this.pushBatch();
		b.type = BATCH_SETOPACITY;
		b.opacityParam = op;
		this.lastOpacity = op;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.setTexture = function (tex) {
		if (tex === this.lastTexture0)
			return;
		;
		var b = this.pushBatch();
		b.type = BATCH_SETTEXTURE;
		b.texParam = tex;
		this.lastTexture0 = tex;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.setBlend = function (s, d) {
		if (s === this.lastSrcBlend && d === this.lastDestBlend)
			return;
		if (this.isEarlyZPass)
			return;		// ignore
		var b = this.pushBatch();
		b.type = BATCH_SETBLEND;
		b.startIndex = s;		// recycle params to save memory
		b.indexCount = d;
		this.lastSrcBlend = s;
		this.lastDestBlend = d;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.isPremultipliedAlphaBlend = function () {
		return (this.lastSrcBlend === this.gl.ONE && this.lastDestBlend === this.gl.ONE_MINUS_SRC_ALPHA);
	};
	GLWrap_.prototype.setAlphaBlend = function () {
		this.setBlend(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
	};
	GLWrap_.prototype.setNoPremultiplyAlphaBlend = function () {
		this.setBlend(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
	};
	var LAST_VERTEX = MAX_VERTICES * 2 - 8;
	GLWrap_.prototype.quad = function (tlx, tly, trx, try_, brx, bry, blx, bly) {
		if (this.vertexPtr >= LAST_VERTEX)
			this.endBatch();
		var v = this.vertexPtr;			// vertex cursor
		var t = this.texPtr;
		var vd = this.vertexData;		// vertex data array
		var td = this.texcoordData;		// texture coord data array
		var currentZ = this.currentZ;
		if (this.hasQuadBatchTop) {
			this.batch[this.batchPtr - 1].indexCount += 6;
		}
		else {
			var b = this.pushBatch();
			b.type = BATCH_QUAD;
			b.startIndex = this.enableFrontToBack ? v : (v / 2) * 3;
			b.indexCount = 6;
			this.hasQuadBatchTop = true;
			this.hasPointBatchTop = false;
		}
		if (this.enableFrontToBack) {
			vd[v++] = tlx;
			vd[v++] = tly;
			vd[v++] = currentZ;
			vd[v++] = trx;
			vd[v++] = try_;
			vd[v++] = currentZ;
			vd[v++] = brx;
			vd[v++] = bry;
			vd[v++] = currentZ;
			vd[v++] = blx;
			vd[v++] = bly;
			vd[v++] = currentZ;
		}
		else {
			vd[v++] = tlx;
			vd[v++] = tly;
			vd[v++] = trx;
			vd[v++] = try_;
			vd[v++] = brx;
			vd[v++] = bry;
			vd[v++] = blx;
			vd[v++] = bly;
		}
		td[t++] = 0;
		td[t++] = 0;
		td[t++] = 1;
		td[t++] = 0;
		td[t++] = 1;
		td[t++] = 1;
		td[t++] = 0;
		td[t++] = 1;
		this.vertexPtr = v;
		this.texPtr = t;
	};
	GLWrap_.prototype.quadTex = function (tlx, tly, trx, try_, brx, bry, blx, bly, rcTex) {
		if (this.vertexPtr >= LAST_VERTEX)
			this.endBatch();
		var v = this.vertexPtr;			// vertex cursor
		var t = this.texPtr;
		var vd = this.vertexData;		// vertex data array
		var td = this.texcoordData;		// texture coord data array
		var currentZ = this.currentZ;
		if (this.hasQuadBatchTop) {
			this.batch[this.batchPtr - 1].indexCount += 6;
		}
		else {
			var b = this.pushBatch();
			b.type = BATCH_QUAD;
			b.startIndex = this.enableFrontToBack ? v : (v / 2) * 3;
			b.indexCount = 6;
			this.hasQuadBatchTop = true;
			this.hasPointBatchTop = false;
		}
		var rc_left = rcTex.left;
		var rc_top = rcTex.top;
		var rc_right = rcTex.right;
		var rc_bottom = rcTex.bottom;
		if (this.enableFrontToBack) {
			vd[v++] = tlx;
			vd[v++] = tly;
			vd[v++] = currentZ;
			vd[v++] = trx;
			vd[v++] = try_;
			vd[v++] = currentZ;
			vd[v++] = brx;
			vd[v++] = bry;
			vd[v++] = currentZ;
			vd[v++] = blx;
			vd[v++] = bly;
			vd[v++] = currentZ;
		}
		else {
			vd[v++] = tlx;
			vd[v++] = tly;
			vd[v++] = trx;
			vd[v++] = try_;
			vd[v++] = brx;
			vd[v++] = bry;
			vd[v++] = blx;
			vd[v++] = bly;
		}
		td[t++] = rc_left;
		td[t++] = rc_top;
		td[t++] = rc_right;
		td[t++] = rc_top;
		td[t++] = rc_right;
		td[t++] = rc_bottom;
		td[t++] = rc_left;
		td[t++] = rc_bottom;
		this.vertexPtr = v;
		this.texPtr = t;
	};
	GLWrap_.prototype.quadTexUV = function (tlx, tly, trx, try_, brx, bry, blx, bly, tlu, tlv, tru, trv, bru, brv, blu, blv) {
		if (this.vertexPtr >= LAST_VERTEX)
			this.endBatch();
		var v = this.vertexPtr;			// vertex cursor
		var t = this.texPtr;
		var vd = this.vertexData;		// vertex data array
		var td = this.texcoordData;		// texture coord data array
		var currentZ = this.currentZ;
		if (this.hasQuadBatchTop) {
			this.batch[this.batchPtr - 1].indexCount += 6;
		}
		else {
			var b = this.pushBatch();
			b.type = BATCH_QUAD;
			b.startIndex = this.enableFrontToBack ? v : (v / 2) * 3;
			b.indexCount = 6;
			this.hasQuadBatchTop = true;
			this.hasPointBatchTop = false;
		}
		if (this.enableFrontToBack) {
			vd[v++] = tlx;
			vd[v++] = tly;
			vd[v++] = currentZ;
			vd[v++] = trx;
			vd[v++] = try_;
			vd[v++] = currentZ;
			vd[v++] = brx;
			vd[v++] = bry;
			vd[v++] = currentZ;
			vd[v++] = blx;
			vd[v++] = bly;
			vd[v++] = currentZ;
		}
		else {
			vd[v++] = tlx;
			vd[v++] = tly;
			vd[v++] = trx;
			vd[v++] = try_;
			vd[v++] = brx;
			vd[v++] = bry;
			vd[v++] = blx;
			vd[v++] = bly;
		}
		td[t++] = tlu;
		td[t++] = tlv;
		td[t++] = tru;
		td[t++] = trv;
		td[t++] = bru;
		td[t++] = brv;
		td[t++] = blu;
		td[t++] = blv;
		this.vertexPtr = v;
		this.texPtr = t;
	};
	GLWrap_.prototype.convexPoly = function (pts) {
		var pts_count = pts.length / 2;
		;
		var tris = pts_count - 2;	// 3 points = 1 tri, 4 points = 2 tris, 5 points = 3 tris etc.
		var last_tri = tris - 1;
		var p0x = pts[0];
		var p0y = pts[1];
		var i, i2, p1x, p1y, p2x, p2y, p3x, p3y;
		for (i = 0; i < tris; i += 2)		// draw 2 triangles at a time
		{
			i2 = i * 2;
			p1x = pts[i2 + 2];
			p1y = pts[i2 + 3];
			p2x = pts[i2 + 4];
			p2y = pts[i2 + 5];
			if (i === last_tri) {
				this.quad(p0x, p0y, p1x, p1y, p2x, p2y, p2x, p2y);
			}
			else {
				p3x = pts[i2 + 6];
				p3y = pts[i2 + 7];
				this.quad(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y);
			}
		}
	};
	var LAST_POINT = MAX_POINTS - 4;
	GLWrap_.prototype.point = function (x_, y_, size_, opacity_) {
		if (this.pointPtr >= LAST_POINT)
			this.endBatch();
		var p = this.pointPtr;			// point cursor
		var pd = this.pointData;		// point data array
		if (this.hasPointBatchTop) {
			this.batch[this.batchPtr - 1].indexCount++;
		}
		else {
			var b = this.pushBatch();
			b.type = BATCH_POINTS;
			b.startIndex = p;
			b.indexCount = 1;
			this.hasPointBatchTop = true;
			this.hasQuadBatchTop = false;
		}
		pd[p++] = x_;
		pd[p++] = y_;
		pd[p++] = size_;
		pd[p++] = opacity_;
		this.pointPtr = p;
	};
	GLWrap_.prototype.switchProgram = function (progIndex) {
		if (this.lastProgram === progIndex)
			return;			// no change
		var shaderProg = this.shaderPrograms[progIndex];
		if (!shaderProg) {
			if (this.lastProgram === 0)
				return;								// already on default shader
			progIndex = 0;
			shaderProg = this.shaderPrograms[0];
		}
		var b = this.pushBatch();
		b.type = BATCH_SETPROGRAM;
		b.startIndex = progIndex;
		this.lastProgram = progIndex;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.programUsesDest = function (progIndex) {
		var s = this.shaderPrograms[progIndex];
		return !!(s.locDestStart || s.locDestEnd);
	};
	GLWrap_.prototype.programUsesCrossSampling = function (progIndex) {
		var s = this.shaderPrograms[progIndex];
		return !!(s.locDestStart || s.locDestEnd || s.crossSampling);
	};
	GLWrap_.prototype.programPreservesOpaqueness = function (progIndex) {
		return this.shaderPrograms[progIndex].preservesOpaqueness;
	};
	GLWrap_.prototype.programExtendsBox = function (progIndex) {
		var s = this.shaderPrograms[progIndex];
		return s.extendBoxHorizontal !== 0 || s.extendBoxVertical !== 0;
	};
	GLWrap_.prototype.getProgramBoxExtendHorizontal = function (progIndex) {
		return this.shaderPrograms[progIndex].extendBoxHorizontal;
	};
	GLWrap_.prototype.getProgramBoxExtendVertical = function (progIndex) {
		return this.shaderPrograms[progIndex].extendBoxVertical;
	};
	GLWrap_.prototype.getProgramParameterType = function (progIndex, paramIndex) {
		return this.shaderPrograms[progIndex].parameters[paramIndex][2];
	};
	GLWrap_.prototype.programIsAnimated = function (progIndex) {
		return this.shaderPrograms[progIndex].animated;
	};
	GLWrap_.prototype.setProgramParameters = function (backTex, pixelWidth, pixelHeight, destStartX, destStartY, destEndX, destEndY, layerScale, layerAngle, viewOriginLeft, viewOriginTop, scrollPosX, scrollPosY, seconds, params) {
		var i, len;
		var s = this.shaderPrograms[this.lastProgram];
		var b, mat4param, shaderParams;
		if (s.hasAnyOptionalUniforms || params.length) {
			b = this.pushBatch();
			b.type = BATCH_SETPROGRAMPARAMETERS;
			if (b.mat4param)
				mat4.set(this.matMV, b.mat4param);
			else
				b.mat4param = mat4.create();
			mat4param = b.mat4param;
			mat4param[0] = pixelWidth;
			mat4param[1] = pixelHeight;
			mat4param[2] = destStartX;
			mat4param[3] = destStartY;
			mat4param[4] = destEndX;
			mat4param[5] = destEndY;
			mat4param[6] = layerScale;
			mat4param[7] = layerAngle;
			mat4param[8] = viewOriginLeft;
			mat4param[9] = viewOriginTop;
			mat4param[10] = scrollPosX;
			mat4param[11] = scrollPosY;
			mat4param[12] = seconds;
			if (s.locSamplerBack) {
				;
				b.texParam = backTex;
			}
			else
				b.texParam = null;
			if (params.length) {
				shaderParams = b.shaderParams;
				shaderParams.length = params.length;
				for (i = 0, len = params.length; i < len; i++)
					shaderParams[i] = params[i];
			}
			this.hasQuadBatchTop = false;
			this.hasPointBatchTop = false;
		}
	};
	GLWrap_.prototype.clear = function (r, g, b_, a) {
		var b = this.pushBatch();
		b.type = BATCH_CLEAR;
		b.startIndex = 0;					// clear all mode
		if (!b.mat4param)
			b.mat4param = mat4.create();
		b.mat4param[0] = r;
		b.mat4param[1] = g;
		b.mat4param[2] = b_;
		b.mat4param[3] = a;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.clearRect = function (x, y, w, h) {
		if (w < 0 || h < 0)
			return;							// invalid clear area
		var b = this.pushBatch();
		b.type = BATCH_CLEAR;
		b.startIndex = 1;					// clear rect mode
		if (!b.mat4param)
			b.mat4param = mat4.create();
		b.mat4param[0] = x;
		b.mat4param[1] = y;
		b.mat4param[2] = w;
		b.mat4param[3] = h;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.clearDepth = function () {
		var b = this.pushBatch();
		b.type = BATCH_CLEAR;
		b.startIndex = 2;					// clear depth mode
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.setEarlyZPass = function (e) {
		if (!this.enableFrontToBack)
			return;		// no depth buffer in use
		e = !!e;
		if (this.isEarlyZPass === e)
			return;		// no change
		var b = this.pushBatch();
		b.type = BATCH_SETEARLYZMODE;
		b.startIndex = (e ? 1 : 0);
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
		this.isEarlyZPass = e;
		this.renderToTex = null;
		if (this.isEarlyZPass) {
			this.switchProgram(2);		// early Z program
		}
		else {
			this.switchProgram(0);		// normal rendering
		}
	};
	GLWrap_.prototype.setDepthTestEnabled = function (e) {
		if (!this.enableFrontToBack)
			return;		// no depth buffer in use
		var b = this.pushBatch();
		b.type = BATCH_SETDEPTHTEST;
		b.startIndex = (e ? 1 : 0);
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.fullscreenQuad = function () {
		mat4.set(this.lastMV, tempMat4);
		this.resetModelView();
		this.updateModelView();
		var halfw = this.width / 2;
		var halfh = this.height / 2;
		this.quad(-halfw, halfh, halfw, halfh, halfw, -halfh, -halfw, -halfh);
		mat4.set(tempMat4, this.matMV);
		this.updateModelView();
	};
	GLWrap_.prototype.setColorFillMode = function (r_, g_, b_, a_) {
		this.switchProgram(3);
		var b = this.pushBatch();
		b.type = BATCH_SETCOLOR;
		if (!b.mat4param)
			b.mat4param = mat4.create();
		b.mat4param[0] = r_;
		b.mat4param[1] = g_;
		b.mat4param[2] = b_;
		b.mat4param[3] = a_;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	GLWrap_.prototype.setTextureFillMode = function () {
		;
		this.switchProgram(0);
	};
	GLWrap_.prototype.restoreEarlyZMode = function () {
		;
		this.switchProgram(2);
	};
	GLWrap_.prototype.present = function () {
		this.endBatch();
		this.gl.flush();
		/*
		 if (debugBatch)
		 {
		 ;
		 debugBatch = false;
		 }
		 */
	};

	var all_textures = [];
	var textures_by_src = {};
	GLWrap_.prototype.contextLost = function () {
		cr.clearArray(all_textures);
		textures_by_src = {};
	};
	var BF_RGBA8 = 0;
	var BF_RGB8 = 1;
	var BF_RGBA4 = 2;
	var BF_RGB5_A1 = 3;
	var BF_RGB565 = 4;
	GLWrap_.prototype.loadTexture = function (img, tiling, linearsampling, pixelformat, tiletype, nomip) {
		tiling = !!tiling;
		linearsampling = !!linearsampling;
		var tex_key = img.src + "," + tiling + "," + linearsampling + (tiling ? ("," + tiletype) : "");
		var webGL_texture = null;
		if (typeof img.src !== "undefined" && textures_by_src.hasOwnProperty(tex_key)) {
			webGL_texture = textures_by_src[tex_key];
			webGL_texture.c2refcount++;
			return webGL_texture;
		}
		this.endBatch();
		;
		var gl = this.gl;
		var isPOT = (cr.isPOT(img.width) && cr.isPOT(img.height));
		webGL_texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, webGL_texture);
		gl.pixelStorei(gl["UNPACK_PREMULTIPLY_ALPHA_WEBGL"], true);
		var internalformat = gl.RGBA;
		var format = gl.RGBA;
		var type = gl.UNSIGNED_BYTE;
		if (pixelformat && !this.isIE) {
			switch (pixelformat) {
				case BF_RGB8:
					internalformat = gl.RGB;
					format = gl.RGB;
					break;
				case BF_RGBA4:
					type = gl.UNSIGNED_SHORT_4_4_4_4;
					break;
				case BF_RGB5_A1:
					type = gl.UNSIGNED_SHORT_5_5_5_1;
					break;
				case BF_RGB565:
					internalformat = gl.RGB;
					format = gl.RGB;
					type = gl.UNSIGNED_SHORT_5_6_5;
					break;
			}
		}
		if (this.version === 1 && !isPOT && tiling) {
			var canvas = document.createElement("canvas");
			canvas.width = cr.nextHighestPowerOfTwo(img.width);
			canvas.height = cr.nextHighestPowerOfTwo(img.height);
			var ctx = canvas.getContext("2d");
			if (typeof ctx["imageSmoothingEnabled"] !== "undefined") {
				ctx["imageSmoothingEnabled"] = linearsampling;
			}
			else {
				ctx["webkitImageSmoothingEnabled"] = linearsampling;
				ctx["mozImageSmoothingEnabled"] = linearsampling;
				ctx["msImageSmoothingEnabled"] = linearsampling;
			}
			ctx.drawImage(img,
				0, 0, img.width, img.height,
				0, 0, canvas.width, canvas.height);
			gl.texImage2D(gl.TEXTURE_2D, 0, internalformat, format, type, canvas);
		}
		else
			gl.texImage2D(gl.TEXTURE_2D, 0, internalformat, format, type, img);
		if (tiling) {
			if (tiletype === "repeat-x") {
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			}
			else if (tiletype === "repeat-y") {
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			}
			else {
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			}
		}
		else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
		if (linearsampling) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			if ((isPOT || this.version >= 2) && this.enable_mipmaps && !nomip) {
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
				gl.generateMipmap(gl.TEXTURE_2D);
			}
			else
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		}
		else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		}
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.lastTexture0 = null;
		webGL_texture.c2width = img.width;
		webGL_texture.c2height = img.height;
		webGL_texture.c2refcount = 1;
		webGL_texture.c2texkey = tex_key;
		all_textures.push(webGL_texture);
		textures_by_src[tex_key] = webGL_texture;
		return webGL_texture;
	};
	GLWrap_.prototype.createEmptyTexture = function (w, h, linearsampling, _16bit, tiling) {
		this.endBatch();
		var gl = this.gl;
		if (this.isIE)
			_16bit = false;
		var webGL_texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, webGL_texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, _16bit ? gl.UNSIGNED_SHORT_4_4_4_4 : gl.UNSIGNED_BYTE, null);
		if (tiling) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		}
		else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, linearsampling ? gl.LINEAR : gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, linearsampling ? gl.LINEAR : gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.lastTexture0 = null;
		webGL_texture.c2width = w;
		webGL_texture.c2height = h;
		all_textures.push(webGL_texture);
		return webGL_texture;
	};
	GLWrap_.prototype.videoToTexture = function (video_, texture_, _16bit) {
		this.endBatch();
		var gl = this.gl;
		if (this.isIE)
			_16bit = false;
		gl.bindTexture(gl.TEXTURE_2D, texture_);
		gl.pixelStorei(gl["UNPACK_PREMULTIPLY_ALPHA_WEBGL"], true);
		try {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, _16bit ? gl.UNSIGNED_SHORT_4_4_4_4 : gl.UNSIGNED_BYTE, video_);
		}
		catch (e) {
			if (console && console.error)
				console.error("Error updating WebGL texture: ", e);
		}
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.lastTexture0 = null;
	};
	GLWrap_.prototype.deleteTexture = function (tex) {
		if (!tex)
			return;
		if (typeof tex.c2refcount !== "undefined" && tex.c2refcount > 1) {
			tex.c2refcount--;
			return;
		}
		this.endBatch();
		if (tex === this.lastTexture0) {
			this.gl.bindTexture(this.gl.TEXTURE_2D, null);
			this.lastTexture0 = null;
		}
		if (tex === this.lastTexture1) {
			this.gl.activeTexture(this.gl.TEXTURE1);
			this.gl.bindTexture(this.gl.TEXTURE_2D, null);
			this.gl.activeTexture(this.gl.TEXTURE0);
			this.lastTexture1 = null;
		}
		cr.arrayFindRemove(all_textures, tex);
		if (typeof tex.c2texkey !== "undefined")
			delete textures_by_src[tex.c2texkey];
		this.gl.deleteTexture(tex);
	};
	GLWrap_.prototype.estimateVRAM = function () {
		var total = this.width * this.height * 4 * 2;
		var i, len, t;
		for (i = 0, len = all_textures.length; i < len; i++) {
			t = all_textures[i];
			total += (t.c2width * t.c2height * 4);
		}
		return total;
	};
	GLWrap_.prototype.textureCount = function () {
		return all_textures.length;
	};
	GLWrap_.prototype.setRenderingToTexture = function (tex) {
		if (tex === this.renderToTex)
			return;
		;
		var b = this.pushBatch();
		b.type = BATCH_RENDERTOTEXTURE;
		b.texParam = tex;
		this.renderToTex = tex;
		this.hasQuadBatchTop = false;
		this.hasPointBatchTop = false;
	};
	console.log('cr2', cr)
	cr.GLWrap = GLWrap_;
}());
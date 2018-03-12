(function() {
	var raf = window["requestAnimationFrame"] ||
		window["mozRequestAnimationFrame"] ||
		window["webkitRequestAnimationFrame"] ||
		window["msRequestAnimationFrame"] ||
		window["oRequestAnimationFrame"];

	function Runtime(canvas) {
		console.log('runtime canvas', canvas)
		if (!canvas || (!canvas.getContext && !canvas["dc"]))
			return;
		if (canvas["c2runtime"])
			return;
		else
			canvas["c2runtime"] = this;
		var self = this;
		this.isCrosswalk = /crosswalk/i.test(navigator.userAgent) || /xwalk/i.test(navigator.userAgent) || !!(typeof window["c2isCrosswalk"] !== "undefined" && window["c2isCrosswalk"]);
		this.isCordova = this.isCrosswalk || (typeof window["device"] !== "undefined" && (typeof window["device"]["cordova"] !== "undefined" || typeof window["device"]["phonegap"] !== "undefined")) || (typeof window["c2iscordova"] !== "undefined" && window["c2iscordova"]);
		this.isPhoneGap = this.isCordova;
		this.isDirectCanvas = !!canvas["dc"];
		this.isAppMobi = (typeof window["AppMobi"] !== "undefined" || this.isDirectCanvas);
		this.isCocoonJs = !!window["c2cocoonjs"];
		this.isEjecta = !!window["c2ejecta"];
		if (this.isCocoonJs) {
			CocoonJS["App"]["onSuspended"].addEventListener(function () {
				self["setSuspended"](true);
			});
			CocoonJS["App"]["onActivated"].addEventListener(function () {
				self["setSuspended"](false);
			});
		}
		if (this.isEjecta) {
			document.addEventListener("pagehide", function () {
				self["setSuspended"](true);
			});
			document.addEventListener("pageshow", function () {
				self["setSuspended"](false);
			});
			document.addEventListener("resize", function () {
				self["setSize"](window.innerWidth, window.innerHeight);
			});
		}
		this.isDomFree = (this.isDirectCanvas || this.isCocoonJs || this.isEjecta);
		this.isMicrosoftEdge = /edge\//i.test(navigator.userAgent);
		this.isIE = (/msie/i.test(navigator.userAgent) || /trident/i.test(navigator.userAgent) || /iemobile/i.test(navigator.userAgent)) && !this.isMicrosoftEdge;
		this.isTizen = /tizen/i.test(navigator.userAgent);
		this.isAndroid = /android/i.test(navigator.userAgent) && !this.isTizen && !this.isIE && !this.isMicrosoftEdge;		// IE mobile and Tizen masquerade as Android
		this.isiPhone = (/iphone/i.test(navigator.userAgent) || /ipod/i.test(navigator.userAgent)) && !this.isIE && !this.isMicrosoftEdge;	// treat ipod as an iphone; IE mobile masquerades as iPhone
		this.isiPad = /ipad/i.test(navigator.userAgent);
		this.isiOS = this.isiPhone || this.isiPad || this.isEjecta;
		this.isiPhoneiOS6 = (this.isiPhone && /os\s6/i.test(navigator.userAgent));
		this.isChrome = (/chrome/i.test(navigator.userAgent) || /chromium/i.test(navigator.userAgent)) && !this.isIE && !this.isMicrosoftEdge;	// note true on Chromium-based webview on Android 4.4+; IE 'Edge' mode also pretends to be Chrome
		this.isAmazonWebApp = /amazonwebappplatform/i.test(navigator.userAgent);
		this.isFirefox = /firefox/i.test(navigator.userAgent);
		this.isSafari = /safari/i.test(navigator.userAgent) && !this.isChrome && !this.isIE && !this.isMicrosoftEdge;		// Chrome and IE Mobile masquerade as Safari
		this.isWindows = /windows/i.test(navigator.userAgent);
		this.isNWjs = (typeof window["c2nodewebkit"] !== "undefined" || typeof window["c2nwjs"] !== "undefined" || /nodewebkit/i.test(navigator.userAgent) || /nwjs/i.test(navigator.userAgent));
		this.isNodeWebkit = this.isNWjs;		// old name for backwards compat
		this.isArcade = (typeof window["is_scirra_arcade"] !== "undefined");
		this.isWindows8App = !!(typeof window["c2isWindows8"] !== "undefined" && window["c2isWindows8"]);
		this.isWindows8Capable = !!(typeof window["c2isWindows8Capable"] !== "undefined" && window["c2isWindows8Capable"]);
		this.isWindowsPhone8 = !!(typeof window["c2isWindowsPhone8"] !== "undefined" && window["c2isWindowsPhone8"]);
		this.isWindowsPhone81 = !!(typeof window["c2isWindowsPhone81"] !== "undefined" && window["c2isWindowsPhone81"]);
		this.isWindows10 = !!window["cr_windows10"];
		this.isWinJS = (this.isWindows8App || this.isWindows8Capable || this.isWindowsPhone81 || this.isWindows10);	// note not WP8.0
		this.isBlackberry10 = !!(typeof window["c2isBlackberry10"] !== "undefined" && window["c2isBlackberry10"]);
		this.isAndroidStockBrowser = (this.isAndroid && !this.isChrome && !this.isCrosswalk && !this.isFirefox && !this.isAmazonWebApp && !this.isDomFree);
		this.devicePixelRatio = 1;
		this.isMobile = (this.isCordova || this.isCrosswalk || this.isAppMobi || this.isCocoonJs || this.isAndroid || this.isiOS || this.isWindowsPhone8 || this.isWindowsPhone81 || this.isBlackberry10 || this.isTizen || this.isEjecta);
		if (!this.isMobile) {
			this.isMobile = /(blackberry|bb10|playbook|palm|symbian|nokia|windows\s+ce|phone|mobile|tablet|kindle|silk)/i.test(navigator.userAgent);
		}
		this.isWKWebView = !!(this.isiOS && this.isCordova && window["webkit"]);
		this.httpServer = null;
		this.httpServerUrl = "";
		if (this.isWKWebView) {
			this.httpServer = (cordova && cordova["plugins"] && cordova["plugins"]["CorHttpd"]) ? cordova["plugins"]["CorHttpd"] : null;
		}
		if (typeof cr_is_preview !== "undefined" && !this.isNWjs && (window.location.search === "?nw" || /nodewebkit/i.test(navigator.userAgent) || /nwjs/i.test(navigator.userAgent))) {
			this.isNWjs = true;
		}
		this.isDebug = (typeof cr_is_preview !== "undefined" && window.location.search.indexOf("debug") > -1);
		this.canvas = canvas;
		console.log('this.canvas = canvas', canvas)
		this.canvasdiv = document.getElementById("c2canvasdiv");
		this.gl = null;
		this.glwrap = null;
		this.glUnmaskedRenderer = "(unavailable)";
		this.enableFrontToBack = false;
		this.earlyz_index = 0;
		this.ctx = null;
		this.fullscreenOldMarginCss = "";
		this.firstInFullscreen = false;
		this.oldWidth = 0;		// for restoring non-fullscreen canvas after fullscreen
		this.oldHeight = 0;
		this.canvas.oncontextmenu = function (e) {
			if (e.preventDefault) e.preventDefault();
			return false;
		};
		this.canvas.onselectstart = function (e) {
			if (e.preventDefault) e.preventDefault();
			return false;
		};
		if (this.isDirectCanvas)
			window["c2runtime"] = this;
		if (this.isNWjs) {
			window["ondragover"] = function (e) {
				e.preventDefault();
				return false;
			};
			window["ondrop"] = function (e) {
				e.preventDefault();
				return false;
			};
			if (window["nwgui"] && window["nwgui"]["App"]["clearCache"])
				window["nwgui"]["App"]["clearCache"]();
		}
		if (this.isAndroidStockBrowser && typeof $ !== "undefined") {
			// $("canvas").parents("*").css("overflow", "visible");
		}
		this.width = canvas.width;
		this.height = canvas.height;
		this.draw_width = this.width;
		this.draw_height = this.height;
		this.cssWidth = this.width;
		this.cssHeight = this.height;
		this.lastWindowWidth = window.innerWidth;
		this.lastWindowHeight = window.innerHeight;
		this.forceCanvasAlpha = false;		// note: now unused, left for backwards compat since plugins could modify it
		this.redraw = true;
		this.isSuspended = false;
		if (!Date.now) {
			Date.now = function now() {
				return +new Date();
			};
		}
		this.plugins = [];
		this.types = {};
		this.types_by_index = [];
		this.behaviors = [];
		this.layouts = {};
		this.layouts_by_index = [];
		this.eventsheets = {};
		this.eventsheets_by_index = [];
		this.wait_for_textures = [];        // for blocking until textures loaded
		this.triggers_to_postinit = [];
		this.all_global_vars = [];
		this.all_local_vars = [];
		this.solidBehavior = null;
		this.jumpthruBehavior = null;
		this.shadowcasterBehavior = null;
		this.deathRow = {};
		this.hasPendingInstances = false;		// true if anything exists in create row or death row
		this.isInClearDeathRow = false;
		this.isInOnDestroy = 0;					// needs to support recursion so increments and decrements and is true if > 0
		this.isRunningEvents = false;
		this.isEndingLayout = false;
		this.createRow = [];
		this.isLoadingState = false;
		this.saveToSlot = "";
		this.loadFromSlot = "";
		this.loadFromJson = null;			// set to string when there is something to try to load
		this.lastSaveJson = "";
		this.signalledContinuousPreview = false;
		this.suspendDrawing = false;		// for hiding display until continuous preview loads
		this.fireOnCreateAfterLoad = [];	// for delaying "On create" triggers until loading complete
		this.dt = 0;
		this.dt1 = 0;
		this.minimumFramerate = 30;
		this.logictime = 0;			// used to calculate CPUUtilisation
		this.cpuutilisation = 0;
		this.timescale = 1.0;
		this.kahanTime = new cr.KahanAdder();
		this.wallTime = new cr.KahanAdder();
		this.last_tick_time = 0;
		this.fps = 0;
		this.last_fps_time = 0;
		this.tickcount = 0;
		this.execcount = 0;
		this.framecount = 0;        // for fps
		this.objectcount = 0;
		this.changelayout = null;
		this.destroycallbacks = [];
		this.event_stack = [];
		this.event_stack_index = -1;
		this.localvar_stack = [[]];
		this.localvar_stack_index = 0;
		this.trigger_depth = 0;		// recursion depth for triggers
		this.pushEventStack(null);
		this.loop_stack = [];
		this.loop_stack_index = -1;
		this.next_uid = 0;
		this.next_puid = 0;		// permanent unique ids
		this.layout_first_tick = true;
		this.family_count = 0;
		this.suspend_events = [];
		this.raf_id = -1;
		this.timeout_id = -1;
		this.isloading = true;
		this.loadingprogress = 0;
		this.isNodeFullscreen = false;
		this.stackLocalCount = 0;	// number of stack-based local vars for recursion
		this.audioInstance = null;
		this.had_a_click = false;
		this.isInUserInputEvent = false;
		this.objects_to_pretick = new cr.ObjectSet();
		this.objects_to_tick = new cr.ObjectSet();
		this.objects_to_tick2 = new cr.ObjectSet();
		this.registered_collisions = [];
		this.temp_poly = new cr.CollisionPoly([]);
		this.temp_poly2 = new cr.CollisionPoly([]);
		this.allGroups = [];				// array of all event groups
		this.groups_by_name = {};
		this.cndsBySid = {};
		this.actsBySid = {};
		this.varsBySid = {};
		this.blocksBySid = {};
		this.running_layout = null;			// currently running layout
		this.layer_canvas = null;			// for layers "render-to-texture"
		this.layer_ctx = null;
		this.layer_tex = null;
		this.layout_tex = null;
		this.layout_canvas = null;
		this.layout_ctx = null;
		this.is_WebGL_context_lost = false;
		this.uses_background_blending = false;	// if any shader uses background blending, so entire layout renders to texture
		this.fx_tex = [null, null];
		this.fullscreen_scaling = 0;
		this.files_subfolder = "";			// path with project files
		this.objectsByUid = {};				// maps every in-use UID (as a string) to its instance
		this.loaderlogos = null;
		this.snapshotCanvas = null;
		this.snapshotData = "";
		this.objectRefTable = [];
		this.requestProjectData();
	}

	Runtime.prototype.requestProjectData = function () {
		var self = this;
		if (this.isWKWebView) {
			var loadDataJsFn = function () {
				self.loadProject(dataVM);
				// self.fetchLocalFileViaCordovaAsText("./pre/data.js", function (str) {
				// 	self.loadProject(JSON.parse(str));
				// }, function (err) {
				// 	alert("Error fetching data.js");
				// });
			};
			if (this.httpServer) {
				this.httpServer["startServer"]({
					"port": 0,
					"localhost_only": true
				}, function (url) {
					self.httpServerUrl = url;
					loadDataJsFn();
				}, function (err) {
					console.log("Error starting local server: " + err + ". Video playback will not work.");
					loadDataJsFn();
				});
			}
			else {
				console.log("Local server unavailable. Video playback will not work.");
				loadDataJsFn();
			}
			return;
		}
		var xhr;
		if (this.isWindowsPhone8)
			xhr = new ActiveXObject("Microsoft.XMLHTTP");
		else
			xhr = new XMLHttpRequest();
		var datajs_filename = "./pre/data.js";
		if (this.isWindows8App || this.isWindowsPhone8 || this.isWindowsPhone81 || this.isWindows10)
			datajs_filename = "./pre/data.json";
		xhr.open("GET", datajs_filename, true);
		var supportsJsonResponse = false;
		if (!this.isDomFree && ("response" in xhr) && ("responseType" in xhr)) {
			try {
				xhr["responseType"] = "json";
				supportsJsonResponse = (xhr["responseType"] === "json");
			}
			catch (e) {
				supportsJsonResponse = false;
			}
		}
		if (!supportsJsonResponse && ("responseType" in xhr)) {
			try {
				xhr["responseType"] = "text";
			}
			catch (e) {
			}
		}
		if ("overrideMimeType" in xhr) {
			try {
				xhr["overrideMimeType"]("application/json; charset=utf-8");
			}
			catch (e) {
			}
		}
		if (this.isWindowsPhone8) {
			xhr.onreadystatechange = function () {
				if (xhr.readyState !== 4)
					return;
				self.loadProject(JSON.parse(xhr["responseText"]));
			};
		} else {
			xhr.onload = function () {
				if (supportsJsonResponse) {
					self.loadProject(xhr["response"]);					// already parsed by browser
				}
				else {
					if (self.isEjecta) {
						var str = xhr["responseText"];
						str = str.substr(str.indexOf("{"));		// trim any BOM
						self.loadProject(JSON.parse(str));
					}
					else {
						self.loadProject(JSON.parse(xhr["responseText"]));	// forced to sync parse JSON
					}
				}
			};
			xhr.onerror = function (e) {
				cr.logerror("Error requesting " + datajs_filename + ":");
				cr.logerror(e);
			};
		}
		xhr.send();
	}
	Runtime.prototype.initRendererAndLoader = function () {
		var self = this;
		var i, len, j, lenj, k, lenk, t, s, l, y;
		this.isRetina = ((!this.isDomFree || this.isEjecta || this.isCordova) && this.useHighDpi && !this.isAndroidStockBrowser);
		if (this.fullscreen_mode === 0 && this.isiOS)
			this.isRetina = false;
		this.devicePixelRatio = (this.isRetina ? (window["devicePixelRatio"] || window["webkitDevicePixelRatio"] || window["mozDevicePixelRatio"] || window["msDevicePixelRatio"] || 1) : 1);
		this.ClearDeathRow();
		var attribs;
		if (this.fullscreen_mode > 0)
			this["setSize"](window.innerWidth, window.innerHeight, true);
		this.canvas.addEventListener("webglcontextlost", function (ev) {
			console.log('webglcontextlost')
			ev.preventDefault();
			self.onContextLost();
			cr.logexport("[Construct 2] WebGL context lost");
			window["cr_setSuspended"](true);		// stop rendering
		}, false);
		this.canvas.addEventListener("webglcontextrestored", function (ev) {
			console.log('webglcontextrestored')
			self.glwrap.initState();
			self.glwrap.setSize(self.glwrap.width, self.glwrap.height, true);
			self.layer_tex = null;
			self.layout_tex = null;
			self.fx_tex[0] = null;
			self.fx_tex[1] = null;
			self.onContextRestored();
			self.redraw = true;
			cr.logexport("[Construct 2] WebGL context restored");
			window["cr_setSuspended"](false);		// resume rendering
		}, false);
		try {
			if (this.enableWebGL && (this.isCocoonJs || this.isEjecta || !this.isDomFree)) {
				attribs = {
					"alpha": true,
					"depth": false,
					"antialias": false,
					"powerPreference": "high-performance",
					"failIfMajorPerformanceCaveat": true
				};
				this.gl = (this.canvas.getContext("webgl2", attribs) ||
					this.canvas.getContext("webgl", attribs) ||
					this.canvas.getContext("experimental-webgl", attribs));
			}
		}
		catch (e) {
		}
		if (this.gl) {
			var isWebGL2 = (this.gl.getParameter(this.gl.VERSION).indexOf("WebGL 2") === 0);
			var debug_ext = this.gl.getExtension("WEBGL_debug_renderer_info");
			if (debug_ext) {
				var unmasked_vendor = this.gl.getParameter(debug_ext.UNMASKED_VENDOR_WEBGL);
				var unmasked_renderer = this.gl.getParameter(debug_ext.UNMASKED_RENDERER_WEBGL);
				this.glUnmaskedRenderer = unmasked_renderer + " [" + unmasked_vendor + "]";
			}
			if (this.enableFrontToBack)
				this.glUnmaskedRenderer += " [front-to-back enabled]";
			;
			if (!this.isDomFree) {
				this.overlay_canvas = document.createElement("canvas");
				this.canvas.parentNode.appendChild(this.overlay_canvas)
				// $(this.overlay_canvas).appendTo(this.canvas.parentNode);
				this.overlay_canvas.oncontextmenu = function (e) {
					return false;
				};
				this.overlay_canvas.onselectstart = function (e) {
					return false;
				};
				this.overlay_canvas.width = Math.round(this.cssWidth * this.devicePixelRatio);
				this.overlay_canvas.height = Math.round(this.cssHeight * this.devicePixelRatio)
				this.overlay_canvas.style.width = this.cssWidth + "px"
				this.overlay_canvas.style.height = this.cssHeight + "px"
				// $(this.overlay_canvas).css({"width": this.cssWidth + "px",
				// 	"height": this.cssHeight + "px"});
				this.positionOverlayCanvas();
				this.overlay_ctx = this.overlay_canvas.getContext("2d");
			}
			console.log('cr.GLWrap', cr.GLWrap)
			this.glwrap = new cr.GLWrap(this.gl, this.isMobile, this.enableFrontToBack);
			this.glwrap.setSize(this.canvas.width, this.canvas.height);
			this.glwrap.enable_mipmaps = (this.downscalingQuality !== 0);
			this.ctx = null;
			for (i = 0, len = this.types_by_index.length; i < len; i++) {
				t = this.types_by_index[i];
				for (j = 0, lenj = t.effect_types.length; j < lenj; j++) {
					s = t.effect_types[j];
					s.shaderindex = this.glwrap.getShaderIndex(s.id);
					s.preservesOpaqueness = this.glwrap.programPreservesOpaqueness(s.shaderindex);
					this.uses_background_blending = this.uses_background_blending || this.glwrap.programUsesDest(s.shaderindex);
				}
			}
			for (i = 0, len = this.layouts_by_index.length; i < len; i++) {
				l = this.layouts_by_index[i];
				for (j = 0, lenj = l.effect_types.length; j < lenj; j++) {
					s = l.effect_types[j];
					s.shaderindex = this.glwrap.getShaderIndex(s.id);
					s.preservesOpaqueness = this.glwrap.programPreservesOpaqueness(s.shaderindex);
				}
				l.updateActiveEffects();		// update preserves opaqueness flag
				for (j = 0, lenj = l.layers.length; j < lenj; j++) {
					y = l.layers[j];
					for (k = 0, lenk = y.effect_types.length; k < lenk; k++) {
						s = y.effect_types[k];
						s.shaderindex = this.glwrap.getShaderIndex(s.id);
						s.preservesOpaqueness = this.glwrap.programPreservesOpaqueness(s.shaderindex);
						this.uses_background_blending = this.uses_background_blending || this.glwrap.programUsesDest(s.shaderindex);
					}
					y.updateActiveEffects();		// update preserves opaqueness flag
				}
			}
		}
		else {
			if (this.fullscreen_mode > 0 && this.isDirectCanvas) {
				;
				this.canvas = null;
				document.oncontextmenu = function (e) {
					return false;
				};
				document.onselectstart = function (e) {
					return false;
				};
				this.ctx = AppMobi["canvas"]["getContext"]("2d");
				try {
					this.ctx["samplingMode"] = this.linearSampling ? "smooth" : "sharp";
					this.ctx["globalScale"] = 1;
					this.ctx["HTML5CompatibilityMode"] = true;
					this.ctx["imageSmoothingEnabled"] = this.linearSampling;
				} catch (e) {
				}
				if (this.width !== 0 && this.height !== 0) {
					this.ctx.width = this.width;
					this.ctx.height = this.height;
				}
			}
			if (!this.ctx) {
				;
				if (this.isCocoonJs) {
					attribs = {
						"antialias": !!this.linearSampling,
						"alpha": true
					};
					this.ctx = this.canvas.getContext("2d", attribs);
				}
				else {
					attribs = {
						"alpha": true
					};
					this.ctx = this.canvas.getContext("2d", attribs);
				}
				this.setCtxImageSmoothingEnabled(this.ctx, this.linearSampling);
			}
			this.overlay_canvas = null;
			this.overlay_ctx = null;
		}
		this.tickFunc = function (timestamp) {
			self.tick(false, timestamp);
		};
		if (window != window.top && !this.isDomFree && !this.isWinJS && !this.isWindowsPhone8) {
			document.addEventListener("mousedown", function () {
				console.log('mousedown')
				window.focus();
			}, true);
			document.addEventListener("touchstart", function () {
				console.log('touchstart')
				window.focus();
			}, true);
		}
		if (typeof cr_is_preview !== "undefined") {
			if (this.isCocoonJs)
				console.log("[Construct 2] In preview-over-wifi via CocoonJS mode");
			if (window.location.search.indexOf("continuous") > -1) {
				cr.logexport("Reloading for continuous preview");
				this.loadFromSlot = "__c2_continuouspreview";
				this.suspendDrawing = true;
			}
			if (this.pauseOnBlur && !this.isMobile) {
				window.addEventListener("focus", function () {
					self["setSuspended"](false);
				});
				window.addEventListener("blur", function () {
					var parent = window.parent;
					if (!parent || !parent.document.hasFocus())
						self["setSuspended"](true);
				});
				// $(window).focus(function ()
				// {
				// 	self["setSuspended"](false);
				// });
				// $(window).blur(function ()
				// {
				// 	var parent = window.parent;
				// 	if (!parent || !parent.document.hasFocus())
				// 		self["setSuspended"](true);
				// });
			}
		}
		window.addEventListener("blur", function () {
			self.onWindowBlur();
		});
		if (!this.isDomFree) {
			var unfocusFormControlFunc = function (e) {
				console.log('unfocusFormControlFunc')
				// if (cr.isCanvasInputEvent(e) && document["activeElement"] && document["activeElement"] !== document.getElementsByTagName("body")[0] && document["activeElement"].blur) {
				// 	try {
				// 		console.log('unfocusFormControlFunc1')
				// 		document["activeElement"].blur();
				// 	}
				// 	catch (e) {
				// 	}
				// }
			}
			if (typeof PointerEvent !== "undefined") {
				document.addEventListener("pointerdown", unfocusFormControlFunc);
			}
			else if (window.navigator["msPointerEnabled"]) {
				document.addEventListener("MSPointerDown", unfocusFormControlFunc);
			}
			else {
				document.addEventListener("touchstart", unfocusFormControlFunc);
			}
			document.addEventListener("mousedown", unfocusFormControlFunc);
		}
		if (this.fullscreen_mode === 0 && this.isRetina && this.devicePixelRatio > 1) {
			this["setSize"](this.original_width, this.original_height, true);
		}
		this.tryLockOrientation();
		this.getready();	// determine things to preload
		this.go();			// run loading screen
		this.extra = {};
		cr.seal(this);
	}

	Runtime.prototype["setSize"] = function (w, h, force) {
		var offx = 0, offy = 0;
		var neww = 0, newh = 0, intscale = 0;
		if (this.lastWindowWidth === w && this.lastWindowHeight === h && !force)
			return;
		this.lastWindowWidth = w;
		this.lastWindowHeight = h;
		var mode = this.fullscreen_mode;
		var orig_aspect, cur_aspect;
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || !!document["msFullscreenElement"] || document["fullScreen"] || this.isNodeFullscreen) && !this.isCordova;
		if (!isfullscreen && this.fullscreen_mode === 0 && !force)
			return;			// ignore size events when not fullscreen and not using a fullscreen-in-browser mode
		if (isfullscreen && this.fullscreen_scaling > 0)
			mode = this.fullscreen_scaling;
		var dpr = this.devicePixelRatio;
		if (mode >= 4) {
			orig_aspect = this.original_width / this.original_height;
			cur_aspect = w / h;
			if (cur_aspect > orig_aspect) {
				neww = h * orig_aspect;
				if (mode === 5)	// integer scaling
				{
					intscale = (neww * dpr) / this.original_width;
					if (intscale > 1)
						intscale = Math.floor(intscale);
					else if (intscale < 1)
						intscale = 1 / Math.ceil(1 / intscale);
					neww = this.original_width * intscale / dpr;
					newh = this.original_height * intscale / dpr;
					offx = (w - neww) / 2;
					offy = (h - newh) / 2;
					w = neww;
					h = newh;
				}
				else {
					offx = (w - neww) / 2;
					w = neww;
				}
			}
			else {
				newh = w / orig_aspect;
				if (mode === 5)	// integer scaling
				{
					intscale = (newh * dpr) / this.original_height;
					if (intscale > 1)
						intscale = Math.floor(intscale);
					else if (intscale < 1)
						intscale = 1 / Math.ceil(1 / intscale);
					neww = this.original_width * intscale / dpr;
					newh = this.original_height * intscale / dpr;
					offx = (w - neww) / 2;
					offy = (h - newh) / 2;
					w = neww;
					h = newh;
				}
				else {
					offy = (h - newh) / 2;
					h = newh;
				}
			}
			if (isfullscreen && !this.isNWjs) {
				offx = 0;
				offy = 0;
			}
		}
		else if (this.isNWjs && this.isNodeFullscreen && this.fullscreen_mode_set === 0) {
			offx = Math.floor((w - this.original_width) / 2);
			offy = Math.floor((h - this.original_height) / 2);
			w = this.original_width;
			h = this.original_height;
		}
		if (mode < 2)
			this.aspect_scale = dpr;
		this.cssWidth = Math.round(w);
		this.cssHeight = Math.round(h);
		this.width = Math.round(w * dpr);
		this.height = Math.round(h * dpr);
		this.redraw = true;
		if (this.wantFullscreenScalingQuality) {
			this.draw_width = this.width;
			this.draw_height = this.height;
			this.fullscreenScalingQuality = true;
		}
		else {
			if ((this.width < this.original_width && this.height < this.original_height) || mode === 1) {
				this.draw_width = this.width;
				this.draw_height = this.height;
				this.fullscreenScalingQuality = true;
			}
			else {
				this.draw_width = this.original_width;
				this.draw_height = this.original_height;
				this.fullscreenScalingQuality = false;
				if (mode === 2)		// scale inner
				{
					orig_aspect = this.original_width / this.original_height;
					cur_aspect = this.lastWindowWidth / this.lastWindowHeight;
					if (cur_aspect < orig_aspect)
						this.draw_width = this.draw_height * cur_aspect;
					else if (cur_aspect > orig_aspect)
						this.draw_height = this.draw_width / cur_aspect;
				}
				else if (mode === 3) {
					orig_aspect = this.original_width / this.original_height;
					cur_aspect = this.lastWindowWidth / this.lastWindowHeight;
					if (cur_aspect > orig_aspect)
						this.draw_width = this.draw_height * cur_aspect;
					else if (cur_aspect < orig_aspect)
						this.draw_height = this.draw_width / cur_aspect;
				}
			}
		}
		if (this.canvasdiv && !this.isDomFree) {
			this.canvasdiv.style.width = Math.round(w) + "px"
			this.canvasdiv.style.height = Math.round(h) + "px"
			this.canvasdiv.style.marginLeft = Math.floor(offx) + "px"
			this.canvasdiv.style.marginTop = Math.floor(offy) + "px"
			// $(this.canvasdiv).css({"width": Math.round(w) + "px",
			// 	"height": Math.round(h) + "px",
			// 	"margin-left": Math.floor(offx) + "px",
			// 	"margin-top": Math.floor(offy) + "px"});
			if (typeof cr_is_preview !== "undefined") {
				document.getElementById('borderwrap').style.width = Math.round(w) + "px"
				document.getElementById('borderwrap').style.height = Math.round(h) + "px"
				// $("#borderwrap").css({"width": Math.round(w) + "px",
				// 	"height": Math.round(h) + "px"});
			}
		}
		if (this.canvas) {
			this.canvas.width = Math.round(w * dpr);
			this.canvas.height = Math.round(h * dpr);
			if (this.isEjecta) {
				this.canvas.style.left = Math.floor(offx) + "px";
				this.canvas.style.top = Math.floor(offy) + "px";
				this.canvas.style.width = Math.round(w) + "px";
				this.canvas.style.height = Math.round(h) + "px";
			}
			else if (this.isRetina && !this.isDomFree) {
				this.canvas.style.width = Math.round(w) + "px";
				this.canvas.style.height = Math.round(h) + "px";
			}
		}
		if (this.overlay_canvas) {
			this.overlay_canvas.width = Math.round(w * dpr);
			this.overlay_canvas.height = Math.round(h * dpr);
			this.overlay_canvas.style.width = this.cssWidth + "px";
			this.overlay_canvas.style.height = this.cssHeight + "px";
		}
		if (this.glwrap) {
			this.glwrap.setSize(Math.round(w * dpr), Math.round(h * dpr));
		}
		if (this.isDirectCanvas && this.ctx) {
			this.ctx.width = Math.round(w);
			this.ctx.height = Math.round(h);
		}
		if (this.ctx) {
			this.setCtxImageSmoothingEnabled(this.ctx, this.linearSampling);
		}
		this.tryLockOrientation();
		if (this.isiPhone && !this.isCordova) {
			// window.scrollTo(0, 0);
		}
	}
	Runtime.prototype.tryLockOrientation = function () {
		console.log('unfocusFormControlFunc tryLockOrientation')
		if (!this.autoLockOrientation || this.orientations === 0)
			return;
		var orientation = "portrait";
		if (this.orientations === 2)
			orientation = "landscape";
		try {
			if (screen["orientation"] && screen["orientation"]["lock"])
				screen["orientation"]["lock"](orientation).catch(function () {
				});
			else if (screen["lockOrientation"])
				screen["lockOrientation"](orientation);
			else if (screen["webkitLockOrientation"])
				screen["webkitLockOrientation"](orientation);
			else if (screen["mozLockOrientation"])
				screen["mozLockOrientation"](orientation);
			else if (screen["msLockOrientation"])
				screen["msLockOrientation"](orientation);
		}
		catch (e) {
			if (console && console.warn)
				console.warn("Failed to lock orientation: ", e);
		}
	};
	Runtime.prototype.onContextLost = function () {
		this.glwrap.contextLost();
		this.is_WebGL_context_lost = true;
		var i, len, t;
		for (i = 0, len = this.types_by_index.length; i < len; i++) {
			t = this.types_by_index[i];
			if (t.onLostWebGLContext)
				t.onLostWebGLContext();
		}
	};
	Runtime.prototype.onContextRestored = function () {
		this.is_WebGL_context_lost = false;
		var i, len, t;
		for (i = 0, len = this.types_by_index.length; i < len; i++) {
			t = this.types_by_index[i];
			if (t.onRestoreWebGLContext)
				t.onRestoreWebGLContext();
		}
	};
	Runtime.prototype.positionOverlayCanvas = function () {
		if (this.isDomFree)
			return;
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || !!document["msFullscreenElement"] || this.isNodeFullscreen) && !this.isCordova;
		var overlay_position = isfullscreen ? offsetFun(this.canvas) : this.canvas.style.position;
		overlay_position.position = "absolute";
		this.overlay_canvas.style.overlayPosition = ''
		// $(this.overlay_canvas).css(overlay_position);
	};
	var caf = window["cancelAnimationFrame"] ||
		window["mozCancelAnimationFrame"] ||
		window["webkitCancelAnimationFrame"] ||
		window["msCancelAnimationFrame"] ||
		window["oCancelAnimationFrame"];
	Runtime.prototype["setSuspended"] = function (s) {
		var i, len;
		var self = this;
		if (s && !this.isSuspended) {
			cr.logexport("[Construct 2] Suspending");
			this.isSuspended = true;			// next tick will be last
			if (this.raf_id !== -1 && caf)		// note: CocoonJS does not implement cancelAnimationFrame
				caf(this.raf_id);
			if (this.timeout_id !== -1)
				clearTimeout(this.timeout_id);
			for (i = 0, len = this.suspend_events.length; i < len; i++)
				this.suspend_events[i](true);
		}
		else if (!s && this.isSuspended) {
			cr.logexport("[Construct 2] Resuming");
			this.isSuspended = false;
			this.last_tick_time = cr.performance_now();	// ensure first tick is a zero-dt one
			this.last_fps_time = cr.performance_now();	// reset FPS counter
			this.framecount = 0;
			this.logictime = 0;
			for (i = 0, len = this.suspend_events.length; i < len; i++)
				this.suspend_events[i](false);
			this.tick(false);						// kick off runtime again
		}
	};
	Runtime.prototype.addSuspendCallback = function (f) {
		this.suspend_events.push(f);
	};
	Runtime.prototype.GetObjectReference = function (i) {
		return this.objectRefTable[i];
	};
	Runtime.prototype.loadProject = function (data_response) {
		console.log('loadProject')
		if (!data_response || !data_response["project"])
			cr.logerror("Project model unavailable");
		var pm = data_response["project"];
		this.name = pm[0];
		this.first_layout = pm[1];
		this.fullscreen_mode = pm[12];	// 0 = off, 1 = crop, 2 = scale inner, 3 = scale outer, 4 = letterbox scale, 5 = integer letterbox scale
		this.fullscreen_mode_set = pm[12];
		this.original_width = pm[10];
		this.original_height = pm[11];
		this.parallax_x_origin = this.original_width / 2;
		this.parallax_y_origin = this.original_height / 2;
		if (this.isDomFree && !this.isEjecta && (pm[12] >= 4 || pm[12] === 0)) {
			cr.logexport("[Construct 2] Letterbox scale fullscreen modes are not supported on this platform - falling back to 'Scale outer'");
			this.fullscreen_mode = 3;
			this.fullscreen_mode_set = 3;
		}
		this.uses_loader_layout = pm[18];
		this.loaderstyle = pm[19];
		if (this.loaderstyle === 0) {
			var loaderImage = new Image();
			loaderImage.crossOrigin = "anonymous";
			this.setImageSrc(loaderImage, "loading-logo.png");
			this.loaderlogos = {
				logo: loaderImage
			};
		}
		else if (this.loaderstyle === 4) {
			var loaderC2logo_1024 = new Image();
			loaderC2logo_1024.src = "";
			var loaderC2logo_512 = new Image();
			loaderC2logo_512.src = "";
			var loaderC2logo_256 = new Image();
			loaderC2logo_256.src = "";
			var loaderC2logo_128 = new Image();
			loaderC2logo_128.src = "";
			var loaderPowered_1024 = new Image();
			loaderPowered_1024.src = "";
			var loaderPowered_512 = new Image();
			loaderPowered_512.src = "";
			var loaderPowered_256 = new Image();
			loaderPowered_256.src = "";
			var loaderPowered_128 = new Image();
			loaderPowered_128.src = "";
			var loaderWebsite_1024 = new Image();
			loaderWebsite_1024.src = "";
			var loaderWebsite_512 = new Image();
			loaderWebsite_512.src = "";
			var loaderWebsite_256 = new Image();
			loaderWebsite_256.src = "";
			var loaderWebsite_128 = new Image();
			loaderWebsite_128.src = "";
			this.loaderlogos = {
				logo: [loaderC2logo_1024, loaderC2logo_512, loaderC2logo_256, loaderC2logo_128],
				powered: [loaderPowered_1024, loaderPowered_512, loaderPowered_256, loaderPowered_128],
				website: [loaderWebsite_1024, loaderWebsite_512, loaderWebsite_256, loaderWebsite_128]
			};
		}
		this.next_uid = pm[21];
		this.objectRefTable = cr.getObjectRefTable();
		this.system = new cr.system_object(this);
		var i, len, j, lenj, k, lenk, idstr, m, b, t, f, p;
		var plugin, plugin_ctor;
		for (i = 0, len = pm[2].length; i < len; i++) {
			m = pm[2][i];
			p = this.GetObjectReference(m[0]);
			cr.add_common_aces(m, p.prototype);
			plugin = new p(this);
			plugin.singleglobal = m[1];
			plugin.is_world = m[2];
			plugin.is_rotatable = m[5];
			plugin.must_predraw = m[9];
			if (plugin.onCreate)
				plugin.onCreate();
			cr.seal(plugin);
			this.plugins.push(plugin);
		}
		this.objectRefTable = cr.getObjectRefTable();
		for (i = 0, len = pm[3].length; i < len; i++) {
			m = pm[3][i];
			plugin_ctor = this.GetObjectReference(m[1]);
			;
			plugin = null;
			for (j = 0, lenj = this.plugins.length; j < lenj; j++) {
				if (this.plugins[j] instanceof plugin_ctor) {
					plugin = this.plugins[j];
					break;
				}
			}
			var type_inst = new plugin.Type(plugin);
			type_inst.name = m[0];
			type_inst.is_family = m[2];
			type_inst.instvar_sids = m[3].slice(0);
			type_inst.vars_count = m[3].length;
			type_inst.behs_count = m[4];
			type_inst.fx_count = m[5];
			type_inst.sid = m[11];
			if (type_inst.is_family) {
				type_inst.members = [];				// types in this family
				type_inst.family_index = this.family_count++;
				type_inst.families = null;
			}
			else {
				type_inst.members = null;
				type_inst.family_index = -1;
				type_inst.families = [];			// families this type belongs to
			}
			type_inst.family_var_map = null;
			type_inst.family_beh_map = null;
			type_inst.family_fx_map = null;
			type_inst.is_contained = false;
			type_inst.container = null;
			if (m[6]) {
				type_inst.texture_file = m[6][0];
				type_inst.texture_filesize = m[6][1];
				type_inst.texture_pixelformat = m[6][2];
			}
			else {
				type_inst.texture_file = null;
				type_inst.texture_filesize = 0;
				type_inst.texture_pixelformat = 0;		// rgba8
			}
			if (m[7]) {
				type_inst.animations = m[7];
			}
			else {
				type_inst.animations = null;
			}
			type_inst.index = i;                                // save index in to types array in type
			type_inst.instances = [];                           // all instances of this type
			type_inst.deadCache = [];							// destroyed instances to recycle next create
			type_inst.solstack = [new cr.selection(type_inst)]; // initialise SOL stack with one empty SOL
			type_inst.cur_sol = 0;
			type_inst.default_instance = null;
			type_inst.default_layerindex = 0;
			type_inst.stale_iids = true;
			type_inst.updateIIDs = cr.type_updateIIDs;
			type_inst.getFirstPicked = cr.type_getFirstPicked;
			type_inst.getPairedInstance = cr.type_getPairedInstance;
			type_inst.getCurrentSol = cr.type_getCurrentSol;
			type_inst.pushCleanSol = cr.type_pushCleanSol;
			type_inst.pushCopySol = cr.type_pushCopySol;
			type_inst.popSol = cr.type_popSol;
			type_inst.getBehaviorByName = cr.type_getBehaviorByName;
			type_inst.getBehaviorIndexByName = cr.type_getBehaviorIndexByName;
			type_inst.getEffectIndexByName = cr.type_getEffectIndexByName;
			type_inst.applySolToContainer = cr.type_applySolToContainer;
			type_inst.getInstanceByIID = cr.type_getInstanceByIID;
			type_inst.collision_grid = new cr.SparseGrid(this.original_width, this.original_height);
			type_inst.any_cell_changed = true;
			type_inst.any_instance_parallaxed = false;
			type_inst.extra = {};
			type_inst.toString = cr.type_toString;
			type_inst.behaviors = [];
			for (j = 0, lenj = m[8].length; j < lenj; j++) {
				b = m[8][j];
				var behavior_ctor = this.GetObjectReference(b[1]);
				var behavior_plugin = null;
				for (k = 0, lenk = this.behaviors.length; k < lenk; k++) {
					if (this.behaviors[k] instanceof behavior_ctor) {
						behavior_plugin = this.behaviors[k];
						break;
					}
				}
				if (!behavior_plugin) {
					behavior_plugin = new behavior_ctor(this);
					behavior_plugin.my_types = [];						// types using this behavior
					behavior_plugin.my_instances = new cr.ObjectSet(); 	// instances of this behavior
					if (behavior_plugin.onCreate)
						behavior_plugin.onCreate();
					cr.seal(behavior_plugin);
					this.behaviors.push(behavior_plugin);
					if (cr.behaviors.solid && behavior_plugin instanceof cr.behaviors.solid)
						this.solidBehavior = behavior_plugin;
					if (cr.behaviors.jumpthru && behavior_plugin instanceof cr.behaviors.jumpthru)
						this.jumpthruBehavior = behavior_plugin;
					if (cr.behaviors.shadowcaster && behavior_plugin instanceof cr.behaviors.shadowcaster)
						this.shadowcasterBehavior = behavior_plugin;
				}
				if (behavior_plugin.my_types.indexOf(type_inst) === -1)
					behavior_plugin.my_types.push(type_inst);
				var behavior_type = new behavior_plugin.Type(behavior_plugin, type_inst);
				behavior_type.name = b[0];
				behavior_type.sid = b[2];
				behavior_type.onCreate();
				cr.seal(behavior_type);
				type_inst.behaviors.push(behavior_type);
			}
			type_inst.global = m[9];
			type_inst.isOnLoaderLayout = m[10];
			type_inst.effect_types = [];
			for (j = 0, lenj = m[12].length; j < lenj; j++) {
				type_inst.effect_types.push({
					id: m[12][j][0],
					name: m[12][j][1],
					shaderindex: -1,
					preservesOpaqueness: false,
					active: true,
					index: j
				});
			}
			type_inst.tile_poly_data = m[13];
			if (!this.uses_loader_layout || type_inst.is_family || type_inst.isOnLoaderLayout || !plugin.is_world) {
				type_inst.onCreate();
				cr.seal(type_inst);
			}
			if (type_inst.name)
				this.types[type_inst.name] = type_inst;
			this.types_by_index.push(type_inst);
			if (plugin.singleglobal) {
				var instance = new plugin.Instance(type_inst);
				console.log('type_inst', type_inst)
				instance.uid = this.next_uid++;
				instance.puid = this.next_puid++;
				instance.iid = 0;
				instance.get_iid = cr.inst_get_iid;
				instance.toString = cr.inst_toString;
				instance.properties = m[14];
				instance.onCreate();
				cr.seal(instance);
				type_inst.instances.push(instance);
				this.objectsByUid[instance.uid.toString()] = instance;
			}
		}
		for (i = 0, len = pm[4].length; i < len; i++) {
			var familydata = pm[4][i];
			var familytype = this.types_by_index[familydata[0]];
			var familymember;
			for (j = 1, lenj = familydata.length; j < lenj; j++) {
				familymember = this.types_by_index[familydata[j]];
				familymember.families.push(familytype);
				familytype.members.push(familymember);
			}
		}
		for (i = 0, len = pm[28].length; i < len; i++) {
			var containerdata = pm[28][i];
			var containertypes = [];
			for (j = 0, lenj = containerdata.length; j < lenj; j++)
				containertypes.push(this.types_by_index[containerdata[j]]);
			for (j = 0, lenj = containertypes.length; j < lenj; j++) {
				containertypes[j].is_contained = true;
				containertypes[j].container = containertypes;
			}
		}
		if (this.family_count > 0) {
			for (i = 0, len = this.types_by_index.length; i < len; i++) {
				t = this.types_by_index[i];
				if (t.is_family || !t.families.length)
					continue;
				t.family_var_map = new Array(this.family_count);
				t.family_beh_map = new Array(this.family_count);
				t.family_fx_map = new Array(this.family_count);
				var all_fx = [];
				var varsum = 0;
				var behsum = 0;
				var fxsum = 0;
				for (j = 0, lenj = t.families.length; j < lenj; j++) {
					f = t.families[j];
					t.family_var_map[f.family_index] = varsum;
					varsum += f.vars_count;
					t.family_beh_map[f.family_index] = behsum;
					behsum += f.behs_count;
					t.family_fx_map[f.family_index] = fxsum;
					fxsum += f.fx_count;
					for (k = 0, lenk = f.effect_types.length; k < lenk; k++)
						all_fx.push(cr.shallowCopy({}, f.effect_types[k]));
				}
				t.effect_types = all_fx.concat(t.effect_types);
				for (j = 0, lenj = t.effect_types.length; j < lenj; j++)
					t.effect_types[j].index = j;
			}
		}
		for (i = 0, len = pm[5].length; i < len; i++) {
			m = pm[5][i];
			var layout = new cr.layout(this, m);
			cr.seal(layout);
			this.layouts[layout.name] = layout;
			this.layouts_by_index.push(layout);
		}
		for (i = 0, len = pm[6].length; i < len; i++) {
			m = pm[6][i];
			var sheet = new cr.eventsheet(this, m);
			cr.seal(sheet);
			this.eventsheets[sheet.name] = sheet;
			this.eventsheets_by_index.push(sheet);
		}
		for (i = 0, len = this.eventsheets_by_index.length; i < len; i++)
			this.eventsheets_by_index[i].postInit();
		for (i = 0, len = this.eventsheets_by_index.length; i < len; i++)
			this.eventsheets_by_index[i].updateDeepIncludes();
		for (i = 0, len = this.triggers_to_postinit.length; i < len; i++)
			this.triggers_to_postinit[i].postInit();
		cr.clearArray(this.triggers_to_postinit)
		this.audio_to_preload = pm[7];
		this.files_subfolder = pm[8];
		this.pixel_rounding = pm[9];
		this.aspect_scale = 1.0;
		this.enableWebGL = pm[13];
		this.linearSampling = pm[14];
		this.clearBackground = pm[15];
		this.versionstr = pm[16];
		this.useHighDpi = pm[17];
		this.orientations = pm[20];		// 0 = any, 1 = portrait, 2 = landscape
		this.autoLockOrientation = (this.orientations > 0);
		this.pauseOnBlur = pm[22];
		this.wantFullscreenScalingQuality = pm[23];		// false = low quality, true = high quality
		this.fullscreenScalingQuality = this.wantFullscreenScalingQuality;
		this.downscalingQuality = pm[24];	// 0 = low (mips off), 1 = medium (mips on, dense spritesheet), 2 = high (mips on, sparse spritesheet)
		this.preloadSounds = pm[25];		// 0 = no, 1 = yes
		this.projectName = pm[26];
		this.enableFrontToBack = pm[27] && !this.isIE;		// front-to-back renderer disabled in IE (but not Edge)
		this.start_time = Date.now();
		cr.clearArray(this.objectRefTable);
		this.initRendererAndLoader();
	}
	var anyImageHadError = false;
	Runtime.prototype.waitForImageLoad = function (img_, src_) {
		img_["cocoonLazyLoad"] = true;
		img_.onerror = function (e) {
			img_.c2error = true;
			anyImageHadError = true;
			if (console && console.error)
				console.error("Error loading image '" + img_.src + "': ", e);
		};
		if (this.isEjecta) {
			img_.src = src_;
		}
		else if (!img_.src) {
			if (typeof XAPKReader !== "undefined") {
				XAPKReader.get(src_, function (expanded_url) {
					img_.src = expanded_url;
				}, function (e) {
					img_.c2error = true;
					anyImageHadError = true;
					if (console && console.error)
						console.error("Error extracting image '" + src_ + "' from expansion file: ", e);
				});
			}
			else {
				img_.crossOrigin = "anonymous";			// required for Arcade sandbox compatibility
				this.setImageSrc(img_, src_);			// work around WKWebView problems
			}
		}
		this.wait_for_textures.push(img_);
	};
	Runtime.prototype.findWaitingTexture = function (src_) {
		var i, len;
		for (i = 0, len = this.wait_for_textures.length; i < len; i++) {
			if (this.wait_for_textures[i].cr_src === src_)
				return this.wait_for_textures[i];
		}
		return null;
	};
	var audio_preload_totalsize = 0;
	var audio_preload_started = false;
	Runtime.prototype.getready = function () {
		console.log('getready')
		if (!this.audioInstance)
			return;
		audio_preload_totalsize = this.audioInstance.setPreloadList(this.audio_to_preload);
	};
	Runtime.prototype.areAllTexturesAndSoundsLoaded = function () {
		var totalsize = audio_preload_totalsize;
		var completedsize = 0;
		var audiocompletedsize = 0;
		var ret = true;
		var i, len, img;
		for (i = 0, len = this.wait_for_textures.length; i < len; i++) {
			img = this.wait_for_textures[i];
			var filesize = img.cr_filesize;
			if (!filesize || filesize <= 0)
				filesize = 50000;
			totalsize += filesize;
			if (!!img.src && (img.complete || img["loaded"]) && !img.c2error)
				completedsize += filesize;
			else
				ret = false;    // not all textures loaded
		}
		if (ret && this.preloadSounds && this.audioInstance) {
			if (!audio_preload_started) {
				this.audioInstance.startPreloads();
				audio_preload_started = true;
			}
			audiocompletedsize = this.audioInstance.getPreloadedSize();
			completedsize += audiocompletedsize;
			if (audiocompletedsize < audio_preload_totalsize)
				ret = false;		// not done yet
		}
		if (totalsize == 0)
			this.progress = 1;		// indicate to C2 splash loader that it can finish now
		else
			this.progress = (completedsize / totalsize);
		return ret;
	};
	var isC2SplashDone = false;
	Runtime.prototype.go = function () {
		console.log('go')
		if (!this.ctx && !this.glwrap)
			return;
		var ctx = this.ctx || this.overlay_ctx;
		if (this.overlay_canvas)
			this.positionOverlayCanvas();
		var curwidth = window.innerWidth;
		var curheight = window.innerHeight;
		if (this.lastWindowWidth !== curwidth || this.lastWindowHeight !== curheight) {
			this["setSize"](curwidth, curheight);
		}
		this.progress = 0;
		this.last_progress = -1;
		var self = this;
		if (this.areAllTexturesAndSoundsLoaded() && (this.loaderstyle !== 4 || isC2SplashDone)) {
			this.go_loading_finished();
		}
		else {
			var ms_elapsed = Date.now() - this.start_time;
			if (ctx) {
				var overlay_width = this.width;
				var overlay_height = this.height;
				var dpr = this.devicePixelRatio;
				if (this.loaderstyle < 3 && (this.isCocoonJs || (ms_elapsed >= 500 && this.last_progress != this.progress))) {
					ctx.clearRect(0, 0, overlay_width, overlay_height);
					var mx = overlay_width / 2;
					var my = overlay_height / 2;
					var haslogo = (this.loaderstyle === 0 && this.loaderlogos.logo.complete);
					var hlw = 40 * dpr;
					var hlh = 0;
					var logowidth = 80 * dpr;
					var logoheight;
					if (haslogo) {
						var loaderLogoImage = this.loaderlogos.logo;
						logowidth = loaderLogoImage.width * dpr;
						logoheight = loaderLogoImage.height * dpr;
						hlw = logowidth / 2;
						hlh = logoheight / 2;
						ctx.drawImage(loaderLogoImage, cr.floor(mx - hlw), cr.floor(my - hlh), logowidth, logoheight);
					}
					if (this.loaderstyle <= 1) {
						my += hlh + (haslogo ? 12 * dpr : 0);
						mx -= hlw;
						mx = cr.floor(mx) + 0.5;
						my = cr.floor(my) + 0.5;
						ctx.fillStyle = anyImageHadError ? "red" : "DodgerBlue";
						ctx.fillRect(mx, my, Math.floor(logowidth * this.progress), 6 * dpr);
						ctx.strokeStyle = "black";
						ctx.strokeRect(mx, my, logowidth, 6 * dpr);
						ctx.strokeStyle = "white";
						ctx.strokeRect(mx - 1 * dpr, my - 1 * dpr, logowidth + 2 * dpr, 8 * dpr);
					}
					else if (this.loaderstyle === 2) {
						ctx.font = (this.isEjecta ? "12pt ArialMT" : "12pt Arial");
						ctx.fillStyle = anyImageHadError ? "#f00" : "#999";
						ctx.textBaseLine = "middle";
						var percent_text = Math.round(this.progress * 100) + "%";
						var text_dim = ctx.measureText ? ctx.measureText(percent_text) : null;
						var text_width = text_dim ? text_dim.width : 0;
						ctx.fillText(percent_text, mx - (text_width / 2), my);
					}
					this.last_progress = this.progress;
				}
				else if (this.loaderstyle === 4) {
					this.draw_c2_splash_loader(ctx);
					if (raf)
						raf(function () {
							self.go();
						});
					else
						setTimeout(function () {
							self.go();
						}, 16);
					return;
				}
			}
			setTimeout(function () {
				self.go();
			}, (this.isCocoonJs ? 10 : 100));
		}
	};
	var splashStartTime = -1;
	var splashFadeInDuration = 300;
	var splashFadeOutDuration = 300;
	var splashAfterFadeOutWait = (typeof cr_is_preview === "undefined" ? 200 : 0);
	var splashIsFadeIn = true;
	var splashIsFadeOut = false;
	var splashFadeInFinish = 0;
	var splashFadeOutStart = 0;
	var splashMinDisplayTime = (typeof cr_is_preview === "undefined" ? 3000 : 0);
	var renderViaCanvas = null;
	var renderViaCtx = null;
	var splashFrameNumber = 0;

	function maybeCreateRenderViaCanvas(w, h) {
		if (!renderViaCanvas || renderViaCanvas.width !== w || renderViaCanvas.height !== h) {
			renderViaCanvas = document.createElement("canvas");
			renderViaCanvas.width = w;
			renderViaCanvas.height = h;
			renderViaCtx = renderViaCanvas.getContext("2d");
		}
	};

	function mipImage(arr, size) {
		if (size <= 128)
			return arr[3];
		else if (size <= 256)
			return arr[2];
		else if (size <= 512)
			return arr[1];
		else
			return arr[0];
	};
	Runtime.prototype.draw_c2_splash_loader = function (ctx) {
		if (isC2SplashDone)
			return;
		var w = Math.ceil(this.width);
		var h = Math.ceil(this.height);
		var dpr = this.devicePixelRatio;
		var logoimages = this.loaderlogos.logo;
		var poweredimages = this.loaderlogos.powered;
		var websiteimages = this.loaderlogos.website;
		for (var i = 0; i < 4; ++i) {
			if (!logoimages[i].complete || !poweredimages[i].complete || !websiteimages[i].complete)
				return;
		}
		if (splashFrameNumber === 0)
			splashStartTime = Date.now();
		var nowTime = Date.now();
		var isRenderingVia = false;
		var renderToCtx = ctx;
		var drawW, drawH;
		if (splashIsFadeIn || splashIsFadeOut) {
			ctx.clearRect(0, 0, w, h);
			maybeCreateRenderViaCanvas(w, h);
			renderToCtx = renderViaCtx;
			isRenderingVia = true;
			if (splashIsFadeIn && splashFrameNumber === 1)
				splashStartTime = Date.now();
		}
		else {
			ctx.globalAlpha = 1;
		}
		renderToCtx.fillStyle = "#333333";
		renderToCtx.fillRect(0, 0, w, h);
		if (this.cssHeight > 256) {
			drawW = cr.clamp(h * 0.22, 105, w * 0.6);
			drawH = drawW * 0.25;
			renderToCtx.drawImage(mipImage(poweredimages, drawW), w * 0.5 - drawW / 2, h * 0.2 - drawH / 2, drawW, drawH);
			drawW = Math.min(h * 0.395, w * 0.95);
			drawH = drawW;
			renderToCtx.drawImage(mipImage(logoimages, drawW), w * 0.5 - drawW / 2, h * 0.485 - drawH / 2, drawW, drawH);
			drawW = cr.clamp(h * 0.22, 105, w * 0.6);
			drawH = drawW * 0.25;
			renderToCtx.drawImage(mipImage(websiteimages, drawW), w * 0.5 - drawW / 2, h * 0.868 - drawH / 2, drawW, drawH);
			renderToCtx.fillStyle = "#3C3C3C";
			drawW = w;
			drawH = Math.max(h * 0.005, 2);
			renderToCtx.fillRect(0, h * 0.8 - drawH / 2, drawW, drawH);
			renderToCtx.fillStyle = anyImageHadError ? "red" : "#E0FF65";
			drawW = w * this.progress;
			renderToCtx.fillRect(w * 0.5 - drawW / 2, h * 0.8 - drawH / 2, drawW, drawH);
		}
		else {
			drawW = h * 0.55;
			drawH = drawW;
			renderToCtx.drawImage(mipImage(logoimages, drawW), w * 0.5 - drawW / 2, h * 0.45 - drawH / 2, drawW, drawH);
			renderToCtx.fillStyle = "#3C3C3C";
			drawW = w;
			drawH = Math.max(h * 0.005, 2);
			renderToCtx.fillRect(0, h * 0.85 - drawH / 2, drawW, drawH);
			renderToCtx.fillStyle = anyImageHadError ? "red" : "#E0FF65";
			drawW = w * this.progress;
			renderToCtx.fillRect(w * 0.5 - drawW / 2, h * 0.85 - drawH / 2, drawW, drawH);
		}
		if (isRenderingVia) {
			if (splashIsFadeIn) {
				if (splashFrameNumber === 0)
					ctx.globalAlpha = 0;
				else
					ctx.globalAlpha = Math.min((nowTime - splashStartTime) / splashFadeInDuration, 1);
			}
			else if (splashIsFadeOut) {
				ctx.globalAlpha = Math.max(1 - (nowTime - splashFadeOutStart) / splashFadeOutDuration, 0);
			}
			ctx.drawImage(renderViaCanvas, 0, 0, w, h);
		}
		if (splashIsFadeIn && nowTime - splashStartTime >= splashFadeInDuration && splashFrameNumber >= 2) {
			splashIsFadeIn = false;
			splashFadeInFinish = nowTime;
		}
		if (!splashIsFadeIn && nowTime - splashFadeInFinish >= splashMinDisplayTime && !splashIsFadeOut && this.progress >= 1) {
			splashIsFadeOut = true;
			splashFadeOutStart = nowTime;
		}
		if ((splashIsFadeOut && nowTime - splashFadeOutStart >= splashFadeOutDuration + splashAfterFadeOutWait) ||
			(typeof cr_is_preview !== "undefined" && this.progress >= 1 && Date.now() - splashStartTime < 500)) {
			isC2SplashDone = true;
			splashIsFadeIn = false;
			splashIsFadeOut = false;
			renderViaCanvas = null;
			renderViaCtx = null;
			this.loaderlogos = null;
		}
		++splashFrameNumber;
	};
	Runtime.prototype.go_loading_finished = function () {
		if (this.overlay_canvas) {
			this.canvas.parentNode.removeChild(this.overlay_canvas);
			this.overlay_ctx = null;
			this.overlay_canvas = null;
		}
		this.start_time = Date.now();
		this.last_fps_time = cr.performance_now();       // for counting framerate
		var i, len, t;
		if (this.uses_loader_layout) {
			for (i = 0, len = this.types_by_index.length; i < len; i++) {
				t = this.types_by_index[i];
				if (!t.is_family && !t.isOnLoaderLayout && t.plugin.is_world) {
					t.onCreate();
					cr.seal(t);
				}
			}
		}
		else
			this.isloading = false;
		for (i = 0, len = this.layouts_by_index.length; i < len; i++) {
			this.layouts_by_index[i].createGlobalNonWorlds();
		}
		if (this.fullscreen_mode >= 2) {
			var orig_aspect = this.original_width / this.original_height;
			var cur_aspect = this.width / this.height;
			if ((this.fullscreen_mode !== 2 && cur_aspect > orig_aspect) || (this.fullscreen_mode === 2 && cur_aspect < orig_aspect))
				this.aspect_scale = this.height / this.original_height;
			else
				this.aspect_scale = this.width / this.original_width;
		}
		if (this.first_layout)
			this.layouts[this.first_layout].startRunning();
		else
			this.layouts_by_index[0].startRunning();
		;
		if (!this.uses_loader_layout) {
			this.loadingprogress = 1;
			this.trigger(cr.system_object.prototype.cnds.OnLoadFinished, null);
			if (window["C2_RegisterSW"])		// note not all platforms use SW
				window["C2_RegisterSW"]();
		}
		if (navigator["splashscreen"] && navigator["splashscreen"]["hide"])
			navigator["splashscreen"]["hide"]();
		for (i = 0, len = this.types_by_index.length; i < len; i++) {
			t = this.types_by_index[i];
			if (t.onAppBegin)
				t.onAppBegin();
		}
		if (document["hidden"] || document["webkitHidden"] || document["mozHidden"] || document["msHidden"]) {
			window["cr_setSuspended"](true);		// stop rendering
		}
		else {
			this.tick(false);
		}
		if (this.isDirectCanvas)
			AppMobi["webview"]["execute"]("onGameReady();");
	};
	Runtime.prototype.tick = function (background_wake, timestamp, debug_step) {
		// console.log('tick')
		if (!this.running_layout)
			return;
		var nowtime = cr.performance_now();
		var logic_start = nowtime;
		if (!debug_step && this.isSuspended && !background_wake)
			return;
		if (!background_wake) {
			if (raf)
				this.raf_id = raf(this.tickFunc);
			else {
				this.timeout_id = setTimeout(this.tickFunc, this.isMobile ? 1 : 16);
			}
		}
		var raf_time = timestamp || nowtime;
		var fsmode = this.fullscreen_mode;
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || !!document["msFullscreenElement"]) && !this.isCordova;
		if ((isfullscreen || this.isNodeFullscreen) && this.fullscreen_scaling > 0)
			fsmode = this.fullscreen_scaling;
		if (fsmode > 0)	// r222: experimentally enabling this workaround for all platforms
		{
			var curwidth = window.innerWidth;
			var curheight = window.innerHeight;
			if (this.lastWindowWidth !== curwidth || this.lastWindowHeight !== curheight) {
				this["setSize"](curwidth, curheight);
			}
		}
		if (!this.isDomFree) {
			if (isfullscreen) {
				if (!this.firstInFullscreen) {
					this.fullscreenOldMarginCss = this.canvas.style.margin || "0";
					this.firstInFullscreen = true;
				}
				if (!this.isChrome && !this.isNWjs) {
					this.canvas.style.marginLeft = "" + Math.floor((screen.width - (this.width / this.devicePixelRatio)) / 2) + "px"
					this.canvas.style.marginTop = "" + Math.floor((screen.height - (this.height / this.devicePixelRatio)) / 2) + "px"
					// $(this.canvas).css({
					// 	"margin-left": "" + Math.floor((screen.width - (this.width / this.devicePixelRatio)) / 2) + "px",
					// 	"margin-top": "" + Math.floor((screen.height - (this.height / this.devicePixelRatio)) / 2) + "px"
					// });
				}
			}
			else {
				if (this.firstInFullscreen) {
					if (!this.isChrome && !this.isNWjs) {
						this.canvas.style.margin = this.fullscreenOldMarginCss
						// $(this.canvas).css("margin", this.fullscreenOldMarginCss);
					}
					this.fullscreenOldMarginCss = "";
					this.firstInFullscreen = false;
					if (this.fullscreen_mode === 0) {
						this["setSize"](Math.round(this.oldWidth / this.devicePixelRatio), Math.round(this.oldHeight / this.devicePixelRatio), true);
					}
				}
				else {
					this.oldWidth = this.width;
					this.oldHeight = this.height;
				}
			}
		}
		if (this.isloading) {
			var done = this.areAllTexturesAndSoundsLoaded();		// updates this.progress
			this.loadingprogress = this.progress;
			if (done) {
				this.isloading = false;
				this.progress = 1;
				this.trigger(cr.system_object.prototype.cnds.OnLoadFinished, null);
				if (window["C2_RegisterSW"])
					window["C2_RegisterSW"]();
			}
		}
		this.logic(raf_time);
		if ((this.redraw || this.isCocoonJs) && !this.is_WebGL_context_lost && !this.suspendDrawing && !background_wake) {
			this.redraw = false;
			if (this.glwrap)
				this.drawGL();
			else
				this.draw();
			if (this.snapshotCanvas) {
				if (this.canvas && this.canvas.toDataURL) {
					this.snapshotData = this.canvas.toDataURL(this.snapshotCanvas[0], this.snapshotCanvas[1]);
					if (window["cr_onSnapshot"])
						window["cr_onSnapshot"](this.snapshotData);
					this.trigger(cr.system_object.prototype.cnds.OnCanvasSnapshot, null);
				}
				this.snapshotCanvas = null;
			}
		}
		if (!this.hit_breakpoint) {
			this.tickcount++;
			this.execcount++;
			this.framecount++;
		}
		this.logictime += cr.performance_now() - logic_start;
	};
	Runtime.prototype.logic = function (cur_time) {
		var i, leni, j, lenj, k, lenk, type, inst, binst;
		if (cur_time - this.last_fps_time >= 1000)  // every 1 second
		{
			this.last_fps_time += 1000;
			if (cur_time - this.last_fps_time >= 1000)
				this.last_fps_time = cur_time;
			this.fps = this.framecount;
			this.framecount = 0;
			this.cpuutilisation = this.logictime;
			this.logictime = 0;
		}
		var wallDt = 0;
		if (this.last_tick_time !== 0) {
			var ms_diff = cur_time - this.last_tick_time;
			if (ms_diff < 0)
				ms_diff = 0;
			wallDt = ms_diff / 1000.0; // dt measured in seconds
			this.dt1 = wallDt;
			if (this.dt1 > 0.5)
				this.dt1 = 0;
			else if (this.dt1 > 1 / this.minimumFramerate)
				this.dt1 = 1 / this.minimumFramerate;
		}
		this.last_tick_time = cur_time;
		this.dt = this.dt1 * this.timescale;
		this.kahanTime.add(this.dt);
		this.wallTime.add(wallDt);		// prevent min/max framerate affecting wall clock
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || !!document["msFullscreenElement"] || this.isNodeFullscreen) && !this.isCordova;
		if (this.fullscreen_mode >= 2 /* scale */ || (isfullscreen && this.fullscreen_scaling > 0)) {
			var orig_aspect = this.original_width / this.original_height;
			var cur_aspect = this.width / this.height;
			var mode = this.fullscreen_mode;
			if (isfullscreen && this.fullscreen_scaling > 0)
				mode = this.fullscreen_scaling;
			if ((mode !== 2 && cur_aspect > orig_aspect) || (mode === 2 && cur_aspect < orig_aspect)) {
				this.aspect_scale = this.height / this.original_height;
			}
			else {
				this.aspect_scale = this.width / this.original_width;
			}
			if (this.running_layout) {
				this.running_layout.scrollToX(this.running_layout.scrollX);
				this.running_layout.scrollToY(this.running_layout.scrollY);
			}
		}
		else
			this.aspect_scale = (this.isRetina ? this.devicePixelRatio : 1);
		this.ClearDeathRow();
		this.isInOnDestroy++;
		this.system.runWaits();		// prevent instance list changing
		this.isInOnDestroy--;
		this.ClearDeathRow();		// allow instance list changing
		this.isInOnDestroy++;
		var tickarr = this.objects_to_pretick.valuesRef();
		for (i = 0, leni = tickarr.length; i < leni; i++)
			tickarr[i].pretick();
		for (i = 0, leni = this.types_by_index.length; i < leni; i++) {
			type = this.types_by_index[i];
			if (type.is_family || (!type.behaviors.length && !type.families.length))
				continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++) {
				inst = type.instances[j];
				for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++) {
					inst.behavior_insts[k].tick();
				}
			}
		}
		for (i = 0, leni = this.types_by_index.length; i < leni; i++) {
			type = this.types_by_index[i];
			if (type.is_family || (!type.behaviors.length && !type.families.length))
				continue;	// type doesn't have any behaviors
			for (j = 0, lenj = type.instances.length; j < lenj; j++) {
				inst = type.instances[j];
				for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++) {
					binst = inst.behavior_insts[k];
					if (binst.posttick)
						binst.posttick();
				}
			}
		}
		tickarr = this.objects_to_tick.valuesRef();
		for (i = 0, leni = tickarr.length; i < leni; i++)
			tickarr[i].tick();
		this.isInOnDestroy--;		// end preventing instance lists from being changed
		this.handleSaveLoad();		// save/load now if queued
		i = 0;
		while (this.changelayout && i++ < 10) {
			this.doChangeLayout(this.changelayout);
		}
		for (i = 0, leni = this.eventsheets_by_index.length; i < leni; i++)
			this.eventsheets_by_index[i].hasRun = false;
		if (this.running_layout.event_sheet)
			this.running_layout.event_sheet.run();
		cr.clearArray(this.registered_collisions);
		this.layout_first_tick = false;
		this.isInOnDestroy++;		// prevent instance lists from being changed
		for (i = 0, leni = this.types_by_index.length; i < leni; i++) {
			type = this.types_by_index[i];
			if (type.is_family || (!type.behaviors.length && !type.families.length))
				continue;	// type doesn't have any behaviors
			for (j = 0, lenj = type.instances.length; j < lenj; j++) {
				var inst = type.instances[j];
				for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++) {
					binst = inst.behavior_insts[k];
					if (binst.tick2)
						binst.tick2();
				}
			}
		}
		tickarr = this.objects_to_tick2.valuesRef();
		for (i = 0, leni = tickarr.length; i < leni; i++)
			tickarr[i].tick2();
		this.isInOnDestroy--;		// end preventing instance lists from being changed
	};
	Runtime.prototype.onWindowBlur = function () {
		var i, leni, j, lenj, k, lenk, type, inst, binst;
		for (i = 0, leni = this.types_by_index.length; i < leni; i++) {
			type = this.types_by_index[i];
			if (type.is_family)
				continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++) {
				inst = type.instances[j];
				if (inst.onWindowBlur)
					inst.onWindowBlur();
				if (!inst.behavior_insts)
					continue;	// single-globals don't have behavior_insts
				for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++) {
					binst = inst.behavior_insts[k];
					if (binst.onWindowBlur)
						binst.onWindowBlur();
				}
			}
		}
	};
	Runtime.prototype.doChangeLayout = function (changeToLayout) {
		var prev_layout = this.running_layout;
		this.running_layout.stopRunning();
		var i, len, j, lenj, k, lenk, type, inst, binst;
		if (this.glwrap) {
			for (i = 0, len = this.types_by_index.length; i < len; i++) {
				type = this.types_by_index[i];
				if (type.is_family)
					continue;
				if (type.unloadTextures && (!type.global || type.instances.length === 0) && changeToLayout.initial_types.indexOf(type) === -1) {
					type.unloadTextures();
				}
			}
		}
		if (prev_layout == changeToLayout)
			cr.clearArray(this.system.waits);
		cr.clearArray(this.registered_collisions);
		this.runLayoutChangeMethods(true);
		changeToLayout.startRunning();
		this.runLayoutChangeMethods(false);
		this.redraw = true;
		this.layout_first_tick = true;
		this.ClearDeathRow();
	};
	Runtime.prototype.runLayoutChangeMethods = function (isBeforeChange) {
		var i, len, beh, type, j, lenj, inst, k, lenk, binst;
		for (i = 0, len = this.behaviors.length; i < len; i++) {
			beh = this.behaviors[i];
			if (isBeforeChange) {
				if (beh.onBeforeLayoutChange)
					beh.onBeforeLayoutChange();
			}
			else {
				if (beh.onLayoutChange)
					beh.onLayoutChange();
			}
		}
		for (i = 0, len = this.types_by_index.length; i < len; i++) {
			type = this.types_by_index[i];
			if (!type.global && !type.plugin.singleglobal)
				continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++) {
				inst = type.instances[j];
				if (isBeforeChange) {
					if (inst.onBeforeLayoutChange)
						inst.onBeforeLayoutChange();
				}
				else {
					if (inst.onLayoutChange)
						inst.onLayoutChange();
				}
				if (inst.behavior_insts) {
					for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++) {
						binst = inst.behavior_insts[k];
						if (isBeforeChange) {
							if (binst.onBeforeLayoutChange)
								binst.onBeforeLayoutChange();
						}
						else {
							if (binst.onLayoutChange)
								binst.onLayoutChange();
						}
					}
				}
			}
		}
	};
	Runtime.prototype.pretickMe = function (inst) {
		this.objects_to_pretick.add(inst);
	};
	Runtime.prototype.unpretickMe = function (inst) {
		this.objects_to_pretick.remove(inst);
	};
	Runtime.prototype.tickMe = function (inst) {
		this.objects_to_tick.add(inst);
		// console.log('tickMe this.objects_to_tick', this.objects_to_tick)
	};
	Runtime.prototype.tick2Me = function (inst) {
		this.objects_to_tick2.add(inst);
	};
	Runtime.prototype.getDt = function (inst) {
		if (!inst || inst.my_timescale === -1.0)
			return this.dt;
		return this.dt1 * inst.my_timescale;
	};
	Runtime.prototype.draw = function () {
		this.running_layout.draw(this.ctx);
		if (this.isDirectCanvas)
			this.ctx["present"]();
	};
	Runtime.prototype.drawGL = function () {
		if (this.enableFrontToBack) {
			this.earlyz_index = 1;		// start from front, 1-based to avoid exactly equalling near plane Z value
			this.running_layout.drawGL_earlyZPass(this.glwrap);
		}
		this.running_layout.drawGL(this.glwrap);
		this.glwrap.present();
	};
	Runtime.prototype.addDestroyCallback = function (f) {
		if (f)
			this.destroycallbacks.push(f);
	};
	Runtime.prototype.removeDestroyCallback = function (f) {
		cr.arrayFindRemove(this.destroycallbacks, f);
	};
	Runtime.prototype.getObjectByUID = function (uid_) {
		;
		var uidstr = uid_.toString();
		if (this.objectsByUid.hasOwnProperty(uidstr))
			return this.objectsByUid[uidstr];
		else
			return null;
	};
	var objectset_cache = [];

	function alloc_objectset() {
		if (objectset_cache.length)
			return objectset_cache.pop();
		else
			return new cr.ObjectSet();
	};

	function free_objectset(s) {
		s.clear();
		objectset_cache.push(s);
	};
	Runtime.prototype.DestroyInstance = function (inst) {
		var i, len;
		var type = inst.type;
		var typename = type.name;
		var has_typename = this.deathRow.hasOwnProperty(typename);
		var obj_set = null;
		if (has_typename) {
			obj_set = this.deathRow[typename];
			if (obj_set.contains(inst))
				return;		// already had DestroyInstance called
		}
		else {
			obj_set = alloc_objectset();
			this.deathRow[typename] = obj_set;
		}
		obj_set.add(inst);
		this.hasPendingInstances = true;
		if (inst.is_contained) {
			for (i = 0, len = inst.siblings.length; i < len; i++) {
				this.DestroyInstance(inst.siblings[i]);
			}
		}
		if (this.isInClearDeathRow)
			obj_set.values_cache.push(inst);
		if (!this.isEndingLayout) {
			this.isInOnDestroy++;		// support recursion
			this.trigger(Object.getPrototypeOf(inst.type.plugin).cnds.OnDestroyed, inst);
			this.isInOnDestroy--;
		}
	};
	Runtime.prototype.ClearDeathRow = function () {
		if (!this.hasPendingInstances)
			return;
		var inst, type, instances;
		var i, j, leni, lenj, obj_set;
		this.isInClearDeathRow = true;
		for (i = 0, leni = this.createRow.length; i < leni; ++i) {
			inst = this.createRow[i];
			type = inst.type;
			type.instances.push(inst);
			for (j = 0, lenj = type.families.length; j < lenj; ++j) {
				type.families[j].instances.push(inst);
				type.families[j].stale_iids = true;
			}
		}
		cr.clearArray(this.createRow);
		this.IterateDeathRow();		// moved to separate function so for-in performance doesn't hobble entire function
		cr.wipe(this.deathRow);		// all objectsets have already been recycled
		this.isInClearDeathRow = false;
		this.hasPendingInstances = false;
	};
	Runtime.prototype.IterateDeathRow = function () {
		for (var p in this.deathRow) {
			if (this.deathRow.hasOwnProperty(p)) {
				this.ClearDeathRowForType(this.deathRow[p]);
			}
		}
	};
	Runtime.prototype.ClearDeathRowForType = function (obj_set) {
		var arr = obj_set.valuesRef();			// get array of items from set
		;
		var type = arr[0].type;
		;
		;
		var i, len, j, lenj, w, f, layer_instances, inst;
		cr.arrayRemoveAllFromObjectSet(type.instances, obj_set);
		type.stale_iids = true;
		if (type.instances.length === 0)
			type.any_instance_parallaxed = false;
		for (i = 0, len = type.families.length; i < len; ++i) {
			f = type.families[i];
			cr.arrayRemoveAllFromObjectSet(f.instances, obj_set);
			f.stale_iids = true;
		}
		for (i = 0, len = this.system.waits.length; i < len; ++i) {
			w = this.system.waits[i];
			if (w.sols.hasOwnProperty(type.index))
				cr.arrayRemoveAllFromObjectSet(w.sols[type.index].insts, obj_set);
			if (!type.is_family) {
				for (j = 0, lenj = type.families.length; j < lenj; ++j) {
					f = type.families[j];
					if (w.sols.hasOwnProperty(f.index))
						cr.arrayRemoveAllFromObjectSet(w.sols[f.index].insts, obj_set);
				}
			}
		}
		var first_layer = arr[0].layer;
		if (first_layer) {
			if (first_layer.useRenderCells) {
				layer_instances = first_layer.instances;
				for (i = 0, len = layer_instances.length; i < len; ++i) {
					inst = layer_instances[i];
					if (!obj_set.contains(inst))
						continue;		// not destroying this instance
					inst.update_bbox();
					first_layer.render_grid.update(inst, inst.rendercells, null);
					inst.rendercells.set(0, 0, -1, -1);
				}
			}
			cr.arrayRemoveAllFromObjectSet(first_layer.instances, obj_set);
			first_layer.setZIndicesStaleFrom(0);
		}
		for (i = 0; i < arr.length; ++i)		// check array length every time in case it changes
		{
			this.ClearDeathRowForSingleInstance(arr[i], type);
		}
		free_objectset(obj_set);
		this.redraw = true;
	};
	Runtime.prototype.ClearDeathRowForSingleInstance = function (inst, type) {
		var i, len, binst;
		for (i = 0, len = this.destroycallbacks.length; i < len; ++i)
			this.destroycallbacks[i](inst);
		if (inst.collcells) {
			type.collision_grid.update(inst, inst.collcells, null);
		}
		var layer = inst.layer;
		if (layer) {
			layer.removeFromInstanceList(inst, true);		// remove from both instance list and render grid
		}
		if (inst.behavior_insts) {
			for (i = 0, len = inst.behavior_insts.length; i < len; ++i) {
				binst = inst.behavior_insts[i];
				if (binst.onDestroy)
					binst.onDestroy();
				binst.behavior.my_instances.remove(inst);
			}
		}
		this.objects_to_pretick.remove(inst);
		this.objects_to_tick.remove(inst);
		this.objects_to_tick2.remove(inst);
		if (inst.onDestroy)
			inst.onDestroy();
		if (this.objectsByUid.hasOwnProperty(inst.uid.toString()))
			delete this.objectsByUid[inst.uid.toString()];
		this.objectcount--;
		if (type.deadCache.length < 100)
			type.deadCache.push(inst);
	};
	Runtime.prototype.createInstance = function (type, layer, sx, sy) {
		if (type.is_family) {
			var i = cr.floor(Math.random() * type.members.length);
			return this.createInstance(type.members[i], layer, sx, sy);
		}
		if (!type.default_instance) {
			return null;
		}
		return this.createInstanceFromInit(type.default_instance, layer, false, sx, sy, false);
	};
	var all_behaviors = [];
	Runtime.prototype.createInstanceFromInit = function (initial_inst, layer, is_startup_instance, sx, sy, skip_siblings) {
		// console.log('createInstanceFromInit')
		var i, len, j, lenj, p, effect_fallback, x, y;
		if (!initial_inst)
			return null;
		var type = this.types_by_index[initial_inst[1]];
		var is_world = type.plugin.is_world;
		if (this.isloading && is_world && !type.isOnLoaderLayout)
			return null;
		if (is_world && !this.glwrap && initial_inst[0][11] === 11)
			return null;
		var original_layer = layer;
		if (!is_world)
			layer = null;
		var inst;
		if (type.deadCache.length) {
			inst = type.deadCache.pop();
			inst.recycled = true;
			type.plugin.Instance.call(inst, type);
		}
		else {
			inst = new type.plugin.Instance(type);
			inst.recycled = false;
		}
		if (is_startup_instance && !skip_siblings && !this.objectsByUid.hasOwnProperty(initial_inst[2].toString()))
			inst.uid = initial_inst[2];
		else
			inst.uid = this.next_uid++;
		this.objectsByUid[inst.uid.toString()] = inst;
		inst.puid = this.next_puid++;
		inst.iid = type.instances.length;
		for (i = 0, len = this.createRow.length; i < len; ++i) {
			if (this.createRow[i].type === type)
				inst.iid++;
		}
		inst.get_iid = cr.inst_get_iid;
		inst.toString = cr.inst_toString;
		var initial_vars = initial_inst[3];
		if (inst.recycled) {
			cr.wipe(inst.extra);
		}
		else {
			inst.extra = {};
			if (typeof cr_is_preview !== "undefined") {
				inst.instance_var_names = [];
				inst.instance_var_names.length = initial_vars.length;
				for (i = 0, len = initial_vars.length; i < len; i++)
					inst.instance_var_names[i] = initial_vars[i][1];
			}
			inst.instance_vars = [];
			inst.instance_vars.length = initial_vars.length;
		}
		for (i = 0, len = initial_vars.length; i < len; i++)
			inst.instance_vars[i] = initial_vars[i][0];
		if (is_world) {
			var wm = initial_inst[0];
			inst.x = cr.is_undefined(sx) ? wm[0] : sx;
			inst.y = cr.is_undefined(sy) ? wm[1] : sy;
			inst.z = wm[2];
			inst.width = wm[3];
			inst.height = wm[4];
			inst.depth = wm[5];
			inst.angle = wm[6];
			inst.opacity = wm[7];
			inst.hotspotX = wm[8];
			inst.hotspotY = wm[9];
			inst.blend_mode = wm[10];
			effect_fallback = wm[11];
			if (!this.glwrap && type.effect_types.length)	// no WebGL renderer and shaders used
				inst.blend_mode = effect_fallback;			// use fallback blend mode - destroy mode was handled above
			inst.compositeOp = cr.effectToCompositeOp(inst.blend_mode);
			if (this.gl)
				cr.setGLBlend(inst, inst.blend_mode, this.gl);
			if (inst.recycled) {
				for (i = 0, len = wm[12].length; i < len; i++) {
					for (j = 0, lenj = wm[12][i].length; j < lenj; j++)
						inst.effect_params[i][j] = wm[12][i][j];
				}
				inst.bbox.set(0, 0, 0, 0);
				inst.collcells.set(0, 0, -1, -1);
				inst.rendercells.set(0, 0, -1, -1);
				inst.bquad.set_from_rect(inst.bbox);
				cr.clearArray(inst.bbox_changed_callbacks);
			}
			else {
				inst.effect_params = wm[12].slice(0);
				for (i = 0, len = inst.effect_params.length; i < len; i++)
					inst.effect_params[i] = wm[12][i].slice(0);
				inst.active_effect_types = [];
				inst.active_effect_flags = [];
				inst.active_effect_flags.length = type.effect_types.length;
				inst.bbox = new cr.rect(0, 0, 0, 0);
				inst.collcells = new cr.rect(0, 0, -1, -1);
				inst.rendercells = new cr.rect(0, 0, -1, -1);
				inst.bquad = new cr.quad();
				inst.bbox_changed_callbacks = [];
				inst.set_bbox_changed = cr.set_bbox_changed;
				inst.add_bbox_changed_callback = cr.add_bbox_changed_callback;
				inst.contains_pt = cr.inst_contains_pt;
				inst.update_bbox = cr.update_bbox;
				inst.update_render_cell = cr.update_render_cell;
				inst.update_collision_cell = cr.update_collision_cell;
				inst.get_zindex = cr.inst_get_zindex;
			}
			inst.tilemap_exists = false;
			inst.tilemap_width = 0;
			inst.tilemap_height = 0;
			inst.tilemap_data = null;
			if (wm.length === 14) {
				inst.tilemap_exists = true;
				inst.tilemap_width = wm[13][0];
				inst.tilemap_height = wm[13][1];
				inst.tilemap_data = wm[13][2];
			}
			for (i = 0, len = type.effect_types.length; i < len; i++)
				inst.active_effect_flags[i] = true;
			inst.shaders_preserve_opaqueness = true;
			inst.updateActiveEffects = cr.inst_updateActiveEffects;
			inst.updateActiveEffects();
			inst.uses_shaders = !!inst.active_effect_types.length;
			inst.bbox_changed = true;
			inst.cell_changed = true;
			type.any_cell_changed = true;
			inst.visible = true;
			inst.my_timescale = -1.0;
			inst.layer = layer;
			inst.zindex = layer.instances.length;	// will be placed at top of current layer
			inst.earlyz_index = 0;
			if (typeof inst.collision_poly === "undefined")
				inst.collision_poly = null;
			inst.collisionsEnabled = true;
			this.redraw = true;
		}
		var initial_props, binst;
		cr.clearArray(all_behaviors);
		for (i = 0, len = type.families.length; i < len; i++) {
			all_behaviors.push.apply(all_behaviors, type.families[i].behaviors);
		}
		all_behaviors.push.apply(all_behaviors, type.behaviors);
		if (inst.recycled) {
			for (i = 0, len = all_behaviors.length; i < len; i++) {
				var btype = all_behaviors[i];
				binst = inst.behavior_insts[i];
				binst.recycled = true;
				btype.behavior.Instance.call(binst, btype, inst);
				initial_props = initial_inst[4][i];
				for (j = 0, lenj = initial_props.length; j < lenj; j++)
					binst.properties[j] = initial_props[j];
				binst.onCreate();
				btype.behavior.my_instances.add(inst);
			}
		}
		else {
			inst.behavior_insts = [];
			for (i = 0, len = all_behaviors.length; i < len; i++) {
				var btype = all_behaviors[i];
				var binst = new btype.behavior.Instance(btype, inst);
				binst.recycled = false;
				binst.properties = initial_inst[4][i].slice(0);
				binst.onCreate();
				cr.seal(binst);
				inst.behavior_insts.push(binst);
				btype.behavior.my_instances.add(inst);
			}
		}
		initial_props = initial_inst[5];
		if (inst.recycled) {
			for (i = 0, len = initial_props.length; i < len; i++)
				inst.properties[i] = initial_props[i];
		}
		else
			inst.properties = initial_props.slice(0);
		this.createRow.push(inst);
		this.hasPendingInstances = true;
		if (layer) {
			;
			layer.appendToInstanceList(inst, true);
			if (layer.parallaxX !== 1 || layer.parallaxY !== 1)
				type.any_instance_parallaxed = true;
		}
		this.objectcount++;
		if (type.is_contained) {
			inst.is_contained = true;
			if (inst.recycled)
				cr.clearArray(inst.siblings);
			else
				inst.siblings = [];			// note: should not include self in siblings
			if (!is_startup_instance && !skip_siblings)	// layout links initial instances
			{
				for (i = 0, len = type.container.length; i < len; i++) {
					if (type.container[i] === type)
						continue;
					if (!type.container[i].default_instance) {
						return null;
					}
					inst.siblings.push(this.createInstanceFromInit(type.container[i].default_instance, original_layer, false, is_world ? inst.x : sx, is_world ? inst.y : sy, true));
				}
				for (i = 0, len = inst.siblings.length; i < len; i++) {
					inst.siblings[i].siblings.push(inst);
					for (j = 0; j < len; j++) {
						if (i !== j)
							inst.siblings[i].siblings.push(inst.siblings[j]);
					}
				}
			}
		}
		else {
			inst.is_contained = false;
			inst.siblings = null;
		}
		inst.onCreate();
		if (!inst.recycled)
			cr.seal(inst);
		for (i = 0, len = inst.behavior_insts.length; i < len; i++) {
			if (inst.behavior_insts[i].postCreate)
				inst.behavior_insts[i].postCreate();
		}
		return inst;
	};
	Runtime.prototype.getLayerByName = function (layer_name) {
		var i, len;
		for (i = 0, len = this.running_layout.layers.length; i < len; i++) {
			var layer = this.running_layout.layers[i];
			if (cr.equals_nocase(layer.name, layer_name))
				return layer;
		}
		return null;
	};
	Runtime.prototype.getLayerByNumber = function (index) {
		index = cr.floor(index);
		if (index < 0)
			index = 0;
		if (index >= this.running_layout.layers.length)
			index = this.running_layout.layers.length - 1;
		return this.running_layout.layers[index];
	};
	Runtime.prototype.getLayer = function (l) {
		if (cr.is_number(l))
			return this.getLayerByNumber(l);
		else
			return this.getLayerByName(l.toString());
	};
	Runtime.prototype.clearSol = function (solModifiers) {
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++) {
			solModifiers[i].getCurrentSol().select_all = true;
		}
	};
	Runtime.prototype.pushCleanSol = function (solModifiers) {
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++) {
			solModifiers[i].pushCleanSol();
		}
	};
	Runtime.prototype.pushCopySol = function (solModifiers) {
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++) {
			solModifiers[i].pushCopySol();
		}
	};
	Runtime.prototype.popSol = function (solModifiers) {
		var i, len;
		for (i = 0, len = solModifiers.length; i < len; i++) {
			solModifiers[i].popSol();
		}
	};
	Runtime.prototype.updateAllCells = function (type) {
		if (!type.any_cell_changed)
			return;		// all instances must already be up-to-date
		var i, len, instances = type.instances;
		for (i = 0, len = instances.length; i < len; ++i) {
			instances[i].update_collision_cell();
		}
		var createRow = this.createRow;
		for (i = 0, len = createRow.length; i < len; ++i) {
			if (createRow[i].type === type)
				createRow[i].update_collision_cell();
		}
		type.any_cell_changed = false;
	};
	Runtime.prototype.getCollisionCandidates = function (layer, rtype, bbox, candidates) {
		var i, len, t;
		var is_parallaxed = (layer ? (layer.parallaxX !== 1 || layer.parallaxY !== 1) : false);
		if (rtype.is_family) {
			for (i = 0, len = rtype.members.length; i < len; ++i) {
				t = rtype.members[i];
				if (is_parallaxed || t.any_instance_parallaxed) {
					cr.appendArray(candidates, t.instances);
				}
				else {
					this.updateAllCells(t);
					t.collision_grid.queryRange(bbox, candidates);
				}
			}
		}
		else {
			if (is_parallaxed || rtype.any_instance_parallaxed) {
				cr.appendArray(candidates, rtype.instances);
			}
			else {
				this.updateAllCells(rtype);
				rtype.collision_grid.queryRange(bbox, candidates);
			}
		}
	};
	Runtime.prototype.getTypesCollisionCandidates = function (layer, types, bbox, candidates) {
		var i, len;
		for (i = 0, len = types.length; i < len; ++i) {
			this.getCollisionCandidates(layer, types[i], bbox, candidates);
		}
	};
	Runtime.prototype.getSolidCollisionCandidates = function (layer, bbox, candidates) {
		var solid = this.getSolidBehavior();
		if (!solid)
			return null;
		this.getTypesCollisionCandidates(layer, solid.my_types, bbox, candidates);
	};
	Runtime.prototype.getJumpthruCollisionCandidates = function (layer, bbox, candidates) {
		var jumpthru = this.getJumpthruBehavior();
		if (!jumpthru)
			return null;
		this.getTypesCollisionCandidates(layer, jumpthru.my_types, bbox, candidates);
	};
	Runtime.prototype.testAndSelectCanvasPointOverlap = function (type, ptx, pty, inverted) {
		console.log('testAndSelectCanvasPointOverlap testAndSelectCanvasPointOverlap')
		var sol = type.getCurrentSol();
		var i, j, inst, len;
		var orblock = this.getCurrentEventStack().current_event.orblock;
		var lx, ly, arr;
		if (sol.select_all) {
			if (!inverted) {
				sol.select_all = false;
				cr.clearArray(sol.instances);   // clear contents
			}
			for (i = 0, len = type.instances.length; i < len; i++) {
				inst = type.instances[i];
				inst.update_bbox();
				lx = inst.layer.canvasToLayer(ptx, pty, true);
				ly = inst.layer.canvasToLayer(ptx, pty, false);
				if (inst.contains_pt(lx, ly)) {
					if (inverted)
						return false;
					else
						sol.instances.push(inst);
				}
				else if (orblock)
					sol.else_instances.push(inst);
			}
		}
		else {
			j = 0;
			arr = (orblock ? sol.else_instances : sol.instances);
			for (i = 0, len = arr.length; i < len; i++) {
				inst = arr[i];
				inst.update_bbox();
				lx = inst.layer.canvasToLayer(ptx, pty, true);
				ly = inst.layer.canvasToLayer(ptx, pty, false);
				if (inst.contains_pt(lx, ly)) {
					if (inverted)
						return false;
					else if (orblock)
						sol.instances.push(inst);
					else {
						sol.instances[j] = sol.instances[i];
						j++;
					}
				}
			}
			if (!inverted)
				arr.length = j;
		}
		type.applySolToContainer();
		if (inverted)
			return true;		// did not find anything overlapping
		else
			return sol.hasObjects();
	};
	Runtime.prototype.testOverlap = function (a, b) {
		if (!a || !b || a === b || !a.collisionsEnabled || !b.collisionsEnabled)
			return false;
		a.update_bbox();
		b.update_bbox();
		var layera = a.layer;
		var layerb = b.layer;
		var different_layers = (layera !== layerb && (layera.parallaxX !== layerb.parallaxX || layerb.parallaxY !== layerb.parallaxY || layera.scale !== layerb.scale || layera.angle !== layerb.angle || layera.zoomRate !== layerb.zoomRate));
		var i, len, i2, i21, x, y, haspolya, haspolyb, polya, polyb;
		if (!different_layers)	// same layers: easy check
		{
			if (!a.bbox.intersects_rect(b.bbox))
				return false;
			if (!a.bquad.intersects_quad(b.bquad))
				return false;
			if (a.tilemap_exists && b.tilemap_exists)
				return false;
			if (a.tilemap_exists)
				return this.testTilemapOverlap(a, b);
			if (b.tilemap_exists)
				return this.testTilemapOverlap(b, a);
			haspolya = (a.collision_poly && !a.collision_poly.is_empty());
			haspolyb = (b.collision_poly && !b.collision_poly.is_empty());
			if (!haspolya && !haspolyb)
				return true;
			if (haspolya) {
				a.collision_poly.cache_poly(a.width, a.height, a.angle);
				polya = a.collision_poly;
			}
			else {
				this.temp_poly.set_from_quad(a.bquad, a.x, a.y, a.width, a.height);
				polya = this.temp_poly;
			}
			if (haspolyb) {
				b.collision_poly.cache_poly(b.width, b.height, b.angle);
				polyb = b.collision_poly;
			}
			else {
				this.temp_poly.set_from_quad(b.bquad, b.x, b.y, b.width, b.height);
				polyb = this.temp_poly;
			}
			return polya.intersects_poly(polyb, b.x - a.x, b.y - a.y);
		}
		else	// different layers: need to do full translated check
		{
			haspolya = (a.collision_poly && !a.collision_poly.is_empty());
			haspolyb = (b.collision_poly && !b.collision_poly.is_empty());
			if (haspolya) {
				a.collision_poly.cache_poly(a.width, a.height, a.angle);
				this.temp_poly.set_from_poly(a.collision_poly);
			}
			else {
				this.temp_poly.set_from_quad(a.bquad, a.x, a.y, a.width, a.height);
			}
			polya = this.temp_poly;
			if (haspolyb) {
				b.collision_poly.cache_poly(b.width, b.height, b.angle);
				this.temp_poly2.set_from_poly(b.collision_poly);
			}
			else {
				this.temp_poly2.set_from_quad(b.bquad, b.x, b.y, b.width, b.height);
			}
			polyb = this.temp_poly2;
			for (i = 0, len = polya.pts_count; i < len; i++) {
				i2 = i * 2;
				i21 = i2 + 1;
				x = polya.pts_cache[i2];
				y = polya.pts_cache[i21];
				polya.pts_cache[i2] = layera.layerToCanvas(x + a.x, y + a.y, true);
				polya.pts_cache[i21] = layera.layerToCanvas(x + a.x, y + a.y, false);
			}
			polya.update_bbox();
			for (i = 0, len = polyb.pts_count; i < len; i++) {
				i2 = i * 2;
				i21 = i2 + 1;
				x = polyb.pts_cache[i2];
				y = polyb.pts_cache[i21];
				polyb.pts_cache[i2] = layerb.layerToCanvas(x + b.x, y + b.y, true);
				polyb.pts_cache[i21] = layerb.layerToCanvas(x + b.x, y + b.y, false);
			}
			polyb.update_bbox();
			return polya.intersects_poly(polyb, 0, 0);
		}
	};
	var tmpQuad = new cr.quad();
	var tmpRect = new cr.rect(0, 0, 0, 0);
	var collrect_candidates = [];
	Runtime.prototype.testTilemapOverlap = function (tm, a) {
		var i, len, c, rc;
		var bbox = a.bbox;
		var tmx = tm.x;
		var tmy = tm.y;
		tm.getCollisionRectCandidates(bbox, collrect_candidates);
		var collrects = collrect_candidates;
		var haspolya = (a.collision_poly && !a.collision_poly.is_empty());
		for (i = 0, len = collrects.length; i < len; ++i) {
			c = collrects[i];
			rc = c.rc;
			if (bbox.intersects_rect_off(rc, tmx, tmy)) {
				tmpQuad.set_from_rect(rc);
				tmpQuad.offset(tmx, tmy);
				if (tmpQuad.intersects_quad(a.bquad)) {
					if (haspolya) {
						a.collision_poly.cache_poly(a.width, a.height, a.angle);
						if (c.poly) {
							if (c.poly.intersects_poly(a.collision_poly, a.x - (tmx + rc.left), a.y - (tmy + rc.top))) {
								cr.clearArray(collrect_candidates);
								return true;
							}
						}
						else {
							this.temp_poly.set_from_quad(tmpQuad, 0, 0, rc.right - rc.left, rc.bottom - rc.top);
							if (this.temp_poly.intersects_poly(a.collision_poly, a.x, a.y)) {
								cr.clearArray(collrect_candidates);
								return true;
							}
						}
					}
					else {
						if (c.poly) {
							this.temp_poly.set_from_quad(a.bquad, 0, 0, a.width, a.height);
							if (c.poly.intersects_poly(this.temp_poly, -(tmx + rc.left), -(tmy + rc.top))) {
								cr.clearArray(collrect_candidates);
								return true;
							}
						}
						else {
							cr.clearArray(collrect_candidates);
							return true;
						}
					}
				}
			}
		}
		cr.clearArray(collrect_candidates);
		return false;
	};
	Runtime.prototype.testRectOverlap = function (r, b) {
		if (!b || !b.collisionsEnabled)
			return false;
		b.update_bbox();
		var layerb = b.layer;
		var haspolyb, polyb;
		if (!b.bbox.intersects_rect(r))
			return false;
		if (b.tilemap_exists) {
			b.getCollisionRectCandidates(r, collrect_candidates);
			var collrects = collrect_candidates;
			var i, len, c, tilerc;
			var tmx = b.x;
			var tmy = b.y;
			for (i = 0, len = collrects.length; i < len; ++i) {
				c = collrects[i];
				tilerc = c.rc;
				if (r.intersects_rect_off(tilerc, tmx, tmy)) {
					if (c.poly) {
						this.temp_poly.set_from_rect(r, 0, 0);
						if (c.poly.intersects_poly(this.temp_poly, -(tmx + tilerc.left), -(tmy + tilerc.top))) {
							cr.clearArray(collrect_candidates);
							return true;
						}
					}
					else {
						cr.clearArray(collrect_candidates);
						return true;
					}
				}
			}
			cr.clearArray(collrect_candidates);
			return false;
		}
		else {
			tmpQuad.set_from_rect(r);
			if (!b.bquad.intersects_quad(tmpQuad))
				return false;
			haspolyb = (b.collision_poly && !b.collision_poly.is_empty());
			if (!haspolyb)
				return true;
			b.collision_poly.cache_poly(b.width, b.height, b.angle);
			tmpQuad.offset(-r.left, -r.top);
			this.temp_poly.set_from_quad(tmpQuad, 0, 0, 1, 1);
			return b.collision_poly.intersects_poly(this.temp_poly, r.left - b.x, r.top - b.y);
		}
	};
	Runtime.prototype.testSegmentOverlap = function (x1, y1, x2, y2, b) {
		if (!b || !b.collisionsEnabled)
			return false;
		b.update_bbox();
		var layerb = b.layer;
		var haspolyb, polyb;
		tmpRect.set(cr.min(x1, x2), cr.min(y1, y2), cr.max(x1, x2), cr.max(y1, y2));
		if (!b.bbox.intersects_rect(tmpRect))
			return false;
		if (b.tilemap_exists) {
			b.getCollisionRectCandidates(tmpRect, collrect_candidates);
			var collrects = collrect_candidates;
			var i, len, c, tilerc;
			var tmx = b.x;
			var tmy = b.y;
			for (i = 0, len = collrects.length; i < len; ++i) {
				c = collrects[i];
				tilerc = c.rc;
				if (tmpRect.intersects_rect_off(tilerc, tmx, tmy)) {
					tmpQuad.set_from_rect(tilerc);
					tmpQuad.offset(tmx, tmy);
					if (tmpQuad.intersects_segment(x1, y1, x2, y2)) {
						if (c.poly) {
							if (c.poly.intersects_segment(tmx + tilerc.left, tmy + tilerc.top, x1, y1, x2, y2)) {
								cr.clearArray(collrect_candidates);
								return true;
							}
						}
						else {
							cr.clearArray(collrect_candidates);
							return true;
						}
					}
				}
			}
			cr.clearArray(collrect_candidates);
			return false;
		}
		else {
			if (!b.bquad.intersects_segment(x1, y1, x2, y2))
				return false;
			haspolyb = (b.collision_poly && !b.collision_poly.is_empty());
			if (!haspolyb)
				return true;
			b.collision_poly.cache_poly(b.width, b.height, b.angle);
			return b.collision_poly.intersects_segment(b.x, b.y, x1, y1, x2, y2);
		}
	};
	Runtime.prototype.typeHasBehavior = function (t, b) {
		if (!b)
			return false;
		var i, len, j, lenj, f;
		for (i = 0, len = t.behaviors.length; i < len; i++) {
			if (t.behaviors[i].behavior instanceof b)
				return true;
		}
		if (!t.is_family) {
			for (i = 0, len = t.families.length; i < len; i++) {
				f = t.families[i];
				for (j = 0, lenj = f.behaviors.length; j < lenj; j++) {
					if (f.behaviors[j].behavior instanceof b)
						return true;
				}
			}
		}
		return false;
	};
	Runtime.prototype.typeHasNoSaveBehavior = function (t) {
		return this.typeHasBehavior(t, cr.behaviors.NoSave);
	};
	Runtime.prototype.typeHasPersistBehavior = function (t) {
		return this.typeHasBehavior(t, cr.behaviors.Persist);
	};
	Runtime.prototype.getSolidBehavior = function () {
		return this.solidBehavior;
	};
	Runtime.prototype.getJumpthruBehavior = function () {
		return this.jumpthruBehavior;
	};
	var candidates = [];
	Runtime.prototype.testOverlapSolid = function (inst) {
		var i, len, s;
		inst.update_bbox();
		this.getSolidCollisionCandidates(inst.layer, inst.bbox, candidates);
		for (i = 0, len = candidates.length; i < len; ++i) {
			s = candidates[i];
			if (!s.extra["solidEnabled"])
				continue;
			if (this.testOverlap(inst, s)) {
				cr.clearArray(candidates);
				return s;
			}
		}
		cr.clearArray(candidates);
		return null;
	};
	Runtime.prototype.testRectOverlapSolid = function (r) {
		var i, len, s;
		this.getSolidCollisionCandidates(null, r, candidates);
		for (i = 0, len = candidates.length; i < len; ++i) {
			s = candidates[i];
			if (!s.extra["solidEnabled"])
				continue;
			if (this.testRectOverlap(r, s)) {
				cr.clearArray(candidates);
				return s;
			}
		}
		cr.clearArray(candidates);
		return null;
	};
	var jumpthru_array_ret = [];
	Runtime.prototype.testOverlapJumpThru = function (inst, all) {
		var ret = null;
		if (all) {
			ret = jumpthru_array_ret;
			cr.clearArray(ret);
		}
		inst.update_bbox();
		this.getJumpthruCollisionCandidates(inst.layer, inst.bbox, candidates);
		var i, len, j;
		for (i = 0, len = candidates.length; i < len; ++i) {
			j = candidates[i];
			if (!j.extra["jumpthruEnabled"])
				continue;
			if (this.testOverlap(inst, j)) {
				if (all)
					ret.push(j);
				else {
					cr.clearArray(candidates);
					return j;
				}
			}
		}
		cr.clearArray(candidates);
		return ret;
	};
	Runtime.prototype.pushOutSolid = function (inst, xdir, ydir, dist, include_jumpthrus, specific_jumpthru) {
		var push_dist = dist || 50;
		var oldx = inst.x
		var oldy = inst.y;
		var i;
		var last_overlapped = null, secondlast_overlapped = null;
		for (i = 0; i < push_dist; i++) {
			inst.x = (oldx + (xdir * i));
			inst.y = (oldy + (ydir * i));
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, last_overlapped)) {
				last_overlapped = this.testOverlapSolid(inst);
				if (last_overlapped)
					secondlast_overlapped = last_overlapped;
				if (!last_overlapped) {
					if (include_jumpthrus) {
						if (specific_jumpthru)
							last_overlapped = (this.testOverlap(inst, specific_jumpthru) ? specific_jumpthru : null);
						else
							last_overlapped = this.testOverlapJumpThru(inst);
						if (last_overlapped)
							secondlast_overlapped = last_overlapped;
					}
					if (!last_overlapped) {
						if (secondlast_overlapped)
							this.pushInFractional(inst, xdir, ydir, secondlast_overlapped, 16);
						return true;
					}
				}
			}
		}
		inst.x = oldx;
		inst.y = oldy;
		inst.set_bbox_changed();
		return false;
	};
	Runtime.prototype.pushOut = function (inst, xdir, ydir, dist, otherinst) {
		var push_dist = dist || 50;
		var oldx = inst.x
		var oldy = inst.y;
		var i;
		for (i = 0; i < push_dist; i++) {
			inst.x = (oldx + (xdir * i));
			inst.y = (oldy + (ydir * i));
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, otherinst))
				return true;
		}
		inst.x = oldx;
		inst.y = oldy;
		inst.set_bbox_changed();
		return false;
	};
	Runtime.prototype.pushInFractional = function (inst, xdir, ydir, obj, limit) {
		var divisor = 2;
		var frac;
		var forward = false;
		var overlapping = false;
		var bestx = inst.x;
		var besty = inst.y;
		while (divisor <= limit) {
			frac = 1 / divisor;
			divisor *= 2;
			inst.x += xdir * frac * (forward ? 1 : -1);
			inst.y += ydir * frac * (forward ? 1 : -1);
			inst.set_bbox_changed();
			if (this.testOverlap(inst, obj)) {
				forward = true;
				overlapping = true;
			}
			else {
				forward = false;
				overlapping = false;
				bestx = inst.x;
				besty = inst.y;
			}
		}
		if (overlapping) {
			inst.x = bestx;
			inst.y = besty;
			inst.set_bbox_changed();
		}
	};
	Runtime.prototype.pushOutSolidNearest = function (inst, max_dist_) {
		var max_dist = (cr.is_undefined(max_dist_) ? 100 : max_dist_);
		var dist = 0;
		var oldx = inst.x
		var oldy = inst.y;
		var dir = 0;
		var dx = 0, dy = 0;
		var last_overlapped = this.testOverlapSolid(inst);
		if (!last_overlapped)
			return true;		// already clear of solids
		while (dist <= max_dist) {
			switch (dir) {
				case 0:
					dx = 0;
					dy = -1;
					dist++;
					break;
				case 1:
					dx = 1;
					dy = -1;
					break;
				case 2:
					dx = 1;
					dy = 0;
					break;
				case 3:
					dx = 1;
					dy = 1;
					break;
				case 4:
					dx = 0;
					dy = 1;
					break;
				case 5:
					dx = -1;
					dy = 1;
					break;
				case 6:
					dx = -1;
					dy = 0;
					break;
				case 7:
					dx = -1;
					dy = -1;
					break;
			}
			dir = (dir + 1) % 8;
			inst.x = cr.floor(oldx + (dx * dist));
			inst.y = cr.floor(oldy + (dy * dist));
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, last_overlapped)) {
				last_overlapped = this.testOverlapSolid(inst);
				if (!last_overlapped)
					return true;
			}
		}
		inst.x = oldx;
		inst.y = oldy;
		inst.set_bbox_changed();
		return false;
	};
	Runtime.prototype.registerCollision = function (a, b) {
		if (!a.collisionsEnabled || !b.collisionsEnabled)
			return;
		this.registered_collisions.push([a, b]);
	};
	Runtime.prototype.checkRegisteredCollision = function (a, b) {
		var i, len, x;
		for (i = 0, len = this.registered_collisions.length; i < len; i++) {
			x = this.registered_collisions[i];
			if ((x[0] == a && x[1] == b) || (x[0] == b && x[1] == a))
				return true;
		}
		return false;
	};
	Runtime.prototype.calculateSolidBounceAngle = function (inst, startx, starty, obj) {
		var objx = inst.x;
		var objy = inst.y;
		var radius = cr.max(10, cr.distanceTo(startx, starty, objx, objy));
		var startangle = cr.angleTo(startx, starty, objx, objy);
		var firstsolid = obj || this.testOverlapSolid(inst);
		if (!firstsolid)
			return cr.clamp_angle(startangle + cr.PI);
		var cursolid = firstsolid;
		var i, curangle, anticlockwise_free_angle, clockwise_free_angle;
		var increment = cr.to_radians(5);	// 5 degree increments
		for (i = 1; i < 36; i++) {
			curangle = startangle - i * increment;
			inst.x = startx + Math.cos(curangle) * radius;
			inst.y = starty + Math.sin(curangle) * radius;
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, cursolid)) {
				cursolid = obj ? null : this.testOverlapSolid(inst);
				if (!cursolid) {
					anticlockwise_free_angle = curangle;
					break;
				}
			}
		}
		if (i === 36)
			anticlockwise_free_angle = cr.clamp_angle(startangle + cr.PI);
		var cursolid = firstsolid;
		for (i = 1; i < 36; i++) {
			curangle = startangle + i * increment;
			inst.x = startx + Math.cos(curangle) * radius;
			inst.y = starty + Math.sin(curangle) * radius;
			inst.set_bbox_changed();
			if (!this.testOverlap(inst, cursolid)) {
				cursolid = obj ? null : this.testOverlapSolid(inst);
				if (!cursolid) {
					clockwise_free_angle = curangle;
					break;
				}
			}
		}
		if (i === 36)
			clockwise_free_angle = cr.clamp_angle(startangle + cr.PI);
		inst.x = objx;
		inst.y = objy;
		inst.set_bbox_changed();
		if (clockwise_free_angle === anticlockwise_free_angle)
			return clockwise_free_angle;
		var half_diff = cr.angleDiff(clockwise_free_angle, anticlockwise_free_angle) / 2;
		var normal;
		if (cr.angleClockwise(clockwise_free_angle, anticlockwise_free_angle)) {
			normal = cr.clamp_angle(anticlockwise_free_angle + half_diff + cr.PI);
		}
		else {
			normal = cr.clamp_angle(clockwise_free_angle + half_diff);
		}
		;
		var vx = Math.cos(startangle);
		var vy = Math.sin(startangle);
		var nx = Math.cos(normal);
		var ny = Math.sin(normal);
		var v_dot_n = vx * nx + vy * ny;
		var rx = vx - 2 * v_dot_n * nx;
		var ry = vy - 2 * v_dot_n * ny;
		return cr.angleTo(0, 0, rx, ry);
	};
	var triggerSheetIndex = -1;
	Runtime.prototype.trigger = function (method, inst, value /* for fast triggers */) {
		if (!this.running_layout)
			return false;
		var sheet = this.running_layout.event_sheet;
		if (!sheet)
			return false;     // no event sheet active; nothing to trigger
		var ret = false;
		var r, i, len;
		triggerSheetIndex++;
		var deep_includes = sheet.deep_includes;
		for (i = 0, len = deep_includes.length; i < len; ++i) {
			r = this.triggerOnSheet(method, inst, deep_includes[i], value);
			ret = ret || r;
		}
		r = this.triggerOnSheet(method, inst, sheet, value);
		ret = ret || r;
		triggerSheetIndex--;
		return ret;
	};
	Runtime.prototype.triggerOnSheet = function (method, inst, sheet, value) {
		var ret = false;
		var i, leni, r, families;
		if (!inst) {
			r = this.triggerOnSheetForTypeName(method, inst, "system", sheet, value);
			ret = ret || r;
		}
		else {
			r = this.triggerOnSheetForTypeName(method, inst, inst.type.name, sheet, value);
			ret = ret || r;
			families = inst.type.families;
			for (i = 0, leni = families.length; i < leni; ++i) {
				r = this.triggerOnSheetForTypeName(method, inst, families[i].name, sheet, value);
				ret = ret || r;
			}
		}
		return ret;             // true if anything got triggered
	};
	Runtime.prototype.triggerOnSheetForTypeName = function (method, inst, type_name, sheet, value) {
		var i, leni;
		var ret = false, ret2 = false;
		var trig, index;
		var fasttrigger = (typeof value !== "undefined");
		var triggers = (fasttrigger ? sheet.fasttriggers : sheet.triggers);
		var obj_entry = triggers[type_name];
		if (!obj_entry)
			return ret;
		var triggers_list = null;
		for (i = 0, leni = obj_entry.length; i < leni; ++i) {
			if (obj_entry[i].method == method) {
				triggers_list = obj_entry[i].evs;
				break;
			}
		}
		if (!triggers_list)
			return ret;
		var triggers_to_fire;
		if (fasttrigger) {
			triggers_to_fire = triggers_list[value];
		}
		else {
			triggers_to_fire = triggers_list;
		}
		if (!triggers_to_fire)
			return null;
		for (i = 0, leni = triggers_to_fire.length; i < leni; i++) {
			trig = triggers_to_fire[i][0];
			index = triggers_to_fire[i][1];
			ret2 = this.executeSingleTrigger(inst, type_name, trig, index);
			ret = ret || ret2;
		}
		return ret;
	};
	Runtime.prototype.executeSingleTrigger = function (inst, type_name, trig, index) {
		var i, leni;
		var ret = false;
		this.trigger_depth++;
		var current_event = this.getCurrentEventStack().current_event;
		if (current_event)
			this.pushCleanSol(current_event.solModifiersIncludingParents);
		var isrecursive = (this.trigger_depth > 1);		// calling trigger from inside another trigger
		this.pushCleanSol(trig.solModifiersIncludingParents);
		if (isrecursive)
			this.pushLocalVarStack();
		var event_stack = this.pushEventStack(trig);
		event_stack.current_event = trig;
		if (inst) {
			var sol = this.types[type_name].getCurrentSol();
			sol.select_all = false;
			cr.clearArray(sol.instances);
			sol.instances[0] = inst;
			this.types[type_name].applySolToContainer();
		}
		var ok_to_run = true;
		if (trig.parent) {
			var temp_parents_arr = event_stack.temp_parents_arr;
			var cur_parent = trig.parent;
			while (cur_parent) {
				temp_parents_arr.push(cur_parent);
				cur_parent = cur_parent.parent;
			}
			temp_parents_arr.reverse();
			for (i = 0, leni = temp_parents_arr.length; i < leni; i++) {
				if (!temp_parents_arr[i].run_pretrigger())   // parent event failed
				{
					ok_to_run = false;
					break;
				}
			}
		}
		if (ok_to_run) {
			this.execcount++;
			if (trig.orblock)
				trig.run_orblocktrigger(index);
			else
				trig.run();
			ret = ret || event_stack.last_event_true;
		}
		this.popEventStack();
		if (isrecursive)
			this.popLocalVarStack();
		this.popSol(trig.solModifiersIncludingParents);
		if (current_event)
			this.popSol(current_event.solModifiersIncludingParents);
		if (this.hasPendingInstances && this.isInOnDestroy === 0 && triggerSheetIndex === 0 && !this.isRunningEvents) {
			this.ClearDeathRow();
		}
		this.trigger_depth--;
		return ret;
	};
	Runtime.prototype.getCurrentCondition = function () {
		var evinfo = this.getCurrentEventStack();
		return evinfo.current_event.conditions[evinfo.cndindex];
	};
	Runtime.prototype.getCurrentConditionObjectType = function () {
		var cnd = this.getCurrentCondition();
		return cnd.type;
	};
	Runtime.prototype.isCurrentConditionFirst = function () {
		var evinfo = this.getCurrentEventStack();
		return evinfo.cndindex === 0;
	};
	Runtime.prototype.getCurrentAction = function () {
		var evinfo = this.getCurrentEventStack();
		return evinfo.current_event.actions[evinfo.actindex];
	};
	Runtime.prototype.pushLocalVarStack = function () {
		this.localvar_stack_index++;
		if (this.localvar_stack_index >= this.localvar_stack.length)
			this.localvar_stack.push([]);
	};
	Runtime.prototype.popLocalVarStack = function () {
		;
		this.localvar_stack_index--;
	};
	Runtime.prototype.getCurrentLocalVarStack = function () {
		return this.localvar_stack[this.localvar_stack_index];
	};
	Runtime.prototype.pushEventStack = function (cur_event) {
		this.event_stack_index++;
		if (this.event_stack_index >= this.event_stack.length)
			this.event_stack.push(new cr.eventStackFrame());
		var ret = this.getCurrentEventStack();
		ret.reset(cur_event);
		return ret;
	};
	Runtime.prototype.popEventStack = function () {
		;
		this.event_stack_index--;
	};
	Runtime.prototype.getCurrentEventStack = function () {
		return this.event_stack[this.event_stack_index];
	};
	Runtime.prototype.pushLoopStack = function (name_) {
		this.loop_stack_index++;
		if (this.loop_stack_index >= this.loop_stack.length) {
			this.loop_stack.push(cr.seal({name: name_, index: 0, stopped: false}));
		}
		var ret = this.getCurrentLoop();
		ret.name = name_;
		ret.index = 0;
		ret.stopped = false;
		return ret;
	};
	Runtime.prototype.popLoopStack = function () {
		;
		this.loop_stack_index--;
	};
	Runtime.prototype.getCurrentLoop = function () {
		return this.loop_stack[this.loop_stack_index];
	};
	Runtime.prototype.getEventVariableByName = function (name, scope) {
		var i, leni, j, lenj, sheet, e;
		while (scope) {
			for (i = 0, leni = scope.subevents.length; i < leni; i++) {
				e = scope.subevents[i];
				if (e instanceof cr.eventvariable && cr.equals_nocase(name, e.name))
					return e;
			}
			scope = scope.parent;
		}
		for (i = 0, leni = this.eventsheets_by_index.length; i < leni; i++) {
			sheet = this.eventsheets_by_index[i];
			for (j = 0, lenj = sheet.events.length; j < lenj; j++) {
				e = sheet.events[j];
				if (e instanceof cr.eventvariable && cr.equals_nocase(name, e.name))
					return e;
			}
		}
		return null;
	};
	Runtime.prototype.getLayoutBySid = function (sid_) {
		var i, len;
		for (i = 0, len = this.layouts_by_index.length; i < len; i++) {
			if (this.layouts_by_index[i].sid === sid_)
				return this.layouts_by_index[i];
		}
		return null;
	};
	Runtime.prototype.getObjectTypeBySid = function (sid_) {
		var i, len;
		for (i = 0, len = this.types_by_index.length; i < len; i++) {
			if (this.types_by_index[i].sid === sid_)
				return this.types_by_index[i];
		}
		return null;
	};
	Runtime.prototype.getGroupBySid = function (sid_) {
		var i, len;
		for (i = 0, len = this.allGroups.length; i < len; i++) {
			if (this.allGroups[i].sid === sid_)
				return this.allGroups[i];
		}
		return null;
	};
	Runtime.prototype.doCanvasSnapshot = function (format_, quality_) {
		this.snapshotCanvas = [format_, quality_];
		this.redraw = true;		// force redraw so snapshot is always taken
	};

	function IsIndexedDBAvailable() {
		try {
			return !!window.indexedDB;
		}
		catch (e) {
			return false;
		}
	};

	function makeSaveDb(e) {
		var db = e.target.result;
		db.createObjectStore("saves", {keyPath: "slot"});
	};

	function IndexedDB_WriteSlot(slot_, data_, oncomplete_, onerror_) {
		try {
			var request = indexedDB.open("_C2SaveStates");
			request.onupgradeneeded = makeSaveDb;
			request.onerror = onerror_;
			request.onsuccess = function (e) {
				var db = e.target.result;
				db.onerror = onerror_;
				var transaction = db.transaction(["saves"], "readwrite");
				var objectStore = transaction.objectStore("saves");
				var putReq = objectStore.put({"slot": slot_, "data": data_});
				putReq.onsuccess = oncomplete_;
			};
		}
		catch (err) {
			onerror_(err);
		}
	};

	function IndexedDB_ReadSlot(slot_, oncomplete_, onerror_) {
		try {
			var request = indexedDB.open("_C2SaveStates");
			request.onupgradeneeded = makeSaveDb;
			request.onerror = onerror_;
			request.onsuccess = function (e) {
				var db = e.target.result;
				db.onerror = onerror_;
				var transaction = db.transaction(["saves"]);
				var objectStore = transaction.objectStore("saves");
				var readReq = objectStore.get(slot_);
				readReq.onsuccess = function (e) {
					if (readReq.result)
						oncomplete_(readReq.result["data"]);
					else
						oncomplete_(null);
				};
			};
		}
		catch (err) {
			onerror_(err);
		}
	};
	Runtime.prototype.signalContinuousPreview = function () {
		this.signalledContinuousPreview = true;
	};

	function doContinuousPreviewReload() {
		cr.logexport("Reloading for continuous preview");
		if (!!window["c2cocoonjs"]) {
			CocoonJS["App"]["reload"]();
		}
		else {
			if (window.location.search.indexOf("continuous") > -1)
				window.location.reload(true);
			else
				window.location = window.location + "?continuous";
		}
	};
	Runtime.prototype.handleSaveLoad = function () {
		var self = this;
		var savingToSlot = this.saveToSlot;
		var savingJson = this.lastSaveJson;
		var loadingFromSlot = this.loadFromSlot;
		var continuous = false;
		if (this.signalledContinuousPreview) {
			continuous = true;
			savingToSlot = "__c2_continuouspreview";
			this.signalledContinuousPreview = false;
		}
		if (savingToSlot.length) {
			this.ClearDeathRow();
			savingJson = this.saveToJSONString();
			if (IsIndexedDBAvailable() && !this.isCocoonJs) {
				IndexedDB_WriteSlot(savingToSlot, savingJson, function () {
					cr.logexport("Saved state to IndexedDB storage (" + savingJson.length + " bytes)");
					self.lastSaveJson = savingJson;
					self.trigger(cr.system_object.prototype.cnds.OnSaveComplete, null);
					self.lastSaveJson = "";
					if (continuous)
						doContinuousPreviewReload();
				}, function (e) {
					try {
						localStorage.setItem("__c2save_" + savingToSlot, savingJson);
						cr.logexport("Saved state to WebStorage (" + savingJson.length + " bytes)");
						self.lastSaveJson = savingJson;
						self.trigger(cr.system_object.prototype.cnds.OnSaveComplete, null);
						self.lastSaveJson = "";
						if (continuous)
							doContinuousPreviewReload();
					}
					catch (f) {
						cr.logexport("Failed to save game state: " + e + "; " + f);
						self.trigger(cr.system_object.prototype.cnds.OnSaveFailed, null);
					}
				});
			}
			else {
				try {
					localStorage.setItem("__c2save_" + savingToSlot, savingJson);
					cr.logexport("Saved state to WebStorage (" + savingJson.length + " bytes)");
					self.lastSaveJson = savingJson;
					this.trigger(cr.system_object.prototype.cnds.OnSaveComplete, null);
					self.lastSaveJson = "";
					if (continuous)
						doContinuousPreviewReload();
				}
				catch (e) {
					cr.logexport("Error saving to WebStorage: " + e);
					self.trigger(cr.system_object.prototype.cnds.OnSaveFailed, null);
				}
			}
			this.saveToSlot = "";
			this.loadFromSlot = "";
			this.loadFromJson = null;
		}
		if (loadingFromSlot.length) {
			if (IsIndexedDBAvailable() && !this.isCocoonJs) {
				IndexedDB_ReadSlot(loadingFromSlot, function (result_) {
					if (result_) {
						self.loadFromJson = result_;
						cr.logexport("Loaded state from IndexedDB storage (" + self.loadFromJson.length + " bytes)");
					}
					else {
						self.loadFromJson = localStorage.getItem("__c2save_" + loadingFromSlot) || "";
						cr.logexport("Loaded state from WebStorage (" + self.loadFromJson.length + " bytes)");
					}
					self.suspendDrawing = false;
					if (!self.loadFromJson) {
						self.loadFromJson = null;
						self.trigger(cr.system_object.prototype.cnds.OnLoadFailed, null);
					}
				}, function (e) {
					self.loadFromJson = localStorage.getItem("__c2save_" + loadingFromSlot) || "";
					cr.logexport("Loaded state from WebStorage (" + self.loadFromJson.length + " bytes)");
					self.suspendDrawing = false;
					if (!self.loadFromJson) {
						self.loadFromJson = null;
						self.trigger(cr.system_object.prototype.cnds.OnLoadFailed, null);
					}
				});
			}
			else {
				try {
					this.loadFromJson = localStorage.getItem("__c2save_" + loadingFromSlot) || "";
					cr.logexport("Loaded state from WebStorage (" + this.loadFromJson.length + " bytes)");
				}
				catch (e) {
					this.loadFromJson = null;
				}
				this.suspendDrawing = false;
				if (!self.loadFromJson) {
					self.loadFromJson = null;
					self.trigger(cr.system_object.prototype.cnds.OnLoadFailed, null);
				}
			}
			this.loadFromSlot = "";
			this.saveToSlot = "";
		}
		if (this.loadFromJson !== null) {
			this.ClearDeathRow();
			var ok = this.loadFromJSONString(this.loadFromJson);
			if (ok) {
				this.lastSaveJson = this.loadFromJson;
				this.trigger(cr.system_object.prototype.cnds.OnLoadComplete, null);
				this.lastSaveJson = "";
			}
			else {
				self.trigger(cr.system_object.prototype.cnds.OnLoadFailed, null);
			}
			this.loadFromJson = null;
		}
	};

	function CopyExtraObject(extra) {
		var p, ret = {};
		for (p in extra) {
			if (extra.hasOwnProperty(p)) {
				if (extra[p] instanceof cr.ObjectSet)
					continue;
				if (extra[p] && typeof extra[p].c2userdata !== "undefined")
					continue;
				if (p === "spriteCreatedDestroyCallback")
					continue;
				ret[p] = extra[p];
			}
		}
		return ret;
	};
	Runtime.prototype.saveToJSONString = function () {
		var i, len, j, lenj, type, layout, typeobj, g, c, a, v, p;
		var o = {
			"c2save": true,
			"version": 1,
			"rt": {
				"time": this.kahanTime.sum,
				"walltime": this.wallTime.sum,
				"timescale": this.timescale,
				"tickcount": this.tickcount,
				"execcount": this.execcount,
				"next_uid": this.next_uid,
				"running_layout": this.running_layout.sid,
				"start_time_offset": (Date.now() - this.start_time)
			},
			"types": {},
			"layouts": {},
			"events": {
				"groups": {},
				"cnds": {},
				"acts": {},
				"vars": {}
			}
		};
		for (i = 0, len = this.types_by_index.length; i < len; i++) {
			type = this.types_by_index[i];
			if (type.is_family || this.typeHasNoSaveBehavior(type))
				continue;
			typeobj = {
				"instances": []
			};
			if (cr.hasAnyOwnProperty(type.extra))
				typeobj["ex"] = CopyExtraObject(type.extra);
			for (j = 0, lenj = type.instances.length; j < lenj; j++) {
				typeobj["instances"].push(this.saveInstanceToJSON(type.instances[j]));
			}
			o["types"][type.sid.toString()] = typeobj;
		}
		for (i = 0, len = this.layouts_by_index.length; i < len; i++) {
			layout = this.layouts_by_index[i];
			o["layouts"][layout.sid.toString()] = layout.saveToJSON();
		}
		var ogroups = o["events"]["groups"];
		for (i = 0, len = this.allGroups.length; i < len; i++) {
			g = this.allGroups[i];
			ogroups[g.sid.toString()] = this.groups_by_name[g.group_name].group_active;
		}
		var ocnds = o["events"]["cnds"];
		for (p in this.cndsBySid) {
			if (this.cndsBySid.hasOwnProperty(p)) {
				c = this.cndsBySid[p];
				if (cr.hasAnyOwnProperty(c.extra))
					ocnds[p] = {"ex": CopyExtraObject(c.extra)};
			}
		}
		var oacts = o["events"]["acts"];
		for (p in this.actsBySid) {
			if (this.actsBySid.hasOwnProperty(p)) {
				a = this.actsBySid[p];
				if (cr.hasAnyOwnProperty(a.extra))
					oacts[p] = {"ex": CopyExtraObject(a.extra)};
			}
		}
		var ovars = o["events"]["vars"];
		for (p in this.varsBySid) {
			if (this.varsBySid.hasOwnProperty(p)) {
				v = this.varsBySid[p];
				if (!v.is_constant && (!v.parent || v.is_static))
					ovars[p] = v.data;
			}
		}
		o["system"] = this.system.saveToJSON();
		return JSON.stringify(o);
	};
	Runtime.prototype.refreshUidMap = function () {
		var i, len, type, j, lenj, inst;
		this.objectsByUid = {};
		for (i = 0, len = this.types_by_index.length; i < len; i++) {
			type = this.types_by_index[i];
			if (type.is_family)
				continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++) {
				inst = type.instances[j];
				this.objectsByUid[inst.uid.toString()] = inst;
			}
		}
	};
	Runtime.prototype.loadFromJSONString = function (str) {
		var o;
		try {
			o = JSON.parse(str);
		}
		catch (e) {
			return false;
		}
		if (!o["c2save"])
			return false;		// probably not a c2 save state
		if (o["version"] > 1)
			return false;		// from future version of c2; assume not compatible
		this.isLoadingState = true;
		var rt = o["rt"];
		this.kahanTime.reset();
		this.kahanTime.sum = rt["time"];
		this.wallTime.reset();
		this.wallTime.sum = rt["walltime"] || 0;
		this.timescale = rt["timescale"];
		this.tickcount = rt["tickcount"];
		this.execcount = rt["execcount"];
		this.start_time = Date.now() - rt["start_time_offset"];
		var layout_sid = rt["running_layout"];
		if (layout_sid !== this.running_layout.sid) {
			var changeToLayout = this.getLayoutBySid(layout_sid);
			if (changeToLayout)
				this.doChangeLayout(changeToLayout);
			else
				return;		// layout that was saved on has gone missing (deleted?)
		}
		var i, len, j, lenj, k, lenk, p, type, existing_insts, load_insts, inst, binst, layout, layer, g, iid, t;
		var otypes = o["types"];
		for (p in otypes) {
			if (otypes.hasOwnProperty(p)) {
				type = this.getObjectTypeBySid(parseInt(p, 10));
				if (!type || type.is_family || this.typeHasNoSaveBehavior(type))
					continue;
				if (otypes[p]["ex"])
					type.extra = otypes[p]["ex"];
				else
					cr.wipe(type.extra);
				existing_insts = type.instances;
				load_insts = otypes[p]["instances"];
				for (i = 0, len = cr.min(existing_insts.length, load_insts.length); i < len; i++) {
					this.loadInstanceFromJSON(existing_insts[i], load_insts[i]);
				}
				for (i = load_insts.length, len = existing_insts.length; i < len; i++)
					this.DestroyInstance(existing_insts[i]);
				for (i = existing_insts.length, len = load_insts.length; i < len; i++) {
					layer = null;
					if (type.plugin.is_world) {
						layer = this.running_layout.getLayerBySid(load_insts[i]["w"]["l"]);
						if (!layer)
							continue;
					}
					inst = this.createInstanceFromInit(type.default_instance, layer, false, 0, 0, true);
					this.loadInstanceFromJSON(inst, load_insts[i]);
				}
				type.stale_iids = true;
			}
		}
		this.ClearDeathRow();
		this.refreshUidMap();
		var olayouts = o["layouts"];
		for (p in olayouts) {
			if (olayouts.hasOwnProperty(p)) {
				layout = this.getLayoutBySid(parseInt(p, 10));
				if (!layout)
					continue;		// must've gone missing
				layout.loadFromJSON(olayouts[p]);
			}
		}
		var ogroups = o["events"]["groups"];
		for (p in ogroups) {
			if (ogroups.hasOwnProperty(p)) {
				g = this.getGroupBySid(parseInt(p, 10));
				if (g && this.groups_by_name[g.group_name])
					this.groups_by_name[g.group_name].setGroupActive(ogroups[p]);
			}
		}
		var ocnds = o["events"]["cnds"];
		for (p in this.cndsBySid) {
			if (this.cndsBySid.hasOwnProperty(p)) {
				if (ocnds.hasOwnProperty(p)) {
					this.cndsBySid[p].extra = ocnds[p]["ex"];
				}
				else {
					this.cndsBySid[p].extra = {};
				}
			}
		}
		var oacts = o["events"]["acts"];
		for (p in this.actsBySid) {
			if (this.actsBySid.hasOwnProperty(p)) {
				if (oacts.hasOwnProperty(p)) {
					this.actsBySid[p].extra = oacts[p]["ex"];
				}
				else {
					this.actsBySid[p].extra = {};
				}
			}
		}
		var ovars = o["events"]["vars"];
		for (p in ovars) {
			if (ovars.hasOwnProperty(p) && this.varsBySid.hasOwnProperty(p)) {
				this.varsBySid[p].data = ovars[p];
			}
		}
		this.next_uid = rt["next_uid"];
		this.isLoadingState = false;
		for (i = 0, len = this.fireOnCreateAfterLoad.length; i < len; ++i) {
			inst = this.fireOnCreateAfterLoad[i];
			this.trigger(Object.getPrototypeOf(inst.type.plugin).cnds.OnCreated, inst);
		}
		cr.clearArray(this.fireOnCreateAfterLoad);
		this.system.loadFromJSON(o["system"]);
		for (i = 0, len = this.types_by_index.length; i < len; i++) {
			type = this.types_by_index[i];
			if (type.is_family || this.typeHasNoSaveBehavior(type))
				continue;
			for (j = 0, lenj = type.instances.length; j < lenj; j++) {
				inst = type.instances[j];
				if (type.is_contained) {
					iid = inst.get_iid();
					cr.clearArray(inst.siblings);
					for (k = 0, lenk = type.container.length; k < lenk; k++) {
						t = type.container[k];
						if (type === t)
							continue;
						;
						inst.siblings.push(t.instances[iid]);
					}
				}
				if (inst.afterLoad)
					inst.afterLoad();
				if (inst.behavior_insts) {
					for (k = 0, lenk = inst.behavior_insts.length; k < lenk; k++) {
						binst = inst.behavior_insts[k];
						if (binst.afterLoad)
							binst.afterLoad();
					}
				}
			}
		}
		this.redraw = true;
		return true;
	};
	Runtime.prototype.saveInstanceToJSON = function (inst, state_only) {
		var i, len, world, behinst, et;
		var type = inst.type;
		var plugin = type.plugin;
		var o = {};
		if (state_only)
			o["c2"] = true;		// mark as known json data from Construct 2
		else
			o["uid"] = inst.uid;
		if (cr.hasAnyOwnProperty(inst.extra))
			o["ex"] = CopyExtraObject(inst.extra);
		if (inst.instance_vars && inst.instance_vars.length) {
			o["ivs"] = {};
			for (i = 0, len = inst.instance_vars.length; i < len; i++) {
				o["ivs"][inst.type.instvar_sids[i].toString()] = inst.instance_vars[i];
			}
		}
		if (plugin.is_world) {
			world = {
				"x": inst.x,
				"y": inst.y,
				"w": inst.width,
				"h": inst.height,
				"l": inst.layer.sid,
				"zi": inst.get_zindex()
			};
			if (inst.angle !== 0)
				world["a"] = inst.angle;
			if (inst.opacity !== 1)
				world["o"] = inst.opacity;
			if (inst.hotspotX !== 0.5)
				world["hX"] = inst.hotspotX;
			if (inst.hotspotY !== 0.5)
				world["hY"] = inst.hotspotY;
			if (inst.blend_mode !== 0)
				world["bm"] = inst.blend_mode;
			if (!inst.visible)
				world["v"] = inst.visible;
			if (!inst.collisionsEnabled)
				world["ce"] = inst.collisionsEnabled;
			if (inst.my_timescale !== -1)
				world["mts"] = inst.my_timescale;
			if (type.effect_types.length) {
				world["fx"] = [];
				for (i = 0, len = type.effect_types.length; i < len; i++) {
					et = type.effect_types[i];
					world["fx"].push({
						"name": et.name,
						"active": inst.active_effect_flags[et.index],
						"params": inst.effect_params[et.index]
					});
				}
			}
			o["w"] = world;
		}
		if (inst.behavior_insts && inst.behavior_insts.length) {
			o["behs"] = {};
			for (i = 0, len = inst.behavior_insts.length; i < len; i++) {
				behinst = inst.behavior_insts[i];
				if (behinst.saveToJSON)
					o["behs"][behinst.type.sid.toString()] = behinst.saveToJSON();
			}
		}
		if (inst.saveToJSON)
			o["data"] = inst.saveToJSON();
		return o;
	};
	Runtime.prototype.getInstanceVarIndexBySid = function (type, sid_) {
		var i, len;
		for (i = 0, len = type.instvar_sids.length; i < len; i++) {
			if (type.instvar_sids[i] === sid_)
				return i;
		}
		return -1;
	};
	Runtime.prototype.getBehaviorIndexBySid = function (inst, sid_) {
		var i, len;
		for (i = 0, len = inst.behavior_insts.length; i < len; i++) {
			if (inst.behavior_insts[i].type.sid === sid_)
				return i;
		}
		return -1;
	};
	Runtime.prototype.loadInstanceFromJSON = function (inst, o, state_only) {
		var p, i, len, iv, oivs, world, fxindex, obehs, behindex;
		var oldlayer;
		var type = inst.type;
		var plugin = type.plugin;
		if (state_only) {
			if (!o["c2"])
				return;
		}
		else
			inst.uid = o["uid"];
		if (o["ex"])
			inst.extra = o["ex"];
		else
			cr.wipe(inst.extra);
		oivs = o["ivs"];
		if (oivs) {
			for (p in oivs) {
				if (oivs.hasOwnProperty(p)) {
					iv = this.getInstanceVarIndexBySid(type, parseInt(p, 10));
					if (iv < 0 || iv >= inst.instance_vars.length)
						continue;		// must've gone missing
					inst.instance_vars[iv] = oivs[p];
				}
			}
		}
		if (plugin.is_world) {
			world = o["w"];
			if (inst.layer.sid !== world["l"]) {
				oldlayer = inst.layer;
				inst.layer = this.running_layout.getLayerBySid(world["l"]);
				if (inst.layer) {
					oldlayer.removeFromInstanceList(inst, true);
					inst.layer.appendToInstanceList(inst, true);
					inst.set_bbox_changed();
					inst.layer.setZIndicesStaleFrom(0);
				}
				else {
					inst.layer = oldlayer;
					if (!state_only)
						this.DestroyInstance(inst);
				}
			}
			inst.x = world["x"];
			inst.y = world["y"];
			inst.width = world["w"];
			inst.height = world["h"];
			inst.zindex = world["zi"];
			inst.angle = world.hasOwnProperty("a") ? world["a"] : 0;
			inst.opacity = world.hasOwnProperty("o") ? world["o"] : 1;
			inst.hotspotX = world.hasOwnProperty("hX") ? world["hX"] : 0.5;
			inst.hotspotY = world.hasOwnProperty("hY") ? world["hY"] : 0.5;
			inst.visible = world.hasOwnProperty("v") ? world["v"] : true;
			inst.collisionsEnabled = world.hasOwnProperty("ce") ? world["ce"] : true;
			inst.my_timescale = world.hasOwnProperty("mts") ? world["mts"] : -1;
			inst.blend_mode = world.hasOwnProperty("bm") ? world["bm"] : 0;
			;
			inst.compositeOp = cr.effectToCompositeOp(inst.blend_mode);
			if (this.gl)
				cr.setGLBlend(inst, inst.blend_mode, this.gl);
			inst.set_bbox_changed();
			if (world.hasOwnProperty("fx")) {
				for (i = 0, len = world["fx"].length; i < len; i++) {
					fxindex = type.getEffectIndexByName(world["fx"][i]["name"]);
					if (fxindex < 0)
						continue;		// must've gone missing
					inst.active_effect_flags[fxindex] = world["fx"][i]["active"];
					inst.effect_params[fxindex] = world["fx"][i]["params"];
				}
			}
			inst.updateActiveEffects();
		}
		obehs = o["behs"];
		if (obehs) {
			for (p in obehs) {
				if (obehs.hasOwnProperty(p)) {
					behindex = this.getBehaviorIndexBySid(inst, parseInt(p, 10));
					if (behindex < 0)
						continue;		// must've gone missing
					inst.behavior_insts[behindex].loadFromJSON(obehs[p]);
				}
			}
		}
		if (o["data"])
			inst.loadFromJSON(o["data"]);
	};
	Runtime.prototype.fetchLocalFileViaCordova = function (filename, successCallback, errorCallback) {
		var path = cordova["file"]["applicationDirectory"] + "www/" + filename;
		window["resolveLocalFileSystemURL"](path, function (entry) {
			entry.file(successCallback, errorCallback);
		}, errorCallback);
	};
	Runtime.prototype.fetchLocalFileViaCordovaAsText = function (filename, successCallback, errorCallback) {
		this.fetchLocalFileViaCordova(filename, function (file) {
			var reader = new FileReader();
			reader.onload = function (e) {
				successCallback(e.target.result);
			};
			reader.onerror = errorCallback;
			reader.readAsText(file);
		}, errorCallback);
	};
	var queuedArrayBufferReads = [];
	var activeArrayBufferReads = 0;
	var MAX_ARRAYBUFFER_READS = 8;
	Runtime.prototype.maybeStartNextArrayBufferRead = function () {
		if (!queuedArrayBufferReads.length)
			return;		// none left
		if (activeArrayBufferReads >= MAX_ARRAYBUFFER_READS)
			return;		// already got maximum number in-flight
		activeArrayBufferReads++;
		var job = queuedArrayBufferReads.shift();
		this.doFetchLocalFileViaCordovaAsArrayBuffer(job.filename, job.successCallback, job.errorCallback);
	};
	Runtime.prototype.fetchLocalFileViaCordovaAsArrayBuffer = function (filename, successCallback_, errorCallback_) {
		var self = this;
		queuedArrayBufferReads.push({
			filename: filename,
			successCallback: function (result) {
				activeArrayBufferReads--;
				self.maybeStartNextArrayBufferRead();
				successCallback_(result);
			},
			errorCallback: function (err) {
				activeArrayBufferReads--;
				self.maybeStartNextArrayBufferRead();
				errorCallback_(err);
			}
		});
		this.maybeStartNextArrayBufferRead();
	};
	Runtime.prototype.doFetchLocalFileViaCordovaAsArrayBuffer = function (filename, successCallback, errorCallback) {
		this.fetchLocalFileViaCordova(filename, function (file) {
			var reader = new FileReader();
			reader.onload = function (e) {
				successCallback(e.target.result);
			};
			reader.readAsArrayBuffer(file);
		}, errorCallback);
	};
	Runtime.prototype.fetchLocalFileViaCordovaAsURL = function (filename, successCallback, errorCallback) {
		this.fetchLocalFileViaCordovaAsArrayBuffer(filename, function (arrayBuffer) {
			var blob = new Blob([arrayBuffer]);
			var url = URL.createObjectURL(blob);
			successCallback(url);
		}, errorCallback);
	};
	Runtime.prototype.isAbsoluteUrl = function (url) {
		return /^(?:[a-z]+:)?\/\//.test(url) || url.substr(0, 5) === "data:" || url.substr(0, 5) === "blob:";
	};
	Runtime.prototype.setImageSrc = function (img, src) {
		if (this.isWKWebView && !this.isAbsoluteUrl(src)) {
			this.fetchLocalFileViaCordovaAsURL(src, function (url) {
				img.src = url;
			}, function (err) {
				alert("Failed to load image: " + err);
			});
		}
		else {
			img.src = src;
		}
	};
	Runtime.prototype.setCtxImageSmoothingEnabled = function (ctx, e) {
		if (typeof ctx["imageSmoothingEnabled"] !== "undefined") {
			ctx["imageSmoothingEnabled"] = e;
		}
		else {
			ctx["webkitImageSmoothingEnabled"] = e;
			ctx["mozImageSmoothingEnabled"] = e;
			ctx["msImageSmoothingEnabled"] = e;
		}
	};
	cr.runtime = Runtime;
	cr.createRuntime = function (canvasid) {
		return new Runtime(document.getElementById(canvasid));
	}
	window["cr_createRuntime"] = cr.createRuntime;
}());
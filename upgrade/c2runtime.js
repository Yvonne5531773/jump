(function() {  //runtime
		function f(a) {
			if (a && (a.getContext || a.dc) && !a.c2runtime) {
				a.c2runtime = this;
				var b = this;
				this.yd = (this.an = /crosswalk/i.test(navigator.userAgent) || /xwalk/i.test(navigator.userAgent) || !("undefined" === typeof window.c2isCrosswalk || !window.c2isCrosswalk)) || "undefined" !== typeof window.device && ("undefined" !== typeof window.device.cordova || "undefined" !== typeof window.device.phonegap) || "undefined" !== typeof window.c2iscordova && window.c2iscordova;
				this.$b = !!a.dc;
				this.mu = "undefined" !== typeof window.AppMobi || this.$b;
				this.Td = !!window.c2cocoonjs;
				this.ve = !!window.c2ejecta;
				this.Td && (CocoonJS.App.onSuspended.addEventListener(function() {
					b.setSuspended(!0)
				}),
					CocoonJS.App.onActivated.addEventListener(function() {
						b.setSuspended(!1)
					}));
				this.ve && (document.addEventListener("pagehide", function() {
					b.setSuspended(!0)
				}),
					document.addEventListener("pageshow", function() {
						b.setSuspended(!1)
					}),
					document.addEventListener("resize", function() {
						b.setSize(window.innerWidth, window.innerHeight)
					}));
				this.Ta = this.$b || this.Td || this.ve;
				this.ck = /edge\//i.test(navigator.userAgent);
				this.Bf = (/msie/i.test(navigator.userAgent) || /trident/i.test(navigator.userAgent) || /iemobile/i.test(navigator.userAgent)) && !this.ck;
				this.qu = /tizen/i.test(navigator.userAgent);
				this.Ym = /android/i.test(navigator.userAgent) && !this.qu && !this.Bf && !this.ck;
				this.uu = (/iphone/i.test(navigator.userAgent) || /ipod/i.test(navigator.userAgent)) && !this.Bf && !this.ck;
				this.cD = /ipad/i.test(navigator.userAgent);
				this.Hi = this.uu || this.cD || this.ve;
				this.dq = (/chrome/i.test(navigator.userAgent) || /chromium/i.test(navigator.userAgent)) && !this.Bf && !this.ck;
				this.lu = /amazonwebappplatform/i.test(navigator.userAgent);
				this.WC = /firefox/i.test(navigator.userAgent);
				this.YC = /safari/i.test(navigator.userAgent) && !this.dq && !this.Bf && !this.ck;
				this.$C = /windows/i.test(navigator.userAgent);
				this.dk = "undefined" !== typeof window.c2nodewebkit || "undefined" !== typeof window.c2nwjs || /nodewebkit/i.test(navigator.userAgent) || /nwjs/i.test(navigator.userAgent);
				this.su = !("undefined" === typeof window.c2isWindows8 || !window.c2isWindows8);
				this.bD = !("undefined" === typeof window.c2isWindows8Capable || !window.c2isWindows8Capable);
				this.wg = !("undefined" === typeof window.c2isWindowsPhone8 || !window.c2isWindowsPhone8);
				this.lq = !("undefined" === typeof window.c2isWindowsPhone81 || !window.c2isWindowsPhone81);
				this.kq = !!window.cr_windows10;
				this.ru = this.su || this.bD || this.lq || this.kq;
				this.TC = !("undefined" === typeof window.c2isBlackberry10 || !window.c2isBlackberry10);
				this.Zm = this.Ym && !this.dq && !this.an && !this.WC && !this.lu && !this.Ta;
				this.devicePixelRatio = 1;
				this.Cf = this.yd || this.an || this.mu || this.Td || this.Ym || this.Hi || this.wg || this.lq || this.TC || this.qu || this.ve;
				this.Cf || (this.Cf = /(blackberry|bb10|playbook|palm|symbian|nokia|windows\s+ce|phone|mobile|tablet|kindle|silk)/i.test(navigator.userAgent));
				this.hk = !!(this.Hi && this.yd && window.webkit);
				"undefined" === typeof cr_is_preview || this.dk || "?nw" !== window.location.search && !/nodewebkit/i.test(navigator.userAgent) && !/nwjs/i.test(navigator.userAgent) || (this.dk = !0);
				this.canvas = a;
				this.$l = document.getElementById("c2canvasdiv");
				this.F = this.O = null;
				this.Up = "(unavailable)";
				this.cb = !1;
				this.hh = 0;
				this.fb = null;
				this.zm = !1;
				this.sv = this.tv = 0;
				this.canvas.oncontextmenu = function(a) {
					a.preventDefault && a.preventDefault();
					return !1
				}
				;
				this.canvas.onselectstart = function(a) {
					a.preventDefault && a.preventDefault();
					return !1
				}
				;
				this.$b && (window.c2runtime = this);
				this.dk && (window.ondragover = function(a) {
					a.preventDefault();
					return !1
				}
					,
					window.ondrop = function(a) {
						a.preventDefault();
						return !1
					}
					,
				window.nwgui && window.nwgui.App.clearCache && window.nwgui.App.clearCache());
				this.Zm && "undefined" !== typeof jQuery && jQuery("canvas").parents("*").css("overflow", "visible");
				this.width = a.width;
				this.height = a.height;
				this.ja = this.width;
				this.ga = this.height;
				this.hm = this.width;
				this.Jj = this.height;
				this.Ji = window.innerWidth;
				this.Ii = window.innerHeight;
				this.ba = !0;
				this.fk = !1;
				Date.now || (Date.now = function() {
						return +new Date
					}
				);
				this.plugins = [];
				this.types = {};
				this.N = [];
				this.jb = [];
				this.Ff = {};
				this.we = [];
				this.Cp = {};
				this.uf = [];
				this.rj = [];
				this.Do = [];
				this.wA = [];
				this.xA = [];
				this.tr = null;
				this.eh = {};
				this.gq = this.sg = !1;
				this.zd = 0;
				this.fq = this.jq = !1;
				this.oe = [];
				this.bk = !1;
				this.pn = this.lr = "";
				this.Tb = null;
				this.Df = "";
				this.hl = this.rw = !1;
				this.ym = [];
				this.gh = this.fh = 0;
				this.hv = 30;
				this.tp = this.Ck = 0;
				this.Rg = 1;
				this.Ab = new eb;
				this.Vf = new eb;
				this.An = this.Fm = this.lh = this.qd = this.Eh = this.Em = this.jn = 0;
				this.nf = null;
				this.qm = [];
				this.Bp = [];
				this.um = -1;
				this.zq = [[]];
				this.Hr = this.tn = 0;
				this.Sn(null);
				this.Dk = [];
				this.Ek = -1;
				this.nv = this.Ik = 0;
				this.tq = !0;
				this.Qj = 0;
				this.il = [];
				this.Dr = this.Xq = -1;
				this.Ah = !0;
				this.Hh = 0;
				this.ek = !1;
				this.tE = 0;
				this.ei = null;
				this.mc = this.Yt = !1;
				this.rv = new ca;
				this.Jq = new ca;
				this.Kq = new ca;
				this.Wk = [];
				this.Ae = new gb([]);
				this.Cr = new gb([]);
				this.dg = [];
				this.ti = {};
				this.fg = {};
				this.ag = {};
				this.pj = {};
				this.Vs = {};
				this.Hu = this.nn = this.Bb = this.Rb = this.Gu = this.mn = this.Ia = null;
				this.nj = this.mq = !1;
				this.Kp = [null, null];
				this.mh = 0;
				this.Rj = "";
				this.If = {};
				this.fl = this.Bg = null;
				this.uw = "";
				this.zn = [];
				this.ZD()
			}
		}
		function m(a, b) {
			return 128 >= b ? a[3] : 256 >= b ? a[2] : 512 >= b ? a[1] : a[0]
		}
		function n() {
			try {
				return !!window.indexedDB
			} catch (a) {
				return !1
			}
		}
		function k(a) {
			a.target.result.createObjectStore("saves", {
				keyPath: "slot"
			})
		}
		function d(a, b, c, e) {
			try {
				var l = indexedDB.open("_C2SaveStates");
				l.onupgradeneeded = k;
				l.onerror = e;
				l.onsuccess = function(l) {
					l = l.target.result;
					l.onerror = e;
					l.transaction(["saves"], "readwrite").objectStore("saves").put({
						slot: a,
						data: b
					}).onsuccess = c
				}
			} catch (d) {
				e(d)
			}
		}
		function g(a, b, c) {
			try {
				var e = indexedDB.open("_C2SaveStates");
				e.onupgradeneeded = k;
				e.onerror = c;
				e.onsuccess = function(e) {
					e = e.target.result;
					e.onerror = c;
					var l = e.transaction(["saves"]).objectStore("saves").get(a);
					l.onsuccess = function() {
						l.result ? b(l.result.data) : b(null)
					}
				}
			} catch (l) {
				c(l)
			}
		}
		function h() {
			fa("Reloading for continuous preview");
			window.c2cocoonjs ? CocoonJS.App.reload() : -1 < window.location.search.indexOf("continuous") ? window.location.reload(!0) : window.location = window.location + "?continuous"
		}
		function c(a) {
			var b, c = {};
			for (b in a)
				!a.hasOwnProperty(b) || a[b]instanceof ca || a[b] && "undefined" !== typeof a[b].ZF || "spriteCreatedDestroyCallback" !== b && (c[b] = a[b]);
			return c
		}
		var e = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame;
		f.prototype.ZD = function() {
			var a = this;
			if (this.hk)
				this.Ft("data.js", function(b) {
					a.uk(JSON.parse(b))
				}, function() {
					alert("Error fetching data.js")
				});
			else {
				var b;
				this.wg ? b = new ActiveXObject("Microsoft.XMLHTTP") : b = new XMLHttpRequest;
				var c = "data.js";
				if (this.su || this.wg || this.lq || this.kq)
					c = "data.json";
				b.open("GET", c, !0);
				var e = !1;
				if (!this.Ta && "response"in b && "responseType"in b)
					try {
						b.responseType = "json",
							e = "json" === b.responseType
					} catch (l) {
						e = !1
					}
				if (!e && "responseType"in b)
					try {
						b.responseType = "text"
					} catch (d) {}
				if ("overrideMimeType"in b)
					try {
						b.overrideMimeType("application/json; charset=utf-8")
					} catch (h) {}
				this.wg ? b.onreadystatechange = function() {
					4 === b.readyState && a.uk(JSON.parse(b.responseText))
				}
					: (b.onload = function() {
						if (e)
							a.uk(b.response);
						else if (a.ve) {
							var c = b.responseText
								, c = c.substr(c.indexOf("{"));
							a.uk(JSON.parse(c))
						} else
							a.uk(JSON.parse(b.responseText))
					}
						,
						b.onerror = function(a) {
							ga("Error requesting " + c + ":");
							ga(a)
						}
				);
				b.send()
			}
		}
		f.prototype.SC = function() {
			var a = this, b, c, e, l, d, h, g, k, p;
			this.xh = (!this.Ta || this.ve || this.yd) && this.HE && !this.Zm;
			0 === this.Uc && this.Hi && (this.xh = !1);
			this.devicePixelRatio = this.xh ? window.devicePixelRatio || window.webkitDevicePixelRatio || window.mozDevicePixelRatio || window.msDevicePixelRatio || 1 : 1;
			this.tc();
			0 < this.Uc && this.setSize(window.innerWidth, window.innerHeight, !0);
			this.canvas.addEventListener("webglcontextlost", function(b) {
				b.preventDefault();
				a.qD();
				fa("[Construct 2] WebGL context lost");
				window.cr_setSuspended(!0)
			}, !1);
			this.canvas.addEventListener("webglcontextrestored", function() {
				a.F.du();
				a.F.Nf(a.F.width, a.F.height, !0);
				a.Rb = null;
				a.Bb = null;
				a.Kp[0] = null;
				a.Kp[1] = null;
				a.rD();
				a.ba = !0;
				fa("[Construct 2] WebGL context restored");
				window.cr_setSuspended(!1)
			}, !1);
			try {
				this.vB && (this.Td || this.ve || !this.Ta) && (b = {
					alpha: !0,
					depth: !1,
					antialias: !1,
					powerPreference: "high-performance",
					failIfMajorPerformanceCaveat: !0
				},
					this.O = this.canvas.getContext("webgl2", b) || this.canvas.getContext("webgl", b) || this.canvas.getContext("experimental-webgl", b))
			} catch (q) {}
			if (this.O) {
				if (b = this.O.getExtension("WEBGL_debug_renderer_info"))
					this.Up = this.O.getParameter(b.UNMASKED_RENDERER_WEBGL) + " [" + this.O.getParameter(b.UNMASKED_VENDOR_WEBGL) + "]";
				this.cb && (this.Up += " [front-to-back enabled]");
				this.Ta || (this.pc = document.createElement("canvas"),
					jQuery(this.pc).appendTo(this.canvas.parentNode),
					this.pc.oncontextmenu = function() {
						return !1
					}
					,
					this.pc.onselectstart = function() {
						return !1
					}
					,
					this.pc.width = Math.round(this.hm * this.devicePixelRatio),
					this.pc.height = Math.round(this.Jj * this.devicePixelRatio),
					jQuery(this.pc).css({
						width: this.hm + "px",
						height: this.Jj + "px"
					}),
					this.Nv(),
					this.Qq = this.pc.getContext("2d"));
				this.F = new tb(this.O,this.Cf,this.cb);
				this.F.Nf(this.canvas.width, this.canvas.height);
				this.F.zt = 0 !== this.nB;
				this.fb = null;
				b = 0;
				for (c = this.N.length; b < c; b++)
					for (d = this.N[b],
						     e = 0,
						     l = d.qa.length; e < l; e++)
						g = d.qa[e],
							g.Ib = this.F.Tp(g.id),
							g.ye = this.F.Vq(g.Ib),
							this.nj = this.nj || this.F.Uk(g.Ib);
				b = 0;
				for (c = this.we.length; b < c; b++) {
					k = this.we[b];
					e = 0;
					for (l = k.qa.length; e < l; e++)
						g = k.qa[e],
							g.Ib = this.F.Tp(g.id),
							g.ye = this.F.Vq(g.Ib);
					k.Be();
					e = 0;
					for (l = k.ta.length; e < l; e++) {
						p = k.ta[e];
						d = 0;
						for (h = p.qa.length; d < h; d++)
							g = p.qa[d],
								g.Ib = this.F.Tp(g.id),
								g.ye = this.F.Vq(g.Ib),
								this.nj = this.nj || this.F.Uk(g.Ib);
						p.Be()
					}
				}
			} else {
				if (0 < this.Uc && this.$b) {
					this.canvas = null;
					document.oncontextmenu = function() {
						return !1
					}
					;
					document.onselectstart = function() {
						return !1
					}
					;
					this.fb = AppMobi.canvas.getContext("2d");
					try {
						this.fb.samplingMode = this.Xa ? "smooth" : "sharp",
							this.fb.globalScale = 1,
							this.fb.HTML5CompatibilityMode = !0,
							this.fb.imageSmoothingEnabled = this.Xa
					} catch (r) {}
					0 !== this.width && 0 !== this.height && (this.fb.width = this.width,
						this.fb.height = this.height)
				}
				this.fb || (this.Td ? (b = {
					antialias: !!this.Xa,
					alpha: !0
				},
					this.fb = this.canvas.getContext("2d", b)) : (b = {
					alpha: !0
				},
					this.fb = this.canvas.getContext("2d", b)),
					this.co(this.fb, this.Xa));
				this.Qq = this.pc = null
			}
			this.Ew = function(b) {
				a.La(!1, b)
			}
			;
			window == window.top || this.Ta || this.ru || this.wg || (document.addEventListener("mousedown", function() {
				window.focus()
			}, !0),
				document.addEventListener("touchstart", function() {
					window.focus()
				}, !0));
			"undefined" !== typeof cr_is_preview && (this.Td && console.log("[Construct 2] In preview-over-wifi via CocoonJS mode"),
			-1 < window.location.search.indexOf("continuous") && (fa("Reloading for continuous preview"),
				this.pn = "__c2_continuouspreview",
				this.hl = !0),
			this.ED && !this.Cf && (jQuery(window).focus(function() {
				a.setSuspended(!1)
			}),
				jQuery(window).blur(function() {
					var b = window.parent;
					b && b.document.hasFocus() || a.setSuspended(!0)
				})));
			window.addEventListener("blur", function() {
				a.Zi()
			});
			this.Ta || (b = function(a) {
				if (sb(a) && document.activeElement && document.activeElement !== document.getElementsByTagName("body")[0] && document.activeElement.blur)
					try {
						document.activeElement.blur()
					} catch (b) {}
			}
				,
				"undefined" !== typeof PointerEvent ? document.addEventListener("pointerdown", b) : window.navigator.msPointerEnabled ? document.addEventListener("MSPointerDown", b) : document.addEventListener("touchstart", b),
				document.addEventListener("mousedown", b));
			0 === this.Uc && this.xh && 1 < this.devicePixelRatio && this.setSize(this.Eb, this.Db, !0);
			this.Jw();
			this.LC();
			this.go();
			this.da = {}
		}
		f.prototype.setSize = function(a, b, c) {
			var e = 0
				, l = 0
				, d = 0
				, h = 0
				, h = 0;
			if (this.Ji !== a || this.Ii !== b || c) {
				this.Ji = a;
				this.Ii = b;
				var g = this.Uc;
				if ((d = (document.mozFullScreen || document.webkitIsFullScreen || !!document.msFullscreenElement || document.fullScreen || this.ek) && !this.yd) || 0 !== this.Uc || c)
					d && 0 < this.mh && (g = this.mh),
						c = this.devicePixelRatio,
						4 <= g ? (d = this.Eb / this.Db,
							a / b > d ? (d *= b,
								5 === g ? (h = d * c / this.Eb,
									1 < h ? h = Math.floor(h) : 1 > h && (h = 1 / Math.ceil(1 / h)),
									d = this.Eb * h / c,
									h = this.Db * h / c,
									e = (a - d) / 2,
									l = (b - h) / 2,
									a = d,
									b = h) : (e = (a - d) / 2,
									a = d)) : (h = a / d,
								5 === g ? (h = h * c / this.Db,
									1 < h ? h = Math.floor(h) : 1 > h && (h = 1 / Math.ceil(1 / h)),
									d = this.Eb * h / c,
									h = this.Db * h / c,
									e = (a - d) / 2,
									l = (b - h) / 2,
									a = d) : l = (b - h) / 2,
								b = h)) : this.dk && this.ek && 0 === this.Mt && (e = Math.floor((a - this.Eb) / 2),
								l = Math.floor((b - this.Db) / 2),
								a = this.Eb,
								b = this.Db),
					2 > g && (this.Ej = c),
						this.hm = Math.round(a),
						this.Jj = Math.round(b),
						this.width = Math.round(a * c),
						this.height = Math.round(b * c),
						this.ba = !0,
						this.Xw ? (this.ja = this.width,
							this.ga = this.height,
							this.vd = !0) : this.width < this.Eb && this.height < this.Db || 1 === g ? (this.ja = this.width,
							this.ga = this.height,
							this.vd = !0) : (this.ja = this.Eb,
							this.ga = this.Db,
							this.vd = !1,
							2 === g ? (d = this.Eb / this.Db,
								g = this.Ji / this.Ii,
								g < d ? this.ja = this.ga * g : g > d && (this.ga = this.ja / g)) : 3 === g && (d = this.Eb / this.Db,
									g = this.Ji / this.Ii,
									g > d ? this.ja = this.ga * g : g < d && (this.ga = this.ja / g))),
					this.$l && !this.Ta && (jQuery(this.$l).css({
						width: Math.round(a) + "px",
						height: Math.round(b) + "px",
						"margin-left": Math.floor(e) + "px",
						"margin-top": Math.floor(l) + "px"
					}),
					"undefined" !== typeof cr_is_preview && jQuery("#borderwrap").css({
						width: Math.round(a) + "px",
						height: Math.round(b) + "px"
					})),
					this.canvas && (this.canvas.width = Math.round(a * c),
						this.canvas.height = Math.round(b * c),
						this.ve ? (this.canvas.style.left = Math.floor(e) + "px",
							this.canvas.style.top = Math.floor(l) + "px",
							this.canvas.style.width = Math.round(a) + "px",
							this.canvas.style.height = Math.round(b) + "px") : this.xh && !this.Ta && (this.canvas.style.width = Math.round(a) + "px",
								this.canvas.style.height = Math.round(b) + "px")),
					this.pc && (this.pc.width = Math.round(a * c),
						this.pc.height = Math.round(b * c),
						this.pc.style.width = this.hm + "px",
						this.pc.style.height = this.Jj + "px"),
					this.F && this.F.Nf(Math.round(a * c), Math.round(b * c)),
					this.$b && this.fb && (this.fb.width = Math.round(a),
						this.fb.height = Math.round(b)),
					this.fb && this.co(this.fb, this.Xa),
						this.Jw(),
					this.uu && !this.yd && window.scrollTo(0, 0)
			}
		}
		f.prototype.Jw = function() {
			if (this.BA && 0 !== this.Pq) {
				var a = "portrait";
				2 === this.Pq && (a = "landscape");
				try {
					screen.orientation && screen.orientation.lock ? screen.orientation.lock(a).catch(function() {}) : screen.lockOrientation ? screen.lockOrientation(a) : screen.webkitLockOrientation ? screen.webkitLockOrientation(a) : screen.mozLockOrientation ? screen.mozLockOrientation(a) : screen.msLockOrientation && screen.msLockOrientation(a)
				} catch (b) {
					console && console.warn && console.warn("Failed to lock orientation: ", b)
				}
			}
		}
		f.prototype.qD = function() {
			this.F.NA();
			this.mq = !0;
			var a, b, c;
			a = 0;
			for (b = this.N.length; a < b; a++)
				c = this.N[a],
				c.Wi && c.Wi()
		}
		f.prototype.rD = function() {
			this.mq = !1;
			var a, b, c;
			a = 0;
			for (b = this.N.length; a < b; a++)
				c = this.N[a],
				c.Nk && c.Nk()
		}
		f.prototype.Nv = function() {
			if (!this.Ta) {
				var a = (document.mozFullScreen || document.webkitIsFullScreen || document.fullScreen || document.msFullscreenElement || this.ek) && !this.yd ? jQuery(this.canvas).offset() : jQuery(this.canvas).position();
				a.position = "absolute";
				jQuery(this.pc).css(a)
			}
		}
		var b = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame || window.oCancelAnimationFrame;
		f.prototype.setSuspended = function(a) {
			var c;
			if (a && !this.fk)
				for (fa("[Construct 2] Suspending"),
					     this.fk = !0,
				     -1 !== this.Xq && b && b(this.Xq),
				     -1 !== this.Dr && clearTimeout(this.Dr),
					     a = 0,
					     c = this.il.length; a < c; a++)
					this.il[a](!0);
			else if (!a && this.fk) {
				fa("[Construct 2] Resuming");
				this.fk = !1;
				this.jn = ab();
				this.Eh = ab();
				a = this.Ck = this.Fm = 0;
				for (c = this.il.length; a < c; a++)
					this.il[a](!1);
				this.La(!1)
			}
		}
		f.prototype.Qs = function(a) {
			this.il.push(a)
		}
		f.prototype.Xf = function(a) {
			return this.zn[a]
		}
		f.prototype.uk = function(a) {
			a && a.project || ga("Project model unavailable");
			a = a.project;
			this.name = a[0];
			this.Ht = a[1];
			this.Uc = a[12];
			this.Mt = a[12];
			this.Eb = a[10];
			this.Db = a[11];
			this.Hv = this.Eb / 2;
			this.Iv = this.Db / 2;
			this.Ta && !this.ve && (4 <= a[12] || 0 === a[12]) && (fa("[Construct 2] Letterbox scale fullscreen modes are not supported on this platform - falling back to 'Scale outer'"),
				this.Mt = this.Uc = 3);
			this.Or = a[18];
			this.Cg = a[19];
			if (0 === this.Cg) {
				var b = new Image;
				b.crossOrigin = "anonymous";
				this.gw(b, "loading-logo.png");
				this.Bg = {
					un: b
				}
			} else if (4 === this.Cg) {
				b = new Image;
				b.src = "";
				var c = new Image;
				c.src = "";
				var e = new Image;
				e.src = "";
				var l = new Image;
				l.src = "";
				var d = new Image;
				d.src = "";
				var h = new Image;
				h.src = "";
				var g = new Image;
				g.src = "";
				var k = new Image;
				k.src = "";
				var p = new Image;
				p.src = "";
				var q = new Image;
				q.src = "";
				var r = new Image;
				r.src = "";
				var t = new Image;
				t.src = "";
				this.Bg = {
					un: [b, c, e, l],
					LD: [d, h, g, k],
					PE: [p, q, r, t]
				}
			}
			this.Ik = a[21];
			this.zn = wc();
			this.df = new X(this);
			b = 0;
			for (c = a[2].length; b < c; b++)
				g = a[2][b],
					e = this.Xf(g[0]),
					ub(g, e.prototype),
					k = new e(this),
					k.lo = g[1],
					k.xg = g[2],
					k.eG = g[5],
					k.kv = g[9],
				k.G && k.G(),
					this.plugins.push(k);
			this.zn = wc();
			b = 0;
			for (c = a[3].length; b < c; b++) {
				g = a[3][b];
				d = this.Xf(g[1]);
				k = null;
				e = 0;
				for (l = this.plugins.length; e < l; e++)
					if (this.plugins[e]instanceof d) {
						k = this.plugins[e];
						break
					}
				p = new k.M(k);
				p.name = g[0];
				p.T = g[2];
				p.cq = g[3].slice(0);
				p.JE = g[3].length;
				p.DA = g[4];
				p.gC = g[5];
				p.Aa = g[11];
				p.T ? (p.Oi = [],
					p.vf = this.Qj++,
					p.gb = null) : (p.Oi = null,
					p.vf = -1,
					p.gb = []);
				p.wm = null;
				p.pi = null;
				p.At = null;
				p.nc = !1;
				p.fd = null;
				g[6] ? (p.kl = g[6][0],
					p.ll = g[6][1],
					p.Qg = g[6][2]) : (p.kl = null,
					p.ll = 0,
					p.Qg = 0);
				g[7] ? p.dd = g[7] : p.dd = null;
				p.index = b;
				p.n = [];
				p.Kj = [];
				p.Qf = [new vb(p)];
				p.Ke = 0;
				p.Pd = null;
				p.SA = 0;
				p.ij = !0;
				p.Fo = wb;
				p.Km = xb;
				p.uC = yb;
				p.ea = zb;
				p.Vk = Ab;
				p.Hg = Bb;
				p.xe = Cb;
				p.Jm = Db;
				p.Mp = Eb;
				p.Pp = Gb;
				p.ed = Hb;
				p.Rp = Ib;
				p.cm = new hb(this.Eb,this.Db);
				p.Ql = !0;
				p.Rl = !1;
				p.da = {};
				p.toString = Jb;
				p.jb = [];
				e = 0;
				for (l = g[8].length; e < l; e++) {
					q = g[8][e];
					r = this.Xf(q[1]);
					t = null;
					d = 0;
					for (h = this.jb.length; d < h; d++)
						if (this.jb[d]instanceof r) {
							t = this.jb[d];
							break
						}
					t || (t = new r(this),
						t.Gq = [],
						t.Gk = new ca,
					t.G && t.G(),
						this.jb.push(t),
					oc.sE && t instanceof oc.sE && (this.tr = t));
					-1 === t.Gq.indexOf(p) && t.Gq.push(p);
					d = new t.M(t,p);
					d.name = q[0];
					d.Aa = q[2];
					d.G();
					p.jb.push(d)
				}
				p.global = g[9];
				p.hq = g[10];
				p.qa = [];
				e = 0;
				for (l = g[12].length; e < l; e++)
					p.qa.push({
						id: g[12][e][0],
						name: g[12][e][1],
						Ib: -1,
						ye: !1,
						K: !0,
						index: e
					});
				p.vG = g[13];
				this.Or && !p.T && !p.hq && k.xg || p.G();
				p.name && (this.types[p.name] = p);
				this.N.push(p);
				k.lo && (e = new k.J(p),
					e.uid = this.Ik++,
					e.Qv = this.nv++,
					e.rh = 0,
					e.Wj = Kb,
					e.toString = Lb,
					e.A = g[14],
					e.G(),
					p.n.push(e),
					this.If[e.uid.toString()] = e)
			}
			b = 0;
			for (c = a[4].length; b < c; b++)
				for (d = a[4][b],
					     h = this.N[d[0]],
					     e = 1,
					     l = d.length; e < l; e++)
					g = this.N[d[e]],
						g.gb.push(h),
						h.Oi.push(g);
			b = 0;
			for (c = a[28].length; b < c; b++) {
				d = a[28][b];
				h = [];
				e = 0;
				for (l = d.length; e < l; e++)
					h.push(this.N[d[e]]);
				e = 0;
				for (l = h.length; e < l; e++)
					h[e].nc = !0,
						h[e].fd = h
			}
			if (0 < this.Qj)
				for (b = 0,
					     c = this.N.length; b < c; b++)
					if (g = this.N[b],
						!g.T && g.gb.length) {
						g.wm = Array(this.Qj);
						g.pi = Array(this.Qj);
						g.At = Array(this.Qj);
						p = [];
						e = t = r = q = 0;
						for (l = g.gb.length; e < l; e++)
							for (k = g.gb[e],
								     g.wm[k.vf] = q,
								     q += k.JE,
								     g.pi[k.vf] = r,
								     r += k.DA,
								     g.At[k.vf] = t,
								     t += k.gC,
								     d = 0,
								     h = k.qa.length; d < h; d++)
								p.push(Da({}, k.qa[d]));
						g.qa = p.concat(g.qa);
						e = 0;
						for (l = g.qa.length; e < l; e++)
							g.qa[e].index = e
					}
			b = 0;
			for (c = a[5].length; b < c; b++)
				g = a[5][b],
					e = new Mb(this,g),
					this.Ff[e.name] = e,
					this.we.push(e);
			b = 0;
			for (c = a[6].length; b < c; b++)
				g = a[6][b],
					e = new Nb(this,g),
					this.Cp[e.name] = e,
					this.uf.push(e);
			b = 0;
			for (c = this.uf.length; b < c; b++)
				this.uf[b].sb();
			b = 0;
			for (c = this.uf.length; b < c; b++)
				this.uf[b].Kr();
			b = 0;
			for (c = this.Do.length; b < c; b++)
				this.Do[b].sb();
			O(this.Do);
			this.zA = a[7];
			this.Rj = a[8];
			this.Yc = a[9];
			this.Ej = 1;
			this.vB = a[13];
			this.Xa = a[14];
			this.et = a[15];
			this.HE = a[17];
			this.Pq = a[20];
			this.BA = 0 < this.Pq;
			this.ED = a[22];
			this.vd = this.Xw = a[23];
			this.nB = a[24];
			this.MD = a[25];
			this.cb = a[27] && !this.Bf;
			this.qo = Date.now();
			O(this.zn);
			this.SC()
		}
		var a = !1
			, l = 0
			, r = [];
		f.prototype.TD = function(a, b) {
			function c() {
				l--;
				e.av()
			}
			var e = this;
			a.addEventListener("load", c);
			a.addEventListener("error", c);
			r.push([a, b]);
			this.av()
		}
		f.prototype.av = function() {
			for (var a; r.length && 100 > l; )
				l++,
					a = r.shift(),
					this.gw(a[0], a[1])
		}
		f.prototype.Lo = function(b, c) {
			b.cocoonLazyLoad = !0;
			b.onerror = function(c) {
				a = b.Ys = !0;
				console && console.error && console.error("Error loading image '" + b.src + "': ", c)
			}
			;
			this.ve ? b.src = c : b.src || ("undefined" !== typeof XAPKReader ? XAPKReader.get(c, function(a) {
					b.src = a
				}, function(e) {
					a = b.Ys = !0;
					console && console.error && console.error("Error extracting image '" + c + "' from expansion file: ", e)
				}) : (b.crossOrigin = "anonymous",
					this.TD(b, c)));
			this.rj.push(b)
		}
		f.prototype.eC = function(a) {
			var b, c;
			b = 0;
			for (c = this.rj.length; b < c; b++)
				if (this.rj[b].OA === a)
					return this.rj[b];
			return null
		}
		var p = 0
			, w = !1;
		f.prototype.LC = function() {
			this.ei && (p = this.ei.mE(this.zA))
		}
		f.prototype.Ts = function() {
			var a = p, b = 0, c = 0, e = !0, l, d, c = 0;
			for (l = this.rj.length; c < l; c++) {
				d = this.rj[c];
				var h = d.gm;
				if (!h || 0 >= h)
					h = 5E4;
				a += h;
				d.src && (d.complete || d.loaded) && !d.Ys ? b += h : e = !1
			}
			e && this.MD && this.ei && (w || (this.ei.uE(),
				w = !0),
				c = this.ei.vC(),
				b += c,
			c < p && (e = !1));
			this.Mc = 0 == a ? 1 : b / a;
			return e
		}
		var t = !1;
		f.prototype.go = function() {
			if (this.fb || this.F) {
				var b = this.fb || this.Qq;
				this.pc && this.Nv();
				var c = window.innerWidth
					, l = window.innerHeight;
				this.Ji === c && this.Ii === l || this.setSize(c, l);
				this.Mc = 0;
				this.Fu = -1;
				var d = this;
				if (this.Ts() && (4 !== this.Cg || t))
					this.MC();
				else {
					l = Date.now() - this.qo;
					if (b) {
						var h = this.width
							, g = this.height
							, c = this.devicePixelRatio;
						if (3 > this.Cg && (this.Td || 500 <= l && this.Fu != this.Mc)) {
							b.clearRect(0, 0, h, g);
							var l = h / 2, g = g / 2, h = 0 === this.Cg && this.Bg.un.complete, p = 40 * c, k = 0, q = 80 * c, r;
							if (h) {
								var f = this.Bg.un
									, q = f.width * c;
								r = f.height * c;
								p = q / 2;
								k = r / 2;
								b.drawImage(f, H(l - p), H(g - k), q, r)
							}
							1 >= this.Cg ? (l = H(l - p) + .5,
								g = H(g + (k + (h ? 12 * c : 0))) + .5,
								b.fillStyle = a ? "red" : "DodgerBlue",
								b.fillRect(l, g, Math.floor(q * this.Mc), 6 * c),
								b.strokeStyle = "black",
								b.strokeRect(l, g, q, 6 * c),
								b.strokeStyle = "white",
								b.strokeRect(l - 1 * c, g - 1 * c, q + 2 * c, 8 * c)) : 2 === this.Cg && (b.font = this.ve ? "12pt ArialMT" : "12pt Arial",
									b.fillStyle = a ? "#f00" : "#999",
									b.uG = "middle",
									c = Math.round(100 * this.Mc) + "%",
									h = b.measureText ? b.measureText(c) : null,
									b.fillText(c, l - (h ? h.width : 0) / 2, g));
							this.Fu = this.Mc
						} else if (4 === this.Cg) {
							this.sB(b);
							e ? e(function() {
								d.go()
							}) : setTimeout(function() {
								d.go()
							}, 16);
							return
						}
					}
					setTimeout(function() {
						d.go()
					}, this.Td ? 10 : 100)
				}
			}
		}
		var E = -1
			, q = "undefined" === typeof cr_is_preview ? 200 : 0
			, v = !0
			, F = !1
			, I = 0
			, u = 0
			, C = "undefined" === typeof cr_is_preview ? 3E3 : 0
			, G = null
			, y = null
			, D = 0;
		f.prototype.sB = function(b) {
			if (!t) {
				for (var c = Math.ceil(this.width), e = Math.ceil(this.height), l = this.Bg.un, d = this.Bg.LD, h = this.Bg.PE, g = 0; 4 > g; ++g)
					if (!l[g].complete || !d[g].complete || !h[g].complete)
						return;
				0 === D && (E = Date.now());
				var g = Date.now(), p = !1, k = b, r, f;
				v || F ? (b.clearRect(0, 0, c, e),
				G && G.width === c && G.height === e || (G = document.createElement("canvas"),
					G.width = c,
					G.height = e,
					y = G.getContext("2d")),
					k = y,
					p = !0,
				v && 1 === D && (E = Date.now())) : b.globalAlpha = 1;
				k.fillStyle = "#333333";
				k.fillRect(0, 0, c, e);
				256 < this.Jj ? (r = Ka(.22 * e, 105, .6 * c),
					f = .25 * r,
					k.drawImage(m(d, r), .5 * c - r / 2, .2 * e - f / 2, r, f),
					f = r = Math.min(.395 * e, .95 * c),
					k.drawImage(m(l, r), .5 * c - r / 2, .485 * e - f / 2, r, f),
					r = Ka(.22 * e, 105, .6 * c),
					f = .25 * r,
					k.drawImage(m(h, r), .5 * c - r / 2, .868 * e - f / 2, r, f),
					k.fillStyle = "#3C3C3C",
					r = c,
					f = Math.max(.005 * e, 2),
					k.fillRect(0, .8 * e - f / 2, r, f),
					k.fillStyle = a ? "red" : "#E0FF65",
					r = c * this.Mc,
					k.fillRect(.5 * c - r / 2, .8 * e - f / 2, r, f)) : (f = r = .55 * e,
					k.drawImage(m(l, r), .5 * c - r / 2, .45 * e - f / 2, r, f),
					k.fillStyle = "#3C3C3C",
					r = c,
					f = Math.max(.005 * e, 2),
					k.fillRect(0, .85 * e - f / 2, r, f),
					k.fillStyle = a ? "red" : "#E0FF65",
					r = c * this.Mc,
					k.fillRect(.5 * c - r / 2, .85 * e - f / 2, r, f));
				p && (v ? b.globalAlpha = 0 === D ? 0 : Math.min((g - E) / 300, 1) : F && (b.globalAlpha = Math.max(1 - (g - u) / 300, 0)),
					b.drawImage(G, 0, 0, c, e));
				v && 300 <= g - E && 2 <= D && (v = !1,
					I = g);
				!v && g - I >= C && !F && 1 <= this.Mc && (F = !0,
					u = g);
				if (F && g - u >= 300 + q || "undefined" !== typeof cr_is_preview && 1 <= this.Mc && 500 > Date.now() - E)
					t = !0,
						F = v = !1,
						this.Bg = y = G = null;
				++D
			}
		}
		f.prototype.MC = function() {
			this.pc && (this.canvas.parentNode.removeChild(this.pc),
				this.pc = this.Qq = null);
			this.qo = Date.now();
			this.Eh = ab();
			var a, b, c;
			if (this.Or)
				for (a = 0,
					     b = this.N.length; a < b; a++)
					c = this.N[a],
					c.T || c.hq || !c.W.xg || c.G();
			else
				this.Ah = !1;
			a = 0;
			for (b = this.we.length; a < b; a++)
				this.we[a].PA();
			2 <= this.Uc && (a = this.Eb / this.Db,
				b = this.width / this.height,
				this.Ej = 2 !== this.Uc && b > a || 2 === this.Uc && b < a ? this.height / this.Db : this.width / this.Eb);
			this.Ht ? this.Ff[this.Ht].Ar() : this.we[0].Ar();
			this.Or || (this.Hh = 1,
				this.trigger(X.prototype.k.ns, null),
			window.C2_RegisterSW && window.C2_RegisterSW());
			navigator.splashscreen && navigator.splashscreen.hide && navigator.splashscreen.hide();
			a = 0;
			for (b = this.N.length; a < b; a++)
				c = this.N[a],
				c.uv && c.uv();
			document.hidden || document.webkitHidden || document.mozHidden || document.msHidden ? window.cr_setSuspended(!0) : this.La(!1);
			this.$b && AppMobi.webview.execute("onGameReady();")
		}
		f.prototype.La = function(a, b, c) {
			if (this.Ia) {
				var l = ab();
				if (c || !this.fk || a) {
					a || (e ? this.Xq = e(this.Ew) : this.Dr = setTimeout(this.Ew, this.Cf ? 1 : 16));
					b = b || l;
					var d = this.Uc;
					((c = (document.mozFullScreen || document.webkitIsFullScreen || document.fullScreen || !!document.msFullscreenElement) && !this.yd) || this.ek) && 0 < this.mh && (d = this.mh);
					if (0 < d) {
						var d = window.innerWidth
							, h = window.innerHeight;
						this.Ji === d && this.Ii === h || this.setSize(d, h)
					}
					this.Ta || (c ? this.zm || (this.zm = !0) : this.zm ? (this.zm = !1,
					0 === this.Uc && this.setSize(Math.round(this.tv / this.devicePixelRatio), Math.round(this.sv / this.devicePixelRatio), !0)) : (this.tv = this.width,
						this.sv = this.height));
					this.Ah && (c = this.Ts(),
						this.Hh = this.Mc,
					c && (this.Ah = !1,
						this.Mc = 1,
						this.trigger(X.prototype.k.ns, null),
					window.C2_RegisterSW && window.C2_RegisterSW()));
					this.hD(b);
					!this.ba && !this.Td || this.mq || this.hl || a || (this.ba = !1,
						this.F ? this.xb() : this.Ac(),
					this.fl && (this.canvas && this.canvas.toDataURL && (this.uw = this.canvas.toDataURL(this.fl[0], this.fl[1]),
					window.cr_onSnapshot && window.cr_onSnapshot(this.uw),
						this.trigger(X.prototype.k.wy, null)),
						this.fl = null));
					this.cG || (this.qd++,
						this.lh++,
						this.Fm++);
					this.Ck += ab() - l
				}
			}
		}
		f.prototype.hD = function(a) {
			var b, c, e, l, d, h, g, p;
			1E3 <= a - this.Eh && (this.Eh += 1E3,
			1E3 <= a - this.Eh && (this.Eh = a),
				this.Em = this.Fm,
				this.Fm = 0,
				this.tp = this.Ck,
				this.Ck = 0);
			b = 0;
			0 !== this.jn && (b = a - this.jn,
			0 > b && (b = 0),
				this.gh = b /= 1E3,
				.5 < this.gh ? this.gh = 0 : this.gh > 1 / this.hv && (this.gh = 1 / this.hv));
			this.jn = a;
			this.fh = this.gh * this.Rg;
			this.Ab.add(this.fh);
			this.Vf.add(b);
			a = (document.mozFullScreen || document.webkitIsFullScreen || document.fullScreen || !!document.msFullscreenElement || this.ek) && !this.yd;
			2 <= this.Uc || a && 0 < this.mh ? (b = this.Eb / this.Db,
				c = this.width / this.height,
				e = this.Uc,
			a && 0 < this.mh && (e = this.mh),
				this.Ej = 2 !== e && c > b || 2 === e && c < b ? this.height / this.Db : this.width / this.Eb,
			this.Ia && (this.Ia.mr(this.Ia.scrollX),
				this.Ia.nr(this.Ia.scrollY))) : this.Ej = this.xh ? this.devicePixelRatio : 1;
			this.tc();
			this.zd++;
			this.df.cE();
			this.zd--;
			this.tc();
			this.zd++;
			c = this.rv.ge();
			a = 0;
			for (b = c.length; a < b; a++)
				c[a].oG();
			a = 0;
			for (b = this.N.length; a < b; a++)
				if (h = this.N[a],
					!h.T && (h.jb.length || h.gb.length))
					for (c = 0,
						     e = h.n.length; c < e; c++)
						for (g = h.n[c],
							     l = 0,
							     d = g.fa.length; l < d; l++)
							g.fa[l].La();
			a = 0;
			for (b = this.N.length; a < b; a++)
				if (h = this.N[a],
					!h.T && (h.jb.length || h.gb.length))
					for (c = 0,
						     e = h.n.length; c < e; c++)
						for (g = h.n[c],
							     l = 0,
							     d = g.fa.length; l < d; l++)
							p = g.fa[l],
							p.KD && p.KD();
			c = this.Jq.ge();
			a = 0;
			for (b = c.length; a < b; a++)
				c[a].La();
			this.zd--;
			this.NC();
			for (a = 0; this.nf && 10 > a++; )
				this.xt(this.nf);
			a = 0;
			for (b = this.uf.length; a < b; a++)
				this.uf[a].Wp = !1;
			this.Ia.jh && this.Ia.jh.Hb();
			O(this.Wk);
			this.tq = !1;
			this.zd++;
			a = 0;
			for (b = this.N.length; a < b; a++)
				if (h = this.N[a],
					!h.T && (h.jb.length || h.gb.length))
					for (c = 0,
						     e = h.n.length; c < e; c++)
						for (g = h.n[c],
							     l = 0,
							     d = g.fa.length; l < d; l++)
							p = g.fa[l],
							p.Rf && p.Rf();
			c = this.Kq.ge();
			a = 0;
			for (b = c.length; a < b; a++)
				c[a].Rf();
			this.zd--
		}
		f.prototype.Zi = function() {
			var a, b, c, e, l, d, h, g, p;
			a = 0;
			for (b = this.N.length; a < b; a++)
				if (h = this.N[a],
						!h.T)
					for (c = 0,
						     e = h.n.length; c < e; c++)
						if (g = h.n[c],
							g.Zi && g.Zi(),
								g.fa)
							for (l = 0,
								     d = g.fa.length; l < d; l++)
								p = g.fa[l],
								p.Zi && p.Zi()
		}
		f.prototype.xt = function(a) {
			var b = this.Ia;
			this.Ia.vE();
			var c, e, l;
			if (this.F)
				for (c = 0,
					     e = this.N.length; c < e; c++)
					l = this.N[c],
					l.T || !l.ol || l.global && 0 !== l.n.length || -1 !== a.Zb.indexOf(l) || l.ol();
			b == a && O(this.df.cd);
			O(this.Wk);
			this.Yv(!0);
			a.Ar();
			this.Yv(!1);
			this.tq = this.ba = !0;
			this.tc()
		}
		f.prototype.Yv = function(a) {
			var b, c, e, l, d, h, g, p, k;
			b = 0;
			for (c = this.jb.length; b < c; b++)
				e = this.jb[b],
					a ? e.Jk && e.Jk() : e.Mk && e.Mk();
			b = 0;
			for (c = this.N.length; b < c; b++)
				if (e = this.N[b],
					e.global || e.W.lo)
					for (l = 0,
						     d = e.n.length; l < d; l++)
						if (h = e.n[l],
								a ? h.Jk && h.Jk() : h.Mk && h.Mk(),
								h.fa)
							for (g = 0,
								     p = h.fa.length; g < p; g++)
								k = h.fa[g],
									a ? k.Jk && k.Jk() : k.Mk && k.Mk()
		}
		f.prototype.Xh = function(a) {
			this.Jq.add(a)
		}
		f.prototype.yE = function(a) {
			this.Kq.add(a)
		}
		f.prototype.te = function(a) {
			return a && -1 !== a.Hk ? this.gh * a.Hk : this.fh
		}
		f.prototype.Ac = function() {
			this.Ia.Ac(this.fb);
			this.$b && this.fb.present()
		}
		f.prototype.xb = function() {
			this.cb && (this.hh = 1,
				this.Ia.lg(this.F));
			this.Ia.xb(this.F);
			this.F.OD()
		}
		f.prototype.fp = function(a) {
			a && this.qm.push(a)
		}
		f.prototype.YD = function(a) {
			Ja(this.qm, a)
		}
		f.prototype.nh = function(a) {
			a = a.toString();
			return this.If.hasOwnProperty(a) ? this.If[a] : null
		}
		var L = [];
		f.prototype.Kd = function(a) {
			var b, c;
			b = a.type.name;
			var e = null;
			if (this.eh.hasOwnProperty(b)) {
				if (e = this.eh[b],
						e.contains(a))
					return
			} else
				e = L.length ? L.pop() : new ca,
					this.eh[b] = e;
			e.add(a);
			this.sg = !0;
			if (a.nc)
				for (b = 0,
					     c = a.siblings.length; b < c; b++)
					this.Kd(a.siblings[b]);
			this.gq && e.oj.push(a);
			this.fq || (this.zd++,
				this.trigger(Object.getPrototypeOf(a.type.W).k.Ay, a),
				this.zd--)
		}
		f.prototype.tc = function() {
			if (this.sg) {
				var a, b, c, e, l, d;
				this.gq = !0;
				c = 0;
				for (l = this.oe.length; c < l; ++c)
					for (a = this.oe[c],
						     b = a.type,
						     b.n.push(a),
						     e = 0,
						     d = b.gb.length; e < d; ++e)
						b.gb[e].n.push(a),
							b.gb[e].ij = !0;
				O(this.oe);
				this.fy();
				$a(this.eh);
				this.sg = this.gq = !1
			}
		}
		f.prototype.fy = function() {
			for (var a in this.eh)
				this.eh.hasOwnProperty(a) && this.qx(this.eh[a])
		}
		f.prototype.qx = function(a) {
			var b = a.ge(), c = b[0].type, e, l, d, h, g, p;
			bb(c.n, a);
			c.ij = !0;
			0 === c.n.length && (c.Rl = !1);
			e = 0;
			for (l = c.gb.length; e < l; ++e)
				p = c.gb[e],
					bb(p.n, a),
					p.ij = !0;
			e = 0;
			for (l = this.df.cd.length; e < l; ++e)
				if (g = this.df.cd[e],
					g.Nc.hasOwnProperty(c.index) && bb(g.Nc[c.index].zf, a),
						!c.T)
					for (d = 0,
						     h = c.gb.length; d < h; ++d)
						p = c.gb[d],
						g.Nc.hasOwnProperty(p.index) && bb(g.Nc[p.index].zf, a);
			if (g = b[0].B) {
				if (g.Jd)
					for (d = g.n,
						     e = 0,
						     l = d.length; e < l; ++e)
						h = d[e],
						a.contains(h) && (h.Ua(),
							g.qc.update(h, h.$c, null),
							h.$c.set(0, 0, -1, -1));
				bb(g.n, a);
				g.bl(0)
			}
			for (e = 0; e < b.length; ++e)
				this.nx(b[e], c);
			a.clear();
			L.push(a);
			this.ba = !0
		}
		f.prototype.nx = function(a, b) {
			var c, e, l;
			c = 0;
			for (e = this.qm.length; c < e; ++c)
				this.qm[c](a);
			a.gg && b.cm.update(a, a.gg, null);
			(c = a.B) && c.Qh(a, !0);
			if (a.fa)
				for (c = 0,
					     e = a.fa.length; c < e; ++c)
					l = a.fa[c],
					l.ld && l.ld(),
						l.behavior.Gk.remove(a);
			this.rv.remove(a);
			this.Jq.remove(a);
			this.Kq.remove(a);
			a.ld && a.ld();
			this.If.hasOwnProperty(a.uid.toString()) && delete this.If[a.uid.toString()];
			this.An--;
			100 > b.Kj.length && b.Kj.push(a)
		}
		f.prototype.Gj = function(a, b, c, e) {
			if (a.T) {
				var l = H(Math.random() * a.Oi.length);
				return this.Gj(a.Oi[l], b, c, e)
			}
			return a.Pd ? this.hg(a.Pd, b, !1, c, e, !1) : null
		}
		var W = [];
		f.prototype.hg = function(a, b, c, e, l, d) {
			var h, g, p, k;
			if (!a)
				return null;
			var q = this.N[a[1]]
				, r = q.W.xg;
			if (this.Ah && r && !q.hq || r && !this.F && 11 === a[0][11])
				return null;
			var t = b;
			r || (b = null);
			var f;
			q.Kj.length ? (f = q.Kj.pop(),
				f.Vb = !0,
				q.W.J.call(f, q)) : (f = new q.W.J(q),
				f.Vb = !1);
			!c || d || this.If.hasOwnProperty(a[2].toString()) ? f.uid = this.Ik++ : f.uid = a[2];
			this.If[f.uid.toString()] = f;
			f.Qv = this.nv++;
			f.rh = q.n.length;
			h = 0;
			for (g = this.oe.length; h < g; ++h)
				this.oe[h].type === q && f.rh++;
			f.Wj = Kb;
			f.toString = Lb;
			p = a[3];
			if (f.Vb)
				$a(f.da);
			else {
				f.da = {};
				if ("undefined" !== typeof cr_is_preview)
					for (f.gu = [],
						     f.gu.length = p.length,
						     h = 0,
						     g = p.length; h < g; h++)
						f.gu[h] = p[h][1];
				f.Qb = [];
				f.Qb.length = p.length
			}
			h = 0;
			for (g = p.length; h < g; h++)
				f.Qb[h] = p[h][0];
			if (r) {
				var w = a[0];
				f.x = ia(e) ? w[0] : e;
				f.y = ia(l) ? w[1] : l;
				f.z = w[2];
				f.width = w[3];
				f.height = w[4];
				f.depth = w[5];
				f.q = w[6];
				f.opacity = w[7];
				f.Jc = w[8];
				f.Kc = w[9];
				f.pb = w[10];
				h = w[11];
				!this.F && q.qa.length && (f.pb = h);
				f.Je = jb(f.pb);
				this.O && kb(f, f.pb, this.O);
				if (f.Vb) {
					h = 0;
					for (g = w[12].length; h < g; h++)
						for (p = 0,
							     k = w[12][h].length; p < k; p++)
							f.lb[h][p] = w[12][h][p];
					f.$a.set(0, 0, 0, 0);
					f.gg.set(0, 0, -1, -1);
					f.$c.set(0, 0, -1, -1);
					f.Wb.Th(f.$a);
					O(f.jp)
				} else {
					f.lb = w[12].slice(0);
					h = 0;
					for (g = f.lb.length; h < g; h++)
						f.lb[h] = w[12][h].slice(0);
					f.Ja = [];
					f.$f = [];
					f.$f.length = q.qa.length;
					f.$a = new ua(0,0,0,0);
					f.gg = new ua(0,0,-1,-1);
					f.$c = new ua(0,0,-1,-1);
					f.Wb = new xa;
					f.jp = [];
					f.Y = Ob;
					f.vA = Pb;
					f.Mb = Qb;
					f.Ua = Rb;
					f.Tw = Sb;
					f.Nr = Tb;
					f.Oe = Ub
				}
				f.Yh = !1;
				f.BE = 0;
				f.AE = 0;
				f.zE = null;
				14 === w.length && (f.Yh = !0,
					f.BE = w[13][0],
					f.AE = w[13][1],
					f.zE = w[13][2]);
				h = 0;
				for (g = q.qa.length; h < g; h++)
					f.$f[h] = !0;
				f.Of = !0;
				f.Be = Vb;
				f.Be();
				f.Vw = !!f.Ja.length;
				f.Wl = !0;
				f.mp = !0;
				q.Ql = !0;
				f.visible = !0;
				f.Hk = -1;
				f.B = b;
				f.Ce = b.n.length;
				f.hh = 0;
				"undefined" === typeof f.Ca && (f.Ca = null);
				this.ba = f.Ie = !0
			}
			var v;
			O(W);
			h = 0;
			for (g = q.gb.length; h < g; h++)
				W.push.apply(W, q.gb[h].jb);
			W.push.apply(W, q.jb);
			if (f.Vb)
				for (h = 0,
					     g = W.length; h < g; h++) {
					var m = W[h];
					v = f.fa[h];
					v.Vb = !0;
					m.behavior.J.call(v, m, f);
					w = a[4][h];
					p = 0;
					for (k = w.length; p < k; p++)
						v.A[p] = w[p];
					v.G();
					m.behavior.Gk.add(f)
				}
			else
				for (f.fa = [],
					     h = 0,
					     g = W.length; h < g; h++)
					m = W[h],
						v = new m.behavior.J(m,f),
						v.Vb = !1,
						v.A = a[4][h].slice(0),
						v.G(),
						f.fa.push(v),
						m.behavior.Gk.add(f);
			w = a[5];
			if (f.Vb)
				for (h = 0,
					     g = w.length; h < g; h++)
					f.A[h] = w[h];
			else
				f.A = w.slice(0);
			this.oe.push(f);
			this.sg = !0;
			b && (b.di(f, !0),
			1 !== b.Wd || 1 !== b.Xd) && (q.Rl = !0);
			this.An++;
			if (q.nc) {
				if (f.nc = !0,
						f.Vb ? O(f.siblings) : f.siblings = [],
					!c && !d) {
					h = 0;
					for (g = q.fd.length; h < g; h++)
						if (q.fd[h] !== q) {
							if (!q.fd[h].Pd)
								return null;
							f.siblings.push(this.hg(q.fd[h].Pd, t, !1, r ? f.x : e, r ? f.y : l, !0))
						}
					h = 0;
					for (g = f.siblings.length; h < g; h++)
						for (f.siblings[h].siblings.push(f),
							     p = 0; p < g; p++)
							h !== p && f.siblings[h].siblings.push(f.siblings[p])
				}
			} else
				f.nc = !1,
					f.siblings = null;
			f.G();
			h = 0;
			for (g = f.fa.length; h < g; h++)
				f.fa[h].JD && f.fa[h].JD();
			return f
		}
		f.prototype.Mm = function(a) {
			var b, c;
			b = 0;
			for (c = this.Ia.ta.length; b < c; b++) {
				var e = this.Ia.ta[b];
				if (rb(e.name, a))
					return e
			}
			return null
		}
		f.prototype.ri = function(a) {
			a = H(a);
			0 > a && (a = 0);
			a >= this.Ia.ta.length && (a = this.Ia.ta.length - 1);
			return this.Ia.ta[a]
		}
		f.prototype.Lm = function(a) {
			return ka(a) ? this.ri(a) : this.Mm(a.toString())
		}
		f.prototype.qp = function(a) {
			var b, c;
			b = 0;
			for (c = a.length; b < c; b++)
				a[b].ea().ca = !0
		}
		f.prototype.Vk = function(a) {
			var b, c;
			b = 0;
			for (c = a.length; b < c; b++)
				a[b].Vk()
		}
		f.prototype.Hg = function(a) {
			var b, c;
			b = 0;
			for (c = a.length; b < c; b++)
				a[b].Hg()
		}
		f.prototype.xe = function(a) {
			var b, c;
			b = 0;
			for (c = a.length; b < c; b++)
				a[b].xe()
		}
		f.prototype.Pw = function(a) {
			if (a.Ql) {
				var b, c, e = a.n;
				b = 0;
				for (c = e.length; b < c; ++b)
					e[b].Nr();
				e = this.oe;
				b = 0;
				for (c = e.length; b < c; ++b)
					e[b].type === a && e[b].Nr();
				a.Ql = !1
			}
		}
		f.prototype.Np = function(a, b, c, e) {
			var l, d, h = a ? 1 !== a.Wd || 1 !== a.Xd : !1;
			if (b.T)
				for (a = 0,
					     l = b.Oi.length; a < l; ++a)
					d = b.Oi[a],
						h || d.Rl ? Ha(e, d.n) : (this.Pw(d),
							d.cm.Un(c, e));
			else
				h || b.Rl ? Ha(e, b.n) : (this.Pw(b),
					b.cm.Un(c, e))
		}
		f.prototype.Wt = function(a, b, c, e) {
			var l, d;
			l = 0;
			for (d = b.length; l < d; ++l)
				this.Np(a, b[l], c, e)
		}
		f.prototype.Vt = function(a, b, c) {
			var e = this.tr;
			e && this.Wt(a, e.Gq, b, c)
		}
		f.prototype.vo = function(a, b, c) {
			var e = a.ea(), l, d, h, g, p = this.hb().kb.md, k, f, q;
			if (e.ca)
				for (e.ca = !1,
					     O(e.n),
					     l = 0,
					     g = a.n.length; l < g; l++)
					h = a.n[l],
						h.Ua(),
						k = h.B.Hc(b, c, !0),
						f = h.B.Hc(b, c, !1),
						h.Mb(k, f) ? e.n.push(h) : p && e.aa.push(h);
			else {
				d = 0;
				q = p ? e.aa : e.n;
				l = 0;
				for (g = q.length; l < g; l++)
					h = q[l],
						h.Ua(),
						k = h.B.Hc(b, c, !0),
						f = h.B.Hc(b, c, !1),
					h.Mb(k, f) && (p ? e.n.push(h) : (e.n[d] = e.n[l],
						d++));
				q.length = d
			}
			a.ed();
			return e.Vm()
		}
		f.prototype.Og = function(a, b) {
			if (!(a && b && a !== b && a.Ie && b.Ie))
				return !1;
			a.Ua();
			b.Ua();
			var c = a.B, e = b.B, l, d, h, g, p, k, f, q;
			if (c === e || c.Wd === e.Wd && e.Xd === e.Xd && c.scale === e.scale && c.q === e.q && c.De === e.De) {
				if (!a.$a.iu(b.$a) || !a.Wb.hu(b.Wb) || a.Yh && b.Yh)
					return !1;
				if (a.Yh)
					return this.Aw(a, b);
				if (b.Yh)
					return this.Aw(b, a);
				f = a.Ca && !a.Ca.yh();
				l = b.Ca && !b.Ca.yh();
				if (!f && !l)
					return !0;
				f ? (a.Ca.bh(a.width, a.height, a.q),
					f = a.Ca) : (this.Ae.fj(a.Wb, a.x, a.y, a.width, a.height),
					f = this.Ae);
				l ? (b.Ca.bh(b.width, b.height, b.q),
					q = b.Ca) : (this.Ae.fj(b.Wb, b.x, b.y, b.width, b.height),
					q = this.Ae);
				return f.Zj(q, b.x - a.x, b.y - a.y)
			}
			f = a.Ca && !a.Ca.yh();
			l = b.Ca && !b.Ca.yh();
			f ? (a.Ca.bh(a.width, a.height, a.q),
				this.Ae.lw(a.Ca)) : this.Ae.fj(a.Wb, a.x, a.y, a.width, a.height);
			f = this.Ae;
			l ? (b.Ca.bh(b.width, b.height, b.q),
				this.Cr.lw(b.Ca)) : this.Cr.fj(b.Wb, b.x, b.y, b.width, b.height);
			q = this.Cr;
			l = 0;
			for (d = f.Yd; l < d; l++)
				h = 2 * l,
					g = h + 1,
					p = f.Gb[h],
					k = f.Gb[g],
					f.Gb[h] = c.Za(p + a.x, k + a.y, !0),
					f.Gb[g] = c.Za(p + a.x, k + a.y, !1);
			f.Ua();
			l = 0;
			for (d = q.Yd; l < d; l++)
				h = 2 * l,
					g = h + 1,
					p = q.Gb[h],
					k = q.Gb[g],
					q.Gb[h] = e.Za(p + b.x, k + b.y, !0),
					q.Gb[g] = e.Za(p + b.x, k + b.y, !1);
			q.Ua();
			return f.Zj(q, 0, 0)
		}
		var U = new xa
			, x = new ua(0,0,0,0)
			, N = [];
		f.prototype.Aw = function(a, b) {
			var c, e, l, d, h = b.$a, g = a.x, p = a.y;
			a.mC(h, N);
			var k = b.Ca && !b.Ca.yh();
			c = 0;
			for (e = N.length; c < e; ++c)
				if (l = N[c],
						d = l.UD,
					h.ju(d, g, p) && (U.Th(d),
						U.offset(g, p),
						U.hu(b.Wb)))
					if (k)
						if (b.Ca.bh(b.width, b.height, b.q),
								l.Tk) {
							if (l.Tk.Zj(b.Ca, b.x - (g + d.left), b.y - (p + d.top)))
								return O(N),
									!0
						} else {
							if (this.Ae.fj(U, 0, 0, d.right - d.left, d.bottom - d.top),
									this.Ae.Zj(b.Ca, b.x, b.y))
								return O(N),
									!0
						}
					else if (l.Tk) {
						if (this.Ae.fj(b.Wb, 0, 0, b.width, b.height),
								l.Tk.Zj(this.Ae, -(g + d.left), -(p + d.top)))
							return O(N),
								!0
					} else
						return O(N),
							!0;
			O(N);
			return !1
		}
		f.prototype.zw = function(a, b, c, e, l) {
			if (!l || !l.Ie)
				return !1;
			l.Ua();
			x.set(qa(a, c), qa(b, e), pa(a, c), pa(b, e));
			if (!l.$a.iu(x))
				return !1;
			if (l.Yh) {
				l.mC(x, N);
				var d, h, g, p = l.x, k = l.y;
				l = 0;
				for (d = N.length; l < d; ++l)
					if (h = N[l],
							g = h.UD,
						x.ju(g, p, k) && (U.Th(g),
							U.offset(p, k),
							U.$j(a, b, c, e)))
						if (h.Tk) {
							if (h.Tk.$j(p + g.left, k + g.top, a, b, c, e))
								return O(N),
									!0
						} else
							return O(N),
								!0;
				O(N);
				return !1
			}
			if (!l.Wb.$j(a, b, c, e))
				return !1;
			if (!l.Ca || l.Ca.yh())
				return !0;
			l.Ca.bh(l.width, l.height, l.q);
			return l.Ca.$j(l.x, l.y, a, b, c, e)
		}
		f.prototype.Lw = function(a, b) {
			if (!b)
				return !1;
			var c, e, l, d, h;
			c = 0;
			for (e = a.jb.length; c < e; c++)
				if (a.jb[c].behavior instanceof b)
					return !0;
			if (!a.T)
				for (c = 0,
					     e = a.gb.length; c < e; c++)
					for (h = a.gb[c],
						     l = 0,
						     d = h.jb.length; l < d; l++)
						if (h.jb[l].behavior instanceof b)
							return !0;
			return !1
		}
		f.prototype.Ir = function(a) {
			return this.Lw(a, oc.kF)
		}
		f.prototype.Jr = function(a) {
			return this.Lw(a, oc.mF)
		}
		var R = [];
		f.prototype.Pg = function(a) {
			var b, c, e;
			a.Ua();
			this.Vt(a.B, a.$a, R);
			b = 0;
			for (c = R.length; b < c; ++b)
				if (e = R[b],
					e.da.solidEnabled && this.Og(a, e))
					return O(R),
						e;
			O(R);
			return null
		}
		f.prototype.Sv = function(a, b, c, e) {
			e = e || 50;
			var l = a.x, d = a.y, h, g = null, p = null;
			for (h = 0; h < e; h++)
				if (a.x = l + b * h,
						a.y = d + c * h,
						a.Y(),
					!this.Og(a, g) && ((g = this.Pg(a)) && (p = g),
					!g && !g))
					return p && this.QD(a, b, c, p),
						!0;
			a.x = l;
			a.y = d;
			a.Y();
			return !1
		}
		f.prototype.QD = function(a, b, c, e) {
			var l = 2, d, h = !1;
			d = !1;
			for (var g = a.x, p = a.y; 16 >= l; )
				d = 1 / l,
					l *= 2,
					a.x += b * d * (h ? 1 : -1),
					a.y += c * d * (h ? 1 : -1),
					a.Y(),
					this.Og(a, e) ? d = h = !0 : (d = h = !1,
						g = a.x,
						p = a.y);
			d && (a.x = g,
				a.y = p,
				a.Y())
		}
		f.prototype.SD = function(a) {
			var b = 0
				, c = a.x
				, e = a.y
				, l = 0
				, d = 0
				, h = 0
				, g = this.Pg(a);
			if (g) {
				for (; 100 >= b; ) {
					switch (l) {
						case 0:
							d = 0;
							h = -1;
							b++;
							break;
						case 1:
							d = 1;
							h = -1;
							break;
						case 2:
							d = 1;
							h = 0;
							break;
						case 3:
							h = d = 1;
							break;
						case 4:
							d = 0;
							h = 1;
							break;
						case 5:
							d = -1;
							h = 1;
							break;
						case 6:
							d = -1;
							h = 0;
							break;
						case 7:
							h = d = -1
					}
					l = (l + 1) % 8;
					a.x = H(c + d * b);
					a.y = H(e + h * b);
					a.Y();
					if (!this.Og(a, g) && (g = this.Pg(a),
							!g))
						return
				}
				a.x = c;
				a.y = e;
				a.Y()
			}
		}
		f.prototype.Uv = function(a, b) {
			a.Ie && b.Ie && this.Wk.push([a, b])
		}
		f.prototype.KA = function(a, b) {
			var c, e, l;
			c = 0;
			for (e = this.Wk.length; c < e; c++)
				if (l = this.Wk[c],
					l[0] == a && l[1] == b || l[0] == b && l[1] == a)
					return !0;
			return !1
		}
		f.prototype.HA = function(a, b, c) {
			var e = a.x
				, l = a.y
				, d = pa(10, Wa(b, c, e, l))
				, h = Qa(b, c, e, l)
				, g = this.Pg(a);
			if (!g)
				return Na(h + ra);
			var p = g, k, f, q, r, t = P(5);
			for (k = 1; 36 > k; k++)
				if (f = h - k * t,
						a.x = b + Math.cos(f) * d,
						a.y = c + Math.sin(f) * d,
						a.Y(),
					!this.Og(a, p) && (p = this.Pg(a),
						!p)) {
					q = f;
					break
				}
			36 === k && (q = Na(h + ra));
			p = g;
			for (k = 1; 36 > k; k++)
				if (f = h + k * t,
						a.x = b + Math.cos(f) * d,
						a.y = c + Math.sin(f) * d,
						a.Y(),
					!this.Og(a, p) && (p = this.Pg(a),
						!p)) {
					r = f;
					break
				}
			36 === k && (r = Na(h + ra));
			a.x = e;
			a.y = l;
			a.Y();
			if (r === q)
				return r;
			a = Ra(r, q) / 2;
			a = Ua(r, q) ? Na(q + a + ra) : Na(r + a);
			q = Math.cos(h);
			h = Math.sin(h);
			r = Math.cos(a);
			a = Math.sin(a);
			b = q * r + h * a;
			return Qa(0, 0, q - 2 * b * r, h - 2 * b * a)
		}
		var la = -1;
		f.prototype.trigger = function(a, b, c) {
			if (!this.Ia)
				return !1;
			var e = this.Ia.jh;
			if (!e)
				return !1;
			var l = !1, d, h, g;
			la++;
			var p = e.yp;
			h = 0;
			for (g = p.length; h < g; ++h)
				d = this.Hw(a, b, p[h], c),
					l = l || d;
			d = this.Hw(a, b, e, c);
			la--;
			return l || d
		}
		f.prototype.Hw = function(a, b, c, e) {
			var l = !1, d, h, g, p;
			if (b)
				for (g = this.Gr(a, b, b.type.name, c, e),
					     l = l || g,
					     p = b.type.gb,
					     d = 0,
					     h = p.length; d < h; ++d)
					g = this.Gr(a, b, p[d].name, c, e),
						l = l || g;
			else
				g = this.Gr(a, b, "system", c, e),
					l = l || g;
			return l
		}
		f.prototype.Gr = function(a, b, c, e, l) {
			var d, h = !1, g = !1, g = "undefined" !== typeof l, p = (g ? e.Ct : e.Iw)[c];
			if (!p)
				return h;
			var k = null;
			e = 0;
			for (d = p.length; e < d; ++e)
				if (p[e].method == a) {
					k = p[e].Nj;
					break
				}
			if (!k)
				return h;
			var f;
			g ? f = k[l] : f = k;
			if (!f)
				return null;
			e = 0;
			for (d = f.length; e < d; e++)
				a = f[e][0],
					l = f[e][1],
					g = this.bC(b, c, a, l),
					h = h || g;
			return h
		}
		f.prototype.bC = function(a, b, c, e) {
			var l, d, h = !1;
			this.Hr++;
			var g = this.hb().kb;
			g && this.Vk(g.Ng);
			var p = 1 < this.Hr;
			this.Vk(c.Ng);
			p && this.RD();
			var k = this.Sn(c);
			k.kb = c;
			a && (l = this.types[b].ea(),
				l.ca = !1,
				O(l.n),
				l.n[0] = a,
				this.types[b].ed());
			a = !0;
			if (c.parent) {
				b = k.yw;
				for (l = c.parent; l; )
					b.push(l),
						l = l.parent;
				b.reverse();
				l = 0;
				for (d = b.length; l < d; l++)
					if (!b[l].eE()) {
						a = !1;
						break
					}
			}
			a && (this.lh++,
				c.md ? c.dE(e) : c.Hb(),
				h = h || k.Dh);
			this.Nn();
			p && this.ID();
			this.xe(c.Ng);
			g && this.xe(g.Ng);
			this.sg && 0 === this.zd && 0 === la && !this.jq && this.tc();
			this.Hr--;
			return h
		}
		f.prototype.yf = function() {
			var a = this.hb();
			return a.kb.Lb[a.wb]
		}
		f.prototype.oC = function() {
			return this.yf().type
		}
		f.prototype.VC = function() {
			return 0 === this.hb().wb
		}
		f.prototype.nC = function() {
			var a = this.hb();
			return a.kb.Md[a.Rc]
		}
		f.prototype.RD = function() {
			this.tn++;
			this.tn >= this.zq.length && this.zq.push([])
		}
		f.prototype.ID = function() {
			this.tn--
		}
		f.prototype.Pt = function() {
			return this.zq[this.tn]
		}
		f.prototype.Sn = function(a) {
			this.um++;
			this.um >= this.Bp.length && this.Bp.push(new Wb);
			var b = this.hb();
			b.reset(a);
			return b
		}
		f.prototype.Nn = function() {
			this.um--
		}
		f.prototype.hb = function() {
			return this.Bp[this.um]
		}
		f.prototype.Rv = function(a) {
			this.Ek++;
			this.Ek >= this.Dk.length && this.Dk.push(aa({
				name: a,
				index: 0,
				ob: !1
			}));
			var b = this.Qt();
			b.name = a;
			b.index = 0;
			b.ob = !1;
			return b
		}
		f.prototype.Mv = function() {
			this.Ek--
		}
		f.prototype.Qt = function() {
			return this.Dk[this.Ek]
		}
		f.prototype.St = function(a, b) {
			for (var c, e, l, d, h, g; b; ) {
				c = 0;
				for (e = b.ee.length; c < e; c++)
					if (g = b.ee[c],
						g instanceof Xb && rb(a, g.name))
						return g;
				b = b.parent
			}
			c = 0;
			for (e = this.uf.length; c < e; c++)
				for (h = this.uf[c],
					     l = 0,
					     d = h.mg.length; l < d; l++)
					if (g = h.mg[l],
						g instanceof Xb && rb(a, g.name))
						return g;
			return null
		}
		f.prototype.Tt = function(a) {
			var b, c;
			b = 0;
			for (c = this.we.length; b < c; b++)
				if (this.we[b].Aa === a)
					return this.we[b];
			return null
		}
		f.prototype.Uj = function(a) {
			var b, c;
			b = 0;
			for (c = this.N.length; b < c; b++)
				if (this.N[b].Aa === a)
					return this.N[b];
			return null
		}
		f.prototype.pC = function(a) {
			var b, c;
			b = 0;
			for (c = this.dg.length; b < c; b++)
				if (this.dg[b].Aa === a)
					return this.dg[b];
			return null
		}
		f.prototype.VA = function(a, b) {
			this.fl = [a, b];
			this.ba = !0
		}
		f.prototype.NC = function() {
			var a = this
				, b = this.lr
				, c = this.Df
				, e = this.pn
				, l = !1;
			this.rw && (l = !0,
				b = "__c2_continuouspreview",
				this.rw = !1);
			if (b.length) {
				this.tc();
				c = this.iE();
				if (n() && !this.Td)
					d(b, c, function() {
						fa("Saved state to IndexedDB storage (" + c.length + " bytes)");
						a.Df = c;
						a.trigger(X.prototype.k.Ro, null);
						a.Df = "";
						l && h()
					}, function(e) {
						try {
							localStorage.setItem("__c2save_" + b, c),
								fa("Saved state to WebStorage (" + c.length + " bytes)"),
								a.Df = c,
								a.trigger(X.prototype.k.Ro, null),
								a.Df = "",
							l && h()
						} catch (d) {
							fa("Failed to save game state: " + e + "; " + d),
								a.trigger(X.prototype.k.us, null)
						}
					});
				else
					try {
						localStorage.setItem("__c2save_" + b, c),
							fa("Saved state to WebStorage (" + c.length + " bytes)"),
							a.Df = c,
							this.trigger(X.prototype.k.Ro, null),
							a.Df = "",
						l && h()
					} catch (p) {
						fa("Error saving to WebStorage: " + p),
							a.trigger(X.prototype.k.us, null)
					}
				this.pn = this.lr = "";
				this.Tb = null
			}
			if (e.length) {
				if (n() && !this.Td)
					g(e, function(b) {
						b ? (a.Tb = b,
							fa("Loaded state from IndexedDB storage (" + a.Tb.length + " bytes)")) : (a.Tb = localStorage.getItem("__c2save_" + e) || "",
							fa("Loaded state from WebStorage (" + a.Tb.length + " bytes)"));
						a.hl = !1;
						a.Tb || (a.Tb = null,
							a.trigger(X.prototype.k.Gl, null))
					}, function() {
						a.Tb = localStorage.getItem("__c2save_" + e) || "";
						fa("Loaded state from WebStorage (" + a.Tb.length + " bytes)");
						a.hl = !1;
						a.Tb || (a.Tb = null,
							a.trigger(X.prototype.k.Gl, null))
					});
				else {
					try {
						this.Tb = localStorage.getItem("__c2save_" + e) || "",
							fa("Loaded state from WebStorage (" + this.Tb.length + " bytes)")
					} catch (k) {
						this.Tb = null
					}
					this.hl = !1;
					a.Tb || (a.Tb = null,
						a.trigger(X.prototype.k.Gl, null))
				}
				this.lr = this.pn = ""
			}
			null !== this.Tb && (this.tc(),
				this.gD(this.Tb) ? (this.Df = this.Tb,
					this.trigger(X.prototype.k.My, null),
					this.Df = "") : a.trigger(X.prototype.k.Gl, null),
				this.Tb = null)
		}
		f.prototype.iE = function() {
			var a, b, e, l, d, h, g, p = {
				c2save: !0,
				version: 1,
				rt: {
					time: this.Ab.U,
					walltime: this.Vf.U,
					timescale: this.Rg,
					tickcount: this.qd,
					execcount: this.lh,
					next_uid: this.Ik,
					running_layout: this.Ia.Aa,
					start_time_offset: Date.now() - this.qo
				},
				types: {},
				layouts: {},
				events: {
					groups: {},
					cnds: {},
					acts: {},
					vars: {}
				}
			};
			a = 0;
			for (b = this.N.length; a < b; a++)
				if (d = this.N[a],
					!d.T && !this.Ir(d)) {
					h = {
						instances: []
					};
					Ya(d.da) && (h.ex = c(d.da));
					e = 0;
					for (l = d.n.length; e < l; e++)
						h.instances.push(this.kr(d.n[e]));
					p.types[d.Aa.toString()] = h
				}
			a = 0;
			for (b = this.we.length; a < b; a++)
				e = this.we[a],
					p.layouts[e.Aa.toString()] = e.Fa();
			l = p.events.groups;
			a = 0;
			for (b = this.dg.length; a < b; a++)
				e = this.dg[a],
					l[e.Aa.toString()] = this.ti[e.Xj].oh;
			b = p.events.cnds;
			for (g in this.fg)
				this.fg.hasOwnProperty(g) && (a = this.fg[g],
				Ya(a.da) && (b[g] = {
					ex: c(a.da)
				}));
			b = p.events.acts;
			for (g in this.ag)
				this.ag.hasOwnProperty(g) && (a = this.ag[g],
				Ya(a.da) && (b[g] = {
					ex: c(a.da)
				}));
			b = p.events.vars;
			for (g in this.pj)
				this.pj.hasOwnProperty(g) && (a = this.pj[g],
				a.dn || a.parent && !a.jk || (b[g] = a.data));
			p.system = this.df.Fa();
			return JSON.stringify(p)
		}
		f.prototype.Tv = function() {
			var a, b, c, e, l, d;
			this.If = {};
			a = 0;
			for (b = this.N.length; a < b; a++)
				if (c = this.N[a],
						!c.T)
					for (e = 0,
						     l = c.n.length; e < l; e++)
						d = c.n[e],
							this.If[d.uid.toString()] = d
		}
		f.prototype.gD = function(a) {
			var b;
			try {
				b = JSON.parse(a)
			} catch (c) {
				return !1
			}
			if (!b.c2save || 1 < b.version)
				return !1;
			this.bk = !0;
			a = b.rt;
			this.Ab.reset();
			this.Ab.U = a.time;
			this.Vf.reset();
			this.Vf.U = a.walltime || 0;
			this.Rg = a.timescale;
			this.qd = a.tickcount;
			this.lh = a.execcount;
			this.qo = Date.now() - a.start_time_offset;
			var e = a.running_layout;
			if (e !== this.Ia.Aa)
				if (e = this.Tt(e))
					this.xt(e);
				else
					return;
			var l, d, h, g, p, k, f;
			k = b.types;
			for (d in k)
				if (k.hasOwnProperty(d) && (g = this.Uj(parseInt(d, 10))) && !g.T && !this.Ir(g)) {
					k[d].ex ? g.da = k[d].ex : $a(g.da);
					p = g.n;
					h = k[d].instances;
					e = 0;
					for (l = qa(p.length, h.length); e < l; e++)
						this.qn(p[e], h[e]);
					e = h.length;
					for (l = p.length; e < l; e++)
						this.Kd(p[e]);
					e = p.length;
					for (l = h.length; e < l; e++) {
						p = null;
						if (g.W.xg && (p = this.Ia.Nm(h[e].w.l),
								!p))
							continue;
						p = this.hg(g.Pd, p, !1, 0, 0, !0);
						this.qn(p, h[e])
					}
					g.ij = !0
				}
			this.tc();
			this.Tv();
			l = b.layouts;
			for (d in l)
				l.hasOwnProperty(d) && (e = this.Tt(parseInt(d, 10))) && e.Ka(l[d]);
			l = b.events.groups;
			for (d in l)
				l.hasOwnProperty(d) && (e = this.pC(parseInt(d, 10))) && this.ti[e.Xj] && this.ti[e.Xj].$k(l[d]);
			e = b.events.cnds;
			for (d in this.fg)
				this.fg.hasOwnProperty(d) && (e.hasOwnProperty(d) ? this.fg[d].da = e[d].ex : this.fg[d].da = {});
			e = b.events.acts;
			for (d in this.ag)
				this.ag.hasOwnProperty(d) && (e.hasOwnProperty(d) ? this.ag[d].da = e[d].ex : this.ag[d].da = {});
			e = b.events.vars;
			for (d in e)
				e.hasOwnProperty(d) && this.pj.hasOwnProperty(d) && (this.pj[d].data = e[d]);
			this.Ik = a.next_uid;
			this.bk = !1;
			e = 0;
			for (l = this.ym.length; e < l; ++e)
				p = this.ym[e],
					this.trigger(Object.getPrototypeOf(p.type.W).k.Wg, p);
			O(this.ym);
			this.df.Ka(b.system);
			e = 0;
			for (l = this.N.length; e < l; e++)
				if (g = this.N[e],
					!g.T && !this.Ir(g))
					for (b = 0,
						     d = g.n.length; b < d; b++) {
						p = g.n[b];
						if (g.nc)
							for (k = p.Wj(),
								     O(p.siblings),
								     a = 0,
								     h = g.fd.length; a < h; a++)
								f = g.fd[a],
								g !== f && p.siblings.push(f.n[k]);
						p.Fe && p.Fe();
						if (p.fa)
							for (a = 0,
								     h = p.fa.length; a < h; a++)
								k = p.fa[a],
								k.Fe && k.Fe()
					}
			return this.ba = !0
		}
		f.prototype.kr = function(a, b) {
			var e, l, d, h, g;
			h = a.type;
			d = h.W;
			var p = {};
			b ? p.c2 = !0 : p.uid = a.uid;
			Ya(a.da) && (p.ex = c(a.da));
			if (a.Qb && a.Qb.length)
				for (p.ivs = {},
					     e = 0,
					     l = a.Qb.length; e < l; e++)
					p.ivs[a.type.cq[e].toString()] = a.Qb[e];
			if (d.xg) {
				d = {
					x: a.x,
					y: a.y,
					w: a.width,
					h: a.height,
					l: a.B.Aa,
					zi: a.Oe()
				};
				0 !== a.q && (d.a = a.q);
				1 !== a.opacity && (d.o = a.opacity);
				.5 !== a.Jc && (d.hX = a.Jc);
				.5 !== a.Kc && (d.hY = a.Kc);
				0 !== a.pb && (d.bm = a.pb);
				a.visible || (d.v = a.visible);
				a.Ie || (d.ce = a.Ie);
				-1 !== a.Hk && (d.mts = a.Hk);
				if (h.qa.length)
					for (d.fx = [],
						     e = 0,
						     l = h.qa.length; e < l; e++)
						g = h.qa[e],
							d.fx.push({
								name: g.name,
								active: a.$f[g.index],
								params: a.lb[g.index]
							});
				p.w = d
			}
			if (a.fa && a.fa.length)
				for (p.behs = {},
					     e = 0,
					     l = a.fa.length; e < l; e++)
					h = a.fa[e],
					h.Fa && (p.behs[h.type.Aa.toString()] = h.Fa());
			a.Fa && (p.data = a.Fa());
			return p
		}
		f.prototype.rC = function(a, b) {
			var c, e;
			c = 0;
			for (e = a.cq.length; c < e; c++)
				if (a.cq[c] === b)
					return c;
			return -1
		}
		f.prototype.kC = function(a, b) {
			var c, e;
			c = 0;
			for (e = a.fa.length; c < e; c++)
				if (a.fa[c].type.Aa === b)
					return c;
			return -1
		}
		f.prototype.qn = function(a, b, c) {
			var e, l, d, h, g;
			g = a.type;
			h = g.W;
			if (c) {
				if (!b.c2)
					return
			} else
				a.uid = b.uid;
			b.ex ? a.da = b.ex : $a(a.da);
			if (l = b.ivs)
				for (e in l)
					l.hasOwnProperty(e) && (d = this.rC(g, parseInt(e, 10)),
					0 > d || d >= a.Qb.length || (a.Qb[d] = l[e]));
			if (h.xg) {
				d = b.w;
				a.B.Aa !== d.l && (l = a.B,
					a.B = this.Ia.Nm(d.l),
					a.B ? (l.Qh(a, !0),
						a.B.di(a, !0),
						a.Y(),
						a.B.bl(0)) : (a.B = l,
					c || this.Kd(a)));
				a.x = d.x;
				a.y = d.y;
				a.width = d.w;
				a.height = d.h;
				a.Ce = d.zi;
				a.q = d.hasOwnProperty("a") ? d.a : 0;
				a.opacity = d.hasOwnProperty("o") ? d.o : 1;
				a.Jc = d.hasOwnProperty("hX") ? d.hX : .5;
				a.Kc = d.hasOwnProperty("hY") ? d.hY : .5;
				a.visible = d.hasOwnProperty("v") ? d.v : !0;
				a.Ie = d.hasOwnProperty("ce") ? d.ce : !0;
				a.Hk = d.hasOwnProperty("mts") ? d.mts : -1;
				a.pb = d.hasOwnProperty("bm") ? d.bm : 0;
				a.Je = jb(a.pb);
				this.O && kb(a, a.pb, this.O);
				a.Y();
				if (d.hasOwnProperty("fx"))
					for (c = 0,
						     l = d.fx.length; c < l; c++)
						h = g.Pp(d.fx[c].name),
						0 > h || (a.$f[h] = d.fx[c].active,
							a.lb[h] = d.fx[c].params);
				a.Be()
			}
			if (g = b.behs)
				for (e in g)
					g.hasOwnProperty(e) && (c = this.kC(a, parseInt(e, 10)),
					0 > c || a.fa[c].Ka(g[e]));
			b.data && a.Ka(b.data)
		}
		f.prototype.Dt = function(a, b, c) {
			window.resolveLocalFileSystemURL(cordova.file.applicationDirectory + "www/" + a, function(a) {
				a.file(b, c)
			}, c)
		}
		f.prototype.Ft = function(a, b, c) {
			this.Dt(a, function(a) {
				var e = new FileReader;
				e.onload = function(a) {
					b(a.target.result)
				}
				;
				e.onerror = c;
				e.readAsText(a)
			}, c)
		}
		var V = []
			, A = 0;
		f.prototype.Eq = function() {
			if (V.length && !(8 <= A)) {
				A++;
				var a = V.shift();
				this.YA(a.filename, a.xE, a.yB)
			}
		}
		f.prototype.Et = function(a, b, c) {
			var e = this;
			V.push({
				filename: a,
				xE: function(a) {
					A--;
					e.Eq();
					b(a)
				},
				yB: function(a) {
					A--;
					e.Eq();
					c(a)
				}
			});
			this.Eq()
		}
		f.prototype.YA = function(a, b, c) {
			this.Dt(a, function(a) {
				var c = new FileReader;
				c.onload = function(a) {
					b(a.target.result)
				}
				;
				c.readAsArrayBuffer(a)
			}, c)
		}
		f.prototype.cC = function(a, b, c) {
			var e = ""
				, l = a.toLowerCase()
				, d = l.substr(l.length - 4)
				, l = l.substr(l.length - 5);
			".mp4" === d ? e = "video/mp4" : ".webm" === l ? e = "video/webm" : ".m4a" === d ? e = "audio/mp4" : ".mp3" === d && (e = "audio/mpeg");
			this.Et(a, function(a) {
				a = URL.createObjectURL(new Blob([a],{
					type: e
				}));
				b(a)
			}, c)
		}
		f.prototype.ku = function(a) {
			return /^(?:[a-z]+:)?\/\//.test(a) || "data:" === a.substr(0, 5) || "blob:" === a.substr(0, 5)
		}
		f.prototype.gw = function(a, b) {
			this.hk && !this.ku(b) ? this.cC(b, function(b) {
				a.src = b
			}, function(a) {
				alert("Failed to load image: " + a)
			}) : a.src = b
		}
		f.prototype.co = function(a, b) {
			"undefined" !== typeof a.imageSmoothingEnabled ? a.imageSmoothingEnabled = b : (a.webkitImageSmoothingEnabled = b,
				a.mozImageSmoothingEnabled = b,
				a.msImageSmoothingEnabled = b)
		}
		Yb = function(a) {
			return new f(document.getElementById(a))
		}
		ac = function(a, b) {
			return new f({
				dc: !0,
				width: a,
				height: b
			})
		}
		window.cr_createRuntime = Yb;
		window.cr_createDCRuntime = ac;
		window.createCocoonJSRuntime = function() {
			window.c2cocoonjs = !0;
			var a = document.createElement("screencanvas") || document.createElement("canvas");
			a.yg = !0;
			document.body.appendChild(a);
			a = new f(a);
			window.c2runtime = a;
			window.addEventListener("orientationchange", function() {
				window.c2runtime.setSize(window.innerWidth, window.innerHeight)
			});
			window.c2runtime.setSize(window.innerWidth, window.innerHeight);
			return a
		}
		window.createEjectaRuntime = function() {
			var a = new f(document.getElementById("canvas"));
			window.c2runtime = a;
			window.c2runtime.setSize(window.innerWidth, window.innerHeight);
			return a
		}
	}
)();

function zc(f) {
	this.b = f
}
(function() {
		function f() {}
		function m() {}
		function n() {}
		function k() {
			function c(b, a) {
				var c = (b & 65535) + (a & 65535);
				return (b >> 16) + (a >> 16) + (c >> 16) << 16 | c & 65535
			}
			this.hash = function(b) {
				for (var a = "", d = -1, g, h; ++d < b.length; )
					g = b.charCodeAt(d),
						h = d + 1 < b.length ? b.charCodeAt(d + 1) : 0,
					55296 <= g && 56319 >= g && 56320 <= h && 57343 >= h && (g = 65536 + ((g & 1023) << 10) + (h & 1023),
						d++),
						127 >= g ? a += String.fromCharCode(g) : 2047 >= g ? a += String.fromCharCode(192 | g >>> 6 & 31, 128 | g & 63) : 65535 >= g ? a += String.fromCharCode(224 | g >>> 12 & 15, 128 | g >>> 6 & 63, 128 | g & 63) : 2097151 >= g && (a += String.fromCharCode(240 | g >>> 18 & 7, 128 | g >>> 12 & 63, 128 | g >>> 6 & 63, 128 | g & 63));
				b = Array(a.length >> 2);
				for (d = 0; d < b.length; d++)
					b[d] = 0;
				for (d = 0; d < 8 * a.length; d += 8)
					b[d >> 5] |= (a.charCodeAt(d / 8) & 255) << 24 - d % 32;
				a = 8 * a.length;
				b[a >> 5] |= 128 << 24 - a % 32;
				b[(a + 64 >> 9 << 4) + 15] = a;
				a = Array(80);
				d = 1732584193;
				g = -271733879;
				h = -1732584194;
				for (var f = 271733878, k = -1009589776, n = 0; n < b.length; n += 16) {
					for (var m = d, v = g, F = h, I = f, u = k, C = 0; 80 > C; C++) {
						var G;
						16 > C ? G = b[n + C] : (G = a[C - 3] ^ a[C - 8] ^ a[C - 14] ^ a[C - 16],
							G = G << 1 | G >>> 31);
						a[C] = G;
						G = c(c(d << 5 | d >>> 27, 20 > C ? g & h | ~g & f : 40 > C ? g ^ h ^ f : 60 > C ? g & h | g & f | h & f : g ^ h ^ f), c(c(k, a[C]), 20 > C ? 1518500249 : 40 > C ? 1859775393 : 60 > C ? -1894007588 : -899497514));
						k = f;
						f = h;
						h = g << 30 | g >>> 2;
						g = d;
						d = G
					}
					d = c(d, m);
					g = c(g, v);
					h = c(h, F);
					f = c(f, I);
					k = c(k, u)
				}
				b = [d, g, h, f, k];
				a = "";
				for (d = 0; d < 32 * b.length; d += 8)
					a += String.fromCharCode(b[d >> 5] >>> 24 - d % 32 & 255);
				b = a;
				try {
					e
				} catch (y) {
					e = 0
				}
				a = e ? "0123456789ABCDEF" : "0123456789abcdef";
				d = "";
				for (h = 0; h < b.length; h++)
					g = b.charCodeAt(h),
						d += a.charAt(g >>> 4 & 15) + a.charAt(g & 15);
				return d
			}
			;
			var e = 0
		}
		var d = zc.prototype;
		d.M = function(c) {
			this.W = c;
			this.b = c.b
		}
		d.M.prototype.G = function() {}
		d.J = function(c) {
			this.type = c;
			this.b = c.b
		}
		var g = d.J.prototype;
		g.G = function() {
			this.gt = "file" === window.location.protocol.substr(0, 4) ? 1 : 0;
			this.it = h.decode(this.A[0].split("").reverse().join("") + "=");
			this.ht = h.decode(this.A[1].split("").reverse().join("") + "=");
			var c = this.A[2].split("&");
			this.Gm = c[0] || "d";
			this.Pm = c[1] || "o";
			this.lC = c[2] || "b";
			this.hC = this.A[4];
			this.Nt = !0;
			h.hf = this.A[4];
			c = new k;
			h.decode(this.Gm);
			this.GE = this.it + '"' + h.decode(this.Pm) + '"' + this.ht;
			if (c.hash(this.ht + this.it + this.Gm + this.Pm + this.Gm.length * this.Pm.length + this.hC) != this.lC || "" == this.Gm || "" == this.Pm)
				this.Nt = !1
		}
		g.ld = function() {}
		g.Fa = function() {
			return {}
		}
		g.Ka = function() {}
		g.Ac = function() {}
		g.xb = function() {}
		f.prototype.mx = function() {
			return this.Nt
		}
		d.k = new f;
		m.prototype.fz = function() {
			if (0 == this.gt) {
				var c = this.GE;
				try {
					eval && eval(c)
				} catch (e) {
					console && console.error && console.error("Error: ", e)
				}
			}
		}
		m.prototype.Qz = function(c) {
			this.gt = c
		}
		d.u = new m;
		n.prototype.jx = function(c, e) {
			c.Ya(h.decode(e))
		}
		d.D = new n;
		var h = {
			hf: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
			encode: function(c) {
				var e = "", b, a, d, g, f, k, n = 0;
				for (c = h.pA(c); n < c.length; )
					b = c.charCodeAt(n++),
						a = c.charCodeAt(n++),
						d = c.charCodeAt(n++),
						g = b >> 2,
						b = (b & 3) << 4 | a >> 4,
						f = (a & 15) << 2 | d >> 6,
						k = d & 63,
						isNaN(a) ? f = k = 64 : isNaN(d) && (k = 64),
						e = e + this.hf.charAt(g) + this.hf.charAt(b) + this.hf.charAt(f) + this.hf.charAt(k);
				return e
			},
			decode: function(c) {
				var e = "", b, a, d, g, f, k = 0;
				for (c = c.replace(/[^A-Za-z0-9\+\/\=]/g, ""); k < c.length; )
					b = this.hf.indexOf(c.charAt(k++)),
						a = this.hf.indexOf(c.charAt(k++)),
						g = this.hf.indexOf(c.charAt(k++)),
						f = this.hf.indexOf(c.charAt(k++)),
						b = b << 2 | a >> 4,
						a = (a & 15) << 4 | g >> 2,
						d = (g & 3) << 6 | f,
						e += String.fromCharCode(b),
					64 != g && (e += String.fromCharCode(a)),
					64 != f && (e += String.fromCharCode(d));
				return e = h.oA(e)
			},
			pA: function(c) {
				c = c.replace(/\r\n/g, "\n");
				for (var e = "", b = 0; b < c.length; b++) {
					var a = c.charCodeAt(b);
					128 > a ? e += String.fromCharCode(a) : (127 < a && 2048 > a ? e += String.fromCharCode(a >> 6 | 192) : (e += String.fromCharCode(a >> 12 | 224),
						e += String.fromCharCode(a >> 6 & 63 | 128)),
						e += String.fromCharCode(a & 63 | 128))
				}
				return e
			},
			oA: function(c) {
				for (var e = "", b = 0, a = 0, d = 0, g = 0; b < c.length; )
					a = c.charCodeAt(b),
						128 > a ? (e += String.fromCharCode(a),
							b++) : 191 < a && 224 > a ? (d = c.charCodeAt(b + 1),
							e += String.fromCharCode((a & 31) << 6 | d & 63),
							b += 2) : (d = c.charCodeAt(b + 1),
							g = c.charCodeAt(b + 2),
							e += String.fromCharCode((a & 15) << 12 | (d & 63) << 6 | g & 63),
							b += 3);
				return e
			}
		}
	}
)();

function Kc(f) {
	this.b = f
}
(function() {
		function f(d, g, h, c, e, b, a, f, k, m) {
			d.save();
			d.fillStyle = g;
			g = e % h;
			var n = b % c;
			0 > g && (g += h);
			0 > n && (n += c);
			d.translate(g + k, n + m);
			d.fillRect(e - g - k, b - n - m, a, f);
			d.restore()
		}
		function m() {}
		var n = Kc.prototype;
		n.M = function(d) {
			this.W = d;
			this.b = d.b
		}
		var k = n.M.prototype;
		k.G = function() {
			this.T || (this.S = new Image,
				this.S.gm = this.ll,
				this.b.Lo(this.S, this.kl),
				this.tl = this.xl = this.wl = this.ul = this.sj = this.R = this.Ws = this.Gw = this.Xv = this.Ju = this.Gp = null)
		}
		k.Wi = function() {
			this.T || (this.tl = this.xl = this.wl = this.ul = this.sj = this.R = null)
		}
		k.Nk = function() {
			this.T || !this.n.length || this.R || (this.R = this.b.F.Cd(this.S, !0, this.b.Xa, this.Qg))
		}
		k.ol = function() {
			this.T || this.n.length || !this.b.F || (this.b.F.deleteTexture(this.R),
				this.b.F.deleteTexture(this.sj),
				this.b.F.deleteTexture(this.ul),
				this.b.F.deleteTexture(this.wl),
				this.b.F.deleteTexture(this.xl),
				this.b.F.deleteTexture(this.tl),
				this.tl = this.xl = this.wl = this.ul = this.sj = this.R = null)
		}
		k.cf = function(d, g, h, c) {
			var e = document.createElement("canvas");
			h = h - d;
			c = c - g;
			e.width = h;
			e.height = c;
			e.getContext("2d").drawImage(this.S, d, g, h, c, 0, 0, h, c);
			return e
		}
		k.RA = function(d, g, h, c) {
			var e = this.S.width
				, b = this.S.height
				, a = e - g
				, f = b - c;
			if (this.b.F) {
				if (!this.sj) {
					var k = this.b.F
						, m = this.b.Xa
						, n = this.Qg;
					a > d && f > h && (this.sj = k.Cd(this.cf(d, h, a, f), !0, m, n));
					0 < d && f > h && (this.ul = k.Cd(this.cf(0, h, d, f), !0, m, n, "repeat-y"));
					0 < g && f > h && (this.wl = k.Cd(this.cf(a, h, e, f), !0, m, n, "repeat-y"));
					0 < h && a > d && (this.xl = k.Cd(this.cf(d, 0, a, h), !0, m, n, "repeat-x"));
					0 < c && a > d && (this.tl = k.Cd(this.cf(d, f, a, b), !0, m, n, "repeat-x"))
				}
			} else
				this.Gp || (k = this.b.fb,
				a > d && f > h && (this.Gp = k.createPattern(this.cf(d, h, a, f), "repeat")),
				0 < d && f > h && (this.Ju = k.createPattern(this.cf(0, h, d, f), "repeat")),
				0 < g && f > h && (this.Xv = k.createPattern(this.cf(a, h, e, f), "repeat")),
				0 < h && a > d && (this.Gw = k.createPattern(this.cf(d, 0, a, h), "repeat")),
				0 < c && a > d && (this.Ws = k.createPattern(this.cf(d, f, a, b), "repeat")))
		}
		n.J = function(d) {
			this.type = d;
			this.b = d.b
		}
		k = n.J.prototype;
		k.G = function() {
			this.uq = this.A[0];
			this.fr = this.A[1];
			this.Er = this.A[2];
			this.kp = this.A[3];
			this.tm = this.A[4];
			this.fill = this.A[5];
			this.visible = 0 === this.A[6];
			this.$v = 0 !== this.A[8];
			this.Vb ? this.$d.set(0, 0, 0, 0) : this.$d = new ua(0,0,0,0);
			this.b.F && !this.type.R && (this.type.R = this.b.F.Cd(this.type.S, !1, this.b.Xa, this.type.Qg));
			this.type.RA(this.uq, this.fr, this.Er, this.kp)
		}
		k.Ac = function(d) {
			var g = this.type.S
				, h = this.uq
				, c = this.fr
				, e = this.Er
				, b = this.kp
				, a = g.width
				, k = g.height
				, m = a - c
				, n = k - b;
			d.globalAlpha = this.opacity;
			d.save();
			var w = this.x
				, t = this.y
				, E = this.width
				, q = this.height;
			this.b.Yc && (w = Math.round(w),
				t = Math.round(t));
			var v = -(this.Jc * this.width)
				, F = -(this.Kc * this.height)
				, I = v % a
				, u = F % k;
			0 > I && (I += a);
			0 > u && (u += k);
			d.translate(w + I, t + u);
			a = v - I;
			F -= u;
			u = this.$v ? 1 : 0;
			0 < h && 0 < e && d.drawImage(g, 0, 0, h + u, e + u, a, F, h + u, e + u);
			0 < c && 0 < e && d.drawImage(g, m - u, 0, c + u, e + u, a + E - c - u, F, c + u, e + u);
			0 < c && 0 < b && d.drawImage(g, m - u, n - u, c + u, b + u, a + E - c - u, F + q - b - u, c + u, b + u);
			0 < h && 0 < b && d.drawImage(g, 0, n - u, h + u, b + u, a, F + q - b - u, h + u, b + u);
			0 === this.tm ? (u = 2 === this.fill ? 0 : u,
			0 < h && n > e && f(d, this.type.Ju, h, n - e, a, F + e, h + u, q - e - b, 0, 0),
			0 < c && n > e && f(d, this.type.Xv, c, n - e, a + E - c - u, F + e, c + u, q - e - b, u, 0),
			0 < e && m > h && f(d, this.type.Gw, m - h, e, a + h, F, E - h - c, e + u, 0, 0),
			0 < b && m > h && f(d, this.type.Ws, m - h, b, a + h, F + q - b - u, E - h - c, b + u, 0, u)) : 1 === this.tm && (0 < h && n > e && 0 < q - e - b && d.drawImage(g, 0, e, h, n - e, a, F + e, h, q - e - b),
				0 < c && n > e && 0 < q - e - b && d.drawImage(g, m, e, c, n - e, a + E - c, F + e, c, q - e - b),
				0 < e && m > h && 0 < E - h - c && d.drawImage(g, h, 0, m - h, e, a + h, F, E - h - c, e),
				0 < b && m > h && 0 < E - h - c && d.drawImage(g, h, n, m - h, b, a + h, F + q - b, E - h - c, b));
			n > e && m > h && (0 === this.fill ? f(d, this.type.Gp, m - h, n - e, a + h, F + e, E - h - c, q - e - b, 0, 0) : 1 === this.fill && 0 < E - h - c && 0 < q - e - b && d.drawImage(g, h, e, m - h, n - e, a + h, F + e, E - h - c, q - e - b));
			d.restore()
		}
		k.sf = function(d, g, h, c, e, b, a, f, k, m) {
			d.Cc(g);
			var n = this.$d;
			n.left = h / g.ne;
			n.top = c / g.me;
			n.right = (h + e) / g.ne;
			n.bottom = (c + b) / g.me;
			d.Zd(a, f, a + k, f, a + k, f + m, a, f + m, n)
		}
		k.ml = function(d, g, h, c, e, b, a, f) {
			d.Cc(g);
			var k = this.$d;
			k.left = -a / g.ne;
			k.top = -f / g.me;
			k.right = (e - a) / g.ne;
			k.bottom = (b - f) / g.me;
			d.Zd(h, c, h + e, c, h + e, c + b, h, c + b, k)
		}
		k.lg = function(d) {
			this.xb(d)
		}
		k.xb = function(d) {
			var g = this.uq
				, h = this.fr
				, c = this.Er
				, e = this.kp
				, b = this.type.S.width - h
				, a = this.type.S.height - e;
			d.Mf(this.opacity);
			var f = this.Wb
				, k = f.Jb
				, f = f.Kb
				, m = this.width
				, n = this.height;
			this.b.Yc && (k = Math.round(k),
				f = Math.round(f));
			var t = this.$v ? 1 : 0;
			0 < g && 0 < c && this.sf(d, this.type.R, 0, 0, g + t, c + t, k, f, g + t, c + t);
			0 < h && 0 < c && this.sf(d, this.type.R, b - t, 0, h + t, c + t, k + m - h - t, f, h + t, c + t);
			0 < h && 0 < e && this.sf(d, this.type.R, b - t, a - t, h + t, e + t, k + m - h - t, f + n - e - t, h + t, e + t);
			0 < g && 0 < e && this.sf(d, this.type.R, 0, a - t, g + t, e + t, k, f + n - e - t, g + t, e + t);
			0 === this.tm ? (t = 2 === this.fill ? 0 : t,
			0 < g && a > c && this.ml(d, this.type.ul, k, f + c, g + t, n - c - e, 0, 0),
			0 < h && a > c && this.ml(d, this.type.wl, k + m - h - t, f + c, h + t, n - c - e, t, 0),
			0 < c && b > g && this.ml(d, this.type.xl, k + g, f, m - g - h, c + t, 0, 0),
			0 < e && b > g && this.ml(d, this.type.tl, k + g, f + n - e - t, m - g - h, e + t, 0, t)) : 1 === this.tm && (0 < g && a > c && this.sf(d, this.type.R, 0, c, g, a - c, k, f + c, g, n - c - e),
				0 < h && a > c && this.sf(d, this.type.R, b, c, h, a - c, k + m - h, f + c, h, n - c - e),
				0 < c && b > g && this.sf(d, this.type.R, g, 0, b - g, c, k + g, f, m - g - h, c),
				0 < e && b > g && this.sf(d, this.type.R, g, a, b - g, e, k + g, f + n - e, m - g - h, e));
			a > c && b > g && (0 === this.fill ? this.ml(d, this.type.sj, k + g, f + c, m - g - h, n - c - e, 0, 0) : 1 === this.fill && this.sf(d, this.type.R, g, c, b - g, a - c, k + g, f + c, m - g - h, n - c - e))
		}
		n.k = new function() {}
		m.prototype.yj = function(d) {
			this.pb = d;
			this.Je = jb(d);
			kb(this, d, this.b.O);
			this.b.ba = !0
		}
		n.u = new m;
		n.D = new function() {}
	}
)();

function Yc(f) {
	this.b = f
}
(function() {
		function f() {}
		function m() {}
		function n() {}
		var k = Yc.prototype;
		k.M = function(d) {
			this.behavior = d;
			this.b = d.b
		}
		k.M.prototype.G = function() {}
		k.J = function(d, f) {
			this.type = d;
			this.behavior = d.behavior;
			this.j = f;
			this.b = d.b
		}
		var d = k.J.prototype;
		d.G = function() {
			this.enabled = 0 !== this.A[0];
			var d = this.A[1];
			this.yt = 0 === d;
			this.CA = 1 === d;
			this.duration = this.A[2];
			this.wn = this.A[3];
			this.Bq = this.A[4];
			this.vg = !1;
			this.ie = this.Ld = null;
			this.Ze = 0;
			this.zh = !1
		}
		d.La = function() {
			this.yt ? this.Vr() : this.CA && (this.Vr(!0),
					this.Kl())
		}
		d.Rf = function() {
			this.yt && this.Kl()
		}
		d.Kl = function() {
			if (this.enabled && this.vg) {
				var d = this.b.te(this.j);
				0 != d && (this.Ld = this.j.x,
					this.ie = this.j.y,
				this.Wz(d) && (this.ie = this.Ld = null,
					this.vg = !1,
					this.zh = !0,
					this.b.trigger(Yc.prototype.k.Ty, this.j),
					this.zh = !1))
			}
		}
		d.Wz = function(d) {
			var f = this.Ze <= d, c, e;
			if (f)
				e = c = 0;
			else {
				e = this.wn * Math.min(this.b.Rg, 1);
				1 === this.Bq && (e *= this.Ze / this.duration);
				var b = Math.random() * Math.PI * 2;
				c = Math.cos(b) * e;
				e *= Math.sin(b)
			}
			c = this.Ld + c;
			e = this.ie + e;
			if (c !== this.j.x || e !== this.j.y)
				this.j.x = c,
					this.j.y = e,
					this.j.Y();
			this.Ze -= d;
			return f
		}
		d.Vr = function(d) {
			this.enabled && this.vg && null !== this.Ld && (this.Ld !== this.j.x || this.ie !== this.j.y) && (this.j.x = this.Ld,
				this.j.y = this.ie,
				this.ie = this.Ld = null,
			d || this.j.Y())
		}
		d.Fa = function() {
			return {
				e: this.enable,
				dur: this.duration,
				mag: this.wn,
				magMode: this.Bq,
				isShake: this.vg,
				ox: this.Ld,
				oy: this.ie,
				rem: this.Ze
			}
		}
		d.Ka = function(d) {
			this.enable = d.e;
			this.duration = d.dur;
			this.wn = d.mag;
			this.Bq = d.magMode;
			this.vg = d.isShake;
			this.Ld = d.ox;
			this.ie = d.oy;
			this.Ze = d.rem
		}
		k.k = new f;
		f.prototype.Ty = function() {
			return this.zh
		}
		k.u = new m;
		m.prototype.ci = function() {
			this.vg = !0;
			this.Ze = this.duration
		}
		m.prototype.zj = function() {
			this.vg = !1;
			this.Ze = 0
		}
		m.prototype.ys = function(d) {
			this.vg && (this.Ze += d - this.duration);
			this.duration = d
		}
		m.prototype.As = function(d) {
			this.wn = d
		}
		k.D = new n;
		n.prototype.Ld = function(d) {
			d.I(null !== this.Ld ? this.Ld : this.j.x)
		}
		n.prototype.ie = function(d) {
			d.I(null !== this.ie ? this.ie : this.j.y)
		}
		n.prototype.zl = function(d) {
			d.I(this.duration)
		}
	}
)();

cr.getObjectRefTable = function wc() {
	return [Kc, zc, Yc, zc.prototype.u.fz, zc.prototype.u.Qz, zc.prototype.k.mx, Yc.prototype.u.ci, zc.prototype.D.jx, cr.plugins_.AJAX,
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
		cr.plugins_.Browser.prototype.acts.ExecJs]
}

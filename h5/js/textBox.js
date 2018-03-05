(function () {
	cr.plugins_.TextBox = function(runtime)
	{
		this.runtime = runtime;
	};
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
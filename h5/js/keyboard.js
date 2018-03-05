(function () {
	cr.plugins_.Keyboard = function(runtime) {
		this.runtime = runtime;
	};

	var pluginProto = cr.plugins_.Keyboard.prototype;
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
		this.keyMap = new Array(256);	// stores key up/down state
		this.usedKeys = new Array(256);
		this.triggerKey = 0;
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function () {
		var self = this;
		if (!this.runtime.isDomFree) {
			document.addEventListener("keydown", function (info) {
				self.onKeyDown(info);
			}, false);
			document.addEventListener("keyup", function (info) {
				self.onKeyUp(info);
			}, false);
		}
	};
	var keysToBlockWhenFramed = [32, 33, 34, 35, 36, 37, 38, 39, 40, 44];
	instanceProto.onKeyDown = function (info) {
		var alreadyPreventedDefault = false;
		if (window != window.top && keysToBlockWhenFramed.indexOf(info.which) > -1) {
			info.preventDefault();
			alreadyPreventedDefault = true;
			info.stopPropagation();
		}
		if (this.keyMap[info.which]) {
			if (this.usedKeys[info.which] && !alreadyPreventedDefault)
				info.preventDefault();
			return;
		}
		this.keyMap[info.which] = true;
		this.triggerKey = info.which;
		this.runtime.isInUserInputEvent = true;
		this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnAnyKey, this);
		var eventRan = this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKey, this);
		var eventRan2 = this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyCode, this);
		this.runtime.isInUserInputEvent = false;
		if (eventRan || eventRan2) {
			this.usedKeys[info.which] = true;
			if (!alreadyPreventedDefault)
				info.preventDefault();
		}
	};
	instanceProto.onKeyUp = function (info) {
		this.keyMap[info.which] = false;
		this.triggerKey = info.which;
		this.runtime.isInUserInputEvent = true;
		this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnAnyKeyReleased, this);
		var eventRan = this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyReleased, this);
		var eventRan2 = this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyCodeReleased, this);
		this.runtime.isInUserInputEvent = false;
		if (eventRan || eventRan2 || this.usedKeys[info.which]) {
			this.usedKeys[info.which] = true;
			info.preventDefault();
		}
	};
	instanceProto.onWindowBlur = function () {
		var i;
		for (i = 0; i < 256; ++i) {
			if (!this.keyMap[i])
				continue;		// key already up
			this.keyMap[i] = false;
			this.triggerKey = i;
			this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnAnyKeyReleased, this);
			var eventRan = this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyReleased, this);
			var eventRan2 = this.runtime.trigger(cr.plugins_.Keyboard.prototype.cnds.OnKeyCodeReleased, this);
			if (eventRan || eventRan2)
				this.usedKeys[i] = true;
		}
	};
	instanceProto.saveToJSON = function () {
		return {"triggerKey": this.triggerKey};
	};
	instanceProto.loadFromJSON = function (o) {
		this.triggerKey = o["triggerKey"];
	};

	function Cnds() {
	};
	Cnds.prototype.IsKeyDown = function (key) {
		return this.keyMap[key];
	};
	Cnds.prototype.OnKey = function (key) {
		return (key === this.triggerKey);
	};
	Cnds.prototype.OnAnyKey = function (key) {
		return true;
	};
	Cnds.prototype.OnAnyKeyReleased = function (key) {
		return true;
	};
	Cnds.prototype.OnKeyReleased = function (key) {
		return (key === this.triggerKey);
	};
	Cnds.prototype.IsKeyCodeDown = function (key) {
		key = Math.floor(key);
		if (key < 0 || key >= this.keyMap.length)
			return false;
		return this.keyMap[key];
	};
	Cnds.prototype.OnKeyCode = function (key) {
		return (key === this.triggerKey);
	};
	Cnds.prototype.OnKeyCodeReleased = function (key) {
		return (key === this.triggerKey);
	};
	pluginProto.cnds = new Cnds();

	function Acts() {
	};
	pluginProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.LastKeyCode = function (ret) {
		ret.set_int(this.triggerKey);
	};

	function fixedStringFromCharCode(kc) {
		kc = Math.floor(kc);
		switch (kc) {
			case 8:
				return "backspace";
			case 9:
				return "tab";
			case 13:
				return "enter";
			case 16:
				return "shift";
			case 17:
				return "control";
			case 18:
				return "alt";
			case 19:
				return "pause";
			case 20:
				return "capslock";
			case 27:
				return "esc";
			case 33:
				return "pageup";
			case 34:
				return "pagedown";
			case 35:
				return "end";
			case 36:
				return "home";
			case 37:
				return "←";
			case 38:
				return "↑";
			case 39:
				return "→";
			case 40:
				return "↓";
			case 45:
				return "insert";
			case 46:
				return "del";
			case 91:
				return "left window key";
			case 92:
				return "right window key";
			case 93:
				return "select";
			case 96:
				return "numpad 0";
			case 97:
				return "numpad 1";
			case 98:
				return "numpad 2";
			case 99:
				return "numpad 3";
			case 100:
				return "numpad 4";
			case 101:
				return "numpad 5";
			case 102:
				return "numpad 6";
			case 103:
				return "numpad 7";
			case 104:
				return "numpad 8";
			case 105:
				return "numpad 9";
			case 106:
				return "numpad *";
			case 107:
				return "numpad +";
			case 109:
				return "numpad -";
			case 110:
				return "numpad .";
			case 111:
				return "numpad /";
			case 112:
				return "F1";
			case 113:
				return "F2";
			case 114:
				return "F3";
			case 115:
				return "F4";
			case 116:
				return "F5";
			case 117:
				return "F6";
			case 118:
				return "F7";
			case 119:
				return "F8";
			case 120:
				return "F9";
			case 121:
				return "F10";
			case 122:
				return "F11";
			case 123:
				return "F12";
			case 144:
				return "numlock";
			case 145:
				return "scroll lock";
			case 186:
				return ";";
			case 187:
				return "=";
			case 188:
				return ",";
			case 189:
				return "-";
			case 190:
				return ".";
			case 191:
				return "/";
			case 192:
				return "'";
			case 219:
				return "[";
			case 220:
				return "\\";
			case 221:
				return "]";
			case 222:
				return "#";
			case 223:
				return "`";
			default:
				return String.fromCharCode(kc);
		}
	};
	Exps.prototype.StringFromKeyCode = function (ret, kc) {
		ret.set_string(fixedStringFromCharCode(kc));
	};
	pluginProto.exps = new Exps();
}());
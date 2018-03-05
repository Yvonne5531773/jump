(function () {
	cr.plugins_.Function = function(runtime) {
		this.runtime = runtime;
	};

	var pluginProto = cr.plugins_.Function.prototype;
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
	var funcStack = [];
	var funcStackPtr = -1;
	var isInPreview = false;	// set in onCreate
	function FuncStackEntry() {
		this.name = "";
		this.retVal = 0;
		this.params = [];
	};

	function pushFuncStack() {
		funcStackPtr++;
		if (funcStackPtr === funcStack.length)
			funcStack.push(new FuncStackEntry());
		return funcStack[funcStackPtr];
	};

	function getCurrentFuncStack() {
		if (funcStackPtr < 0)
			return null;
		return funcStack[funcStackPtr];
	};

	function getOneAboveFuncStack() {
		if (!funcStack.length)
			return null;
		var i = funcStackPtr + 1;
		if (i >= funcStack.length)
			i = funcStack.length - 1;
		return funcStack[i];
	};

	function popFuncStack() {
		;
		funcStackPtr--;
	};
	instanceProto.onCreate = function () {
		isInPreview = (typeof cr_is_preview !== "undefined");
		var self = this;
		window["c2_callFunction"] = function (name_, params_) {
			var i, len, v;
			var fs = pushFuncStack();
			fs.name = name_.toLowerCase();
			fs.retVal = 0;
			if (params_) {
				fs.params.length = params_.length;
				for (i = 0, len = params_.length; i < len; ++i) {
					v = params_[i];
					if (typeof v === "number" || typeof v === "string")
						fs.params[i] = v;
					else if (typeof v === "boolean")
						fs.params[i] = (v ? 1 : 0);
					else
						fs.params[i] = 0;
				}
			}
			else {
				cr.clearArray(fs.params);
			}
			self.runtime.trigger(cr.plugins_.Function.prototype.cnds.OnFunction, self, fs.name);
			popFuncStack();
			return fs.retVal;
		};
	};

	function Cnds() {
	};
	Cnds.prototype.OnFunction = function (name_) {
		var fs = getCurrentFuncStack();
		if (!fs)
			return false;
		return cr.equals_nocase(name_, fs.name);
	};
	Cnds.prototype.CompareParam = function (index_, cmp_, value_) {
		var fs = getCurrentFuncStack();
		if (!fs)
			return false;
		index_ = cr.floor(index_);
		if (index_ < 0 || index_ >= fs.params.length)
			return false;
		return cr.do_cmp(fs.params[index_], cmp_, value_);
	};
	pluginProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.CallFunction = function (name_, params_) {
		var fs = pushFuncStack();
		fs.name = name_.toLowerCase();
		fs.retVal = 0;
		cr.shallowAssignArray(fs.params, params_);
		var ran = this.runtime.trigger(cr.plugins_.Function.prototype.cnds.OnFunction, this, fs.name);
		if (isInPreview && !ran) {
			;
		}
		popFuncStack();
	};
	Acts.prototype.SetReturnValue = function (value_) {
		var fs = getCurrentFuncStack();
		if (fs)
			fs.retVal = value_;
		else
			;
	};
	Acts.prototype.CallExpression = function (unused) {
	};
	pluginProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.ReturnValue = function (ret) {
		var fs = getOneAboveFuncStack();
		if (fs)
			ret.set_any(fs.retVal);
		else
			ret.set_int(0);
	};
	Exps.prototype.ParamCount = function (ret) {
		var fs = getCurrentFuncStack();
		if (fs)
			ret.set_int(fs.params.length);
		else {
			;
			ret.set_int(0);
		}
	};
	Exps.prototype.Param = function (ret, index_) {
		index_ = cr.floor(index_);
		var fs = getCurrentFuncStack();
		if (fs) {
			if (index_ >= 0 && index_ < fs.params.length) {
				ret.set_any(fs.params[index_]);
			}
			else {
				;
				ret.set_int(0);
			}
		}
		else {
			;
			ret.set_int(0);
		}
	};
	Exps.prototype.Call = function (ret, name_) {
		var fs = pushFuncStack();
		fs.name = name_.toLowerCase();
		fs.retVal = 0;
		cr.clearArray(fs.params);
		var i, len;
		for (i = 2, len = arguments.length; i < len; i++)
			fs.params.push(arguments[i]);
		var ran = this.runtime.trigger(cr.plugins_.Function.prototype.cnds.OnFunction, this, fs.name);
		if (isInPreview && !ran) {
			;
		}
		popFuncStack();
		ret.set_any(fs.retVal);
	};
	pluginProto.exps = new Exps();
}());
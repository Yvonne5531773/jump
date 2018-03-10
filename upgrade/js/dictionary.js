(function () {
	cr.plugins_.Dictionary = function(runtime) {
		this.runtime = runtime;
	}

	var pluginProto = cr.plugins_.Dictionary.prototype;
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
	instanceProto.onCreate = function () {
		this.dictionary = {};
		this.cur_key = "";		// current key in for-each loop
		this.key_count = 0;
	};
	instanceProto.saveToJSON = function () {
		return this.dictionary;
	};
	instanceProto.loadFromJSON = function (o) {
		this.dictionary = o;
		this.key_count = 0;
		for (var p in this.dictionary) {
			if (this.dictionary.hasOwnProperty(p))
				this.key_count++;
		}
	};

	function Cnds() {
	};
	Cnds.prototype.CompareValue = function (key_, cmp_, value_) {
		return cr.do_cmp(this.dictionary[key_], cmp_, value_);
	};
	Cnds.prototype.ForEachKey = function () {
		var current_event = this.runtime.getCurrentEventStack().current_event;
		for (var p in this.dictionary) {
			if (this.dictionary.hasOwnProperty(p)) {
				this.cur_key = p;
				this.runtime.pushCopySol(current_event.solModifiers);
				current_event.retrigger();
				this.runtime.popSol(current_event.solModifiers);
			}
		}
		this.cur_key = "";
		return false;
	};
	Cnds.prototype.CompareCurrentValue = function (cmp_, value_) {
		return cr.do_cmp(this.dictionary[this.cur_key], cmp_, value_);
	};
	Cnds.prototype.HasKey = function (key_) {
		return this.dictionary.hasOwnProperty(key_);
	};
	Cnds.prototype.IsEmpty = function () {
		return this.key_count === 0;
	};
	pluginProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.AddKey = function (key_, value_) {
		if (!this.dictionary.hasOwnProperty(key_))
			this.key_count++;
		this.dictionary[key_] = value_;
	};
	Acts.prototype.SetKey = function (key_, value_) {
		if (this.dictionary.hasOwnProperty(key_))
			this.dictionary[key_] = value_;
	};
	Acts.prototype.DeleteKey = function (key_) {
		if (this.dictionary.hasOwnProperty(key_)) {
			delete this.dictionary[key_];
			this.key_count--;
		}
	};
	Acts.prototype.Clear = function () {
		cr.wipe(this.dictionary);		// avoid garbaging
		this.key_count = 0;
	};
	Acts.prototype.JSONLoad = function (json_) {
		var o;
		try {
			o = JSON.parse(json_);
		}
		catch (e) {
			return;
		}
		if (!o["c2dictionary"])		// presumably not a c2dictionary object
			return;
		this.dictionary = o["data"];
		this.key_count = 0;
		for (var p in this.dictionary) {
			if (this.dictionary.hasOwnProperty(p))
				this.key_count++;
		}
	};
	pluginProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.Get = function (ret, key_) {
		if (this.dictionary.hasOwnProperty(key_))
			ret.set_any(this.dictionary[key_]);
		else
			ret.set_int(0);
	};
	Exps.prototype.KeyCount = function (ret) {
		ret.set_int(this.key_count);
	};
	Exps.prototype.CurrentKey = function (ret) {
		ret.set_string(this.cur_key);
	};
	Exps.prototype.CurrentValue = function (ret) {
		if (this.dictionary.hasOwnProperty(this.cur_key))
			ret.set_any(this.dictionary[this.cur_key]);
		else
			ret.set_int(0);
	};
	Exps.prototype.AsJSON = function (ret) {
		ret.set_string(JSON.stringify({
			"c2dictionary": true,
			"data": this.dictionary
		}));
	};
	pluginProto.exps = new Exps();
}());
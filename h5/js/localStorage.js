(function () {
	cr.plugins_.LocalStorage = function (runtime) {
		this.runtime = runtime;
	};
	var currentKey = "";
	var lastValue = "";
	var keyNamesList = [];
	var errorMessage = "";

	function getErrorString(err) {
		if (!err)
			return "unknown error";
		else if (typeof err === "string")
			return err;
		else if (typeof err.message === "string")
			return err.message;
		else if (typeof err.name === "string")
			return err.name;
		else if (typeof err.data === "string")
			return err.data;
		else
			return "unknown error";
	};

	function TriggerStorageError(self, msg) {
		errorMessage = msg;
		self.runtime.trigger(cr.plugins_.LocalStorage.prototype.cnds.OnError, self);
	};
	var prefix = "";
	var is_arcade = (typeof window["is_scirra_arcade"] !== "undefined");
	if (is_arcade)
		prefix = "sa" + window["scirra_arcade_id"] + "_";

	function hasRequiredPrefix(key) {
		if (!prefix)
			return true;
		return key.substr(0, prefix.length) === prefix;
	};
	var pluginProto = cr.plugins_.LocalStorage.prototype;
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
		this.pendingSets = 0;		// number of pending 'Set item' actions
		this.pendingGets = 0;		// number of pending 'Get item' actions
	};
	instanceProto.onDestroy = function () {
	};
	instanceProto.saveToJSON = function () {
		return {};
	};
	instanceProto.loadFromJSON = function (o) {
	};
	var debugDataChanged = true;

	function Cnds() {
	};
	Cnds.prototype.OnItemSet = function (key) {
		return currentKey === key;
	};
	Cnds.prototype.OnAnyItemSet = function () {
		return true;
	};
	Cnds.prototype.OnItemGet = function (key) {
		return currentKey === key;
	};
	Cnds.prototype.OnAnyItemGet = function () {
		return true;
	};
	Cnds.prototype.OnItemRemoved = function (key) {
		return currentKey === key;
	};
	Cnds.prototype.OnAnyItemRemoved = function () {
		return true;
	};
	Cnds.prototype.OnCleared = function () {
		return true;
	};
	Cnds.prototype.OnAllKeyNamesLoaded = function () {
		return true;
	};
	Cnds.prototype.OnError = function () {
		return true;
	};
	Cnds.prototype.OnItemExists = function (key) {
		return currentKey === key;
	};
	Cnds.prototype.OnItemMissing = function (key) {
		return currentKey === key;
	};
	Cnds.prototype.CompareKey = function (cmp, key) {
		return cr.do_cmp(currentKey, cmp, key);
	};
	Cnds.prototype.CompareValue = function (cmp, v) {
		return cr.do_cmp(lastValue, cmp, v);
	};
	Cnds.prototype.IsProcessingSets = function () {
		return this.pendingSets > 0;
	};
	Cnds.prototype.IsProcessingGets = function () {
		return this.pendingGets > 0;
	};
	Cnds.prototype.OnAllSetsComplete = function () {
		return true;
	};
	Cnds.prototype.OnAllGetsComplete = function () {
		return true;
	};
	pluginProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.SetItem = function (keyNoPrefix, value) {
		var keyPrefix = prefix + keyNoPrefix;
		this.pendingSets++;
		var self = this;
		localforage["setItem"](keyPrefix, value, function (err, valueSet) {
			debugDataChanged = true;
			self.pendingSets--;
			if (err) {
				errorMessage = getErrorString(err);
				self.runtime.trigger(cr.plugins_.LocalStorage.prototype.cnds.OnError, self);
			}
			else {
				currentKey = keyNoPrefix;
				lastValue = valueSet;
				self.runtime.trigger(cr.plugins_.LocalStorage.prototype.cnds.OnAnyItemSet, self);
				self.runtime.trigger(cr.plugins_.LocalStorage.prototype.cnds.OnItemSet, self);
				currentKey = "";
				lastValue = "";
			}
			if (self.pendingSets === 0) {
				self.runtime.trigger(cr.plugins_.LocalStorage.prototype.cnds.OnAllSetsComplete, self);
			}
		});
	};
	Acts.prototype.GetItem = function (keyNoPrefix) {
		var keyPrefix = prefix + keyNoPrefix;
		this.pendingGets++;
		var self = this;
		localforage["getItem"](keyPrefix, function (err, value) {
			self.pendingGets--;
			if (err) {
				errorMessage = getErrorString(err);
				self.runtime.trigger(cr.plugins_.LocalStorage.prototype.cnds.OnError, self);
			}
			else {
				currentKey = keyNoPrefix;
				lastValue = value;
				if (typeof lastValue === "undefined" || lastValue === null)
					lastValue = "";
				self.runtime.trigger(cr.plugins_.LocalStorage.prototype.cnds.OnAnyItemGet, self);
				self.runtime.trigger(cr.plugins_.LocalStorage.prototype.cnds.OnItemGet, self);
				currentKey = "";
				lastValue = "";
			}
			if (self.pendingGets === 0) {
				self.runtime.trigger(cr.plugins_.LocalStorage.prototype.cnds.OnAllGetsComplete, self);
			}
		});
	}
	pluginProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.ItemValue = function (ret) {
		ret.set_any(lastValue);
	};
	Exps.prototype.Key = function (ret) {
		ret.set_string(currentKey);
	};
	Exps.prototype.KeyCount = function (ret) {
		ret.set_int(keyNamesList.length);
	};
	Exps.prototype.KeyAt = function (ret, i) {
		i = Math.floor(i);
		if (i < 0 || i >= keyNamesList.length) {
			ret.set_string("");
			return;
		}
		ret.set_string(keyNamesList[i]);
	};
	Exps.prototype.ErrorMessage = function (ret) {
		ret.set_string(errorMessage);
	};
	pluginProto.exps = new Exps();
}())
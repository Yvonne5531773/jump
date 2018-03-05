(function () {
	cr.plugins_.Rex_Hash = function(runtime)
	{
		this.runtime = runtime;
	};

	var pluginProto = cr.plugins_.Rex_Hash.prototype;
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
		var init_data = this.properties[0];
		if (init_data != "")
			this.hashtable = JSON.parse(init_data);
		else
			this.hashtable = {};
		this.currentEntry = this.hashtable;
		this.setIndent(this.properties[1]);
		this.exp_CurKey = "";
		this.exp_CurValue = 0;
		this.exp_Loopindex = 0;
	};
	instanceProto.cleanAll = function () {
		var key;
		for (key in this.hashtable)
			delete this.hashtable[key];
		this.currentEntry = this.hashtable;
	};
	instanceProto.getEntry = function (keys, root, defaultEntry) {
		var entry = root || this.hashtable;
		if ((keys === "") || (keys.length === 0)) {
		}
		else {
			if (typeof (keys) === "string")
				keys = keys.split(".");
			var i, cnt = keys.length, key;
			for (i = 0; i < cnt; i++) {
				key = keys[i];
				if ((entry[key] == null) || (typeof(entry[key]) !== "object")) {
					var newEntry;
					if (i === cnt - 1) {
						newEntry = defaultEntry || {};
					}
					else {
						newEntry = {};
					}
					entry[key] = newEntry;
				}
				entry = entry[key];
			}
		}
		return entry;
	};
	instanceProto.setCurrentEntry = function (keys, root) {
		this.currentEntry = this.getEntry(keys, root);
	};
	instanceProto.setValue = function (keys, value, root) {
		if ((keys === "") || (keys.length === 0)) {
			if ((value !== null) && typeof(value) === "object") {
				if (root == null)
					this.hashtable = value;
				else
					root = value;
			}
		}
		else {
			if (root == null)
				root = this.hashtable;
			if (typeof (keys) === "string")
				keys = keys.split(".");
			var lastKey = keys.pop();
			var entry = this.getEntry(keys, root);
			entry[lastKey] = value;
		}
	};
	instanceProto.getValue = function (keys, root) {
		if (root == null)
			root = this.hashtable;
		if ((keys == null) || (keys === "") || (keys.length === 0)) {
			return root;
		}
		else {
			if (typeof (keys) === "string")
				keys = keys.split(".");
			var i, cnt = keys.length, key;
			var entry = root;
			for (i = 0; i < cnt; i++) {
				key = keys[i];
				if (entry.hasOwnProperty(key))
					entry = entry[key];
				else
					return;
			}
			return entry;
		}
	};
	instanceProto.removeKey = function (keys) {
		if ((keys === "") || (keys.length === 0)) {
			this.cleanAll();
		}
		else {
			if (typeof (keys) === "string")
				keys = keys.split(".");
			var data = this.getValue(keys);
			if (data === undefined)
				return;
			var lastKey = keys.pop();
			var entry = this.getEntry(keys);
			if (!isArray(entry)) {
				delete entry[lastKey];
			}
			else {
				if ((lastKey < 0) || (lastKey >= entry.length))
					return;
				else if (lastKey === (entry.length - 1))
					entry.pop();
				else if (lastKey === 0)
					entry.shift();
				else
					entry.splice(lastKey, 1);
			}
		}
	};
	instanceProto.setIndent = function (space) {
		if (isNaN(space))
			this.space = space;
		else
			this.sapce = parseInt(space);
	};
	var getItemsCount = function (o) {
		if (o == null)  // nothing
			return (-1);
		else if ((typeof o == "number") || (typeof o == "string"))  // number/string
			return 0;
		else if (o.length != null)  // list
			return o.length;
		var key, cnt = 0;
		for (key in o)
			cnt += 1;
		return cnt;
	};
	var din = function (d, default_value, space) {
		var o;
		if (d === true)
			o = 1;
		else if (d === false)
			o = 0;
		else if (d == null) {
			if (default_value != null)
				o = default_value;
			else
				o = 0;
		}
		else if (typeof(d) == "object") {
			o = JSON.stringify(d, null, space);
		}
		else
			o = d;
		return o;
	};
	var isArray = function (o) {
		return (o instanceof Array);
	}
	instanceProto.saveToJSON = function () {
		return {"d": this.hashtable};
	};
	instanceProto.loadFromJSON = function (o) {
		this.hashtable = o["d"];
	};

	function Cnds() {
	};
	pluginProto.cnds = new Cnds();
	Cnds.prototype.ForEachItem = function (key) {
		var entry = this.getEntry(key);
		var current_frame = this.runtime.getCurrentEventStack();
		var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		var key, value;
		this.exp_Loopindex = -1;
		for (key in entry) {
			if (solModifierAfterCnds)
				this.runtime.pushCopySol(current_event.solModifiers);
			this.exp_CurKey = key;
			this.exp_CurValue = entry[key];
			this.exp_Loopindex++;
			current_event.retrigger();
			if (solModifierAfterCnds)
				this.runtime.popSol(current_event.solModifiers);
		}
		this.exp_CurKey = "";
		this.exp_CurValue = 0;
		return false;
	};
	Cnds.prototype.KeyExists = function (keys) {
		if (keys == "")
			return false;
		var data = this.getValue(keys);
		return (data !== undefined);
	};
	Cnds.prototype.IsEmpty = function (keys) {
		var entry = this.getEntry(keys);
		var cnt = getItemsCount(entry);
		return (cnt <= 0);
	};

	function Acts() {
	};
	pluginProto.acts = new Acts();
	Acts.prototype.SetValueByKeyString = function (key, val) {
		if (key === "")
			return;
		this.setValue(key, val);
	};
	Acts.prototype.SetCurHashEntey = function (key) {
		this.setCurrentEntry(key);
	};
	Acts.prototype.SetValueInCurHashEntey = function (key, val) {
		if (key === "")
			return;
		this.setValue(key, val, this.currentEntry);
	};
	Acts.prototype.CleanAll = function () {
		this.cleanAll();
	};
	Acts.prototype.StringToHashTable = function (JSON_string) {
		if (JSON_string != "")
			this.hashtable = JSON.parse(JSON_string);
		else
			this.cleanAll();
	};
	Acts.prototype.RemoveByKeyString = function (key) {
		this.removeKey(key);
	};
	Acts.prototype.PickKeysToArray = function (key, arrayObjs) {
		if (!arrayObjs)
			return;
		var arrayObj = arrayObjs.getFirstPicked();
		;
		cr.plugins_.Arr.prototype.acts.SetSize.apply(arrayObj, [0, 1, 1]);
		var entry = this.getEntry(key);
		for (var key in entry)
			cr.plugins_.Arr.prototype.acts.Push.call(arrayObj, 0, key, 0);
	};
	var getFullKey = function (currentKey, key) {
		if (currentKey !== "")
			key = currentKey + "." + key;
		return key;
	};
	Acts.prototype.MergeTwoHashTable = function (hashtable_objs, conflict_handler_mode) {
		if (!hashtable_objs)
			return;
		var hashB = hashtable_objs.getFirstPicked();
		if (hashB == null)
			return;
		;
		var untraversalTables = [], node;
		var curHash, currentKey, keyB, valueB, keyA, valueA, fullKey;
		if (conflict_handler_mode === 2) {
			this.cleanAll();
			conflict_handler_mode = 0;
		}
		switch (conflict_handler_mode) {
			case 0: // Overwrite from hash B
				untraversalTables.push({table: hashB.hashtable, key: ""});
				while (untraversalTables.length !== 0) {
					node = untraversalTables.shift();
					curHash = node.table;
					currentKey = node.key;
					for (keyB in curHash) {
						valueB = curHash[keyB];
						fullKey = getFullKey(currentKey, keyB);
						valueA = this.getValue(fullKey);
						if ((valueB === null) || typeof(valueB) !== "object") {
							this.setValue(fullKey, valueB);
						}
						else {
							if (isArray(valueB) && !isArray(valueA))
								this.setValue(fullKey, []);
							untraversalTables.push({table: valueB, key: fullKey});
						}
					}
				}
				break;
			case 1:  // Merge new keys from hash table B
				untraversalTables.push({table: hashB.hashtable, key: ""});
				while (untraversalTables.length !== 0) {
					node = untraversalTables.shift();
					curHash = node.table;
					currentKey = node.key;
					for (keyB in curHash) {
						valueB = curHash[keyB];
						fullKey = getFullKey(currentKey, keyB);
						valueA = this.getValue(fullKey);
						if (valueA !== undefined)
							continue;
						if ((valueB == null) || typeof(valueB) !== "object") {
							this.setValue(fullKey, valueB);
						}
						else {
							if (isArray(valueB))
								this.setValue(fullKey, []);
							untraversalTables.push({table: valueB, key: fullKey});
						}
					}
				}
				break;
		}
	};
	Acts.prototype.SetJSONByKeyString = function (key, val) {
		val = JSON.parse(val);
		this.setValue(key, val);
	};
	Acts.prototype.AddToValueByKeyString = function (keys, val) {
		if (keys === "")
			return;
		keys = keys.split(".");
		var curValue = this.getValue(keys) || 0;
		this.setValue(keys, curValue + val);
	};
	var _shuffle = function (arr, random_gen) {
		var i = arr.length, j, temp, random_value;
		if (i == 0) return;
		while (--i) {
			random_value = (random_gen == null) ?
				Math.random() : random_gen.random();
			j = Math.floor(random_value * (i + 1));
			temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
	};
	Acts.prototype.Shuffle = function (entryKey) {
		var arr = this.getValue(entryKey);
		if (!isArray(arr))
			return;
		_shuffle(arr);
	};
	Acts.prototype.Sort = function (entryKey, sortKey, sortMode_) {
		var arr = this.getValue(entryKey);
		if (!isArray(arr))
			return;
		if (sortKey === "")
			sortKey = null;
		else
			sortKey = sortKey.split(".");
		var self = this;
		var sortFn = function (itemA, itemB) {
			var valA = (sortKey) ? self.getValue(sortKey, itemA) : itemA;
			var valB = (sortKey) ? self.getValue(sortKey, itemB) : itemB;
			var m = sortMode_;
			if (sortMode_ >= 2)  // logical descending, logical ascending
			{
				valA = parseFloat(valA);
				valB = parseFloat(valB);
				m -= 2;
			}
			switch (m) {
				case 0:  // descending
					if (valA === valB) return 0;
					else if (valA < valB) return 1;
					else return -1;
					break;
				case 1:  // ascending
					if (valA === valB) return 0;
					else if (valA > valB) return 1;
					else return -1;
					break;
			}
		}
		arr.sort(sortFn);
	};
	Acts.prototype.PushJSON = function (keys, val) {
		val = JSON.parse(val);
		Acts.prototype.PushValue.call(this, keys, val);
	};
	Acts.prototype.PushValue = function (keys, val) {
		var arr = this.getEntry(keys, null, []);
		if (!isArray(arr))
			return;
		arr.push(val);
	};
	Acts.prototype.InsertJSON = function (keys, val, idx) {
		val = JSON.parse(val);
		Acts.prototype.InsertValue.call(this, keys, val, idx);
	};
	Acts.prototype.InsertValue = function (keys, val, idx) {
		var arr = this.getEntry(keys, null, []);
		if (!isArray(arr))
			return;
		arr.splice(idx, 0, val);
	};
	Acts.prototype.SetIndent = function (space) {
		this.setIndent(space);
	};

	function Exps() {
	};
	pluginProto.exps = new Exps();
	Exps.prototype.Hash = function (ret, keys, default_value) {
		keys = keys.split(".");
		var val = din(this.getValue(keys), default_value, this.space);
		ret.set_any(val);
	};
	Exps.prototype.At = Exps.prototype.Hash;
	var gKeys = [];
	Exps.prototype.AtKeys = function (ret, key) {
		gKeys.length = 0;
		var i, cnt = arguments.length, k;
		for (i = 1; i < cnt; i++) {
			k = arguments[i];
			if ((typeof (k) === "string") && (k.indexOf(".") !== -1))
				gKeys.push.apply(gKeys, k.split("."));
			else
				gKeys.push(k);
		}
		var val = din(this.getValue(gKeys), null, this.space);
		gKeys.length = 0;
		ret.set_any(val);
	};
	Exps.prototype.Entry = function (ret, key) {
		var val = din(this.currentEntry[key], null, this.space);
		ret.set_any(val);
	};
	Exps.prototype.HashTableToString = function (ret) {
		var json_string = JSON.stringify(this.hashtable, null, this.space);
		ret.set_string(json_string);
	};
	Exps.prototype.CurKey = function (ret) {
		ret.set_string(this.exp_CurKey);
	};
	Exps.prototype.CurValue = function (ret, subKeys, default_value) {
		var val = this.getValue(subKeys, this.exp_CurValue);
		val = din(val, default_value, this.space);
		ret.set_any(val);
	};
	Exps.prototype.ItemCnt = function (ret, keys) {
		var cnt = getItemsCount(this.getValue(keys));
		ret.set_int(cnt);
	};
	Exps.prototype.Keys2ItemCnt = function (ret, key) {
		var keys = (arguments.length > 2) ?
			Array.prototype.slice.call(arguments, 1) :
			[key];
		var cnt = getItemsCount(this.getValue(keys));
		ret.set_int(cnt);
	};
	Exps.prototype.ToString = function (ret) {
		var table;
		if (arguments.length == 1)  // no parameter
			table = this.hashtable;
		else {
			var i, cnt = arguments.length;
			table = {};
			for (i = 1; i < cnt; i = i + 2)
				table[arguments[i]] = arguments[i + 1];
		}
		ret.set_string(JSON.stringify(table, null, this.space));
	};
	Exps.prototype.AsJSON = Exps.prototype.HashTableToString;
	Exps.prototype.RandomKeyAt = function (ret, keys, default_value) {
		var val;
		var o = this.getValue(keys);
		if (typeof(o) === "object") {
			var isArr = isArray(o);
			if (!isArr)
				o = Object.keys(o);
			var cnt = o.length;
			if (cnt > 0) {
				val = Math.floor(Math.random() * cnt);
				if (!isArr)
					val = o[val];
			}
		}
		val = din(val, default_value, this.space);
		ret.set_any(val);
	};
	Exps.prototype.Loopindex = function (ret) {
		ret.set_int(this.exp_Loopindex);
	};
	Exps.prototype.Pop = function (ret, keys, idx) {
		var arr = this.getEntry(keys);
		var val;
		if (arr == null)
			val = 0;
		else if ((idx == null) || (idx === (arr.length - 1)))
			val = arr.pop()
		else
			val = arr.splice(idx, 1);
		ret.set_any(din(val, null, this.space));
	};
}());
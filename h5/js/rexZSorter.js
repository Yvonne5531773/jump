(function () {
	cr.plugins_.Rex_ZSorter = function(runtime)
	{
		this.runtime = runtime;
	};

	var pluginProto = cr.plugins_.Rex_ZSorter.prototype;
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
	var y_increasing = true;
	var x_increasing = true;
	instanceProto.onCreate = function () {
		y_increasing = (this.properties[0] === 0);
		x_increasing = (this.properties[1] === 0);
		this._cmp_uidA = 0;
		this._cmp_uidB = 0;
		this._compared_result = 0;
		this._sort_fn_name = "";
	};
	instanceProto.draw = function (ctx) {
	};
	var _thisArg = null;
	var _sort_fn = function (instance_a, instance_b) {
		_thisArg._cmp_uidA = instance_a.uid;
		_thisArg._cmp_uidB = instance_b.uid;
		_thisArg.runtime.trigger(cr.plugins_.Rex_ZSorter.prototype.cnds.OnSortingFn, _thisArg);
		return _thisArg._compared_result;
	};
	instanceProto.saveToJSON = function () {
		return {"xi": x_increasing};
	};
	instanceProto.loadFromJSON = function (o) {
		x_increasing = o["xi"];
	};

	function Cnds() {
	};
	pluginProto.cnds = new Cnds();
	Cnds.prototype.OnSortingFn = function (name) {
		return (this._sort_fn_name == name);
	};

	function Acts() {
	};
	pluginProto.acts = new Acts();
	var ZSORT = function (instance_a, instance_b) {
		var ax = instance_a.x;
		var ay = instance_a.y;
		var bx = instance_b.x;
		var by = instance_b.y;
		if (ay === by) {
			if (ax === bx)
				return 0;
			else if (x_increasing)
				return (ax > bx) ? 1 : -1;
			else  // !x_increasing
				return (ax < bx) ? 1 : -1;
		}
		else if (y_increasing)
			return (ay > by) ? 1 : -1;
		else // !y_increasing
			return (ay < by) ? 1 : -1;
	}
	Acts.prototype.SortObjsLayerByY = function (layer) {
		if (layer == null) {
			alart("Z Sort: Can not find layer  " + layerparam);
			return;
		}
		layer.instances.sort(ZSORT);
		layer.zindices_stale = true;
		this.runtime.redraw = true;
	};
	Acts.prototype.SetXorder = function (x_order) {
		x_increasing = (x_order === 0);
	};
	Acts.prototype.SortByFn = function (layer, fn_name) {
		if (layer == null) {
			alert("Z Sort: Can not find layer  " + layerparam);
			return;
		}
		_thisArg = this;
		this._sort_fn_name = fn_name;
		layer.instances.sort(_sort_fn);
		layer.zindices_stale = true;
		this.runtime.redraw = true;
	};
	Acts.prototype.SetCmpResultDirectly = function (result) {
		this._compared_result = result;
	};
	Acts.prototype.SetCmpResultCombo = function (result) {
		this._compared_result = result - 1;
	};
	Acts.prototype.SetYorder = function (y_order) {
		y_increasing = (y_order === 0);
	};
	Acts.prototype.ZMoveToObject = function (uidA, where_, uidB) {
		if (uidA == uidB)
			return;
		var instA = this.runtime.getObjectByUID(uidA);
		var instB = this.runtime.getObjectByUID(uidB);
		if ((instA == null) || (instB == null))
			return;
		var isafter = (where_ === 0);
		if (instA.layer.index !== instB.layer.index) {
			instA.layer.removeFromInstanceList(instA, true);
			instA.layer = instB.layer;
			instB.layer.appendToInstanceList(instA, true);
		}
		instA.layer.moveInstanceAdjacent(instA, instB, isafter);
		instA.runtime.redraw = true;
	};

	function Exps() {
	};
	pluginProto.exps = new Exps();
	Exps.prototype.CmpUIDA = function (ret) {
		ret.set_int(this._cmp_uidA);
	};
	Exps.prototype.CmpUIDB = function (ret) {
		ret.set_int(this._cmp_uidB);
	};
}());
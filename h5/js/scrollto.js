(function () {
	cr.behaviors.scrollto = function (runtime) {
		this.runtime = runtime;
		this.shakeMag = 0;
		this.shakeStart = 0;
		this.shakeEnd = 0;
		this.shakeMode = 0;
	};

	var behaviorProto = cr.behaviors.scrollto.prototype;
	behaviorProto.Type = function (behavior, objtype) {
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	var behtypeProto = behaviorProto.Type.prototype;
	behtypeProto.onCreate = function () {
	};
	behaviorProto.Instance = function (type, inst) {
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.onCreate = function () {
		this.enabled = (this.properties[0] !== 0);
	};
	behinstProto.saveToJSON = function () {
		return {
			"smg": this.behavior.shakeMag,
			"ss": this.behavior.shakeStart,
			"se": this.behavior.shakeEnd,
			"smd": this.behavior.shakeMode
		};
	};
	behinstProto.loadFromJSON = function (o) {
		this.behavior.shakeMag = o["smg"];
		this.behavior.shakeStart = o["ss"];
		this.behavior.shakeEnd = o["se"];
		this.behavior.shakeMode = o["smd"];
	};
	behinstProto.tick = function () {
	};

	function getScrollToBehavior(inst) {
		var i, len, binst;
		for (i = 0, len = inst.behavior_insts.length; i < len; ++i) {
			binst = inst.behavior_insts[i];
			if (binst.behavior instanceof cr.behaviors.scrollto)
				return binst;
		}
		return null;
	};
	behinstProto.tick2 = function () {
		if (!this.enabled)
			return;
		var all = this.behavior.my_instances.valuesRef();
		var sumx = 0, sumy = 0;
		var i, len, binst, count = 0;
		for (i = 0, len = all.length; i < len; i++) {
			binst = getScrollToBehavior(all[i]);
			if (!binst || !binst.enabled)
				continue;
			sumx += all[i].x;
			sumy += all[i].y;
			++count;
		}
		var layout = this.inst.layer.layout;
		var now = this.runtime.kahanTime.sum;
		var offx = 0, offy = 0;
		if (now >= this.behavior.shakeStart && now < this.behavior.shakeEnd) {
			var mag = this.behavior.shakeMag * Math.min(this.runtime.timescale, 1);
			if (this.behavior.shakeMode === 0)
				mag *= 1 - (now - this.behavior.shakeStart) / (this.behavior.shakeEnd - this.behavior.shakeStart);
			var a = Math.random() * Math.PI * 2;
			var d = Math.random() * mag;
			offx = Math.cos(a) * d;
			offy = Math.sin(a) * d;
		}
		layout.scrollToX(sumx / count + offx);
		layout.scrollToY(sumy / count + offy);
	};

	function Acts() {
	};
	Acts.prototype.Shake = function (mag, dur, mode) {
		this.behavior.shakeMag = mag;
		this.behavior.shakeStart = this.runtime.kahanTime.sum;
		this.behavior.shakeEnd = this.behavior.shakeStart + dur;
		this.behavior.shakeMode = mode;
	};
	Acts.prototype.SetEnabled = function (e) {
		this.enabled = (e !== 0);
	};
	behaviorProto.acts = new Acts();
}());
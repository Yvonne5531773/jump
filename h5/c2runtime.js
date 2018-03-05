
window["cr_getC2Runtime"] = function()
{
	var canvas = document.getElementById("c2canvas");
	if (canvas)
		return canvas["c2runtime"];
	else if (window["c2runtime"])
		return window["c2runtime"];
	else
		return null;
}
window["cr_setSuspended"] = function(s) {
	var runtime = window["cr_getC2Runtime"]();
	if (runtime)
		runtime["setSuspended"](s);
}


;
;
cr.behaviors.Pin = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var behaviorProto = cr.behaviors.Pin.prototype;
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
		this.pinObject = null;
		this.pinObjectUid = -1;		// for loading
		this.pinAngle = 0;
		this.pinDist = 0;
		this.myStartAngle = 0;
		this.theirStartAngle = 0;
		this.lastKnownAngle = 0;
		this.mode = 0;				// 0 = position & angle; 1 = position; 2 = angle; 3 = rope; 4 = bar
		var self = this;
		if (!this.recycled) {
			this.myDestroyCallback = (function (inst) {
				self.onInstanceDestroyed(inst);
			});
		}
		this.runtime.addDestroyCallback(this.myDestroyCallback);
	};
	behinstProto.saveToJSON = function () {
		return {
			"uid": this.pinObject ? this.pinObject.uid : -1,
			"pa": this.pinAngle,
			"pd": this.pinDist,
			"msa": this.myStartAngle,
			"tsa": this.theirStartAngle,
			"lka": this.lastKnownAngle,
			"m": this.mode
		};
	};
	behinstProto.loadFromJSON = function (o) {
		this.pinObjectUid = o["uid"];		// wait until afterLoad to look up
		this.pinAngle = o["pa"];
		this.pinDist = o["pd"];
		this.myStartAngle = o["msa"];
		this.theirStartAngle = o["tsa"];
		this.lastKnownAngle = o["lka"];
		this.mode = o["m"];
	};
	behinstProto.afterLoad = function () {
		if (this.pinObjectUid === -1)
			this.pinObject = null;
		else {
			this.pinObject = this.runtime.getObjectByUID(this.pinObjectUid);
			;
		}
		this.pinObjectUid = -1;
	};
	behinstProto.onInstanceDestroyed = function (inst) {
		if (this.pinObject == inst)
			this.pinObject = null;
	};
	behinstProto.onDestroy = function () {
		this.pinObject = null;
		this.runtime.removeDestroyCallback(this.myDestroyCallback);
	};
	behinstProto.tick = function () {
	};
	behinstProto.tick2 = function () {
		if (!this.pinObject)
			return;
		if (this.lastKnownAngle !== this.inst.angle)
			this.myStartAngle = cr.clamp_angle(this.myStartAngle + (this.inst.angle - this.lastKnownAngle));
		var newx = this.inst.x;
		var newy = this.inst.y;
		if (this.mode === 3 || this.mode === 4)		// rope mode or bar mode
		{
			var dist = cr.distanceTo(this.inst.x, this.inst.y, this.pinObject.x, this.pinObject.y);
			if ((dist > this.pinDist) || (this.mode === 4 && dist < this.pinDist)) {
				var a = cr.angleTo(this.pinObject.x, this.pinObject.y, this.inst.x, this.inst.y);
				newx = this.pinObject.x + Math.cos(a) * this.pinDist;
				newy = this.pinObject.y + Math.sin(a) * this.pinDist;
			}
		}
		else {
			newx = this.pinObject.x + Math.cos(this.pinObject.angle + this.pinAngle) * this.pinDist;
			newy = this.pinObject.y + Math.sin(this.pinObject.angle + this.pinAngle) * this.pinDist;
		}
		var newangle = cr.clamp_angle(this.myStartAngle + (this.pinObject.angle - this.theirStartAngle));
		this.lastKnownAngle = newangle;
		if ((this.mode === 0 || this.mode === 1 || this.mode === 3 || this.mode === 4)
			&& (this.inst.x !== newx || this.inst.y !== newy)) {
			this.inst.x = newx;
			this.inst.y = newy;
			this.inst.set_bbox_changed();
		}
		if ((this.mode === 0 || this.mode === 2) && (this.inst.angle !== newangle)) {
			this.inst.angle = newangle;
			this.inst.set_bbox_changed();
		}
	};

	function Cnds() {
	};
	Cnds.prototype.IsPinned = function () {
		return !!this.pinObject;
	};
	behaviorProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.Pin = function (obj, mode_) {
		if (!obj)
			return;
		var otherinst = obj.getFirstPicked(this.inst);
		if (!otherinst)
			return;
		this.pinObject = otherinst;
		this.pinAngle = cr.angleTo(otherinst.x, otherinst.y, this.inst.x, this.inst.y) - otherinst.angle;
		this.pinDist = cr.distanceTo(otherinst.x, otherinst.y, this.inst.x, this.inst.y);
		this.myStartAngle = this.inst.angle;
		this.lastKnownAngle = this.inst.angle;
		this.theirStartAngle = otherinst.angle;
		this.mode = mode_;
	};
	Acts.prototype.Unpin = function () {
		this.pinObject = null;
	};
	behaviorProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.PinnedUID = function (ret) {
		ret.set_int(this.pinObject ? this.pinObject.uid : -1);
	};
	behaviorProto.exps = new Exps();
}());
;
;
cr.behaviors.Rex_MoveTo = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var behaviorProto = cr.behaviors.Rex_MoveTo.prototype;
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
		this.enabled = (this.properties[0] === 1);
		if (!this.recycled) {
			this.moveParams = {};
		}
		this.moveParams["max"] = this.properties[1];
		this.moveParams["acc"] = this.properties[2];
		this.moveParams["dec"] = this.properties[3];
		this.soildStopEnable = (this.properties[4] === 1);
		this.isContinueMode = (this.properties[5] === 1);
		if (!this.recycled) {
			this.target = {"x": 0, "y": 0, "a": 0};
		}
		this.isMoving = false;
		this.currentSpeed = 0;
		this.remainDistance = 0;
		this.remainDt = 0;
		if (!this.recycled) {
			this.prePosition = {"x": 0, "y": 0};
		}
		this.prePosition["x"] = 0;
		this.prePosition["y"] = 0;
		this.movingAngleData = newPointData(this.movingAngleData);
		this.movingAngleStartData = newPointData(this.movingAngleStartData);
		this.lastTick = null;
		this.isMyCall = false;
	};
	var newPointData = function (point) {
		if (point == null)
			point = {};
		point["x"] = 0;
		point["y"] = 0;
		point["a"] = -1;
		return point;
	};
	behinstProto.tick = function () {
		this.remainDt = 0;
		if ((!this.enabled) || (!this.isMoving))
			return;
		var dt = this.runtime.getDt(this.inst);
		this.move(dt);
	};
	behinstProto.move = function (dt) {
		if (dt == 0)   // can not move if dt == 0
			return;
		if ((this.prePosition["x"] !== this.inst.x) || (this.prePosition["y"] !== this.inst.y))
			this.resetCurrentPosition();    // reset this.remainDistance
		var isSlowDown = false;
		if (this.moveParams["dec"] != 0) {
			var d = (this.currentSpeed * this.currentSpeed) / (2 * this.moveParams["dec"]); // (v*v)/(2*a)
			isSlowDown = (d >= this.remainDistance);
		}
		var acc = (isSlowDown) ? (-this.moveParams["dec"]) : this.moveParams["acc"];
		if (acc != 0) {
			this.setCurrentSpeed(this.currentSpeed + (acc * dt));
		}
		var distance = this.currentSpeed * dt;
		this.remainDistance -= distance;
		var isHitTarget = false;
		var angle = this.target["a"];
		var ux = Math.cos(angle);
		var uy = Math.sin(angle);
		if ((this.remainDistance <= 0) || (this.currentSpeed <= 0)) {
			isHitTarget = true;
			this.inst.x = this.target["x"];
			this.inst.y = this.target["y"];
			if (this.currentSpeed > 0)
				this.remainDt = (-this.remainDistance) / this.currentSpeed;
			this.getMovingAngle();
			this.setCurrentSpeed(0);
		}
		else {
			var angle = this.target["a"];
			this.inst.x += (distance * ux);
			this.inst.y += (distance * uy);
		}
		this.inst.set_bbox_changed();
		var isSolidStop = false;
		if (this.soildStopEnable) {
			var collobj = this.runtime.testOverlapSolid(this.inst);
			if (collobj) {
				this.runtime.registerCollision(this.inst, collobj);
				this.runtime.pushOutSolid(this.inst, -ux, -uy, Math.max(distance, 50));
				isSolidStop = true;
			}
		}
		this.prePosition["x"] = this.inst.x;
		this.prePosition["y"] = this.inst.y;
		if (isSolidStop) {
			this.isMoving = false;  // stop
			this.isMyCall = true;
			this.runtime.trigger(cr.behaviors.Rex_MoveTo.prototype.cnds.OnSolidStop, this.inst);
			this.isMyCall = false;
		}
		else if (isHitTarget) {
			this.isMoving = false;  // stop
			this.isMyCall = true;
			this.runtime.trigger(cr.behaviors.Rex_MoveTo.prototype.cnds.OnHitTarget, this.inst);
			this.isMyCall = false;
		}
	};
	behinstProto.tick2 = function () {
		this.movingAngleData["x"] = this.inst.x;
		this.movingAngleData["y"] = this.inst.y;
	};
	behinstProto.setCurrentSpeed = function (speed) {
		if (speed != null) {
			this.currentSpeed = (speed > this.moveParams["max"]) ?
				this.moveParams["max"] : speed;
		}
		else if (this.moveParams["acc"] == 0) {
			this.currentSpeed = this.moveParams["max"];
		}
	};
	behinstProto.resetCurrentPosition = function () {
		var dx = this.target["x"] - this.inst.x;
		var dy = this.target["y"] - this.inst.y;
		this.target["a"] = Math.atan2(dy, dx);
		this.remainDistance = Math.sqrt((dx * dx) + (dy * dy));
		this.prePosition["x"] = this.inst.x;
		this.prePosition["y"] = this.inst.y;
	};
	behinstProto.setTargetPos = function (_x, _y) {
		this.target["x"] = _x;
		this.target["y"] = _y;
		this.setCurrentSpeed(null);
		this.resetCurrentPosition();
		this.movingAngleData["x"] = this.inst.x;
		this.movingAngleData["y"] = this.inst.y;
		this.isMoving = true;
		this.movingAngleStartData["x"] = this.inst.x;
		this.movingAngleStartData["y"] = this.inst.y;
		this.movingAngleStartData["a"] = cr.to_clamped_degrees(cr.angleTo(this.inst.x, this.inst.y, _x, _y));
		if (this.isContinueMode)
			this.move(this.remainDt);
	};
	behinstProto.isTickChanged = function () {
		var curTick = this.runtime.tickcount;
		var tickChanged = (this.lastTick != curTick);
		this.lastTick = curTick;
		return tickChanged;
	};
	behinstProto.getMovingAngle = function (ret) {
		if (this.isTickChanged()) {
			var dx = this.inst.x - this.movingAngleData["x"];
			var dy = this.inst.y - this.movingAngleData["y"];
			if ((dx != 0) || (dy != 0))
				this.movingAngleData["a"] = cr.to_clamped_degrees(Math.atan2(dy, dx));
		}
		return this.movingAngleData["a"];
	};

	function clone(obj) {
		if (null == obj || "object" != typeof obj)
			return obj;
		var result = obj.constructor();
		for (var attr in obj) {
			if (obj.hasOwnProperty(attr))
				result[attr] = obj[attr];
		}
		return result;
	};
	behinstProto.saveToJSON = function () {
		return {
			"en": this.enabled,
			"v": clone(this.moveParams),
			"t": clone(this.target),
			"is_m": this.isMoving,
			"c_spd": this.currentSpeed,
			"rd": this.remainDistance,
			"pp": clone(this.prePosition),
			"ma": clone(this.movingAngleData),
			"ms": clone(this.movingAngleStartData),
			"lt": this.lastTick,
		};
	};
	behinstProto.loadFromJSON = function (o) {
		this.enabled = o["en"];
		this.moveParams = o["v"];
		this.target = o["t"];
		this.isMoving = o["is_m"];
		this.currentSpeed = o["c_spd"];
		this.remainDistance = o["rd"];
		this.prePosition = o["pp"];
		this.movingAngleData = o["ma"];
		this.movingAngleStartData = o["ms"];
		this.lastTick = o["lt"];
	};

	function Cnds() {
	};
	behaviorProto.cnds = new Cnds();
	Cnds.prototype.OnHitTarget = function () {
		return (this.isMyCall);
	};
	Cnds.prototype.CompareSpeed = function (cmp, s) {
		return cr.do_cmp(this.currentSpeed, cmp, s);
	};
	Cnds.prototype.OnMoving = function ()  // deprecated
	{
		return false;
	};
	Cnds.prototype.IsMoving = function () {
		return (this.enabled && this.isMoving);
	};
	Cnds.prototype.CompareMovingAngle = function (cmp, s) {
		var angle = this.getMovingAngle();
		if (angle != (-1))
			return cr.do_cmp(this.getMovingAngle(), cmp, s);
		else
			return false;
	};
	Cnds.prototype.OnSolidStop = function () {
		return this.isMyCall;
	};

	function Acts() {
	};
	behaviorProto.acts = new Acts();
	Acts.prototype.SetEnabled = function (en) {
		this.enabled = (en === 1);
	};
	Acts.prototype.SetMaxSpeed = function (s) {
		this.moveParams["max"] = s;
		this.setCurrentSpeed(null);
	};
	Acts.prototype.SetAcceleration = function (a) {
		this.moveParams["acc"] = a;
		this.setCurrentSpeed(null);
	};
	Acts.prototype.SetDeceleration = function (a) {
		this.moveParams["dec"] = a;
	};
	Acts.prototype.SetTargetPos = function (x, y) {
		this.setTargetPos(x, y)
	};
	Acts.prototype.SetCurrentSpeed = function (s) {
		this.setCurrentSpeed(s);
	};
	Acts.prototype.SetTargetPosOnObject = function (objtype) {
		if (!objtype)
			return;
		var inst = objtype.getFirstPicked();
		if (inst != null)
			this.setTargetPos(inst.x, inst.y);
	};
	Acts.prototype.SetTargetPosByDeltaXY = function (dx, dy) {
		this.setTargetPos(this.inst.x + dx, this.inst.y + dy);
	};
	Acts.prototype.SetTargetPosByDistanceAngle = function (distance, angle) {
		var a = cr.to_clamped_radians(angle);
		var dx = distance * Math.cos(a);
		var dy = distance * Math.sin(a);
		this.setTargetPos(this.inst.x + dx, this.inst.y + dy);
	};
	Acts.prototype.Stop = function () {
		this.isMoving = false;
	};
	Acts.prototype.SetTargetPosOnUID = function (uid) {
		var inst = this.runtime.getObjectByUID(uid);
		if (inst != null)
			this.setTargetPos(inst.x, inst.y);
	};
	Acts.prototype.SetStopBySolid = function (en) {
		this.soildStopEnable = (en === 1);
	};

	function Exps() {
	};
	behaviorProto.exps = new Exps();
	Exps.prototype.Activated = function (ret) {
		ret.set_int((this.enabled) ? 1 : 0);
	};
	Exps.prototype.Speed = function (ret) {
		ret.set_float(this.currentSpeed);
	};
	Exps.prototype.MaxSpeed = function (ret) {
		ret.set_float(this.moveParams["max"]);
	};
	Exps.prototype.Acc = function (ret) {
		ret.set_float(this.moveParams["acc"]);
	};
	Exps.prototype.Dec = function (ret) {
		ret.set_float(this.moveParams["dec"]);
	};
	Exps.prototype.TargetX = function (ret) {
		ret.set_float(this.target["x"]);
	};
	Exps.prototype.TargetY = function (ret) {
		ret.set_float(this.target["y"]);
	};
	Exps.prototype.MovingAngle = function (ret) {
		ret.set_float(this.getMovingAngle());
	};
	Exps.prototype.MovingAngleStart = function (ret) {
		ret.set_float(this.movingAngleStartData["a"]);
	};
}());
cr.behaviors.Rex_RotateTo = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var behaviorProto = cr.behaviors.Rex_RotateTo.prototype;
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
		this.activated = (this.properties[0] == 1);
		this.move = {
			"max": this.properties[1],
			"acc": this.properties[2],
			"dec": this.properties[3]
		};
		this.target = {"a": 0, "cw": true};
		this.is_rotating = false;
		this.current_speed = 0;
		this.remain_distance = 0;
		this.is_my_call = false;
	};
	behinstProto.tick = function () {
		if ((!this.activated) || (!this.is_rotating)) {
			return;
		}
		var dt = this.runtime.getDt(this.inst);
		if (dt == 0)   // can not move if dt == 0
			return;
		var is_slow_down = false;
		if (this.move["dec"] != 0) {
			var _speed = this.current_speed;
			var _distance = (_speed * _speed) / (2 * this.move["dec"]); // (v*v)/(2*a)
			is_slow_down = (_distance >= this.remain_distance);
		}
		var acc = (is_slow_down) ? (-this.move["dec"]) : this.move["acc"];
		if (acc != 0) {
			this.SetCurrentSpeed(this.current_speed + (acc * dt));
		}
		var distance = this.current_speed * dt;
		this.remain_distance -= distance;
		var is_hit_target = false;
		if ((this.remain_distance <= 0) || (this.current_speed <= 0)) {
			this.is_rotating = false;
			this.inst.angle = cr.to_clamped_radians(this.target["a"]);
			this.SetCurrentSpeed(0);
			is_hit_target = true;
		}
		else {
			if (this.target["cw"])
				this.inst.angle += cr.to_clamped_radians(distance);
			else
				this.inst.angle -= cr.to_clamped_radians(distance);
		}
		this.inst.set_bbox_changed();
		if (is_hit_target) {
			this.is_my_call = true;
			this.runtime.trigger(cr.behaviors.Rex_RotateTo.prototype.cnds.OnHitTarget, this.inst);
			this.is_my_call = false;
		}
	};
	behinstProto.tick2 = function () {
	};
	behinstProto.SetCurrentSpeed = function (speed) {
		if (speed != null) {
			this.current_speed = (speed > this.move["max"]) ?
				this.move["max"] : speed;
		}
		else if (this.move["acc"] == 0) {
			this.current_speed = this.move["max"];
		}
	};
	behinstProto.SetTargetAngle = function (target_angle_radians, clockwise_mode)  // in radians
	{
		this.is_rotating = true;
		var cur_angle_radians = this.inst.angle;
		this.target["cw"] = (clockwise_mode == 2) ? cr.angleClockwise(target_angle_radians, cur_angle_radians) :
			(clockwise_mode == 1);
		var remain_distance = (clockwise_mode == 2) ? cr.angleDiff(cur_angle_radians, target_angle_radians) :
			(clockwise_mode == 1) ? (target_angle_radians - cur_angle_radians) :
				(cur_angle_radians - target_angle_radians);
		this.remain_distance = cr.to_clamped_degrees(remain_distance);
		this.target["a"] = cr.to_clamped_degrees(target_angle_radians);
		this.SetCurrentSpeed(null);
	};
	behinstProto.saveToJSON = function () {
		return {
			"en": this.activated,
			"v": this.move,
			"t": this.target,
			"ir": this.is_rotating,
			"cs": this.current_speed,
			"rd": this.remain_distance
		};
	};
	behinstProto.loadFromJSON = function (o) {
		this.activated = o["en"];
		this.move = o["v"];
		this.target = o["t"];
		this.is_rotating = o["ir"];
		this.current_speed = o["cs"];
		this.remain_distance = o["rd"];
	};

	function Cnds() {
	};
	behaviorProto.cnds = new Cnds();
	Cnds.prototype.OnHitTarget = function () {
		return (this.is_my_call);
	};
	Cnds.prototype.CompareSpeed = function (cmp, s) {
		return cr.do_cmp(this.current_speed, cmp, s);
	};
	Cnds.prototype.OnMoving = function ()  // deprecated
	{
		return false;
	};
	Cnds.prototype.IsRotating = function () {
		return (this.activated && this.is_rotating);
	};

	function Acts() {
	};
	behaviorProto.acts = new Acts();
	Acts.prototype.SetActivated = function (s) {
		this.activated = (s == 1);
	};
	Acts.prototype.SetMaxSpeed = function (s) {
		this.move["max"] = s;
		this.SetCurrentSpeed(null);
	};
	Acts.prototype.SetAcceleration = function (a) {
		this.move["acc"] = a;
		this.SetCurrentSpeed(null);
	};
	Acts.prototype.SetDeceleration = function (a) {
		this.move["dec"] = a;
	};
	Acts.prototype.SetTargetAngle = function (angle, clockwise_mode) {
		this.SetTargetAngle(cr.to_clamped_radians(angle), clockwise_mode)
	};
	Acts.prototype.SetCurrentSpeed = function (s) {
		this.SetCurrentSpeed(s);
	};
	Acts.prototype.SetTargetAngleOnObject = function (objtype, clockwise_mode) {
		if (!objtype)
			return;
		var inst = objtype.getFirstPicked();
		if (inst != null) {
			var angle = Math.atan2(inst.y - this.inst.y, inst.x - this.inst.x);
			this.SetTargetAngle(angle, clockwise_mode);
		}
	};
	Acts.prototype.SetTargetAngleByDeltaAngle = function (dA, clockwise_mode) {
		var dA_rad = cr.to_clamped_radians(dA);
		if (clockwise_mode == 0)
			dA_rad = -dA_rad;
		var angle = this.inst.angle + dA_rad;
		this.SetTargetAngle(angle, clockwise_mode);
	};
	Acts.prototype.SetTargetAngleToPos = function (tx, ty, clockwise_mode) {
		var angle = Math.atan2(ty - this.inst.y, tx - this.inst.x);
		this.SetTargetAngle(angle, clockwise_mode);
	};
	Acts.prototype.Stop = function () {
		this.is_rotating = false;
	};

	function Exps() {
	};
	behaviorProto.exps = new Exps();
	Exps.prototype.Activated = function (ret) {
		ret.set_int((this.activated) ? 1 : 0);
	};
	Exps.prototype.Speed = function (ret) {
		ret.set_float(this.current_speed);
	};
	Exps.prototype.MaxSpeed = function (ret) {
		ret.set_float(this.move["max"]);
	};
	Exps.prototype.Acc = function (ret) {
		ret.set_float(this.move["acc"]);
	};
	Exps.prototype.Dec = function (ret) {
		ret.set_float(this.move["dec"]);
	};
	Exps.prototype.TargetAngle = function (ret) {
		var x = (this.is_rotating) ? this.target["a"] : 0;
		ret.set_float(x);
	};
}())

cr.behaviors.Sin = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var behaviorProto = cr.behaviors.Sin.prototype;
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
		this.i = 0;		// period offset (radians)
	};
	var behinstProto = behaviorProto.Instance.prototype;
	var _2pi = 2 * Math.PI;
	var _pi_2 = Math.PI / 2;
	var _3pi_2 = (3 * Math.PI) / 2;
	behinstProto.onCreate = function () {
		this.active = (this.properties[0] === 1);
		this.movement = this.properties[1]; // 0=Horizontal|1=Vertical|2=Size|3=Width|4=Height|5=Angle|6=Opacity|7=Value only
		this.wave = this.properties[2];		// 0=Sine|1=Triangle|2=Sawtooth|3=Reverse sawtooth|4=Square
		this.period = this.properties[3];
		this.period += Math.random() * this.properties[4];								// period random
		if (this.period === 0)
			this.i = 0;
		else {
			this.i = (this.properties[5] / this.period) * _2pi;								// period offset
			this.i += ((Math.random() * this.properties[6]) / this.period) * _2pi;			// period offset random
		}
		this.mag = this.properties[7];													// magnitude
		this.mag += Math.random() * this.properties[8];									// magnitude random
		this.initialValue = 0;
		this.initialValue2 = 0;
		this.ratio = 0;
		this.init();
	};
	behinstProto.saveToJSON = function () {
		return {
			"i": this.i,
			"a": this.active,
			"mv": this.movement,
			"w": this.wave,
			"p": this.period,
			"mag": this.mag,
			"iv": this.initialValue,
			"iv2": this.initialValue2,
			"r": this.ratio,
			"lkv": this.lastKnownValue,
			"lkv2": this.lastKnownValue2
		};
	};
	behinstProto.loadFromJSON = function (o) {
		this.i = o["i"];
		this.active = o["a"];
		this.movement = o["mv"];
		this.wave = o["w"];
		this.period = o["p"];
		this.mag = o["mag"];
		this.initialValue = o["iv"];
		this.initialValue2 = o["iv2"] || 0;
		this.ratio = o["r"];
		this.lastKnownValue = o["lkv"];
		this.lastKnownValue2 = o["lkv2"] || 0;
	};
	behinstProto.init = function () {
		switch (this.movement) {
			case 0:		// horizontal
				this.initialValue = this.inst.x;
				break;
			case 1:		// vertical
				this.initialValue = this.inst.y;
				break;
			case 2:		// size
				this.initialValue = this.inst.width;
				this.ratio = this.inst.height / this.inst.width;
				break;
			case 3:		// width
				this.initialValue = this.inst.width;
				break;
			case 4:		// height
				this.initialValue = this.inst.height;
				break;
			case 5:		// angle
				this.initialValue = this.inst.angle;
				this.mag = cr.to_radians(this.mag);		// convert magnitude from degrees to radians
				break;
			case 6:		// opacity
				this.initialValue = this.inst.opacity;
				break;
			case 7:
				this.initialValue = 0;
				break;
			case 8:		// forwards/backwards
				this.initialValue = this.inst.x;
				this.initialValue2 = this.inst.y;
				break;
			default:
				;
		}
		this.lastKnownValue = this.initialValue;
		this.lastKnownValue2 = this.initialValue2;
	};
	behinstProto.waveFunc = function (x) {
		x = x % _2pi;
		switch (this.wave) {
			case 0:		// sine
				return Math.sin(x);
			case 1:		// triangle
				if (x <= _pi_2)
					return x / _pi_2;
				else if (x <= _3pi_2)
					return 1 - (2 * (x - _pi_2) / Math.PI);
				else
					return (x - _3pi_2) / _pi_2 - 1;
			case 2:		// sawtooth
				return 2 * x / _2pi - 1;
			case 3:		// reverse sawtooth
				return -2 * x / _2pi + 1;
			case 4:		// square
				return x < Math.PI ? -1 : 1;
		}
		;
		return 0;
	};
	behinstProto.tick = function () {
		var dt = this.runtime.getDt(this.inst);
		if (!this.active || dt === 0)
			return;
		if (this.period === 0)
			this.i = 0;
		else {
			this.i += (dt / this.period) * _2pi;
			this.i = this.i % _2pi;
		}
		this.updateFromPhase();
	};
	behinstProto.updateFromPhase = function () {
		switch (this.movement) {
			case 0:		// horizontal
				if (this.inst.x !== this.lastKnownValue)
					this.initialValue += this.inst.x - this.lastKnownValue;
				this.inst.x = this.initialValue + this.waveFunc(this.i) * this.mag;
				this.lastKnownValue = this.inst.x;
				break;
			case 1:		// vertical
				if (this.inst.y !== this.lastKnownValue)
					this.initialValue += this.inst.y - this.lastKnownValue;
				this.inst.y = this.initialValue + this.waveFunc(this.i) * this.mag;
				this.lastKnownValue = this.inst.y;
				break;
			case 2:		// size
				this.inst.width = this.initialValue + this.waveFunc(this.i) * this.mag;
				this.inst.height = this.inst.width * this.ratio;
				break;
			case 3:		// width
				this.inst.width = this.initialValue + this.waveFunc(this.i) * this.mag;
				break;
			case 4:		// height
				this.inst.height = this.initialValue + this.waveFunc(this.i) * this.mag;
				break;
			case 5:		// angle
				if (this.inst.angle !== this.lastKnownValue)
					this.initialValue = cr.clamp_angle(this.initialValue + (this.inst.angle - this.lastKnownValue));
				this.inst.angle = cr.clamp_angle(this.initialValue + this.waveFunc(this.i) * this.mag);
				this.lastKnownValue = this.inst.angle;
				break;
			case 6:		// opacity
				this.inst.opacity = this.initialValue + (this.waveFunc(this.i) * this.mag) / 100;
				if (this.inst.opacity < 0)
					this.inst.opacity = 0;
				else if (this.inst.opacity > 1)
					this.inst.opacity = 1;
				break;
			case 8:		// forwards/backwards
				if (this.inst.x !== this.lastKnownValue)
					this.initialValue += this.inst.x - this.lastKnownValue;
				if (this.inst.y !== this.lastKnownValue2)
					this.initialValue2 += this.inst.y - this.lastKnownValue2;
				this.inst.x = this.initialValue + Math.cos(this.inst.angle) * this.waveFunc(this.i) * this.mag;
				this.inst.y = this.initialValue2 + Math.sin(this.inst.angle) * this.waveFunc(this.i) * this.mag;
				this.lastKnownValue = this.inst.x;
				this.lastKnownValue2 = this.inst.y;
				break;
		}
		this.inst.set_bbox_changed();
	};
	behinstProto.onSpriteFrameChanged = function (prev_frame, next_frame) {
		switch (this.movement) {
			case 2:	// size
				this.initialValue *= (next_frame.width / prev_frame.width);
				this.ratio = next_frame.height / next_frame.width;
				break;
			case 3:	// width
				this.initialValue *= (next_frame.width / prev_frame.width);
				break;
			case 4:	// height
				this.initialValue *= (next_frame.height / prev_frame.height);
				break;
		}
	};

	function Cnds() {
	};
	Cnds.prototype.IsActive = function () {
		return this.active;
	};
	Cnds.prototype.CompareMovement = function (m) {
		return this.movement === m;
	};
	Cnds.prototype.ComparePeriod = function (cmp, v) {
		return cr.do_cmp(this.period, cmp, v);
	};
	Cnds.prototype.CompareMagnitude = function (cmp, v) {
		if (this.movement === 5)
			return cr.do_cmp(this.mag, cmp, cr.to_radians(v));
		else
			return cr.do_cmp(this.mag, cmp, v);
	};
	Cnds.prototype.CompareWave = function (w) {
		return this.wave === w;
	};
	behaviorProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.SetActive = function (a) {
		this.active = (a === 1);
	};
	Acts.prototype.SetPeriod = function (x) {
		this.period = x;
	};
	Acts.prototype.SetMagnitude = function (x) {
		this.mag = x;
		if (this.movement === 5)	// angle
			this.mag = cr.to_radians(this.mag);
	};
	Acts.prototype.SetMovement = function (m) {
		if (this.movement === 5)
			this.mag = cr.to_degrees(this.mag);
		this.movement = m;
		this.init();
	};
	Acts.prototype.SetWave = function (w) {
		this.wave = w;
	};
	Acts.prototype.SetPhase = function (x) {
		this.i = (x * _2pi) % _2pi;
		this.updateFromPhase();
	};
	Acts.prototype.UpdateInitialState = function () {
		this.init();
	};
	behaviorProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.CyclePosition = function (ret) {
		ret.set_float(this.i / _2pi);
	};
	Exps.prototype.Period = function (ret) {
		ret.set_float(this.period);
	};
	Exps.prototype.Magnitude = function (ret) {
		if (this.movement === 5)	// angle
			ret.set_float(cr.to_degrees(this.mag));
		else
			ret.set_float(this.mag);
	};
	Exps.prototype.Value = function (ret) {
		ret.set_float(this.waveFunc(this.i) * this.mag);
	};
	behaviorProto.exps = new Exps();
}());

cr.behaviors.Timer = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var behaviorProto = cr.behaviors.Timer.prototype;
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
		this.timers = {};
	};
	behinstProto.onDestroy = function () {
		cr.wipe(this.timers);
	};
	behinstProto.saveToJSON = function () {
		var o = {};
		var p, t;
		for (p in this.timers) {
			if (this.timers.hasOwnProperty(p)) {
				t = this.timers[p];
				o[p] = {
					"c": t.current.sum,
					"t": t.total.sum,
					"d": t.duration,
					"r": t.regular
				};
			}
		}
		return o;
	};
	behinstProto.loadFromJSON = function (o) {
		this.timers = {};
		var p;
		for (p in o) {
			if (o.hasOwnProperty(p)) {
				this.timers[p] = {
					current: new cr.KahanAdder(),
					total: new cr.KahanAdder(),
					duration: o[p]["d"],
					regular: o[p]["r"]
				};
				this.timers[p].current.sum = o[p]["c"];
				this.timers[p].total.sum = o[p]["t"];
			}
		}
	};
	behinstProto.tick = function () {
		var dt = this.runtime.getDt(this.inst);
		var p, t;
		for (p in this.timers) {
			if (this.timers.hasOwnProperty(p)) {
				t = this.timers[p];
				t.current.add(dt);
				t.total.add(dt);
			}
		}
	};
	behinstProto.tick2 = function () {
		var p, t;
		for (p in this.timers) {
			if (this.timers.hasOwnProperty(p)) {
				t = this.timers[p];
				if (t.current.sum >= t.duration) {
					if (t.regular)
						t.current.sum -= t.duration;
					else
						delete this.timers[p];
				}
			}
		}
	};

	function Cnds() {
	};
	Cnds.prototype.OnTimer = function (tag_) {
		tag_ = tag_.toLowerCase();
		var t = this.timers[tag_];
		if (!t)
			return false;
		return t.current.sum >= t.duration;
	};
	behaviorProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.StartTimer = function (duration_, type_, tag_) {
		this.timers[tag_.toLowerCase()] = {
			current: new cr.KahanAdder(),
			total: new cr.KahanAdder(),
			duration: duration_,
			regular: (type_ === 1)
		};
	};
	Acts.prototype.StopTimer = function (tag_) {
		tag_ = tag_.toLowerCase();
		if (this.timers.hasOwnProperty(tag_))
			delete this.timers[tag_];
	};
	behaviorProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.CurrentTime = function (ret, tag_) {
		var t = this.timers[tag_.toLowerCase()];
		ret.set_float(t ? t.current.sum : 0);
	};
	Exps.prototype.TotalTime = function (ret, tag_) {
		var t = this.timers[tag_.toLowerCase()];
		ret.set_float(t ? t.total.sum : 0);
	};
	Exps.prototype.Duration = function (ret, tag_) {
		var t = this.timers[tag_.toLowerCase()];
		ret.set_float(t ? t.duration : 0);
	};
	behaviorProto.exps = new Exps();
}());

function trim (str) {
	return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}
cr.behaviors.lunarray_Tween = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var behaviorProto = cr.behaviors.lunarray_Tween.prototype;
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
		this.i = 0;		// progress
	};
	var behinstProto = behaviorProto.Instance.prototype;
	behinstProto.groupUpdateProgress = function (v) {
		if (v > 1) v = 1;
		if (cr.lunarray_tweenProgress[this.group] = -1) cr.lunarray_tweenProgress[this.group] = v;
		if (cr.lunarray_tweenProgress[this.group] >= v) cr.lunarray_tweenProgress[this.group] = v;
	}
	behinstProto.groupSync = function () {
		if (this.group != "") {
			if (typeof cr.lunarray_tweenGroup === "undefined") {
				cr.lunarray_tweenGroup = {};
				cr.lunarray_tweenProgress = {};
			}
			if (typeof cr.lunarray_tweenGroup[this.group] === "undefined") {
				cr.lunarray_tweenGroup[this.group] = [];
				cr.lunarray_tweenProgress[this.group] = -1;
			}
			if (cr.lunarray_tweenGroup[this.group].indexOf(this) == -1) {
				cr.lunarray_tweenGroup[this.group].push(this);
			}
		}
	}
	behinstProto.saveState = function () {
		this.tweenSaveWidth = this.inst.width;
		this.tweenSaveHeight = this.inst.height;
		this.tweenSaveAngle = this.inst.angle;
		this.tweenSaveOpacity = this.inst.opacity;
		this.tweenSaveX = this.inst.x;
		this.tweenSaveY = this.inst.y;
		this.tweenSaveValue = this.value;
	}
	behinstProto.onCreate = function () {
		this.active = (this.properties[0] === 1);
		this.tweened = this.properties[1]; // 0=Position|1=Size|2=Width|3=Height|4=Angle|5=Opacity|6=Value only|7=Pixel Size
		this.easing = this.properties[2];
		this.initial = this.properties[3];
		this.target = this.properties[4];
		this.duration = this.properties[5];
		this.wait = this.properties[6];
		this.playmode = this.properties[7]; //0=Play Once|1=Repeat|2=Ping Pong|3=Play once and destroy|4=Loop|5=Ping Pong Stop|6=Play and stop
		this.value = this.properties[8];
		this.coord_mode = this.properties[9]; //0=Absolute|1=Relative
		this.forceInit = (this.properties[10] === 1);
		this.group = this.properties[11];
		this.targetObject = null;
		this.pingpongCounter = 0;
		if (this.playmode == 5) this.pingpongCounter = 1;
		this.groupSync();
		this.isPaused = false;
		this.initialX = this.inst.x;
		this.initialY = this.inst.y;
		this.targetX = parseFloat(this.target.split(",")[0]);
		this.targetY = parseFloat(this.target.split(",")[1]);
		this.saveState();
		this.tweenInitialX = 0;
		this.tweenInitialY = 0;
		this.tweenTargetX = 0;
		this.tweenTargetY = 0;
		this.tweenTargetAngle = 0;
		this.ratio = this.inst.height / this.inst.width;
		this.reverse = false;
		this.rewindMode = false;
		this.doTweenX = true;
		this.doTweenY = true;
		this.loop = false;
		this.initiating = 0;
		this.cooldown = 0;
		this.lastPlayMode = this.playmode;
		this.lastKnownValue = this.tweenInitialX;
		this.lastKnownX = this.tweenInitialX;
		this.lastKnownY = this.tweenInitialY;
		if (this.forceInit) this.init();
		if (this.initial == "") this.initial = "current";
		this.onStarted = false;
		this.onStartedDone = false;
		this.onWaitEnd = false;
		this.onWaitEndDone = false;
		this.onEnd = false;
		this.onEndDone = false;
		this.onCooldown = false;
		this.onCooldownDone = false;
		if (this.active) {
			this.init();
		}
	};
	behinstProto.init = function () {
		this.onStarted = false;
		if (this.initial === "") this.initial = "current";
		if (this.target === "") this.target = "current";
		var isCurrent = (this.initial === "current");
		var targetIsCurrent = (this.target === "current");
		var isTargettingObject = (this.target === "OBJ");
		if (this.target === "OBJ") {
			if (this.targetObject != null) {
				if (this.tweened == 0) {
					if (this.coord_mode == 1) //relative mode
						this.target = (this.targetObject.x - this.inst.x) + "," + (this.targetObject.y - this.inst.y);
					else //absolute mode
						this.target = (this.targetObject.x) + "," + (this.targetObject.y);
				} else if ((this.tweened == 1) || (this.tweened == 2) || (this.tweened == 3) || (this.tweened == 7)) {
					if (this.coord_mode == 1) { //relative mode
						this.target = ((this.tweened == 2) ? 1 : (this.targetObject.width)) + "," + ((this.tweened == 3) ? 1 : (this.targetObject.height));
					} else {
						this.target = ((this.tweened == 2) ? 1 : (this.targetObject.width / this.tweenSaveWidth)) + "," + ((this.tweened == 3) ? 1 : (this.targetObject.height / this.tweenSaveHeight));
					}
				} else if (this.tweened == 4) {
					if (this.coord_mode == 1) //relative mode
						this.target = cr.to_degrees(this.targetObject.angle - this.inst.angle) + "";
					else //absolute mode
						this.target = cr.to_degrees(this.targetObject.angle) + "";
				} else if (this.tweened == 5) {
					if (this.coord_mode == 1) //relative mode
						this.target = ((this.targetObject.opacity - this.inst.opacity) * 100) + "";
					else //absolute mode
						this.target = (this.targetObject.opacity * 100) + "";
				}
			}
		}
		if (this.tweened == 0) {
			if (targetIsCurrent) this.target = this.inst.x + "," + this.inst.y;
			if (!isCurrent) {
				if (!this.reverse) {
					if (this.playmode != 1) {
						this.inst.x = parseFloat(this.initial.split(",")[0]);
						this.inst.y = parseFloat(this.initial.split(",")[1]);
					}
				}
			} else {
				if (this.coord_mode == 1) {
					this.initial = this.inst.x + "," + this.inst.y;
				} else {
					this.initial = this.tweenSaveX + "," + this.tweenSaveY;
				}
			}
			if (this.coord_mode == 1) {
				if (this.loop) {
					this.inst.x = this.tweenSaveX;
					this.inst.y = this.tweenSaveY;
				}
				this.initialX = this.inst.x;
				this.initialY = this.inst.y;
				if (!this.reverse) {
					this.targetX = parseFloat(this.target.split(",")[0]);
					this.targetY = parseFloat(this.target.split(",")[1]);
				} else {
					this.targetX = -parseFloat(this.target.split(",")[0]);
					this.targetY = -parseFloat(this.target.split(",")[1]);
				}
				this.tweenInitialX = this.initialX;
				this.tweenInitialY = this.initialY;
				this.tweenTargetX = this.tweenInitialX + this.targetX;
				this.tweenTargetY = this.tweenInitialY + this.targetY;
			} else {
				if (!this.reverse) {
					this.inst.x = this.tweenSaveX;
					this.inst.y = this.tweenSaveY;
					this.targetX = parseFloat(this.target.split(",")[0]);
					this.targetY = parseFloat(this.target.split(",")[1]);
				} else {
					this.inst.x = parseFloat(this.target.split(",")[0]);
					this.inst.y = parseFloat(this.target.split(",")[1]);
					this.targetX = this.tweenSaveX;
					this.targetY = this.tweenSaveY;
				}
				this.initialX = this.inst.x;
				this.initialY = this.inst.y;
				this.tweenInitialX = this.initialX;
				this.tweenInitialY = this.initialY;
				this.tweenTargetX = this.targetX;
				this.tweenTargetY = this.targetY;
				if (this.playmode == -6) {
					this.tweenTargetX = this.tweenSaveX;
					this.tweenTargetY = this.tweenSaveY;
				}
			}
		} else if ((this.tweened == 1) || (this.tweened == 2) || (this.tweened == 3)) {
			if (targetIsCurrent) this.target = "1,1";
			if (this.initial == "current") this.initial = "1,1";
			this.initial = "" + this.initial;
			this.target = "" + this.target;
			if (this.tweened == 2) {
				if (this.initial.indexOf(',') == -1) this.initial = parseFloat(this.initial) + ",1";
				if (this.target.indexOf(',') == -1) this.target = parseFloat(this.target) + ",1";
			} else if (this.tweened == 3) {
				if (this.initial.indexOf(',') == -1) this.initial = "1," + parseFloat(this.initial);
				if (this.target.indexOf(',') == -1) this.target = "1," + parseFloat(this.target);
			} else {
				if (this.initial.indexOf(',') == -1) this.initial = parseFloat(this.initial) + "," + parseFloat(this.initial);
				if (this.target.indexOf(',') == -1) this.target = parseFloat(this.target) + "," + parseFloat(this.target);
			}
			var ix = parseFloat(this.initial.split(",")[0]);
			var iy = parseFloat(this.initial.split(",")[1]);
			this.doTweenX = true;
			var tx = parseFloat(this.target.split(",")[0]);
			if ((tx == 0) || (isNaN(tx))) this.doTweenX = false;
			if (this.tweened == 3) this.doTweenX = false;
			this.doTweenY = true;
			var ty = parseFloat(this.target.split(",")[1]);
			if ((ty == 0) || (isNaN(ty))) this.doTweenY = false;
			if (this.tweened == 2) this.doTweenY = false;
			if (this.coord_mode == 1) {
				if (this.loop) {
					this.inst.width = this.tweenSaveWidth;
					this.inst.height = this.tweenSaveHeight;
				}
				if (!isCurrent) {
					if (!this.reverse) {
						this.inst.width = this.inst.width * ix;
						this.inst.height = this.inst.height * iy;
					} else {
						this.inst.width = this.inst.width * tx;
						this.inst.height = this.inst.height * ty;
					}
				}
				this.initialX = this.inst.width;
				this.initialY = this.inst.height;
				this.tweenInitialX = this.initialX;
				this.tweenInitialY = this.initialY;
				if (!this.reverse) {
					this.targetX = this.initialX * tx;
					this.targetY = this.initialY * ty;
				} else {
					this.targetX = this.initialX * ix / tx;
					this.targetY = this.initialY * iy / ty;
				}
				this.tweenTargetX = this.targetX;
				this.tweenTargetY = this.targetY;
			} else {
				if (!isCurrent) {
					if (!this.reverse) {
						this.inst.width = this.tweenSaveWidth * ix;
						this.inst.height = this.tweenSaveHeight * iy;
					} else {
						this.inst.width = this.tweenSaveWidth * tx;
						this.inst.height = this.tweenSaveHeight * ty;
					}
				}
				this.initialX = this.inst.width;
				this.initialY = this.inst.height;
				this.tweenInitialX = this.initialX;
				this.tweenInitialY = this.initialY;
				if (!this.reverse) {
					this.targetX = this.tweenSaveWidth * tx;
					this.targetY = this.tweenSaveHeight * ty;
				} else {
					this.targetX = this.tweenSaveWidth * ix;
					this.targetY = this.tweenSaveHeight * iy;
				}
				this.tweenTargetX = this.targetX;
				this.tweenTargetY = this.targetY;
			}
			if (this.playmode == -6) {
				this.tweenTargetX = this.tweenSaveWidth * ix;
				this.tweenTargetY = this.tweenSaveHeight * iy;
			}
		} else if (this.tweened == 4) {
			if (targetIsCurrent) this.target = cr.to_degrees(this.inst.angle);
			if (this.initial != "current") {
				if (!this.reverse) {
					if (this.playmode != 1) { //if repeat, don't initialize
						this.inst.angle = cr.to_radians(parseFloat(this.initial.split(",")[0]));
					}
				}
			}
			if (this.coord_mode == 1) {
				if (this.loop) {
					this.inst.angle = this.tweenSaveAngle;
				}
				this.initialX = this.inst.angle;
				if (this.reverse) {
					this.targetX = this.inst.angle - cr.to_radians(parseFloat(this.target.split(",")[0]));
				} else {
					this.targetX = this.inst.angle + cr.to_radians(parseFloat(this.target.split(",")[0]));
				}
				this.tweenInitialX = this.initialX;
				this.tweenTargetX = cr.to_degrees(this.targetX);
			} else {
				if (this.reverse) {
					this.inst.angle = cr.to_radians(parseFloat(this.target.split(",")[0]));
					;
					this.initialX = this.inst.angle;
					this.targetX = this.tweenSaveAngle;
					this.tweenInitialX = this.initialX;
					this.tweenTargetX = cr.to_degrees(this.targetX);
				} else {
					this.inst.angle = this.tweenSaveAngle;
					this.initialX = this.inst.angle;
					this.targetX = cr.to_radians(parseFloat(this.target.split(",")[0]));
					this.tweenInitialX = this.initialX;
					this.tweenTargetX = cr.to_degrees(this.targetX);
				}
			}
			if (this.playmode == -6) {
				this.tweenTargetX = cr.to_degrees(this.tweenSaveAngle);
			}
			this.tweenTargetAngle = cr.to_radians(this.tweenTargetX);
		} else if (this.tweened == 5) {
			if (this.initial == "current") this.initial = this.inst.opacity;
			if (targetIsCurrent) this.target = "" + this.inst.opacity;
			if (!isCurrent) {
				if (!this.reverse) {
					if (this.playmode != 1) { //if repeat, don't initialize
						this.inst.opacity = parseFloat(this.initial.split(",")[0]) / 100;
					}
				}
			}
			if (this.coord_mode == 1) {
				if (this.loop) {
					this.inst.opacity = this.tweenSaveOpacity;
				}
				this.initialX = this.inst.opacity;
				this.tweenInitialX = this.initialX;
				if (!this.reverse) {
					this.targetX = parseFloat(this.target.split(",")[0]) / 100;
				} else {
					this.targetX = -parseFloat(this.target.split(",")[0]) / 100;
				}
				this.tweenTargetX = this.tweenInitialX + this.targetX;
			} else {
				this.initialX = this.inst.opacity;
				if (!this.reverse) {
					this.tweenInitialX = this.initialX;
					this.targetX = parseFloat(this.target.split(",")[0]) / 100;
				} else {
					this.tweenInitialX = parseFloat(this.target.split(",")[0]) / 100;
					this.targetX = parseFloat(this.initial.split(",")[0]) / 100;
				}
				this.tweenTargetX = this.targetX;
			}
			if (this.playmode == -6) {
				this.tweenTargetX = this.tweenSaveOpacity;
			}
		} else if (this.tweened == 6) {
			if (isNaN(this.value)) this.value = 0;
			if (this.initial == "current") this.initial = "" + this.value;
			if (targetIsCurrent) this.target = "" + this.value;
			if (!isCurrent) {
				if (!this.reverse) {
					if (this.playmode != 1) { //if repeat, don't initialize
						this.value = parseFloat(this.initial.split(",")[0]);
					}
				}
			}
			if (this.coord_mode == 1) {
				if (this.loop) {
					this.value = this.tweenSaveValue;
				}
				if (!isCurrent) {
					if (!this.reverse) {
						this.value = parseFloat(this.initial.split(",")[0]);
					} else {
						this.value = parseFloat(this.target.split(",")[0]);
					}
				}
				this.initialX = this.value;
				if (!this.reverse) {
					this.targetX = this.initialX + parseFloat(this.target.split(",")[0]);
				} else {
					this.targetX = this.initialX - parseFloat(this.target.split(",")[0]);
				}
				this.tweenInitialX = this.initialX;
				this.tweenTargetX = this.targetX;
			} else {
				if (!isCurrent) {
					if (!this.reverse) {
						this.value = parseFloat(this.initial.split(",")[0]);
					} else {
						this.value = parseFloat(this.target.split(",")[0]);
					}
				}
				this.initialX = this.value;
				if (!this.reverse) {
					this.targetX = parseFloat(this.target.split(",")[0]);
				} else {
					this.targetX = parseFloat(this.initial.split(",")[0]);
				}
				this.tweenInitialX = this.initialX;
				this.tweenTargetX = this.targetX;
			}
			if (this.playmode == -6) {
				this.tweenTargetX = this.tweenSaveValue;
			}
		} else if (this.tweened == 7) {
			if (targetIsCurrent) this.target = this.inst.width + "," + this.inst.height;
			if (this.initial != "current") {
				if (!this.reverse) {
					if (this.playmode != 1) { //if repeat, don't initialize
						this.inst.width = parseFloat(this.initial.split(",")[0]);
						this.inst.height = parseFloat(this.initial.split(",")[1]);
					}
				}
			}
			this.doTweenX = true;
			var tx = parseFloat(this.target.split(",")[0]);
			if ((tx < 0) || (isNaN(tx))) this.doTweenX = false;
			this.doTweenY = true;
			var ty = parseFloat(this.target.split(",")[1]);
			if ((ty < 0) || (isNaN(ty))) this.doTweenY = false;
			if (this.coord_mode == 1) {
				if (this.loop) {
					this.inst.width = this.tweenSaveWidth;
					this.inst.height = this.tweenSaveHeight;
				}
				this.initialX = this.inst.width;
				this.initialY = this.inst.height;
				if (!this.reverse) {
					this.targetX = this.initialX + parseFloat(this.target.split(",")[0]);
					this.targetY = this.initialY + parseFloat(this.target.split(",")[1]);
				} else {
					this.targetX = this.initialX - parseFloat(this.target.split(",")[0]);
					this.targetY = this.initialY - parseFloat(this.target.split(",")[1]);
				}
				this.tweenInitialX = this.initialX;
				this.tweenInitialY = this.initialY;
				this.tweenTargetX = this.targetX;
				this.tweenTargetY = this.targetY;
			} else {
				if (!isCurrent) {
					if (!this.reverse) {
						this.inst.width = this.tweenSaveWidth;
						this.inst.height = this.tweenSaveHeight;
					} else {
						this.inst.width = parseFloat(this.target.split(",")[0]);
						this.inst.height = parseFloat(this.target.split(",")[1]);
					}
				}
				this.initialX = this.inst.width;
				this.initialY = this.inst.height;
				if (!this.reverse) {
					this.targetX = parseFloat(this.target.split(",")[0]);
					this.targetY = parseFloat(this.target.split(",")[1]);
				} else {
					this.targetX = this.tweenSaveWidth;
					this.targetY = this.tweenSaveHeight;
				}
				this.tweenInitialX = this.initialX;
				this.tweenInitialY = this.initialY;
				this.tweenTargetX = this.targetX;
				this.tweenTargetY = this.targetY;
			}
			if (this.playmode == -6) {
				this.tweenTargetX = this.tweenSaveWidth;
				this.tweenTargetY = this.tweenSaveHeight;
			}
		} else {
			;
		}
		this.lastKnownValue = this.tweenInitialX;
		this.lastKnownX = this.tweenInitialX;
		this.lastKnownY = this.tweenInitialY;
		this.initiating = parseFloat(this.wait.split(",")[0]);
		this.cooldown = parseFloat(this.wait.split(",")[1]);
		if ((this.initiating < 0) || (isNaN(this.initiating))) this.initiating = 0;
		if ((this.cooldown < 0) || (isNaN(this.cooldown))) this.cooldown = 0;
		if (isCurrent) this.initial = "current";
		if (targetIsCurrent) this.target = "current";
		if (isTargettingObject) this.target = "OBJ";
	};

	function easeOutBounce(t, b, c, d) {
		if ((t /= d) < (1 / 2.75)) {
			return c * (7.5625 * t * t) + b;
		} else if (t < (2 / 2.75)) {
			return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
		} else if (t < (2.5 / 2.75)) {
			return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
		} else {
			return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
		}
	}

	behinstProto.easeFunc = function (t, b, c, d) {
		switch (this.easing) {
			case 0:		// linear
				return c * t / d + b;
			case 1:		// easeInQuad
				return c * (t /= d) * t + b;
			case 2:		// easeOutQuad
				return -c * (t /= d) * (t - 2) + b;
			case 3:		// easeInOutQuad
				if ((t /= d / 2) < 1) return c / 2 * t * t + b;
				return -c / 2 * ((--t) * (t - 2) - 1) + b;
			case 4:		// easeInCubic
				return c * (t /= d) * t * t + b;
			case 5:		// easeOutCubic
				return c * ((t = t / d - 1) * t * t + 1) + b;
			case 6:		// easeInOutCubic
				if ((t /= d / 2) < 1)
					return c / 2 * t * t * t + b;
				return c / 2 * ((t -= 2) * t * t + 2) + b;
			case 7:		// easeInQuart
				return c * (t /= d) * t * t * t + b;
			case 8:		// easeOutQuart
				return -c * ((t = t / d - 1) * t * t * t - 1) + b;
			case 9:		// easeInOutQuart
				if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
				return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
			case 10:		// easeInQuint
				return c * (t /= d) * t * t * t * t + b;
			case 11:		// easeOutQuint
				return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
			case 12:		// easeInOutQuint
				if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
				return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
			case 13:		// easeInCircle
				return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
			case 14:		// easeOutCircle
				return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
			case 15:		// easeInOutCircle
				if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
				return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
			case 16:		// easeInBack
				var s = 0;
				if (s == 0) s = 1.70158;
				return c * (t /= d) * t * ((s + 1) * t - s) + b;
			case 17:		// easeOutBack
				var s = 0;
				if (s == 0) s = 1.70158;
				return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
			case 18:		// easeInOutBack
				var s = 0;
				if (s == 0) s = 1.70158;
				if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
				return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
			case 19:	//easeInElastic
				var a = 0;
				var p = 0;
				if (t == 0) return b;
				if ((t /= d) == 1) return b + c;
				if (p == 0) p = d * .3;
				if (a == 0 || a < Math.abs(c)) {
					a = c;
					var s = p / 4;
				}
				else var s = p / (2 * Math.PI) * Math.asin(c / a);
				return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
			case 20:	//easeOutElastic
				var a = 0;
				var p = 0;
				if (t == 0) return b;
				if ((t /= d) == 1) return b + c;
				if (p == 0) p = d * .3;
				if (a == 0 || a < Math.abs(c)) {
					a = c;
					var s = p / 4;
				}
				else var s = p / (2 * Math.PI) * Math.asin(c / a);
				return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
			case 21:	//easeInOutElastic
				var a = 0;
				var p = 0;
				if (t == 0) return b;
				if ((t /= d / 2) == 2) return b + c;
				if (p == 0) p = d * (.3 * 1.5);
				if (a == 0 || a < Math.abs(c)) {
					a = c;
					var s = p / 4;
				}
				else var s = p / (2 * Math.PI) * Math.asin(c / a);
				if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
				return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
			case 22:	//easeInBounce
				return c - easeOutBounce(d - t, 0, c, d) + b;
			case 23:	//easeOutBounce
				return easeOutBounce(t, b, c, d);
			case 24:	//easeInOutBounce
				if (t < d / 2) return (c - easeOutBounce(d - (t * 2), 0, c, d) + b) * 0.5 + b;
				else return easeOutBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
			case 25:	//easeInSmoothstep
				var mt = (t / d) / 2;
				return (2 * (mt * mt * (3 - 2 * mt)));
			case 26:	//easeOutSmoothstep
				var mt = ((t / d) + 1) / 2;
				return ((2 * (mt * mt * (3 - 2 * mt))) - 1);
			case 27:	//easeInOutSmoothstep
				var mt = (t / d);
				return (mt * mt * (3 - 2 * mt));
		}
		;
		return 0;
	};
	behinstProto.saveToJSON = function () {
		return {
			"i": this.i,
			"active": this.active,
			"tweened": this.tweened,
			"easing": this.easing,
			"initial": this.initial,
			"target": this.target,
			"duration": this.duration,
			"wait": this.wait,
			"playmode": this.playmode,
			"value": this.value,
			"coord_mode": this.coord_mode,
			"forceInit": this.forceInit,
			"group": this.group,
			"targetObject": this.targetObject,
			"pingpongCounter": this.pingpongCounter,
			"isPaused": this.isPaused,
			"initialX": this.initialX,
			"initialY": this.initialY,
			"targetX": this.targetX,
			"targetY": this.targetY,
			"tweenSaveWidth": this.tweenSaveWidth,
			"tweenSaveHeight": this.tweenSaveHeight,
			"tweenSaveAngle": this.tweenSaveAngle,
			"tweenSaveX": this.tweenSaveX,
			"tweenSaveY": this.tweenSaveY,
			"tweenSaveValue": this.tweenSaveValue,
			"tweenInitialX": this.tweenInitialX,
			"tweenInitialY": this.tweenInitialY,
			"tweenTargetX": this.tweenTargetX,
			"tweenTargetY": this.tweenTargetY,
			"tweenTargetAngle": this.tweenTargetAngle,
			"ratio": this.ratio,
			"reverse": this.reverse,
			"rewindMode": this.rewindMode,
			"doTweenX": this.doTweenX,
			"doTweenY": this.doTweenY,
			"loop": this.loop,
			"initiating": this.initiating,
			"cooldown": this.cooldown,
			"lastPlayMode": this.lastPlayMode,
			"lastKnownValue": this.lastKnownValue,
			"lastKnownX": this.lastKnownX,
			"lastKnownY": this.lastKnownY,
			"onStarted": this.onStarted,
			"onStartedDone": this.onStartedDone,
			"onWaitEnd": this.onWaitEnd,
			"onWaitEndDone": this.onWaitEndDone,
			"onEnd": this.onEnd,
			"onEndDone": this.onEndDone,
			"onCooldown": this.onCooldown,
			"onCooldownDone": this.onCooldownDone
		};
	};
	behinstProto.loadFromJSON = function (o) {
		this.i = o["i"];
		this.active = o["active"];
		this.tweened = o["tweened"];
		this.easing = o["easing"];
		this.initial = o["initial"];
		this.target = o["target"];
		this.duration = o["duration"];
		this.wait = o["wait"];
		this.playmode = o["playmode"];
		this.value = o["value"];
		this.coord_mode = o["coord_mode"];
		this.forceInit = o["forceInit"];
		this.group = o["group"];
		this.targetObject = o["targetObject"];
		this.pingpongCounter = o["pingpongCounter"];
		this.isPaused = o["isPaused"];
		this.initialX = o["initialX"];
		this.initialY = o["initialY"];
		this.targetX = o["targetX"];
		this.targetY = o["targetY"];
		this.tweenSaveWidth = o["tweenSaveWidth"];
		this.tweenSaveHeight = o["tweenSaveHeight"];
		this.tweenSaveAngle = o["tweenSaveAngle"];
		this.tweenSaveX = o["tweenSaveX"];
		this.tweenSaveY = o["tweenSaveY"];
		this.tweenSaveValue = o["tweenSaveValue"];
		this.tweenInitialX = o["tweenInitialX"];
		this.tweenInitialY = o["tweenInitialY"];
		this.tweenTargetX = o["tweenTargetX"];
		this.tweenTargetY = o["tweenTargetY"];
		this.tweenTargetAngle = o["tweenTargetAngle"];
		this.ratio = o["ratio"];
		this.reverse = o["reverse"];
		this.rewindMode = o["rewindMode"];
		this.doTweenX = o["doTweenX"];
		this.doTweenY = o["doTweenY"];
		this.loop = o["loop"];
		this.initiating = o["initiating"];
		this.cooldown = o["cooldown"];
		this.lastPlayMode = o["lastPlayMode"];
		this.lastKnownValue = o["lastKnownValue"];
		this.lastKnownX = o["lastKnownX"];
		this.lastKnownY = o["lastKnownY"];
		this.onStarted = o["onStarted"];
		this.onStartedDone = o["onStartedDone"];
		this.onWaitEnd = o["onWaitEnd"];
		this.onWaitEndDone = o["onWaitEndDone"]
		this.onEnd = o["onEnd"];
		this.onEndDone = o["onEndDone"];
		this.onCooldown = o["onCooldown"];
		this.onCooldownDone = o["onCooldownDone"];
		this.groupSync();
	};
	behinstProto.tick = function () {
		var dt = this.runtime.getDt(this.inst);
		var isForceStop = (this.i == -1);
		if (!this.active || dt === 0)
			return;
		if (this.i == 0) {
			if (!this.onStarted) {
				this.onStarted = true;
				this.onStartedDone = false;
				this.onWaitEnd = false;
				this.onWaitEndDone = false;
				this.onEnd = false;
				this.onEndDone = false;
				this.onCooldown = false;
				this.onCooldownDone = false;
				this.runtime.trigger(cr.behaviors.lunarray_Tween.prototype.cnds.OnStart, this.inst);
				this.onStartedDone = true;
			}
		}
		if (this.i == -1) {
			this.i = this.initiating + this.duration + this.cooldown;
		} else {
			this.i += dt;
		}
		if (this.i <= this.initiating) {
			return;
		} else {
			if (this.onWaitEnd == false) {
				this.onWaitEnd = true;
				this.runtime.trigger(cr.behaviors.lunarray_Tween.prototype.cnds.OnWaitEnd, this.inst);
				this.onWaitEndDone = true;
			}
		}
		if (this.i <= (this.duration + this.initiating)) {
			var factor = this.easeFunc(this.i - this.initiating, 0, 1, this.duration);
			if (this.tweened == 0) {
				if (this.coord_mode == 1) {
					if (this.inst.x !== this.lastKnownX) {
						this.tweenInitialX += (this.inst.x - this.lastKnownX);
						this.tweenTargetX += (this.inst.x - this.lastKnownX);
					}
					if (this.inst.y !== this.lastKnownY) {
						this.tweenInitialY += (this.inst.y - this.lastKnownY);
						this.tweenTargetY += (this.inst.y - this.lastKnownY);
					}
				} else {
					if (this.inst.x !== this.lastKnownX)
						this.tweenInitialX += (this.inst.x - this.lastKnownX);
					if (this.inst.y !== this.lastKnownY)
						this.tweenInitialY += (this.inst.y - this.lastKnownY);
				}
				this.inst.x = this.tweenInitialX + (this.tweenTargetX - this.tweenInitialX) * factor;
				this.inst.y = this.tweenInitialY + (this.tweenTargetY - this.tweenInitialY) * factor;
				this.lastKnownX = this.inst.x;
				this.lastKnownY = this.inst.y;
			} else if ((this.tweened == 1) || (this.tweened == 2) || (this.tweened == 3)) {
				if (this.inst.width !== this.lastKnownX)
					this.tweenInitialX = this.inst.width;
				if (this.inst.height !== this.lastKnownY)
					this.tweenInitialY = this.inst.height;
				if (this.doTweenX) {
					this.inst.width = this.tweenInitialX + (this.tweenTargetX - this.tweenInitialX) * factor;
				}
				if (this.doTweenY) {
					this.inst.height = this.tweenInitialY + (this.tweenTargetY - this.tweenInitialY) * factor;
				} else {
					if (this.tweened == 1) {
						this.inst.height = this.inst.width * this.ratio;
					}
				}
				this.lastKnownX = this.inst.width;
				this.lastKnownY = this.inst.height;
			} else if (this.tweened == 4) {
				var tangle = this.tweenInitialX + (this.tweenTargetAngle - this.tweenInitialX) * factor;
				if (this.i >= (this.duration + this.initiating))
					tangle = this.tweenTargetAngle;
				this.inst.angle = cr.clamp_angle(tangle);
			} else if (this.tweened == 5) {
				if (this.coord_mode == 1) {
					if (this.inst.opacity !== this.lastKnownX)
						this.tweenInitialX = this.inst.opacity;
				}
				this.inst.opacity = this.tweenInitialX + (this.tweenTargetX - this.tweenInitialX) * factor;
				this.lastKnownX = this.inst.opacity;
			} else if (this.tweened == 6) {
				this.value = this.tweenInitialX + (this.tweenTargetX - this.tweenInitialX) * factor;
			} else if (this.tweened == 7) {
				if (this.coord_mode == 1) {
					if (this.inst.width !== this.lastKnownX)
						this.tweenInitialX = this.inst.width;
					if (this.inst.height !== this.lastKnownY)
						this.tweenInitialY = this.inst.height;
				}
				if (this.doTweenX) this.inst.width = this.tweenInitialX + (this.tweenTargetX - this.tweenInitialX) * factor;
				if (this.doTweenY) this.inst.height = this.tweenInitialY + (this.tweenTargetY - this.tweenInitialY) * factor;
				this.lastKnownX = this.inst.width;
				this.lastKnownY = this.inst.height;
			}
			this.inst.set_bbox_changed();
		}
		if (this.i >= this.duration + this.initiating) {
			this.doEndFrame(isForceStop);
			this.inst.set_bbox_changed();
			if (this.onEnd == false) {
				this.onEnd = true;
				this.runtime.trigger(cr.behaviors.lunarray_Tween.prototype.cnds.OnEnd, this.inst);
				this.onEndDone = true;
			}
		}
		;
	};
	behinstProto.doEndFrame = function (isForceStop) {
		switch (this.tweened) {
			case 0:		// position
				this.inst.x = this.tweenTargetX;
				this.inst.y = this.tweenTargetY;
				break;
			case 1:		// size
				if (this.doTweenX) this.inst.width = this.tweenTargetX;
				if (this.doTweenY) {
					this.inst.height = this.tweenTargetY;
				} else {
					this.inst.height = this.inst.width * this.ratio;
				}
				break;
			case 2:		// width
				this.inst.width = this.tweenTargetX;
				break;
			case 3:		// height
				this.inst.height = this.tweenTargetY;
				break;
			case 4:		// angle
				var tangle = this.tweenTargetAngle;
				this.inst.angle = cr.clamp_angle(tangle);
				this.lastKnownValue = this.inst.angle;
				break;
			case 5:		// opacity
				this.inst.opacity = this.tweenTargetX;
				break;
			case 6:		// value
				this.value = this.tweenTargetX;
				break;
			case 7:		// size
				if (this.doTweenX) this.inst.width = this.tweenTargetX;
				if (this.doTweenY) this.inst.height = this.tweenTargetY;
				break;
		}
		if (this.i >= this.duration + this.initiating + this.cooldown) {
			if (this.playmode == 0) {
				this.active = false;
				this.reverse = false;
				this.i = this.duration + this.initiating + this.cooldown;
			} else if (this.playmode == 1) {
				this.i = 0;
				this.init();
				this.active = true;
			} else if (this.playmode == 2) {
				if (isForceStop) {
					this.reverse = false;
					this.init();
				} else {
					this.reverse = !this.reverse;
					this.i = 0;
					this.init();
					this.active = true;
				}
			} else if (this.playmode == 3) {
				this.runtime.DestroyInstance(this.inst);
			} else if (this.playmode == 4) {
				this.loop = true;
				this.i = 0;
				this.init();
				this.active = true;
			} else if (this.playmode == 5) {
				if (isForceStop) {
					this.reverse = false;
					this.init();
				} else {
					if (this.pingpongCounter <= 0) {
						this.i = this.duration + this.initiating + this.cooldown;
						this.active = false;
					} else {
						if (!this.reverse) {
							this.pingpongCounter -= 1;
							this.reverse = true;
							this.i = 0;
							this.init();
							this.active = true;
						} else {
							this.pingpongCounter -= 1;
							this.reverse = false;
							this.i = 0;
							this.init();
							this.active = true;
						}
					}
				}
			} else if (this.playmode == -6) {
				this.playmode = this.lastPlayMode;
				this.reverse = false;
				this.i = 0;
				this.active = false;
			} else if (this.playmode == 6) {
				this.reverse = false;
				this.i = this.duration + this.initiating + this.cooldown;
				this.active = false;
			}
		}
		if (this.onCooldown == false) {
			this.onCooldown = true;
			this.runtime.trigger(cr.behaviors.lunarray_Tween.prototype.cnds.OnCooldownEnd, this.inst);
			this.onCooldownDone = true;
		}
	}
	behaviorProto.cnds = {};
	var cnds = behaviorProto.cnds;
	cnds.IsActive = function () {
		return this.active;
	};
	cnds.CompareGroupProgress = function (cmp, v) {
		var x = [];
		cr.lunarray_tweenGroup[this.group].forEach(function (value) {
			x.push((value.i / (value.duration + value.initiating + value.cooldown)));
		});
		return cr.do_cmp(Math.min.apply(null, x), cmp, v);
	}
	cnds.CompareProgress = function (cmp, v) {
		return cr.do_cmp((this.i / (this.duration + this.initiating + this.cooldown)), cmp, v);
	};
	cnds.OnStart = function () {
		if (this.onStartedDone === false) {
			return this.onStarted;
		}
	};
	cnds.OnWaitEnd = function () {
		if (this.onWaitEndDone === false) {
			return this.onWaitEnd;
		}
	};
	cnds.OnEnd = function (a, b, c) {
		if (this.onEndDone === false) {
			return this.onEnd;
		}
	};
	cnds.OnCooldownEnd = function () {
		if (this.onCooldownDone === false) {
			return this.onCooldown;
		}
	};
	behaviorProto.acts = {};
	var acts = behaviorProto.acts;
	acts.SetActive = function (a) {
		this.active = (a === 1);
	};
	acts.StartGroup = function (force, sgroup) {
		if (sgroup === "") sgroup = this.group;
		var groupReady = (force === 1) || cr.lunarray_tweenGroup[sgroup].every(function (value2) {
			return !value2.active;
		});
		if (groupReady) {
			cr.lunarray_tweenGroup[sgroup].forEach(
				function (value) {
					if (force === 1) {
						acts.Force.apply(value);
					} else {
						acts.Start.apply(value);
					}
				}
			);
		}
	}
	acts.StopGroup = function (stopmode, sgroup) {
		if (sgroup === "") sgroup = this.group;
		cr.lunarray_tweenGroup[sgroup].forEach(function (value) {
			acts.Stop.apply(value, [stopmode]);
		});
	}
	acts.ReverseGroup = function (force, rewindMode, sgroup) {
		if (sgroup === "") sgroup = this.group;
		var groupReady = (force === 1) || cr.lunarray_tweenGroup[sgroup].every(function (value2) {
			return !value2.active;
		});
		if (groupReady) {
			cr.lunarray_tweenGroup[sgroup].forEach(
				function (value) {
					if (force === 1) {
						acts.ForceReverse.apply(value, [rewindMode]);
					} else {
						acts.Reverse.apply(value, [rewindMode]);
					}
				}
			);
		}
	}
	acts.Force = function () {
		this.loop = (this.playmode === 4);
		if (this.playmode == 5) this.pingpongCounter = 1;
		if ((this.playmode == 6) || (this.playmode == -6)) {
			if (this.i < this.duration + this.cooldown + this.initiating) {
				this.reverse = false;
				this.init();
				this.active = true;
			}
		} else {
			this.reverse = false;
			this.i = 0;
			this.init();
			this.active = true;
		}
	};
	acts.ForceReverse = function (rewindMode) {
		this.rewindMode = (rewindMode == 1);
		this.loop = (this.playmode === 4);
		if (this.playmode == 5) this.pingpongCounter = 1;
		if ((this.playmode == 6) || (this.playmode == -6)) {
			if (this.i < this.duration + this.cooldown + this.initiating) {
				this.reverse = true;
				this.init();
				this.active = true;
			}
		} else {
			if (rewindMode) {
				if (this.pingpongCounter == 1) {
					if (this.i >= this.duration + this.cooldown + this.initiating) {
						this.reverse = true;
						this.i = 0;
						this.pingpongCounter = 2;
						this.init();
						this.active = true;
					}
				}
			} else {
				this.reverse = true;
				this.i = 0;
				this.init();
				this.active = true;
			}
		}
	};
	acts.Start = function () {
		if (!this.active) {
			this.loop = (this.playmode === 4);
			if (this.playmode == 5) this.pingpongCounter = 1;
			if ((this.playmode == 6) || (this.playmode == -6)) {
				if (this.i < this.duration + this.cooldown + this.initiating) {
					this.reverse = false;
					this.init();
					this.active = true;
				}
			} else {
				this.pingpongCounter = 1;
				this.reverse = false;
				this.i = 0;
				this.init();
				this.active = true;
			}
		}
	};
	acts.Stop = function (stopmode) {
		if (this.active) {
			if ((this.playmode == 2) || (this.playmode == 4)) {
				if (this.reverse) {
					this.i = 0;
				} else {
					this.i = -1;
				}
			} else {
				if (stopmode == 1) {
					this.saveState();
				} else if (stopmode == 0) {
					this.i = this.initiating + this.cooldown + this.duration;
				} else {
					this.i = 0;
				}
			}
			this.tick();
			this.active = false;
		}
	};
	acts.Pause = function () {
		if (this.active) {
			this.isPaused = true;
			this.active = false;
		}
	}
	acts.Resume = function () {
		if (this.isPaused) {
			this.active = true;
			this.isPaused = false;
		} else {
			if (!this.active) {
				this.reverse = false;
				this.i = 0;
				this.init();
				this.active = true;
			}
		}
	}
	acts.Reverse = function (rewindMode) {
		this.rewindMode = (rewindMode == 1);
		if (!this.active) {
			this.loop = (this.playmode === 4);
			if (this.playmode == 5) this.pingpongCounter = 1;
			if ((this.playmode == 6) || (this.playmode == -6)) {
				if (this.i < this.duration + this.cooldown + this.initiating) {
					this.reverse = true;
					this.init();
					this.active = true;
				}
			} else {
				if (rewindMode) {
					if (this.pingpongCounter == 1) {
						if (this.i >= this.duration + this.cooldown + this.initiating) {
							this.reverse = true;
							this.i = 0;
							this.pingpongCounter = 2;
							this.init();
							this.active = true;
						}
					}
				} else {
					this.reverse = true;
					this.i = 0;
					this.init();
					this.active = true;
				}
			}
		}
	};
	acts.SetDuration = function (x) {
		this.duration = x;
	};
	acts.SetWait = function (x) {
		this.wait = x;
		this.initiating = parseFloat(this.wait.split(",")[0]);
		this.cooldown = parseFloat(this.wait.split(",")[1]);
		if ((this.initiating < 0) || (isNaN(this.initiating))) this.initiating = 0;
		if ((this.cooldown < 0) || (isNaN(this.cooldown))) this.cooldown = 0;
	};
	acts.SetTarget = function (x) {
		if (typeof(x) == "string") {
			this.target = x;
			this.targetX = parseFloat(x.split(",")[0]);
			this.targetY = parseFloat(x.split(",")[1]);
		} else {
			this.target = x;
			this.targetX = x;
		}
		if (!this.active) {
			this.init();
		} else {
		}
	};
	acts.SetTargetObject = function (obj) {
		if (!obj)
			return;
		var otherinst = obj.getFirstPicked();
		if (!otherinst)
			return;
		this.targetObject = otherinst;
		this.target = "OBJ";
	};
	acts.SetTargetX = function (x) {
		if ((this.tweened == 2) || (this.tweened == 3) || (this.tweened == 4) || (this.tweened == 5) || (this.tweened == 6)) {
			if (typeof(x) == "string") {
				this.target = parseFloat(x.split(",")[0]);
			} else {
				this.target = "" + x + "," + this.targetY;
			}
			this.targetX = this.target;
		} else {
			var currY = this.target.split(",")[1];
			this.target = String(x) + "," + currY;
			this.targetX = parseFloat(this.target.split(",")[0]);
			this.targetY = parseFloat(this.target.split(",")[1]);
		}
		if (!this.active) {
			this.saveState();
			this.init();
		} else {
		}
	};
	acts.SetTargetY = function (x) {
		if ((this.tweened == 2) || (this.tweened == 3) || (this.tweened == 4) || (this.tweened == 5) || (this.tweened == 6)) {
			if (typeof(x) == "string") {
				this.target = parseFloat(x) + "";
			} else {
				this.target = this.targetX + "," + x;
			}
			this.targetX = this.target;
		} else {
			var currX = this.target.split(",")[0];
			this.target = currX + "," + String(x);
			this.targetX = parseFloat(this.target.split(",")[0]);
			this.targetY = parseFloat(this.target.split(",")[1]);
		}
		if (!this.active) {
			this.saveState();
			this.init();
		} else {
		}
	};
	acts.SetInitial = function (x) {
		if (typeof(x) == "string") {
			this.initial = x;
			this.initialX = parseFloat(x.split(",")[0]);
			this.initialY = parseFloat(x.split(",")[1]);
		} else {
			this.initial = "" + x;
			this.initialX = x;
		}
		if (this.tweened == 6) {
			this.value = this.initialX;
		}
		if (!this.active) {
			this.saveState();
			this.init();
		} else {
		}
	};
	acts.SetInitialX = function (x) {
		if ((this.tweened == 2) || (this.tweened == 3) || (this.tweened == 4) || (this.tweened == 5) || (this.tweened == 6)) {
			if (typeof(x) == "string") {
				this.initial = parseFloat(x);
			} else {
				this.initial = "" + x + "," + this.initialY;
			}
			this.initialX = this.initial;
		} else {
			if (this.initial == "") this.initial = "current";
			if (this.initial == "current") {
				var currY = this.tweenSaveY;
			} else {
				var currY = this.initial.split(",")[1];
			}
			this.initial = String(x) + "," + currY;
			this.initialX = parseFloat(this.initial.split(",")[0]);
			this.initialY = parseFloat(this.initial.split(",")[1]);
		}
		if (this.tweened == 6) {
			this.value = this.initialX;
		}
		if (!this.active) {
			this.saveState();
			this.init();
		} else {
		}
	};
	acts.SetInitialY = function (x) {
		if ((this.tweened == 2) || (this.tweened == 3) || (this.tweened == 4) || (this.tweened == 5) || (this.tweened == 6)) {
			if (typeof(x) == "string") {
				this.initial = parseFloat(x);
			} else {
				this.initial = "" + this.initialX + "," + x;
			}
			this.initialX = this.initial;
		} else {
			if (this.initial == "") this.initial = "current";
			if (this.initial == "current") {
				var currX = this.tweenSaveX;
			} else {
				var currX = this.initial.split(",")[0];
			}
			this.initial = currX + "," + String(x);
			this.initialX = parseFloat(this.initial.split(",")[0]);
			this.initialY = parseFloat(this.initial.split(",")[1]);
		}
		if (!this.active) {
			this.saveState();
			this.init();
		} else {
		}
	};
	acts.SetValue = function (x) {
		this.value = x;
	};
	acts.SetTweenedProperty = function (m) {
		this.tweened = m;
	};
	acts.SetEasing = function (w) {
		this.easing = w;
	};
	acts.SetPlayback = function (x) {
		this.playmode = x;
	};
	acts.SetParameter = function (tweened, playmode, easefunction, initial, target, duration, wait, cmode) {
		this.tweened = tweened;
		this.playmode = playmode;
		this.easing = easefunction;
		acts.SetInitial.apply(this, [initial]);
		acts.SetTarget.apply(this, [target]);
		acts.SetDuration.apply(this, [duration]);
		acts.SetWait.apply(this, [wait]);
		this.coord_mode = cmode;
		this.saveState();
	};
	behaviorProto.exps = {};
	var exps = behaviorProto.exps;
	exps.Progress = function (ret) {
		ret.set_float(this.i / (this.duration + this.initiating + this.cooldown));
	};
	exps.ProgressTime = function (ret) {
		ret.set_float(this.i);
	};
	exps.Duration = function (ret) {
		ret.set_float(this.duration);
	};
	exps.Initiating = function (ret) {
		ret.set_float(this.initiating);
	};
	exps.Cooldown = function (ret) {
		ret.set_float(this.cooldown);
	};
	exps.Target = function (ret) {
		ret.set_string(this.target);
	};
	exps.Value = function (ret) {
		ret.set_float(this.value);
	};
	exps.isPaused = function (ret) {
		ret.set_int(this.isPaused ? 1 : 0);
	};
}());

cr.behaviors.rex_Anchor2 = function(runtime)
{
	this.runtime = runtime;
};
(function () {
	var behaviorProto = cr.behaviors.rex_Anchor2.prototype;
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
		this.alignModeX = this.properties[0]; // 0=left, 1=right, 2=center, 3=hotspot, 4=none
		this.viewPortScaleX = this.properties[1]; // 0=window left, 0.5=window center, 1=window right
		this.alignModeY = this.properties[2]; // 0=top, 1=bottom, 2=center, 3=hotspot, 4=none
		this.viewPortScaleY = this.properties[3]; // 0=window top, 0.5=window center, 1=window bottom
		this.enabled = (this.properties[4] !== 0);
		this.set_once = (this.properties[5] == 1);
		this.update_cnt = 0;
		this.viewLeft_saved = null;
		this.viewRight_saved = null;
		this.viewTop_saved = null;
		this.viewBottom_saved = null;
	};
	behinstProto.is_layer_size_changed = function () {
		var layer = this.inst.layer;
		return (this.viewLeft_saved != layer.viewLeft) ||
			(this.viewRight_saved != layer.viewRight) ||
			(this.viewTop_saved != layer.viewTop) ||
			(this.viewBottom_saved != layer.viewBottom);
	};
	behinstProto.set_update_flag = function () {
		if (this.update_cnt === 0)
			this.update_cnt = 1;
	};
	behinstProto.tick = function () {
		if (!this.enabled)
			return;
		if (this.set_once) {
			if (this.is_layer_size_changed()) {
				var layer = this.inst.layer;
				this.viewLeft_saved = layer.viewLeft;
				this.viewRight_saved = layer.viewRight;
				this.viewTop_saved = layer.viewTop;
				this.viewBottom_saved = layer.viewBottom;
				this.update_cnt = 2;
			}
			if (this.update_cnt == 0)  // no need to update
				return;
			else                       // update once
				this.update_cnt -= 1;
		}
		var enableX = (this.alignModeX !== 4);
		var enableY = (this.alignModeY !== 4);
		if (!enableX && !enableY)
			return;
		var layer = this.inst.layer;
		var targetX = (enableX) ? layer.viewLeft + ( (layer.viewRight - layer.viewLeft) * this.viewPortScaleX ) : 0;
		var targetY = (enableY) ? layer.viewTop + ( (layer.viewBottom - layer.viewTop) * this.viewPortScaleY ) : 0;
		var inst = this.inst;
		var bbox = this.inst.bbox;
		inst.update_bbox();
		var nx = 0, ny = 0;
		switch (this.alignModeX) {
			case 0:    // set left edge to targetX
				nx = targetX + ( this.inst.x - bbox.left );
				break;
			case 1:    // set right edge to targetX
				nx = targetX + ( this.inst.x - bbox.right );
				break;
			case 2:    // cneter
				nx = targetX + ( this.inst.x - (bbox.right + bbox.left) / 2 );
				break;
			case 3:    // hotspot
				nx = targetX;
				break;
			case 4:    // None
				nx = this.inst.x;
				break;
		}
		switch (this.alignModeY) {
			case 0:    // top edge
				ny = targetY + ( this.inst.y - bbox.top );
				break;
			case 1:    // bottom edge
				ny = targetY + ( this.inst.y - bbox.bottom );
				break;
			case 2:    // cneter
				ny = targetY + ( this.inst.y - (bbox.bottom + bbox.top) / 2 );
				break;
			case 3:    // hotspot
				ny = targetY;
				break;
			case 4:    // None
				ny = this.inst.y;
				break;
		}
		if ((nx !== this.inst.x) || (ny !== this.inst.y)) {
			inst.x = nx;
			inst.y = ny;
			inst.set_bbox_changed();
		}
		if (this.set_once)
			this.runtime.trigger(cr.behaviors.rex_Anchor2.prototype.cnds.OnAnchored, this.inst);
	};
	behinstProto.saveToJSON = function () {
		return {
			"enabled": this.enabled,
			"amx": this.alignModeX,
			"vx": this.viewPortScaleX,
			"amy": this.alignModeY,
			"vy": this.viewPortScaleY,
		};
	};
	behinstProto.loadFromJSON = function (o) {
		this.enabled = o["enabled"];
		this.alignModeX = o["amx"];
		this.viewPortScaleX = o["vx"];
		this.alignModeY = o["amy"];
		this.viewPortScaleY = o["vy"];
	};

	function Cnds() {
	};
	behaviorProto.cnds = new Cnds();
	Cnds.prototype.OnAnchored = function () {
		return true;
	};

	function Acts() {
	};
	behaviorProto.acts = new Acts();
	Acts.prototype.SetEnabled = function (e) {
		var e = (e === 1);
		if (!this.enabled && e)
			this.set_update_flag();
		this.enabled = e;
	};
	Acts.prototype.SetHorizontalAlignMode = function (m) {
		if (m !== 4)
			this.set_update_flag();
		this.alignModeX = m;
	};
	Acts.prototype.SetHorizontalPosition = function (p) {
		this.set_update_flag();
		this.viewPortScaleX = p;
	};
	Acts.prototype.SetVerticalAlignMode = function (m) {
		if (m !== 4)
			this.set_update_flag();
		this.alignModeY = m;
	};
	Acts.prototype.SetVerticalPosition = function (p) {
		this.set_update_flag();
		this.viewPortScaleY = p;
	};

	function Exps() {
	};
	behaviorProto.exps = new Exps();
}());

cr.behaviors.scrollto = function(runtime)
{
	this.runtime = runtime;
	this.shakeMag = 0;
	this.shakeStart = 0;
	this.shakeEnd = 0;
	this.shakeMode = 0;
};
(function () {
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
cr.getObjectRefTable = function () {
	return [
		cr.plugins_.AJAX,
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
		cr.plugins_.Browser.prototype.acts.ExecJs
	]
}

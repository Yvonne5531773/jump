(function () {
	var sysProto = cr.system_object.prototype;

	function SysCnds() {
	};
	SysCnds.prototype.EveryTick = function () {
		return true;
	};
	SysCnds.prototype.OnLayoutStart = function () {
		return true;
	};
	SysCnds.prototype.OnLayoutEnd = function () {
		return true;
	};
	SysCnds.prototype.Compare = function (x, cmp, y) {
		return cr.do_cmp(x, cmp, y);
	};
	SysCnds.prototype.CompareTime = function (cmp, t) {
		var elapsed = this.runtime.kahanTime.sum;
		if (cmp === 0) {
			var cnd = this.runtime.getCurrentCondition();
			if (!cnd.extra["CompareTime_executed"]) {
				if (elapsed >= t) {
					cnd.extra["CompareTime_executed"] = true;
					return true;
				}
			}
			return false;
		}
		return cr.do_cmp(elapsed, cmp, t);
	};
	SysCnds.prototype.LayerVisible = function (layer) {
		if (!layer)
			return false;
		else
			return layer.visible;
	};
	SysCnds.prototype.LayerEmpty = function (layer) {
		if (!layer)
			return false;
		else
			return !layer.instances.length;
	};
	SysCnds.prototype.LayerCmpOpacity = function (layer, cmp, opacity_) {
		if (!layer)
			return false;
		return cr.do_cmp(layer.opacity * 100, cmp, opacity_);
	};
	SysCnds.prototype.Repeat = function (count) {
		var current_frame = this.runtime.getCurrentEventStack();
		var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		var current_loop = this.runtime.pushLoopStack();
		var i;
		if (solModifierAfterCnds) {
			for (i = 0; i < count && !current_loop.stopped; i++) {
				this.runtime.pushCopySol(current_event.solModifiers);
				current_loop.index = i;
				current_event.retrigger();
				this.runtime.popSol(current_event.solModifiers);
			}
		}
		else {
			for (i = 0; i < count && !current_loop.stopped; i++) {
				current_loop.index = i;
				current_event.retrigger();
			}
		}
		this.runtime.popLoopStack();
		return false;
	};
	SysCnds.prototype.While = function (count) {
		var current_frame = this.runtime.getCurrentEventStack();
		var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		var current_loop = this.runtime.pushLoopStack();
		var i;
		if (solModifierAfterCnds) {
			for (i = 0; !current_loop.stopped; i++) {
				this.runtime.pushCopySol(current_event.solModifiers);
				current_loop.index = i;
				if (!current_event.retrigger())		// one of the other conditions returned false
					current_loop.stopped = true;	// break
				this.runtime.popSol(current_event.solModifiers);
			}
		}
		else {
			for (i = 0; !current_loop.stopped; i++) {
				current_loop.index = i;
				if (!current_event.retrigger())
					current_loop.stopped = true;
			}
		}
		this.runtime.popLoopStack();
		return false;
	};
	SysCnds.prototype.For = function (name, start, end) {
		var current_frame = this.runtime.getCurrentEventStack();
		var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		var current_loop = this.runtime.pushLoopStack(name);
		var i;
		if (end < start) {
			if (solModifierAfterCnds) {
				for (i = start; i >= end && !current_loop.stopped; --i)  // inclusive to end
				{
					this.runtime.pushCopySol(current_event.solModifiers);
					current_loop.index = i;
					current_event.retrigger();
					this.runtime.popSol(current_event.solModifiers);
				}
			}
			else {
				for (i = start; i >= end && !current_loop.stopped; --i)  // inclusive to end
				{
					current_loop.index = i;
					current_event.retrigger();
				}
			}
		}
		else {
			if (solModifierAfterCnds) {
				for (i = start; i <= end && !current_loop.stopped; ++i)  // inclusive to end
				{
					this.runtime.pushCopySol(current_event.solModifiers);
					current_loop.index = i;
					current_event.retrigger();
					this.runtime.popSol(current_event.solModifiers);
				}
			}
			else {
				for (i = start; i <= end && !current_loop.stopped; ++i)  // inclusive to end
				{
					current_loop.index = i;
					current_event.retrigger();
				}
			}
		}
		this.runtime.popLoopStack();
		return false;
	};
	var foreach_instancestack = [];
	var foreach_instanceptr = -1;
	SysCnds.prototype.ForEach = function (obj) {
		var sol = obj.getCurrentSol();
		foreach_instanceptr++;
		if (foreach_instancestack.length === foreach_instanceptr)
			foreach_instancestack.push([]);
		var instances = foreach_instancestack[foreach_instanceptr];
		cr.shallowAssignArray(instances, sol.getObjects());
		var current_frame = this.runtime.getCurrentEventStack();
		var current_event = current_frame.current_event;
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		var current_loop = this.runtime.pushLoopStack();
		var i, len, j, lenj, inst, s, sol2;
		var is_contained = obj.is_contained;
		if (solModifierAfterCnds) {
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++) {
				this.runtime.pushCopySol(current_event.solModifiers);
				inst = instances[i];
				sol = obj.getCurrentSol();
				sol.select_all = false;
				cr.clearArray(sol.instances);
				sol.instances[0] = inst;
				if (is_contained) {
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++) {
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						cr.clearArray(sol2.instances);
						sol2.instances[0] = s;
					}
				}
				current_loop.index = i;
				current_event.retrigger();
				this.runtime.popSol(current_event.solModifiers);
			}
		}
		else {
			sol.select_all = false;
			cr.clearArray(sol.instances);
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++) {
				inst = instances[i];
				sol.instances[0] = inst;
				if (is_contained) {
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++) {
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						cr.clearArray(sol2.instances);
						sol2.instances[0] = s;
					}
				}
				current_loop.index = i;
				current_event.retrigger();
			}
		}
		cr.clearArray(instances);
		this.runtime.popLoopStack();
		foreach_instanceptr--;
		return false;
	};

	function foreach_sortinstances(a, b) {
		var va = a.extra["c2_feo_val"];
		var vb = b.extra["c2_feo_val"];
		if (cr.is_number(va) && cr.is_number(vb))
			return va - vb;
		else {
			va = "" + va;
			vb = "" + vb;
			if (va < vb)
				return -1;
			else if (va > vb)
				return 1;
			else
				return 0;
		}
	};
	SysCnds.prototype.ForEachOrdered = function (obj, exp, order) {
		var sol = obj.getCurrentSol();
		foreach_instanceptr++;
		if (foreach_instancestack.length === foreach_instanceptr)
			foreach_instancestack.push([]);
		var instances = foreach_instancestack[foreach_instanceptr];
		cr.shallowAssignArray(instances, sol.getObjects());
		var current_frame = this.runtime.getCurrentEventStack();
		var current_event = current_frame.current_event;
		var current_condition = this.runtime.getCurrentCondition();
		var solModifierAfterCnds = current_frame.isModifierAfterCnds();
		var current_loop = this.runtime.pushLoopStack();
		var i, len, j, lenj, inst, s, sol2;
		for (i = 0, len = instances.length; i < len; i++) {
			instances[i].extra["c2_feo_val"] = current_condition.parameters[1].get(i);
		}
		instances.sort(foreach_sortinstances);
		if (order === 1)
			instances.reverse();
		var is_contained = obj.is_contained;
		if (solModifierAfterCnds) {
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++) {
				this.runtime.pushCopySol(current_event.solModifiers);
				inst = instances[i];
				sol = obj.getCurrentSol();
				sol.select_all = false;
				cr.clearArray(sol.instances);
				sol.instances[0] = inst;
				if (is_contained) {
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++) {
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						cr.clearArray(sol2.instances);
						sol2.instances[0] = s;
					}
				}
				current_loop.index = i;
				current_event.retrigger();
				this.runtime.popSol(current_event.solModifiers);
			}
		}
		else {
			sol.select_all = false;
			cr.clearArray(sol.instances);
			for (i = 0, len = instances.length; i < len && !current_loop.stopped; i++) {
				inst = instances[i];
				sol.instances[0] = inst;
				if (is_contained) {
					for (j = 0, lenj = inst.siblings.length; j < lenj; j++) {
						s = inst.siblings[j];
						sol2 = s.type.getCurrentSol();
						sol2.select_all = false;
						cr.clearArray(sol2.instances);
						sol2.instances[0] = s;
					}
				}
				current_loop.index = i;
				current_event.retrigger();
			}
		}
		cr.clearArray(instances);
		this.runtime.popLoopStack();
		foreach_instanceptr--;
		return false;
	};
	SysCnds.prototype.PickByComparison = function (obj_, exp_, cmp_, val_) {
		var i, len, k, inst;
		if (!obj_)
			return;
		foreach_instanceptr++;
		if (foreach_instancestack.length === foreach_instanceptr)
			foreach_instancestack.push([]);
		var tmp_instances = foreach_instancestack[foreach_instanceptr];
		var sol = obj_.getCurrentSol();
		cr.shallowAssignArray(tmp_instances, sol.getObjects());
		if (sol.select_all)
			cr.clearArray(sol.else_instances);
		var current_condition = this.runtime.getCurrentCondition();
		for (i = 0, k = 0, len = tmp_instances.length; i < len; i++) {
			inst = tmp_instances[i];
			tmp_instances[k] = inst;
			exp_ = current_condition.parameters[1].get(i);
			val_ = current_condition.parameters[3].get(i);
			if (cr.do_cmp(exp_, cmp_, val_)) {
				k++;
			}
			else {
				sol.else_instances.push(inst);
			}
		}
		cr.truncateArray(tmp_instances, k);
		sol.select_all = false;
		cr.shallowAssignArray(sol.instances, tmp_instances);
		cr.clearArray(tmp_instances);
		foreach_instanceptr--;
		obj_.applySolToContainer();
		return !!sol.instances.length;
	};
	SysCnds.prototype.PickByEvaluate = function (obj_, exp_) {
		var i, len, k, inst;
		if (!obj_)
			return;
		foreach_instanceptr++;
		if (foreach_instancestack.length === foreach_instanceptr)
			foreach_instancestack.push([]);
		var tmp_instances = foreach_instancestack[foreach_instanceptr];
		var sol = obj_.getCurrentSol();
		cr.shallowAssignArray(tmp_instances, sol.getObjects());
		if (sol.select_all)
			cr.clearArray(sol.else_instances);
		var current_condition = this.runtime.getCurrentCondition();
		for (i = 0, k = 0, len = tmp_instances.length; i < len; i++) {
			inst = tmp_instances[i];
			tmp_instances[k] = inst;
			exp_ = current_condition.parameters[1].get(i);
			if (exp_) {
				k++;
			}
			else {
				sol.else_instances.push(inst);
			}
		}
		cr.truncateArray(tmp_instances, k);
		sol.select_all = false;
		cr.shallowAssignArray(sol.instances, tmp_instances);
		cr.clearArray(tmp_instances);
		foreach_instanceptr--;
		obj_.applySolToContainer();
		return !!sol.instances.length;
	};
	SysCnds.prototype.TriggerOnce = function () {
		var cndextra = this.runtime.getCurrentCondition().extra;
		if (typeof cndextra["TriggerOnce_lastTick"] === "undefined")
			cndextra["TriggerOnce_lastTick"] = -1;
		var last_tick = cndextra["TriggerOnce_lastTick"];
		var cur_tick = this.runtime.tickcount;
		cndextra["TriggerOnce_lastTick"] = cur_tick;
		return this.runtime.layout_first_tick || last_tick !== cur_tick - 1;
	};
	SysCnds.prototype.Every = function (seconds) {
		var cnd = this.runtime.getCurrentCondition();
		var last_time = cnd.extra["Every_lastTime"] || 0;
		var cur_time = this.runtime.kahanTime.sum;
		if (typeof cnd.extra["Every_seconds"] === "undefined")
			cnd.extra["Every_seconds"] = seconds;
		var this_seconds = cnd.extra["Every_seconds"];
		if (cur_time >= last_time + this_seconds) {
			cnd.extra["Every_lastTime"] = last_time + this_seconds;
			if (cur_time >= cnd.extra["Every_lastTime"] + 0.04) {
				cnd.extra["Every_lastTime"] = cur_time;
			}
			cnd.extra["Every_seconds"] = seconds;
			return true;
		}
		else if (cur_time < last_time - 0.1) {
			cnd.extra["Every_lastTime"] = cur_time;
		}
		return false;
	};
	SysCnds.prototype.PickNth = function (obj, index) {
		if (!obj)
			return false;
		var sol = obj.getCurrentSol();
		var instances = sol.getObjects();
		index = cr.floor(index);
		if (index < 0 || index >= instances.length)
			return false;
		var inst = instances[index];
		sol.pick_one(inst);
		obj.applySolToContainer();
		return true;
	};
	SysCnds.prototype.PickRandom = function (obj) {
		if (!obj)
			return false;
		var sol = obj.getCurrentSol();
		var instances = sol.getObjects();
		var index = cr.floor(Math.random() * instances.length);
		if (index >= instances.length)
			return false;
		var inst = instances[index];
		sol.pick_one(inst);
		obj.applySolToContainer();
		return true;
	};
	SysCnds.prototype.CompareVar = function (v, cmp, val) {
		return cr.do_cmp(v.getValue(), cmp, val);
	};
	SysCnds.prototype.IsGroupActive = function (group) {
		var g = this.runtime.groups_by_name[group.toLowerCase()];
		return g && g.group_active;
	};
	SysCnds.prototype.IsPreview = function () {
		return typeof cr_is_preview !== "undefined";
	};
	SysCnds.prototype.PickAll = function (obj) {
		if (!obj)
			return false;
		if (!obj.instances.length)
			return false;
		var sol = obj.getCurrentSol();
		sol.select_all = true;
		obj.applySolToContainer();
		return true;
	};
	SysCnds.prototype.IsMobile = function () {
		return this.runtime.isMobile;
	};
	SysCnds.prototype.CompareBetween = function (x, a, b) {
		return x >= a && x <= b;
	};
	SysCnds.prototype.Else = function () {
		var current_frame = this.runtime.getCurrentEventStack();
		if (current_frame.else_branch_ran)
			return false;		// another event in this else-if chain has run
		else
			return !current_frame.last_event_true;
	};
	SysCnds.prototype.OnLoadFinished = function () {
		return true;
	};
	SysCnds.prototype.OnCanvasSnapshot = function () {
		return true;
	};
	SysCnds.prototype.EffectsSupported = function () {
		return !!this.runtime.glwrap;
	};
	SysCnds.prototype.OnSaveComplete = function () {
		return true;
	};
	SysCnds.prototype.OnSaveFailed = function () {
		return true;
	};
	SysCnds.prototype.OnLoadComplete = function () {
		return true;
	};
	SysCnds.prototype.OnLoadFailed = function () {
		return true;
	};
	SysCnds.prototype.ObjectUIDExists = function (u) {
		return !!this.runtime.getObjectByUID(u);
	};
	SysCnds.prototype.IsOnPlatform = function (p) {
		var rt = this.runtime;
		switch (p) {
			case 0:		// HTML5 website
				return !rt.isDomFree && !rt.isNodeWebkit && !rt.isCordova && !rt.isWinJS && !rt.isWindowsPhone8 && !rt.isBlackberry10 && !rt.isAmazonWebApp;
			case 1:		// iOS
				return rt.isiOS;
			case 2:		// Android
				return rt.isAndroid;
			case 3:		// Windows 8
				return rt.isWindows8App;
			case 4:		// Windows Phone 8
				return rt.isWindowsPhone8;
			case 5:		// Blackberry 10
				return rt.isBlackberry10;
			case 6:		// Tizen
				return rt.isTizen;
			case 7:		// CocoonJS
				return rt.isCocoonJs;
			case 8:		// Cordova
				return rt.isCordova;
			case 9:	// Scirra Arcade
				return rt.isArcade;
			case 10:	// node-webkit
				return rt.isNodeWebkit;
			case 11:	// crosswalk
				return rt.isCrosswalk;
			case 12:	// amazon webapp
				return rt.isAmazonWebApp;
			case 13:	// windows 10 app
				return rt.isWindows10;
			default:	// should not be possible
				return false;
		}
	};
	var cacheRegex = null;
	var lastRegex = "";
	var lastFlags = "";

	function getRegex(regex_, flags_) {
		if (!cacheRegex || regex_ !== lastRegex || flags_ !== lastFlags) {
			cacheRegex = new RegExp(regex_, flags_);
			lastRegex = regex_;
			lastFlags = flags_;
		}
		cacheRegex.lastIndex = 0;		// reset
		return cacheRegex;
	};
	SysCnds.prototype.RegexTest = function (str_, regex_, flags_) {
		var regex = getRegex(regex_, flags_);
		return regex.test(str_);
	};
	var tmp_arr = [];
	SysCnds.prototype.PickOverlappingPoint = function (obj_, x_, y_) {
		if (!obj_)
			return false;
		var sol = obj_.getCurrentSol();
		var instances = sol.getObjects();
		var current_event = this.runtime.getCurrentEventStack().current_event;
		var orblock = current_event.orblock;
		var cnd = this.runtime.getCurrentCondition();
		var i, len, inst, pick;
		if (sol.select_all) {
			cr.shallowAssignArray(tmp_arr, instances);
			cr.clearArray(sol.else_instances);
			sol.select_all = false;
			cr.clearArray(sol.instances);
		}
		else {
			if (orblock) {
				cr.shallowAssignArray(tmp_arr, sol.else_instances);
				cr.clearArray(sol.else_instances);
			}
			else {
				cr.shallowAssignArray(tmp_arr, instances);
				cr.clearArray(sol.instances);
			}
		}
		for (i = 0, len = tmp_arr.length; i < len; ++i) {
			inst = tmp_arr[i];
			inst.update_bbox();
			pick = cr.xor(inst.contains_pt(x_, y_), cnd.inverted);
			if (pick)
				sol.instances.push(inst);
			else
				sol.else_instances.push(inst);
		}
		obj_.applySolToContainer();
		return cr.xor(!!sol.instances.length, cnd.inverted);
	};
	SysCnds.prototype.IsNaN = function (n) {
		return !!isNaN(n);
	};
	SysCnds.prototype.AngleWithin = function (a1, within, a2) {
		return cr.angleDiff(cr.to_radians(a1), cr.to_radians(a2)) <= cr.to_radians(within);
	};
	SysCnds.prototype.IsClockwiseFrom = function (a1, a2) {
		return cr.angleClockwise(cr.to_radians(a1), cr.to_radians(a2));
	};
	SysCnds.prototype.IsBetweenAngles = function (a, la, ua) {
		var angle = cr.to_clamped_radians(a);
		var lower = cr.to_clamped_radians(la);
		var upper = cr.to_clamped_radians(ua);
		var obtuse = (!cr.angleClockwise(upper, lower));
		if (obtuse)
			return !(!cr.angleClockwise(angle, lower) && cr.angleClockwise(angle, upper));
		else
			return cr.angleClockwise(angle, lower) && !cr.angleClockwise(angle, upper);
	};
	SysCnds.prototype.IsValueType = function (x, t) {
		if (typeof x === "number")
			return t === 0;
		else		// string
			return t === 1;
	};
	sysProto.cnds = new SysCnds();

	function SysActs() {
	};
	SysActs.prototype.GoToLayout = function (to) {
		if (this.runtime.isloading)
			return;		// cannot change layout while loading on loader layout
		if (this.runtime.changelayout)
			return;		// already changing to a different layout
		;
		this.runtime.changelayout = to;
	};
	SysActs.prototype.NextPrevLayout = function (prev) {
		if (this.runtime.isloading)
			return;		// cannot change layout while loading on loader layout
		if (this.runtime.changelayout)
			return;		// already changing to a different layout
		var index = this.runtime.layouts_by_index.indexOf(this.runtime.running_layout);
		if (prev && index === 0)
			return;		// cannot go to previous layout from first layout
		if (!prev && index === this.runtime.layouts_by_index.length - 1)
			return;		// cannot go to next layout from last layout
		var to = this.runtime.layouts_by_index[index + (prev ? -1 : 1)];
		;
		this.runtime.changelayout = to;
	};
	SysActs.prototype.CreateObject = function (obj, layer, x, y) {
		if (!layer || !obj)
			return;
		var inst = this.runtime.createInstance(obj, layer, x, y);
		if (!inst)
			return;
		this.runtime.isInOnDestroy++;
		var i, len, s;
		this.runtime.trigger(Object.getPrototypeOf(obj.plugin).cnds.OnCreated, inst);
		if (inst.is_contained) {
			for (i = 0, len = inst.siblings.length; i < len; i++) {
				s = inst.siblings[i];
				this.runtime.trigger(Object.getPrototypeOf(s.type.plugin).cnds.OnCreated, s);
			}
		}
		this.runtime.isInOnDestroy--;
		var sol = obj.getCurrentSol();
		sol.select_all = false;
		cr.clearArray(sol.instances);
		sol.instances[0] = inst;
		if (inst.is_contained) {
			for (i = 0, len = inst.siblings.length; i < len; i++) {
				s = inst.siblings[i];
				sol = s.type.getCurrentSol();
				sol.select_all = false;
				cr.clearArray(sol.instances);
				sol.instances[0] = s;
			}
		}
	};
	SysActs.prototype.SetLayerVisible = function (layer, visible_) {
		if (!layer)
			return;
		if (layer.visible !== visible_) {
			layer.visible = visible_;
			this.runtime.redraw = true;
		}
	};
	SysActs.prototype.SetLayerOpacity = function (layer, opacity_) {
		if (!layer)
			return;
		opacity_ = cr.clamp(opacity_ / 100, 0, 1);
		if (layer.opacity !== opacity_) {
			layer.opacity = opacity_;
			this.runtime.redraw = true;
		}
	};
	SysActs.prototype.SetLayerScaleRate = function (layer, sr) {
		if (!layer)
			return;
		if (layer.zoomRate !== sr) {
			layer.zoomRate = sr;
			this.runtime.redraw = true;
		}
	};
	SysActs.prototype.SetLayerForceOwnTexture = function (layer, f) {
		if (!layer)
			return;
		f = !!f;
		if (layer.forceOwnTexture !== f) {
			layer.forceOwnTexture = f;
			this.runtime.redraw = true;
		}
	};
	SysActs.prototype.SetLayoutScale = function (s) {
		if (!this.runtime.running_layout)
			return;
		if (this.runtime.running_layout.scale !== s) {
			this.runtime.running_layout.scale = s;
			this.runtime.running_layout.boundScrolling();
			this.runtime.redraw = true;
		}
	};
	SysActs.prototype.ScrollX = function (x) {
		this.runtime.running_layout.scrollToX(x);
	};
	SysActs.prototype.ScrollY = function (y) {
		this.runtime.running_layout.scrollToY(y);
	};
	SysActs.prototype.Scroll = function (x, y) {
		this.runtime.running_layout.scrollToX(x);
		this.runtime.running_layout.scrollToY(y);
	};
	SysActs.prototype.ScrollToObject = function (obj) {
		var inst = obj.getFirstPicked();
		if (inst) {
			this.runtime.running_layout.scrollToX(inst.x);
			this.runtime.running_layout.scrollToY(inst.y);
		}
	};
	SysActs.prototype.SetVar = function (v, x) {
		;
		if (v.vartype === 0) {
			if (cr.is_number(x))
				v.setValue(x);
			else
				v.setValue(parseFloat(x));
		}
		else if (v.vartype === 1)
			v.setValue(x.toString());
	};
	SysActs.prototype.AddVar = function (v, x) {
		;
		if (v.vartype === 0) {
			if (cr.is_number(x))
				v.setValue(v.getValue() + x);
			else
				v.setValue(v.getValue() + parseFloat(x));
		}
		else if (v.vartype === 1)
			v.setValue(v.getValue() + x.toString());
	};
	SysActs.prototype.SubVar = function (v, x) {
		;
		if (v.vartype === 0) {
			if (cr.is_number(x))
				v.setValue(v.getValue() - x);
			else
				v.setValue(v.getValue() - parseFloat(x));
		}
	};
	SysActs.prototype.SetGroupActive = function (group, active) {
		var g = this.runtime.groups_by_name[group.toLowerCase()];
		if (!g)
			return;
		switch (active) {
			case 0:
				g.setGroupActive(false);
				break;
			case 1:
				g.setGroupActive(true);
				break;
			case 2:
				g.setGroupActive(!g.group_active);
				break;
		}
	};
	SysActs.prototype.SetTimescale = function (ts_) {
		var ts = ts_;
		if (ts < 0)
			ts = 0;
		this.runtime.timescale = ts;
	};
	SysActs.prototype.SetObjectTimescale = function (obj, ts_) {
		var ts = ts_;
		if (ts < 0)
			ts = 0;
		if (!obj)
			return;
		var sol = obj.getCurrentSol();
		var instances = sol.getObjects();
		var i, len;
		for (i = 0, len = instances.length; i < len; i++) {
			instances[i].my_timescale = ts;
		}
	};
	SysActs.prototype.RestoreObjectTimescale = function (obj) {
		if (!obj)
			return false;
		var sol = obj.getCurrentSol();
		var instances = sol.getObjects();
		var i, len;
		for (i = 0, len = instances.length; i < len; i++) {
			instances[i].my_timescale = -1.0;
		}
	};
	var waitobjrecycle = [];

	function allocWaitObject() {
		var w;
		if (waitobjrecycle.length)
			w = waitobjrecycle.pop();
		else {
			w = {};
			w.sols = {};
			w.solModifiers = [];
		}
		w.deleteme = false;
		return w;
	};

	function freeWaitObject(w) {
		cr.wipe(w.sols);
		cr.clearArray(w.solModifiers);
		waitobjrecycle.push(w);
	};
	var solstateobjects = [];

	function allocSolStateObject() {
		var s;
		if (solstateobjects.length)
			s = solstateobjects.pop();
		else {
			s = {};
			s.insts = [];
		}
		s.sa = false;
		return s;
	};

	function freeSolStateObject(s) {
		cr.clearArray(s.insts);
		solstateobjects.push(s);
	};
	SysActs.prototype.Wait = function (seconds) {
		if (seconds < 0)
			return;
		var i, len, s, t, ss;
		var evinfo = this.runtime.getCurrentEventStack();
		var waitobj = allocWaitObject();
		waitobj.time = this.runtime.kahanTime.sum + seconds;
		waitobj.signaltag = "";
		waitobj.signalled = false;
		waitobj.ev = evinfo.current_event;
		waitobj.actindex = evinfo.actindex + 1;	// pointing at next action
		for (i = 0, len = this.runtime.types_by_index.length; i < len; i++) {
			t = this.runtime.types_by_index[i];
			s = t.getCurrentSol();
			if (s.select_all && evinfo.current_event.solModifiers.indexOf(t) === -1)
				continue;
			waitobj.solModifiers.push(t);
			ss = allocSolStateObject();
			ss.sa = s.select_all;
			cr.shallowAssignArray(ss.insts, s.instances);
			waitobj.sols[i.toString()] = ss;
		}
		this.waits.push(waitobj);
		return true;
	};
	SysActs.prototype.WaitForSignal = function (tag) {
		var i, len, s, t, ss;
		var evinfo = this.runtime.getCurrentEventStack();
		var waitobj = allocWaitObject();
		waitobj.time = -1;
		waitobj.signaltag = tag.toLowerCase();
		waitobj.signalled = false;
		waitobj.ev = evinfo.current_event;
		waitobj.actindex = evinfo.actindex + 1;	// pointing at next action
		for (i = 0, len = this.runtime.types_by_index.length; i < len; i++) {
			t = this.runtime.types_by_index[i];
			s = t.getCurrentSol();
			if (s.select_all && evinfo.current_event.solModifiers.indexOf(t) === -1)
				continue;
			waitobj.solModifiers.push(t);
			ss = allocSolStateObject();
			ss.sa = s.select_all;
			cr.shallowAssignArray(ss.insts, s.instances);
			waitobj.sols[i.toString()] = ss;
		}
		this.waits.push(waitobj);
		return true;
	};
	SysActs.prototype.Signal = function (tag) {
		var lowertag = tag.toLowerCase();
		var i, len, w;
		for (i = 0, len = this.waits.length; i < len; ++i) {
			w = this.waits[i];
			if (w.time !== -1)
				continue;					// timer wait, ignore
			if (w.signaltag === lowertag)	// waiting for this signal
				w.signalled = true;			// will run on next check
		}
	};
	SysActs.prototype.SetLayerScale = function (layer, scale) {
		if (!layer)
			return;
		if (layer.scale === scale)
			return;
		layer.scale = scale;
		this.runtime.redraw = true;
	};
	SysActs.prototype.ResetGlobals = function () {
		var i, len, g;
		for (i = 0, len = this.runtime.all_global_vars.length; i < len; i++) {
			g = this.runtime.all_global_vars[i];
			g.data = g.initial;
		}
	};
	SysActs.prototype.SetLayoutAngle = function (a) {
		a = cr.to_radians(a);
		a = cr.clamp_angle(a);
		if (this.runtime.running_layout) {
			if (this.runtime.running_layout.angle !== a) {
				this.runtime.running_layout.angle = a;
				this.runtime.redraw = true;
			}
		}
	};
	SysActs.prototype.SetLayerAngle = function (layer, a) {
		if (!layer)
			return;
		a = cr.to_radians(a);
		a = cr.clamp_angle(a);
		if (layer.angle === a)
			return;
		layer.angle = a;
		this.runtime.redraw = true;
	};
	SysActs.prototype.SetLayerParallax = function (layer, px, py) {
		if (!layer)
			return;
		if (layer.parallaxX === px / 100 && layer.parallaxY === py / 100)
			return;
		layer.parallaxX = px / 100;
		layer.parallaxY = py / 100;
		if (layer.parallaxX !== 1 || layer.parallaxY !== 1) {
			var i, len, instances = layer.instances;
			for (i = 0, len = instances.length; i < len; ++i) {
				instances[i].type.any_instance_parallaxed = true;
			}
		}
		this.runtime.redraw = true;
	};
	SysActs.prototype.SetLayerBackground = function (layer, c) {
		if (!layer)
			return;
		var r = cr.GetRValue(c);
		var g = cr.GetGValue(c);
		var b = cr.GetBValue(c);
		if (layer.background_color[0] === r && layer.background_color[1] === g && layer.background_color[2] === b)
			return;
		layer.background_color[0] = r;
		layer.background_color[1] = g;
		layer.background_color[2] = b;
		this.runtime.redraw = true;
	};
	SysActs.prototype.SetLayerTransparent = function (layer, t) {
		if (!layer)
			return;
		if (!!t === !!layer.transparent)
			return;
		layer.transparent = !!t;
		this.runtime.redraw = true;
	};
	SysActs.prototype.SetLayerBlendMode = function (layer, bm) {
		if (!layer)
			return;
		if (layer.blend_mode === bm)
			return;
		layer.blend_mode = bm;
		layer.compositeOp = cr.effectToCompositeOp(layer.blend_mode);
		if (this.runtime.gl)
			cr.setGLBlend(layer, layer.blend_mode, this.runtime.gl);
		this.runtime.redraw = true;
	};
	SysActs.prototype.StopLoop = function () {
		if (this.runtime.loop_stack_index < 0)
			return;		// no loop currently running
		this.runtime.getCurrentLoop().stopped = true;
	};
	SysActs.prototype.GoToLayoutByName = function (layoutname) {
		if (this.runtime.isloading)
			return;		// cannot change layout while loading on loader layout
		if (this.runtime.changelayout)
			return;		// already changing to different layout
		;
		var l;
		for (l in this.runtime.layouts) {
			if (this.runtime.layouts.hasOwnProperty(l) && cr.equals_nocase(l, layoutname)) {
				this.runtime.changelayout = this.runtime.layouts[l];
				return;
			}
		}
	};
	SysActs.prototype.RestartLayout = function (layoutname) {
		if (this.runtime.isloading)
			return;		// cannot restart loader layouts
		if (this.runtime.changelayout)
			return;		// already changing to a different layout
		;
		if (!this.runtime.running_layout)
			return;
		this.runtime.changelayout = this.runtime.running_layout;
		var i, len, g;
		for (i = 0, len = this.runtime.allGroups.length; i < len; i++) {
			g = this.runtime.allGroups[i];
			g.setGroupActive(g.initially_activated);
		}
	};
	SysActs.prototype.SnapshotCanvas = function (format_, quality_) {
		this.runtime.doCanvasSnapshot(format_ === 0 ? "image/png" : "image/jpeg", quality_ / 100);
	};
	SysActs.prototype.SetCanvasSize = function (w, h) {
		if (w <= 0 || h <= 0)
			return;
		var mode = this.runtime.fullscreen_mode;
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || !!document["msFullscreenElement"] || document["fullScreen"] || this.runtime.isNodeFullscreen);
		if (isfullscreen && this.runtime.fullscreen_scaling > 0)
			mode = this.runtime.fullscreen_scaling;
		if (mode === 0) {
			this.runtime["setSize"](w, h, true);
		}
		else {
			this.runtime.original_width = w;
			this.runtime.original_height = h;
			this.runtime["setSize"](this.runtime.lastWindowWidth, this.runtime.lastWindowHeight, true);
		}
	};
	SysActs.prototype.SetLayoutEffectEnabled = function (enable_, effectname_) {
		if (!this.runtime.running_layout || !this.runtime.glwrap)
			return;
		var et = this.runtime.running_layout.getEffectByName(effectname_);
		if (!et)
			return;		// effect name not found
		var enable = (enable_ === 1);
		if (et.active == enable)
			return;		// no change
		et.active = enable;
		this.runtime.running_layout.updateActiveEffects();
		this.runtime.redraw = true;
	};
	SysActs.prototype.SetLayerEffectEnabled = function (layer, enable_, effectname_) {
		if (!layer || !this.runtime.glwrap)
			return;
		var et = layer.getEffectByName(effectname_);
		if (!et)
			return;		// effect name not found
		var enable = (enable_ === 1);
		if (et.active == enable)
			return;		// no change
		et.active = enable;
		layer.updateActiveEffects();
		this.runtime.redraw = true;
	};
	SysActs.prototype.SetLayoutEffectParam = function (effectname_, index_, value_) {
		if (!this.runtime.running_layout || !this.runtime.glwrap)
			return;
		var et = this.runtime.running_layout.getEffectByName(effectname_);
		if (!et)
			return;		// effect name not found
		var params = this.runtime.running_layout.effect_params[et.index];
		index_ = Math.floor(index_);
		if (index_ < 0 || index_ >= params.length)
			return;		// effect index out of bounds
		if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1)
			value_ /= 100.0;
		if (params[index_] === value_)
			return;		// no change
		params[index_] = value_;
		if (et.active)
			this.runtime.redraw = true;
	};
	SysActs.prototype.SetLayerEffectParam = function (layer, effectname_, index_, value_) {
		if (!layer || !this.runtime.glwrap)
			return;
		var et = layer.getEffectByName(effectname_);
		if (!et)
			return;		// effect name not found
		var params = layer.effect_params[et.index];
		index_ = Math.floor(index_);
		if (index_ < 0 || index_ >= params.length)
			return;		// effect index out of bounds
		if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1)
			value_ /= 100.0;
		if (params[index_] === value_)
			return;		// no change
		params[index_] = value_;
		if (et.active)
			this.runtime.redraw = true;
	};
	SysActs.prototype.SaveState = function (slot_) {
		this.runtime.saveToSlot = slot_;
	};
	SysActs.prototype.LoadState = function (slot_) {
		this.runtime.loadFromSlot = slot_;
	};
	SysActs.prototype.LoadStateJSON = function (jsonstr_) {
		this.runtime.loadFromJson = jsonstr_;
	};
	SysActs.prototype.SetHalfFramerateMode = function (set_) {
		this.runtime.halfFramerateMode = (set_ !== 0);
	};
	SysActs.prototype.SetFullscreenQuality = function (q) {
		var isfullscreen = (document["mozFullScreen"] || document["webkitIsFullScreen"] || !!document["msFullscreenElement"] || document["fullScreen"] || this.isNodeFullscreen);
		if (!isfullscreen && this.runtime.fullscreen_mode === 0)
			return;
		this.runtime.wantFullscreenScalingQuality = (q !== 0);
		this.runtime["setSize"](this.runtime.lastWindowWidth, this.runtime.lastWindowHeight, true);
	};
	SysActs.prototype.ResetPersisted = function () {
		var i, len;
		for (i = 0, len = this.runtime.layouts_by_index.length; i < len; ++i) {
			this.runtime.layouts_by_index[i].persist_data = {};
			this.runtime.layouts_by_index[i].first_visit = true;
		}
	};
	SysActs.prototype.RecreateInitialObjects = function (obj, x1, y1, x2, y2) {
		if (!obj)
			return;
		this.runtime.running_layout.recreateInitialObjects(obj, x1, y1, x2, y2);
	};
	SysActs.prototype.SetPixelRounding = function (m) {
		this.runtime.pixel_rounding = (m !== 0);
		this.runtime.redraw = true;
	};
	SysActs.prototype.SetMinimumFramerate = function (f) {
		if (f < 1)
			f = 1;
		if (f > 120)
			f = 120;
		this.runtime.minimumFramerate = f;
	};

	function SortZOrderList(a, b) {
		var layerA = a[0];
		var layerB = b[0];
		var diff = layerA - layerB;
		if (diff !== 0)
			return diff;
		var indexA = a[1];
		var indexB = b[1];
		return indexA - indexB;
	};

	function SortInstancesByValue(a, b) {
		return a[1] - b[1];
	};
	SysActs.prototype.SortZOrderByInstVar = function (obj, iv) {
		if (!obj)
			return;
		var i, len, inst, value, r, layer, toZ;
		var sol = obj.getCurrentSol();
		var pickedInstances = sol.getObjects();
		var zOrderList = [];
		var instValues = [];
		var layout = this.runtime.running_layout;
		var isFamily = obj.is_family;
		var familyIndex = obj.family_index;
		for (i = 0, len = pickedInstances.length; i < len; ++i) {
			inst = pickedInstances[i];
			if (!inst.layer)
				continue;		// not a world instance
			if (isFamily)
				value = inst.instance_vars[iv + inst.type.family_var_map[familyIndex]];
			else
				value = inst.instance_vars[iv];
			zOrderList.push([
				inst.layer.index,
				inst.get_zindex()
			]);
			instValues.push([
				inst,
				value
			]);
		}
		if (!zOrderList.length)
			return;				// no instances were world instances
		zOrderList.sort(SortZOrderList);
		instValues.sort(SortInstancesByValue);
		for (i = 0, len = zOrderList.length; i < len; ++i) {
			inst = instValues[i][0];					// instance in the order we want
			layer = layout.layers[zOrderList[i][0]];	// layer to put it on
			toZ = zOrderList[i][1];						// Z index on that layer to put it
			if (layer.instances[toZ] !== inst)			// not already got this instance there
			{
				layer.instances[toZ] = inst;			// update instance
				inst.layer = layer;						// update instance's layer reference (could have changed)
				layer.setZIndicesStaleFrom(toZ);		// mark Z indices stale from this point since they have changed
			}
		}
	};
	sysProto.acts = new SysActs();

	function SysExps() {
	};
	SysExps.prototype["int"] = function (ret, x) {
		if (cr.is_string(x)) {
			ret.set_int(parseInt(x, 10));
			if (isNaN(ret.data))
				ret.data = 0;
		}
		else
			ret.set_int(x);
	};
	SysExps.prototype["float"] = function (ret, x) {
		if (cr.is_string(x)) {
			ret.set_float(parseFloat(x));
			if (isNaN(ret.data))
				ret.data = 0;
		}
		else
			ret.set_float(x);
	};
	SysExps.prototype.str = function (ret, x) {
		if (cr.is_string(x))
			ret.set_string(x);
		else
			ret.set_string(x.toString());
	};
	SysExps.prototype.len = function (ret, x) {
		ret.set_int(x.length || 0);
	};
	SysExps.prototype.random = function (ret, a, b) {
		if (b === undefined) {
			ret.set_float(Math.random() * a);
		}
		else {
			ret.set_float(Math.random() * (b - a) + a);
		}
	};
	SysExps.prototype.sqrt = function (ret, x) {
		ret.set_float(Math.sqrt(x));
	};
	SysExps.prototype.abs = function (ret, x) {
		ret.set_float(Math.abs(x));
	};
	SysExps.prototype.round = function (ret, x) {
		ret.set_int(Math.round(x));
	};
	SysExps.prototype.floor = function (ret, x) {
		ret.set_int(Math.floor(x));
	};
	SysExps.prototype.ceil = function (ret, x) {
		ret.set_int(Math.ceil(x));
	};
	SysExps.prototype.sin = function (ret, x) {
		ret.set_float(Math.sin(cr.to_radians(x)));
	};
	SysExps.prototype.cos = function (ret, x) {
		ret.set_float(Math.cos(cr.to_radians(x)));
	};
	SysExps.prototype.tan = function (ret, x) {
		ret.set_float(Math.tan(cr.to_radians(x)));
	};
	SysExps.prototype.asin = function (ret, x) {
		ret.set_float(cr.to_degrees(Math.asin(x)));
	};
	SysExps.prototype.acos = function (ret, x) {
		ret.set_float(cr.to_degrees(Math.acos(x)));
	};
	SysExps.prototype.atan = function (ret, x) {
		ret.set_float(cr.to_degrees(Math.atan(x)));
	};
	SysExps.prototype.exp = function (ret, x) {
		ret.set_float(Math.exp(x));
	};
	SysExps.prototype.ln = function (ret, x) {
		ret.set_float(Math.log(x));
	};
	SysExps.prototype.log10 = function (ret, x) {
		ret.set_float(Math.log(x) / Math.LN10);
	};
	SysExps.prototype.max = function (ret) {
		var max_ = arguments[1];
		if (typeof max_ !== "number")
			max_ = 0;
		var i, len, a;
		for (i = 2, len = arguments.length; i < len; i++) {
			a = arguments[i];
			if (typeof a !== "number")
				continue;		// ignore non-numeric types
			if (max_ < a)
				max_ = a;
		}
		ret.set_float(max_);
	};
	SysExps.prototype.min = function (ret) {
		var min_ = arguments[1];
		if (typeof min_ !== "number")
			min_ = 0;
		var i, len, a;
		for (i = 2, len = arguments.length; i < len; i++) {
			a = arguments[i];
			if (typeof a !== "number")
				continue;		// ignore non-numeric types
			if (min_ > a)
				min_ = a;
		}
		ret.set_float(min_);
	};
	SysExps.prototype.dt = function (ret) {
		ret.set_float(this.runtime.dt);
	};
	SysExps.prototype.timescale = function (ret) {
		ret.set_float(this.runtime.timescale);
	};
	SysExps.prototype.wallclocktime = function (ret) {
		ret.set_float((Date.now() - this.runtime.start_time) / 1000.0);
	};
	SysExps.prototype.time = function (ret) {
		ret.set_float(this.runtime.kahanTime.sum);
	};
	SysExps.prototype.tickcount = function (ret) {
		ret.set_int(this.runtime.tickcount);
	};
	SysExps.prototype.objectcount = function (ret) {
		ret.set_int(this.runtime.objectcount);
	};
	SysExps.prototype.fps = function (ret) {
		ret.set_int(this.runtime.fps);
	};
	SysExps.prototype.loopindex = function (ret, name_) {
		var loop, i, len;
		if (!this.runtime.loop_stack.length) {
			ret.set_int(0);
			return;
		}
		if (name_) {
			for (i = this.runtime.loop_stack_index; i >= 0; --i) {
				loop = this.runtime.loop_stack[i];
				if (loop.name === name_) {
					ret.set_int(loop.index);
					return;
				}
			}
			ret.set_int(0);
		}
		else {
			loop = this.runtime.getCurrentLoop();
			ret.set_int(loop ? loop.index : -1);
		}
	};
	SysExps.prototype.distance = function (ret, x1, y1, x2, y2) {
		ret.set_float(cr.distanceTo(x1, y1, x2, y2));
	};
	SysExps.prototype.angle = function (ret, x1, y1, x2, y2) {
		ret.set_float(cr.to_degrees(cr.angleTo(x1, y1, x2, y2)));
	};
	SysExps.prototype.scrollx = function (ret) {
		ret.set_float(this.runtime.running_layout.scrollX);
	};
	SysExps.prototype.scrolly = function (ret) {
		ret.set_float(this.runtime.running_layout.scrollY);
	};
	SysExps.prototype.newline = function (ret) {
		ret.set_string("\n");
	};
	SysExps.prototype.lerp = function (ret, a, b, x) {
		ret.set_float(cr.lerp(a, b, x));
	};
	SysExps.prototype.qarp = function (ret, a, b, c, x) {
		ret.set_float(cr.qarp(a, b, c, x));
	};
	SysExps.prototype.cubic = function (ret, a, b, c, d, x) {
		ret.set_float(cr.cubic(a, b, c, d, x));
	};
	SysExps.prototype.cosp = function (ret, a, b, x) {
		ret.set_float(cr.cosp(a, b, x));
	};
	SysExps.prototype.windowwidth = function (ret) {
		ret.set_int(this.runtime.width);
	};
	SysExps.prototype.windowheight = function (ret) {
		ret.set_int(this.runtime.height);
	};
	SysExps.prototype.uppercase = function (ret, str) {
		ret.set_string(cr.is_string(str) ? str.toUpperCase() : "");
	};
	SysExps.prototype.lowercase = function (ret, str) {
		ret.set_string(cr.is_string(str) ? str.toLowerCase() : "");
	};
	SysExps.prototype.clamp = function (ret, x, l, u) {
		if (x < l)
			ret.set_float(l);
		else if (x > u)
			ret.set_float(u);
		else
			ret.set_float(x);
	};
	SysExps.prototype.layerscale = function (ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(layer.scale);
	};
	SysExps.prototype.layeropacity = function (ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(layer.opacity * 100);
	};
	SysExps.prototype.layerscalerate = function (ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(layer.zoomRate);
	};
	SysExps.prototype.layerparallaxx = function (ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(layer.parallaxX * 100);
	};
	SysExps.prototype.layerparallaxy = function (ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(layer.parallaxY * 100);
	};
	SysExps.prototype.layerindex = function (ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_int(-1);
		else
			ret.set_int(layer.index);
	};
	SysExps.prototype.layoutscale = function (ret) {
		if (this.runtime.running_layout)
			ret.set_float(this.runtime.running_layout.scale);
		else
			ret.set_float(0);
	};
	SysExps.prototype.layoutangle = function (ret) {
		ret.set_float(cr.to_degrees(this.runtime.running_layout.angle));
	};
	SysExps.prototype.layerangle = function (ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		if (!layer)
			ret.set_float(0);
		else
			ret.set_float(cr.to_degrees(layer.angle));
	};
	SysExps.prototype.layoutwidth = function (ret) {
		ret.set_int(this.runtime.running_layout.width);
	};
	SysExps.prototype.layoutheight = function (ret) {
		ret.set_int(this.runtime.running_layout.height);
	};
	SysExps.prototype.find = function (ret, text, searchstr) {
		if (cr.is_string(text) && cr.is_string(searchstr))
			ret.set_int(text.search(new RegExp(cr.regexp_escape(searchstr), "i")));
		else
			ret.set_int(-1);
	};
	SysExps.prototype.findcase = function (ret, text, searchstr) {
		if (cr.is_string(text) && cr.is_string(searchstr))
			ret.set_int(text.search(new RegExp(cr.regexp_escape(searchstr), "")));
		else
			ret.set_int(-1);
	};
	SysExps.prototype.left = function (ret, text, n) {
		ret.set_string(cr.is_string(text) ? text.substr(0, n) : "");
	};
	SysExps.prototype.right = function (ret, text, n) {
		ret.set_string(cr.is_string(text) ? text.substr(text.length - n) : "");
	};
	SysExps.prototype.mid = function (ret, text, index_, length_) {
		ret.set_string(cr.is_string(text) ? text.substr(index_, length_) : "");
	};
	SysExps.prototype.tokenat = function (ret, text, index_, sep) {
		if (cr.is_string(text) && cr.is_string(sep)) {
			var arr = text.split(sep);
			var i = cr.floor(index_);
			if (i < 0 || i >= arr.length)
				ret.set_string("");
			else
				ret.set_string(arr[i]);
		}
		else
			ret.set_string("");
	};
	SysExps.prototype.tokencount = function (ret, text, sep) {
		if (cr.is_string(text) && text.length)
			ret.set_int(text.split(sep).length);
		else
			ret.set_int(0);
	};
	SysExps.prototype.replace = function (ret, text, find_, replace_) {
		if (cr.is_string(text) && cr.is_string(find_) && cr.is_string(replace_))
			ret.set_string(text.replace(new RegExp(cr.regexp_escape(find_), "gi"), replace_));
		else
			ret.set_string(cr.is_string(text) ? text : "");
	};
	SysExps.prototype.trim = function (ret, text) {
		ret.set_string(cr.is_string(text) ? text.trim() : "");
	};
	SysExps.prototype.pi = function (ret) {
		ret.set_float(cr.PI);
	};
	SysExps.prototype.layoutname = function (ret) {
		if (this.runtime.running_layout)
			ret.set_string(this.runtime.running_layout.name);
		else
			ret.set_string("");
	};
	SysExps.prototype.renderer = function (ret) {
		ret.set_string(this.runtime.gl ? "webgl" : "canvas2d");
	};
	SysExps.prototype.rendererdetail = function (ret) {
		ret.set_string(this.runtime.glUnmaskedRenderer);
	};
	SysExps.prototype.anglediff = function (ret, a, b) {
		ret.set_float(cr.to_degrees(cr.angleDiff(cr.to_radians(a), cr.to_radians(b))));
	};
	SysExps.prototype.choose = function (ret) {
		var index = cr.floor(Math.random() * (arguments.length - 1));
		ret.set_any(arguments[index + 1]);
	};
	SysExps.prototype.rgb = function (ret, r, g, b) {
		ret.set_int(cr.RGB(r, g, b));
	};
	SysExps.prototype.projectversion = function (ret) {
		ret.set_string(this.runtime.versionstr);
	};
	SysExps.prototype.projectname = function (ret) {
		ret.set_string(this.runtime.projectName);
	};
	SysExps.prototype.anglelerp = function (ret, a, b, x) {
		a = cr.to_radians(a);
		b = cr.to_radians(b);
		var diff = cr.angleDiff(a, b);
		if (cr.angleClockwise(b, a)) {
			ret.set_float(cr.to_clamped_degrees(a + diff * x));
		}
		else {
			ret.set_float(cr.to_clamped_degrees(a - diff * x));
		}
	};
	SysExps.prototype.anglerotate = function (ret, a, b, c) {
		a = cr.to_radians(a);
		b = cr.to_radians(b);
		c = cr.to_radians(c);
		ret.set_float(cr.to_clamped_degrees(cr.angleRotate(a, b, c)));
	};
	SysExps.prototype.zeropad = function (ret, n, d) {
		var s = (n < 0 ? "-" : "");
		if (n < 0) n = -n;
		var zeroes = d - n.toString().length;
		for (var i = 0; i < zeroes; i++)
			s += "0";
		ret.set_string(s + n.toString());
	};
	SysExps.prototype.cpuutilisation = function (ret) {
		ret.set_float(this.runtime.cpuutilisation / 1000);
	};
	SysExps.prototype.viewportleft = function (ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewLeft : 0);
	};
	SysExps.prototype.viewporttop = function (ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewTop : 0);
	};
	SysExps.prototype.viewportright = function (ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewRight : 0);
	};
	SysExps.prototype.viewportbottom = function (ret, layerparam) {
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.viewBottom : 0);
	};
	SysExps.prototype.loadingprogress = function (ret) {
		ret.set_float(this.runtime.loadingprogress);
	};
	SysExps.prototype.unlerp = function (ret, a, b, y) {
		ret.set_float(cr.unlerp(a, b, y));
	};
	SysExps.prototype.canvassnapshot = function (ret) {
		ret.set_string(this.runtime.snapshotData);
	};
	SysExps.prototype.urlencode = function (ret, s) {
		ret.set_string(encodeURIComponent(s));
	};
	SysExps.prototype.urldecode = function (ret, s) {
		ret.set_string(decodeURIComponent(s));
	};
	SysExps.prototype.canvastolayerx = function (ret, layerparam, x, y) {
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.canvasToLayer(x, y, true) : 0);
	};
	SysExps.prototype.canvastolayery = function (ret, layerparam, x, y) {
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.canvasToLayer(x, y, false) : 0);
	};
	SysExps.prototype.layertocanvasx = function (ret, layerparam, x, y) {
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.layerToCanvas(x, y, true) : 0);
	};
	SysExps.prototype.layertocanvasy = function (ret, layerparam, x, y) {
		var layer = this.runtime.getLayer(layerparam);
		ret.set_float(layer ? layer.layerToCanvas(x, y, false) : 0);
	};
	SysExps.prototype.savestatejson = function (ret) {
		ret.set_string(this.runtime.lastSaveJson);
	};
	SysExps.prototype.imagememoryusage = function (ret) {
		if (this.runtime.glwrap)
			ret.set_float(Math.round(100 * this.runtime.glwrap.estimateVRAM() / (1024 * 1024)) / 100);
		else
			ret.set_float(0);
	};
	SysExps.prototype.regexsearch = function (ret, str_, regex_, flags_) {
		var regex = getRegex(regex_, flags_);
		ret.set_int(str_ ? str_.search(regex) : -1);
	};
	SysExps.prototype.regexreplace = function (ret, str_, regex_, flags_, replace_) {
		var regex = getRegex(regex_, flags_);
		ret.set_string(str_ ? str_.replace(regex, replace_) : "");
	};
	var regexMatches = [];
	var lastMatchesStr = "";
	var lastMatchesRegex = "";
	var lastMatchesFlags = "";

	function updateRegexMatches(str_, regex_, flags_) {
		if (str_ === lastMatchesStr && regex_ === lastMatchesRegex && flags_ === lastMatchesFlags)
			return;
		var regex = getRegex(regex_, flags_);
		regexMatches = str_.match(regex);
		lastMatchesStr = str_;
		lastMatchesRegex = regex_;
		lastMatchesFlags = flags_;
	};
	SysExps.prototype.regexmatchcount = function (ret, str_, regex_, flags_) {
		var regex = getRegex(regex_, flags_);
		updateRegexMatches(str_, regex_, flags_);
		ret.set_int(regexMatches ? regexMatches.length : 0);
	};
	SysExps.prototype.regexmatchat = function (ret, str_, regex_, flags_, index_) {
		index_ = Math.floor(index_);
		var regex = getRegex(regex_, flags_);
		updateRegexMatches(str_, regex_, flags_);
		if (!regexMatches || index_ < 0 || index_ >= regexMatches.length)
			ret.set_string("");
		else
			ret.set_string(regexMatches[index_]);
	};
	SysExps.prototype.infinity = function (ret) {
		ret.set_float(Infinity);
	};
	SysExps.prototype.setbit = function (ret, n, b, v) {
		n = n | 0;
		b = b | 0;
		v = (v !== 0 ? 1 : 0);
		ret.set_int((n & ~(1 << b)) | (v << b));
	};
	SysExps.prototype.togglebit = function (ret, n, b) {
		n = n | 0;
		b = b | 0;
		ret.set_int(n ^ (1 << b));
	};
	SysExps.prototype.getbit = function (ret, n, b) {
		n = n | 0;
		b = b | 0;
		ret.set_int((n & (1 << b)) ? 1 : 0);
	};
	SysExps.prototype.originalwindowwidth = function (ret) {
		ret.set_int(this.runtime.original_width);
	};
	SysExps.prototype.originalwindowheight = function (ret) {
		ret.set_int(this.runtime.original_height);
	};
	sysProto.exps = new SysExps();
	sysProto.runWaits = function () {
		var i, j, len, w, k, s, ss;
		var evinfo = this.runtime.getCurrentEventStack();
		for (i = 0, len = this.waits.length; i < len; i++) {
			w = this.waits[i];
			if (w.time === -1)		// signalled wait
			{
				if (!w.signalled)
					continue;		// not yet signalled
			}
			else					// timer wait
			{
				if (w.time > this.runtime.kahanTime.sum)
					continue;		// timer not yet expired
			}
			evinfo.current_event = w.ev;
			evinfo.actindex = w.actindex;
			evinfo.cndindex = 0;
			for (k in w.sols) {
				if (w.sols.hasOwnProperty(k)) {
					s = this.runtime.types_by_index[parseInt(k, 10)].getCurrentSol();
					ss = w.sols[k];
					s.select_all = ss.sa;
					cr.shallowAssignArray(s.instances, ss.insts);
					freeSolStateObject(ss);
				}
			}
			w.ev.resume_actions_and_subevents();
			this.runtime.clearSol(w.solModifiers);
			w.deleteme = true;
		}
		for (i = 0, j = 0, len = this.waits.length; i < len; i++) {
			w = this.waits[i];
			this.waits[j] = w;
			if (w.deleteme)
				freeWaitObject(w);
			else
				j++;
		}
		cr.truncateArray(this.waits, j);
	};
}());


(function () {
	cr.add_common_aces = function (m, pluginProto) {
		var singleglobal_ = m[1];
		var position_aces = m[3];
		var size_aces = m[4];
		var angle_aces = m[5];
		var appearance_aces = m[6];
		var zorder_aces = m[7];
		var effects_aces = m[8];
		if (!pluginProto.cnds)
			pluginProto.cnds = {};
		if (!pluginProto.acts)
			pluginProto.acts = {};
		if (!pluginProto.exps)
			pluginProto.exps = {};
		var cnds = pluginProto.cnds;
		var acts = pluginProto.acts;
		var exps = pluginProto.exps;
		if (position_aces) {
			cnds.CompareX = function (cmp, x) {
				return cr.do_cmp(this.x, cmp, x);
			};
			cnds.CompareY = function (cmp, y) {
				return cr.do_cmp(this.y, cmp, y);
			};
			cnds.IsOnScreen = function () {
				var layer = this.layer;
				this.update_bbox();
				var bbox = this.bbox;
				return !(bbox.right < layer.viewLeft || bbox.bottom < layer.viewTop || bbox.left > layer.viewRight || bbox.top > layer.viewBottom);
			};
			cnds.IsOutsideLayout = function () {
				this.update_bbox();
				var bbox = this.bbox;
				var layout = this.runtime.running_layout;
				return (bbox.right < 0 || bbox.bottom < 0 || bbox.left > layout.width || bbox.top > layout.height);
			};
			cnds.PickDistance = function (which, x, y) {
				var sol = this.getCurrentSol();
				var instances = sol.getObjects();
				if (!instances.length)
					return false;
				var inst = instances[0];
				var pickme = inst;
				var dist = cr.distanceTo(inst.x, inst.y, x, y);
				var i, len, d;
				for (i = 1, len = instances.length; i < len; i++) {
					inst = instances[i];
					d = cr.distanceTo(inst.x, inst.y, x, y);
					if ((which === 0 && d < dist) || (which === 1 && d > dist)) {
						dist = d;
						pickme = inst;
					}
				}
				sol.pick_one(pickme);
				return true;
			};
			acts.SetX = function (x) {
				if (this.x !== x) {
					this.x = x;
					this.set_bbox_changed();
				}
			};
			acts.SetY = function (y) {
				if (this.y !== y) {
					this.y = y;
					this.set_bbox_changed();
				}
			};
			acts.SetPos = function (x, y) {
				if (this.x !== x || this.y !== y) {
					this.x = x;
					this.y = y;
					this.set_bbox_changed();
				}
			};
			acts.SetPosToObject = function (obj, imgpt) {
				var inst = obj.getPairedInstance(this);
				if (!inst)
					return;
				var newx, newy;
				if (inst.getImagePoint) {
					newx = inst.getImagePoint(imgpt, true);
					newy = inst.getImagePoint(imgpt, false);
				}
				else {
					newx = inst.x;
					newy = inst.y;
				}
				if (this.x !== newx || this.y !== newy) {
					this.x = newx;
					this.y = newy;
					this.set_bbox_changed();
				}
			};
			acts.MoveForward = function (dist) {
				if (dist !== 0) {
					this.x += Math.cos(this.angle) * dist;
					this.y += Math.sin(this.angle) * dist;
					this.set_bbox_changed();
				}
			};
			acts.MoveAtAngle = function (a, dist) {
				if (dist !== 0) {
					this.x += Math.cos(cr.to_radians(a)) * dist;
					this.y += Math.sin(cr.to_radians(a)) * dist;
					this.set_bbox_changed();
				}
			};
			exps.X = function (ret) {
				ret.set_float(this.x);
			};
			exps.Y = function (ret) {
				ret.set_float(this.y);
			};
			exps.dt = function (ret) {
				ret.set_float(this.runtime.getDt(this));
			};
		}
		if (size_aces) {
			cnds.CompareWidth = function (cmp, w) {
				return cr.do_cmp(this.width, cmp, w);
			};
			cnds.CompareHeight = function (cmp, h) {
				return cr.do_cmp(this.height, cmp, h);
			};
			acts.SetWidth = function (w) {
				if (this.width !== w) {
					this.width = w;
					this.set_bbox_changed();
				}
			};
			acts.SetHeight = function (h) {
				if (this.height !== h) {
					this.height = h;
					this.set_bbox_changed();
				}
			};
			acts.SetSize = function (w, h) {
				if (this.width !== w || this.height !== h) {
					this.width = w;
					this.height = h;
					this.set_bbox_changed();
				}
			};
			exps.Width = function (ret) {
				ret.set_float(this.width);
			};
			exps.Height = function (ret) {
				ret.set_float(this.height);
			};
			exps.BBoxLeft = function (ret) {
				this.update_bbox();
				ret.set_float(this.bbox.left);
			};
			exps.BBoxTop = function (ret) {
				this.update_bbox();
				ret.set_float(this.bbox.top);
			};
			exps.BBoxRight = function (ret) {
				this.update_bbox();
				ret.set_float(this.bbox.right);
			};
			exps.BBoxBottom = function (ret) {
				this.update_bbox();
				ret.set_float(this.bbox.bottom);
			};
		}
		if (angle_aces) {
			cnds.AngleWithin = function (within, a) {
				return cr.angleDiff(this.angle, cr.to_radians(a)) <= cr.to_radians(within);
			};
			cnds.IsClockwiseFrom = function (a) {
				return cr.angleClockwise(this.angle, cr.to_radians(a));
			};
			cnds.IsBetweenAngles = function (a, b) {
				var lower = cr.to_clamped_radians(a);
				var upper = cr.to_clamped_radians(b);
				var angle = cr.clamp_angle(this.angle);
				var obtuse = (!cr.angleClockwise(upper, lower));
				if (obtuse)
					return !(!cr.angleClockwise(angle, lower) && cr.angleClockwise(angle, upper));
				else
					return cr.angleClockwise(angle, lower) && !cr.angleClockwise(angle, upper);
			};
			acts.SetAngle = function (a) {
				var newangle = cr.to_radians(cr.clamp_angle_degrees(a));
				if (isNaN(newangle))
					return;
				if (this.angle !== newangle) {
					this.angle = newangle;
					this.set_bbox_changed();
				}
			};
			acts.RotateClockwise = function (a) {
				if (a !== 0 && !isNaN(a)) {
					this.angle += cr.to_radians(a);
					this.angle = cr.clamp_angle(this.angle);
					this.set_bbox_changed();
				}
			};
			acts.RotateCounterclockwise = function (a) {
				if (a !== 0 && !isNaN(a)) {
					this.angle -= cr.to_radians(a);
					this.angle = cr.clamp_angle(this.angle);
					this.set_bbox_changed();
				}
			};
			acts.RotateTowardAngle = function (amt, target) {
				var newangle = cr.angleRotate(this.angle, cr.to_radians(target), cr.to_radians(amt));
				if (isNaN(newangle))
					return;
				if (this.angle !== newangle) {
					this.angle = newangle;
					this.set_bbox_changed();
				}
			};
			acts.RotateTowardPosition = function (amt, x, y) {
				var dx = x - this.x;
				var dy = y - this.y;
				var target = Math.atan2(dy, dx);
				var newangle = cr.angleRotate(this.angle, target, cr.to_radians(amt));
				if (isNaN(newangle))
					return;
				if (this.angle !== newangle) {
					this.angle = newangle;
					this.set_bbox_changed();
				}
			};
			acts.SetTowardPosition = function (x, y) {
				var dx = x - this.x;
				var dy = y - this.y;
				var newangle = Math.atan2(dy, dx);
				if (isNaN(newangle))
					return;
				if (this.angle !== newangle) {
					this.angle = newangle;
					this.set_bbox_changed();
				}
			};
			exps.Angle = function (ret) {
				ret.set_float(cr.to_clamped_degrees(this.angle));
			};
		}
		if (!singleglobal_) {
			cnds.CompareInstanceVar = function (iv, cmp, val) {
				return cr.do_cmp(this.instance_vars[iv], cmp, val);
			};
			cnds.IsBoolInstanceVarSet = function (iv) {
				return this.instance_vars[iv];
			};
			cnds.PickInstVarHiLow = function (which, iv) {
				var sol = this.getCurrentSol();
				var instances = sol.getObjects();
				if (!instances.length)
					return false;
				var inst = instances[0];
				var pickme = inst;
				var val = inst.instance_vars[iv];
				var i, len, v;
				for (i = 1, len = instances.length; i < len; i++) {
					inst = instances[i];
					v = inst.instance_vars[iv];
					if ((which === 0 && v < val) || (which === 1 && v > val)) {
						val = v;
						pickme = inst;
					}
				}
				sol.pick_one(pickme);
				return true;
			};
			cnds.PickByUID = function (u) {
				var i, len, j, inst, families, instances, sol;
				var cnd = this.runtime.getCurrentCondition();
				if (cnd.inverted) {
					sol = this.getCurrentSol();
					if (sol.select_all) {
						sol.select_all = false;
						cr.clearArray(sol.instances);
						cr.clearArray(sol.else_instances);
						instances = this.instances;
						for (i = 0, len = instances.length; i < len; i++) {
							inst = instances[i];
							if (inst.uid === u)
								sol.else_instances.push(inst);
							else
								sol.instances.push(inst);
						}
						this.applySolToContainer();
						return !!sol.instances.length;
					}
					else {
						for (i = 0, j = 0, len = sol.instances.length; i < len; i++) {
							inst = sol.instances[i];
							sol.instances[j] = inst;
							if (inst.uid === u) {
								sol.else_instances.push(inst);
							}
							else
								j++;
						}
						cr.truncateArray(sol.instances, j);
						this.applySolToContainer();
						return !!sol.instances.length;
					}
				}
				else {
					inst = this.runtime.getObjectByUID(u);
					if (!inst)
						return false;
					sol = this.getCurrentSol();
					if (!sol.select_all && sol.instances.indexOf(inst) === -1)
						return false;		// not picked
					if (this.is_family) {
						families = inst.type.families;
						for (i = 0, len = families.length; i < len; i++) {
							if (families[i] === this) {
								sol.pick_one(inst);
								this.applySolToContainer();
								return true;
							}
						}
					}
					else if (inst.type === this) {
						sol.pick_one(inst);
						this.applySolToContainer();
						return true;
					}
					return false;
				}
			};
			cnds.OnCreated = function () {
				return true;
			};
			cnds.OnDestroyed = function () {
				return true;
			};
			acts.SetInstanceVar = function (iv, val) {
				var myinstvars = this.instance_vars;
				if (cr.is_number(myinstvars[iv])) {
					if (cr.is_number(val))
						myinstvars[iv] = val;
					else
						myinstvars[iv] = parseFloat(val);
				}
				else if (cr.is_string(myinstvars[iv])) {
					if (cr.is_string(val))
						myinstvars[iv] = val;
					else
						myinstvars[iv] = val.toString();
				}
				else
					;
			};
			acts.AddInstanceVar = function (iv, val) {
				var myinstvars = this.instance_vars;
				if (cr.is_number(myinstvars[iv])) {
					if (cr.is_number(val))
						myinstvars[iv] += val;
					else
						myinstvars[iv] += parseFloat(val);
				}
				else if (cr.is_string(myinstvars[iv])) {
					if (cr.is_string(val))
						myinstvars[iv] += val;
					else
						myinstvars[iv] += val.toString();
				}
				else
					;
			};
			acts.SubInstanceVar = function (iv, val) {
				var myinstvars = this.instance_vars;
				if (cr.is_number(myinstvars[iv])) {
					if (cr.is_number(val))
						myinstvars[iv] -= val;
					else
						myinstvars[iv] -= parseFloat(val);
				}
				else
					;
			};
			acts.SetBoolInstanceVar = function (iv, val) {
				this.instance_vars[iv] = val ? 1 : 0;
			};
			acts.ToggleBoolInstanceVar = function (iv) {
				this.instance_vars[iv] = 1 - this.instance_vars[iv];
			};
			acts.Destroy = function () {
				this.runtime.DestroyInstance(this);
			};
			if (!acts.LoadFromJsonString) {
				acts.LoadFromJsonString = function (str_) {
					var o, i, len, binst;
					try {
						o = JSON.parse(str_);
					}
					catch (e) {
						return;
					}
					this.runtime.loadInstanceFromJSON(this, o, true);
					if (this.afterLoad)
						this.afterLoad();
					if (this.behavior_insts) {
						for (i = 0, len = this.behavior_insts.length; i < len; ++i) {
							binst = this.behavior_insts[i];
							if (binst.afterLoad)
								binst.afterLoad();
						}
					}
				};
			}
			exps.Count = function (ret) {
				var count = ret.object_class.instances.length;
				var i, len, inst;
				for (i = 0, len = this.runtime.createRow.length; i < len; i++) {
					inst = this.runtime.createRow[i];
					if (ret.object_class.is_family) {
						if (inst.type.families.indexOf(ret.object_class) >= 0)
							count++;
					}
					else {
						if (inst.type === ret.object_class)
							count++;
					}
				}
				ret.set_int(count);
			};
			exps.PickedCount = function (ret) {
				ret.set_int(ret.object_class.getCurrentSol().getObjects().length);
			};
			exps.UID = function (ret) {
				ret.set_int(this.uid);
			};
			exps.IID = function (ret) {
				ret.set_int(this.get_iid());
			};
			if (!exps.AsJSON) {
				exps.AsJSON = function (ret) {
					ret.set_string(JSON.stringify(this.runtime.saveInstanceToJSON(this, true)));
				};
			}
		}
		if (appearance_aces) {
			cnds.IsVisible = function () {
				return this.visible;
			};
			acts.SetVisible = function (v) {
				if (!v !== !this.visible) {
					this.visible = !!v;
					this.runtime.redraw = true;
				}
			};
			cnds.CompareOpacity = function (cmp, x) {
				return cr.do_cmp(cr.round6dp(this.opacity * 100), cmp, x);
			};
			acts.SetOpacity = function (x) {
				var new_opacity = x / 100.0;
				if (new_opacity < 0)
					new_opacity = 0;
				else if (new_opacity > 1)
					new_opacity = 1;
				if (new_opacity !== this.opacity) {
					this.opacity = new_opacity;
					this.runtime.redraw = true;
				}
			};
			exps.Opacity = function (ret) {
				ret.set_float(cr.round6dp(this.opacity * 100.0));
			};
		}
		if (zorder_aces) {
			cnds.IsOnLayer = function (layer_) {
				if (!layer_)
					return false;
				return this.layer === layer_;
			};
			cnds.PickTopBottom = function (which_) {
				var sol = this.getCurrentSol();
				var instances = sol.getObjects();
				if (!instances.length)
					return false;
				var inst = instances[0];
				var pickme = inst;
				var i, len;
				for (i = 1, len = instances.length; i < len; i++) {
					inst = instances[i];
					if (which_ === 0) {
						if (inst.layer.index > pickme.layer.index || (inst.layer.index === pickme.layer.index && inst.get_zindex() > pickme.get_zindex())) {
							pickme = inst;
						}
					}
					else {
						if (inst.layer.index < pickme.layer.index || (inst.layer.index === pickme.layer.index && inst.get_zindex() < pickme.get_zindex())) {
							pickme = inst;
						}
					}
				}
				sol.pick_one(pickme);
				return true;
			};
			acts.MoveToTop = function () {
				var layer = this.layer;
				var layer_instances = layer.instances;
				if (layer_instances.length && layer_instances[layer_instances.length - 1] === this)
					return;		// is already at top
				layer.removeFromInstanceList(this, false);
				layer.appendToInstanceList(this, false);
				this.runtime.redraw = true;
			};
			acts.MoveToBottom = function () {
				var layer = this.layer;
				var layer_instances = layer.instances;
				if (layer_instances.length && layer_instances[0] === this)
					return;		// is already at bottom
				layer.removeFromInstanceList(this, false);
				layer.prependToInstanceList(this, false);
				this.runtime.redraw = true;
			};
			acts.MoveToLayer = function (layerMove) {
				if (!layerMove || layerMove == this.layer)
					return;
				this.layer.removeFromInstanceList(this, true);
				this.layer = layerMove;
				layerMove.appendToInstanceList(this, true);
				this.runtime.redraw = true;
			};
			acts.ZMoveToObject = function (where_, obj_) {
				var isafter = (where_ === 0);
				if (!obj_)
					return;
				var other = obj_.getFirstPicked(this);
				if (!other || other.uid === this.uid)
					return;
				if (this.layer.index !== other.layer.index) {
					this.layer.removeFromInstanceList(this, true);
					this.layer = other.layer;
					other.layer.appendToInstanceList(this, true);
				}
				this.layer.moveInstanceAdjacent(this, other, isafter);
				this.runtime.redraw = true;
			};
			exps.LayerNumber = function (ret) {
				ret.set_int(this.layer.number);
			};
			exps.LayerName = function (ret) {
				ret.set_string(this.layer.name);
			};
			exps.ZIndex = function (ret) {
				ret.set_int(this.get_zindex());
			};
		}
		if (effects_aces) {
			acts.SetEffectEnabled = function (enable_, effectname_) {
				if (!this.runtime.glwrap)
					return;
				var i = this.type.getEffectIndexByName(effectname_);
				if (i < 0)
					return;		// effect name not found
				var enable = (enable_ === 1);
				if (this.active_effect_flags[i] === enable)
					return;		// no change
				this.active_effect_flags[i] = enable;
				this.updateActiveEffects();
				this.runtime.redraw = true;
			};
			acts.SetEffectParam = function (effectname_, index_, value_) {
				if (!this.runtime.glwrap)
					return;
				var i = this.type.getEffectIndexByName(effectname_);
				if (i < 0)
					return;		// effect name not found
				var et = this.type.effect_types[i];
				var params = this.effect_params[i];
				index_ = Math.floor(index_);
				if (index_ < 0 || index_ >= params.length)
					return;		// effect index out of bounds
				if (this.runtime.glwrap.getProgramParameterType(et.shaderindex, index_) === 1)
					value_ /= 100.0;
				if (params[index_] === value_)
					return;		// no change
				params[index_] = value_;
				if (et.active)
					this.runtime.redraw = true;
			};
		}
	};
	cr.set_bbox_changed = function () {
		this.bbox_changed = true;      		// will recreate next time box requested
		this.cell_changed = true;
		this.type.any_cell_changed = true;	// avoid unnecessary updateAllBBox() calls
		this.runtime.redraw = true;     	// assume runtime needs to redraw
		var i, len, callbacks = this.bbox_changed_callbacks;
		for (i = 0, len = callbacks.length; i < len; ++i) {
			callbacks[i](this);
		}
		if (this.layer.useRenderCells)
			this.update_bbox();
	};
	cr.add_bbox_changed_callback = function (f) {
		if (f) {
			this.bbox_changed_callbacks.push(f);
		}
	};
	cr.update_bbox = function () {
		if (!this.bbox_changed)
			return;                 // bounding box not changed
		var bbox = this.bbox;
		var bquad = this.bquad;
		bbox.set(this.x, this.y, this.x + this.width, this.y + this.height);
		bbox.offset(-this.hotspotX * this.width, -this.hotspotY * this.height);
		if (!this.angle) {
			bquad.set_from_rect(bbox);    // make bounding quad from box
		}
		else {
			bbox.offset(-this.x, -this.y);       			// translate to origin
			bquad.set_from_rotated_rect(bbox, this.angle);	// rotate around origin
			bquad.offset(this.x, this.y);      				// translate back to original position
			bquad.bounding_box(bbox);
		}
		bbox.normalize();
		this.bbox_changed = false;  // bounding box up to date
		this.update_render_cell();
	};
	var tmprc = new cr.rect(0, 0, 0, 0);
	cr.update_render_cell = function () {
		if (!this.layer.useRenderCells)
			return;
		var mygrid = this.layer.render_grid;
		var bbox = this.bbox;
		tmprc.set(mygrid.XToCell(bbox.left), mygrid.YToCell(bbox.top), mygrid.XToCell(bbox.right), mygrid.YToCell(bbox.bottom));
		if (this.rendercells.equals(tmprc))
			return;
		if (this.rendercells.right < this.rendercells.left)
			mygrid.update(this, null, tmprc);		// first insertion with invalid rect: don't provide old range
		else
			mygrid.update(this, this.rendercells, tmprc);
		this.rendercells.copy(tmprc);
		this.layer.render_list_stale = true;
	};
	cr.update_collision_cell = function () {
		if (!this.cell_changed || !this.collisionsEnabled)
			return;
		this.update_bbox();
		var mygrid = this.type.collision_grid;
		var bbox = this.bbox;
		tmprc.set(mygrid.XToCell(bbox.left), mygrid.YToCell(bbox.top), mygrid.XToCell(bbox.right), mygrid.YToCell(bbox.bottom));
		if (this.collcells.equals(tmprc))
			return;
		if (this.collcells.right < this.collcells.left)
			mygrid.update(this, null, tmprc);		// first insertion with invalid rect: don't provide old range
		else
			mygrid.update(this, this.collcells, tmprc);
		this.collcells.copy(tmprc);
		this.cell_changed = false;
	};
	cr.inst_contains_pt = function (x, y) {
		if (!this.bbox.contains_pt(x, y))
			return false;
		if (!this.bquad.contains_pt(x, y))
			return false;
		if (this.collision_poly && !this.collision_poly.is_empty()) {
			this.collision_poly.cache_poly(this.width, this.height, this.angle);
			return this.collision_poly.contains_pt(x - this.x, y - this.y);
		}
		else
			return true;
	};
	cr.inst_get_iid = function () {
		this.type.updateIIDs();
		return this.iid;
	};
	cr.inst_get_zindex = function () {
		this.layer.updateZIndices();
		return this.zindex;
	};
	cr.inst_updateActiveEffects = function () {
		cr.clearArray(this.active_effect_types);
		var i, len, et;
		var preserves_opaqueness = true;
		for (i = 0, len = this.active_effect_flags.length; i < len; i++) {
			if (this.active_effect_flags[i]) {
				et = this.type.effect_types[i];
				this.active_effect_types.push(et);
				if (!et.preservesOpaqueness)
					preserves_opaqueness = false;
			}
		}
		this.uses_shaders = !!this.active_effect_types.length;
		this.shaders_preserve_opaqueness = preserves_opaqueness;
	};
	cr.inst_toString = function () {
		return "Inst" + this.puid;
	};
	cr.type_getFirstPicked = function (frominst) {
		if (frominst && frominst.is_contained && frominst.type != this) {
			var i, len, s;
			for (i = 0, len = frominst.siblings.length; i < len; i++) {
				s = frominst.siblings[i];
				if (s.type == this)
					return s;
			}
		}
		var instances = this.getCurrentSol().getObjects();
		if (instances.length)
			return instances[0];
		else
			return null;
	};
	cr.type_getPairedInstance = function (inst) {
		var instances = this.getCurrentSol().getObjects();
		if (instances.length)
			return instances[inst.get_iid() % instances.length];
		else
			return null;
	};
	cr.type_updateIIDs = function () {
		if (!this.stale_iids || this.is_family)
			return;		// up to date or is family - don't want family to overwrite IIDs
		var i, len;
		for (i = 0, len = this.instances.length; i < len; i++)
			this.instances[i].iid = i;
		var next_iid = i;
		var createRow = this.runtime.createRow;
		for (i = 0, len = createRow.length; i < len; ++i) {
			if (createRow[i].type === this)
				createRow[i].iid = next_iid++;
		}
		this.stale_iids = false;
	};
	cr.type_getInstanceByIID = function (i) {
		if (i < this.instances.length)
			return this.instances[i];
		i -= this.instances.length;
		var createRow = this.runtime.createRow;
		var j, lenj;
		for (j = 0, lenj = createRow.length; j < lenj; ++j) {
			if (createRow[j].type === this) {
				if (i === 0)
					return createRow[j];
				--i;
			}
		}
		;
		return null;
	};
	cr.type_getCurrentSol = function () {
		return this.solstack[this.cur_sol];
	};
	cr.type_pushCleanSol = function () {
		this.cur_sol++;
		if (this.cur_sol === this.solstack.length) {
			this.solstack.push(new cr.selection(this));
		}
		else {
			this.solstack[this.cur_sol].select_all = true;  // else clear next SOL
			cr.clearArray(this.solstack[this.cur_sol].else_instances);
		}
	};
	cr.type_pushCopySol = function () {
		this.cur_sol++;
		if (this.cur_sol === this.solstack.length)
			this.solstack.push(new cr.selection(this));
		var clonesol = this.solstack[this.cur_sol];
		var prevsol = this.solstack[this.cur_sol - 1];
		if (prevsol.select_all) {
			clonesol.select_all = true;
			cr.clearArray(clonesol.else_instances);
		}
		else {
			clonesol.select_all = false;
			cr.shallowAssignArray(clonesol.instances, prevsol.instances);
			cr.shallowAssignArray(clonesol.else_instances, prevsol.else_instances);
		}
	};
	cr.type_popSol = function () {
		;
		this.cur_sol--;
	};
	cr.type_getBehaviorByName = function (behname) {
		var i, len, j, lenj, f, index = 0;
		if (!this.is_family) {
			for (i = 0, len = this.families.length; i < len; i++) {
				f = this.families[i];
				for (j = 0, lenj = f.behaviors.length; j < lenj; j++) {
					if (behname === f.behaviors[j].name) {
						this.extra["lastBehIndex"] = index;
						return f.behaviors[j];
					}
					index++;
				}
			}
		}
		for (i = 0, len = this.behaviors.length; i < len; i++) {
			if (behname === this.behaviors[i].name) {
				this.extra["lastBehIndex"] = index;
				return this.behaviors[i];
			}
			index++;
		}
		return null;
	};
	cr.type_getBehaviorIndexByName = function (behname) {
		var b = this.getBehaviorByName(behname);
		if (b)
			return this.extra["lastBehIndex"];
		else
			return -1;
	};
	cr.type_getEffectIndexByName = function (name_) {
		var i, len;
		for (i = 0, len = this.effect_types.length; i < len; i++) {
			if (this.effect_types[i].name === name_)
				return i;
		}
		return -1;
	};
	cr.type_applySolToContainer = function () {
		if (!this.is_contained || this.is_family)
			return;
		var i, len, j, lenj, t, sol, sol2;
		this.updateIIDs();
		sol = this.getCurrentSol();
		var select_all = sol.select_all;
		var es = this.runtime.getCurrentEventStack();
		var orblock = es && es.current_event && es.current_event.orblock;
		for (i = 0, len = this.container.length; i < len; i++) {
			t = this.container[i];
			if (t === this)
				continue;
			t.updateIIDs();
			sol2 = t.getCurrentSol();
			sol2.select_all = select_all;
			if (!select_all) {
				cr.clearArray(sol2.instances);
				for (j = 0, lenj = sol.instances.length; j < lenj; ++j)
					sol2.instances[j] = t.getInstanceByIID(sol.instances[j].iid);
				if (orblock) {
					cr.clearArray(sol2.else_instances);
					for (j = 0, lenj = sol.else_instances.length; j < lenj; ++j)
						sol2.else_instances[j] = t.getInstanceByIID(sol.else_instances[j].iid);
				}
			}
		}
	};
	cr.type_toString = function () {
		return "Type" + this.sid;
	};
	cr.do_cmp = function (x, cmp, y) {
		if (typeof x === "undefined" || typeof y === "undefined")
			return false;
		switch (cmp) {
			case 0:     // equal
				return x === y;
			case 1:     // not equal
				return x !== y;
			case 2:     // less
				return x < y;
			case 3:     // less/equal
				return x <= y;
			case 4:     // greater
				return x > y;
			case 5:     // greater/equal
				return x >= y;
			default:
				;
				return false;
		}
	};
})();
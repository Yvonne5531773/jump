(function() {
	var allUniqueSolModifiers = [];

	function testSolsMatch(arr1, arr2) {
		var i, len = arr1.length;
		switch (len) {
			case 0:
				return true;
			case 1:
				return arr1[0] === arr2[0];
			case 2:
				return arr1[0] === arr2[0] && arr1[1] === arr2[1];
			default:
				for (i = 0; i < len; i++) {
					if (arr1[i] !== arr2[i])
						return false;
				}
				return true;
		}
	};

	function solArraySorter(t1, t2) {
		return t1.index - t2.index;
	};

	function findMatchingSolModifier(arr) {
		var i, len, u, temp, subarr;
		if (arr.length === 2) {
			if (arr[0].index > arr[1].index) {
				temp = arr[0];
				arr[0] = arr[1];
				arr[1] = temp;
			}
		}
		else if (arr.length > 2)
			arr.sort(solArraySorter);		// so testSolsMatch compares in same order
		if (arr.length >= allUniqueSolModifiers.length)
			allUniqueSolModifiers.length = arr.length + 1;
		if (!allUniqueSolModifiers[arr.length])
			allUniqueSolModifiers[arr.length] = [];
		subarr = allUniqueSolModifiers[arr.length];
		for (i = 0, len = subarr.length; i < len; i++) {
			u = subarr[i];
			if (testSolsMatch(arr, u))
				return u;
		}
		subarr.push(arr);
		return arr;
	};

	function EventSheet(runtime, m) {
		this.runtime = runtime;
		this.triggers = {};
		this.fasttriggers = {};
		this.hasRun = false;
		this.includes = new cr.ObjectSet(); 	// all event sheets included by this sheet, at first-level indirection only
		this.deep_includes = [];				// all includes from this sheet recursively, in trigger order
		this.already_included_sheets = [];		// used while building deep_includes
		this.name = m[0];
		var em = m[1];		// events model
		this.events = [];       // triggers won't make it to this array
		var i, len;
		for (i = 0, len = em.length; i < len; i++)
			this.init_event(em[i], null, this.events);
	};
	EventSheet.prototype.toString = function () {
		return this.name;
	};
	EventSheet.prototype.init_event = function (m, parent, nontriggers) {
		switch (m[0]) {
			case 0:	// event block
			{
				var block = new cr.eventblock(this, parent, m);
				cr.seal(block);
				if (block.orblock) {
					nontriggers.push(block);
					var i, len;
					for (i = 0, len = block.conditions.length; i < len; i++) {
						if (block.conditions[i].trigger)
							this.init_trigger(block, i);
					}
				}
				else {
					if (block.is_trigger())
						this.init_trigger(block, 0);
					else
						nontriggers.push(block);
				}
				break;
			}
			case 1: // variable
			{
				var v = new cr.eventvariable(this, parent, m);
				cr.seal(v);
				nontriggers.push(v);
				break;
			}
			case 2:	// include
			{
				var inc = new cr.eventinclude(this, parent, m);
				cr.seal(inc);
				nontriggers.push(inc);
				break;
			}
			default:
				;
		}
	};
	EventSheet.prototype.postInit = function () {
		var i, len;
		for (i = 0, len = this.events.length; i < len; i++) {
			this.events[i].postInit(i < len - 1 && this.events[i + 1].is_else_block);
		}
	};
	EventSheet.prototype.updateDeepIncludes = function () {
		cr.clearArray(this.deep_includes);
		cr.clearArray(this.already_included_sheets);
		this.addDeepIncludes(this);
		cr.clearArray(this.already_included_sheets);
	};
	EventSheet.prototype.addDeepIncludes = function (root_sheet) {
		var i, len, inc, sheet;
		var deep_includes = root_sheet.deep_includes;
		var already_included_sheets = root_sheet.already_included_sheets;
		var arr = this.includes.valuesRef();
		for (i = 0, len = arr.length; i < len; ++i) {
			inc = arr[i];
			sheet = inc.include_sheet;
			if (!inc.isActive() || root_sheet === sheet || already_included_sheets.indexOf(sheet) > -1)
				continue;
			already_included_sheets.push(sheet);
			sheet.addDeepIncludes(root_sheet);
			deep_includes.push(sheet);
		}
	};
	EventSheet.prototype.run = function (from_include) {
		if (!this.runtime.resuming_breakpoint) {
			this.hasRun = true;
			if (!from_include)
				this.runtime.isRunningEvents = true;
		}
		var i, len;
		for (i = 0, len = this.events.length; i < len; i++) {
			var ev = this.events[i];
			ev.run();
			this.runtime.clearSol(ev.solModifiers);
			if (this.runtime.hasPendingInstances)
				this.runtime.ClearDeathRow();
		}
		if (!from_include)
			this.runtime.isRunningEvents = false;
	};

	function isPerformanceSensitiveTrigger(method) {
		if (cr.plugins_.Sprite && method === cr.plugins_.Sprite.prototype.cnds.OnFrameChanged) {
			return true;
		}
		return false;
	};
	EventSheet.prototype.init_trigger = function (trig, index) {
		if (!trig.orblock)
			this.runtime.triggers_to_postinit.push(trig);	// needs to be postInit'd later
		var i, len;
		var cnd = trig.conditions[index];
		var type_name;
		if (cnd.type)
			type_name = cnd.type.name;
		else
			type_name = "system";
		var fasttrigger = cnd.fasttrigger;
		var triggers = (fasttrigger ? this.fasttriggers : this.triggers);
		if (!triggers[type_name])
			triggers[type_name] = [];
		var obj_entry = triggers[type_name];
		var method = cnd.func;
		if (fasttrigger) {
			if (!cnd.parameters.length)				// no parameters
				return;
			var firstparam = cnd.parameters[0];
			if (firstparam.type !== 1 ||			// not a string param
				firstparam.expression.type !== 2)	// not a string literal node
			{
				return;
			}
			var fastevs;
			var firstvalue = firstparam.expression.value.toLowerCase();
			var i, len;
			for (i = 0, len = obj_entry.length; i < len; i++) {
				if (obj_entry[i].method == method) {
					fastevs = obj_entry[i].evs;
					if (!fastevs[firstvalue])
						fastevs[firstvalue] = [[trig, index]];
					else
						fastevs[firstvalue].push([trig, index]);
					return;
				}
			}
			fastevs = {};
			fastevs[firstvalue] = [[trig, index]];
			obj_entry.push({method: method, evs: fastevs});
		}
		else {
			for (i = 0, len = obj_entry.length; i < len; i++) {
				if (obj_entry[i].method == method) {
					obj_entry[i].evs.push([trig, index]);
					return;
				}
			}
			if (isPerformanceSensitiveTrigger(method))
				obj_entry.unshift({method: method, evs: [[trig, index]]});
			else
				obj_entry.push({method: method, evs: [[trig, index]]});
		}
	};
	cr.eventsheet = EventSheet;

	function Selection(type) {
		this.type = type;
		this.instances = [];        // subset of picked instances
		this.else_instances = [];	// subset of unpicked instances
		this.select_all = true;
	};
	Selection.prototype.hasObjects = function () {
		if (this.select_all)
			return this.type.instances.length;
		else
			return this.instances.length;
	};
	Selection.prototype.getObjects = function () {
		if (this.select_all)
			return this.type.instances;
		else
			return this.instances;
	};
	Selection.prototype.pick_one = function (inst) {
		if (!inst)
			return;
		if (inst.runtime.getCurrentEventStack().current_event.orblock) {
			if (this.select_all) {
				cr.clearArray(this.instances);
				cr.shallowAssignArray(this.else_instances, inst.type.instances);
				this.select_all = false;
			}
			var i = this.else_instances.indexOf(inst);
			if (i !== -1) {
				this.instances.push(this.else_instances[i]);
				this.else_instances.splice(i, 1);
			}
		}
		else {
			this.select_all = false;
			cr.clearArray(this.instances);
			this.instances[0] = inst;
		}
	};
	cr.selection = Selection;

	function EventBlock(sheet, parent, m) {
		this.sheet = sheet;
		this.parent = parent;
		this.runtime = sheet.runtime;
		this.solModifiers = [];
		this.solModifiersIncludingParents = [];
		this.solWriterAfterCnds = false;	// block does not change SOL after running its conditions
		this.group = false;					// is group of events
		this.initially_activated = false;	// if a group, is active on startup
		this.toplevelevent = false;			// is an event block parented only by a top-level group
		this.toplevelgroup = false;			// is parented only by other groups or is top-level (i.e. not in a subevent)
		this.has_else_block = false;		// is followed by else
		;
		this.conditions = [];
		this.actions = [];
		this.subevents = [];
		this.group_name = "";
		this.group = false;
		this.initially_activated = false;
		this.group_active = false;
		this.contained_includes = null;
		if (m[1]) {
			this.group_name = m[1][1].toLowerCase();
			this.group = true;
			this.initially_activated = !!m[1][0];
			this.contained_includes = [];
			this.group_active = this.initially_activated;
			this.runtime.allGroups.push(this);
			this.runtime.groups_by_name[this.group_name] = this;
		}
		this.orblock = m[2];
		this.sid = m[4];
		if (!this.group)
			this.runtime.blocksBySid[this.sid.toString()] = this;
		var i, len;
		var cm = m[5];
		for (i = 0, len = cm.length; i < len; i++) {
			var cnd = new cr.condition(this, cm[i]);
			cnd.index = i;
			cr.seal(cnd);
			this.conditions.push(cnd);
			/*
			 if (cnd.is_logical())
			 this.is_logical = true;
			 if (cnd.type && !cnd.type.plugin.singleglobal && this.cndReferences.indexOf(cnd.type) === -1)
			 this.cndReferences.push(cnd.type);
			 */
			this.addSolModifier(cnd.type);
		}
		var am = m[6];
		for (i = 0, len = am.length; i < len; i++) {
			var act = new cr.action(this, am[i]);
			act.index = i;
			cr.seal(act);
			this.actions.push(act);
		}
		if (m.length === 8) {
			var em = m[7];
			for (i = 0, len = em.length; i < len; i++)
				this.sheet.init_event(em[i], this, this.subevents);
		}
		this.is_else_block = false;
		if (this.conditions.length) {
			this.is_else_block = (this.conditions[0].type == null && this.conditions[0].func == cr.system_object.prototype.cnds.Else);
		}
	};
	EventBlock.prototype.postInit = function (hasElse/*, prevBlock_*/) {
		var i, len;
		var p = this.parent;
		if (this.group) {
			this.toplevelgroup = true;
			while (p) {
				if (!p.group) {
					this.toplevelgroup = false;
					break;
				}
				p = p.parent;
			}
		}
		this.toplevelevent = !this.is_trigger() && (!this.parent || (this.parent.group && this.parent.toplevelgroup));
		this.has_else_block = !!hasElse;
		this.solModifiersIncludingParents = this.solModifiers.slice(0);
		p = this.parent;
		while (p) {
			for (i = 0, len = p.solModifiers.length; i < len; i++)
				this.addParentSolModifier(p.solModifiers[i]);
			p = p.parent;
		}
		this.solModifiers = findMatchingSolModifier(this.solModifiers);
		this.solModifiersIncludingParents = findMatchingSolModifier(this.solModifiersIncludingParents);
		var i, len/*, s*/;
		for (i = 0, len = this.conditions.length; i < len; i++)
			this.conditions[i].postInit();
		for (i = 0, len = this.actions.length; i < len; i++)
			this.actions[i].postInit();
		for (i = 0, len = this.subevents.length; i < len; i++) {
			this.subevents[i].postInit(i < len - 1 && this.subevents[i + 1].is_else_block);
		}
	};
	EventBlock.prototype.setGroupActive = function (a) {
		if (this.group_active === !!a)
			return;		// same state
		this.group_active = !!a;
		var i, len;
		for (i = 0, len = this.contained_includes.length; i < len; ++i) {
			this.contained_includes[i].updateActive();
		}
		if (len > 0 && this.runtime.running_layout.event_sheet)
			this.runtime.running_layout.event_sheet.updateDeepIncludes();
	};

	function addSolModifierToList(type, arr) {
		var i, len, t;
		if (!type)
			return;
		if (arr.indexOf(type) === -1)
			arr.push(type);
		if (type.is_contained) {
			for (i = 0, len = type.container.length; i < len; i++) {
				t = type.container[i];
				if (type === t)
					continue;		// already handled
				if (arr.indexOf(t) === -1)
					arr.push(t);
			}
		}
	};
	EventBlock.prototype.addSolModifier = function (type) {
		addSolModifierToList(type, this.solModifiers);
	};
	EventBlock.prototype.addParentSolModifier = function (type) {
		addSolModifierToList(type, this.solModifiersIncludingParents);
	};
	EventBlock.prototype.setSolWriterAfterCnds = function () {
		this.solWriterAfterCnds = true;
		if (this.parent)
			this.parent.setSolWriterAfterCnds();
	};
	EventBlock.prototype.is_trigger = function () {
		if (!this.conditions.length)    // no conditions
			return false;
		else
			return this.conditions[0].trigger;
	};
	EventBlock.prototype.run = function () {
		var i, len, c, any_true = false, cnd_result;
		var runtime = this.runtime;
		var evinfo = this.runtime.getCurrentEventStack();
		evinfo.current_event = this;
		var conditions = this.conditions;
		if (!this.is_else_block)
			evinfo.else_branch_ran = false;
		if (this.orblock) {
			if (conditions.length === 0)
				any_true = true;		// be sure to run if empty block
			evinfo.cndindex = 0
			for (len = conditions.length; evinfo.cndindex < len; evinfo.cndindex++) {
				c = conditions[evinfo.cndindex];
				if (c.trigger)		// skip triggers when running OR block
					continue;
				cnd_result = c.run();
				if (cnd_result)			// make sure all conditions run and run if any were true
					any_true = true;
			}
			evinfo.last_event_true = any_true;
			if (any_true)
				this.run_actions_and_subevents();
		}
		else {
			evinfo.cndindex = 0
			for (len = conditions.length; evinfo.cndindex < len; evinfo.cndindex++) {
				cnd_result = conditions[evinfo.cndindex].run();
				if (!cnd_result)    // condition failed
				{
					evinfo.last_event_true = false;
					if (this.toplevelevent && runtime.hasPendingInstances)
						runtime.ClearDeathRow();
					return;		// bail out now
				}
			}
			evinfo.last_event_true = true;
			this.run_actions_and_subevents();
		}
		this.end_run(evinfo);
	};
	EventBlock.prototype.end_run = function (evinfo) {
		if (evinfo.last_event_true && this.has_else_block)
			evinfo.else_branch_ran = true;
		if (this.toplevelevent && this.runtime.hasPendingInstances)
			this.runtime.ClearDeathRow();
	};
	EventBlock.prototype.run_orblocktrigger = function (index) {
		var evinfo = this.runtime.getCurrentEventStack();
		evinfo.current_event = this;
		if (this.conditions[index].run()) {
			this.run_actions_and_subevents();
			this.runtime.getCurrentEventStack().last_event_true = true;
		}
	};
	EventBlock.prototype.run_actions_and_subevents = function () {
		var evinfo = this.runtime.getCurrentEventStack();
		var len;
		for (evinfo.actindex = 0, len = this.actions.length; evinfo.actindex < len; evinfo.actindex++) {
			if (this.actions[evinfo.actindex].run())
				return;
		}
		this.run_subevents();
	};
	EventBlock.prototype.resume_actions_and_subevents = function () {
		var evinfo = this.runtime.getCurrentEventStack();
		var len;
		for (len = this.actions.length; evinfo.actindex < len; evinfo.actindex++) {
			if (this.actions[evinfo.actindex].run())
				return;
		}
		this.run_subevents();
	};
	EventBlock.prototype.run_subevents = function () {
		if (!this.subevents.length)
			return;
		var i, len, subev, pushpop/*, skipped_pop = false, pop_modifiers = null*/;
		var last = this.subevents.length - 1;
		this.runtime.pushEventStack(this);
		if (this.solWriterAfterCnds) {
			for (i = 0, len = this.subevents.length; i < len; i++) {
				subev = this.subevents[i];
				pushpop = (!this.toplevelgroup || (!this.group && i < last));
				if (pushpop)
					this.runtime.pushCopySol(subev.solModifiers);
				subev.run();
				if (pushpop)
					this.runtime.popSol(subev.solModifiers);
				else
					this.runtime.clearSol(subev.solModifiers);
			}
		}
		else {
			for (i = 0, len = this.subevents.length; i < len; i++) {
				this.subevents[i].run();
			}
		}
		this.runtime.popEventStack();
	};
	EventBlock.prototype.run_pretrigger = function () {
		var evinfo = this.runtime.getCurrentEventStack();
		evinfo.current_event = this;
		var any_true = false;
		var i, len;
		for (evinfo.cndindex = 0, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++) {
			;
			if (this.conditions[evinfo.cndindex].run())
				any_true = true;
			else if (!this.orblock)			// condition failed (let OR blocks run all conditions anyway)
				return false;               // bail out
		}
		return this.orblock ? any_true : true;
	};
	EventBlock.prototype.retrigger = function () {
		this.runtime.execcount++;
		var prevcndindex = this.runtime.getCurrentEventStack().cndindex;
		var len;
		var evinfo = this.runtime.pushEventStack(this);
		if (!this.orblock) {
			for (evinfo.cndindex = prevcndindex + 1, len = this.conditions.length; evinfo.cndindex < len; evinfo.cndindex++) {
				if (!this.conditions[evinfo.cndindex].run())    // condition failed
				{
					this.runtime.popEventStack();               // moving up level of recursion
					return false;                               // bail out
				}
			}
		}
		this.run_actions_and_subevents();
		this.runtime.popEventStack();
		return true;		// ran an iteration
	};
	EventBlock.prototype.isFirstConditionOfType = function (cnd) {
		var cndindex = cnd.index;
		if (cndindex === 0)
			return true;
		--cndindex;
		for (; cndindex >= 0; --cndindex) {
			if (this.conditions[cndindex].type === cnd.type)
				return false;
		}
		return true;
	};
	cr.eventblock = EventBlock;

	function Condition(block, m) {
		this.block = block;
		this.sheet = block.sheet;
		this.runtime = block.runtime;
		this.parameters = [];
		this.results = [];
		this.extra = {};		// for plugins to stow away some custom info
		this.index = -1;
		this.anyParamVariesPerInstance = false;
		this.func = this.runtime.GetObjectReference(m[1]);
		;
		this.trigger = (m[3] > 0);
		this.fasttrigger = (m[3] === 2);
		this.looping = m[4];
		this.inverted = m[5];
		this.isstatic = m[6];
		this.sid = m[7];
		this.runtime.cndsBySid[this.sid.toString()] = this;
		if (m[0] === -1)		// system object
		{
			this.type = null;
			this.run = this.run_system;
			this.behaviortype = null;
			this.beh_index = -1;
		}
		else {
			this.type = this.runtime.types_by_index[m[0]];
			;
			if (this.isstatic)
				this.run = this.run_static;
			else
				this.run = this.run_object;
			if (m[2]) {
				this.behaviortype = this.type.getBehaviorByName(m[2]);
				;
				this.beh_index = this.type.getBehaviorIndexByName(m[2]);
				;
			}
			else {
				this.behaviortype = null;
				this.beh_index = -1;
			}
			if (this.block.parent)
				this.block.parent.setSolWriterAfterCnds();
		}
		if (this.fasttrigger)
			this.run = this.run_true;
		if (m.length === 10) {
			var i, len;
			var em = m[9];
			for (i = 0, len = em.length; i < len; i++) {
				var param = new cr.parameter(this, em[i]);
				cr.seal(param);
				this.parameters.push(param);
			}
			this.results.length = em.length;
		}
	};
	Condition.prototype.postInit = function () {
		var i, len, p;
		for (i = 0, len = this.parameters.length; i < len; i++) {
			p = this.parameters[i];
			p.postInit();
			if (p.variesPerInstance)
				this.anyParamVariesPerInstance = true;
		}
	};
	/*
	 Condition.prototype.is_logical = function ()
	 {
	 return !this.type || this.type.plugin.singleglobal;
	 };
	 */
	Condition.prototype.run_true = function () {
		return true;
	};
	Condition.prototype.run_system = function () {
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
			this.results[i] = this.parameters[i].get();
		return cr.xor(this.func.apply(this.runtime.system, this.results), this.inverted);
	};
	Condition.prototype.run_static = function () {
		var i, len;
		for (i = 0, len = this.parameters.length; i < len; i++)
			this.results[i] = this.parameters[i].get();
		var ret = this.func.apply(this.behaviortype ? this.behaviortype : this.type, this.results);
		this.type.applySolToContainer();
		return ret;
	};
	Condition.prototype.run_object = function () {
		var i, j, k, leni, lenj, p, ret, met, inst, s, sol2;
		var type = this.type;
		var sol = type.getCurrentSol();
		var is_orblock = this.block.orblock && !this.trigger;		// triggers in OR blocks need to work normally
		var offset = 0;
		var is_contained = type.is_contained;
		var is_family = type.is_family;
		var family_index = type.family_index;
		var beh_index = this.beh_index;
		var is_beh = (beh_index > -1);
		var params_vary = this.anyParamVariesPerInstance;
		var parameters = this.parameters;
		var results = this.results;
		var inverted = this.inverted;
		var func = this.func;
		var arr, container;
		if (params_vary) {
			for (j = 0, lenj = parameters.length; j < lenj; ++j) {
				p = parameters[j];
				if (!p.variesPerInstance)
					results[j] = p.get(0);
			}
		}
		else {
			for (j = 0, lenj = parameters.length; j < lenj; ++j)
				results[j] = parameters[j].get(0);
		}
		if (sol.select_all) {
			cr.clearArray(sol.instances);       // clear contents
			cr.clearArray(sol.else_instances);
			arr = type.instances;
			for (i = 0, leni = arr.length; i < leni; ++i) {
				inst = arr[i];
				;
				if (params_vary) {
					for (j = 0, lenj = parameters.length; j < lenj; ++j) {
						p = parameters[j];
						if (p.variesPerInstance)
							results[j] = p.get(i);        // default SOL index is current object
					}
				}
				if (is_beh) {
					offset = 0;
					if (is_family) {
						offset = inst.type.family_beh_map[family_index];
					}
					ret = func.apply(inst.behavior_insts[beh_index + offset], results);
				}
				else
					ret = func.apply(inst, results);
				met = cr.xor(ret, inverted);
				if (met)
					sol.instances.push(inst);
				else if (is_orblock)					// in OR blocks, keep the instances not meeting the condition for subsequent testing
					sol.else_instances.push(inst);
			}
			if (type.finish)
				type.finish(true);
			sol.select_all = false;
			type.applySolToContainer();
			return sol.hasObjects();
		}
		else {
			k = 0;
			var using_else_instances = (is_orblock && !this.block.isFirstConditionOfType(this));
			arr = (using_else_instances ? sol.else_instances : sol.instances);
			var any_true = false;
			for (i = 0, leni = arr.length; i < leni; ++i) {
				inst = arr[i];
				;
				if (params_vary) {
					for (j = 0, lenj = parameters.length; j < lenj; ++j) {
						p = parameters[j];
						if (p.variesPerInstance)
							results[j] = p.get(i);        // default SOL index is current object
					}
				}
				if (is_beh) {
					offset = 0;
					if (is_family) {
						offset = inst.type.family_beh_map[family_index];
					}
					ret = func.apply(inst.behavior_insts[beh_index + offset], results);
				}
				else
					ret = func.apply(inst, results);
				if (cr.xor(ret, inverted)) {
					any_true = true;
					if (using_else_instances) {
						sol.instances.push(inst);
						if (is_contained) {
							for (j = 0, lenj = inst.siblings.length; j < lenj; j++) {
								s = inst.siblings[j];
								s.type.getCurrentSol().instances.push(s);
							}
						}
					}
					else {
						arr[k] = inst;
						if (is_contained) {
							for (j = 0, lenj = inst.siblings.length; j < lenj; j++) {
								s = inst.siblings[j];
								s.type.getCurrentSol().instances[k] = s;
							}
						}
						k++;
					}
				}
				else {
					if (using_else_instances) {
						arr[k] = inst;
						if (is_contained) {
							for (j = 0, lenj = inst.siblings.length; j < lenj; j++) {
								s = inst.siblings[j];
								s.type.getCurrentSol().else_instances[k] = s;
							}
						}
						k++;
					}
					else if (is_orblock) {
						sol.else_instances.push(inst);
						if (is_contained) {
							for (j = 0, lenj = inst.siblings.length; j < lenj; j++) {
								s = inst.siblings[j];
								s.type.getCurrentSol().else_instances.push(s);
							}
						}
					}
				}
			}
			cr.truncateArray(arr, k);
			if (is_contained) {
				container = type.container;
				for (i = 0, leni = container.length; i < leni; i++) {
					sol2 = container[i].getCurrentSol();
					if (using_else_instances)
						cr.truncateArray(sol2.else_instances, k);
					else
						cr.truncateArray(sol2.instances, k);
				}
			}
			var pick_in_finish = any_true;		// don't pick in finish() if we're only doing the logic test below
			if (using_else_instances && !any_true) {
				for (i = 0, leni = sol.instances.length; i < leni; i++) {
					inst = sol.instances[i];
					if (params_vary) {
						for (j = 0, lenj = parameters.length; j < lenj; j++) {
							p = parameters[j];
							if (p.variesPerInstance)
								results[j] = p.get(i);
						}
					}
					if (is_beh)
						ret = func.apply(inst.behavior_insts[beh_index], results);
					else
						ret = func.apply(inst, results);
					if (cr.xor(ret, inverted)) {
						any_true = true;
						break;		// got our flag, don't need to test any more
					}
				}
			}
			if (type.finish)
				type.finish(pick_in_finish || is_orblock);
			return is_orblock ? any_true : sol.hasObjects();
		}
	};
	cr.condition = Condition;

	function Action(block, m) {
		this.block = block;
		this.sheet = block.sheet;
		this.runtime = block.runtime;
		this.parameters = [];
		this.results = [];
		this.extra = {};		// for plugins to stow away some custom info
		this.index = -1;
		this.anyParamVariesPerInstance = false;
		this.func = this.runtime.GetObjectReference(m[1]);
		;
		if (m[0] === -1)	// system
		{
			this.type = null;
			this.run = this.run_system;
			this.behaviortype = null;
			this.beh_index = -1;
		}
		else {
			this.type = this.runtime.types_by_index[m[0]];
			;
			this.run = this.run_object;
			if (m[2]) {
				this.behaviortype = this.type.getBehaviorByName(m[2]);
				;
				this.beh_index = this.type.getBehaviorIndexByName(m[2]);
				;
			}
			else {
				this.behaviortype = null;
				this.beh_index = -1;
			}
		}
		this.sid = m[3];
		this.runtime.actsBySid[this.sid.toString()] = this;
		if (m.length === 6) {
			var i, len;
			var em = m[5];
			for (i = 0, len = em.length; i < len; i++) {
				var param = new cr.parameter(this, em[i]);
				cr.seal(param);
				this.parameters.push(param);
			}
			this.results.length = em.length;
		}
	};
	Action.prototype.postInit = function () {
		var i, len, p;
		for (i = 0, len = this.parameters.length; i < len; i++) {
			p = this.parameters[i];
			p.postInit();
			if (p.variesPerInstance)
				this.anyParamVariesPerInstance = true;
		}
	};
	Action.prototype.run_system = function () {
		var runtime = this.runtime;
		var i, len;
		var parameters = this.parameters;
		var results = this.results;
		for (i = 0, len = parameters.length; i < len; ++i)
			results[i] = parameters[i].get();
		return this.func.apply(runtime.system, results);
	};
	Action.prototype.run_object = function () {
		var type = this.type;
		var beh_index = this.beh_index;
		var family_index = type.family_index;
		var params_vary = this.anyParamVariesPerInstance;
		var parameters = this.parameters;
		var results = this.results;
		var func = this.func;
		var instances = type.getCurrentSol().getObjects();
		var is_family = type.is_family;
		var is_beh = (beh_index > -1);
		var i, j, leni, lenj, p, inst, offset;
		if (params_vary) {
			for (j = 0, lenj = parameters.length; j < lenj; ++j) {
				p = parameters[j];
				if (!p.variesPerInstance)
					results[j] = p.get(0);
			}
		}
		else {
			for (j = 0, lenj = parameters.length; j < lenj; ++j)
				results[j] = parameters[j].get(0);
		}
		for (i = 0, leni = instances.length; i < leni; ++i) {
			inst = instances[i];
			if (params_vary) {
				for (j = 0, lenj = parameters.length; j < lenj; ++j) {
					p = parameters[j];
					if (p.variesPerInstance)
						results[j] = p.get(i);    // pass i to use as default SOL index
				}
			}
			if (is_beh) {
				offset = 0;
				if (is_family) {
					offset = inst.type.family_beh_map[family_index];
				}
				func.apply(inst.behavior_insts[beh_index + offset], results);
			}
			else
				func.apply(inst, results);
		}
		return false;
	};
	cr.action = Action;
	var tempValues = [];
	var tempValuesPtr = -1;

	function pushTempValue() {
		tempValuesPtr++;
		if (tempValues.length === tempValuesPtr)
			tempValues.push(new cr.expvalue());
		return tempValues[tempValuesPtr];
	};

	function popTempValue() {
		tempValuesPtr--;
	};

	function Parameter(owner, m) {
		this.owner = owner;
		this.block = owner.block;
		this.sheet = owner.sheet;
		this.runtime = owner.runtime;
		this.type = m[0];
		this.expression = null;
		this.solindex = 0;
		this.get = null;
		this.combosel = 0;
		this.layout = null;
		this.key = 0;
		this.object = null;
		this.index = 0;
		this.varname = null;
		this.eventvar = null;
		this.fileinfo = null;
		this.subparams = null;
		this.variadicret = null;
		this.subparams = null;
		this.variadicret = null;
		this.variesPerInstance = false;
		var i, len, param;
		switch (m[0]) {
			case 0:		// number
			case 7:		// any
				this.expression = new cr.expNode(this, m[1]);
				this.solindex = 0;
				this.get = this.get_exp;
				break;
			case 1:		// string
				this.expression = new cr.expNode(this, m[1]);
				this.solindex = 0;
				this.get = this.get_exp_str;
				break;
			case 5:		// layer
				this.expression = new cr.expNode(this, m[1]);
				this.solindex = 0;
				this.get = this.get_layer;
				break;
			case 3:		// combo
			case 8:		// cmp
				this.combosel = m[1];
				this.get = this.get_combosel;
				break;
			case 6:		// layout
				this.layout = this.runtime.layouts[m[1]];
				;
				this.get = this.get_layout;
				break;
			case 9:		// keyb
				this.key = m[1];
				this.get = this.get_key;
				break;
			case 4:		// object
				this.object = this.runtime.types_by_index[m[1]];
				;
				this.get = this.get_object;
				this.block.addSolModifier(this.object);
				if (this.owner instanceof cr.action)
					this.block.setSolWriterAfterCnds();
				else if (this.block.parent)
					this.block.parent.setSolWriterAfterCnds();
				break;
			case 10:	// instvar
				this.index = m[1];
				if (owner.type && owner.type.is_family) {
					this.get = this.get_familyvar;
					this.variesPerInstance = true;
				}
				else
					this.get = this.get_instvar;
				break;
			case 11:	// eventvar
				this.varname = m[1];
				this.eventvar = null;
				this.get = this.get_eventvar;
				break;
			case 2:		// audiofile	["name", ismusic]
			case 12:	// fileinfo		"name"
				this.fileinfo = m[1];
				this.get = this.get_audiofile;
				break;
			case 13:	// variadic
				this.get = this.get_variadic;
				this.subparams = [];
				this.variadicret = [];
				for (i = 1, len = m.length; i < len; i++) {
					param = new cr.parameter(this.owner, m[i]);
					cr.seal(param);
					this.subparams.push(param);
					this.variadicret.push(0);
				}
				break;
			default:
				;
		}
	};
	Parameter.prototype.postInit = function () {
		var i, len;
		if (this.type === 11)		// eventvar
		{
			this.eventvar = this.runtime.getEventVariableByName(this.varname, this.block.parent);
			;
		}
		else if (this.type === 13)	// variadic, postInit all sub-params
		{
			for (i = 0, len = this.subparams.length; i < len; i++)
				this.subparams[i].postInit();
		}
		if (this.expression)
			this.expression.postInit();
	};
	Parameter.prototype.maybeVaryForType = function (t) {
		if (this.variesPerInstance)
			return;				// already varies per instance, no need to check again
		if (!t)
			return;				// never vary for system type
		if (!t.plugin.singleglobal) {
			this.variesPerInstance = true;
			return;
		}
	};
	Parameter.prototype.setVaries = function () {
		this.variesPerInstance = true;
	};
	Parameter.prototype.get_exp = function (solindex) {
		this.solindex = solindex || 0;   // default SOL index to use
		var temp = pushTempValue();
		this.expression.get(temp);
		popTempValue();
		return temp.data;      			// return actual JS value, not expvalue
	};
	Parameter.prototype.get_exp_str = function (solindex) {
		this.solindex = solindex || 0;   // default SOL index to use
		var temp = pushTempValue();
		this.expression.get(temp);
		popTempValue();
		if (cr.is_string(temp.data))
			return temp.data;
		else
			return "";
	};
	Parameter.prototype.get_object = function () {
		return this.object;
	};
	Parameter.prototype.get_combosel = function () {
		return this.combosel;
	};
	Parameter.prototype.get_layer = function (solindex) {
		this.solindex = solindex || 0;   // default SOL index to use
		var temp = pushTempValue();
		this.expression.get(temp);
		popTempValue();
		if (temp.is_number())
			return this.runtime.getLayerByNumber(temp.data);
		else
			return this.runtime.getLayerByName(temp.data);
	}
	Parameter.prototype.get_layout = function () {
		return this.layout;
	};
	Parameter.prototype.get_key = function () {
		return this.key;
	};
	Parameter.prototype.get_instvar = function () {
		return this.index;
	};
	Parameter.prototype.get_familyvar = function (solindex_) {
		var solindex = solindex_ || 0;
		var familytype = this.owner.type;
		var realtype = null;
		var sol = familytype.getCurrentSol();
		var objs = sol.getObjects();
		if (objs.length)
			realtype = objs[solindex % objs.length].type;
		else if (sol.else_instances.length)
			realtype = sol.else_instances[solindex % sol.else_instances.length].type;
		else if (familytype.instances.length)
			realtype = familytype.instances[solindex % familytype.instances.length].type;
		else
			return 0;
		return this.index + realtype.family_var_map[familytype.family_index];
	};
	Parameter.prototype.get_eventvar = function () {
		return this.eventvar;
	};
	Parameter.prototype.get_audiofile = function () {
		return this.fileinfo;
	};
	Parameter.prototype.get_variadic = function () {
		var i, len;
		for (i = 0, len = this.subparams.length; i < len; i++) {
			this.variadicret[i] = this.subparams[i].get();
		}
		return this.variadicret;
	};
	cr.parameter = Parameter;

	function EventVariable(sheet, parent, m) {
		this.sheet = sheet;
		this.parent = parent;
		this.runtime = sheet.runtime;
		this.solModifiers = [];
		this.name = m[1];
		this.vartype = m[2];
		this.initial = m[3];
		this.is_static = !!m[4];
		this.is_constant = !!m[5];
		this.sid = m[6];
		this.runtime.varsBySid[this.sid.toString()] = this;
		this.data = this.initial;	// note: also stored in event stack frame for local nonstatic nonconst vars
		if (this.parent)			// local var
		{
			if (this.is_static || this.is_constant)
				this.localIndex = -1;
			else
				this.localIndex = this.runtime.stackLocalCount++;
			this.runtime.all_local_vars.push(this);
		}
		else						// global var
		{
			this.localIndex = -1;
			this.runtime.all_global_vars.push(this);
		}
	};
	EventVariable.prototype.postInit = function () {
		this.solModifiers = findMatchingSolModifier(this.solModifiers);
	};
	EventVariable.prototype.setValue = function (x) {
		;
		var lvs = this.runtime.getCurrentLocalVarStack();
		if (!this.parent || this.is_static || !lvs)
			this.data = x;
		else	// local nonstatic variable: use event stack to keep value at this level of recursion
		{
			if (this.localIndex >= lvs.length)
				lvs.length = this.localIndex + 1;
			lvs[this.localIndex] = x;
		}
	};
	EventVariable.prototype.getValue = function () {
		var lvs = this.runtime.getCurrentLocalVarStack();
		if (!this.parent || this.is_static || !lvs || this.is_constant)
			return this.data;
		else	// local nonstatic variable
		{
			if (this.localIndex >= lvs.length) {
				return this.initial;
			}
			if (typeof lvs[this.localIndex] === "undefined") {
				return this.initial;
			}
			return lvs[this.localIndex];
		}
	};
	EventVariable.prototype.run = function () {
		if (this.parent && !this.is_static && !this.is_constant)
			this.setValue(this.initial);
	};
	cr.eventvariable = EventVariable;

	function EventInclude(sheet, parent, m) {
		this.sheet = sheet;
		this.parent = parent;
		this.runtime = sheet.runtime;
		this.solModifiers = [];
		this.include_sheet = null;		// determined in postInit
		this.include_sheet_name = m[1];
		this.active = true;
	};
	EventInclude.prototype.toString = function () {
		return "include:" + this.include_sheet.toString();
	};
	EventInclude.prototype.postInit = function () {
		this.include_sheet = this.runtime.eventsheets[this.include_sheet_name];
		;
		;
		this.sheet.includes.add(this);
		this.solModifiers = findMatchingSolModifier(this.solModifiers);
		var p = this.parent;
		while (p) {
			if (p.group)
				p.contained_includes.push(this);
			p = p.parent;
		}
		this.updateActive();
	};
	EventInclude.prototype.run = function () {
		if (this.parent)
			this.runtime.pushCleanSol(this.runtime.types_by_index);
		if (!this.include_sheet.hasRun)
			this.include_sheet.run(true);			// from include
		if (this.parent)
			this.runtime.popSol(this.runtime.types_by_index);
	};
	EventInclude.prototype.updateActive = function () {
		var p = this.parent;
		while (p) {
			if (p.group && !p.group_active) {
				this.active = false;
				return;
			}
			p = p.parent;
		}
		this.active = true;
	};
	EventInclude.prototype.isActive = function () {
		return this.active;
	};
	cr.eventinclude = EventInclude;

	function EventStackFrame() {
		this.temp_parents_arr = [];
		this.reset(null);
		cr.seal(this);
	};
	EventStackFrame.prototype.reset = function (cur_event) {
		this.current_event = cur_event;
		this.cndindex = 0;
		this.actindex = 0;
		cr.clearArray(this.temp_parents_arr);
		this.last_event_true = false;
		this.else_branch_ran = false;
		this.any_true_state = false;
	};
	EventStackFrame.prototype.isModifierAfterCnds = function () {
		if (this.current_event.solWriterAfterCnds)
			return true;
		if (this.cndindex < this.current_event.conditions.length - 1)
			return !!this.current_event.solModifiers.length;
		return false;
	};
	cr.eventStackFrame = EventStackFrame;
}());
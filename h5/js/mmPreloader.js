(function () {
	cr.plugins_.MM_Preloader = function(runtime) {
		this.runtime = runtime;
	}
	var preloader = {
		items: [],
		itemsCompleted: 0,
		itemsCount: 0,
		isLazyPreloading: false,
		lazyInterval: 0
	};
	var MoMod = null;
	var MM_Debugger = null;
	var THIS_TAG = "MM_Preloader";
	var thisInstance = null;
	var objectPreloadId = 0;
	var OBJECT_PRELOAD_KEY = "mm_preloader_object_preload_";
	var objectPreloadQueue = [];
	var isPreloadingObjects = false;
	var tickForNextObjectPreloadTrigger = 0;
	var intervalObject = null;
	var objectsPreloadingState = 0;
	var isC2EnginePreloaderAdded = false;
	var C2_ENGINE_PRELOADER_KEY = "mm_preloader_c2_engine_";
	var spriterInterval = null;
	var spriterInst = null;
	var spriterIndex = null;
	var pluginProto = cr.plugins_.MM_Preloader.prototype;
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
		thisInstance = this;
		stabilizer.isEnabled = !!this.properties[1];
		stabilizer.maxChecks = Math.max(this.properties[2], 1);
		stabilizer.frequency = this.properties[3];
		stabilizer.minFps = Math.max(this.properties[4], 1);
		stabilizer.confirmations = Math.max(this.properties[5], 1);
		if (typeof cr.plugins_.MoMod !== 'undefined' && cr.plugins_.MoMod) {
			MoMod = cr.plugins_.MoMod.prototype.shared;
		}
		if (typeof cr.plugins_.MM_Debugger !== 'undefined' && cr.plugins_.MM_Debugger) {
			MM_Debugger = cr.plugins_.MM_Debugger.prototype.shared;
		}
	};
	instanceProto.onDestroy = function () {
	};

	function Cnds() {
	};
	/**
	 * @returns {boolean}
	 */
	Cnds.prototype.OnProgress = function () {
		return true;
	};
	/**
	 * @returns {boolean}
	 */
	Cnds.prototype.OnCompleted = function () {
		preloader.items = [];
		preloader.itemsCompleted = 0;
		preloader.itemsCount = 0;
		objectPreloadId = 0;
		objectPreloadQueue = [];
		isPreloadingObjects = false;
		tickForNextObjectPreloadTrigger = 0;
		intervalObject = null;
		objectsPreloadingState = 0;
		isC2EnginePreloaderAdded = false;
		if (stabilizer.isEnabled) {
			clearTimeout(stabilizer.instance.timerInstance);
			stabilizer.instance.currentCheck = 0;
			stabilizer.instance.currentConfirmations = 0;
			stabilizer.instance.timerInstance = null;
		}
		return true;
	};
	/**
	 * @returns {boolean}
	 */
	Cnds.prototype.HasItem = function (key_) {
		return (typeof preloader.items[key_.toLowerCase()] !== 'undefined' && preloader.items[key_.toLowerCase()]);
	};
	pluginProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.AddItem = function (key_, trigger_, dependency_) {
		addPreloaderItem(key_, trigger_, dependency_);
	};
	Acts.prototype.SetItemState = function (key_, newState_) {
		setItemState(key_, newState_, this);
	};
	Acts.prototype.Start = function () {
		preloader.isLazyPreloading = false;
		if (preloader.itemsCount === 0 && stabilizer.isEnabled === false) {
			preloaderLog("[Preloader]: Cannot start Preloader, the list is empty.", this);
			return;
		}
		if (stabilizer.isEnabled) {
			var key;
			var dependencyList = [];
			for (key in preloader.items) {
				if (preloader.items.hasOwnProperty(key)) {
					dependencyList.push(key);
				}
			}
			for (key in preloader.items) {
				if (preloader.items.hasOwnProperty(key) && preloader.items[key].dependency == "_last") {
					var localDependencyList = dependencyList;
					localDependencyList.splice(dependencyList.indexOf(key), 1);
					preloader.items[key].dependency = localDependencyList.join();
				}
			}
			addPreloaderItem("Stabilizer", "true", "_last");
		}
		preloaderProcessItems(this);
	};
	Acts.prototype.StartLazy = function (lazyInterval_) {
		if (preloader.itemsCount === 0) {
			preloaderLog("[Preloader]: Cannot start Preloader, the list is empty.", this);
			return;
		}
		preloader.isLazyPreloading = true;
		preloader.lazyInterval = lazyInterval_;
		preloaderProcessItems(this);
	};
	Acts.prototype.StabilizerSetState = function (state_) {
		stabilizer.isEnabled = !!state_;
	};
	Acts.prototype.PreloadObject = function (obj_) {
		if (!obj_) return;
		addObjectToPreloader(obj_);
	};
	Acts.prototype.AddFromLayoutByName = function (layoutName_) {
		var l, layout;
		for (l in this.runtime.layouts) {
			if (this.runtime.layouts.hasOwnProperty(l) && cr.equals_nocase(l, layoutName_)) {
				layout = this.runtime.layouts[l];
				break;
			}
		}
		if (!layout) {
			preloaderLog("[Preloader ERROR]: Cannot load objects from layout \"" + layoutName_ + "\" because such layout does not exist.", this);
			return;
		}
		addObjectFromLayout(layout);
	};
	Acts.prototype.AddFromLayout = function (layout) {
		if (!layout) return;
		addObjectFromLayout(layout);
	};
	Acts.prototype.AddC2EngineProgress = function () {
		isC2EnginePreloaderAdded = true;
		addPreloaderItem(C2_ENGINE_PRELOADER_KEY, "", "");
	};
	pluginProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.Progress = function (ret) {
		var generalPreloadProgress = Math.floor((preloader.itemsCompleted / preloader.itemsCount) * 10000) / 100;
		var detailedPreloadProgress = 0;
		var unitValue = 1 / preloader.itemsCount;
		var key;
		for (key in preloader.items) {
			if (preloader.items.hasOwnProperty(key) && preloader.items[key].currentState < 100 && preloader.items[key].currentState > 0) {
				detailedPreloadProgress += unitValue * (preloader.items[key].currentState / 100)
			}
		}
		detailedPreloadProgress = Math.floor(detailedPreloadProgress * 10000) / 100;
		ret.set_float(Math.floor((generalPreloadProgress + detailedPreloadProgress) * 100) / 100);
	};
	Exps.prototype.ItemProgress = function (ret, key_) {
		key_ = key_.toLowerCase();
		if (typeof preloader.items[key_] === 'undefined' || !preloader.items[key_]) {
			preloaderLog("[Preloader ERROR]: Cannot get state of \"" + key_ + "\" item, because such item does not exist on preloader list.", this);
			ret.set_int(0);
			return;
		}
		ret.set_float(Math.floor(preloader.items[key_].currentState * 100) / 100);
	};
	Exps.prototype.ItemsCount = function (ret) {
		ret.set_int(preloader.itemsCount);
	};
	Exps.prototype.ObjectsProgress = function (ret) {
		if (objectPreloadQueue.length === 0) {
			preloaderLog("[Preloader ERROR]: Cannot get state of preloading objects, because none object has been added to the preloader list.", this);
			ret.set_int(0);
			return;
		}
		ret.set_float(Math.floor(objectsPreloadingState * 100) / 100);
	};
	Exps.prototype.C2EngineProgress = function (ret) {
		if (typeof preloader.items[C2_ENGINE_PRELOADER_KEY] === 'undefined' || !preloader.items[C2_ENGINE_PRELOADER_KEY]) {
			preloaderLog("[Preloader ERROR]: Cannot get state of \"C2 Engine\" item, because it does not exist on preloader list.", this);
			ret.set_int(0);
			return;
		}
		ret.set_float(Math.floor(preloader.items[C2_ENGINE_PRELOADER_KEY].currentState * 100) / 100);
	};
	pluginProto.exps = new Exps();
	var stabilizer =
		{
			isEnabled: true,
			maxChecks: 0,
			frequency: 0,
			minFps: 60,
			confirmations: 1,
			instance: {
				currentCheck: 0,
				currentConfirmations: 0,
				timerInstance: null,
				currentDis: null
			},
			checkFunction: function () {
				if (stabilizer.maxChecks > stabilizer.instance.currentCheck) {
					++stabilizer.instance.currentCheck;
					if (stabilizer.minFps <= thisInstance.runtime.fps) {
						++stabilizer.instance.currentConfirmations;
						if (stabilizer.instance.currentConfirmations >= stabilizer.confirmations) {
							setItemState("Stabilizer", 100, stabilizer.instance.currentDis);
							return;
						}
					}
					var currentState = (stabilizer.instance.currentCheck / stabilizer.maxChecks) * 100;
					setItemState("Stabilizer", currentState, stabilizer.instance.currentDis);
					if (currentState < 100) {
						stabilizer.instance.timerInstance = setTimeout(stabilizer.checkFunction, stabilizer.frequency * 1000);
					}
				}
				else {
					setItemState("Stabilizer", 100, stabilizer.instance.currentDis);
				}
			}
		};

	function addPreloaderItem(key_, trigger_, dependency_) {
		key_ = key_.toLowerCase();
		if (typeof preloader.items[key_] !== 'undefined' && preloader.items[key_]) {
			preloaderLog("[Preloader]: Duplicate entry \"" + key_ + "\". This item already exists on preloader list.", this);
			return;
		}
		preloader.items[key_] = {
			trigger: trigger_.toLowerCase(),
			dependency: dependency_.toLowerCase(),
			currentState: 0,
			isProcessing: !trigger_
		};
		++preloader.itemsCount;
	}

	function preloaderProcessItems(dis_) {
		if (isC2EnginePreloaderAdded) {
			if (!intervalObject) {
				intervalObject = setInterval(function () {
					var state = dis_.runtime.loadingprogress * 100;
					if (state == 100) {
						clearInterval(intervalObject);
						isC2EnginePreloaderAdded = false;
					}
					setItemState(C2_ENGINE_PRELOADER_KEY, state, dis_);
				}, 50);
			}
			return;
		}
		var key;
		for (key in preloader.items) {
			if (!preloader.items.hasOwnProperty(key) || preloader.items[key].currentState === 100 || preloader.items[key].isProcessing === true) continue;
			if (!preloader.items[key].dependency) {
				preloaderTriggerItem(key);
			}
			else if (preloader.items[key].dependency === "_last") {
				if (preloader.itemsCompleted === preloader.itemsCount - 1) {
					if (stabilizer.isEnabled) {
						preloader.items[key].isProcessing = true;
						stabilizer.instance.currentDis = dis_;
						stabilizer.instance.timerInstance = setTimeout(stabilizer.checkFunction, stabilizer.frequency * 1000);
					}
					else {
						preloaderTriggerItem(key);
					}
				}
			}
			else if (preloader.items[key].dependency === OBJECT_PRELOAD_KEY) {
				if (isPreloadingObjects === false) {
					isPreloadingObjects = true;
					triggerObjectsPreloadingQueue(dis_);
				}
			}
			else {
				var dependencies = preloader.items[key].dependency.split(",");
				var allDependenciesReady = true;
				var i;
				for (i = 0; i < dependencies.length; i++) {
					if (!preloader.items[dependencies[i]]) {
						preloaderLog("[Preloader ERROR]: item \"" + key + "\" has dependency \"" + dependencies[i] + "\" but \"" + dependencies[i] + "\" item does not exist in preloader's list.", dis_);
						return;
					}
					if (preloader.items[dependencies[i]].currentState < 100) {
						allDependenciesReady = false;
						break;
					}
				}
				if (allDependenciesReady) {
					preloaderTriggerItem(key);
				}
			}
			if (preloader.isLazyPreloading) {
				return;
			}
		}
	}

	function addObjectToPreloader(obj_) {
		/*
		 deadCache seems to be unpredictable and can't rely on it when it comes to sprites.
		 Also it isn't the factor for texture in the memory,
		 meaning that it happens that even thoug there's deadCache available, the texture isn't loaded.
		 if(obj_.deadCache.length > 0 || obj_.instances.length > 0)
		 {
		 return;
		 }
		 */
		var itemKey = OBJECT_PRELOAD_KEY + objectPreloadId;
		objectPreloadQueue.push({
			object: obj_,
			key: itemKey,
			isPreloaded: false
		});
		addPreloaderItem(itemKey, "automatic", OBJECT_PRELOAD_KEY);
		++objectPreloadId;
	}

	function addObjectFromLayout(layout) {
		var i;
		for (i = 0; i < layout.initial_types.length; i++) {
			if (typeof layout.initial_types[i].plugin !== 'object') continue;
			if (cr.plugins_.Sprite && layout.initial_types[i].plugin instanceof cr.plugins_.Sprite) {
				if (layout.initial_types[i].has_loaded_textures) continue;
			}
			if (cr.plugins_.TiledBg && layout.initial_types[i].plugin instanceof cr.plugins_.TiledBg) {
				if (layout.initial_types[i].webGL_texture) continue;
			}
			if (cr.plugins_.Tilemap && layout.initial_types[i].plugin instanceof cr.plugins_.Tilemap) {
				if (layout.initial_types[i].cut_tiles_valid) continue;
			}
			if ((cr.plugins_.SpriteFontPlus && layout.initial_types[i].plugin instanceof cr.plugins_.SpriteFontPlus)
				|| (cr.plugins_.Spritefont2 && layout.initial_types[i].plugin instanceof cr.plugins_.Spritefont2)) {
				if (layout.initial_types[i].webGL_texture) continue;
			}
			if (cr.plugins_.Spriter && layout.initial_types[i].plugin instanceof cr.plugins_.Spriter) {
				if (layout.initial_types[i].deadCache.length > 0 /* || layout.initial_types[i].instances.length > 0 */) continue;
			}
			addObjectToPreloader(layout.initial_types[i]);
		}
	}

	function triggerObjectsPreloadingQueue(dis_) {
		if (intervalObject) {
			clearInterval(intervalObject);
		}
		if (spriterInterval) return;
		var i;
		var isLastItem = false;
		for (i = 0; i < objectPreloadQueue.length; i++) {
			if (!objectPreloadQueue[i].isPreloaded) {
				isLastItem = i === objectPreloadQueue.length - 1;
				var inst = dis_.runtime.createInstance(objectPreloadQueue[i].object, dis_.runtime.running_layout.layers[0], 0, 0);
				if (inst) {
					if (cr.plugins_.Spriter && inst.type.plugin instanceof cr.plugins_.Spriter) {
						spriterInst = inst;
						spriterIndex = i;
						spriterInterval = setInterval(function () {
							if (spriterInst.entities) {
								clearInterval(spriterInterval);
								spriterInterval = null;
								objectPreloadQueue[spriterIndex].isPreloaded = true;
								objectsPreloadingState = ((spriterIndex + 1) / objectPreloadQueue.length * 10000) / 100;
								setItemState(objectPreloadQueue[spriterIndex].key, 100, dis_);
								dis_.runtime.DestroyInstance(spriterInst);
							}
						}, 16);
					}
					else {
						objectPreloadQueue[i].isPreloaded = true;
						objectsPreloadingState = ((i + 1) / objectPreloadQueue.length * 10000) / 100;
						setItemState(objectPreloadQueue[i].key, 100, dis_);
						dis_.runtime.DestroyInstance(inst);
					}
				}
				break;
			}
		}
		if (!isLastItem) {
			tickForNextObjectPreloadTrigger = dis_.runtime.tickcount + 2;
			intervalObject = setInterval(function () {
				if (tickForNextObjectPreloadTrigger < dis_.runtime.tickcount) {
					triggerObjectsPreloadingQueue(dis_)
				}
			}, preloader.isLazyPreloading ? preloader.lazyInterval * 1000 : 50);
		}
	}

	function setItemState(key_, newState_, dis_) {
		key_ = key_.toLowerCase();
		if (typeof preloader.items[key_] === 'undefined' || !preloader.items[key_]) {
			preloaderLog("[Preloader ERROR]: Cannot update \"" + key_ + "\" item, because such item does not exist on preloader list.", dis_);
			return;
		}
		preloader.items[key_].currentState = cr.clamp(newState_, 0, 100);
		if (preloader.items[key_].currentState === 100) {
			++preloader.itemsCompleted;
		}
		dis_.runtime.trigger(cr.plugins_.MM_Preloader.prototype.cnds.OnProgress, dis_);
		if (preloader.itemsCompleted === preloader.itemsCount) {
			dis_.runtime.trigger(cr.plugins_.MM_Preloader.prototype.cnds.OnCompleted, dis_);
		}
		else {
			if (!isC2EnginePreloaderAdded) {
				if (preloader.isLazyPreloading && preloader.items[key_].currentState === 100) {
					setTimeout(function () {
						preloaderProcessItems(dis_);
					}, preloader.lazyInterval * 1000);
				}
				else {
					preloaderProcessItems(dis_);
				}
			}
		}
	}

	function preloaderTriggerItem(key_) {
		if (MoMod && preloader.items[key_].trigger.indexOf(" >>> ") !== -1) {
			var moduleName = preloader.items[key_].trigger.substring(0, preloader.items[key_].trigger.indexOf(" >>> "));
			var eventName = preloader.items[key_].trigger.substring(preloader.items[key_].trigger.indexOf(" >>> ") + 5, preloader.items[key_].trigger.length);
			preloader.items[key_].isProcessing = true;
			MoMod.dispatchEvent(moduleName, eventName, []);
		}
		else if (c2_callFunction) {
			preloader.items[key_].isProcessing = true;
			c2_callFunction(preloader.items[key_].trigger, []);
		}
	}

	function preloaderLog(message_, dis_) {
		MM_Debugger ? MM_Debugger.log(0, message_, THIS_TAG, dis_) : console.log(message_);
	}
}());
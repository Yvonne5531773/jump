(function () {
	cr.plugins_.Browser = function(runtime)
	{
		this.runtime = runtime;
	};
	var pluginProto = cr.plugins_.Browser.prototype;
	pluginProto.Type = function (plugin) {
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function () {
	};
	var offlineScriptReady = false;
	var browserPluginReady = false;
	document.addEventListener("DOMContentLoaded", function () {
		if (window["C2_RegisterSW"] && navigator.serviceWorker) {
			var offlineClientScript = document.createElement("script");
			offlineClientScript.onload = function () {
				offlineScriptReady = true;
				checkReady()
			};
			offlineClientScript.src = "offlineClient.js";
			document.head.appendChild(offlineClientScript);
		}
	});
	var browserInstance = null;
	typeProto.onAppBegin = function () {
		browserPluginReady = true;
		checkReady();
	};

	function checkReady() {
		if (offlineScriptReady && browserPluginReady && window["OfflineClientInfo"]) {
			window["OfflineClientInfo"]["SetMessageCallback"](function (e) {
				browserInstance.onSWMessage(e);
			});
		}
	};
	pluginProto.Instance = function (type) {
		this.type = type;
		this.runtime = type.runtime;
	};
	var instanceProto = pluginProto.Instance.prototype;
	instanceProto.onCreate = function () {
		var self = this;
		window.addEventListener("resize", function () {
			self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnResize, self);
		});
		browserInstance = this;
		if (typeof navigator.onLine !== "undefined") {
			window.addEventListener("online", function () {
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnOnline, self);
			});
			window.addEventListener("offline", function () {
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnOffline, self);
			});
		}
		if (typeof window.applicationCache !== "undefined") {
			window.applicationCache.addEventListener('updateready', function () {
				self.runtime.loadingprogress = 1;
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnUpdateReady, self);
			});
			window.applicationCache.addEventListener('progress', function (e) {
				self.runtime.loadingprogress = (e["loaded"] / e["total"]) || 0;
			});
		}
		if (!this.runtime.isDirectCanvas) {
			document.addEventListener("appMobi.device.update.available", function () {
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnUpdateReady, self);
			});
			document.addEventListener("backbutton", function () {
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnBackButton, self);
			});
			document.addEventListener("menubutton", function () {
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnMenuButton, self);
			});
			document.addEventListener("searchbutton", function () {
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnSearchButton, self);
			});
			document.addEventListener("tizenhwkey", function (e) {
				var ret;
				switch (e["keyName"]) {
					case "back":
						ret = self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnBackButton, self);
						if (!ret) {
							if (window["tizen"])
								window["tizen"]["application"]["getCurrentApplication"]()["exit"]();
						}
						break;
					case "menu":
						ret = self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnMenuButton, self);
						if (!ret)
							e.preventDefault();
						break;
				}
			});
		}
		if (this.runtime.isWindows10 && typeof Windows !== "undefined") {
			Windows["UI"]["Core"]["SystemNavigationManager"]["getForCurrentView"]().addEventListener("backrequested", function (e) {
				var ret = self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnBackButton, self);
				if (ret)
					e.handled = true;
			});
		}
		else if (this.runtime.isWinJS && WinJS["Application"]) {
			WinJS["Application"]["onbackclick"] = function (e) {
				return !!self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnBackButton, self);
			};
		}
		this.runtime.addSuspendCallback(function (s) {
			if (s) {
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnPageHidden, self);
			}
			else {
				self.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnPageVisible, self);
			}
		});
		this.is_arcade = (typeof window["is_scirra_arcade"] !== "undefined");
	};
	instanceProto.onSWMessage = function (e) {
		var messageType = e.data.type;
		if (messageType === "downloading-update")
			this.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnUpdateFound, this);
		else if (messageType === "update-ready" || messageType === "update-pending")
			this.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnUpdateReady, this);
		else if (messageType === "offline-ready")
			this.runtime.trigger(cr.plugins_.Browser.prototype.cnds.OnOfflineReady, this);
	};
	var batteryManager = null;
	var loadedBatteryManager = false;

	function maybeLoadBatteryManager() {
		if (loadedBatteryManager)
			return;
		if (!navigator["getBattery"])
			return;
		var promise = navigator["getBattery"]();
		loadedBatteryManager = true;
		if (promise) {
			promise.then(function (manager) {
				batteryManager = manager;
			});
		}
	};

	function Cnds() {
	};
	Cnds.prototype.CookiesEnabled = function () {
		return navigator ? navigator.cookieEnabled : false;
	};
	Cnds.prototype.IsOnline = function () {
		return navigator ? navigator.onLine : false;
	};
	Cnds.prototype.HasJava = function () {
		return navigator ? navigator.javaEnabled() : false;
	};
	Cnds.prototype.OnOnline = function () {
		return true;
	};
	Cnds.prototype.OnOffline = function () {
		return true;
	};
	Cnds.prototype.IsDownloadingUpdate = function () {
		if (typeof window["applicationCache"] === "undefined")
			return false;
		else
			return window["applicationCache"]["status"] === window["applicationCache"]["DOWNLOADING"];
	};
	Cnds.prototype.OnUpdateReady = function () {
		return true;
	};
	Cnds.prototype.PageVisible = function () {
		return !this.runtime.isSuspended;
	};
	Cnds.prototype.OnPageVisible = function () {
		return true;
	};
	Cnds.prototype.OnPageHidden = function () {
		return true;
	};
	Cnds.prototype.OnResize = function () {
		return true;
	};
	Cnds.prototype.IsFullscreen = function () {
		return !!(document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || this.runtime.isNodeFullscreen);
	};
	Cnds.prototype.OnBackButton = function () {
		return true;
	};
	Cnds.prototype.OnMenuButton = function () {
		return true;
	};
	Cnds.prototype.OnSearchButton = function () {
		return true;
	};
	Cnds.prototype.IsMetered = function () {
		var connection = navigator["connection"] || navigator["mozConnection"] || navigator["webkitConnection"];
		if (!connection)
			return false;
		return !!connection["metered"];
	};
	Cnds.prototype.IsCharging = function () {
		var battery = navigator["battery"] || navigator["mozBattery"] || navigator["webkitBattery"];
		if (battery) {
			return !!battery["charging"]
		}
		else {
			maybeLoadBatteryManager();
			if (batteryManager) {
				return !!batteryManager["charging"];
			}
			else {
				return true;		// if unknown, default to charging (powered)
			}
		}
	};
	Cnds.prototype.IsPortraitLandscape = function (p) {
		var current = (window.innerWidth <= window.innerHeight ? 0 : 1);
		return current === p;
	};
	Cnds.prototype.SupportsFullscreen = function () {
		if (this.runtime.isNodeWebkit)
			return true;
		var elem = this.runtime.canvasdiv || this.runtime.canvas;
		return !!(elem["requestFullscreen"] || elem["mozRequestFullScreen"] || elem["msRequestFullscreen"] || elem["webkitRequestFullScreen"]);
	};
	Cnds.prototype.OnUpdateFound = function () {
		return true;
	};
	Cnds.prototype.OnUpdateReady = function () {
		return true;
	};
	Cnds.prototype.OnOfflineReady = function () {
		return true;
	};
	pluginProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.Alert = function (msg) {
		if (!this.runtime.isDomFree)
			alert(msg.toString());
	};
	Acts.prototype.Close = function () {
		if (this.runtime.isCocoonJs)
			CocoonJS["App"]["forceToFinish"]();
		else if (window["tizen"])
			window["tizen"]["application"]["getCurrentApplication"]()["exit"]();
		else if (navigator["app"] && navigator["app"]["exitApp"])
			navigator["app"]["exitApp"]();
		else if (navigator["device"] && navigator["device"]["exitApp"])
			navigator["device"]["exitApp"]();
		else if (!this.is_arcade && !this.runtime.isDomFree)
			window.close();
	};
	Acts.prototype.Focus = function () {
		if (this.runtime.isNodeWebkit) {
			var win = window["nwgui"]["Window"]["get"]();
			win["focus"]();
		}
		else if (!this.is_arcade && !this.runtime.isDomFree)
			window.focus();
	};
	Acts.prototype.Blur = function () {
		if (this.runtime.isNodeWebkit) {
			var win = window["nwgui"]["Window"]["get"]();
			win["blur"]();
		}
		else if (!this.is_arcade && !this.runtime.isDomFree)
			window.blur();
	};
	Acts.prototype.GoBack = function () {
		if (navigator["app"] && navigator["app"]["backHistory"])
			navigator["app"]["backHistory"]();
		else if (!this.is_arcade && !this.runtime.isDomFree && window.back)
			window.back();
	};
	Acts.prototype.GoForward = function () {
		if (!this.is_arcade && !this.runtime.isDomFree && window.forward)
			window.forward();
	};
	Acts.prototype.GoHome = function () {
		if (!this.is_arcade && !this.runtime.isDomFree && window.home)
			window.home();
	};
	Acts.prototype.Reload = function () {
		if (!this.is_arcade && !this.runtime.isDomFree)
			window.location.reload();
	};
	var firstRequestFullscreen = true;
	var crruntime = null;

	function onFullscreenError(e) {
		if (console && console.warn)
			console.warn("Fullscreen request failed: ", e);
		crruntime["setSize"](window.innerWidth, window.innerHeight);
	};
	Acts.prototype.RequestFullScreen = function (stretchmode) {
		if (this.runtime.isDomFree) {
			cr.logexport("[Construct 2] Requesting fullscreen is not supported on this platform - the request has been ignored");
			return;
		}
		if (stretchmode >= 2)
			stretchmode += 1;
		if (stretchmode === 6)
			stretchmode = 2;
		if (this.runtime.isNodeWebkit) {
			if (this.runtime.isDebug) {
				debuggerFullscreen(true);
			}
			else if (!this.runtime.isNodeFullscreen && window["nwgui"]) {
				window["nwgui"]["Window"]["get"]()["enterFullscreen"]();
				this.runtime.isNodeFullscreen = true;
				this.runtime.fullscreen_scaling = (stretchmode >= 2 ? stretchmode : 0);
			}
		}
		else {
			if (document["mozFullScreen"] || document["webkitIsFullScreen"] || !!document["msFullscreenElement"] || document["fullScreen"] || document["fullScreenElement"]) {
				return;
			}
			this.runtime.fullscreen_scaling = (stretchmode >= 2 ? stretchmode : 0);
			var elem = this.runtime.canvasdiv || this.runtime.canvas;
			if (firstRequestFullscreen) {
				firstRequestFullscreen = false;
				crruntime = this.runtime;
				elem.addEventListener("mozfullscreenerror", onFullscreenError);
				elem.addEventListener("webkitfullscreenerror", onFullscreenError);
				elem.addEventListener("MSFullscreenError", onFullscreenError);
				elem.addEventListener("fullscreenerror", onFullscreenError);
			}
			if (elem["requestFullscreen"])
				elem["requestFullscreen"]();
			else if (elem["mozRequestFullScreen"])
				elem["mozRequestFullScreen"]();
			else if (elem["msRequestFullscreen"])
				elem["msRequestFullscreen"]();
			else if (elem["webkitRequestFullScreen"]) {
				if (typeof Element !== "undefined" && typeof Element["ALLOW_KEYBOARD_INPUT"] !== "undefined")
					elem["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]);
				else
					elem["webkitRequestFullScreen"]();
			}
		}
	};
	Acts.prototype.CancelFullScreen = function () {
		if (this.runtime.isDomFree) {
			cr.logexport("[Construct 2] Exiting fullscreen is not supported on this platform - the request has been ignored");
			return;
		}
		if (this.runtime.isNodeWebkit) {
			if (this.runtime.isDebug) {
				debuggerFullscreen(false);
			}
			else if (this.runtime.isNodeFullscreen && window["nwgui"]) {
				window["nwgui"]["Window"]["get"]()["leaveFullscreen"]();
				this.runtime.isNodeFullscreen = false;
			}
		}
		else {
			if (document["exitFullscreen"])
				document["exitFullscreen"]();
			else if (document["mozCancelFullScreen"])
				document["mozCancelFullScreen"]();
			else if (document["msExitFullscreen"])
				document["msExitFullscreen"]();
			else if (document["webkitCancelFullScreen"])
				document["webkitCancelFullScreen"]();
		}
	};
	Acts.prototype.Vibrate = function (pattern_) {
		try {
			var arr = pattern_.split(",");
			var i, len;
			for (i = 0, len = arr.length; i < len; i++) {
				arr[i] = parseInt(arr[i], 10);
			}
			if (navigator["vibrate"])
				navigator["vibrate"](arr);
			else if (navigator["mozVibrate"])
				navigator["mozVibrate"](arr);
			else if (navigator["webkitVibrate"])
				navigator["webkitVibrate"](arr);
			else if (navigator["msVibrate"])
				navigator["msVibrate"](arr);
		}
		catch (e) {
		}
	};
	//Acts.prototype.InvokeDownload = function (url_, filename_)
//	{
//		var a = document.createElement("a");
//		if (typeof a["download"] === "undefined")
//		{
//			window.open(url_);
//		}
//		else
//		{
//			var body = document.getElementsByTagName("body")[0];
//			a.textContent = filename_;
//			a.href = url_;
//			a["download"] = filename_;
//			body.appendChild(a);
//			var clickEvent = new MouseEvent("click");
//			a.dispatchEvent(clickEvent);
//			body.removeChild(a);
//		}
//	};
	//Acts.prototype.InvokeDownloadString = function (str_, mimetype_, filename_)
//	{
//		var datauri = "data:" + mimetype_ + "," + encodeURIComponent(str_);
//		var a = document.createElement("a");
//		if (typeof a["download"] === "undefined")
//		{
//			window.open(datauri);
//		}
//		else
//		{
//			var body = document.getElementsByTagName("body")[0];
//			a.textContent = filename_;
//			a.href = datauri;
//			a["download"] = filename_;
//			body.appendChild(a);
//			var clickEvent = new MouseEvent("click");
//			a.dispatchEvent(clickEvent);
//			body.removeChild(a);
//		}
//	};
	Acts.prototype.ConsoleLog = function (type_, msg_) {
		if (typeof console === "undefined")
			return;
		if (type_ === 0 && console.log)
			console.log(msg_.toString());
		if (type_ === 1 && console.warn)
			console.warn(msg_.toString());
		if (type_ === 2 && console.error)
			console.error(msg_.toString());
	};
	Acts.prototype.ConsoleGroup = function (name_) {
		if (console && console.group)
			console.group(name_);
	};
	Acts.prototype.ConsoleGroupEnd = function () {
		if (console && console.groupEnd)
			console.groupEnd();
	};
	Acts.prototype.ExecJs = function (js_) {
		try {
			if (eval)
				eval(js_);
		}
		catch (e) {
			if (console && console.error)
				console.error("Error executing Javascript: ", e);
		}
	};
	var orientations = [
		"portrait",
		"landscape",
		"portrait-primary",
		"portrait-secondary",
		"landscape-primary",
		"landscape-secondary"
	];
	Acts.prototype.LockOrientation = function (o) {
		o = Math.floor(o);
		if (o < 0 || o >= orientations.length)
			return;
		this.runtime.autoLockOrientation = false;
		var orientation = orientations[o];
		if (screen["orientation"] && screen["orientation"]["lock"])
			screen["orientation"]["lock"](orientation);
		else if (screen["lockOrientation"])
			screen["lockOrientation"](orientation);
		else if (screen["webkitLockOrientation"])
			screen["webkitLockOrientation"](orientation);
		else if (screen["mozLockOrientation"])
			screen["mozLockOrientation"](orientation);
		else if (screen["msLockOrientation"])
			screen["msLockOrientation"](orientation);
	};
	Acts.prototype.UnlockOrientation = function () {
		this.runtime.autoLockOrientation = false;
		if (screen["orientation"] && screen["orientation"]["unlock"])
			screen["orientation"]["unlock"]();
		else if (screen["unlockOrientation"])
			screen["unlockOrientation"]();
		else if (screen["webkitUnlockOrientation"])
			screen["webkitUnlockOrientation"]();
		else if (screen["mozUnlockOrientation"])
			screen["mozUnlockOrientation"]();
		else if (screen["msUnlockOrientation"])
			screen["msUnlockOrientation"]();
	};
	pluginProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.URL = function (ret) {
		ret.set_string(this.runtime.isDomFree ? "" : window.location.toString());
	};
	Exps.prototype.Protocol = function (ret) {
		ret.set_string(this.runtime.isDomFree ? "" : window.location.protocol);
	};
	Exps.prototype.Domain = function (ret) {
		ret.set_string(this.runtime.isDomFree ? "" : window.location.hostname);
	};
	Exps.prototype.PathName = function (ret) {
		ret.set_string(this.runtime.isDomFree ? "" : window.location.pathname);
	};
	Exps.prototype.Hash = function (ret) {
		ret.set_string(this.runtime.isDomFree ? "" : window.location.hash);
	};
	Exps.prototype.Referrer = function (ret) {
		ret.set_string(this.runtime.isDomFree ? "" : document.referrer);
	};
	Exps.prototype.Title = function (ret) {
		ret.set_string(this.runtime.isDomFree ? "" : document.title);
	};
	Exps.prototype.Name = function (ret) {
		ret.set_string(this.runtime.isDomFree ? "" : navigator.appName);
	};
	Exps.prototype.Version = function (ret) {
		ret.set_string(this.runtime.isDomFree ? "" : navigator.appVersion);
	};
	Exps.prototype.Language = function (ret) {
		if (navigator && navigator.language)
			ret.set_string(navigator.language);
		else
			ret.set_string("");
	};
	Exps.prototype.Platform = function (ret) {
		ret.set_string(this.runtime.isDomFree ? "" : navigator.platform);
	};
	Exps.prototype.Product = function (ret) {
		if (navigator && navigator.product)
			ret.set_string(navigator.product);
		else
			ret.set_string("");
	};
	Exps.prototype.Vendor = function (ret) {
		if (navigator && navigator.vendor)
			ret.set_string(navigator.vendor);
		else
			ret.set_string("");
	};
	Exps.prototype.UserAgent = function (ret) {
		ret.set_string(this.runtime.isDomFree ? "" : navigator.userAgent);
	};
	Exps.prototype.QueryString = function (ret) {
		ret.set_string(this.runtime.isDomFree ? "" : window.location.search);
	};
	Exps.prototype.QueryParam = function (ret, paramname) {
		if (this.runtime.isDomFree) {
			ret.set_string("");
			return;
		}
		var match = RegExp('[?&]' + paramname + '=([^&]*)').exec(window.location.search);
		if (match)
			ret.set_string(decodeURIComponent(match[1].replace(/\+/g, ' ')));
		else
			ret.set_string("");
	};
	Exps.prototype.Bandwidth = function (ret) {
		var connection = navigator["connection"] || navigator["mozConnection"] || navigator["webkitConnection"];
		if (!connection)
			ret.set_float(Number.POSITIVE_INFINITY);
		else {
			if (typeof connection["bandwidth"] !== "undefined")
				ret.set_float(connection["bandwidth"]);
			else if (typeof connection["downlinkMax"] !== "undefined")
				ret.set_float(connection["downlinkMax"]);
			else
				ret.set_float(Number.POSITIVE_INFINITY);
		}
	};
	Exps.prototype.ConnectionType = function (ret) {
		var connection = navigator["connection"] || navigator["mozConnection"] || navigator["webkitConnection"];
		if (!connection)
			ret.set_string("unknown");
		else {
			ret.set_string(connection["type"] || "unknown");
		}
	};
	Exps.prototype.BatteryLevel = function (ret) {
		var battery = navigator["battery"] || navigator["mozBattery"] || navigator["webkitBattery"];
		if (battery) {
			ret.set_float(battery["level"]);
		}
		else {
			maybeLoadBatteryManager();
			if (batteryManager) {
				ret.set_float(batteryManager["level"]);
			}
			else {
				ret.set_float(1);		// not supported/unknown: assume charged
			}
		}
	};
	Exps.prototype.BatteryTimeLeft = function (ret) {
		var battery = navigator["battery"] || navigator["mozBattery"] || navigator["webkitBattery"];
		if (battery) {
			ret.set_float(battery["dischargingTime"]);
		}
		else {
			maybeLoadBatteryManager();
			if (batteryManager) {
				ret.set_float(batteryManager["dischargingTime"]);
			}
			else {
				ret.set_float(Number.POSITIVE_INFINITY);		// not supported/unknown: assume infinite time left
			}
		}
	};
	Exps.prototype.ExecJS = function (ret, js_) {
		if (!eval) {
			ret.set_any(0);
			return;
		}
		var result = 0;
		try {
			result = eval(js_);
		}
		catch (e) {
			if (console && console.error)
				console.error("Error executing Javascript: ", e);
		}
		if (typeof result === "number")
			ret.set_any(result);
		else if (typeof result === "string")
			ret.set_any(result);
		else if (typeof result === "boolean")
			ret.set_any(result ? 1 : 0);
		else
			ret.set_any(0);
	};
	Exps.prototype.ScreenWidth = function (ret) {
		ret.set_int(screen.width);
	};
	Exps.prototype.ScreenHeight = function (ret) {
		ret.set_int(screen.height);
	};
	Exps.prototype.DevicePixelRatio = function (ret) {
		ret.set_float(this.runtime.devicePixelRatio);
	};
	Exps.prototype.WindowInnerWidth = function (ret) {
		ret.set_int(window.innerWidth);
	};
	Exps.prototype.WindowInnerHeight = function (ret) {
		ret.set_int(window.innerHeight);
	};
	Exps.prototype.WindowOuterWidth = function (ret) {
		ret.set_int(window.outerWidth);
	};
	Exps.prototype.WindowOuterHeight = function (ret) {
		ret.set_int(window.outerHeight);
	};
	pluginProto.exps = new Exps();
}());
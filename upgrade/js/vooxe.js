(function () {
	cr.plugins_.vooxe = function(runtime)
	{
		this.runtime = runtime;
	};
	var pluginProto = cr.plugins_.vooxe.prototype;
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
		window["vooxe"] = {};
	};
	var instanceProto = pluginProto.Instance.prototype;
	var isSupported = false;
	instanceProto.onCreate = function () {
		if (!window["vooxe"]) {
			cr.logexport("[Construct 2] Vooxe Googleads plugin is required to show googleads ads with Cordova; other platforms are not supported");
			return;
		}
		isSupported = true;
		this.vooxe = window["vooxe"];
		var self = this;
		this.vooxe["onInit"] = function (data) {
			cr.logexport(data.Msg);
			self.isShowingBannerAd = false;
			self.runtime.trigger(cr.plugins_.vooxe.prototype.cnds.onInit, self);
		};
		this.vooxe["onError"] = function (data) {
			cr.logexport("Vooxe Googleads Plugin onError: " + data);
			self.isShowingBannerAd = true;
			self.runtime.trigger(cr.plugins_.vooxe.prototype.cnds.onError, self);
		};
		this.vooxe["onResumeGame"] = function () {
			cr.logexport("Vooxe Googleads Plugin: onResume");
			self.isShowingBannerAd = false;
			self.runtime.trigger(cr.plugins_.vooxe.prototype.cnds.onResumeGame, self);
		};
		this.vooxe["onPauseGame"] = function () {
			cr.logexport("Vooxe Googleads Plugin: onPauseGame");
			self.isShowingBannerAd = true;
			self.runtime.trigger(cr.plugins_.vooxe.prototype.cnds.onPauseGame, self);
		};
		this.vooxe["InitAds"] = function () {
			var settings = {
				gameId: self.properties[0],
				userId: self.properties[1],
				resumeGame: self.vooxe.onResumeGame,
				pauseGame: self.vooxe.onPauseGame,
				onInit: self.vooxe.onInit,
				onError: self.vooxe.onError
			};
			(function (i, s, o, g, r, a, m) {
				i['GameDistribution'] = r;
				i[r] = i[r] || function () {
					(i[r].q = i[r].q || []).push(arguments)
				};
				i[r].l = 1 * new Date();
				a = s.createElement(o);
				m = s.getElementsByTagName(o)[0];
				a.async = 1;
				a.src = g;
				m.parentNode.insertBefore(a, m);
			})(window, document, 'script', '//html5.api.gamedistribution.com/libs/gd/api.js', 'gdApi');
			gdApi(settings);
		}
	};

	function Cnds() {
	};
	Cnds.prototype.IsShowingBanner = function () {
		return this.isShowingBannerAd;
	};
	Cnds.prototype.onInit = function () {
		return true;
	};
	Cnds.prototype.onError = function (data) {
		return true;
	};
	Cnds.prototype.onResumeGame = function (data) {
		return true;
	};
	Cnds.prototype.onPauseGame = function (data) {
		return true;
	};
	pluginProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.ShowBanner = function (key) {
		if (!isSupported) return;
		if (typeof (gdApi.showBanner) === "undefined") {
			cr.logexport("Vooxe Googleads Plugin is not initiliazed or AdBlocker");
			this.vooxe["onResumeGame"]();
			return;
		}
		gdApi.showBanner("{_key:" + key + "}");
		cr.logexport("ShowBanner Key: " + key);
		this.isShowingBannerAd = true;
	};
	Acts.prototype.PlayLog = function () {
		if (!isSupported) return;
		if (typeof (gdApi.play) === "undefined") {
			cr.logexport("Vooxe Googleads Plugin is not initiliazed.");
			this.vooxe["onResumeGame"]();
			return;
		}
		gdApi.play();
	};
	Acts.prototype.CustomLog = function (key) {
		if (!isSupported) return;
		if (typeof (gdApi.customLog) === "undefined") {
			cr.logexport("Vooxe Googleads Plugin is not initiliazed.");
			this.vooxe["onResumeGame"]();
			return;
		}
		gdApi.customLog(key)
	};
	Acts.prototype.InitAds = function () {
		if (!isSupported) return;
		this.vooxe["InitAds"]();
	};
	pluginProto.acts = new Acts();

	function Exps() {
	};
	pluginProto.exps = new Exps();
}());
(function () {
	cr.plugins_.AJAX = function(runtime) {
		this.runtime = runtime;
	}
	var isNWjs = false;
	var path = null;
	var fs = null;
	var nw_appfolder = "";
	var pluginProto = cr.plugins_.AJAX.prototype;
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
		this.lastData = "";
		this.curTag = "";
		this.progress = 0;
		this.timeout = -1;
		isNWjs = this.runtime.isNWjs;
		if (isNWjs) {
			path = require("path");
			fs = require("fs");
			var process = window["process"] || nw["process"];
			nw_appfolder = path["dirname"](process["execPath"]) + "\\";
		}
	};
	var instanceProto = pluginProto.Instance.prototype;
	var theInstance = null;
	window["C2_AJAX_DCSide"] = function (event_, tag_, param_) {
		if (!theInstance)
			return;
		if (event_ === "success") {
			theInstance.curTag = tag_;
			theInstance.lastData = param_;
			theInstance.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyComplete, theInstance);
			theInstance.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnComplete, theInstance);
		}
		else if (event_ === "error") {
			theInstance.curTag = tag_;
			theInstance.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyError, theInstance);
			theInstance.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnError, theInstance);
		}
		else if (event_ === "progress") {
			theInstance.progress = param_;
			theInstance.curTag = tag_;
			theInstance.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnProgress, theInstance);
		}
	};
	instanceProto.onCreate = function () {
		theInstance = this;
	};
	instanceProto.saveToJSON = function () {
		return {"lastData": this.lastData};
	};
	instanceProto.loadFromJSON = function (o) {
		this.lastData = o["lastData"];
		this.curTag = "";
		this.progress = 0;
	};
	var next_request_headers = {};
	var next_override_mime = "";
	instanceProto.doRequest = function (tag_, url_, method_, data_) {
		if (this.runtime.isDirectCanvas) {
			AppMobi["webview"]["execute"]('C2_AJAX_WebSide("' + tag_ + '", "' + url_ + '", "' + method_ + '", ' + (data_ ? '"' + data_ + '"' : "null") + ');');
			return;
		}
		var self = this;
		var request = null;
		var doErrorFunc = function () {
			self.curTag = tag_;
			self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyError, self);
			self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnError, self);
		};
		var errorFunc = function () {
			if (isNWjs) {
				var filepath = nw_appfolder + url_;
				if (fs["existsSync"](filepath)) {
					fs["readFile"](filepath, {"encoding": "utf8"}, function (err, data) {
						if (err) {
							doErrorFunc();
							return;
						}
						self.curTag = tag_;
						self.lastData = data.replace(/\r\n/g, "\n")
						self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyComplete, self);
						self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnComplete, self);
					});
				}
				else
					doErrorFunc();
			}
			else
				doErrorFunc();
		};
		var progressFunc = function (e) {
			if (!e["lengthComputable"])
				return;
			self.progress = e.loaded / e.total;
			self.curTag = tag_;
			self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnProgress, self);
		};
		try {
			if (this.runtime.isWindowsPhone8)
				request = new ActiveXObject("Microsoft.XMLHTTP");
			else
				request = new XMLHttpRequest();
			request.onreadystatechange = function () {
				if (request.readyState === 4) {
					self.curTag = tag_;
					if (request.responseText)
						self.lastData = request.responseText.replace(/\r\n/g, "\n");		// fix windows style line endings
					else
						self.lastData = "";
					if (request.status >= 400) {
						self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyError, self);
						self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnError, self);
					}
					else {
						if ((!isNWjs || self.lastData.length) && !(!isNWjs && request.status === 0 && !self.lastData.length)) {
							self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyComplete, self);
							self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnComplete, self);
						}
					}
				}
			};
			if (!this.runtime.isWindowsPhone8) {
				request.onerror = errorFunc;
				request.ontimeout = errorFunc;
				request.onabort = errorFunc;
				request["onprogress"] = progressFunc;
			}
			request.open(method_, url_);
			if (!this.runtime.isWindowsPhone8) {
				if (this.timeout >= 0 && typeof request["timeout"] !== "undefined")
					request["timeout"] = this.timeout;
			}
			try {
				request.responseType = "text";
			} catch (e) {
			}
			if (data_) {
				if (request["setRequestHeader"] && !next_request_headers.hasOwnProperty("Content-Type")) {
					request["setRequestHeader"]("Content-Type", "application/x-www-form-urlencoded");
				}
			}
			if (request["setRequestHeader"]) {
				var p;
				for (p in next_request_headers) {
					if (next_request_headers.hasOwnProperty(p)) {
						try {
							request["setRequestHeader"](p, next_request_headers[p]);
						}
						catch (e) {
						}
					}
				}
				next_request_headers = {};
			}
			if (next_override_mime && request["overrideMimeType"]) {
				try {
					request["overrideMimeType"](next_override_mime);
				}
				catch (e) {
				}
				next_override_mime = "";
			}
			if (data_)
				request.send(data_);
			else
				request.send();
		}
		catch (e) {
			errorFunc();
		}
	};

	function Cnds() {
	};
	Cnds.prototype.OnComplete = function (tag) {
		return cr.equals_nocase(tag, this.curTag);
	};
	Cnds.prototype.OnAnyComplete = function (tag) {
		return true;
	};
	Cnds.prototype.OnError = function (tag) {
		return cr.equals_nocase(tag, this.curTag);
	};
	Cnds.prototype.OnAnyError = function (tag) {
		return true;
	};
	Cnds.prototype.OnProgress = function (tag) {
		return cr.equals_nocase(tag, this.curTag);
	};
	pluginProto.cnds = new Cnds();

	function Acts() {
	};
	Acts.prototype.Request = function (tag_, url_) {
		var self = this;
		if (this.runtime.isWKWebView && !this.runtime.isAbsoluteUrl(url_)) {
			this.runtime.fetchLocalFileViaCordovaAsText(url_,
				function (str) {
					self.curTag = tag_;
					self.lastData = str.replace(/\r\n/g, "\n");		// fix windows style line endings
					self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyComplete, self);
					self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnComplete, self);
				},
				function (err) {
					self.curTag = tag_;
					self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyError, self);
					self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnError, self);
				});
		}
		else {
			this.doRequest(tag_, url_, "GET");
		}
	};
	Acts.prototype.RequestFile = function (tag_, file_) {
		var self = this;
		if (this.runtime.isWKWebView) {
			this.runtime.fetchLocalFileViaCordovaAsText(file_,
				function (str) {
					self.curTag = tag_;
					self.lastData = str.replace(/\r\n/g, "\n");		// fix windows style line endings
					self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyComplete, self);
					self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnComplete, self);
				},
				function (err) {
					self.curTag = tag_;
					self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnAnyError, self);
					self.runtime.trigger(cr.plugins_.AJAX.prototype.cnds.OnError, self);
				});
		}
		else {
			this.doRequest(tag_, file_, "GET");
		}
	};
	Acts.prototype.Post = function (tag_, url_, data_, method_) {
		this.doRequest(tag_, url_, method_, data_);
	};
	Acts.prototype.SetTimeout = function (t) {
		this.timeout = t * 1000;
	};
	Acts.prototype.SetHeader = function (n, v) {
		next_request_headers[n] = v;
	};
	Acts.prototype.OverrideMIMEType = function (m) {
		next_override_mime = m;
	};
	pluginProto.acts = new Acts();

	function Exps() {
	};
	Exps.prototype.LastData = function (ret) {
		ret.set_string(this.lastData);
	};
	Exps.prototype.Progress = function (ret) {
		ret.set_float(this.progress);
	};
	Exps.prototype.Tag = function (ret) {
		ret.set_string(this.curTag);
	};
	pluginProto.exps = new Exps();
}());
var cr = {};
cr.plugins_ = {};
cr.behaviors = {};
(function() {
	cr.logexport = function (msg) {
		if (window.console && window.console.log)
			window.console.log(msg);
	};
	cr.logerror = function (msg) {
		if (window.console && window.console.error)
			window.console.error(msg);
	};
	cr.seal = function (x) {
		return x;
	};
	cr.freeze = function (x) {
		return x;
	};
	cr.is_undefined = function (x) {
		return typeof x === "undefined";
	};
	cr.is_number = function (x) {
		return typeof x === "number";
	};
	cr.is_string = function (x) {
		return typeof x === "string";
	};
	cr.isPOT = function (x) {
		return x > 0 && ((x - 1) & x) === 0;
	};
	cr.nextHighestPowerOfTwo = function (x) {
		--x;
		for (var i = 1; i < 32; i <<= 1) {
			x = x | x >> i;
		}
		return x + 1;
	}
	cr.abs = function (x) {
		return (x < 0 ? -x : x);
	};
	cr.max = function (a, b) {
		return (a > b ? a : b);
	};
	cr.min = function (a, b) {
		return (a < b ? a : b);
	};
	cr.PI = Math.PI;
	cr.round = function (x) {
		return (x + 0.5) | 0;
	};
	cr.floor = function (x) {
		if (x >= 0)
			return x | 0;
		else
			return (x | 0) - 1;		// correctly round down when negative
	};
	cr.ceil = function (x) {
		var f = x | 0;
		return (f === x ? f : f + 1);
	};

	function Vector2(x, y) {
		this.x = x;
		this.y = y;
		cr.seal(this);
	};
	Vector2.prototype.offset = function (px, py) {
		this.x += px;
		this.y += py;
		return this;
	};
	Vector2.prototype.mul = function (px, py) {
		this.x *= px;
		this.y *= py;
		return this;
	};
	cr.vector2 = Vector2;
	cr.segments_intersect = function (a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y) {
		var max_ax, min_ax, max_ay, min_ay, max_bx, min_bx, max_by, min_by;
		if (a1x < a2x) {
			min_ax = a1x;
			max_ax = a2x;
		}
		else {
			min_ax = a2x;
			max_ax = a1x;
		}
		if (b1x < b2x) {
			min_bx = b1x;
			max_bx = b2x;
		}
		else {
			min_bx = b2x;
			max_bx = b1x;
		}
		if (max_ax < min_bx || min_ax > max_bx)
			return false;
		if (a1y < a2y) {
			min_ay = a1y;
			max_ay = a2y;
		}
		else {
			min_ay = a2y;
			max_ay = a1y;
		}
		if (b1y < b2y) {
			min_by = b1y;
			max_by = b2y;
		}
		else {
			min_by = b2y;
			max_by = b1y;
		}
		if (max_ay < min_by || min_ay > max_by)
			return false;
		var dpx = b1x - a1x + b2x - a2x;
		var dpy = b1y - a1y + b2y - a2y;
		var qax = a2x - a1x;
		var qay = a2y - a1y;
		var qbx = b2x - b1x;
		var qby = b2y - b1y;
		var d = cr.abs(qay * qbx - qby * qax);
		var la = qbx * dpy - qby * dpx;
		if (cr.abs(la) > d)
			return false;
		var lb = qax * dpy - qay * dpx;
		return cr.abs(lb) <= d;
	};

	function Rect(left, top, right, bottom) {
		this.set(left, top, right, bottom);
		cr.seal(this);
	};
	Rect.prototype.set = function (left, top, right, bottom) {
		this.left = left;
		this.top = top;
		this.right = right;
		this.bottom = bottom;
	};
	Rect.prototype.copy = function (r) {
		this.left = r.left;
		this.top = r.top;
		this.right = r.right;
		this.bottom = r.bottom;
	};
	Rect.prototype.width = function () {
		return this.right - this.left;
	};
	Rect.prototype.height = function () {
		return this.bottom - this.top;
	};
	Rect.prototype.offset = function (px, py) {
		this.left += px;
		this.top += py;
		this.right += px;
		this.bottom += py;
		return this;
	};
	Rect.prototype.normalize = function () {
		var temp = 0;
		if (this.left > this.right) {
			temp = this.left;
			this.left = this.right;
			this.right = temp;
		}
		if (this.top > this.bottom) {
			temp = this.top;
			this.top = this.bottom;
			this.bottom = temp;
		}
	};
	Rect.prototype.intersects_rect = function (rc) {
		return !(rc.right < this.left || rc.bottom < this.top || rc.left > this.right || rc.top > this.bottom);
	};
	Rect.prototype.intersects_rect_off = function (rc, ox, oy) {
		return !(rc.right + ox < this.left || rc.bottom + oy < this.top || rc.left + ox > this.right || rc.top + oy > this.bottom);
	};
	Rect.prototype.contains_pt = function (x, y) {
		return (x >= this.left && x <= this.right) && (y >= this.top && y <= this.bottom);
	};
	Rect.prototype.equals = function (r) {
		return this.left === r.left && this.top === r.top && this.right === r.right && this.bottom === r.bottom;
	};
	cr.rect = Rect;

	function Quad() {
		this.tlx = 0;
		this.tly = 0;
		this.trx = 0;
		this.try_ = 0;	// is a keyword otherwise!
		this.brx = 0;
		this.bry = 0;
		this.blx = 0;
		this.bly = 0;
		cr.seal(this);
	};
	Quad.prototype.set_from_rect = function (rc) {
		this.tlx = rc.left;
		this.tly = rc.top;
		this.trx = rc.right;
		this.try_ = rc.top;
		this.brx = rc.right;
		this.bry = rc.bottom;
		this.blx = rc.left;
		this.bly = rc.bottom;
	};
	Quad.prototype.set_from_rotated_rect = function (rc, a) {
		if (a === 0) {
			this.set_from_rect(rc);
		}
		else {
			var sin_a = Math.sin(a);
			var cos_a = Math.cos(a);
			var left_sin_a = rc.left * sin_a;
			var top_sin_a = rc.top * sin_a;
			var right_sin_a = rc.right * sin_a;
			var bottom_sin_a = rc.bottom * sin_a;
			var left_cos_a = rc.left * cos_a;
			var top_cos_a = rc.top * cos_a;
			var right_cos_a = rc.right * cos_a;
			var bottom_cos_a = rc.bottom * cos_a;
			this.tlx = left_cos_a - top_sin_a;
			this.tly = top_cos_a + left_sin_a;
			this.trx = right_cos_a - top_sin_a;
			this.try_ = top_cos_a + right_sin_a;
			this.brx = right_cos_a - bottom_sin_a;
			this.bry = bottom_cos_a + right_sin_a;
			this.blx = left_cos_a - bottom_sin_a;
			this.bly = bottom_cos_a + left_sin_a;
		}
	};
	Quad.prototype.offset = function (px, py) {
		this.tlx += px;
		this.tly += py;
		this.trx += px;
		this.try_ += py;
		this.brx += px;
		this.bry += py;
		this.blx += px;
		this.bly += py;
		return this;
	};
	var minresult = 0;
	var maxresult = 0;

	function minmax4(a, b, c, d) {
		if (a < b) {
			if (c < d) {
				if (a < c)
					minresult = a;
				else
					minresult = c;
				if (b > d)
					maxresult = b;
				else
					maxresult = d;
			}
			else {
				if (a < d)
					minresult = a;
				else
					minresult = d;
				if (b > c)
					maxresult = b;
				else
					maxresult = c;
			}
		}
		else {
			if (c < d) {
				if (b < c)
					minresult = b;
				else
					minresult = c;
				if (a > d)
					maxresult = a;
				else
					maxresult = d;
			}
			else {
				if (b < d)
					minresult = b;
				else
					minresult = d;
				if (a > c)
					maxresult = a;
				else
					maxresult = c;
			}
		}
	};
	Quad.prototype.bounding_box = function (rc) {
		minmax4(this.tlx, this.trx, this.brx, this.blx);
		rc.left = minresult;
		rc.right = maxresult;
		minmax4(this.tly, this.try_, this.bry, this.bly);
		rc.top = minresult;
		rc.bottom = maxresult;
	};
	Quad.prototype.contains_pt = function (x, y) {
		var tlx = this.tlx;
		var tly = this.tly;
		var v0x = this.trx - tlx;
		var v0y = this.try_ - tly;
		var v1x = this.brx - tlx;
		var v1y = this.bry - tly;
		var v2x = x - tlx;
		var v2y = y - tly;
		var dot00 = v0x * v0x + v0y * v0y
		var dot01 = v0x * v1x + v0y * v1y
		var dot02 = v0x * v2x + v0y * v2y
		var dot11 = v1x * v1x + v1y * v1y
		var dot12 = v1x * v2x + v1y * v2y
		var invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
		var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
		if ((u >= 0.0) && (v > 0.0) && (u + v < 1))
			return true;
		v0x = this.blx - tlx;
		v0y = this.bly - tly;
		var dot00 = v0x * v0x + v0y * v0y
		var dot01 = v0x * v1x + v0y * v1y
		var dot02 = v0x * v2x + v0y * v2y
		invDenom = 1.0 / (dot00 * dot11 - dot01 * dot01);
		u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		v = (dot00 * dot12 - dot01 * dot02) * invDenom;
		return (u >= 0.0) && (v > 0.0) && (u + v < 1);
	};
	Quad.prototype.at = function (i, xory) {
		if (xory) {
			switch (i) {
				case 0:
					return this.tlx;
				case 1:
					return this.trx;
				case 2:
					return this.brx;
				case 3:
					return this.blx;
				case 4:
					return this.tlx;
				default:
					return this.tlx;
			}
		}
		else {
			switch (i) {
				case 0:
					return this.tly;
				case 1:
					return this.try_;
				case 2:
					return this.bry;
				case 3:
					return this.bly;
				case 4:
					return this.tly;
				default:
					return this.tly;
			}
		}
	};
	Quad.prototype.midX = function () {
		return (this.tlx + this.trx + this.brx + this.blx) / 4;
	};
	Quad.prototype.midY = function () {
		return (this.tly + this.try_ + this.bry + this.bly) / 4;
	};
	Quad.prototype.intersects_segment = function (x1, y1, x2, y2) {
		if (this.contains_pt(x1, y1) || this.contains_pt(x2, y2))
			return true;
		var a1x, a1y, a2x, a2y;
		var i;
		for (i = 0; i < 4; i++) {
			a1x = this.at(i, true);
			a1y = this.at(i, false);
			a2x = this.at(i + 1, true);
			a2y = this.at(i + 1, false);
			if (cr.segments_intersect(x1, y1, x2, y2, a1x, a1y, a2x, a2y))
				return true;
		}
		return false;
	};
	Quad.prototype.intersects_quad = function (rhs) {
		var midx = rhs.midX();
		var midy = rhs.midY();
		if (this.contains_pt(midx, midy))
			return true;
		midx = this.midX();
		midy = this.midY();
		if (rhs.contains_pt(midx, midy))
			return true;
		var a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y;
		var i, j;
		for (i = 0; i < 4; i++) {
			for (j = 0; j < 4; j++) {
				a1x = this.at(i, true);
				a1y = this.at(i, false);
				a2x = this.at(i + 1, true);
				a2y = this.at(i + 1, false);
				b1x = rhs.at(j, true);
				b1y = rhs.at(j, false);
				b2x = rhs.at(j + 1, true);
				b2y = rhs.at(j + 1, false);
				if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y))
					return true;
			}
		}
		return false;
	};
	cr.quad = Quad;
	cr.RGB = function (red, green, blue) {
		return Math.max(Math.min(red, 255), 0)
			| (Math.max(Math.min(green, 255), 0) << 8)
			| (Math.max(Math.min(blue, 255), 0) << 16);
	};
	cr.GetRValue = function (rgb) {
		return rgb & 0xFF;
	};
	cr.GetGValue = function (rgb) {
		return (rgb & 0xFF00) >> 8;
	};
	cr.GetBValue = function (rgb) {
		return (rgb & 0xFF0000) >> 16;
	};
	cr.shallowCopy = function (a, b, allowOverwrite) {
		var attr;
		for (attr in b) {
			if (b.hasOwnProperty(attr)) {
				;
				a[attr] = b[attr];
			}
		}
		return a;
	};
	cr.arrayRemove = function (arr, index) {
		var i, len;
		index = cr.floor(index);
		if (index < 0 || index >= arr.length)
			return;							// index out of bounds
		for (i = index, len = arr.length - 1; i < len; i++)
			arr[i] = arr[i + 1];
		cr.truncateArray(arr, len);
	};
	cr.truncateArray = function (arr, index) {
		arr.length = index;
	};
	cr.clearArray = function (arr) {
		cr.truncateArray(arr, 0);
	};
	cr.shallowAssignArray = function (dest, src) {
		cr.clearArray(dest);
		var i, len;
		for (i = 0, len = src.length; i < len; ++i)
			dest[i] = src[i];
	};
	cr.appendArray = function (a, b) {
		a.push.apply(a, b);
	};
	cr.fastIndexOf = function (arr, item) {
		var i, len;
		for (i = 0, len = arr.length; i < len; ++i) {
			if (arr[i] === item)
				return i;
		}
		return -1;
	};
	cr.arrayFindRemove = function (arr, item) {
		var index = cr.fastIndexOf(arr, item);
		if (index !== -1)
			cr.arrayRemove(arr, index);
	};
	cr.clamp = function (x, a, b) {
		if (x < a)
			return a;
		else if (x > b)
			return b;
		else
			return x;
	};
	cr.to_radians = function (x) {
		return x / (180.0 / cr.PI);
	};
	cr.to_degrees = function (x) {
		return x * (180.0 / cr.PI);
	};
	cr.clamp_angle_degrees = function (a) {
		a %= 360;       // now in (-360, 360) range
		if (a < 0)
			a += 360;   // now in [0, 360) range
		return a;
	};
	cr.clamp_angle = function (a) {
		a %= 2 * cr.PI;       // now in (-2pi, 2pi) range
		if (a < 0)
			a += 2 * cr.PI;   // now in [0, 2pi) range
		return a;
	};
	cr.to_clamped_degrees = function (x) {
		return cr.clamp_angle_degrees(cr.to_degrees(x));
	};
	cr.to_clamped_radians = function (x) {
		return cr.clamp_angle(cr.to_radians(x));
	};
	cr.angleTo = function (x1, y1, x2, y2) {
		var dx = x2 - x1;
		var dy = y2 - y1;
		return Math.atan2(dy, dx);
	};
	cr.angleDiff = function (a1, a2) {
		if (a1 === a2)
			return 0;
		var s1 = Math.sin(a1);
		var c1 = Math.cos(a1);
		var s2 = Math.sin(a2);
		var c2 = Math.cos(a2);
		var n = s1 * s2 + c1 * c2;
		if (n >= 1)
			return 0;
		if (n <= -1)
			return cr.PI;
		return Math.acos(n);
	};
	cr.angleRotate = function (start, end, step) {
		var ss = Math.sin(start);
		var cs = Math.cos(start);
		var se = Math.sin(end);
		var ce = Math.cos(end);
		if (Math.acos(ss * se + cs * ce) > step) {
			if (cs * se - ss * ce > 0)
				return cr.clamp_angle(start + step);
			else
				return cr.clamp_angle(start - step);
		}
		else
			return cr.clamp_angle(end);
	};
	cr.angleClockwise = function (a1, a2) {
		var s1 = Math.sin(a1);
		var c1 = Math.cos(a1);
		var s2 = Math.sin(a2);
		var c2 = Math.cos(a2);
		return c1 * s2 - s1 * c2 <= 0;
	};
	cr.rotatePtAround = function (px, py, a, ox, oy, getx) {
		if (a === 0)
			return getx ? px : py;
		var sin_a = Math.sin(a);
		var cos_a = Math.cos(a);
		px -= ox;
		py -= oy;
		var left_sin_a = px * sin_a;
		var top_sin_a = py * sin_a;
		var left_cos_a = px * cos_a;
		var top_cos_a = py * cos_a;
		px = left_cos_a - top_sin_a;
		py = top_cos_a + left_sin_a;
		px += ox;
		py += oy;
		return getx ? px : py;
	}
	cr.distanceTo = function (x1, y1, x2, y2) {
		var dx = x2 - x1;
		var dy = y2 - y1;
		return Math.sqrt(dx * dx + dy * dy);
	};
	cr.xor = function (x, y) {
		return !x !== !y;
	};
	cr.lerp = function (a, b, x) {
		return a + (b - a) * x;
	};
	cr.unlerp = function (a, b, c) {
		if (a === b)
			return 0;		// avoid divide by 0
		return (c - a) / (b - a);
	};
	cr.anglelerp = function (a, b, x) {
		var diff = cr.angleDiff(a, b);
		if (cr.angleClockwise(b, a)) {
			return a + diff * x;
		}
		else {
			return a - diff * x;
		}
	};
	cr.qarp = function (a, b, c, x) {
		return cr.lerp(cr.lerp(a, b, x), cr.lerp(b, c, x), x);
	};
	cr.cubic = function (a, b, c, d, x) {
		return cr.lerp(cr.qarp(a, b, c, x), cr.qarp(b, c, d, x), x);
	};
	cr.cosp = function (a, b, x) {
		return (a + b + (a - b) * Math.cos(x * Math.PI)) / 2;
	};
	cr.hasAnyOwnProperty = function (o) {
		var p;
		for (p in o) {
			if (o.hasOwnProperty(p))
				return true;
		}
		return false;
	};
	cr.wipe = function (obj) {
		var p;
		for (p in obj) {
			if (obj.hasOwnProperty(p))
				delete obj[p];
		}
	};
	var startup_time = +(new Date());
	cr.performance_now = function () {
		if (typeof window["performance"] !== "undefined") {
			var winperf = window["performance"];
			if (typeof winperf.now !== "undefined")
				return winperf.now();
			else if (typeof winperf["webkitNow"] !== "undefined")
				return winperf["webkitNow"]();
			else if (typeof winperf["mozNow"] !== "undefined")
				return winperf["mozNow"]();
			else if (typeof winperf["msNow"] !== "undefined")
				return winperf["msNow"]();
		}
		return Date.now() - startup_time;
	};
	var isChrome = false;
	var isSafari = false;
	var isiOS = false;
	var isEjecta = false;
	if (typeof window !== "undefined")		// not c2 editor
	{
		isChrome = /chrome/i.test(navigator.userAgent) || /chromium/i.test(navigator.userAgent);
		isSafari = !isChrome && /safari/i.test(navigator.userAgent);
		isiOS = /(iphone|ipod|ipad)/i.test(navigator.userAgent);
		isEjecta = window["c2ejecta"];
	}
	var supports_set = ((!isSafari && !isEjecta && !isiOS) && (typeof Set !== "undefined" && typeof Set.prototype["forEach"] !== "undefined"));

	function ObjectSet_() {
		this.s = null;
		this.items = null;			// lazy allocated (hopefully results in better GC performance)
		this.item_count = 0;
		if (supports_set) {
			this.s = new Set();
		}
		this.values_cache = [];
		this.cache_valid = true;
		cr.seal(this);
	};
	ObjectSet_.prototype.contains = function (x) {
		if (this.isEmpty())
			return false;
		if (supports_set)
			return this.s["has"](x);
		else
			return (this.items && this.items.hasOwnProperty(x));
	};
	ObjectSet_.prototype.add = function (x) {
		if (supports_set) {
			if (!this.s["has"](x)) {
				this.s["add"](x);
				this.cache_valid = false;
			}
		}
		else {
			var str = x.toString();
			var items = this.items;
			if (!items) {
				this.items = {};
				this.items[str] = x;
				this.item_count = 1;
				this.cache_valid = false;
			}
			else if (!items.hasOwnProperty(str)) {
				items[str] = x;
				this.item_count++;
				this.cache_valid = false;
			}
		}
	};
	ObjectSet_.prototype.remove = function (x) {
		if (this.isEmpty())
			return;
		if (supports_set) {
			if (this.s["has"](x)) {
				this.s["delete"](x);
				this.cache_valid = false;
			}
		}
		else if (this.items) {
			var str = x.toString();
			var items = this.items;
			if (items.hasOwnProperty(str)) {
				delete items[str];
				this.item_count--;
				this.cache_valid = false;
			}
		}
	};
	ObjectSet_.prototype.clear = function (/*wipe_*/) {
		if (this.isEmpty())
			return;
		if (supports_set) {
			this.s["clear"]();			// best!
		}
		else {
			this.items = null;		// creates garbage; will lazy allocate on next add()
			this.item_count = 0;
		}
		cr.clearArray(this.values_cache);
		this.cache_valid = true;
	};
	ObjectSet_.prototype.isEmpty = function () {
		return this.count() === 0;
	};
	ObjectSet_.prototype.count = function () {
		if (supports_set)
			return this.s["size"];
		else
			return this.item_count;
	};
	var current_arr = null;
	var current_index = 0;

	function set_append_to_arr(x) {
		current_arr[current_index++] = x;
	};
	ObjectSet_.prototype.update_cache = function () {
		if (this.cache_valid)
			return;
		if (supports_set) {
			cr.clearArray(this.values_cache);
			current_arr = this.values_cache;
			current_index = 0;
			this.s["forEach"](set_append_to_arr);
			;
			current_arr = null;
			current_index = 0;
		}
		else {
			var values_cache = this.values_cache;
			cr.clearArray(values_cache);
			var p, n = 0, items = this.items;
			if (items) {
				for (p in items) {
					if (items.hasOwnProperty(p))
						values_cache[n++] = items[p];
				}
			}
			;
		}
		this.cache_valid = true;
	};
	ObjectSet_.prototype.valuesRef = function () {
		this.update_cache();
		return this.values_cache;
	};
	cr.ObjectSet = ObjectSet_;
	var tmpSet = new cr.ObjectSet();
	cr.removeArrayDuplicates = function (arr) {
		var i, len;
		for (i = 0, len = arr.length; i < len; ++i) {
			tmpSet.add(arr[i]);
		}
		cr.shallowAssignArray(arr, tmpSet.valuesRef());
		tmpSet.clear();
	};
	cr.arrayRemoveAllFromObjectSet = function (arr, remset) {
		if (supports_set)
			cr.arrayRemoveAll_set(arr, remset.s);
		else
			cr.arrayRemoveAll_arr(arr, remset.valuesRef());
	};
	cr.arrayRemoveAll_set = function (arr, s) {
		var i, j, len, item;
		for (i = 0, j = 0, len = arr.length; i < len; ++i) {
			item = arr[i];
			if (!s["has"](item))					// not an item to remove
				arr[j++] = item;					// keep it
		}
		cr.truncateArray(arr, j);
	};
	cr.arrayRemoveAll_arr = function (arr, rem) {
		var i, j, len, item;
		for (i = 0, j = 0, len = arr.length; i < len; ++i) {
			item = arr[i];
			if (cr.fastIndexOf(rem, item) === -1)	// not an item to remove
				arr[j++] = item;					// keep it
		}
		cr.truncateArray(arr, j);
	};

	function KahanAdder_() {
		this.c = 0;
		this.y = 0;
		this.t = 0;
		this.sum = 0;
		cr.seal(this);
	};
	KahanAdder_.prototype.add = function (v) {
		this.y = v - this.c;
		this.t = this.sum + this.y;
		this.c = (this.t - this.sum) - this.y;
		this.sum = this.t;
	};
	KahanAdder_.prototype.reset = function () {
		this.c = 0;
		this.y = 0;
		this.t = 0;
		this.sum = 0;
	};
	cr.KahanAdder = KahanAdder_;
	cr.regexp_escape = function (text) {
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};

	function CollisionPoly_(pts_array_) {
		this.pts_cache = [];
		this.bboxLeft = 0;
		this.bboxTop = 0;
		this.bboxRight = 0;
		this.bboxBottom = 0;
		this.convexpolys = null;		// for physics behavior to cache separated polys
		this.set_pts(pts_array_);
		cr.seal(this);
	};
	CollisionPoly_.prototype.set_pts = function (pts_array_) {
		this.pts_array = pts_array_;
		this.pts_count = pts_array_.length / 2;			// x, y, x, y... in array
		this.pts_cache.length = pts_array_.length;
		this.cache_width = -1;
		this.cache_height = -1;
		this.cache_angle = 0;
	};
	CollisionPoly_.prototype.is_empty = function () {
		return !this.pts_array.length;
	};
	CollisionPoly_.prototype.update_bbox = function () {
		var myptscache = this.pts_cache;
		var bboxLeft_ = myptscache[0];
		var bboxRight_ = bboxLeft_;
		var bboxTop_ = myptscache[1];
		var bboxBottom_ = bboxTop_;
		var x, y, i = 1, i2, len = this.pts_count;
		for (; i < len; ++i) {
			i2 = i * 2;
			x = myptscache[i2];
			y = myptscache[i2 + 1];
			if (x < bboxLeft_)
				bboxLeft_ = x;
			if (x > bboxRight_)
				bboxRight_ = x;
			if (y < bboxTop_)
				bboxTop_ = y;
			if (y > bboxBottom_)
				bboxBottom_ = y;
		}
		this.bboxLeft = bboxLeft_;
		this.bboxRight = bboxRight_;
		this.bboxTop = bboxTop_;
		this.bboxBottom = bboxBottom_;
	};
	CollisionPoly_.prototype.set_from_rect = function (rc, offx, offy) {
		this.pts_cache.length = 8;
		this.pts_count = 4;
		var myptscache = this.pts_cache;
		myptscache[0] = rc.left - offx;
		myptscache[1] = rc.top - offy;
		myptscache[2] = rc.right - offx;
		myptscache[3] = rc.top - offy;
		myptscache[4] = rc.right - offx;
		myptscache[5] = rc.bottom - offy;
		myptscache[6] = rc.left - offx;
		myptscache[7] = rc.bottom - offy;
		this.cache_width = rc.right - rc.left;
		this.cache_height = rc.bottom - rc.top;
		this.update_bbox();
	};
	CollisionPoly_.prototype.set_from_quad = function (q, offx, offy, w, h) {
		this.pts_cache.length = 8;
		this.pts_count = 4;
		var myptscache = this.pts_cache;
		myptscache[0] = q.tlx - offx;
		myptscache[1] = q.tly - offy;
		myptscache[2] = q.trx - offx;
		myptscache[3] = q.try_ - offy;
		myptscache[4] = q.brx - offx;
		myptscache[5] = q.bry - offy;
		myptscache[6] = q.blx - offx;
		myptscache[7] = q.bly - offy;
		this.cache_width = w;
		this.cache_height = h;
		this.update_bbox();
	};
	CollisionPoly_.prototype.set_from_poly = function (r) {
		this.pts_count = r.pts_count;
		cr.shallowAssignArray(this.pts_cache, r.pts_cache);
		this.bboxLeft = r.bboxLeft;
		this.bboxTop - r.bboxTop;
		this.bboxRight = r.bboxRight;
		this.bboxBottom = r.bboxBottom;
	};
	CollisionPoly_.prototype.cache_poly = function (w, h, a) {
		if (this.cache_width === w && this.cache_height === h && this.cache_angle === a)
			return;		// cache up-to-date
		this.cache_width = w;
		this.cache_height = h;
		this.cache_angle = a;
		var i, i2, i21, len, x, y;
		var sina = 0;
		var cosa = 1;
		var myptsarray = this.pts_array;
		var myptscache = this.pts_cache;
		if (a !== 0) {
			sina = Math.sin(a);
			cosa = Math.cos(a);
		}
		for (i = 0, len = this.pts_count; i < len; i++) {
			i2 = i * 2;
			i21 = i2 + 1;
			x = myptsarray[i2] * w;
			y = myptsarray[i21] * h;
			myptscache[i2] = (x * cosa) - (y * sina);
			myptscache[i21] = (y * cosa) + (x * sina);
		}
		this.update_bbox();
	};
	CollisionPoly_.prototype.contains_pt = function (a2x, a2y) {
		var myptscache = this.pts_cache;
		if (a2x === myptscache[0] && a2y === myptscache[1])
			return true;
		var i, i2, imod, len = this.pts_count;
		var a1x = this.bboxLeft - 110;
		var a1y = this.bboxTop - 101;
		var a3x = this.bboxRight + 131
		var a3y = this.bboxBottom + 120;
		var b1x, b1y, b2x, b2y;
		var count1 = 0, count2 = 0;
		for (i = 0; i < len; i++) {
			i2 = i * 2;
			imod = ((i + 1) % len) * 2;
			b1x = myptscache[i2];
			b1y = myptscache[i2 + 1];
			b2x = myptscache[imod];
			b2y = myptscache[imod + 1];
			if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y))
				count1++;
			if (cr.segments_intersect(a3x, a3y, a2x, a2y, b1x, b1y, b2x, b2y))
				count2++;
		}
		return (count1 % 2 === 1) || (count2 % 2 === 1);
	};
	CollisionPoly_.prototype.intersects_poly = function (rhs, offx, offy) {
		var rhspts = rhs.pts_cache;
		var mypts = this.pts_cache;
		if (this.contains_pt(rhspts[0] + offx, rhspts[1] + offy))
			return true;
		if (rhs.contains_pt(mypts[0] - offx, mypts[1] - offy))
			return true;
		var i, i2, imod, leni, j, j2, jmod, lenj;
		var a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y;
		for (i = 0, leni = this.pts_count; i < leni; i++) {
			i2 = i * 2;
			imod = ((i + 1) % leni) * 2;
			a1x = mypts[i2];
			a1y = mypts[i2 + 1];
			a2x = mypts[imod];
			a2y = mypts[imod + 1];
			for (j = 0, lenj = rhs.pts_count; j < lenj; j++) {
				j2 = j * 2;
				jmod = ((j + 1) % lenj) * 2;
				b1x = rhspts[j2] + offx;
				b1y = rhspts[j2 + 1] + offy;
				b2x = rhspts[jmod] + offx;
				b2y = rhspts[jmod + 1] + offy;
				if (cr.segments_intersect(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y))
					return true;
			}
		}
		return false;
	};
	CollisionPoly_.prototype.intersects_segment = function (offx, offy, x1, y1, x2, y2) {
		var mypts = this.pts_cache;
		if (this.contains_pt(x1 - offx, y1 - offy))
			return true;
		var i, leni, i2, imod;
		var a1x, a1y, a2x, a2y;
		for (i = 0, leni = this.pts_count; i < leni; i++) {
			i2 = i * 2;
			imod = ((i + 1) % leni) * 2;
			a1x = mypts[i2] + offx;
			a1y = mypts[i2 + 1] + offy;
			a2x = mypts[imod] + offx;
			a2y = mypts[imod + 1] + offy;
			if (cr.segments_intersect(x1, y1, x2, y2, a1x, a1y, a2x, a2y))
				return true;
		}
		return false;
	};
	CollisionPoly_.prototype.mirror = function (px) {
		var i, leni, i2;
		for (i = 0, leni = this.pts_count; i < leni; ++i) {
			i2 = i * 2;
			this.pts_cache[i2] = px * 2 - this.pts_cache[i2];
		}
	};
	CollisionPoly_.prototype.flip = function (py) {
		var i, leni, i21;
		for (i = 0, leni = this.pts_count; i < leni; ++i) {
			i21 = i * 2 + 1;
			this.pts_cache[i21] = py * 2 - this.pts_cache[i21];
		}
	};
	CollisionPoly_.prototype.diag = function () {
		var i, leni, i2, i21, temp;
		for (i = 0, leni = this.pts_count; i < leni; ++i) {
			i2 = i * 2;
			i21 = i2 + 1;
			temp = this.pts_cache[i2];
			this.pts_cache[i2] = this.pts_cache[i21];
			this.pts_cache[i21] = temp;
		}
	};
	cr.CollisionPoly = CollisionPoly_;

	function SparseGrid_(cellwidth_, cellheight_) {
		this.cellwidth = cellwidth_;
		this.cellheight = cellheight_;
		this.cells = {};
	};
	SparseGrid_.prototype.totalCellCount = 0;
	SparseGrid_.prototype.getCell = function (x_, y_, create_if_missing) {
		var ret;
		var col = this.cells[x_];
		if (!col) {
			if (create_if_missing) {
				ret = allocGridCell(this, x_, y_);
				this.cells[x_] = {};
				this.cells[x_][y_] = ret;
				return ret;
			}
			else
				return null;
		}
		ret = col[y_];
		if (ret)
			return ret;
		else if (create_if_missing) {
			ret = allocGridCell(this, x_, y_);
			this.cells[x_][y_] = ret;
			return ret;
		}
		else
			return null;
	};
	SparseGrid_.prototype.XToCell = function (x_) {
		return cr.floor(x_ / this.cellwidth);
	};
	SparseGrid_.prototype.YToCell = function (y_) {
		return cr.floor(y_ / this.cellheight);
	};
	SparseGrid_.prototype.update = function (inst, oldrange, newrange) {
		var x, lenx, y, leny, cell;
		if (oldrange) {
			for (x = oldrange.left, lenx = oldrange.right; x <= lenx; ++x) {
				for (y = oldrange.top, leny = oldrange.bottom; y <= leny; ++y) {
					if (newrange && newrange.contains_pt(x, y))
						continue;	// is still in this cell
					cell = this.getCell(x, y, false);	// don't create if missing
					if (!cell)
						continue;	// cell does not exist yet
					cell.remove(inst);
					if (cell.isEmpty()) {
						freeGridCell(cell);
						this.cells[x][y] = null;
					}
				}
			}
		}
		if (newrange) {
			for (x = newrange.left, lenx = newrange.right; x <= lenx; ++x) {
				for (y = newrange.top, leny = newrange.bottom; y <= leny; ++y) {
					if (oldrange && oldrange.contains_pt(x, y))
						continue;	// is still in this cell
					this.getCell(x, y, true).insert(inst);
				}
			}
		}
	};
	SparseGrid_.prototype.queryRange = function (rc, result) {
		var x, lenx, ystart, y, leny, cell;
		x = this.XToCell(rc.left);
		ystart = this.YToCell(rc.top);
		lenx = this.XToCell(rc.right);
		leny = this.YToCell(rc.bottom);
		for (; x <= lenx; ++x) {
			for (y = ystart; y <= leny; ++y) {
				cell = this.getCell(x, y, false);
				if (!cell)
					continue;
				cell.dump(result);
			}
		}
	};
	cr.SparseGrid = SparseGrid_;

	function RenderGrid_(cellwidth_, cellheight_) {
		this.cellwidth = cellwidth_;
		this.cellheight = cellheight_;
		this.cells = {};
	};
	RenderGrid_.prototype.totalCellCount = 0;
	RenderGrid_.prototype.getCell = function (x_, y_, create_if_missing) {
		var ret;
		var col = this.cells[x_];
		if (!col) {
			if (create_if_missing) {
				ret = allocRenderCell(this, x_, y_);
				this.cells[x_] = {};
				this.cells[x_][y_] = ret;
				return ret;
			}
			else
				return null;
		}
		ret = col[y_];
		if (ret)
			return ret;
		else if (create_if_missing) {
			ret = allocRenderCell(this, x_, y_);
			this.cells[x_][y_] = ret;
			return ret;
		}
		else
			return null;
	};
	RenderGrid_.prototype.XToCell = function (x_) {
		return cr.floor(x_ / this.cellwidth);
	};
	RenderGrid_.prototype.YToCell = function (y_) {
		return cr.floor(y_ / this.cellheight);
	};
	RenderGrid_.prototype.update = function (inst, oldrange, newrange) {
		var x, lenx, y, leny, cell;
		if (oldrange) {
			for (x = oldrange.left, lenx = oldrange.right; x <= lenx; ++x) {
				for (y = oldrange.top, leny = oldrange.bottom; y <= leny; ++y) {
					if (newrange && newrange.contains_pt(x, y))
						continue;	// is still in this cell
					cell = this.getCell(x, y, false);	// don't create if missing
					if (!cell)
						continue;	// cell does not exist yet
					cell.remove(inst);
					if (cell.isEmpty()) {
						freeRenderCell(cell);
						this.cells[x][y] = null;
					}
				}
			}
		}
		if (newrange) {
			for (x = newrange.left, lenx = newrange.right; x <= lenx; ++x) {
				for (y = newrange.top, leny = newrange.bottom; y <= leny; ++y) {
					if (oldrange && oldrange.contains_pt(x, y))
						continue;	// is still in this cell
					this.getCell(x, y, true).insert(inst);
				}
			}
		}
	};
	RenderGrid_.prototype.queryRange = function (left, top, right, bottom, result) {
		var x, lenx, ystart, y, leny, cell;
		x = this.XToCell(left);
		ystart = this.YToCell(top);
		lenx = this.XToCell(right);
		leny = this.YToCell(bottom);
		for (; x <= lenx; ++x) {
			for (y = ystart; y <= leny; ++y) {
				cell = this.getCell(x, y, false);
				if (!cell)
					continue;
				cell.dump(result);
			}
		}
	};
	RenderGrid_.prototype.markRangeChanged = function (rc) {
		var x, lenx, ystart, y, leny, cell;
		x = rc.left;
		ystart = rc.top;
		lenx = rc.right;
		leny = rc.bottom;
		for (; x <= lenx; ++x) {
			for (y = ystart; y <= leny; ++y) {
				cell = this.getCell(x, y, false);
				if (!cell)
					continue;
				cell.is_sorted = false;
			}
		}
	};
	cr.RenderGrid = RenderGrid_;
	var gridcellcache = [];

	function allocGridCell(grid_, x_, y_) {
		var ret;
		SparseGrid_.prototype.totalCellCount++;
		if (gridcellcache.length) {
			ret = gridcellcache.pop();
			ret.grid = grid_;
			ret.x = x_;
			ret.y = y_;
			return ret;
		}
		else
			return new cr.GridCell(grid_, x_, y_);
	};

	function freeGridCell(c) {
		SparseGrid_.prototype.totalCellCount--;
		c.objects.clear();
		if (gridcellcache.length < 1000)
			gridcellcache.push(c);
	};

	function GridCell_(grid_, x_, y_) {
		this.grid = grid_;
		this.x = x_;
		this.y = y_;
		this.objects = new cr.ObjectSet();
	};
	GridCell_.prototype.isEmpty = function () {
		return this.objects.isEmpty();
	};
	GridCell_.prototype.insert = function (inst) {
		this.objects.add(inst);
	};
	GridCell_.prototype.remove = function (inst) {
		this.objects.remove(inst);
	};
	GridCell_.prototype.dump = function (result) {
		cr.appendArray(result, this.objects.valuesRef());
	};
	cr.GridCell = GridCell_;
	var rendercellcache = [];

	function allocRenderCell(grid_, x_, y_) {
		var ret;
		RenderGrid_.prototype.totalCellCount++;
		if (rendercellcache.length) {
			ret = rendercellcache.pop();
			ret.grid = grid_;
			ret.x = x_;
			ret.y = y_;
			return ret;
		}
		else
			return new cr.RenderCell(grid_, x_, y_);
	};

	function freeRenderCell(c) {
		RenderGrid_.prototype.totalCellCount--;
		c.reset();
		if (rendercellcache.length < 1000)
			rendercellcache.push(c);
	};

	function RenderCell_(grid_, x_, y_) {
		this.grid = grid_;
		this.x = x_;
		this.y = y_;
		this.objects = [];		// array which needs to be sorted by Z order
		this.is_sorted = true;	// whether array is in correct sort order or not
		this.pending_removal = new cr.ObjectSet();
		this.any_pending_removal = false;
	};
	RenderCell_.prototype.isEmpty = function () {
		if (!this.objects.length) {
			;
			;
			return true;
		}
		if (this.objects.length > this.pending_removal.count())
			return false;
		;
		this.flush_pending();		// takes fast path and just resets state
		return true;
	};
	RenderCell_.prototype.insert = function (inst) {
		if (this.pending_removal.contains(inst)) {
			this.pending_removal.remove(inst);
			if (this.pending_removal.isEmpty())
				this.any_pending_removal = false;
			return;
		}
		if (this.objects.length) {
			var top = this.objects[this.objects.length - 1];
			if (top.get_zindex() > inst.get_zindex())
				this.is_sorted = false;		// 'inst' should be somewhere beneath 'top'
			this.objects.push(inst);
		}
		else {
			this.objects.push(inst);
			this.is_sorted = true;
		}
		;
	};
	RenderCell_.prototype.remove = function (inst) {
		this.pending_removal.add(inst);
		this.any_pending_removal = true;
		if (this.pending_removal.count() >= 30)
			this.flush_pending();
	};
	RenderCell_.prototype.flush_pending = function () {
		;
		if (!this.any_pending_removal)
			return;		// not changed
		if (this.pending_removal.count() === this.objects.length) {
			this.reset();
			return;
		}
		cr.arrayRemoveAllFromObjectSet(this.objects, this.pending_removal);
		this.pending_removal.clear();
		this.any_pending_removal = false;
	};

	function sortByInstanceZIndex(a, b) {
		return a.zindex - b.zindex;
	};
	RenderCell_.prototype.ensure_sorted = function () {
		if (this.is_sorted)
			return;		// already sorted
		this.objects.sort(sortByInstanceZIndex);
		this.is_sorted = true;
	};
	RenderCell_.prototype.reset = function () {
		cr.clearArray(this.objects);
		this.is_sorted = true;
		this.pending_removal.clear();
		this.any_pending_removal = false;
	};
	RenderCell_.prototype.dump = function (result) {
		this.flush_pending();
		this.ensure_sorted();
		if (this.objects.length)
			result.push(this.objects);
	};
	cr.RenderCell = RenderCell_;
	var fxNames = ["lighter",
		"xor",
		"copy",
		"destination-over",
		"source-in",
		"destination-in",
		"source-out",
		"destination-out",
		"source-atop",
		"destination-atop"];
	cr.effectToCompositeOp = function (effect) {
		if (effect <= 0 || effect >= 11)
			return "source-over";
		return fxNames[effect - 1];	// not including "none" so offset by 1
	};
	cr.setGLBlend = function (this_, effect, gl) {
		if (!gl)
			return;
		this_.srcBlend = gl.ONE;
		this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
		switch (effect) {
			case 1:		// lighter (additive)
				this_.srcBlend = gl.ONE;
				this_.destBlend = gl.ONE;
				break;
			case 2:		// xor
				break;	// todo
			case 3:		// copy
				this_.srcBlend = gl.ONE;
				this_.destBlend = gl.ZERO;
				break;
			case 4:		// destination-over
				this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
				this_.destBlend = gl.ONE;
				break;
			case 5:		// source-in
				this_.srcBlend = gl.DST_ALPHA;
				this_.destBlend = gl.ZERO;
				break;
			case 6:		// destination-in
				this_.srcBlend = gl.ZERO;
				this_.destBlend = gl.SRC_ALPHA;
				break;
			case 7:		// source-out
				this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
				this_.destBlend = gl.ZERO;
				break;
			case 8:		// destination-out
				this_.srcBlend = gl.ZERO;
				this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
				break;
			case 9:		// source-atop
				this_.srcBlend = gl.DST_ALPHA;
				this_.destBlend = gl.ONE_MINUS_SRC_ALPHA;
				break;
			case 10:	// destination-atop
				this_.srcBlend = gl.ONE_MINUS_DST_ALPHA;
				this_.destBlend = gl.SRC_ALPHA;
				break;
		}
	};
	cr.round6dp = function (x) {
		return Math.round(x * 1000000) / 1000000;
	};
	/*
	 var localeCompare_options = {
	 "usage": "search",
	 "sensitivity": "accent"
	 };
	 var has_localeCompare = !!"a".localeCompare;
	 var localeCompare_works1 = (has_localeCompare && "a".localeCompare("A", undefined, localeCompare_options) === 0);
	 var localeCompare_works2 = (has_localeCompare && "a".localeCompare("á", undefined, localeCompare_options) !== 0);
	 var supports_localeCompare = (has_localeCompare && localeCompare_works1 && localeCompare_works2);
	 */
	cr.equals_nocase = function (a, b) {
		if (typeof a !== "string" || typeof b !== "string")
			return false;
		if (a.length !== b.length)
			return false;
		if (a === b)
			return true;
		/*
		 if (supports_localeCompare)
		 {
		 return (a.localeCompare(b, undefined, localeCompare_options) === 0);
		 }
		 else
		 {
		 */
		return a.toLowerCase() === b.toLowerCase();
	};
	cr.isCanvasInputEvent = function (e) {
		var target = e.target;
		if (!target)
			return true;
		if (target === document || target === window)
			return true;
		if (document && document.body && target === document.body)
			return true;
		if (cr.equals_nocase(target.tagName, "canvas"))
			return true;
		return false;
	};
	cr.system_object = function (runtime)
	{
		this.runtime = runtime;
		this.waits = [];
	};
	cr.system_object.prototype.saveToJSON = function ()
	{
		var o = {};
		var i, len, j, lenj, p, w, t, sobj;
		o["waits"] = [];
		var owaits = o["waits"];
		var waitobj;
		for (i = 0, len = this.waits.length; i < len; i++)
		{
			w = this.waits[i];
			waitobj = {
				"t": w.time,
				"st": w.signaltag,
				"s": w.signalled,
				"ev": w.ev.sid,
				"sm": [],
				"sols": {}
			};
			if (w.ev.actions[w.actindex])
				waitobj["act"] = w.ev.actions[w.actindex].sid;
			for (j = 0, lenj = w.solModifiers.length; j < lenj; j++)
				waitobj["sm"].push(w.solModifiers[j].sid);
			for (p in w.sols)
			{
				if (w.sols.hasOwnProperty(p))
				{
					t = this.runtime.types_by_index[parseInt(p, 10)];
					;
					sobj = {
						"sa": w.sols[p].sa,
						"insts": []
					};
					for (j = 0, lenj = w.sols[p].insts.length; j < lenj; j++)
						sobj["insts"].push(w.sols[p].insts[j].uid);
					waitobj["sols"][t.sid.toString()] = sobj;
				}
			}
			owaits.push(waitobj);
		}
		return o;
	};
	cr.system_object.prototype.loadFromJSON = function (o)
	{
		var owaits = o["waits"];
		var i, len, j, lenj, p, w, addWait, e, aindex, t, savedsol, nusol, inst;
		cr.clearArray(this.waits);
		for (i = 0, len = owaits.length; i < len; i++)
		{
			w = owaits[i];
			e = this.runtime.blocksBySid[w["ev"].toString()];
			if (!e)
				continue;	// event must've gone missing
			aindex = -1;
			for (j = 0, lenj = e.actions.length; j < lenj; j++)
			{
				if (e.actions[j].sid === w["act"])
				{
					aindex = j;
					break;
				}
			}
			if (aindex === -1)
				continue;	// action must've gone missing
			addWait = {};
			addWait.sols = {};
			addWait.solModifiers = [];
			addWait.deleteme = false;
			addWait.time = w["t"];
			addWait.signaltag = w["st"] || "";
			addWait.signalled = !!w["s"];
			addWait.ev = e;
			addWait.actindex = aindex;
			for (j = 0, lenj = w["sm"].length; j < lenj; j++)
			{
				t = this.runtime.getObjectTypeBySid(w["sm"][j]);
				if (t)
					addWait.solModifiers.push(t);
			}
			for (p in w["sols"])
			{
				if (w["sols"].hasOwnProperty(p))
				{
					t = this.runtime.getObjectTypeBySid(parseInt(p, 10));
					if (!t)
						continue;		// type must've been deleted
					savedsol = w["sols"][p];
					nusol = {
						sa: savedsol["sa"],
						insts: []
					};
					for (j = 0, lenj = savedsol["insts"].length; j < lenj; j++)
					{
						inst = this.runtime.getObjectByUID(savedsol["insts"][j]);
						if (inst)
							nusol.insts.push(inst);
					}
					addWait.sols[t.index.toString()] = nusol;
				}
			}
			this.waits.push(addWait);
		}
	};
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
	}

	cr.shaders = {}

}());
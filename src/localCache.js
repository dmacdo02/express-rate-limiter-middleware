'use strict';

const promise = require('bluebird');

class localCache {

	constructor(options) {
		this.windowMs = options.defaultTimingWindowMs;
		this.hits = {};
	}

	incr(key) {
		const self = this;
		if (self.hits[key]) {
			self.hits[key]++;
		} else {
			self.hits[key] = 1;
		}
		setTimeout(() => {
			self.hits[key]--;
		}, self.windowMs);

		return self.get(key);
	}

	get(key) {
		return promise.resolve(this.hits[key]);
	}
}

module.exports = localCache;
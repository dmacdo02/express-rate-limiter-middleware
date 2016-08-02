'use strict';

const bluebird = require('bluebird'),
	redis = require('redis');
bluebird.promisifyAll(redis.RedisClient.prototype);

class redisCache {

	constructor(options) {
		this.windowMs = options.defaultTimingWindowMs;
		this.client = redis.createClient( options.redisOptions );
	}

	incr(key) {
		const self = this;
		return self.client.incrAsync(key)
			.then((updatedValue) => {
				setTimeout(() => {
					self.client.incr(key, -1);
				}, self.windowMs);

				return updatedValue;
			});
	}

	get(key) {
		return this.client.getAsync(key);
	}
}

module.exports = redisCache;

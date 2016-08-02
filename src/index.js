'use strict';

const localCache = require('./localCache');
const redisCache = require('./redisCache');

module.exports = rateLimiter;

function rateLimiter( options, patterns ) {

	const cache = getCache(options);

	return function limiter( req, res, next) {
		//using for instead of arr.forEach for maximum performance
		for ( let i = 0, len = patterns.length; i < len; i++) {
			const currentPattern = patterns[i];
			const url = req.url;

			if (!matchesRateLimitPattern(currentPattern, url)) continue;

			const cacheKey = getCacheKey(currentPattern);
			return cache.get(cacheKey)
				.then((requestCount) => {
					if (isAboveLimit(requestCount, currentPattern.rateLimit, res)) {
						return;
					}
					return cache.incr(cacheKey).then(() => {
						next();
					});
				});
		}

		next();
	};
}

function getCache(options) {
	let cache;
	if (options.redisOptions) {
		cache = new redisCache(options);
	} else {
		cache = new localCache(options);
	}
	return cache;
}

function getCacheKey(pattern) {
	return `rateLimiterCacheKey:${pattern.regexPattern}`;
}

function matchesRateLimitPattern( pattern, url ) {
	return matchesSubstring(pattern, url) && matchesPattern(pattern, url);
}

function matchesSubstring(pattern, url) {
	if (pattern.patternSubString && url.indexOf(pattern.patternSubString) === -1) {
		return false;
	}
	return true;
}

function matchesPattern(pattern, url) {
	return url.match(pattern.regexPattern);
}

function isAboveLimit(requestCount, rateLimit, res) {
	if (requestCount >= rateLimit) {
		res.status(429);
		res.send('Exceeded Request Limit.');
		return true;
	}
	return false;
}

'use strict';

const express = require('express');
const app = express();

const options = {
	/*redisOptions: {
		host: '127.0.0.1',
		port: 6379
	},*/
	defaultTimingWindowMs: 10000
};

const patterns = [{
	regexPattern: '.*\/test1\/',
	patternSubString: '/api/',
	rateLimit: 5,
	timingWindow: 5000
}];
const rateLimiterMiddleware = require('./index')(options, patterns);

app.use(rateLimiterMiddleware);
app.listen(3000, () => {console.log('listening on port 3000');});

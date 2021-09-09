require('dotenv').config();
const redis = require('redis');
const { movieLinkIsValid } = require('../utils/helper');
const redisClient = redis.createClient(
    process.env.REDIS_PORT,
    process.env.REDIS_HOST,
    { no_ready_check: true } 
);
const DATA_EXPIRATION_TIME_IN_SECONDS = process.env.DATA_EXPIRATION_TIME_IN_SECONDS; // The lifetime of cached data before expiry
/*
redisClient.auth(process.env.REDIS_PASSWORD, function (err) {
    if (err){
        console.log('Redis Connection Error: ' + err);
    }
});
*/
redisClient.on('connect', function() {
    console.log(`Connected to Redis on port ${process.env.REDIS_PORT}`);
});

redisClient.on('error', function (err) {
    console.log('Redis Error: ' + err);
}); 

/**
 * Look for the Viaplay movie link in Redis as a key a retrieve the value
 * @param {Object}  req    HTTP request object
 * @param {Object}  res    HTTP response object
 * @param {Function}  next    The following function in the middleware stack
 */
function getFromCache(req, res, next) {
    const { movieLink } = req.query;
    if(movieLinkIsValid(movieLink)){
        console.log('Checking Redis...');
        redisClient.get(movieLink, function(err, data) {
            if (err) {
                console.log(`Cache Middleware Error: ${err}`);;
            } else if (data !== null) {
                console.log(`Found in Redis: ${movieLink}`);
                res.status(200).json(JSON.parse(data));
            } else {
                console.log(`Did not find ${movieLink} in Redis`);
                next();
            }
        });
    } else {
        res.status(400).json( {error: `"${movieLink}" is not in a proper URL format`} );
    }
}

/**
 * Save the movie URL as a key and its trailers as the value
 * @param {String}  movieLink    Viaplay movie URL
 * @param {String}  trailerResultsJson    String representation of trailer results in JSON
 */
function saveToCache(movieLink, trailerResultsJson) {
    redisClient.setex(movieLink, DATA_EXPIRATION_TIME_IN_SECONDS, trailerResultsJson, function(err, result) {
        if(err) {
            console.log(err);
        } else {
            console.log(`Saved key to Redis: ${movieLink} - ${result}`);
        }
    });
}

/**
 * Remove the key and its value from Redis
 * @param {String}  movieLink    Viaplay movie URL
 */
function deleteFromCache(movieLink) {
    redisClient.del(movieLink, function(err, result) {
        if(err) {
            console.log(err);
        } else {
            console.log(`Deleted from Redis: ${movieLink} - ${result}`);
        }
    });
}

module.exports = {getFromCache, saveToCache, deleteFromCache};
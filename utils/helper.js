const validator = require('validator');
const fetch = require('node-fetch');

/**
 * Take the Viaplay movie URL from the request and return the IMDB ID of the movie.
 * The movie URL must include a HTTP or HTTPS protocol and have a valid format
 * @example
 * GET http://localhost:5000/trailer/?movieLink=http://content.viaplay.se/pc-se/film/fargo-1996
 * // returns {"imdbId":"tt0116282"}
 * @param {Object}  req    HTTP request object
 * @param {Object}  res    HTTP response object
 * @returns {Object} Returns JSON response with the movie ID or error
 */
async function getImdbId(req, res) {
    const { movieLink } = req.query;
    if(movieLink) { 
        // Validate the movieLink as a URL
        if(movieLinkIsValid(movieLink)) {
            // Get the IMDB ID
            try {
                const data = await fetch(movieLink);
                const movieJSON = await data.json();
                const response = { imdbId: `${movieJSON._embedded['viaplay:blocks'][0]._embedded['viaplay:product'].content.imdb.id}` };
                console.log(`Got the JSON from: ${movieLink}`);
                return response;
            } catch(error) {
                return { 
                    error: `Error getting IMDB response for ${movieLink}`,
                    http_status_code: 500,
                };
            }
        } else {
            return { 
                error: `"${movieLink}" is not in a proper URL format`,
                http_status_code: 400,
            };
        }
    } else {
        return { 
            error: `A \"movieLink\" query parameter is required for this request`,
            http_status_code: 400,
        };
    }
}

/**
 * Format the URL of the target video based on its site
 * @param {String}  site    The site hosting the trailer video
 * @param {String}  key     The video ID
 * @returns {Object} Returns JSON response with the movie ID or error
 */
function formatTrailerLink(site, key) {
    switch(site.toLowerCase()) {
        case 'youtube':
            return `https://www.youtube.com/watch?v=${key}`;
        case 'vimeo':
            return `https://vimeo.com/${key}`;
        default:
            return '';
    }
}

/**
 * Validate that the URL is in a valid format with either HTTP or HTTPS protocols
 * @param {String}  movieLink     The Viaplay movie URL
 * @returns {Boolean} True or false depending on the validity of the URL
 */
function movieLinkIsValid(movieLink) {
    if(movieLink) {
        return validator.isURL(movieLink, { 
            protocols: ['http','https'],
            require_protocol: true,
            require_host: true,
            require_valid_protocol: true}
        );
    }
    return false;
}

module.exports = {getImdbId, formatTrailerLink, movieLinkIsValid}
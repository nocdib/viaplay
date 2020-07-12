const express = require('express');
const { getFromCache, saveToCache } = require('../middleware/cache');
const { formatTrailerLink, getImdbId } = require('../utils/helper');
const fetch = require('node-fetch');
require('dotenv').config();

const router = express.Router();

// See if the movie URL is cached before using the TMDB API
router.get('/', getFromCache, getTrailerUrl);

/**
 * Responds with either the trailer link(s) for a movie on Viaplay or an error
 * @param {Object}  req    HTTP request object
 * @param {Object}  res    HTTP response object
 */
async function getTrailerUrl(req, res) {
    const { movieLink } = req.query;
    const { imdbId, error, http_status_code } = await getImdbId(req, res);
    // Get the trailer URL from TMDB if an IMDB ID is returned
    if(imdbId) {
        const TMDB_API_KEY = (process.env.TMDB_API_KEY);
        const tmdbEndpoint = 'https://api.themoviedb.org/3/movie/' +
            imdbId +
            '/videos?api_key=' + 
            TMDB_API_KEY +
            '&language=en-US';
        console.log(`Fetching trailer data from the TMDB API...`);
        const data = await fetch(tmdbEndpoint);
        const movieJSON = await data.json();
        // Filter the results for only trailers. No teasers, etc.
        let trailerResults = movieJSON.results.filter((result) => result.type == "Trailer");
        // Format the trailer URL (YouTube, Vimeo)
        trailerResults.forEach((item, index, arr) => arr[index] = formatTrailerLink(item.site, item.key));
        // Cache the results in Redis
        const trailerResultsJson = { trailers: trailerResults };
        saveToCache(movieLink, JSON.stringify(trailerResultsJson));
        // return trailer URLs
        res.status(200).json(trailerResultsJson);
    } else {
    // An error was returned instead of an IMDB ID
        res.status(http_status_code).json({ error: error });
    }
}

module.exports = router;
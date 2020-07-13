# Viaplay Movie Trailer API

This API uses a single endpoint to take a Viaplay film URL as input and return the URLs to its trailers in a JSON formatted array. The only working endpoint is  **/trailer** and it takes a single query parameter from the request, **movieLink**, which is the Viaplay film URL. The URL must be include the protocol and the host to have results returned.

For example, a GET request to:
 **http://localhost:5000/trailer/?movieLink=http://content.viaplay.se/pc-se/film/bohemian-rhapsody-2018**
returns the JSON object:

		{
			"trailers": [
				"https://www.youtube.com/watch?v=mP0VHJYFOAU",
				"https://www.youtube.com/watch?v=27zlBpzdOZg"
				]
		}

Redis is used as a caching layer to minimize repeated calls to the Viaplay and TMDB APIs and increase the speed of returning results. When a request is made to the endpoint Redis is checked first. If the Viaplay film URL is not present as a cached key then a call is made to the Viaplay content API to get the IMDB ID of the film followed by a call to the TMDB API to get the trailers for the film.

## Technologies Used
- Node.js - Platform language
- Express - Web application framework 
- Redis - In-memory cache (I used the free cloud tier on redislabs.com)


## Configuration Steps
- Clone the repository.
- Run `npm install` in the same directory as **package.json**.
- Rename the file **.sample-env** to **.env** and configure the variables.
- Run `npm start` to start the server.

## Testing The API

With the default settings the API endpoint will be http://localhost:5000/trailer/. Using an API testing tool like Postman or a browser with a network analysis console send a GET request to the endpoint with a query parameter key of **movieLink** and a value that is a valid Viaplay film URL. The following cases have been tested:
- Positive test using working links
- No movieLink query (GET request to http://localhost:5000/trailer/)
- Queries to invalid routes (anything that isn't **/trailer**)
- Invalid movieLink format: content.viaplay.se/pc-se/film/fargo-1996
- No result from movieLink query: http://content.viaplay.se/pc-se/film/fargo-3000
- Query the same movieLink value before and after it expires in Redis to see the difference in the response. The cache can reduce response time by more than 10x.

For production-readiness, an automated performance test to benchmark the response times under certain levels of traffic would be necessary. Automated tests of the cases mentioned above would be a target as well.
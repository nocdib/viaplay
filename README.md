I had done this exercise for an interview with Nordic Entertainment Group's Viaplay division as a backend engineer. I completed this over the weekend of July 10-12, 2020 after having not touched Node.js for a year. The excercise is described in **assigment.pdf**.

# Viaplay Movie Trailer API

This API uses a single endpoint to take a Viaplay film URL as input and return the URLs to its trailers in a JSON formatted array. The only working endpoint is  **/trailer** and it takes a single query parameter from the request, **movieLink**, which is the Viaplay film URL. The URL must include the protocol and the host to have results returned.

For example, a GET request to:
 **http://localhost:3000/trailer/?movieLink=https://content.viaplay.se/pc-se/film/arrival-2016**
returns the JSON object:

		{
			"trailers": [
				"https://www.youtube.com/watch?v=7W1m5ER3I1Y",
				"https://www.youtube.com/watch?v=tFMo3UJ4B4g"
			]
		}

Redis is used as a caching layer to minimize repeated calls to the Viaplay and TMDB APIs and increase the speed of returning results. When a request is made to the endpoint Redis is checked first. If the Viaplay film URL is not present as a cached key then a call is made to the Viaplay content API to get the IMDB ID of the film followed by a call to the TMDB API to get the trailers for the film.

## Technologies Used
- Node.js - Platform language
- Express - Web application framework
- Redis - In-memory cache
- Docker - Containerization

## Configuration Steps
- Clone the repository.
- Run `npm install` in the same directory as **package.json**.
- Rename the file **.sample-env** to **web-variables.env** and configure the variables.
- Run `docker-compose up` from the same location as **docker-compose.yml**.

## Testing The API

With the default settings the API endpoint will be http://localhost:3000/trailer/. Using an API testing tool like Postman or a browser with a network analysis console send a GET request to the endpoint with a query parameter key of **movieLink** and a value that is a valid Viaplay film URL. The following cases have been tested:
- Positive test using working links: http://localhost:3000/trailer/?movieLink=https://content.viaplay.se/pc-se/film/jumanji-the-next-level-2019
- No movieLink query (GET request to http://localhost:3000/trailer/)
- Queries to invalid routes (anything that isn't **/trailer**)
- Invalid movieLink format: content.viaplay.se/pc-se/film/fargo-1996
- No result from movieLink query: http://content.viaplay.se/pc-se/film/fargo-3000
- Query the same movieLink value before and after it expires in Redis to see the difference in the response. The cache can reduce response time by more than 10x.

For production-readiness, an automated performance test to benchmark the response times under certain levels of traffic would be necessary. Automated tests of the cases mentioned above would be a target as well.
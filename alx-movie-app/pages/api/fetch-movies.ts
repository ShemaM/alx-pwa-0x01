import { MoviesProps } from "@/interfaces";
import { NextApiRequest, NextApiResponse } from "next";

const DEFAULT_RAPIDAPI_HOST =
  "tmdb-movies-and-tv-shows-api-by-apirobots.p.rapidapi.com";
const DEFAULT_RAPIDAPI_URL = `https://${DEFAULT_RAPIDAPI_HOST}/v1/tmdb/random`;
const FALLBACK_POSTER =
  "https://m.media-amazon.com/images/I/718A7YQq63L._AC_SY679_.jpg";

type RequestBody = {
  year?: number | string;
  page?: number | string;
  genre?: string;
};

type RapidMovie = {
  id?: string | number;
  tmdb_id?: string | number;
  imdb_id?: string | number;
  primaryImage?: { url?: string };
  image?: string;
  posterImage?: string;
  poster_path?: string;
  titleText?: { text?: string };
  title?: string;
  name?: string;
  original_title?: string;
  releaseYear?: { year?: string | number };
  year?: string | number;
  release_date?: string;
  first_air_date?: string;
};

type RapidMoviesPayload =
  | RapidMovie[]
  | {
      results?: RapidMovie[];
      titles?: RapidMovie[];
      data?:
        | RapidMovie[]
        | {
            results?: RapidMovie[];
            titles?: RapidMovie[];
          }
        | RapidMovie;
      result?: RapidMovie;
    }
  | undefined;

const extractCandidates = (payload: RapidMoviesPayload): RapidMovie[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.titles)) return payload.titles;

  const dataBlock = payload.data;

  if (Array.isArray(dataBlock)) return dataBlock;

  if (dataBlock && typeof dataBlock === "object") {
    const dataWithResults = dataBlock as { results?: RapidMovie[] };
    const dataWithTitles = dataBlock as { titles?: RapidMovie[] };

    if (Array.isArray(dataWithResults.results)) return dataWithResults.results;
    if (Array.isArray(dataWithTitles.titles)) return dataWithTitles.titles;

    return [dataBlock as RapidMovie];
  }

  if (payload.result && typeof payload.result === "object") {
    return [payload.result];
  }

  return [];
};

const buildMovies = (payload: RapidMoviesPayload): MoviesProps[] => {
  const candidates = extractCandidates(payload);

  return candidates.map((movie, index) => {
    const posterPath =
      movie?.primaryImage?.url ||
      movie?.image ||
      movie?.posterImage ||
      (movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "") ||
      FALLBACK_POSTER;

    const releaseValue =
      movie?.releaseYear?.year ??
      movie?.year ??
      movie?.release_date ??
      movie?.first_air_date;

    const releaseYear =
      typeof releaseValue === "number"
        ? releaseValue.toString()
        : typeof releaseValue === "string" && releaseValue.length >= 4
          ? releaseValue.slice(0, 4)
          : "N/A";

    return {
      id:
        movie?.id != null
          ? String(movie.id)
          : movie?.tmdb_id != null
            ? String(movie.tmdb_id)
            : movie?.imdb_id != null
              ? String(movie.imdb_id)
              : `movie-${index}`,
      primaryImage: { url: posterPath || FALLBACK_POSTER },
      titleText: {
        text:
          movie?.titleText?.text ||
          movie?.title ||
          movie?.name ||
          movie?.original_title ||
          "Unknown title",
      },
      releaseYear: { year: releaseYear },
    };
  });
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === "POST") {
    const { year, page, genre } = request.body as RequestBody;
    const rapidApiKey = process.env.MOVIE_API_KEY;

    if (!rapidApiKey) {
      return response
        .status(500)
        .json({ error: "RapidAPI key is not configured." });
    }

    const rapidApiHost = process.env.MOVIE_API_HOST || DEFAULT_RAPIDAPI_HOST;
    const rapidApiUrl = process.env.MOVIE_API_URL || DEFAULT_RAPIDAPI_URL;

    const url = new URL(rapidApiUrl);

    if (year) url.searchParams.set("year", String(year));
    if (page) url.searchParams.set("page", String(page));
    if (genre) url.searchParams.set("genre", genre);

    const resp = await fetch(url.toString(), {
      headers: {
        "x-rapidapi-host": rapidApiHost,
        "x-rapidapi-key": rapidApiKey,
      },
    });

    if (!resp.ok) {
      return response
        .status(resp.status)
        .json({ error: "Failed to fetch movies" });
    }

    const moviesResponse: RapidMoviesPayload = await resp.json();
    const movies: MoviesProps[] = buildMovies(moviesResponse);

    return response.status(200).json({
      movies,
    });
  } else {
    response.setHeader("Allow", ["POST"]);
    response.status(405).end(`Method ${request.method} Not Allowed in here`);
  }
}

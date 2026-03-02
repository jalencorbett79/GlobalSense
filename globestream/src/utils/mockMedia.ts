import { MediaItem } from "../types";
import { generateEnglishSubtitles } from "./subtitles";

/**
 * Helper — create a media item and auto-attach English subtitles.
 * Every single item in the library gets English subs no matter what.
 */
function media(m: Omit<MediaItem, "subtitles">): MediaItem {
  return {
    ...m,
    subtitles: [generateEnglishSubtitles(m.id, m.genres, m.duration)],
  };
}

export const trendingMedia: MediaItem[] = [
  media({
    id: "kr-1",
    title: "Crash Landing on You",
    description:
      "A South Korean heiress crash-lands in North Korea after a paragliding accident and falls in love with a North Korean army officer.",
    thumbnail:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=225&fit=crop",
    url: "#",
    duration: "1h 10m",
    views: "2.4M",
    rating: 9.2,
    year: 2019,
    genres: ["Romance", "Drama", "Comedy"],
    country: "KR",
    language: "ko",
    type: "series",
  }),
  media({
    id: "kr-2",
    title: "Squid Game",
    description:
      "Hundreds of cash-strapped players accept a strange invitation to compete in children's games for a tempting prize.",
    thumbnail:
      "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=225&fit=crop",
    url: "#",
    duration: "55m",
    views: "142M",
    rating: 8.0,
    year: 2021,
    genres: ["Thriller", "Drama", "Action"],
    country: "KR",
    language: "ko",
    type: "series",
  }),
  media({
    id: "jp-1",
    title: "Your Name",
    description:
      "Two teenagers share a profound, magical connection upon discovering they are swapping bodies.",
    thumbnail:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=225&fit=crop",
    url: "#",
    duration: "1h 46m",
    views: "89M",
    rating: 8.4,
    year: 2016,
    genres: ["Animation", "Romance", "Fantasy"],
    country: "JP",
    language: "ja",
    type: "movie",
  }),
  media({
    id: "in-1",
    title: "RRR",
    description:
      "A tale of two legendary revolutionaries and their journey away from home before they began fighting for India.",
    thumbnail:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=225&fit=crop",
    url: "#",
    duration: "3h 7m",
    views: "67M",
    rating: 7.8,
    year: 2022,
    genres: ["Action", "Drama", "Historical"],
    country: "IN",
    language: "hi",
    type: "movie",
  }),
  media({
    id: "es-1",
    title: "Money Heist",
    description:
      "An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history.",
    thumbnail:
      "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=225&fit=crop",
    url: "#",
    duration: "50m",
    views: "110M",
    rating: 8.3,
    year: 2017,
    genres: ["Crime", "Thriller", "Drama"],
    country: "ES",
    language: "es",
    type: "series",
  }),
  media({
    id: "de-1",
    title: "Dark",
    description:
      "A family saga with a supernatural twist, set in a small German town where the disappearance of two young children exposes the double lives and fractured relationships among four families.",
    thumbnail:
      "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400&h=225&fit=crop",
    url: "#",
    duration: "1h",
    views: "52M",
    rating: 8.8,
    year: 2017,
    genres: ["Sci-Fi", "Thriller", "Mystery"],
    country: "DE",
    language: "de",
    type: "series",
  }),
  media({
    id: "fr-1",
    title: "Lupin",
    description:
      "Inspired by the adventures of Arsène Lupin, gentleman thief Assane Diop sets out to avenge his father for an injustice inflicted by a wealthy family.",
    thumbnail:
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=225&fit=crop",
    url: "#",
    duration: "45m",
    views: "76M",
    rating: 7.5,
    year: 2021,
    genres: ["Crime", "Mystery", "Thriller"],
    country: "FR",
    language: "fr",
    type: "series",
  }),
  media({
    id: "br-1",
    title: "City of God",
    description:
      "In the slums of Rio, two kids' paths diverge as one struggles to become a photographer and the other a drug dealer.",
    thumbnail:
      "https://images.unsplash.com/photo-1518676590747-1e3dcf5a07be?w=400&h=225&fit=crop",
    url: "#",
    duration: "2h 10m",
    views: "31M",
    rating: 8.6,
    year: 2002,
    genres: ["Crime", "Drama"],
    country: "BR",
    language: "pt",
    type: "movie",
  }),
  media({
    id: "th-1",
    title: "Bad Genius",
    description:
      "A genius high school student runs a cheating scheme that spreads internationally.",
    thumbnail:
      "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=400&h=225&fit=crop",
    url: "#",
    duration: "2h 10m",
    views: "18M",
    rating: 7.7,
    year: 2017,
    genres: ["Thriller", "Drama"],
    country: "TH",
    language: "th",
    type: "movie",
  }),
  media({
    id: "tr-1",
    title: "Magnificent Century",
    description:
      "A historical fiction television series based on the life of Ottoman Sultan Suleiman the Magnificent.",
    thumbnail:
      "https://images.unsplash.com/photo-1460881680858-30d872d5b530?w=400&h=225&fit=crop",
    url: "#",
    duration: "1h 30m",
    views: "45M",
    rating: 7.2,
    year: 2011,
    genres: ["Drama", "History", "Romance"],
    country: "TR",
    language: "tr",
    type: "series",
  }),
  media({
    id: "ng-1",
    title: "The Wedding Party",
    description:
      "All hell breaks loose when guests arrive for a high-society wedding in Lagos.",
    thumbnail:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop",
    url: "#",
    duration: "1h 49m",
    views: "12M",
    rating: 6.8,
    year: 2016,
    genres: ["Comedy", "Romance"],
    country: "NG",
    language: "en",
    type: "movie",
  }),
  media({
    id: "kr-3",
    title: "Vincenzo",
    description:
      "A Korean-Italian mafia lawyer comes to Korea due to a conflict within his organization.",
    thumbnail:
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=225&fit=crop",
    url: "#",
    duration: "1h 20m",
    views: "38M",
    rating: 8.5,
    year: 2021,
    genres: ["Drama", "Comedy", "Crime"],
    country: "KR",
    language: "ko",
    type: "series",
  }),
];

export const getMediaByCountry = (countryCode: string): MediaItem[] =>
  trendingMedia.filter((m) => m.country === countryCode);

export const getMediaByRegion = (countries: string[]): MediaItem[] =>
  trendingMedia.filter((m) => countries.includes(m.country));

export const searchMedia = (query: string): MediaItem[] => {
  const q = query.toLowerCase();
  return trendingMedia.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q)) ||
      m.country.toLowerCase().includes(q)
  );
};

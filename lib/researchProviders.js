/**
 * AgentMesh — Research Providers
 * Isolated logic for fetching from various APIs:
 * NewsAPI, The Guardian, arXiv, Reddit, HackerNews, Wikipedia, CoinCap, ZenQuotes.
 */

export async function fetchNews(q, newsApiKey = '', guardianApiKey = '') {
  try {
    if (newsApiKey) {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&pageSize=5&sortBy=publishedAt&language=en&apiKey=${newsApiKey}`;
      const r = await fetch(url);
      const data = await r.json();
      if (data.status === 'ok' && data.articles?.length > 0) {
        return {
          source: 'NewsAPI',
          results: data.articles.map(a => ({
            title: a.title,
            description: a.description,
            source: a.source?.name,
            publishedAt: a.publishedAt,
            url: a.url
          }))
        };
      }
    }

    // Fallback: Guardian API
    const gKey = guardianApiKey || process.env.GUARDIAN_API_KEY;
    const gUrl = `https://content.guardianapis.com/search?q=${encodeURIComponent(q)}&show-fields=trailText&page-size=5&api-key=${gKey}`;
    const gRes = await fetch(gUrl);
    const gData = await gRes.json();
    if (gData.response?.results?.length > 0) {
      return {
        source: 'Guardian',
        results: gData.response.results.map(a => ({
          title: a.webTitle,
          description: a.fields?.trailText,
          source: 'The Guardian',
          publishedAt: a.webPublicationDate,
          url: a.webUrl
        }))
      };
    }

    // Last fallback: HackerNews
    return await fetchTech(q);
  } catch (e) {
    console.error(`[Research] News fetch error: ${e.message}`);
    return { source: 'Error', results: [], error: e.message };
  }
}

export async function fetchAcademic(q) {
  try {
    const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(q)}&start=0&max_results=5`;
    const r = await fetch(url);
    const xml = await r.text();

    const entries = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];
      const title = (/<title>([\s\S]*?)<\/title>/.exec(entry)?.[1] || '').replaceAll('\n', ' ').trim();
      const summary = (/<summary>([\s\S]*?)<\/summary>/.exec(entry)?.[1] || '').replaceAll('\n', ' ').trim().slice(0, 300);
      const authors = [];
      const authorRegex = /<author>\s*<name>([\s\S]*?)<\/name>/g;
      let aMatch;
      while ((aMatch = authorRegex.exec(entry)) !== null) authors.push(aMatch[1]);
      const id = (/<id>(http[^<]+)<\/id>/.exec(entry)?.[1] || '').trim();
      if (title) entries.push({ title, summary, authors: authors.join(', '), url: id });
    }
    return { source: 'arXiv', results: entries };
  } catch (e) {
    return { source: 'arXiv', results: [], error: e.message };
  }
}

export async function fetchSocial(q) {
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=hot&limit=5`;
    const r = await fetch(url, { headers: { 'User-Agent': 'AgentMesh/1.0 hackathon-bot' } });
    const data = await r.json();
    const posts = (data.data?.children || []).map(p => ({
      title: p.data.title,
      score: p.data.score,
      num_comments: p.data.num_comments,
      upvote_ratio: p.data.upvote_ratio,
      subreddit: p.data.subreddit,
      url: `https://reddit.com${p.data.permalink}`
    }));
    return { source: 'Reddit', results: posts };
  } catch (e) {
    return { source: 'Reddit', results: [], error: e.message };
  }
}

export async function fetchTech(q) {
  try {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&hitsPerPage=5&tags=story`;
    const r = await fetch(url);
    const data = await r.json();
    const hits = (data.hits || []).map(h => ({
      title: h.title,
      points: h.points,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`
    }));
    return { source: 'HackerNews', results: hits };
  } catch (e) {
    return { source: 'HackerNews', results: [], error: e.message };
  }
}

export async function fetchWiki(q) {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const searchResults = searchData.query?.search || [];

    const results = [];
    for (const item of searchResults.slice(0, 3)) {
      const formatted = item.title.replaceAll(/\s+/g, '_');
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(formatted)}`;
      const summaryRes = await fetch(summaryUrl, { headers: { 'User-Agent': 'AgentMesh/1.0' } });
      if (summaryRes.ok) {
        const data = await summaryRes.json();
        results.push({
          title: data.title,
          summary: data.extract,
          url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${formatted}`
        });
      }
    }
    return { source: 'Wikipedia', results };
  } catch (e) {
    return { source: 'Wikipedia', results: [], error: e.message };
  }
}

export async function fetchCrypto() {
  try {
    const url = 'https://api.coincap.io/v2/assets?limit=10';
    const r = await fetch(url);
    const data = await r.json();
    const results = (data.data || []).map(coin => ({
      name: coin.name,
      symbol: coin.symbol,
      priceUsd: `$${Number.parseFloat(coin.priceUsd).toFixed(2)}`,
      marketCapUsd: `$${(Number.parseFloat(coin.marketCapUsd) / 1e9).toFixed(2)}B`,
      volumeUsd24Hr: `$${(Number.parseFloat(coin.volumeUsd24Hr) / 1e6).toFixed(2)}M`,
      change24h: `${Number.parseFloat(coin.changePercent24Hr).toFixed(2)}%`
    }));
    return { source: 'CoinCap', results };
  } catch (e) {
    return { source: 'CoinCap', results: [], error: e.message };
  }
}

export async function fetchQuotes() {
  try {
    const url = 'https://zenquotes.io/api/random';
    const r = await fetch(url);
    const data = await r.json();
    return {
      source: 'ZenQuotes',
      results: data.map(q => ({ quote: q.q, author: q.a }))
    };
  } catch (e) {
    return { source: 'ZenQuotes', results: [], error: e.message };
  }
}

/**
 * Premium Meteo Node (Open-Meteo)
 * Resolves locations or provides global metrics
 */
export async function fetchMeteo(q) {
  try {
    // 1. Geocoding (Basic match for common cities)
    const cityMap = {
      'delhi': { lat: 28.61, lon: 77.23 },
      'new york': { lat: 40.71, lon: -74 },
      'london': { lat: 51.5, lon: -0.12 },
      'tokyo': { lat: 35.68, lon: 139.65 },
      'san francisco': { lat: 37.77, lon: -122.41 },
      'dubai': { lat: 25.2, lon: 55.27 },
      'mumbai': { lat: 19.07, lon: 72.87 },
      'paris': { lat: 48.85, lon: 2.35 }
    };

    let target = cityMap['delhi']; // Default to Delhi if no match
    for (const city in cityMap) {
      if (q.toLowerCase().includes(city)) {
        target = cityMap[city];
        break;
      }
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${target.lat}&longitude=${target.lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m`;
    const r = await fetch(url);
    const data = await r.json();

    return {
      source: 'Open-Meteo',
      results: [{
        location: q,
        latitude: target.lat,
        longitude: target.lon,
        current_temp: `${data.current_weather.temperature}°C`,
        windspeed: `${data.current_weather.windspeed} km/h`,
        weather_code: data.current_weather.weathercode,
        time: data.current_weather.time
      }]
    };
  } catch (e) {
    return { source: 'Open-Meteo', results: [], error: e.message };
  }
}

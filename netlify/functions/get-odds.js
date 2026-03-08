const API_KEY = '05d14e94c4055320a964f81d136e0d7d';
const BASE = 'https://api.the-odds-api.com/v4/sports/basketball_nba';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const params = event.queryStringParameters || {};
  const path = params.path || 'events';
  const extra = params.extra || '';

  let url;
  if (path === 'events') {
    url = `${BASE}/events?apiKey=${API_KEY}`;
  } else if (path === 'odds') {
    url = `${BASE}/odds?apiKey=${API_KEY}&markets=totals,spreads&bookmakers=draftkings&oddsFormat=american`;
  } else if (path === 'props') {
    const eventId = params.eventId;
    const bookKeys = params.bookKeys || 'draftkings';
    const mkts = 'player_points,player_rebounds,player_assists,player_threes,player_blocks,player_steals';
    url = `${BASE}/events/${eventId}/odds?apiKey=${API_KEY}&markets=${mkts}&bookmakers=${bookKeys}&oddsFormat=american`;
  } else {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown path' }) };
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    const remaining = res.headers.get('x-requests-remaining') || null;
    return {
      statusCode: 200,
      headers: { ...headers, 'x-requests-remaining': remaining || '?' },
      body: JSON.stringify(data)
    };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};

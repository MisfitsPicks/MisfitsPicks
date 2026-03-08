// Scrapes NBA.com defensive dashboard (bypasses CORS from server side)
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'max-age=3600' // cache 1 hour
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const url = 'https://stats.nba.com/stats/leaguedashteamstats?Conference=&DateFrom=&DateTo=&Division=&GameScope=&GameSegment=&LastNGames=0&LeagueID=00&Location=&MeasureType=Defense&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=2024-25&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&StarterBench=&TeamID=0&TwoWay=0&VsConference=&VsDivision=';

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://www.nba.com/',
        'Origin': 'https://www.nba.com',
        'Accept': 'application/json, text/plain, */*',
        'x-nba-stats-origin': 'stats',
        'x-nba-stats-token': 'true'
      }
    });

    if (!res.ok) {
      return { statusCode: res.status, headers, body: JSON.stringify({ error: 'NBA.com returned ' + res.status }) };
    }

    const data = await res.json();
    const rs = data.resultSets && data.resultSets[0];
    if (!rs) return { statusCode: 500, headers, body: JSON.stringify({ error: 'No resultSets' }) };

    const hdrs = rs.headers;
    const rows = rs.rowSet;
    const teamAbbr = {
      'Atlanta Hawks':'ATL','Boston Celtics':'BOS','Brooklyn Nets':'BKN',
      'Charlotte Hornets':'CHA','Chicago Bulls':'CHI','Cleveland Cavaliers':'CLE',
      'Dallas Mavericks':'DAL','Denver Nuggets':'DEN','Detroit Pistons':'DET',
      'Golden State Warriors':'GSW','Houston Rockets':'HOU','Indiana Pacers':'IND',
      'LA Clippers':'LAC','Los Angeles Lakers':'LAL','Memphis Grizzlies':'MEM',
      'Miami Heat':'MIA','Milwaukee Bucks':'MIL','Minnesota Timberwolves':'MIN',
      'New Orleans Pelicans':'NOP','New York Knicks':'NYK','Oklahoma City Thunder':'OKC',
      'Orlando Magic':'ORL','Philadelphia 76ers':'PHI','Phoenix Suns':'PHX',
      'Portland Trail Blazers':'POR','Sacramento Kings':'SAC','San Antonio Spurs':'SAS',
      'Toronto Raptors':'TOR','Utah Jazz':'UTA','Washington Wizards':'WAS'
    };

    const result = {};
    rows.forEach(row => {
      const obj = {};
      hdrs.forEach((h, i) => obj[h] = row[i]);
      const abbr = teamAbbr[obj.TEAM_NAME];
      if (abbr) {
        result[abbr] = {
          def: parseFloat(obj.DEF_RATING) || 0,
          opp3: parseFloat(obj.OPP_FG3_PCT) * 100 || 0,
          reb: parseFloat(obj.REB_PCT) * 100 || 0,
          pace: parseFloat(obj.PACE) || 0
        };
      }
    });

    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};

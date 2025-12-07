import { apiFetch } from './api';

export interface SportGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    last_update: string;
    markets: Array<{
      key: string;
      last_update: string;
      outcomes: Array<{
        name: string;
        price: number;
        point?: number;
      }>;
    }>;
  }>;
}

export type NBAGame = SportGame;
export type FootballGame = SportGame;
export type CricketGame = SportGame;

export type SportType = 'basketball_nba' | 'soccer_epl' | 'soccer_uefa_champs_league' | 'cricket_international_t20' | 'cricket_odi';

// Service for fetching sports odds from The Odds API for NBA, Football, and Cricket
class SportsOddsService {
  private baseURL = 'https://api.the-odds-api.com/v4';
  private apiKey = import.meta.env.VITE_ODDS_API_KEY || 'YOUR_ODDS_API_KEY_HERE';

  // Mapping of sport keys to display names for UI rendering
  private sportConfigs = {
    basketball_nba: {
      name: 'NBA',
      displayName: 'NBA Basketball'
    },
    soccer_epl: {
      name: 'EPL',
      displayName: 'English Premier League'
    },
    soccer_uefa_champs_league: {
      name: 'UCL',
      displayName: 'UEFA Champions League'
    },
    cricket_international_t20: {
      name: 'T20',
      displayName: 'International T20 Cricket'
    },
    cricket_odi: {
      name: 'ODI',
      displayName: 'One Day International Cricket'
    }
  };

  async getGames(sportKey: SportType, limit?: number): Promise<SportGame[]> {
    try {
      const response = await fetch(`${this.baseURL}/sports/${sportKey}/odds?regions=us&markets=h2h,spreads,totals&apiKey=${this.apiKey}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${this.sportConfigs[sportKey].displayName} odds`);
      }

      const data = await response.json();
      return limit ? data.slice(0, limit) : data || [];
    } catch (error) {
      console.error(`Error fetching ${sportKey} odds:`, error);
      return [];
    }
  }

  async getTodaysGames(sportKey: SportType = 'basketball_nba'): Promise<SportGame[]> {
    return this.getGames(sportKey);
  }

  async getUpcomingGames(sportKey: SportType = 'basketball_nba', limit = 10): Promise<SportGame[]> {
    return this.getGames(sportKey, limit);
  }

  async getGamesByDate(sportKey: SportType, date: string): Promise<SportGame[]> {
    try {
      const response = await fetch(`${this.baseURL}/sports/${sportKey}/odds?regions=us&markets=h2h,spreads,totals&apiKey=${this.apiKey}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${this.sportConfigs[sportKey].displayName} odds for date`);
      }

      const data = await response.json();
      const targetDate = new Date(date).toDateString();
      return data ? data.filter((game: SportGame) =>
        new Date(game.commence_time).toDateString() === targetDate
      ) : [];
    } catch (error) {
      console.error(`Error fetching ${sportKey} odds by date:`, error);
      return [];
    }
  }

  async getTodaysNBAGames(): Promise<NBAGame[]> {
    return this.getTodaysGames('basketball_nba') as Promise<NBAGame[]>;
  }

  async getUpcomingNBAGames(limit = 10): Promise<NBAGame[]> {
    return this.getUpcomingGames('basketball_nba', limit) as Promise<NBAGame[]>;
  }

  async getTodaysFootballGames(league: 'epl' | 'champions_league' = 'epl'): Promise<FootballGame[]> {
    const sportKey = league === 'epl' ? 'soccer_epl' : 'soccer_uefa_champs_league';
    return this.getTodaysGames(sportKey) as Promise<FootballGame[]>;
  }

  async getUpcomingFootballGames(league: 'epl' | 'champions_league' = 'epl', limit = 10): Promise<FootballGame[]> {
    const sportKey = league === 'epl' ? 'soccer_epl' : 'soccer_uefa_champs_league';
    return this.getUpcomingGames(sportKey, limit) as Promise<FootballGame[]>;
  }

  async getTodaysCricketGames(format: 't20' | 'odi' = 't20'): Promise<CricketGame[]> {
    const sportKey = format === 't20' ? 'cricket_international_t20' : 'cricket_odi';
    return this.getTodaysGames(sportKey) as Promise<CricketGame[]>;
  }

  async getUpcomingCricketGames(format: 't20' | 'odi' = 't20', limit = 10): Promise<CricketGame[]> {
    const sportKey = format === 't20' ? 'cricket_international_t20' : 'cricket_odi';
    return this.getUpcomingGames(sportKey, limit) as Promise<CricketGame[]>;
  }

  getSportConfig(sportKey: SportType) {
    return this.sportConfigs[sportKey];
  }

  getAvailableSports(): Array<{key: SportType, name: string, displayName: string}> {
    return Object.entries(this.sportConfigs).map(([key, config]) => ({
      key: key as SportType,
      name: config.name,
      displayName: config.displayName
    }));
  }

  formatOddsDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  formatOddsTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  getOddsUpdateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  formatOddsValue(decimalOdds: number): string {
    if (decimalOdds >= 2.0) {
      const americanOdds = Math.round((decimalOdds - 1) * 100);
      return `+${americanOdds}`;
    } 
      const americanOdds = Math.round(-100 / (decimalOdds - 1));
      return americanOdds.toString();
    
  }

  formatTeamName(teamName: string): string {
    const abbreviations: { [key: string]: string } = {
      'Philadelphia 76ers': 'PHI',
      'Washington Wizards': 'WAS',
      'Los Angeles Lakers': 'LAL',
      'Golden State Warriors': 'GSW',
      'Boston Celtics': 'BOS',
      'Milwaukee Bucks': 'MIL',
      'Denver Nuggets': 'DEN',
      'Phoenix Suns': 'PHX',
      'Dallas Mavericks': 'DAL',
      'Miami Heat': 'MIA',
      'Atlanta Hawks': 'ATL',
      'New York Knicks': 'NYK',
      'Brooklyn Nets': 'BKN',
      'Toronto Raptors': 'TOR',
      'Chicago Bulls': 'CHI',
      'Cleveland Cavaliers': 'CLE',
      'Indiana Pacers': 'IND',
      'Detroit Pistons': 'DET',
      'Orlando Magic': 'ORL',
      'Charlotte Hornets': 'CHA',
      'San Antonio Spurs': 'SAS',
      'New Orleans Pelicans': 'NOP',
      'Sacramento Kings': 'SAC',
      'Portland Trail Blazers': 'POR',
      'Oklahoma City Thunder': 'OKC',
      'Utah Jazz': 'UTA',
      'Memphis Grizzlies': 'MEM',
      'Houston Rockets': 'HOU',
      'Minnesota Timberwolves': 'MIN'
    };

    return abbreviations[teamName] || teamName.split(' ').pop() || teamName;
  }

  getBestOdds(game: SportGame, marketKey: string) {
    const bestOdds: { [key: string]: { price: number; name: string; bookmaker: string; point?: number } } = {};

    game.bookmakers.forEach(bookmaker => {
      const market = bookmaker.markets.find(m => m.key === marketKey);
      if (market) {
        market.outcomes.forEach(outcome => {
          const key = outcome.name;
          if (!bestOdds[key] || outcome.price > bestOdds[key].price) {
            bestOdds[key] = {
              price: outcome.price,
              name: outcome.name,
              bookmaker: bookmaker.title,
              point: outcome.point
            };
          }
        });
      }
    });

    return bestOdds;
  }
}

export const nbaService = new SportsOddsService();
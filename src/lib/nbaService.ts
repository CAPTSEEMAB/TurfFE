import { apiFetch } from './api';

export interface NBAGame {
  id: number;
  date: string;
  home_team: {
    id: number;
    name: string;
    city: string;
    conference: string;
  };
  visitor_team: {
    id: number;
    name: string;
    city: string;
    conference: string;
  };
  home_team_score?: number;
  visitor_team_score?: number;
  status: string;
  period?: number;
  time?: string;
}

export interface NBATeam {
  id: number;
  name: string;
  city: string;
  conference: string;
  division: string;
}

class NBAService {
  private baseURL = 'https://www.balldontlie.io/api/v1';

  async getTodaysGames(): Promise<NBAGame[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${this.baseURL}/games?dates[]=${today}&per_page=50`);

      if (!response.ok) {
        throw new Error('Failed to fetch NBA games');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching NBA games:', error);
      return [];
    }
  }

  async getUpcomingGames(limit: number = 10): Promise<NBAGame[]> {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 7); // Next 7 days

      const startDate = today.toISOString().split('T')[0];
      const endDate = futureDate.toISOString().split('T')[0];

      const response = await fetch(`${this.baseURL}/games?start_date=${startDate}&end_date=${endDate}&per_page=${limit}`);

      if (!response.ok) {
        throw new Error('Failed to fetch upcoming NBA games');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching upcoming NBA games:', error);
      return [];
    }
  }

  async getGamesByDate(date: string): Promise<NBAGame[]> {
    try {
      const response = await fetch(`${this.baseURL}/games?dates[]=${date}&per_page=50`);

      if (!response.ok) {
        throw new Error('Failed to fetch NBA games for date');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching NBA games by date:', error);
      return [];
    }
  }

  async getTeamGames(teamId: number, season: number = 2024): Promise<NBAGame[]> {
    try {
      const response = await fetch(`${this.baseURL}/games?team_ids[]=${teamId}&seasons[]=${season}&per_page=50`);

      if (!response.ok) {
        throw new Error('Failed to fetch team games');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching team games:', error);
      return [];
    }
  }

  formatGameTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  formatGameDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  getGameStatus(game: NBAGame): string {
    if (game.status === 'Final') {
      return 'Final';
    }
    if (game.period && game.period > 0) {
      return `Q${game.period} ${game.time || ''}`;
    }
    return this.formatGameTime(game.date);
  }
}

export const nbaService = new NBAService();
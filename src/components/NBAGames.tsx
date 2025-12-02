import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { nbaService, NBAGame } from '@/lib/nbaService';

interface NBAGamesProps {
  type?: 'today' | 'upcoming';
  limit?: number;
  showHeader?: boolean;
}

export const NBAGames: React.FC<NBAGamesProps> = ({
  type = 'today',
  limit = 10,
  showHeader = true
}) => {
  const [games, setGames] = useState<NBAGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);

        let fetchedGames: NBAGame[];
        if (type === 'today') {
          fetchedGames = await nbaService.getTodaysGames();
        } else {
          fetchedGames = await nbaService.getUpcomingGames(limit);
        }

        setGames(fetchedGames);
      } catch (err) {
        setError('Failed to load NBA games');
        console.error('Error fetching NBA games:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [type, limit]);

  const getStatusColor = (game: NBAGame) => {
    if (game.status === 'Final') return 'bg-red-500';
    if (game.period && game.period > 0) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getStatusText = (game: NBAGame) => {
    if (game.status === 'Final') return 'Final';
    if (game.period && game.period > 0) return `Q${game.period}`;
    return nbaService.formatGameTime(game.date);
  };

  if (loading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>NBA Games</CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>NBA Games</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-red-500 text-center py-4">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (games.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>NBA Games</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            No {type === 'today' ? "games today" : "upcoming games"} found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle>
            {type === 'today' ? "Today's NBA Games" : 'Upcoming NBA Games'}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {games.map((game) => (
          <div
            key={game.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium">
                  {game.visitor_team.city} {game.visitor_team.name}
                </div>
                <div className="text-gray-400">vs</div>
                <div className="text-sm font-medium">
                  {game.home_team.city} {game.home_team.name}
                </div>
              </div>

              {game.home_team_score !== undefined && game.visitor_team_score !== undefined ? (
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span>{game.visitor_team_score}</span>
                  <span className="text-gray-400">-</span>
                  <span>{game.home_team_score}</span>
                </div>
              ) : (
                <div className="text-xs text-gray-500 mt-1">
                  {nbaService.formatGameDate(game.date)}
                </div>
              )}
            </div>

            <Badge
              variant="secondary"
              className={`${getStatusColor(game)} text-white`}
            >
              {getStatusText(game)}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
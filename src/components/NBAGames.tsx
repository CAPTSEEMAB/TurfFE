import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { nbaService, SportGame, SportType } from '@/lib/nbaService';
import { ChevronDown, ChevronUp, Trophy, Target, DollarSign } from 'lucide-react';

interface NBAGamesProps {
  sport?: SportType;
  type?: 'today' | 'upcoming';
  limit?: number;
  showHeader?: boolean;
}

export const NBAGames: React.FC<NBAGamesProps> = ({
  sport = 'basketball_nba',
  type = 'today',
  limit = 10,
  showHeader = true
}) => {
  const [games, setGames] = useState<SportGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);

        let fetchedGames: SportGame[];
        if (type === 'today') {
          fetchedGames = await nbaService.getTodaysGames(sport);
        } else {
          fetchedGames = await nbaService.getUpcomingGames(sport, limit);
        }

        setGames(fetchedGames);
      } catch (err) {
        setError(`Failed to load ${nbaService.getSportConfig(sport).displayName} odds`);
        console.error('Error fetching sports odds:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [sport, type, limit]);

  const toggleExpanded = (gameId: string) => {
    setExpandedGame(expandedGame === gameId ? null : gameId);
  };

  const getBestOdds = (game: SportGame, marketKey: string) => {
    const bestOdds: { [key: string]: any } = {};

    game.bookmakers.forEach(bookmaker => {
      const market = bookmaker.markets.find(m => m.key === marketKey);
      if (market) {
        market.outcomes.forEach(outcome => {
          const key = outcome.name;
          if (!bestOdds[key] || outcome.price > bestOdds[key].price) {
            bestOdds[key] = {
              price: outcome.price,
              bookmaker: bookmaker.title,
              point: outcome.point
            };
          }
        });
      }
    });

    return bestOdds;
  };

  const sportConfig = nbaService.getSportConfig(sport);

  if (loading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle>{sportConfig.displayName} Betting Odds</CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
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
            <CardTitle>{sportConfig.displayName} Betting Odds</CardTitle>
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
            <CardTitle>{sportConfig.displayName} Betting Odds</CardTitle>
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
          <CardTitle>{sportConfig.displayName} Betting Odds</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {games.map((game) => {
          const h2hOdds = getBestOdds(game, 'h2h');
          const spreadsOdds = getBestOdds(game, 'spreads');
          const totalsOdds = getBestOdds(game, 'totals');
          const isExpanded = expandedGame === game.id;

          return (
            <div key={game.id} className="border rounded-lg overflow-hidden">
              {/* Compact Card View */}
              <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold">
                      {nbaService.formatTeamName(game.away_team)} vs {nbaService.formatTeamName(game.home_team)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {nbaService.formatOddsDate(game.commence_time)}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(game.id)}
                    className="p-1"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Main Odds Display */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Moneyline */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Trophy className="h-3 w-3 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">Moneyline</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-primary">
                        {nbaService.formatTeamName(game.away_team)} {h2hOdds[game.away_team] ? nbaService.formatOddsValue(h2hOdds[game.away_team].price) : 'N/A'}
                      </div>
                      <div className="text-sm font-bold text-primary">
                        {nbaService.formatTeamName(game.home_team)} {h2hOdds[game.home_team] ? nbaService.formatOddsValue(h2hOdds[game.home_team].price) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Spread */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Target className="h-3 w-3 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">Spread</span>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(spreadsOdds).map(([team, odds]) => (
                        <div key={team} className="text-sm font-bold text-primary">
                          {nbaService.formatTeamName(team)} {odds.point > 0 ? '+' : ''}{odds.point?.toFixed(1)} ({nbaService.formatOddsValue(odds.price)})
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="h-3 w-3 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">Total</span>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(totalsOdds).map(([type, odds]) => (
                        <div key={type} className="text-sm font-bold text-primary">
                          {type} {odds.point?.toFixed(1)} ({nbaService.formatOddsValue(odds.price)})
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground text-center mt-2">
                  {nbaService.formatOddsTime(game.commence_time)} • Best odds shown
                </div>
              </div>

              {/* Expanded Detailed View */}
              {isExpanded && (
                <div className="p-4 bg-background border-t border-primary/20">
                  <div className="space-y-4">
                    {/* Odds Comparison Table */}
                    <div>
                      <h4 className="font-medium mb-3 text-primary">Odds by Bookmaker</h4>
                      <div className="overflow-x-auto bg-background rounded border border-primary/30">
                        <table className="w-full text-xs">
                          <thead className="bg-primary/10 border-b border-primary/20">
                            <tr>
                              <th className="text-left py-2 px-2 font-semibold text-primary">Book</th>
                              <th className="text-center py-2 px-2 font-semibold text-primary">Moneyline</th>
                              <th className="text-center py-2 px-2 font-semibold text-primary">Spread</th>
                              <th className="text-center py-2 px-2 font-semibold text-primary">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {game.bookmakers.slice(0, 5).map((bookmaker) => {
                              const h2h = bookmaker.markets.find(m => m.key === 'h2h');
                              const spreads = bookmaker.markets.find(m => m.key === 'spreads');
                              const totals = bookmaker.markets.find(m => m.key === 'totals');

                              return (
                                <tr key={bookmaker.key} className="border-b border-primary/20 hover:bg-primary/10">
                                  <td className="py-2 px-2 font-medium text-primary">{bookmaker.title}</td>
                                  <td className="text-center py-2 px-2 text-foreground">
                                    {h2h ? h2h.outcomes.map(o => `${nbaService.formatTeamName(o.name)} ${nbaService.formatOddsValue(o.price)}`).join(' / ') : '-'}
                                  </td>
                                  <td className="text-center py-2 px-2 text-foreground">
                                    {spreads ? spreads.outcomes.map(o => `${nbaService.formatTeamName(o.name)} ${o.point > 0 ? '+' : ''}${o.point?.toFixed(1)} (${nbaService.formatOddsValue(o.price)})`).join(' / ') : '-'}
                                  </td>
                                  <td className="text-center py-2 px-2 text-foreground">
                                    {totals ? totals.outcomes.map(o => `${o.name} ${o.point?.toFixed(1)} (${nbaService.formatOddsValue(o.price)})`).join(' / ') : '-'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Quick Bet Buttons */}
                    <div>
                      <h4 className="font-medium mb-3 text-primary">Quick Bet</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(spreadsOdds).map(([team, odds]) => (
                          <Button key={team} variant="default" size="sm" className="text-xs bg-primary hover:bg-primary/90">
                            {nbaService.formatTeamName(team)} {odds.point > 0 ? '+' : ''}{odds.point?.toFixed(1)} ({nbaService.formatOddsValue(odds.price)})
                          </Button>
                        ))}
                        {Object.entries(totalsOdds).map(([type, odds]) => (
                          <Button key={type} variant="outline" size="sm" className="text-xs">
                            {type} {odds.point?.toFixed(1)} ({nbaService.formatOddsValue(odds.price)})
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
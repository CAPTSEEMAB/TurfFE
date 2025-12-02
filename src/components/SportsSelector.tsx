import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { nbaService, SportType } from '@/lib/nbaService';
import { NBAGames } from './NBAGames';

interface SportsSelectorProps {
  defaultSport?: SportType;
}

export const SportsSelector: React.FC<SportsSelectorProps> = ({
  defaultSport = 'basketball_nba'
}) => {
  const [selectedSport, setSelectedSport] = React.useState<SportType>(defaultSport);
  const availableSports = nbaService.getAvailableSports();

  return (
    <div className="space-y-6">
      {/* Sports Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Sports Betting Odds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableSports.map((sport) => (
              <Button
                key={sport.key}
                variant={selectedSport === sport.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSport(sport.key)}
                className="flex items-center gap-2"
              >
                <span>{sport.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {sport.displayName}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Sport Games */}
      <NBAGames sport={selectedSport} />
    </div>
  );
};
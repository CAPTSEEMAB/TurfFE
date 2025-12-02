import { Performance, Player, PlayerFormData } from '@/types';

/**
 * Calculate average stats from performances
 */
export const calculateAverageStats = (performances: Performance[] = []) => {
  if (!performances.length) {
    return { avgPoints: '0', avgAssists: '0', avgRebounds: '0', avgScore: '0' };
  }
  
  const sum = performances.reduce(
    (acc, p) => ({
      points: acc.points + p.points,
      assists: acc.assists + p.assists,
      rebounds: acc.rebounds + p.rebounds,
      score: acc.score + p.overall_score,
    }),
    { points: 0, assists: 0, rebounds: 0, score: 0 }
  );
  
  const count = performances.length;
  
  return {
    avgPoints: (sum.points / count).toFixed(1),
    avgAssists: (sum.assists / count).toFixed(1),
    avgRebounds: (sum.rebounds / count).toFixed(1),
    avgScore: (sum.score / count).toFixed(1),
  };
};

/**
 * Export data as JSON file download
 */
export const exportToJson = (data: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export data as CSV file download
 */
export const exportToCsv = (data: Record<string, unknown>[], filename: string) => {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
        return `"${stringValue.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ];
  
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Format player data for export with calculated stats
 */
export const formatPlayerExport = (player: Player) => {
  const stats = calculateAverageStats(player.performances);
  return {
    ...player,
    average_stats: stats,
  };
};

/**
 * Format multiple players for export
 */
export const formatPlayersExport = (players: Player[]) => ({
  export_date: new Date().toISOString(),
  total_players: players.length,
  players: players.map(formatPlayerExport),
});

/**
 * Convert player form data to API payload
 */
export const playerFormToPayload = (formData: PlayerFormData, isNew = true) => ({
  name: formData.name,
  position: formData.position,
  age: parseInt(formData.age),
  height_cm: parseInt(formData.height_cm),
  weight_kg: parseInt(formData.weight_kg),
  nationality: formData.nationality,
  image_url: formData.image_url || undefined,
  notes: formData.notes || undefined,
  ...(isNew && { is_active: true }),
});

/**
 * Convert player data to form data
 */
export const playerToFormData = (player: Player) => ({
  name: player.name,
  position: player.position,
  age: player.age.toString(),
  height_cm: player.height_cm.toString(),
  weight_kg: player.weight_kg.toString(),
  nationality: player.nationality,
  image_url: player.image_url || '',
  notes: player.notes || '',
});

/**
 * Initial empty player form data
 */
export const emptyPlayerForm = {
  name: '',
  position: '',
  age: '',
  height_cm: '',
  weight_kg: '',
  nationality: '',
  image_url: '',
  notes: '',
};

/**
 * Format operating hours display
 */
export const formatOperatingHours = (openTime?: string, closeTime?: string) => {
  if (!openTime || !closeTime) return 'N/A';
  return `${openTime} - ${closeTime}`;
};

/**
 * Generate Google Maps URL
 */
export const getGoogleMapsUrl = (lat: number, lng: number) => 
  `https://www.google.com/maps?q=${lat},${lng}`;

/**
 * Generate Google Maps directions URL
 */
export const getDirectionsUrl = (lat: number, lng: number) => 
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

/**
 * Generate OpenStreetMap embed URL
 */
export const getOsmEmbedUrl = (lat: number, lng: number, delta = 0.01) => 
  `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}&layer=mapnik&marker=${lat}%2C${lng}`;

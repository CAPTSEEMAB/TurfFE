import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useFetch, useSearch, useMutation } from '@/hooks/useApi';
import { Player, PlayerFormData } from '@/types';
import { API_ENDPOINTS } from '@/lib/api';
import { 
  emptyPlayerForm, 
  playerFormToPayload, 
  playerToFormData,
  formatPlayersExport,
  exportToJson 
} from '@/lib/utils/helpers';
import PlayerCard from '@/components/PlayerCard';
import { DynamicForm, PLAYER_FORM_FIELDS } from '@/components/forms/DynamicForm';
import { 
  PageLayout, 
  PageHeader, 
  SearchBar, 
  LoadingState, 
  ErrorState, 
  EmptyState,
  ResultCount 
} from '@/components/common/PageComponents';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UserPlus, Download, GitCompare } from 'lucide-react';
import { toast } from 'sonner';

// Page for viewing, searching, creating, editing, and deleting NBA players
const AllPlayers = () => {
  const { data: players, loading, error, refetch } = useFetch<Player[]>(API_ENDPOINTS.PLAYERS);
  const { query, setQuery, filtered } = useSearch(players || [], ['name', 'position', 'nationality']);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const [newPlayer, setNewPlayer] = useState<PlayerFormData>(emptyPlayerForm);
  const [editPlayer, setEditPlayer] = useState<PlayerFormData>(emptyPlayerForm);

  const handleFormChange = useCallback((setter: React.Dispatch<React.SetStateAction<PlayerFormData>>) => 
    (name: string, value: string) => {
      setter(prev => ({ ...prev, [name]: value }));
    }, 
  []);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = playerFormToPayload(newPlayer, true);
    
    const res = await fetch(`${API_ENDPOINTS.PLAYERS}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    if (data.success) {
      toast.success('Player added successfully!');
      setDialogOpen(false);
      setNewPlayer(emptyPlayerForm);
      refetch();
    } else {
      toast.error(data.message || 'Failed to add player');
    }
  };

  const handleEditPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;

    const payload = playerFormToPayload(editPlayer, false);
    
    const res = await fetch(`${API_ENDPOINTS.PLAYERS}/${selectedPlayer.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    if (data.success) {
      toast.success('Player updated successfully!');
      setEditDialogOpen(false);
      setSelectedPlayer(null);
      refetch();
    } else {
      toast.error(data.message || 'Failed to update player');
    }
  };

  const handleDeletePlayer = async () => {
    if (!selectedPlayer) return;

    const res = await fetch(`${API_ENDPOINTS.PLAYERS}/${selectedPlayer.id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await res.json();
    if (data.success) {
      toast.success('Player deleted successfully!');
      setDeleteDialogOpen(false);
      setSelectedPlayer(null);
      refetch();
    } else {
      toast.error(data.message || 'Failed to delete player');
    }
  };

  const openEditDialog = useCallback((player: Player) => {
    setSelectedPlayer(player);
    setEditPlayer(playerToFormData(player));
    setEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((player: Player) => {
    setSelectedPlayer(player);
    setDeleteDialogOpen(true);
  }, []);

  const exportPlayersData = useCallback(() => {
    if (!players) return;
    exportToJson(formatPlayersExport(players), 'players-export');
    toast.success('Players data exported successfully!');
  }, [players]);

  const headerActions = (
    <>
      <Link to="/compare-players">
        <Button variant="outline" className="glass border-primary/50 hover:bg-primary/10">
          <GitCompare className="mr-2 h-5 w-5" />
          Compare Players
        </Button>
      </Link>
      <Button onClick={exportPlayersData} variant="outline" className="glass border-primary/50 hover:bg-primary/10">
        <Download className="mr-2 h-5 w-5" />
        Export Data
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="gradient-primary shadow-glow transition-spring hover:scale-105">
            <UserPlus className="mr-2 h-5 w-5" />
            Add New Player
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPlayer} className="space-y-4">
            <DynamicForm
              fields={PLAYER_FORM_FIELDS}
              values={newPlayer}
              onChange={handleFormChange(setNewPlayer)}
            />
            <Button type="submit" className="w-full gradient-primary">
              Add Player
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 animate-fade-in-up">
          <PageHeader
            title="All Players"
            subtitle="Browse and manage player profiles and performances"
            actions={headerActions}
          />

          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search by name, position, or nationality..."
          />
        </div>

        {loading ? (
          <LoadingState message="Loading players..." />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <>
            <ResultCount filtered={filtered.length} total={players?.length || 0} itemName="players" />
            
            {filtered.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((player, index) => (
                  <div
                    key={player.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <PlayerCard 
                      {...player} 
                      onEdit={() => openEditDialog(player)}
                      onDelete={() => openDeleteDialog(player)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No players found matching your search." />
            )}
          </>
        )}
      </div>

      {/* Edit Player Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditPlayer} className="space-y-4">
            <DynamicForm
              fields={PLAYER_FORM_FIELDS}
              values={editPlayer}
              onChange={handleFormChange(setEditPlayer)}
              idPrefix="edit-"
            />
            <Button type="submit" className="w-full gradient-primary">
              Update Player
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedPlayer?.name} and all their performance data. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePlayer} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default AllPlayers;

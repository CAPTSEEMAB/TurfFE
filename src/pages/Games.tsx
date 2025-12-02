import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { SportsSelector } from '@/components/SportsSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Trophy, Clock } from 'lucide-react';

const Games = () => {
  const [activeTab, setActiveTab] = useState('today');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 gradient-mesh opacity-40 animate-pulse" />

        <div className="relative container mx-auto px-4">
          <div className="text-center animate-fade-in-up">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                <Trophy className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mb-6 text-5xl font-display font-bold md:text-6xl text-gradient drop-shadow-2xl">
              Sports Betting Odds
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg md:text-xl drop-shadow-lg font-medium animate-fade-in text-muted-foreground">
              Live betting odds from top sportsbooks for NBA, Football, Cricket and more
            </p>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-16 relative">
        <div className="absolute inset-0 gradient-mesh opacity-10" />

        <div className="container mx-auto px-4 relative z-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 glass border-primary/20">
              <TabsTrigger value="today" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Today's Odds
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming Odds
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-8">
              <div className="animate-fade-in-up">
                <h2 className="text-3xl font-display font-bold text-gradient mb-4">
                  🤑 Today's Betting Odds
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Live betting odds for today's games from multiple sportsbooks
                </p>
                <SportsSelector />
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-8">
              <div className="animate-fade-in-up">
                <h2 className="text-3xl font-display font-bold text-gradient mb-4">
                  📈 Upcoming Game Odds
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Betting odds for upcoming games across all sports
                </p>
                <SportsSelector />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative border-t border-primary/20 py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-20" />
        <div className="absolute inset-0 gradient-mesh opacity-30" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="glass-strong p-12 rounded-3xl max-w-4xl mx-auto shadow-neon animate-fade-in-up">
            <h2 className="mb-6 text-4xl font-display font-bold text-gradient">
              🏆 Never Miss Great Odds
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
              Stay updated with live betting odds from top sportsbooks across NBA, Football, Cricket and more.
              Make informed betting decisions.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                className="gradient-primary shadow-glow text-lg px-10 py-6 h-auto font-accent transition-spring hover:scale-110"
                onClick={() => setActiveTab('today')}
              >
                Today's Odds
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="glass border-primary/50 hover:bg-primary/10 text-lg px-10 py-6 h-auto font-accent transition-spring hover:scale-110"
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming Odds
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Games;
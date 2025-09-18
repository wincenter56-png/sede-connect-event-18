import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChurchHeader from "@/components/ChurchHeader";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, DollarSign, ArrowRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EventConfig {
  id: string;
  event_name?: string;
  event_date: string | null;
  event_value: number | null;
  payment_info: string | null;
  banner_url: string | null;
  created_at: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('event_config')
        .select('*')
        .order('event_date', { ascending: true });

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-holy flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celestial mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <ChurchHeader />
      
      <main className="container mx-auto px-4 py-6 sm:py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Hero Section */}
          <section className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-tech bg-clip-text text-transparent">
              Eventos Disponíveis
            </h1>
            <div className="w-32 h-1 bg-gradient-neon mx-auto rounded-full shadow-neon mb-8"></div>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Escolha um dos nossos eventos e faça sua inscrição. Cada evento é uma oportunidade única de crescimento espiritual e comunhão.
            </p>
          </section>

          {/* Events Grid */}
          {events.length > 0 ? (
            <section className="mb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                  <Card 
                    key={event.id} 
                    className="group overflow-hidden border-0 bg-gradient-card backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    {event.banner_url && (
                      <div className="relative overflow-hidden h-48">
                        <img
                          src={event.banner_url}
                          alt={event.event_name || "Banner do evento"}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                    )}
                    
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold text-foreground line-clamp-2 min-h-[3.5rem]">
                        {event.event_name || "Evento da Igreja"}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Clique para ver mais detalhes e se inscrever
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Event Date */}
                      {event.event_date && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="w-10 h-10 bg-celestial rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-sm">
                              {new Date(event.event_date).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {new Date(event.event_date).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Event Value */}
                      {event.event_value && (
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="w-10 h-10 bg-divine rounded-lg flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-celestial">
                              R$ {event.event_value.toFixed(2).replace('.', ',')}
                            </p>
                            <p className="text-muted-foreground text-xs">Investimento</p>
                          </div>
                        </div>
                      )}
                      
                      <Button
                        onClick={() => navigate(`/evento/${event.id}`)}
                        className="w-full bg-gradient-to-r from-celestial to-divine hover:from-celestial/80 hover:to-divine/80 text-white font-semibold py-3 rounded-xl transition-all duration-300 group/button"
                      >
                        Ver Detalhes e Inscrever-se
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/button:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ) : (
            <section className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-celestial to-divine rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Nenhum evento disponível
                </h3>
                <p className="text-muted-foreground mb-8">
                  No momento não há eventos programados. Fique atento às nossas redes sociais para novos eventos!
                </p>
              </div>
            </section>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
            <div className="group relative p-6 bg-gradient-card backdrop-blur-xl rounded-3xl border border-white/20 hover:border-white/30 transition-all duration-300 hover-scale">
              <div className="absolute inset-0 bg-gradient-tech opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300"></div>
              <div className="w-16 h-16 bg-gradient-tech rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-tech">
                <span className="text-3xl">🙏</span>
              </div>
              <h3 className="text-lg font-bold mb-3 bg-gradient-tech bg-clip-text text-transparent">Propósito</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Crescimento espiritual e fortalecimento da fé em comunidade
              </p>
            </div>

            <div className="group relative p-6 bg-gradient-card backdrop-blur-xl rounded-3xl border border-white/20 hover:border-white/30 transition-all duration-300 hover-scale">
              <div className="absolute inset-0 bg-gradient-neon opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300"></div>
              <div className="w-16 h-16 bg-gradient-neon rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-tech">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-lg font-bold mb-3 bg-gradient-neon bg-clip-text text-transparent">Comunhão</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Momentos de fellowship e conexão com outros irmãos na fé
              </p>
            </div>

            <div className="group relative p-6 bg-gradient-card backdrop-blur-xl rounded-3xl border border-white/20 hover:border-white/30 transition-all duration-300 hover-scale sm:col-span-2 md:col-span-1">
              <div className="absolute inset-0 bg-gradient-celestial opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300"></div>
              <div className="w-16 h-16 bg-gradient-celestial rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-tech">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-lg font-bold mb-3 bg-gradient-celestial bg-clip-text text-transparent">Renovação</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Uma oportunidade de renovar seu compromisso com Deus
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
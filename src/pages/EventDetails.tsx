import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChurchHeader from "@/components/ChurchHeader";
import RegistrationForm from "@/components/RegistrationForm";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, DollarSign, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface EventConfig {
  id: string;
  event_name?: string;
  event_date: string | null;
  event_value: number | null;
  payment_info: string | null;
  banner_url: string | null;
}

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      loadEventConfig();
    } else {
      navigate("/");
    }
  }, [eventId, navigate]);

  const loadEventConfig = async () => {
    if (!eventId) return;
    
    try {
      const { data, error } = await supabase
        .from('event_config')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        toast({
          title: "Evento não encontrado",
          description: "O evento solicitado não foi encontrado.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setEventConfig(data);
    } catch (error) {
      console.error('Error loading event config:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar informações do evento.",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-holy flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celestial mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando evento...</p>
        </div>
      </div>
    );
  }

  if (!eventConfig) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <ChurchHeader />
      
      <main className="container mx-auto px-4 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar aos Eventos
            </Button>
          </div>

          {/* Event Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {eventConfig.event_name || "Evento da Igreja"}
            </h1>
            <div className="w-32 h-1 bg-gradient-neon mx-auto rounded-full shadow-neon"></div>
          </div>

          {/* Event Banner */}
          {eventConfig.banner_url && (
            <div className="mb-8 text-center">
              <img
                src={eventConfig.banner_url}
                alt={eventConfig.event_name || "Banner do evento"}
                className="w-full max-w-2xl mx-auto rounded-2xl shadow-xl border border-border/20"
              />
            </div>
          )}

          {/* Event Information */}
          <section className="mb-12">
            <div className="bg-card/50 sm:bg-card/80 sm:backdrop-blur-sm rounded-lg sm:rounded-2xl p-4 sm:p-8 border-0 sm:border sm:border-border/30 sm:shadow-lg">
              
              <div className="text-center mb-8">
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  Informações do Evento
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-celestial to-divine mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-6 sm:grid sm:grid-cols-1 min-[480px]:grid-cols-2 sm:gap-6 sm:space-y-0">
                {eventConfig.event_date && (
                  <div className="p-6 bg-muted/30 rounded-xl border border-border/20 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-celestial rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Data & Hora</h3>
                        <p className="text-sm text-muted-foreground">Quando acontece</p>
                      </div>
                    </div>
                    <p className="font-semibold text-lg text-foreground">
                      {new Date(eventConfig.event_date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
                
                {eventConfig.event_value && (
                  <div className="p-6 bg-muted/30 rounded-xl border border-border/20 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-divine rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Investimento</h3>
                        <p className="text-sm text-muted-foreground">Valor da inscrição</p>
                      </div>
                    </div>
                    <p className="font-bold text-2xl text-celestial">
                      R$ {eventConfig.event_value.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Methods Section */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-center text-foreground mb-6">
                  Formas de Pagamento
                </h3>
                <div className="space-y-4 sm:grid sm:grid-cols-1 lg:grid-cols-2 sm:gap-6 sm:space-y-0">
                  {/* PIX Payment */}
                  {eventConfig.payment_info && (
                    <div className="p-6 bg-gradient-card backdrop-blur-sm rounded-2xl border border-white/10 hover:border-green-400/30 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center">
                          <span className="text-2xl">💳</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-foreground">PIX</h4>
                          <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                        </div>
                      </div>
                      <div className="bg-black/10 rounded-xl p-4">
                        <p className="font-mono text-sm text-foreground break-all">
                          {eventConfig.payment_info}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* In-Person Payment */}
                  <div className="p-6 bg-gradient-card backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-400/30 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                        <span className="text-2xl">🏛️</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-foreground">Presencial</h4>
                        <p className="text-sm text-muted-foreground">Na igreja</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold text-base text-foreground">
                        Pagamento presencial na igreja
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Com <span className="font-semibold">Taise</span> ou <span className="font-semibold">Pastora Alessandra</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Registration Section */}
          <section className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-tech bg-clip-text text-transparent">
              Faça sua Inscrição
            </h2>
            <div className="w-32 h-1 bg-gradient-neon mx-auto rounded-full shadow-neon mb-8"></div>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto px-4 leading-relaxed">
              Preencha o formulário abaixo com seus dados e envie o comprovante de pagamento. 
              Após a confirmação, você receberá todas as informações necessárias.
            </p>
          </section>

          {/* Form */}
          <div className="animate-fade-in">
            <RegistrationForm eventId={eventId} />
          </div>

          {/* Contact Info */}
          <div className="mt-16 text-center animate-fade-in">
            <div className="relative p-8 bg-gradient-card backdrop-blur-xl rounded-3xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform skew-x-12 translate-x-full animate-[shimmer_3s_ease-in-out_infinite]"></div>
              
              <h3 className="text-2xl font-bold mb-6 bg-gradient-tech bg-clip-text text-transparent">
                Confirmação e Contato
              </h3>
              
              <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-6 mb-6 border border-green-400/20">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">
                      Para confirmar sua inscrição
                    </p>
                  </div>
                </div>
                <p className="text-xl font-mono font-bold bg-gradient-neon bg-clip-text text-transparent">
                  WhatsApp: (48) 96507-165
                </p>
              </div>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Entre em contato após realizar o pagamento para confirmar sua participação no evento.
              </p>
              
              <div className="pt-6 border-t border-white/10">
                <p className="text-sm text-muted-foreground italic">
                  "Porque onde estiverem dois ou três reunidos em meu nome, aí estou eu no meio deles." 
                  <span className="block font-medium mt-2 bg-gradient-celestial bg-clip-text text-transparent">- Mateus 18:20</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetails;
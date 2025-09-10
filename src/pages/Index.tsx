import { useState, useEffect } from "react";
import ChurchHeader from "@/components/ChurchHeader";
import RegistrationForm from "@/components/RegistrationForm";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, DollarSign, Info } from "lucide-react";

interface EventConfig {
  id: string;
  event_name?: string;
  event_date: string | null;
  event_value: number | null;
  payment_info: string | null;
  banner_url: string | null;
}

const Index = () => {
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEventConfig();
  }, []);

  const loadEventConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('event_config')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setEventConfig(data);
    } catch (error) {
      console.error('Error loading event config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <ChurchHeader />
      
      <main className="container mx-auto px-4 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Event Information */}
          {eventConfig && !isLoading && (
            <section className="mb-6 sm:mb-12">
              <div className="bg-card/50 sm:bg-card/80 sm:backdrop-blur-sm rounded-lg sm:rounded-2xl p-4 sm:p-8 border-0 sm:border sm:border-border/30 sm:shadow-lg">
                
                <div className="text-center mb-4 sm:mb-8">
                  <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 text-foreground">
                    Informações do Evento
                  </h2>
                  <div className="hidden sm:block w-24 h-1 bg-gradient-to-r from-celestial to-divine mx-auto rounded-full"></div>
                </div>
                
                <div className="space-y-3 sm:grid sm:grid-cols-1 min-[480px]:grid-cols-2 sm:gap-6 sm:space-y-0">
                  {eventConfig.event_date && (
                    <div className="p-3 sm:p-6 bg-muted/20 sm:bg-muted/30 rounded-lg sm:rounded-xl border-0 sm:border sm:border-border/20 sm:hover:shadow-md sm:transition-all sm:duration-300">
                      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-celestial rounded-lg sm:rounded-xl flex items-center justify-center">
                          <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-foreground">Data & Hora</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Quando acontece</p>
                        </div>
                      </div>
                      <p className="font-medium sm:font-semibold text-sm sm:text-lg text-foreground">
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
                    <div className="p-3 sm:p-6 bg-muted/20 sm:bg-muted/30 rounded-lg sm:rounded-xl border-0 sm:border sm:border-border/20 sm:hover:shadow-md sm:transition-all sm:duration-300">
                      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-divine rounded-lg sm:rounded-xl flex items-center justify-center">
                          <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-foreground">Investimento</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Valor da inscrição</p>
                        </div>
                      </div>
                      <p className="font-bold text-lg sm:text-2xl text-celestial">
                        R$ {eventConfig.event_value.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment Methods Section */}
                <div className="mt-6 sm:mt-8">
                  <h3 className="text-lg sm:text-xl font-semibold text-center text-foreground mb-4 sm:mb-6">
                    Formas de Pagamento
                  </h3>
                  <div className="space-y-4 sm:grid sm:grid-cols-1 lg:grid-cols-2 sm:gap-6 sm:space-y-0">
                    {/* PIX Payment */}
                    {eventConfig.payment_info && (
                      <div className="p-4 sm:p-6 bg-muted/20 sm:bg-gradient-card sm:backdrop-blur-sm rounded-lg sm:rounded-2xl border-0 sm:border sm:border-white/10 sm:hover:border-green-400/30 sm:transition-all sm:duration-300 sm:hover-scale">
                        <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
                        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="w-8 h-8 sm:w-14 sm:h-14 bg-green-500 sm:bg-gradient-to-r sm:from-green-500 sm:to-blue-500 rounded-lg sm:rounded-2xl flex items-center justify-center">
                            <span className="text-lg sm:text-2xl">💳</span>
                          </div>
                          <div>
                            <h4 className="text-base sm:text-lg font-bold text-foreground">PIX</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">Pagamento instantâneo</p>
                          </div>
                        </div>
                        <div className="bg-muted/30 sm:bg-black/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
                          <p className="font-mono text-xs sm:text-sm text-foreground break-all">
                            {eventConfig.payment_info}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* In-Person Payment */}
                    <div className="p-4 sm:p-6 bg-muted/20 sm:bg-gradient-card sm:backdrop-blur-sm rounded-lg sm:rounded-2xl border-0 sm:border sm:border-white/10 sm:hover:border-purple-400/30 sm:transition-all sm:duration-300 sm:hover-scale">
                      <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="w-8 h-8 sm:w-14 sm:h-14 bg-purple-500 sm:bg-gradient-to-r sm:from-purple-500 sm:to-pink-500 rounded-lg sm:rounded-2xl flex items-center justify-center">
                          <span className="text-lg sm:text-2xl">🏛️</span>
                        </div>
                        <div>
                          <h4 className="text-base sm:text-lg font-bold text-foreground">Presencial</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground">Na igreja</p>
                        </div>
                      </div>
                      <div className="space-y-1 sm:space-y-2">
                        <p className="font-medium sm:font-semibold text-sm sm:text-base text-foreground">
                          Pagamento presencial na igreja
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Com <span className="font-semibold">Taise</span> ou <span className="font-semibold">Pastora Alessandra</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Registration Section */}
          <section className="text-center mb-8 sm:mb-12 animate-fade-in">
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
            <RegistrationForm eventConfig={eventConfig} />
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-16 animate-fade-in">
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
                  WhatsApp: (48) 99650-7165
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

export default Index;
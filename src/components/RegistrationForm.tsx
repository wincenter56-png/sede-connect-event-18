import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Phone, User, CreditCard, Send, MapPin, Smartphone, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  name: string;
  phone: string;
  paymentType: 'pix' | 'presencial';
  receipt: File | null;
  eventId: string;
}

interface EventConfig {
  id: string;
  event_name: string | null;
  event_date: string | null;
  event_value: number | null;
  payment_info: string | null;
  banner_url: string | null;
}

interface RegistrationFormProps {
  className?: string;
  eventId?: string;
}

export default function RegistrationForm({ className, eventId }: RegistrationFormProps) {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventConfig[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventConfig | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    paymentType: 'pix',
    receipt: null,
    eventId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const whatsappNumber = "554896507165"; // Número do Ministério Sede do Espírito

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (eventId && events.length > 0) {
      // If eventId is provided as prop, use it
      const event = events.find(e => e.id === eventId);
      if (event) {
        setSelectedEvent(event);
        setFormData(prev => ({ ...prev, eventId }));
      }
    }
  }, [eventId, events]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('event_config')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);

      // Auto-select first event if available and no eventId prop is provided
      if (data && data.length > 0 && !eventId) {
        setSelectedEvent(data[0]);
        setFormData(prev => ({ ...prev, eventId: data[0].id }));
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar eventos disponíveis",
        variant: "destructive",
      });
    }
  };

  const handleEventChange = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    setSelectedEvent(event || null);
    setFormData(prev => ({ ...prev, eventId }));
  };

  const handleInputChange = (field: keyof Omit<FormData, 'receipt'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, receipt: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.eventId) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let receiptUrl = null;
      
      // Upload do comprovante apenas se foi fornecido
      if (formData.receipt) {
        const fileExt = formData.receipt.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-banners')
          .upload(`receipts/${fileName}`, formData.receipt);

        if (uploadError) {
          throw uploadError;
        }

        // Obter URL pública do arquivo
        const { data: { publicUrl } } = supabase.storage
          .from('event-banners')
          .getPublicUrl(`receipts/${fileName}`);
          
        receiptUrl = publicUrl;
      }

      // Salvar no banco de dados
      const { error: dbError } = await supabase
        .from('registrations')
        .insert([
          {
            name: formData.name,
            phone: formData.phone,
            receipt_url: receiptUrl,
            status: 'pending',
            event_id: formData.eventId
          }
        ]);

      if (dbError) {
        throw dbError;
      }

      // Criar mensagem para WhatsApp
      const paymentMessage = formData.paymentType === 'pix' 
        ? `💳 *Pagamento via PIX*\n` +
          `🔑 Chave PIX: ${selectedEvent?.payment_info || "taiseacordi@gmail.com"}\n` +
          `💰 Valor: R$ ${selectedEvent?.event_value?.toFixed(2).replace('.', ',') || 'Consultar'}\n` +
          `${formData.receipt ? '✅ Comprovante anexado no formulário\n' : '⚠️ *IMPORTANTE: ENVIE O COMPROVANTE NESTA CONVERSA*\n'}`
        : `💵 *Pagamento Presencial*\n` +
          `💰 Valor: R$ ${selectedEvent?.event_value?.toFixed(2).replace('.', ',') || 'Consultar'}\n` +
          `🏢 Pagamento será realizado no local do evento\n`;

      const eventDateStr = selectedEvent?.event_date 
        ? new Date(selectedEvent.event_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Data a confirmar';

      const message = encodeURIComponent(
        `🙏 *INSCRIÇÃO CONFIRMADA*\n` +
        `✨ *${selectedEvent?.event_name || 'Encontro Ministério Sede do Espírito'}* ✨\n\n` +
        `📅 *Data:* ${eventDateStr}\n\n` +
        `👤 *Dados do Inscrito:*\n` +
        `📝 Nome: ${formData.name}\n` +
        `📱 Telefone: ${formData.phone}\n\n` +
        `💳 *Forma de Pagamento:*\n` +
        paymentMessage + `\n` +
        `🕊️ *Que Deus abençoe sua participação!* 🙏\n` +
        `⭐ Aguardamos você com muito carinho! ⭐`
      );

      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      
      // Abrir WhatsApp
      window.open(whatsappUrl, '_blank');
      
      toast({
        title: "Inscrição realizada com sucesso! 🙏",
        description: "Seus dados foram salvos e você será redirecionado para o WhatsApp.",
        duration: 6000,
      });

      // Reset form
      setFormData({
        name: "",
        phone: "",
        paymentType: 'pix',
        receipt: null,
        eventId: events.length > 0 ? events[0].id : "",
      });

    } catch (error) {
      console.error('Erro na inscrição:', error);
      toast({
        title: "Erro na inscrição",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`w-full max-w-md mx-auto shadow-xl border-0 bg-card/95 backdrop-blur ${className || ''}`}>
      <CardHeader className="text-center pb-4 px-4 sm:px-6 sm:pb-6">
        <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-divine bg-clip-text text-transparent">
          Inscrição do Encontro
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm sm:text-base">
          Escolha um evento e preencha seus dados para participar
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6">
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum evento disponível no momento</p>
            <p className="text-sm">Volte em breve para ver novos eventos!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Event Selection - Only show if no eventId prop is provided */}
            {!eventId && (
              <div className="space-y-2">
                <Label htmlFor="event" className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="w-4 h-4" />
                  Selecionar Evento
                </Label>
                <Select value={formData.eventId} onValueChange={handleEventChange}>
                  <SelectTrigger className="border-border/50 focus:border-celestial/50">
                    <SelectValue placeholder="Escolha um evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{event.event_name || 'Evento sem nome'}</span>
                          <span className="text-xs text-muted-foreground">
                            {event.event_date ? new Date(event.event_date).toLocaleDateString('pt-BR') : 'Data a definir'} 
                            {event.event_value && ` - R$ ${event.event_value.toFixed(2).replace('.', ',')}`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Show selected event info when eventId is provided */}
            {eventId && selectedEvent && (
              <div className="bg-celestial/5 border border-celestial/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-celestial" />
                  <h3 className="font-semibold text-celestial">Evento Selecionado</h3>
                </div>
                <p className="font-medium text-foreground">{selectedEvent.event_name || 'Evento da Igreja'}</p>
                {selectedEvent.event_date && (
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedEvent.event_date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
                {selectedEvent.event_value && (
                  <p className="text-sm font-semibold text-celestial">
                    R$ {selectedEvent.event_value.toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>
            )}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
              <User className="w-4 h-4" />
              Nome Completo
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="border-border/50 focus:border-celestial/50 transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
              <Phone className="w-4 h-4" />
              Telefone
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="border-border/50 focus:border-celestial/50 transition-colors"
              required
            />
          </div>

          {/* Tipo de Pagamento */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <CreditCard className="w-4 h-4" />
              Forma de Pagamento
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleInputChange('paymentType', 'pix')}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                  formData.paymentType === 'pix'
                    ? 'bg-celestial/10 border-celestial text-celestial'
                    : 'bg-card border-border hover:border-celestial/50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-sm font-medium">PIX</span>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('paymentType', 'presencial')}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                  formData.paymentType === 'presencial'
                    ? 'bg-celestial/10 border-celestial text-celestial'
                    : 'bg-card border-border hover:border-celestial/50'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Presencial</span>
              </button>
            </div>
          </div>

          {/* PIX Information - Só mostra se PIX for selecionado */}
          {formData.paymentType === 'pix' && selectedEvent && (
            <div className="bg-holy/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-celestial/20">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-celestial" />
                <h3 className="text-sm sm:text-base font-semibold text-celestial">Informações de Pagamento PIX</h3>
              </div>
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Faça o pagamento via PIX para a chave:
                  </p>
                  <div className="bg-card/50 rounded-lg p-2 sm:p-3 border border-border/30">
                    <p className="font-mono text-xs sm:text-sm font-medium text-center text-celestial break-all">
                      {selectedEvent.payment_info || "taiseacordi@gmail.com"}
                    </p>
                  </div>
                  {selectedEvent.event_value && (
                    <div className="bg-divine/10 rounded-lg p-2 sm:p-3 border border-celestial/20">
                      <p className="text-xs sm:text-sm font-medium text-center text-celestial">
                        Valor: R$ {selectedEvent.event_value.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  )}
                <p className="text-xs text-muted-foreground text-center">
                  Após o pagamento, você pode anexar o comprovante no campo abaixo (opcional)
                </p>
              </div>
            </div>
          )}

          {/* Informações Pagamento Presencial */}
          {formData.paymentType === 'presencial' && selectedEvent && (
            <div className="bg-holy/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-celestial/20">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-celestial" />
                <h3 className="text-sm sm:text-base font-semibold text-celestial">Pagamento Presencial</h3>
              </div>
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  O pagamento será realizado no local do evento
                </p>
                {selectedEvent.event_value && (
                  <div className="bg-divine/10 rounded-lg p-2 sm:p-3 border border-celestial/20">
                    <p className="text-xs sm:text-sm font-medium text-center text-celestial">
                      Valor: R$ {selectedEvent.event_value.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  Traga o dinheiro no dia do evento
                </p>
              </div>
            </div>
          )}

          {/* Comprovante - Só mostra se PIX for selecionado */}
          {formData.paymentType === 'pix' && (
            <div className="space-y-2">
              <Label htmlFor="receipt" className="flex items-center gap-2 text-sm font-medium">
                <Upload className="w-4 h-4" />
                Comprovante de Pagamento <span className="text-muted-foreground text-xs">(opcional)</span>
              </Label>
              <div className="relative">
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="border-border/50 focus:border-celestial/50 transition-colors cursor-pointer"
                />
                {formData.receipt && (
                  <div className="flex items-center gap-2 text-xs text-celestial mt-2 bg-divine/10 p-2 rounded-md">
                    <span>✓</span>
                    <span>Arquivo selecionado: {formData.receipt.name}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border-l-2 border-yellow-400">
                  📋 <strong>Importante:</strong> Se não anexar agora, envie o comprovante no WhatsApp após a inscrição!
                </p>
              </div>
            </div>
          )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-divine hover:opacity-90 text-celestial-foreground font-medium py-4 sm:py-6 transition-all duration-300 hover:scale-[1.02] text-sm sm:text-base"
            >
              {isSubmitting ? (
                "Processando..."
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Confirmar Inscrição
                </span>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
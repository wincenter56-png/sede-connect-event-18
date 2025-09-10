import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LogIn, User, Lock } from "lucide-react";

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof typeof credentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Verificar credenciais
      if (credentials.username === "admin" && credentials.password === "jesus777") {
        // Salvar sessão no localStorage
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("adminLoginTime", new Date().toISOString());
        
        toast({
          title: "Login realizado com sucesso! 🙏",
          description: "Bem-vindo ao painel administrativo",
        });

        // Redirecionar para admin
        navigate("/admin");
      } else {
        toast({
          title: "Credenciais inválidas",
          description: "Usuário ou senha incorretos",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-holy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-divine rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-celestial-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-divine bg-clip-text text-transparent">
              Acesso Administrativo
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Entre com suas credenciais para acessar o painel
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium">
                  <User className="w-4 h-4" />
                  Usuário
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={credentials.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="border-border/50 focus:border-celestial/50 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                  <Lock className="w-4 h-4" />
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="border-border/50 focus:border-celestial/50 transition-colors"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-divine hover:opacity-90 text-celestial-foreground font-medium py-6 transition-all duration-300 hover:scale-[1.02]"
              >
                {isLoading ? (
                  "Entrando..."
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Entrar
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/")}
                className="text-sm text-muted-foreground hover:text-celestial transition-colors"
              >
                ← Voltar para a página inicial
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <div className="mt-6">
          <div className="bg-holy/30 backdrop-blur-sm rounded-xl p-4 border border-celestial/20 text-center">
            <p className="text-sm text-muted-foreground">
              "Porque onde estiverem dois ou três reunidos em meu nome, aí estou eu no meio deles."
            </p>
            <p className="text-xs text-celestial font-medium mt-1">- Mateus 18:20</p>
          </div>
        </div>
      </div>
    </div>
  );
}
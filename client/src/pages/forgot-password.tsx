import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { getShortAppName } from '@/config/branding';

export default function ForgotPasswordPage() {
  const { forgotPasswordMutation, authMode } = useAuth();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Rediriger vers la page de connexion si pas en mode local
  if (authMode === 'oauth') {
    return <Redirect to="/auth" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await forgotPasswordMutation.mutateAsync({ email });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cjd-green rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">CJD</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{getShortAppName()}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {submitted ? "Email envoyé" : "Mot de passe oublié"}
            </CardTitle>
            <CardDescription>
              {submitted 
                ? "Vérifiez votre boîte de réception" 
                : "Entrez votre adresse email pour recevoir un lien de réinitialisation"
              }
            </CardDescription>
          </CardHeader>

          {submitted ? (
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center py-4">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-gray-600">
                  Si l'adresse <strong>{email}</strong> est associée à un compte, 
                  vous recevrez un email avec les instructions de réinitialisation.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Le lien est valable pendant 1 heure.
                </p>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-cjd-green hover:bg-cjd-green-dark"
                  disabled={forgotPasswordMutation.isPending}
                  size="lg"
                >
                  {forgotPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer le lien de réinitialisation"
                  )}
                </Button>
              </CardContent>
            </form>
          )}

          <CardFooter className="flex justify-center">
            <Link href="/auth" className="text-sm text-cjd-green hover:underline flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

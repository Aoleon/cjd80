import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Shield, AlertCircle } from "lucide-react";
import { hasPermission } from "@shared/schema";
import { branding, getShortAppName } from '@/config/branding';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AuthPage() {
  const { user, isLoading, loginMutation } = useAuth();
  const [location, setLocation] = useLocation();

  // Calculer isAdmin après tous les hooks pour éviter les problèmes de réconciliation
  const isAdmin = user ? hasPermission(user.role, 'admin.view') : false;

  // Vérifier les paramètres d'erreur dans l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get('error');

  // Redirect if already logged in (after hooks are called)
  if (!isLoading && user) {
    // Rediriger les admins vers la page d'administration
    return <Redirect to={isAdmin ? "/admin" : "/"} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
      </div>
    );
  }

  const handleLogin = () => {
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-cjd-green rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">CJD</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Administration {getShortAppName()}</h1>
            <p className="text-gray-600">Connectez-vous pour accéder au back-office</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Connexion</CardTitle>
              <CardDescription>
                Utilisez Authentik pour vous connecter à l'administration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erreur d'authentification</AlertTitle>
                  <AlertDescription>
                    {error === "authentication_failed" && "L'authentification a échoué. Veuillez réessayer."}
                    {error === "session_failed" && "Erreur lors de l'établissement de la session. Veuillez réessayer."}
                    {error !== "authentication_failed" && error !== "session_failed" && decodeURIComponent(error)}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleLogin}
                className="w-full bg-cjd-green hover:bg-cjd-green-dark"
                disabled={loginMutation.isPending}
                size="lg"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirection en cours...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Se connecter avec Authentik
                  </>
                )}
              </Button>

              <p className="text-sm text-gray-500 text-center mt-4">
                Vous serez redirigé vers Authentik pour vous authentifier
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="flex-1 bg-cjd-green relative overflow-hidden hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-cjd-green to-cjd-green-dark"></div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-white p-12">
          <h2 className="text-4xl font-bold mb-6">Boîte à Kiffs</h2>
          <p className="text-xl mb-8 text-center max-w-md">
            La plateforme collaborative du {branding.organization.fullName}
          </p>
          
          <div className="space-y-6 max-w-sm">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Authentification sécurisée</h3>
                <p className="text-sm opacity-90">Connexion via Authentik pour une sécurité renforcée</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

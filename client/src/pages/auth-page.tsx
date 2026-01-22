"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Shield, AlertCircle, Mail, Lock } from "lucide-react";
import { hasPermission } from "@shared/schema";
import { branding, getShortAppName } from '@/config/branding';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AuthPage() {
  const { user, isLoading, loginMutation, authMode } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Calculer isAdmin après tous les hooks
  const isAdmin = user ? hasPermission(user.role, 'admin.view') : false;

  // Vérifier les paramètres d'erreur dans l'URL
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const error = urlParams?.get('error');

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push(isAdmin ? "/admin" : "/");
    }
  }, [isLoading, user, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
      </div>
    );
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'local') {
      loginMutation.mutate({ email, password });
    } else {
      loginMutation.mutate(undefined);
    }
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
                Entrez vos identifiants pour vous connecter à l'administration
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
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

                {authMode === 'local' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
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

                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit"
                      className="w-full bg-cjd-green hover:bg-cjd-green-dark"
                      disabled={loginMutation.isPending}
                      size="lg"
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Connexion en cours...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Se connecter
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button 
                    type="submit"
                    className="w-full bg-cjd-green hover:bg-cjd-green-dark"
                    disabled={loginMutation.isPending}
                    size="lg"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Se connecter
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </form>

            <CardFooter className="flex justify-center">
              <Link href="/forgot-password" className="text-sm text-cjd-green hover:underline">
                Mot de passe oublié ?
              </Link>
            </CardFooter>
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
                <p className="text-sm opacity-90">
                  Connexion par email et mot de passe sécurisé
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

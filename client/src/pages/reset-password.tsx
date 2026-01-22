"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Lock, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getShortAppName } from '@/config/branding';

export default function ResetPasswordPage() {
  const { resetPasswordMutation, authMode } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extraire le token de l'URL
  useEffect(() => {
    const tokenParam = searchParams?.get('token');
    setToken(tokenParam);

    // Valider le token
    if (tokenParam) {
      fetch(`/api/auth/reset-password/validate?token=${tokenParam}`)
        .then(res => res.json())
        .then(data => setTokenValid(data.valid))
        .catch(() => setTokenValid(false));
    }
  }, [searchParams]);

  // Rediriger vers la page de connexion si pas en mode local
  useEffect(() => {
    if (authMode === 'oauth') {
      router.push("/auth");
    }
  }, [authMode, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    // Vérifier la force du mot de passe
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Le mot de passe doit contenir au moins une majuscule");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Le mot de passe doit contenir au moins une minuscule");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Le mot de passe doit contenir au moins un chiffre");
      return;
    }

    if (!token) {
      setError("Token de réinitialisation manquant");
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({ token, password });
      setSubmitted(true);
    } catch (err) {
      // L'erreur est gérée par le hook
    }
  };

  // Affichage pendant la vérification du token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
      </div>
    );
  }

  // Token invalide ou expiré
  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Lien invalide ou expiré</CardTitle>
              <CardDescription>
                Le lien de réinitialisation est invalide ou a expiré.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>
                  Ce lien de réinitialisation n'est plus valide. Les liens expirent après 1 heure.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link href="/forgot-password" className="text-sm text-cjd-green hover:underline">
                Demander un nouveau lien
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

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
              {submitted ? "Mot de passe réinitialisé" : "Nouveau mot de passe"}
            </CardTitle>
            <CardDescription>
              {submitted 
                ? "Vous pouvez maintenant vous connecter" 
                : "Choisissez votre nouveau mot de passe"
              }
            </CardDescription>
          </CardHeader>

          {submitted ? (
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center py-4">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-gray-600">
                  Votre mot de passe a été réinitialisé avec succès.
                </p>
              </div>
              <Button 
                onClick={() => router.push('/auth')}
                className="w-full bg-cjd-green hover:bg-cjd-green-dark"
                size="lg"
              >
                Se connecter
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Nouveau mot de passe</Label>
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
                  <p className="text-xs text-gray-500">
                    Minimum 8 caractères, avec majuscule, minuscule et chiffre
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-cjd-green hover:bg-cjd-green-dark"
                  disabled={resetPasswordMutation.isPending}
                  size="lg"
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Réinitialisation en cours...
                    </>
                  ) : (
                    "Réinitialiser le mot de passe"
                  )}
                </Button>
              </CardContent>
            </form>
          )}

          {!submitted && (
            <CardFooter className="flex justify-center">
              <Link href="/auth" className="text-sm text-cjd-green hover:underline flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

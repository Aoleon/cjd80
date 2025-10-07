import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Lightbulb, Calendar, Shield } from "lucide-react";
import { hasPermission } from "@shared/schema";

export default function AuthPage() {
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ 
    email: "", 
    firstName: "", 
    lastName: "", 
    password: "", 
    confirmPassword: "" 
  });

  // Redirect if already logged in (after hooks are called)
  if (!isLoading && user) {
    // Rediriger les admins vers la page d'administration
    const isAdmin = hasPermission(user.role, 'admin.view');
    return <Redirect to={isAdmin ? "/admin" : "/"} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-cjd-green" />
      </div>
    );
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    registerMutation.mutate({
      email: registerForm.email,
      firstName: registerForm.firstName,
      lastName: registerForm.lastName,
      password: registerForm.password,
      role: "ideas_reader" as const,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-cjd-green rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">CJD</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Administration CJD Amiens</h1>
            <p className="text-gray-600">Connectez-vous pour accéder au back-office</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Créer un compte</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Connexion</CardTitle>
                  <CardDescription>
                    Entrez vos identifiants pour accéder à l'administration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="focus:ring-cjd-green focus:border-cjd-green"
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Mot de passe</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                        className="focus:ring-cjd-green focus:border-cjd-green"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-cjd-green hover:bg-cjd-green-dark"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Shield className="mr-2 h-4 w-4" />
                      )}
                      Se connecter
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Créer un compte</CardTitle>
                  <CardDescription>
                    Créez un compte administrateur pour gérer l'application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="focus:ring-cjd-green focus:border-cjd-green"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-firstName">Prénom</Label>
                      <Input
                        id="register-firstName"
                        type="text"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                        className="focus:ring-cjd-green focus:border-cjd-green"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-lastName">Nom</Label>
                      <Input
                        id="register-lastName"
                        type="text"
                        value={registerForm.lastName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                        className="focus:ring-cjd-green focus:border-cjd-green"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-password">Mot de passe</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                        className="focus:ring-cjd-green focus:border-cjd-green"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-confirm">Confirmer le mot de passe</Label>
                      <Input
                        id="register-confirm"
                        type="password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                        className="focus:ring-cjd-green focus:border-cjd-green"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-cjd-green hover:bg-cjd-green-dark"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Shield className="mr-2 h-4 w-4" />
                      )}
                      Créer le compte
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="flex-1 bg-cjd-green relative overflow-hidden hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-cjd-green to-cjd-green-dark"></div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-white p-12">
          <h2 className="text-4xl font-bold mb-6">Boîte à Kiffs</h2>
          <p className="text-xl mb-8 text-center max-w-md">
            La plateforme collaborative du Centre des Jeunes Dirigeants d'Amiens
          </p>
          
          <div className="space-y-6 max-w-sm">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Partagez vos idées</h3>
                <p className="text-sm opacity-90">Proposez et votez pour les meilleures initiatives</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Gérez les événements</h3>
                <p className="text-sm opacity-90">Organisez et suivez les activités de la section</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Fédérez la communauté</h3>
                <p className="text-sm opacity-90">Renforcez les liens entre dirigeants</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

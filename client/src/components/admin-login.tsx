import { useAuth } from "@/hooks/use-auth";
import { LogIn, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminLogin() {
  const { loginMutation } = useAuth();

  const handleLogin = () => {
    loginMutation.mutate(undefined);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-cjd-green rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-gray-800">Administration</CardTitle>
          <CardDescription>
            Connectez-vous pour accéder au panneau d'administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleLogin}
            disabled={loginMutation.isPending}
            className="w-full bg-cjd-green text-white hover:bg-cjd-green-dark transition-colors duration-200"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redirection en cours...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
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
  );
}
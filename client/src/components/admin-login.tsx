"use client";

import { useAuth } from "@/hooks/use-auth";
import { LogIn, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminLogin() {
  const { } = useAuth();

  // Redirige vers la page de connexion principale
  if (typeof window !== 'undefined') {
    window.location.href = '/auth';
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-cjd-green rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-gray-800">Redirection...</CardTitle>
          <CardDescription>
            Redirection vers la page de connexion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-cjd-green" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
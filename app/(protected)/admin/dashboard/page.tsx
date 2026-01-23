'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, Lightbulb, Calendar } from 'lucide-react';

/**
 * Page Dashboard Admin
 * Vue d'ensemble des statistiques et activités récentes
 */
export default function DashboardPage() {
  const { user } = useAuth();

  // Mock data - à remplacer par de vraies données via API/tRPC
  const stats = [
    {
      title: 'Membres',
      value: '24',
      description: '+2 ce mois',
      icon: Users,
      color: 'text-info',
      bgColor: 'bg-info-light',
    },
    {
      title: 'Mécènes',
      value: '8',
      description: '+1 ce mois',
      icon: Heart,
      color: 'text-error',
      bgColor: 'bg-error-light',
    },
    {
      title: 'Idées',
      value: '42',
      description: '12 en attente',
      icon: Lightbulb,
      color: 'text-warning',
      bgColor: 'bg-warning-light',
    },
    {
      title: 'Événements',
      value: '6',
      description: '3 à venir',
      icon: Calendar,
      color: 'text-success',
      bgColor: 'bg-success-light',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Message de bienvenue */}
      <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Bienvenue, {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email} !
        </h2>
        <p className="text-sm text-muted-foreground">
          Voici un aperçu de l'activité de votre organisation.
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>
            Les dernières actions effectuées sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="rounded-full bg-success-light p-2">
                <Lightbulb className="h-4 w-4 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nouvelle idée soumise</p>
                <p className="text-xs text-muted-foreground">
                  "Application mobile pour les membres" par Jean Dupont
                </p>
                <p className="text-xs text-muted-foreground mt-1">Il y a 2 heures</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="rounded-full bg-info-light p-2">
                <Users className="h-4 w-4 text-info" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nouveau membre inscrit</p>
                <p className="text-xs text-muted-foreground">
                  Marie Martin a rejoint l'organisation
                </p>
                <p className="text-xs text-muted-foreground mt-1">Il y a 5 heures</p>
              </div>
            </div>

            <div className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="rounded-full bg-warning-light p-2">
                <Calendar className="h-4 w-4 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Événement mis à jour</p>
                <p className="text-xs text-muted-foreground">
                  "Afterwork networking" - Date modifiée
                </p>
                <p className="text-xs text-muted-foreground mt-1">Hier</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>
            Raccourcis vers les actions fréquentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-border rounded-lg hover:bg-accent hover:border-accent-foreground transition-colors text-left">
              <Users className="h-5 w-5 text-primary mb-2" />
              <p className="text-sm font-medium">Ajouter un membre</p>
            </button>
            <button className="p-4 border border-border rounded-lg hover:bg-accent hover:border-accent-foreground transition-colors text-left">
              <Calendar className="h-5 w-5 text-primary mb-2" />
              <p className="text-sm font-medium">Créer un événement</p>
            </button>
            <button className="p-4 border border-border rounded-lg hover:bg-accent hover:border-accent-foreground transition-colors text-left">
              <Lightbulb className="h-5 w-5 text-primary mb-2" />
              <p className="text-sm font-medium">Modérer les idées</p>
            </button>
            <button className="p-4 border border-border rounded-lg hover:bg-accent hover:border-accent-foreground transition-colors text-left">
              <Heart className="h-5 w-5 text-primary mb-2" />
              <p className="text-sm font-medium">Gérer les mécènes</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

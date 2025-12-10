import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, Minus, Calendar, Users, Lightbulb, DollarSign, Activity } from "lucide-react";
import { useMemo } from "react";

interface AnalyticsData {
  monthlyActivity?: { month: string; ideas: number; events: number; members: number }[];
  memberGrowth?: { month: string; newMembers: number; total: number }[];
  ideaStatus?: { status: string; count: number; color: string }[];
  eventParticipation?: { event: string; inscriptions: number; capacity: number }[];
  donationTrends?: { month: string; amount: number }[];
  kpis?: {
    totalMembers: number;
    memberGrowth: number;
    activeIdeas: number;
    ideaGrowth: number;
    upcomingEvents: number;
    eventGrowth: number;
    totalDonations: number;
    donationGrowth: number;
  };
}

interface AdminAnalyticsChartsProps {
  data?: AnalyticsData;
  isLoading?: boolean;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function GrowthIndicator({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const isPositive = value > 0;
  const isZero = value === 0;
  const Icon = isPositive ? TrendingUp : isZero ? Minus : TrendingDown;
  const colorClass = isPositive ? 'text-green-600' : isZero ? 'text-gray-500' : 'text-red-600';
  
  return (
    <span className={`flex items-center gap-1 text-sm font-medium ${colorClass}`}>
      <Icon className="h-4 w-4" />
      {isPositive ? '+' : ''}{value}{suffix}
    </span>
  );
}

function KPICard({ 
  title, 
  value, 
  growth, 
  icon: Icon,
  color
}: { 
  title: string; 
  value: number | string; 
  growth: number; 
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <div className="mt-2">
              <GrowthIndicator value={growth} />
              <span className="text-xs text-gray-500 ml-1">vs mois dernier</span>
            </div>
          </div>
          <div className={`p-4 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminAnalyticsCharts({ data, isLoading }: AdminAnalyticsChartsProps) {
  // Sample data if none provided
  const monthlyActivity = useMemo(() => data?.monthlyActivity || [
    { month: 'Jan', ideas: 12, events: 4, members: 15 },
    { month: 'Fév', ideas: 19, events: 6, members: 22 },
    { month: 'Mar', ideas: 15, events: 8, members: 18 },
    { month: 'Avr', ideas: 25, events: 5, members: 28 },
    { month: 'Mai', ideas: 22, events: 9, members: 30 },
    { month: 'Juin', ideas: 30, events: 7, members: 35 },
  ], [data?.monthlyActivity]);

  const memberGrowth = useMemo(() => data?.memberGrowth || [
    { month: 'Jan', newMembers: 15, total: 120 },
    { month: 'Fév', newMembers: 22, total: 142 },
    { month: 'Mar', newMembers: 18, total: 160 },
    { month: 'Avr', newMembers: 28, total: 188 },
    { month: 'Mai', newMembers: 30, total: 218 },
    { month: 'Juin', newMembers: 35, total: 253 },
  ], [data?.memberGrowth]);

  const ideaStatus = useMemo(() => data?.ideaStatus || [
    { status: 'Approuvées', count: 45, color: '#10b981' },
    { status: 'En attente', count: 23, color: '#f59e0b' },
    { status: 'En cours', count: 12, color: '#3b82f6' },
    { status: 'Refusées', count: 8, color: '#ef4444' },
  ], [data?.ideaStatus]);

  const eventParticipation = useMemo(() => data?.eventParticipation || [
    { event: 'Conférence AI', inscriptions: 45, capacity: 50 },
    { event: 'Workshop Marketing', inscriptions: 28, capacity: 30 },
    { event: 'Networking', inscriptions: 60, capacity: 80 },
    { event: 'Formation RH', inscriptions: 15, capacity: 25 },
  ], [data?.eventParticipation]);

  const kpis = useMemo(() => data?.kpis || {
    totalMembers: 253,
    memberGrowth: 12.5,
    activeIdeas: 80,
    ideaGrowth: 8.3,
    upcomingEvents: 7,
    eventGrowth: -5.2,
    totalDonations: 15600,
    donationGrowth: 23.1,
  }, [data?.kpis]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Membres"
          value={kpis.totalMembers}
          growth={kpis.memberGrowth}
          icon={Users}
          color="bg-green-500"
        />
        <KPICard
          title="Idées Actives"
          value={kpis.activeIdeas}
          growth={kpis.ideaGrowth}
          icon={Lightbulb}
          color="bg-blue-500"
        />
        <KPICard
          title="Événements à venir"
          value={kpis.upcomingEvents}
          growth={kpis.eventGrowth}
          icon={Calendar}
          color="bg-amber-500"
        />
        <KPICard
          title="Dons (€)"
          value={kpis.totalDonations.toLocaleString('fr-FR')}
          growth={kpis.donationGrowth}
          icon={DollarSign}
          color="bg-purple-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Activité mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="ideas" name="Idées" stackId="1" stroke="#10b981" fill="#10b98133" />
                <Area type="monotone" dataKey="events" name="Événements" stackId="2" stroke="#3b82f6" fill="#3b82f633" />
                <Area type="monotone" dataKey="members" name="Nouveaux membres" stackId="3" stroke="#f59e0b" fill="#f59e0b33" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Member Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Croissance des membres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={memberGrowth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis yAxisId="right" orientation="right" className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="newMembers" name="Nouveaux" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                <Line yAxisId="right" type="monotone" dataKey="total" name="Total cumulé" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Idea Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-600" />
              Répartition des idées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ideaStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                >
                  {ideaStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Participation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Taux de participation aux événements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventParticipation} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="event" width={120} className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number, name: string) => [value, name === 'inscriptions' ? 'Inscrits' : 'Capacité']}
                />
                <Legend />
                <Bar dataKey="inscriptions" name="Inscrits" fill="#10b981" radius={[0, 4, 4, 0]} />
                <Bar dataKey="capacity" name="Capacité" fill="#e5e7eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

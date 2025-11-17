import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, Database, Clock, Users } from 'lucide-react';

interface PoolStats {
  totalCount: number;
  idleCount: number;
  waitingCount: number;
  max: number;
  min: number;
}

interface DbHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  poolStats: PoolStats;
  connectionTest: boolean;
  responseTime: number;
  timestamp: string;
}

interface SystemStats {
  pool: PoolStats;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  timestamp: string;
}

export default function AdminDbMonitor() {
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Query pour les statistiques du pool
  const { 
    data: poolStats, 
    isLoading: poolLoading,
    refetch: refetchPool 
  } = useQuery<SystemStats>({
    queryKey: ["/api/admin/pool-stats"],
    refetchInterval: isAutoRefresh ? 10000 : false, // 10 secondes
  });

  // Query pour la santé de la DB
  const { 
    data: dbHealth, 
    isLoading: healthLoading,
    refetch: refetchHealth 
  } = useQuery<DbHealth>({
    queryKey: ["/api/admin/db-health"],
    refetchInterval: isAutoRefresh ? 15000 : false, // 15 secondes
  });

  const formatBytes = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-success';
      case 'degraded': return 'bg-warning';
      case 'unhealthy': return 'bg-error';
      default: return 'bg-muted';
    }
  };

  const getPoolUsageColor = (used: number, max: number) => {
    const percentage = (used / max) * 100;
    if (percentage < 50) return 'bg-success';
    if (percentage < 80) return 'bg-warning';
    return 'bg-error';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Monitoring Base de Données</h3>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Auto-refresh</span>
            <Button
              variant={isAutoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            >
              <Activity className="w-4 h-4 mr-1" />
              {isAutoRefresh ? 'ON' : 'OFF'}
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchPool();
              refetchHealth();
            }}
            disabled={poolLoading || healthLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${(poolLoading || healthLoading) ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Santé générale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Santé de la Base de Données</span>
            {dbHealth && (
              <Badge className={`ml-auto ${getStatusColor(dbHealth.status)} text-white`}>
                {dbHealth.status.toUpperCase()}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {healthLoading ? (
            <div className="flex items-center space-x-2 text-gray-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Vérification en cours...</span>
            </div>
          ) : dbHealth ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{dbHealth.responseTime}ms</div>
                <div className="text-sm text-gray-600 flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Temps de réponse
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {dbHealth.connectionTest ? '✓' : '✗'}
                </div>
                <div className="text-sm text-gray-600">Test de connexion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{dbHealth.poolStats.totalCount}</div>
                <div className="text-sm text-gray-600">Connexions actives</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{dbHealth.poolStats.waitingCount}</div>
                <div className="text-sm text-gray-600">En attente</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-600">Données non disponibles</div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques du Pool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Pool de Connexions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {poolLoading ? (
            <div className="flex items-center space-x-2 text-gray-600">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Chargement...</span>
            </div>
          ) : poolStats ? (
            <div className="space-y-4">
              {/* Indicateur visuel du pool */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Utilisation du pool</span>
                  <span>{poolStats.pool.totalCount}/{poolStats.pool.max}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getPoolUsageColor(poolStats.pool.totalCount, poolStats.pool.max)}`}
                    style={{ width: `${(poolStats.pool.totalCount / poolStats.pool.max) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-info-light rounded-lg">
                  <div className="text-xl font-bold text-info">{poolStats.pool.totalCount}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center p-3 bg-success-light rounded-lg">
                  <div className="text-xl font-bold text-success">{poolStats.pool.idleCount}</div>
                  <div className="text-sm text-gray-600">Idle</div>
                </div>
                <div className="text-center p-3 bg-warning-light rounded-lg">
                  <div className="text-xl font-bold text-warning">{poolStats.pool.waitingCount}</div>
                  <div className="text-sm text-gray-600">En attente</div>
                </div>
                <div className="text-center p-3 bg-info-light rounded-lg">
                  <div className="text-xl font-bold text-info">{poolStats.pool.max}</div>
                  <div className="text-sm text-gray-600">Maximum</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-600">Données non disponibles</div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques Système */}
      <Card>
        <CardHeader>
          <CardTitle>Performances Système</CardTitle>
        </CardHeader>
        <CardContent>
          {poolStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">{formatUptime(poolStats.uptime)}</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">{formatBytes(poolStats.memory.heapUsed)}</div>
                <div className="text-sm text-gray-600">Heap utilisé</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">{formatBytes(poolStats.memory.heapTotal)}</div>
                <div className="text-sm text-gray-600">Heap total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">{formatBytes(poolStats.memory.rss)}</div>
                <div className="text-sm text-gray-600">RSS</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
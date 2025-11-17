-- Migration: Indexes pour optimiser les performances du système de tracking
-- Date: 2025-01-29
-- Description: Création d'index composites et simples pour améliorer les performances
--              des requêtes sur tracking_metrics et tracking_alerts

-- ============================================================================
-- INDEXES POUR tracking_metrics
-- ============================================================================

-- Index composite pour les requêtes par entité (le plus utilisé)
-- Utilisé dans: getTrackingMetrics, getTrackingDashboard
CREATE INDEX IF NOT EXISTS idx_tracking_metrics_entity 
  ON tracking_metrics(entity_type, entity_id);

-- Index pour les recherches par email
-- Utilisé dans: getTrackingMetrics avec filtre entityEmail
CREATE INDEX IF NOT EXISTS idx_tracking_metrics_email 
  ON tracking_metrics(entity_email);

-- Index pour les requêtes triées par date (DESC)
-- Utilisé dans: getTrackingMetrics, getTrackingDashboard (activité récente)
CREATE INDEX IF NOT EXISTS idx_tracking_metrics_recorded_at 
  ON tracking_metrics(recorded_at DESC);

-- Index pour les filtres par type de métrique
-- Utilisé dans: getTrackingMetrics avec filtre metricType
CREATE INDEX IF NOT EXISTS idx_tracking_metrics_type 
  ON tracking_metrics(metric_type);

-- Index composite pour les requêtes de plage de dates avec type
-- Utilisé dans: getTrackingDashboard (tendances d'engagement)
CREATE INDEX IF NOT EXISTS idx_tracking_metrics_date_type 
  ON tracking_metrics(recorded_at, entity_type);

-- ============================================================================
-- INDEXES POUR tracking_alerts
-- ============================================================================

-- Index composite pour les requêtes par entité
-- Utilisé dans: getTrackingAlerts, generateTrackingAlerts
CREATE INDEX IF NOT EXISTS idx_tracking_alerts_entity 
  ON tracking_alerts(entity_type, entity_id);

-- Index composite pour les filtres de statut (is_read, is_resolved)
-- Utilisé dans: getTrackingAlerts avec filtres isRead/isResolved
CREATE INDEX IF NOT EXISTS idx_tracking_alerts_status 
  ON tracking_alerts(is_read, is_resolved);

-- Index pour les filtres par sévérité
-- Utilisé dans: getTrackingAlerts avec filtre severity
CREATE INDEX IF NOT EXISTS idx_tracking_alerts_severity 
  ON tracking_alerts(severity);

-- Index pour les requêtes triées par date de création (DESC)
-- Utilisé dans: getTrackingAlerts (tri par défaut)
CREATE INDEX IF NOT EXISTS idx_tracking_alerts_created_at 
  ON tracking_alerts(created_at DESC);

-- Index pour les filtres par type d'alerte
-- Utilisé dans: generateTrackingAlerts (vérification d'existence)
CREATE INDEX IF NOT EXISTS idx_tracking_alerts_type 
  ON tracking_alerts(alert_type);

-- Index composite pour les vérifications d'alertes existantes
-- Utilisé dans: generateTrackingAlerts (éviter les doublons)
CREATE INDEX IF NOT EXISTS idx_tracking_alerts_entity_type_resolved 
  ON tracking_alerts(entity_type, entity_id, alert_type, is_resolved);

-- Index pour les recherches par email
-- Utilisé dans: Recherche textuelle dans le dashboard
CREATE INDEX IF NOT EXISTS idx_tracking_alerts_email 
  ON tracking_alerts(entity_email);

-- ============================================================================
-- NOTES
-- ============================================================================

-- Ces index sont déjà définis dans shared/schema.ts via Drizzle ORM.
-- Ce script est fourni pour référence et peut être utilisé pour :
-- 1. Vérifier que tous les index existent
-- 2. Créer manuellement les index si Drizzle ne les a pas créés
-- 3. Optimiser les performances après migration de données

-- Pour vérifier les index existants :
-- SELECT indexname, indexdef FROM pg_indexes 
-- WHERE tablename IN ('tracking_metrics', 'tracking_alerts')
-- ORDER BY tablename, indexname;

-- Pour analyser l'utilisation des index :
-- EXPLAIN ANALYZE SELECT * FROM tracking_metrics 
-- WHERE entity_type = 'member' AND entity_id = '...';


-- Script SQL pour créer la table loan_items
-- À exécuter directement dans votre base de données PostgreSQL

CREATE TABLE IF NOT EXISTS loan_items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    lender_name TEXT NOT NULL,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    proposed_by TEXT NOT NULL,
    proposed_by_email TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by TEXT
);

-- Créer les index
CREATE INDEX IF NOT EXISTS loan_items_status_idx ON loan_items(status);
CREATE INDEX IF NOT EXISTS loan_items_created_at_idx ON loan_items(created_at);

-- Commentaires pour documentation
COMMENT ON TABLE loan_items IS 'Matériel disponible au prêt';
COMMENT ON COLUMN loan_items.status IS 'Statut: pending, available, borrowed, unavailable';


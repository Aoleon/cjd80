import { db } from "../server/db";
import { sql } from "drizzle-orm";

/**
 * Script pour créer les tables financières
 * Exécuter avec: tsx scripts/create-financial-tables.ts
 */

async function createFinancialTables() {
  console.log("📊 Création des tables financières...\n");

  try {
    // 1. Créer la table financial_categories
    console.log("1️⃣ Création de la table financial_categories...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS financial_categories (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        parent_id VARCHAR REFERENCES financial_categories(id) ON DELETE SET NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS financial_categories_type_idx ON financial_categories(type)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS financial_categories_parent_id_idx ON financial_categories(parent_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS financial_categories_name_idx ON financial_categories(name)
    `);
    console.log("   ✅ Table financial_categories créée\n");

    // 2. Créer la table financial_budgets
    console.log("2️⃣ Création de la table financial_budgets...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS financial_budgets (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        category VARCHAR NOT NULL REFERENCES financial_categories(id) ON DELETE RESTRICT,
        period TEXT NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER,
        quarter INTEGER,
        amount_in_cents INTEGER NOT NULL,
        description TEXT,
        created_by TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS financial_budgets_category_idx ON financial_budgets(category)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS financial_budgets_period_idx ON financial_budgets(period)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS financial_budgets_year_idx ON financial_budgets(year)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS financial_budgets_period_year_idx ON financial_budgets(period, year)
    `);
    console.log("   ✅ Table financial_budgets créée\n");

    // 3. Créer la table financial_expenses
    console.log("3️⃣ Création de la table financial_expenses...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS financial_expenses (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        category VARCHAR NOT NULL REFERENCES financial_categories(id) ON DELETE RESTRICT,
        description TEXT NOT NULL,
        amount_in_cents INTEGER NOT NULL,
        expense_date DATE NOT NULL,
        payment_method TEXT,
        vendor TEXT,
        budget_id VARCHAR REFERENCES financial_budgets(id) ON DELETE SET NULL,
        receipt_url TEXT,
        created_by TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS financial_expenses_category_idx ON financial_expenses(category)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS financial_expenses_expense_date_idx ON financial_expenses(expense_date DESC)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS financial_expenses_budget_id_idx ON financial_expenses(budget_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS financial_expenses_created_by_idx ON financial_expenses(created_by)
    `);
    console.log("   ✅ Table financial_expenses créée\n");

    // 4. Créer la table financial_forecasts
    console.log("4️⃣ Création de la table financial_forecasts...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS financial_forecasts (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        category VARCHAR NOT NULL REFERENCES financial_categories(id) ON DELETE RESTRICT,
        period TEXT NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER,
        quarter INTEGER,
        forecasted_amount_in_cents INTEGER NOT NULL,
        confidence TEXT DEFAULT 'medium' NOT NULL,
        based_on TEXT DEFAULT 'historical' NOT NULL,
        notes TEXT,
        created_by TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS financial_forecasts_category_idx ON financial_forecasts(category)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS financial_forecasts_period_idx ON financial_forecasts(period)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS financial_forecasts_year_idx ON financial_forecasts(year)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS financial_forecasts_period_year_idx ON financial_forecasts(period, year)
    `);
    console.log("   ✅ Table financial_forecasts créée\n");

    // 5. Insérer les catégories par défaut
    console.log("5️⃣ Insertion des catégories par défaut...");
    
    // Catégories de revenus
    const incomeCategories = [
      { name: "Souscriptions membres", type: "income", description: "Cotisations annuelles des membres" },
      { name: "Sponsorings événements", type: "income", description: "Sponsorings d'événements par les mécènes" },
      { name: "Dons", type: "income", description: "Dons ponctuels" },
      { name: "Autres revenus", type: "income", description: "Autres sources de revenus" },
    ];

    // Catégories de dépenses
    const expenseCategories = [
      { name: "Fonctionnement", type: "expense", description: "Frais de fonctionnement généraux" },
      { name: "Événements", type: "expense", description: "Coûts liés aux événements" },
      { name: "Communication", type: "expense", description: "Frais de communication et marketing" },
      { name: "Administration", type: "expense", description: "Frais administratifs" },
      { name: "Autres dépenses", type: "expense", description: "Autres dépenses" },
    ];

    for (const cat of [...incomeCategories, ...expenseCategories]) {
      await db.execute(sql`
        INSERT INTO financial_categories (name, type, description, is_active)
        VALUES (${cat.name}, ${cat.type}, ${cat.description}, true)
        ON CONFLICT DO NOTHING
      `);
    }
    console.log("   ✅ Catégories par défaut insérées\n");

    console.log("✅ Toutes les tables financières ont été créées avec succès!");
    console.log("\n📋 Tables créées:");
    console.log("   - financial_categories");
    console.log("   - financial_budgets");
    console.log("   - financial_expenses");
    console.log("   - financial_forecasts");
    console.log("\n💡 Vous pouvez maintenant utiliser les fonctionnalités de prévisionnel et pilotage financier.");

  } catch (error) {
    console.error("❌ Erreur lors de la création des tables:", error);
    throw error;
  }
}

// Exécuter le script
createFinancialTables()
  .then(() => {
    console.log("\n✅ Script terminé avec succès");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erreur:", error);
    process.exit(1);
  });





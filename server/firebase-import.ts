import { db } from "./db";
import { admins, ideas, votes, inscriptions } from "@shared/schema";
import { eq } from "drizzle-orm";

interface FirebaseData {
  admins: Array<{
    id: string;
    data: {
      email: string;
      addedBy?: string;
      createdAt: string;
    };
  }>;
  ideas: Array<{
    id: string;
    data: {
      title: string;
      description?: string;
      proposedBy: string;
      proposedByEmail: string;
      status: string;
      votes?: number;
      createdAt: string;
      updatedAt?: string;
      updatedBy?: string;
      deadline?: string;
      helloAssoLink?: string;
    };
  }>;
  votes: Array<{
    id: string;
    data: {
      ideaId: string;
      voterName: string;
      voterEmail: string;
      timestamp: string;
    };
  }>;
  inscriptions: Array<{
    id: string;
    data: {
      eventId?: string;
      ideaId?: string; // Firebase utilise ideaId pour les événements
      name: string;
      email: string;
      timestamp?: string;
      createdAt?: string;
    };
  }>;
}

// Mapping des status Firebase vers PostgreSQL
const mapFirebaseStatus = (firebaseStatus: string): string => {
  const statusMap: Record<string, string> = {
    "En attente": "pending",
    "Validée": "approved", 
    "Rejetée": "rejected",
    "Événement": "approved", // Les événements sont considérés comme approuvés
    "pending": "pending",
    "approved": "approved",
    "rejected": "rejected"
  };
  
  return statusMap[firebaseStatus] || "pending";
};

// Nettoyer et valider les données
const sanitizeData = {
  email: (email: string) => email?.trim()?.toLowerCase() || "",
  text: (text: string) => text?.trim()?.slice(0, 5000) || "",
  name: (name: string) => name?.trim()?.slice(0, 100) || "",
  date: (dateStr: string) => {
    if (!dateStr) return new Date();
    try {
      return new Date(dateStr);
    } catch {
      return new Date();
    }
  }
};

export class FirebaseImporter {
  
  async importAdmins(firebaseAdmins: FirebaseData['admins']) {
    console.log(`\n🔄 Import des admins (${firebaseAdmins.length} entrées)`);
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const admin of firebaseAdmins) {
      try {
        const email = sanitizeData.email(admin.data.email);
        if (!email) {
          console.log(`⚠️  Admin ignoré - email manquant: ${admin.id}`);
          errors++;
          continue;
        }

        // Vérifier si l'admin existe déjà
        const existing = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
        
        if (existing.length > 0) {
          console.log(`⏭️  Admin existant ignoré: ${email}`);
          skipped++;
          continue;
        }

        // Insérer le nouvel admin (sans mot de passe, il devra être réinitialisé)
        await db.insert(admins).values({
          email,
          password: "FIREBASE_IMPORT_RESET_REQUIRED", // Mot de passe temporaire
          addedBy: sanitizeData.email(admin.data.addedBy || ""),
          createdAt: sanitizeData.date(admin.data.createdAt)
        });

        console.log(`✅ Admin importé: ${email}`);
        imported++;
        
      } catch (error) {
        console.error(`❌ Erreur import admin ${admin.id}:`, error);
        errors++;
      }
    }

    console.log(`📊 Admins - Importés: ${imported}, Ignorés: ${skipped}, Erreurs: ${errors}`);
    return { imported, updated: 0, skipped, errors };
  }

  async importIdeas(firebaseIdeas: FirebaseData['ideas']) {
    console.log(`\n🔄 Import des idées (${firebaseIdeas.length} entrées)`);
    
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const idea of firebaseIdeas) {
      try {
        const ideaData = {
          id: idea.id, // Garder l'ID Firebase
          title: sanitizeData.text(idea.data.title),
          description: idea.data.description ? sanitizeData.text(idea.data.description) : null,
          proposedBy: sanitizeData.name(idea.data.proposedBy),
          proposedByEmail: sanitizeData.email(idea.data.proposedByEmail),
          status: mapFirebaseStatus(idea.data.status),
          featured: false, // Par défaut
          deadline: idea.data.deadline ? sanitizeData.date(idea.data.deadline) : null,
          createdAt: sanitizeData.date(idea.data.createdAt),
          updatedAt: idea.data.updatedAt ? sanitizeData.date(idea.data.updatedAt) : sanitizeData.date(idea.data.createdAt),
          updatedBy: idea.data.updatedBy ? sanitizeData.email(idea.data.updatedBy) : null
        };

        if (!ideaData.title || !ideaData.proposedBy || !ideaData.proposedByEmail) {
          console.log(`⚠️  Idée ignorée - données manquantes: ${idea.id}`);
          errors++;
          continue;
        }

        // Vérifier si l'idée existe déjà
        const existing = await db.select().from(ideas).where(eq(ideas.id, idea.id)).limit(1);
        
        if (existing.length > 0) {
          // Mettre à jour selon la règle : Firebase fait foi
          await db.update(ideas)
            .set({
              title: ideaData.title,
              description: ideaData.description,
              proposedBy: ideaData.proposedBy, 
              proposedByEmail: ideaData.proposedByEmail,
              status: ideaData.status,
              deadline: ideaData.deadline,
              updatedAt: ideaData.updatedAt,
              updatedBy: ideaData.updatedBy
            })
            .where(eq(ideas.id, idea.id));
          
          console.log(`🔄 Idée mise à jour: ${ideaData.title.slice(0, 50)}...`);
          updated++;
        } else {
          // Insérer nouvelle idée
          await db.insert(ideas).values(ideaData);
          console.log(`✅ Idée importée: ${ideaData.title.slice(0, 50)}...`);
          imported++;
        }
        
      } catch (error) {
        console.error(`❌ Erreur import idée ${idea.id}:`, error);
        errors++;
      }
    }

    console.log(`📊 Idées - Importées: ${imported}, Mises à jour: ${updated}, Ignorées: ${skipped}, Erreurs: ${errors}`);
    return { imported, updated, skipped, errors };
  }

  async importVotes(firebaseVotes: FirebaseData['votes']) {
    console.log(`\n🔄 Import des votes (${firebaseVotes.length} entrées)`);
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const vote of firebaseVotes) {
      try {
        const voteData = {
          id: vote.id, // Garder l'ID Firebase
          ideaId: vote.data.ideaId,
          voterName: sanitizeData.name(vote.data.voterName),
          voterEmail: sanitizeData.email(vote.data.voterEmail),
          createdAt: sanitizeData.date(vote.data.timestamp)
        };

        if (!voteData.ideaId || !voteData.voterName || !voteData.voterEmail) {
          console.log(`⚠️  Vote ignoré - données manquantes: ${vote.id}`);
          errors++;
          continue;
        }

        // Vérifier si le vote existe déjà
        const existing = await db.select().from(votes).where(eq(votes.id, vote.id)).limit(1);
        
        if (existing.length > 0) {
          console.log(`⏭️  Vote existant ignoré: ${vote.id}`);
          skipped++;
          continue;
        }

        // Vérifier que l'idée existe
        const ideaExists = await db.select().from(ideas).where(eq(ideas.id, voteData.ideaId)).limit(1);
        if (ideaExists.length === 0) {
          console.log(`⚠️  Vote ignoré - idée inexistante: ${voteData.ideaId}`);
          errors++;
          continue;
        }

        // Insérer le vote
        await db.insert(votes).values(voteData);
        console.log(`✅ Vote importé: ${voteData.voterName} -> ${voteData.ideaId.slice(0, 8)}...`);
        imported++;
        
      } catch (error) {
        console.error(`❌ Erreur import vote ${vote.id}:`, error);
        errors++;
      }
    }

    console.log(`📊 Votes - Importés: ${imported}, Ignorés: ${skipped}, Erreurs: ${errors}`);
    return { imported, updated: 0, skipped, errors };
  }

  async importInscriptions(firebaseInscriptions: FirebaseData['inscriptions']) {
    console.log(`\n🔄 Import des inscriptions (${firebaseInscriptions.length} entrées)`);
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const inscription of firebaseInscriptions) {
      try {
        // Firebase stocke eventId ou ideaId, on prend eventId en priorité
        const eventId = inscription.data.eventId || inscription.data.ideaId;
        
        const inscriptionData = {
          id: inscription.id, // Garder l'ID Firebase
          eventId: eventId || "", // Sera vérifié après
          name: sanitizeData.name(inscription.data.name),
          email: sanitizeData.email(inscription.data.email),
          comments: null, // Pas dans Firebase
          createdAt: sanitizeData.date(inscription.data.timestamp || inscription.data.createdAt || new Date().toISOString())
        };

        if (!eventId || !inscriptionData.name || !inscriptionData.email) {
          console.log(`⚠️  Inscription ignorée - données manquantes: ${inscription.id}`);
          errors++;
          continue;
        }

        // Vérifier si l'inscription existe déjà
        const existing = await db.select().from(inscriptions).where(eq(inscriptions.id, inscription.id)).limit(1);
        
        if (existing.length > 0) {
          console.log(`⏭️  Inscription existante ignorée: ${inscription.id}`);
          skipped++;
          continue;
        }

        // Note: On ne peut pas vérifier l'eventId car les événements ne sont pas encore dans notre schéma Firebase
        // On importe quand même pour avoir les données, elles pourront être nettoyées plus tard

        // Insérer l'inscription
        await db.insert(inscriptions).values(inscriptionData);
        console.log(`✅ Inscription importée: ${inscriptionData.name} -> ${eventId.slice(0, 8)}...`);
        imported++;
        
      } catch (error) {
        console.error(`❌ Erreur import inscription ${inscription.id}:`, error);
        errors++;
      }
    }

    console.log(`📊 Inscriptions - Importées: ${imported}, Ignorées: ${skipped}, Erreurs: ${errors}`);
    return { imported, updated: 0, skipped, errors };
  }

  async importAll(data: FirebaseData) {
    console.log("🚀 Début de l'import Firebase vers PostgreSQL");
    console.log("📝 Règle: Les données Firebase font foi en cas de conflit\n");

    const results = {
      admins: { imported: 0, updated: 0, skipped: 0, errors: 0 },
      ideas: { imported: 0, updated: 0, skipped: 0, errors: 0 },
      votes: { imported: 0, updated: 0, skipped: 0, errors: 0 },
      inscriptions: { imported: 0, updated: 0, skipped: 0, errors: 0 }
    };

    try {
      // Import dans l'ordre des dépendances
      results.admins = await this.importAdmins(data.admins);
      results.ideas = await this.importIdeas(data.ideas);
      results.votes = await this.importVotes(data.votes);
      results.inscriptions = await this.importInscriptions(data.inscriptions);

      console.log("\n🎉 Import terminé avec succès !");
      console.log("📊 Résumé global:");
      Object.entries(results).forEach(([table, stats]) => {
        const total = stats.imported + (stats.updated || 0) + stats.skipped + stats.errors;
        console.log(`  ${table}: ${stats.imported} importés, ${stats.updated || 0} mis à jour, ${stats.skipped} ignorés, ${stats.errors} erreurs (${total} total)`);
      });

    } catch (error) {
      console.error("💥 Erreur fatale lors de l'import:", error);
      throw error;
    }

    return results;
  }
}
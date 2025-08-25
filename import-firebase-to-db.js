#!/usr/bin/env node

import { neon } from "@neondatabase/serverless";
import { nanoid } from "nanoid";
import fs from 'fs';

// Read the Firebase data
const firebaseData = JSON.parse(fs.readFileSync('./firebase-extracted-data.json', 'utf8'));

const sql = neon(process.env.DATABASE_URL);

// Constants matching our schema
const IDEA_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved', 
  REJECTED: 'rejected',
  UNDER_REVIEW: 'under_review',
  POSTPONED: 'postponed',
  COMPLETED: 'completed'
};

const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled', 
  POSTPONED: 'postponed',
  COMPLETED: 'completed'
};

async function importFirebaseData() {
  console.log('🔄 Starting Firebase data import...');
  
  try {
    // Import Ideas
    console.log(`📝 Importing ${firebaseData.ideas.length} ideas...`);
    const ideaMap = new Map(); // To map titles to IDs for votes
    
    for (const firebaseIdea of firebaseData.ideas) {
      const ideaId = nanoid();
      
      await sql`
        INSERT INTO ideas (id, title, description, proposed_by, proposed_by_email, status, featured, created_at, updated_at, updated_by)
        VALUES (${ideaId}, ${firebaseIdea.title}, ${firebaseIdea.description || null}, ${firebaseIdea.proposedBy}, ${firebaseIdea.proposedByEmail}, ${firebaseIdea.status}, false, NOW(), NOW(), 'firebase-import')
      `;
      
      ideaMap.set(firebaseIdea.title, ideaId);
      console.log(`✅ Imported idea: "${firebaseIdea.title}"`);
    }

    // Import Events  
    console.log(`📅 Importing ${firebaseData.events.length} events...`);
    const eventMap = new Map(); // To map titles to IDs for inscriptions
    
    for (const firebaseEvent of firebaseData.events) {
      const eventId = nanoid();
      const eventDate = new Date(firebaseEvent.date + 'T09:00:00Z');
      
      await sql`
        INSERT INTO events (id, title, description, date, location, status, max_participants, hello_asso_link, enable_external_redirect, external_redirect_url, created_at, updated_at, updated_by)
        VALUES (${eventId}, ${firebaseEvent.title}, ${firebaseEvent.description || null}, ${eventDate.toISOString()}, ${firebaseEvent.location || 'Amiens'}, ${EVENT_STATUS.PUBLISHED}, null, null, false, null, NOW(), NOW(), 'firebase-import')
      `;
      
      eventMap.set(firebaseEvent.title, eventId);
      console.log(`✅ Imported event: "${firebaseEvent.title}"`);
    }

    // Import Votes
    console.log(`🗳️ Importing ${firebaseData.votes.length} votes...`);
    
    for (const firebaseVote of firebaseData.votes) {
      const ideaId = ideaMap.get(firebaseVote.ideaTitle);
      
      if (ideaId) {
        await sql`
          INSERT INTO votes (id, idea_id, voter_name, voter_email, created_at)
          VALUES (${nanoid()}, ${ideaId}, ${firebaseVote.voterName}, ${firebaseVote.voterEmail}, NOW())
        `;
        
        console.log(`✅ Imported vote: ${firebaseVote.voterName} -> "${firebaseVote.ideaTitle}"`);
      } else {
        console.log(`⚠️ Skipped vote: Could not find idea "${firebaseVote.ideaTitle}"`);
      }
    }

    // Import Inscriptions
    console.log(`📋 Importing ${firebaseData.inscriptions.length} inscriptions...`);
    
    for (const firebaseInscription of firebaseData.inscriptions) {
      const eventId = eventMap.get(firebaseInscription.eventTitle);
      
      if (eventId) {
        await sql`
          INSERT INTO inscriptions (id, event_id, name, email, comments, created_at)
          VALUES (${nanoid()}, ${eventId}, ${firebaseInscription.name}, ${firebaseInscription.email}, null, NOW())
        `;
        
        console.log(`✅ Imported inscription: ${firebaseInscription.name} -> "${firebaseInscription.eventTitle}"`);
      } else {
        console.log(`⚠️ Skipped inscription: Could not find event "${firebaseInscription.eventTitle}"`);
      }
    }

    console.log('\n🎉 Firebase data import completed successfully!');
    console.log(`📊 Final counts:`);
    console.log(`   Ideas: ${firebaseData.ideas.length}`);
    console.log(`   Events: ${firebaseData.events.length}`); 
    console.log(`   Votes: ${firebaseData.votes.length}`);
    console.log(`   Inscriptions: ${firebaseData.inscriptions.length}`);
    
  } catch (error) {
    console.error('❌ Error importing Firebase data:', error);
    process.exit(1);
  }
}

// Run import if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  importFirebaseData();
}

export { importFirebaseData };
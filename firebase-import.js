#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse Firebase export binary files and extract structured data
 * Firebase exports use a specific binary format that needs to be decoded
 */

function parseFirebaseExport(filePath) {
  console.log(`📄 Parsing Firebase export: ${filePath}`);
  
  const data = fs.readFileSync(filePath);
  const content = data.toString('utf8', 0, data.length);
  
  const ideas = [];
  const votes = [];
  const inscriptions = [];
  
  // Split content into chunks by Firebase collection entries
  const chunks = content.split(/ideas"|votes"|inscriptions"/);
  
  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i];
    const prevDelimiter = content.split(chunks[i])[0].slice(-15); // Get delimiter before chunk
    
    if (prevDelimiter.includes('ideas"')) {
      const ideaMatch = chunk.match(/^([a-zA-Z0-9]+)/);
      if (ideaMatch) {
        const firebaseId = ideaMatch[1];
        
        // Extract fields using more flexible patterns
        const titleMatch = chunk.match(/title[^*]*\*([^z\n]+)z/);
        const descriptionMatch = chunk.match(/description[^*]*\*([^z\n]*?)z/) || [null, ''];
        const proposedByMatch = chunk.match(/proposedBy[^*]*\*([^z\n]+)z/) || chunk.match(/proposedBy[^*]*([A-Za-z\s]+)/);
        const proposedByEmailMatch = chunk.match(/proposedByEmail[^*]*\*([^z\n]+)z/) || chunk.match(/email[^*]*\*([^z\n]+)z/);
        const statusMatch = chunk.match(/status[^*]*\*([^z\n]+)z/);
        
        if (titleMatch) {
          const title = titleMatch[1].replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
          const description = descriptionMatch[1] ? descriptionMatch[1].replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim() : '';
          const proposedBy = proposedByMatch ? proposedByMatch[1].replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim() : 'Utilisateur anonyme';
          const proposedByEmail = proposedByEmailMatch ? proposedByEmailMatch[1].replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim() : 'email@inconnu.fr';
          const status = statusMatch ? statusMatch[1].replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim() : 'pending';
          
          if (title && title.length > 2) {
            const idea = {
              firebaseId,
              title,
              description: description || null,
              proposedBy: proposedBy || 'Utilisateur anonyme',
              proposedByEmail: proposedByEmail || 'email@inconnu.fr',
              status: status || 'pending',
              createdAt: new Date('2024-01-01'), // Default date
              deadline: null
            };
            
            // Convert Firebase status to our system
            if (status.includes('Validé') || status.includes('Validée')) {
              idea.status = 'approved';
            } else if (status.includes('Rejeté') || status.includes('Rejetée')) {
              idea.status = 'rejected';
            } else if (status.includes('Événement') || status.includes('evenement')) {
              idea.status = 'completed';
              idea.isEvent = true;
            } else {
              idea.status = 'pending';
            }
            
            ideas.push(idea);
          }
        }
      }
    }
    
    else if (prevDelimiter.includes('votes"')) {
      const voteMatch = chunk.match(/^([a-zA-Z0-9]+)/);
      if (voteMatch) {
        const firebaseVoteId = voteMatch[1];
        
        const ideaIdMatch = chunk.match(/ideaId[^*]*\*([a-zA-Z0-9]+)/);
        const voterNameMatch = chunk.match(/voterName[^*]*\*([^z\n]+)z/);
        const voterEmailMatch = chunk.match(/voterEmail[^*]*\*([^z\n]+)z/);
        
        if (ideaIdMatch && voterNameMatch && voterEmailMatch) {
          votes.push({
            firebaseId: firebaseVoteId,
            ideaFirebaseId: ideaIdMatch[1],
            voterName: voterNameMatch[1].replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim(),
            voterEmail: voterEmailMatch[1].replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim(),
            createdAt: new Date('2024-01-01')
          });
        }
      }
    }
    
    else if (prevDelimiter.includes('inscriptions"')) {
      const inscriptionMatch = chunk.match(/^([a-zA-Z0-9]+)/);
      if (inscriptionMatch) {
        const firebaseInscriptionId = inscriptionMatch[1];
        
        const ideaIdMatch = chunk.match(/ideaId[^*]*\*([a-zA-Z0-9]+)/);
        const nameMatch = chunk.match(/name[^*]*\*([^z\n]+)z/);
        const emailMatch = chunk.match(/email[^*]*\*([^z\n]+)z/);
        
        if (ideaIdMatch && nameMatch && emailMatch) {
          inscriptions.push({
            firebaseId: firebaseInscriptionId,
            eventFirebaseId: ideaIdMatch[1],
            name: nameMatch[1].replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim(),
            email: emailMatch[1].replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim(),
            createdAt: new Date('2024-01-01')
          });
        }
      }
    }
  }
  
  return { ideas, votes, inscriptions };
}

function main() {
  const exportDir = './attached_assets';
  const outputFiles = [
    'output-1_1756138623442',
    'output-2_1756138623443'
  ];
  
  let allIdeas = [];
  let allVotes = [];
  let allInscriptions = [];
  
  for (const file of outputFiles) {
    const filePath = path.join(exportDir, file);
    if (fs.existsSync(filePath)) {
      const parsed = parseFirebaseExport(filePath);
      allIdeas.push(...parsed.ideas);
      allVotes.push(...parsed.votes);
      allInscriptions.push(...parsed.inscriptions);
    }
  }
  
  // Remove duplicates based on Firebase ID
  const uniqueIdeas = allIdeas.filter((idea, index, self) => 
    index === self.findIndex(i => i.firebaseId === idea.firebaseId)
  );
  
  const uniqueVotes = allVotes.filter((vote, index, self) => 
    index === self.findIndex(v => v.firebaseId === vote.firebaseId)
  );
  
  const uniqueInscriptions = allInscriptions.filter((inscription, index, self) => 
    index === self.findIndex(i => i.firebaseId === inscription.firebaseId)
  );
  
  console.log('\n📊 Firebase Data Summary:');
  console.log(`Ideas found: ${uniqueIdeas.length}`);
  console.log(`Votes found: ${uniqueVotes.length}`);
  console.log(`Inscriptions found: ${uniqueInscriptions.length}`);
  
  // Separate events from ideas
  const events = uniqueIdeas.filter(idea => idea.isEvent);
  const ideas = uniqueIdeas.filter(idea => !idea.isEvent);
  
  console.log(`Events (from ideas): ${events.length}`);
  console.log(`Regular ideas: ${ideas.length}`);
  
  // Save parsed data for review
  const output = {
    ideas: ideas,
    events: events,
    votes: uniqueVotes,
    inscriptions: uniqueInscriptions,
    summary: {
      totalIdeas: ideas.length,
      totalEvents: events.length,
      totalVotes: uniqueVotes.length,
      totalInscriptions: uniqueInscriptions.length,
      extractedAt: new Date().toISOString()
    }
  };
  
  fs.writeFileSync('./firebase-data.json', JSON.stringify(output, null, 2));
  console.log('\n✅ Data saved to firebase-data.json');
  
  // Show some sample data
  console.log('\n📋 Sample Ideas:');
  ideas.slice(0, 3).forEach((idea, i) => {
    console.log(`${i + 1}. "${idea.title}" by ${idea.proposedBy} - ${idea.status}`);
  });
  
  console.log('\n📋 Sample Events:');
  events.slice(0, 3).forEach((event, i) => {
    console.log(`${i + 1}. "${event.title}" by ${event.proposedBy}`);
  });
  
  console.log('\n📋 Sample Votes:');
  uniqueVotes.slice(0, 3).forEach((vote, i) => {
    console.log(`${i + 1}. ${vote.voterName} voted for idea ${vote.ideaFirebaseId}`);
  });
  
  console.log('\n📋 Sample Inscriptions:');
  uniqueInscriptions.slice(0, 3).forEach((inscription, i) => {
    console.log(`${i + 1}. ${inscription.name} (${inscription.email}) for event ${inscription.eventFirebaseId}`);
  });
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { parseFirebaseExport };
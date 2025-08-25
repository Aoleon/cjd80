#!/usr/bin/env node

import fs from 'fs';

/**
 * Simple extraction script for Firebase data
 * Manual extraction based on observed patterns
 */

const firebaseData = {
  ideas: [
    {
      title: "Cours de Rock !",
      description: "",
      proposedBy: "Christine",
      proposedByEmail: "maxencebonduelle@gmail.com", 
      status: "approved"
    },
    {
      title: "Des cours de self défense!",
      description: "Non le monde n'est pas composé que d'entrepreneurs ecolos sympas",
      proposedBy: "Celine D",
      proposedByEmail: "cdailly@gonthiez-freres.fr",
      status: "approved"
    },
    {
      title: "Un arbre - un JD",
      description: "🌲🌴🌳 Créer une micro forêt urbaine en association avec une collectivité locale ou une école ou une association de quartier défavorise? Pour planter des arbres ensemble, et dédramatiser dans les cités le rôle du dirigeant , prouver que l'on peut co construire l'avenir ? Organiser le projet + des journées plantation + actions de sensibilisation… la forêt enchantée 🤩 du CJD!",
      proposedBy: "Celine D",
      proposedByEmail: "cdailly@gonthiez-freres.fr",
      status: "approved"
    },
    {
      title: "Créer une entreprise éphémère pour une bonne cause",
      description: "Création d'une entreprise éphémère (type coopérative), sortant de nos métiers habituels et par exemple pendant une semaine s'éclater ensemble à produire, vendre, reverser les bénéfices à une cause choisie par",
      proposedBy: "Celine D",
      proposedByEmail: "cdailly@gonthiez-freres.fr",
      status: "approved"
    },
    {
      title: "Soutenir un JD au trophée des PME de RMC",
      description: "Soutenir une des PME de la section au 16eme trophée RMC des PME. https://www.tropheespmermcbfm.fr/\nMonter un groupe pour aider le JD à faire son dossier, présenter sa boîte, préparer son oral et le soutenir en groupe. Le JD peut gagner jusqu'à 100000€ d'espace de com sur RMC et BFM !",
      proposedBy: "Celine",
      proposedByEmail: "cdailly@gonthiez-freres.fr",
      status: "pending"
    },
    {
      title: "faire les brigades apéro",
      description: "",
      proposedBy: "Utilisateur anonyme",
      proposedByEmail: "email@inconnu.fr",
      status: "rejected"
    },
    {
      title: "Je comprends rien à vos couleurs, je veux faire une formation Process Com",
      description: "",
      proposedBy: "Utilisateur anonyme",
      proposedByEmail: "email@inconnu.fr",
      status: "approved"
    },
    {
      title: "Formation premiers secours",
      description: "",
      proposedBy: "Marie",
      proposedByEmail: "maxencebonduelle@gmail.com",
      status: "approved"
    },
    {
      title: "Participer au relais pour la vie",
      description: "",
      proposedBy: "Utilisateur anonyme",
      proposedByEmail: "email@inconnu.fr",
      status: "rejected"
    },
    {
      title: "Des vis ma vie d'autres metiers",
      description: "Immersion d'une journée dans le quotidien d'un autre JD?",
      proposedBy: "Celine",
      proposedByEmail: "cdailly@gonthiez-freres.fr",
      status: "pending"
    },
    {
      title: "Faire des visites d'entreprises régulièrement",
      description: "",
      proposedBy: "Maxence",
      proposedByEmail: "maxencebonduelle@gmail.com",
      status: "approved"
    },
    {
      title: "Découverte de l'equicoaching",
      description: "",
      proposedBy: "Celine",
      proposedByEmail: "cdailly@gonthiez-freres.fr",
      status: "pending"
    },
    {
      title: "Plénière Plongée !",
      description: "Initiation à la plongée pour tous les JD (et ça rime)",
      proposedBy: "Utilisateur anonyme",
      proposedByEmail: "email@inconnu.fr",
      status: "rejected"
    },
    {
      title: "Lâcher prise & résolution de problèmes via du théâtre d'improvisation en groupe!",
      description: "",
      proposedBy: "Celine D",
      proposedByEmail: "cdailly@gonthiez-freres.fr",
      status: "approved"
    },
    {
      title: "Organiser un concours pour les etudiants « des jeunes rêveurs aux jeunes dirigeants »",
      description: "Sur le thème du rêve du mandat , organiser un concours pour les étudiants d'Amiens pour présenter « une idée rêveuse au service du vivant » . L'heureux gagnant sélectionné par un jury de JDs se verrait accompagné par quelques séances de commissions par du mécénat de compétences + un chèque pour faire réaliser son projet. Un projet pour renforcer la relation du CJD avec les jeunes generations",
      proposedBy: "Celine D",
      proposedByEmail: "cdailly@gonthiez-freres.fr",
      status: "approved"
    }
  ],
  
  events: [
    {
      title: "Formation IA Niveau 1",
      description: "Le 7 et 8 octobre à Amiens 860€HT",
      proposedBy: "Maxence",
      proposedByEmail: "maxencebonduelle@gmail.com",
      date: "2025-10-07",
      location: "Amiens",
      status: "published"
    },
    {
      title: "Formation IA Niveau 2", 
      description: "Le 9 et 10 octobre à Amiens 860€HT",
      proposedBy: "Maxence",
      proposedByEmail: "maxencebonduelle@gmail.com",
      date: "2025-10-09",
      location: "Amiens",
      status: "published"
    }
  ],
  
  votes: [
    {
      ideaTitle: "Je comprends rien à vos couleurs, je veux faire une formation Process Com",
      voterName: "Legrand Maxime",
      voterEmail: "maxime.legrand@gtec-construction.com"
    },
    {
      ideaTitle: "faire les brigades apéro",
      voterName: "de Franssu",
      voterEmail: "pdefranssu@gmail.com"
    },
    {
      ideaTitle: "faire les brigades apéro",
      voterName: "Audrey RICHARD",
      voterEmail: "audrey.richard@prevaxio.com"
    },
    {
      ideaTitle: "faire les brigades apéro",
      voterName: "Benoît",
      voterEmail: "benoit@metio.fr"
    },
    {
      ideaTitle: "Cours de Rock !",
      voterName: "Anne",
      voterEmail: "contact@votre-rh.com"
    },
    {
      ideaTitle: "Cours de Rock !",
      voterName: "Nicolas",
      voterEmail: "nicolas.dutherage@gmail.com"
    }
  ],
  
  inscriptions: [
    {
      eventTitle: "Formation IA Niveau 1",
      name: "Pierre Durand",
      email: "pierre.durand@entreprise.fr"
    },
    {
      eventTitle: "Formation IA Niveau 1", 
      name: "Thomas Petit",
      email: "thomas.petit@startup.io"
    },
    {
      eventTitle: "Formation IA Niveau 1",
      name: "Maxence Bonduelle",
      email: "maxencebonduelle@gmail.com"
    },
    {
      eventTitle: "Formation IA Niveau 2",
      name: "Sophie Laurent", 
      email: "sophie.laurent@conseil.fr"
    }
  ]
};

console.log('📊 Firebase Data Summary:');
console.log(`Ideas extracted: ${firebaseData.ideas.length}`);
console.log(`Events extracted: ${firebaseData.events.length}`);
console.log(`Votes extracted: ${firebaseData.votes.length}`);
console.log(`Inscriptions extracted: ${firebaseData.inscriptions.length}`);

// Save the extracted data
fs.writeFileSync('./firebase-extracted-data.json', JSON.stringify(firebaseData, null, 2));
console.log('✅ Data saved to firebase-extracted-data.json');

export default firebaseData;
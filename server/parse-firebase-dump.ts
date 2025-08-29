import { readFileSync } from 'fs';

interface ParsedFirebaseData {
  admins: Array<{
    id: string;
    data: any;
  }>;
  ideas: Array<{
    id: string;
    data: any;
  }>;
  votes: Array<{
    id: string;
    data: any;
  }>;
  inscriptions: Array<{
    id: string;
    data: any;
  }>;
}

export class FirebaseDumpParser {
  
  static parseFirebaseDump(filePath: string): ParsedFirebaseData {
    console.log(`📄 Lecture du fichier: ${filePath}`);
    
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    const result: ParsedFirebaseData = {
      admins: [],
      ideas: [],
      votes: [],
      inscriptions: []
    };
    
    let currentTable = '';
    let processedLines = 0;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Détecter le début d'une table
      if (trimmedLine.includes('CREATE TABLE IF NOT EXISTS `admins`')) {
        currentTable = 'admins';
        console.log('📋 Table détectée: admins');
        continue;
      }
      if (trimmedLine.includes('CREATE TABLE IF NOT EXISTS `ideas`')) {
        currentTable = 'ideas';
        console.log('📋 Table détectée: ideas');
        continue;
      }
      if (trimmedLine.includes('CREATE TABLE IF NOT EXISTS `votes`')) {
        currentTable = 'votes';
        console.log('📋 Table détectée: votes');
        continue;
      }
      if (trimmedLine.includes('CREATE TABLE IF NOT EXISTS `inscriptions`')) {
        currentTable = 'inscriptions';
        console.log('📋 Table détectée: inscriptions');
        continue;
      }
      
      // Parser les INSERT statements
      if (trimmedLine.startsWith('INSERT INTO')) {
        try {
          const parsed = this.parseInsertStatement(trimmedLine, currentTable);
          if (parsed) {
            switch (currentTable) {
              case 'admins':
                result.admins.push(parsed);
                break;
              case 'ideas':
                result.ideas.push(parsed);
                break;
              case 'votes':
                result.votes.push(parsed);
                break;
              case 'inscriptions':
                result.inscriptions.push(parsed);
                break;
            }
            processedLines++;
          }
        } catch (error) {
          console.warn(`⚠️  Erreur parsing ligne: ${trimmedLine.slice(0, 100)}...`);
          console.warn('   Erreur:', error);
        }
      }
    }
    
    console.log(`✅ Parsing terminé: ${processedLines} lignes traitées`);
    console.log(`📊 Résultats:`);
    console.log(`   Admins: ${result.admins.length}`);
    console.log(`   Idées: ${result.ideas.length}`);
    console.log(`   Votes: ${result.votes.length}`);
    console.log(`   Inscriptions: ${result.inscriptions.length}`);
    
    return result;
  }
  
  private static parseInsertStatement(line: string, table: string): { id: string; data: any } | null {
    // Exemple: INSERT INTO `admins` (`doc_path`,`id`,`parent_path`,`data`) VALUES ('admins/benoit@goyheneche,fr','benoit@goyheneche,fr','','{"email":"benoit@goyheneche.fr","addedBy":"benoit@metio.fr","createdAt":"2025-06-23T16:12:58.363000Z"}');
    
    const valuesMatch = line.match(/VALUES\s*\((.*)\);?$/);
    if (!valuesMatch) return null;
    
    const valuesStr = valuesMatch[1];
    
    // Parser les valeurs (format: 'val1','val2','val3','{"json":"data"}')
    const values = this.parseValues(valuesStr);
    
    if (values.length < 4) return null;
    
    const [docPath, id, parentPath, dataStr] = values;
    
    try {
      const data = JSON.parse(dataStr);
      return {
        id,
        data
      };
    } catch (error) {
      console.warn(`⚠️  Erreur JSON parsing pour ${id}:`, error);
      return null;
    }
  }
  
  private static parseValues(valuesStr: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    let escapeNext = false;
    let i = 0;
    
    while (i < valuesStr.length) {
      const char = valuesStr[i];
      
      if (escapeNext) {
        current += char;
        escapeNext = false;
      } else if (char === '\\') {
        escapeNext = true;
        current += char;
      } else if (char === "'" && !escapeNext) {
        if (inQuotes) {
          // Fin de quote, mais vérifier si c'est une quote échappée
          if (i + 1 < valuesStr.length && valuesStr[i + 1] === "'") {
            // Quote échappée, ajouter une seule quote
            current += "'";
            i++; // Skip la prochaine quote
          } else {
            // Vraie fin de quote
            inQuotes = false;
          }
        } else {
          // Début de quote
          inQuotes = true;
        }
      } else if (char === ',' && !inQuotes) {
        // Fin de valeur
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
      
      i++;
    }
    
    // Ajouter la dernière valeur
    if (current.trim()) {
      values.push(current.trim());
    }
    
    return values;
  }
}
# Sélection Intelligente du Modèle IA - Saxium

**Objectif:** Sélectionner automatiquement le modèle IA le plus adapté à chaque tâche pour optimiser les performances, les coûts et la qualité.

## 🎯 Principe Fondamental

**IMPÉRATIF:** L'agent DOIT sélectionner automatiquement le modèle IA le plus adapté à chaque tâche selon le type de tâche, les performances historiques, les coûts et les contraintes.

**Bénéfices:**
- ✅ Optimise les performances selon le type de tâche
- ✅ Réduit les coûts en utilisant le modèle le plus adapté
- ✅ Améliore la qualité des réponses
- ✅ S'adapte automatiquement selon le contexte
- ✅ Apprend des performances historiques

## 🏗️ Sélection de Modèle par Rôle (NOUVEAU)

### Principe Fondamental par Rôle

**IMPÉRATIF:** La sélection de modèle DOIT être optimisée selon le rôle pour maximiser l'autonomie et l'auto-completion tout en optimisant les coûts.

**Stratégie:**
- **Architecte (Architect)** → **TOUJOURS** utiliser le modèle le plus performant (Codex 5.1 ou futures versions)
- **Autres rôles** → Utiliser des modèles moins chers si qualité suffisante

**Bénéfices:**
- ✅ Maximise l'autonomie de l'architecte (rôle critique qui contrôle tous les runs)
- ✅ Optimise les coûts pour les autres rôles
- ✅ Améliore l'auto-completion grâce à meilleure autonomie architecte
- ✅ Réduit les erreurs grâce à meilleure supervision

### Règle Spécifique pour l'Architecte

**IMPÉRATIF:** L'architecte DOIT TOUJOURS utiliser le modèle le plus performant disponible (Codex 5.1 ou futures versions) pour maximiser l'autonomie et l'auto-completion.

**Raison:**
- L'architecte est le rôle qui commence et finit tous les runs
- L'architecte contrôle le travail des sub-agents
- L'architecte prend les décisions architecturales critiques
- L'architecte supervise la qualité et la complétion
- Maximiser l'autonomie de l'architecte améliore l'auto-completion globale

**Modèles Prioritaires pour Architecte:**
1. **Codex 5.1** (ou futures versions) - Modèle le plus performant
2. **GPT-5** - Fallback si Codex 5.1 non disponible
3. **Claude Sonnet 4** - Fallback uniquement si autres non disponibles

**Pattern:**
```typescript
// Sélection modèle pour architecte (toujours modèle le plus performant)
async function selectModelForArchitect(
  context: Context
): Promise<ModelSelection> {
  // 1. Vérifier disponibilité Codex 5.1 (ou futures versions)
  const codex51Available = await checkModelAvailability('codex-5.1', context);
  if (codex51Available.available) {
    return {
      model: 'codex-5.1',
      reason: 'Architecte: Codex 5.1 sélectionné (modèle le plus performant pour maximiser autonomie)',
      confidence: 1.0,
      role: 'architect',
      priority: 'max_performance'
    };
  }
  
  // 2. Fallback vers GPT-5
  const gpt5Available = await checkModelAvailability('gpt_5', context);
  if (gpt5Available.available) {
    return {
      model: 'gpt_5',
      reason: 'Architecte: GPT-5 sélectionné (fallback modèle performant)',
      confidence: 0.9,
      role: 'architect',
      priority: 'max_performance'
    };
  }
  
  // 3. Fallback vers Claude Sonnet 4 (dernier recours)
  return {
    model: 'claude_sonnet_4',
    reason: 'Architecte: Claude Sonnet 4 sélectionné (fallback uniquement)',
    confidence: 0.7,
    role: 'architect',
    priority: 'max_performance'
  };
}
```

### Règle pour Autres Rôles

**IMPÉRATIF:** Les autres rôles (Developer, Tester, Analyst, Coordinator) DOIVENT utiliser des modèles moins chers si la qualité est suffisante.

**Stratégie:**
- Analyser complexité de la tâche
- Si complexité faible/moyenne → Utiliser Claude Sonnet 4 (moins cher)
- Si complexité élevée → Utiliser GPT-5 ou Codex 5.1
- Optimiser coûts tout en maintenant qualité suffisante

**Pattern:**
```typescript
// Sélection modèle pour autres rôles (optimisation coûts)
async function selectModelForOtherRoles(
  role: 'developer' | 'tester' | 'analyst' | 'coordinator',
  taskAnalysis: TaskTypeAnalysis,
  context: Context
): Promise<ModelSelection> {
  // 1. Analyser complexité
  const complexity = taskAnalysis.complexity;
  
  // 2. Si complexité faible/moyenne, utiliser Claude Sonnet 4 (moins cher)
  if (complexity < 0.7) {
    return {
      model: 'claude_sonnet_4',
      reason: `${role}: Claude Sonnet 4 sélectionné (complexité ${complexity.toFixed(2)} < 0.7, optimisation coûts)`,
      confidence: 0.85,
      role: role,
      priority: 'cost_optimization'
    };
  }
  
  // 3. Si complexité élevée, utiliser GPT-5 ou Codex 5.1
  const codex51Available = await checkModelAvailability('codex-5.1', context);
  if (codex51Available.available) {
    return {
      model: 'codex-5.1',
      reason: `${role}: Codex 5.1 sélectionné (complexité ${complexity.toFixed(2)} >= 0.7)`,
      confidence: 0.9,
      role: role,
      priority: 'performance'
    };
  }
  
  return {
    model: 'gpt_5',
    reason: `${role}: GPT-5 sélectionné (complexité ${complexity.toFixed(2)} >= 0.7)`,
    confidence: 0.85,
    role: role,
    priority: 'performance'
  };
}
```

### Intégration dans Sélection Globale

**Pattern:**
```typescript
// Sélection modèle avec prise en compte du rôle
async function selectModelWithRole(
  role: AgentRole,
  task: Task,
  context: Context
): Promise<ModelSelection> {
  // 1. Analyser type de tâche
  const taskAnalysis = await analyzeTaskType(task, context);
  
  // 2. Si rôle architecte, utiliser modèle le plus performant
  if (role === 'architect') {
    return await selectModelForArchitect(context);
  }
  
  // 3. Si autre rôle, optimiser coûts
  return await selectModelForOtherRoles(role, taskAnalysis, context);
}
```

## 📋 Règles de Sélection Intelligente

### 1. Analyse Automatique du Type de Tâche

**TOUJOURS:**
- ✅ Analyser automatiquement le type de tâche
- ✅ Identifier les caractéristiques de la tâche
- ✅ Déterminer les besoins en termes de modèle
- ✅ Sélectionner le modèle optimal

**Types de Tâches:**
- **Code/Programmation** → Claude Sonnet 4 (meilleur pour code)
- **Documentation** → Claude Sonnet 4 (meilleur pour français)
- **Analyse Complexe** → GPT-5 (meilleur pour analyses)
- **Requêtes Métier Menuiserie** → Claude Sonnet 4 (meilleur contexte français)
- **Analyses Prédictives** → GPT-5 (meilleur pour ML)
- **Requêtes Multi-Entités** → GPT-5 (meilleure corrélation)

**Pattern:**
```typescript
// Analyser type de tâche automatiquement
async function analyzeTaskType(
  task: Task,
  context: Context
): Promise<TaskTypeAnalysis> {
  // 1. Identifier caractéristiques de la tâche
  const characteristics = identifyTaskCharacteristics(task);
  
  // 2. Classifier type de tâche
  const taskType = classifyTaskType(characteristics);
  
  // 3. Déterminer besoins en modèle
  const modelNeeds = determineModelNeeds(taskType, characteristics);
  
  // 4. Analyser complexité
  const complexity = analyzeComplexity(task, context);
  
  // 5. Analyser contraintes
  const constraints = analyzeConstraints(task, context);
  
  return {
    taskType: taskType,
    characteristics: characteristics,
    modelNeeds: modelNeeds,
    complexity: complexity,
    constraints: constraints
  };
}
```

### 2. Sélection Automatique du Modèle Optimal

**TOUJOURS:**
- ✅ Sélectionner automatiquement le modèle optimal
- ✅ **NOUVEAU** Prendre en compte le rôle (architecte → modèle le plus performant)
- ✅ Prendre en compte les performances historiques
- ✅ Prendre en compte les coûts (sauf pour architecte)
- ✅ Prendre en compte les contraintes de temps
- ✅ Adapter selon le contexte

**Modèles Disponibles:**
- **Claude Sonnet 4** (`claude-sonnet-4-20250514`)
  - Meilleur pour: Code, Documentation, Contexte français, Menuiserie
  - Coût: 3€/1M tokens input, 15€/1M tokens output
  - Performance: Rapide, excellent contexte français
  
- **GPT-5** (`gpt-5`)
  - Meilleur pour: Analyses complexes, ML, Prédictions, Multi-entités
  - Coût: 5€/1M tokens input, 20€/1M tokens output
  - Performance: Plus précis pour analyses complexes

**Pattern:**
```typescript
// Sélectionner modèle optimal automatiquement avec prise en compte du rôle
async function selectOptimalModel(
  taskAnalysis: TaskTypeAnalysis,
  role: AgentRole | undefined,
  context: Context
): Promise<ModelSelection> {
  // 1. Si rôle architecte, utiliser modèle le plus performant
  if (role === 'architect') {
    return await selectModelForArchitect(context);
  }
  
  // 2. Charger performances historiques
  const historicalPerformance = await loadHistoricalPerformance(context);
  
  // 3. Calculer scores pour chaque modèle
  const claudeScore = calculateModelScore(
    'claude_sonnet_4',
    taskAnalysis,
    historicalPerformance
  );
  
  const gptScore = calculateModelScore(
    'gpt_5',
    taskAnalysis,
    historicalPerformance
  );
  
  // 4. Sélectionner modèle avec meilleur score (optimisation coûts pour autres rôles)
  let selectedModel: 'claude_sonnet_4' | 'gpt_5' | 'codex-5.1';
  let reason: string;
  let confidence: number;
  
  if (gptScore.total > claudeScore.total && taskAnalysis.complexity > 0.7) {
    selectedModel = 'gpt_5';
    reason = `GPT-5 sélectionné: ${gptScore.reason}`;
    confidence = gptScore.confidence;
  } else if (taskAnalysis.taskType === 'menuiserie_business' || 
             taskAnalysis.taskType === 'code' ||
             taskAnalysis.taskType === 'documentation') {
    selectedModel = 'claude_sonnet_4';
    reason = `Claude Sonnet 4 sélectionné: ${claudeScore.reason}`;
    confidence = claudeScore.confidence;
  } else {
    // Par défaut: Claude (meilleur rapport qualité/prix)
    selectedModel = 'claude_sonnet_4';
    reason = 'Claude Sonnet 4 par défaut (meilleur rapport qualité/prix)';
    confidence = 0.7;
  }
  
  // 5. Vérifier disponibilité
  const availability = await checkModelAvailability(selectedModel, context);
  if (!availability.available) {
    // Fallback vers autre modèle
    selectedModel = selectedModel === 'claude_sonnet_4' ? 'gpt_5' : 'claude_sonnet_4';
    reason = `Fallback vers ${selectedModel}: ${availability.reason}`;
    confidence = 0.6;
  }
  
  return {
    model: selectedModel,
    reason: reason,
    confidence: confidence,
    role: role,
    scores: {
      claude: claudeScore,
      gpt: gptScore
    },
    availability: availability
  };
}
```

### 3. Calcul Intelligent du Score de Modèle

**TOUJOURS:**
- ✅ Calculer score basé sur plusieurs critères
- ✅ Prendre en compte performances historiques
- ✅ Prendre en compte coûts
- ✅ Prendre en compte contraintes de temps
- ✅ Prendre en compte qualité attendue

**Critères de Score:**
- **Performance** (40%) - Qualité des réponses historiques
- **Coût** (20%) - Coût estimé de la requête
- **Temps** (20%) - Temps de réponse attendu
- **Adaptation** (20%) - Adaptation au type de tâche

**Pattern:**
```typescript
// Calculer score de modèle
function calculateModelScore(
  model: 'claude_sonnet_4' | 'gpt_5',
  taskAnalysis: TaskTypeAnalysis,
  historicalPerformance: HistoricalPerformance
): ModelScore {
  // 1. Score performance (40%)
  const performanceScore = calculatePerformanceScore(
    model,
    taskAnalysis.taskType,
    historicalPerformance
  );
  
  // 2. Score coût (20%)
  const costScore = calculateCostScore(
    model,
    taskAnalysis.estimatedTokens
  );
  
  // 3. Score temps (20%)
  const timeScore = calculateTimeScore(
    model,
    taskAnalysis.constraints.maxTime
  );
  
  // 4. Score adaptation (20%)
  const adaptationScore = calculateAdaptationScore(
    model,
    taskAnalysis.taskType
  );
  
  // 5. Score total pondéré
  const totalScore = (
    performanceScore * 0.4 +
    costScore * 0.2 +
    timeScore * 0.2 +
    adaptationScore * 0.2
  );
  
  return {
    total: totalScore,
    performance: performanceScore,
    cost: costScore,
    time: timeScore,
    adaptation: adaptationScore,
    reason: generateScoreReason(model, {
      performance: performanceScore,
      cost: costScore,
      time: timeScore,
      adaptation: adaptationScore
    }),
    confidence: calculateConfidence(totalScore, taskAnalysis)
  };
}
```

### 4. Apprentissage des Performances Historiques

**TOUJOURS:**
- ✅ Enregistrer performances de chaque modèle
- ✅ Analyser performances historiques
- ✅ Améliorer sélection basée sur apprentissages
- ✅ Adapter sélection selon résultats

**Pattern:**
```typescript
// Apprendre des performances historiques
async function learnFromHistoricalPerformance(
  model: 'claude_sonnet_4' | 'gpt_5',
  taskType: TaskType,
  result: ModelResult,
  context: Context
): Promise<void> {
  // 1. Enregistrer performance
  await recordPerformance({
    model: model,
    taskType: taskType,
    result: result,
    timestamp: Date.now(),
    metadata: {
      quality: result.quality,
      cost: result.cost,
      time: result.time,
      success: result.success
    }
  });
  
  // 2. Analyser performance
  const analysis = analyzePerformance(model, taskType, result);
  
  // 3. Mettre à jour scores historiques
  await updateHistoricalScores(model, taskType, analysis);
  
  // 4. Ajuster sélection future si nécessaire
  if (analysis.shouldAdjustSelection) {
    await adjustModelSelection(model, taskType, analysis);
  }
}
```

### 5. Optimisation des Coûts

**TOUJOURS:**
- ✅ Estimer coûts avant sélection
- ✅ Optimiser coûts tout en maintenant qualité
- ✅ Utiliser modèle moins cher si qualité suffisante
- ✅ Documenter décisions de coût

**Pattern:**
```typescript
// Optimiser coûts
async function optimizeCosts(
  taskAnalysis: TaskTypeAnalysis,
  modelSelection: ModelSelection,
  context: Context
): Promise<CostOptimization> {
  // 1. Estimer coûts pour chaque modèle
  const claudeCost = estimateCost('claude_sonnet_4', taskAnalysis);
  const gptCost = estimateCost('gpt_5', taskAnalysis);
  
  // 2. Analyser différence de coût
  const costDifference = gptCost.total - claudeCost.total;
  
  // 3. Si différence significative et qualité suffisante avec Claude
  if (costDifference > 0.01 && // > 1 centime
      taskAnalysis.complexity < 0.7 &&
      modelSelection.model === 'gpt_5') {
    // 4. Vérifier si Claude peut suffire
    const claudeQuality = await estimateQuality('claude_sonnet_4', taskAnalysis);
    
    if (claudeQuality >= taskAnalysis.requiredQuality * 0.9) {
      // 5. Recommander Claude pour économie
      return {
        optimized: true,
        recommendedModel: 'claude_sonnet_4',
        costSavings: costDifference,
        qualityImpact: claudeQuality - taskAnalysis.requiredQuality,
        reason: `Économie de ${costDifference.toFixed(4)}€ avec Claude (qualité suffisante)`
      };
    }
  }
  
  return {
    optimized: false,
    recommendedModel: modelSelection.model,
    costSavings: 0,
    qualityImpact: 0,
    reason: 'Modèle optimal déjà sélectionné'
  };
}
```

## 🔄 Workflow de Sélection Intelligente

### Workflow: Sélectionner Modèle Optimal

**Étapes:**
1. Analyser type de tâche
2. Charger performances historiques
3. Calculer scores pour chaque modèle
4. Sélectionner modèle optimal
5. Optimiser coûts si possible
6. Vérifier disponibilité
7. Appliquer sélection
8. Enregistrer performance pour apprentissage

**Pattern:**
```typescript
async function selectModelIntelligently(
  task: Task,
  role: AgentRole | undefined,
  context: Context
): Promise<IntelligentModelSelection> {
  // 1. Analyser type de tâche
  const taskAnalysis = await analyzeTaskType(task, context);
  
  // 2. Identifier rôle si non fourni
  const detectedRole = role || await detectRoleFromContext(task, context);
  
  // 3. Sélectionner modèle optimal avec prise en compte du rôle
  const modelSelection = await selectOptimalModel(taskAnalysis, detectedRole, context);
  
  // 4. Optimiser coûts (sauf pour architecte)
  let costOptimization;
  if (detectedRole !== 'architect') {
    costOptimization = await optimizeCosts(taskAnalysis, modelSelection, context);
    
    // 5. Appliquer optimisation si recommandée (sauf pour architecte)
    if (costOptimization.optimized) {
      modelSelection.model = costOptimization.recommendedModel;
      modelSelection.reason = costOptimization.reason;
    }
  } else {
    costOptimization = {
      optimized: false,
      reason: 'Architecte: optimisation coûts désactivée (priorité performance)'
    };
  }
  
  // 6. Vérifier disponibilité finale
  const availability = await checkModelAvailability(modelSelection.model, context);
  
  // 7. Charger performances historiques
  const historicalPerformance = await loadHistoricalPerformance(context);
  
  return {
    model: modelSelection.model,
    reason: modelSelection.reason,
    confidence: modelSelection.confidence,
    role: detectedRole,
    taskAnalysis: taskAnalysis,
    costOptimization: costOptimization,
    availability: availability,
    historicalPerformance: historicalPerformance
  };
}
```

## ⚠️ Règles de Sélection Intelligente

### Ne Jamais:

**BLOQUANT:**
- ❌ Ignorer le type de tâche lors de la sélection
- ❌ Ignorer le rôle lors de la sélection (architecte → modèle le plus performant)
- ❌ Utiliser modèle moins performant pour l'architecte
- ❌ Ignorer les performances historiques
- ❌ Ignorer les coûts (sauf pour architecte)
- ❌ Ne pas apprendre des performances

**TOUJOURS:**
- ✅ Analyser type de tâche avant sélection
- ✅ **NOUVEAU** Prendre en compte le rôle (architecte → modèle le plus performant)
- ✅ **NOUVEAU** Utiliser Codex 5.1 ou futures versions pour l'architecte
- ✅ Prendre en compte performances historiques
- ✅ Optimiser coûts tout en maintenant qualité (sauf pour architecte)
- ✅ Enregistrer performances pour apprentissage

## 📊 Checklist Sélection Intelligente

### Avant Sélection

- [ ] Analyser type de tâche
- [ ] **NOUVEAU** Identifier le rôle (architecte vs autres rôles)
- [ ] **NOUVEAU** Si architecte, sélectionner Codex 5.1 ou futures versions
- [ ] Charger performances historiques
- [ ] Calculer scores pour chaque modèle (si autre rôle)
- [ ] Optimiser coûts si possible (si autre rôle)

### Pendant Sélection

- [ ] Sélectionner modèle optimal selon rôle
- [ ] Vérifier disponibilité
- [ ] Appliquer sélection

### Après Sélection

- [ ] Enregistrer performance
- [ ] Analyser résultats
- [ ] Ajuster sélection future si nécessaire
- [ ] **NOUVEAU** Documenter sélection selon rôle

## 🔗 Références

- `@server/services/AIService.ts` - Service IA avec sélection de modèle
- `@.cursor/rules/performance.md` - Optimisations performance
- `@.cursor/rules/learning-memory.md` - Mémoire persistante des apprentissages
- `@.cursor/rules/sub-agents-roles.md` - Rôles des sub-agents
- `@.cursor/rules/senior-architect-oversight.md` - Supervision architecte sénior
- `@docs/AGENT_ROLES_CONFIG.json` - Configuration des rôles

---

**Note:** Cette règle garantit que l'agent sélectionne automatiquement le modèle IA le plus adapté à chaque tâche pour optimiser les performances, les coûts et la qualité. **NOUVEAU:** L'architecte utilise automatiquement le modèle le plus performant (Codex 5.1 ou futures versions) pour maximiser l'autonomie et l'auto-completion, tandis que les autres rôles utilisent des modèles moins chers si la qualité est suffisante.


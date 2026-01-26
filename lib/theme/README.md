# Système de Thème Unifié - CJD Amiens

Ce dossier contient le système de thème centralisé de l'application, permettant une gestion cohérente des couleurs, typographies et styles à travers l'ensemble du projet.

## 📁 Structure

```
lib/theme/
├── theme-generator.ts   # Générateur de variables CSS depuis brandingCore
├── theme-provider.tsx   # Provider React pour le thème (dark mode)
└── README.md            # Cette documentation
```

## 🎨 Comment Fonctionne le Système

### 1. Configuration Centrale

Toutes les valeurs de thème (couleurs, polices, etc.) sont définies dans **un seul fichier** :

```
lib/config/branding-core.ts
```

**Exemple :**

```typescript
export const brandingCore = {
  colors: {
    primary: "#00a844",      // Vert CJD
    primaryDark: "#008835",
    success: "#00c853",
    error: "#f44336",
    // ...
  },
  fonts: {
    primary: "Lato",
  },
  // ...
};
```

### 2. Génération Automatique

Le fichier `theme-generator.ts` convertit automatiquement ces valeurs en variables CSS HSL :

```typescript
import { generateThemeCSS } from '@/lib/theme/theme-generator';

// Génère toutes les variables CSS :root et .dark
const css = generateThemeCSS();
```

### 3. Application Globale

Les variables CSS sont appliquées via `app/globals.css` :

```css
:root {
  --primary: hsl(140 69% 33%); /* #00a844 */
  --success: hsl(145 100% 39%);
  /* ... */
}

.dark {
  --background: hsl(0 0% 0%);
  /* Couleurs adaptées pour dark mode */
}
```

## 🚀 Utilisation

### Dans les Composants React

#### Accéder aux Couleurs

```tsx
import { useThemeColors } from '@/lib/theme/theme-generator';

function MyComponent() {
  const colors = useThemeColors();

  return (
    <div style={{ color: colors.primary }}>
      Texte en vert CJD
    </div>
  );
}
```

#### Utiliser les Classes CSS

```tsx
function Button() {
  return (
    <button className="bg-primary text-primary-foreground hover:bg-cjd-green-dark">
      Bouton CJD
    </button>
  );
}
```

#### Classes de Statut Disponibles

```tsx
// Success
<div className="bg-success text-success-foreground">Succès</div>
<div className="bg-success-light text-success-dark">Info succès</div>

// Warning
<div className="bg-warning text-warning-foreground">Avertissement</div>

// Error
<div className="bg-error text-error-foreground">Erreur</div>

// Info
<div className="bg-info text-info-foreground">Information</div>
```

### Gestion du Dark Mode

#### 1. Envelopper l'App avec ThemeProvider

Dans `app/layout.tsx` :

```tsx
import { ThemeProvider } from '@/lib/theme/theme-provider';

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### 2. Créer un Sélecteur de Thème

```tsx
'use client';

import { useTheme } from '@/lib/theme/theme-provider';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-muted hover:bg-accent"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
```

### Variables CSS Personnalisées

Accéder directement aux variables CSS :

```tsx
function CustomComponent() {
  return (
    <div
      style={{
        backgroundColor: 'hsl(var(--primary))',
        color: 'hsl(var(--primary-foreground))',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      Composant avec variables CSS
    </div>
  );
}
```

## 🎯 Variables CSS Disponibles

### Couleurs de Base

| Variable | Description |
|----------|-------------|
| `--background` | Fond principal |
| `--foreground` | Texte principal |
| `--card` | Fond des cartes |
| `--card-foreground` | Texte des cartes |
| `--primary` | Couleur principale (vert CJD) |
| `--primary-foreground` | Texte sur couleur principale |
| `--secondary` | Couleur secondaire |
| `--muted` | Couleur discrète |
| `--accent` | Couleur d'accent |
| `--destructive` | Couleur destructive |
| `--border` | Couleur des bordures |
| `--input` | Fond des inputs |
| `--ring` | Couleur du focus ring |

### Couleurs de Statut

| Variable | Description |
|----------|-------------|
| `--success` | Vert de succès |
| `--success-dark` | Variante sombre |
| `--success-light` | Variante claire |
| `--warning` | Orange d'avertissement |
| `--error` | Rouge d'erreur |
| `--info` | Bleu d'information |

### Couleurs de Marque (Alias)

| Variable | Description |
|----------|-------------|
| `--cjd-green` | Vert CJD principal |
| `--cjd-green-dark` | Variante sombre |
| `--cjd-green-light` | Variante claire |

### Charts

| Variable | Description |
|----------|-------------|
| `--chart-1` à `--chart-5` | Couleurs pour graphiques |
| `--chart-grid` | Couleur de grille |

### Typographie

| Variable | Description |
|----------|-------------|
| `--font-sans` | Police principale (Lato) |
| `--font-serif` | Police serif |
| `--font-mono` | Police monospace |

### Effets

| Variable | Description |
|----------|-------------|
| `--radius` | Rayon de bordure standard |
| `--shadow-*` | Ombres (2xs, xs, sm, md, lg, xl, 2xl) |
| `--spacing` | Espacement de base |

## 🔧 Modifier le Thème

### Pour Changer une Couleur

1. Ouvrez `lib/config/branding-core.ts`
2. Modifiez la valeur hexadécimale :

```typescript
export const brandingCore = {
  colors: {
    primary: "#00a844", // Changez cette valeur
    // ...
  },
};
```

3. Les variables CSS seront automatiquement regénérées

### Pour Ajouter une Nouvelle Couleur

1. Ajoutez-la dans `brandingCore.colors` :

```typescript
export const brandingCore = {
  colors: {
    // ...
    tertiary: "#ff5722",
  },
};
```

2. Mettez à jour `theme-generator.ts` pour l'inclure :

```typescript
export function generateLightThemeVars() {
  return {
    // ...
    '--tertiary': `hsl(${formatHSL(colors.tertiary)})`,
  };
}
```

3. Ajoutez la classe CSS dans `globals.css` :

```css
@layer components {
  .bg-tertiary {
    background-color: hsl(var(--tertiary));
  }
}
```

## 📝 Bonnes Pratiques

### ✅ À Faire

- **Utiliser les variables CSS** plutôt que des couleurs en dur
- **Tester en dark mode** systématiquement
- **Documenter les nouvelles couleurs** dans ce README
- **Respecter les contrastes WCAG** pour l'accessibilité

### ❌ À Éviter

- Hardcoder des couleurs directement dans les composants
- Créer de nouvelles variables CSS sans passer par `brandingCore`
- Oublier de définir les variantes dark mode
- Utiliser des couleurs non sémantiques

## 🧪 Tests

### Vérifier la Génération CSS

```typescript
import { generateThemeCSS } from '@/lib/theme/theme-generator';

console.log(generateThemeCSS());
```

### Tester le Dark Mode

1. Ajouter un toggle de thème dans votre UI
2. Vérifier que toutes les couleurs s'adaptent correctement
3. Valider les contrastes avec les outils DevTools

## 🔗 Liens Utiles

- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [HSL Color Format](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

## 📦 Dépendances

- `next-themes`: Gestion du dark mode avec persistance
- `tailwindcss`: Framework CSS utility-first
- `@tailwindcss/typography`: Plugin pour la typographie

## 🤝 Contribution

Pour contribuer au système de thème :

1. Modifier `lib/config/branding-core.ts`
2. Tester les changements en light et dark mode
3. Mettre à jour cette documentation si nécessaire
4. Vérifier que tous les tests passent

## 📞 Support

Pour toute question sur le système de thème, consulter :
- Cette documentation
- Les fichiers de configuration dans `lib/config/`
- Les exemples dans `app/`

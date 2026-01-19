# Migration Composant: useMutation → useActionState

**Guide de migration** pour convertir les composants utilisant TanStack Query (`useMutation`) vers Next.js Server Actions (`useActionState`).

---

## 📋 Pattern Avant/Après

### Exemple 1: Création d'Idée

#### ❌ AVANT - useMutation + fetch

```typescript
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function ProposeIdeaForm() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [proposedBy, setProposedBy] = useState('')
  const [proposedByEmail, setProposedByEmail] = useState('')

  const createIdeaMutation = useMutation({
    mutationFn: async (data: {
      title: string
      description: string
      proposedBy: string
      proposedByEmail: string
    }) => {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la création')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] })
      setTitle('')
      setDescription('')
      setProposedBy('')
      setProposedByEmail('')
    },
    onError: (error) => {
      console.error('Error:', error)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createIdeaMutation.mutate({
      title,
      description,
      proposedBy,
      proposedByEmail,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {createIdeaMutation.error && (
        <div className="text-red-500">
          {createIdeaMutation.error.message}
        </div>
      )}

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre de l'idée"
        required
      />

      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />

      <Input
        value={proposedBy}
        onChange={(e) => setProposedBy(e.target.value)}
        placeholder="Votre nom"
        required
      />

      <Input
        type="email"
        value={proposedByEmail}
        onChange={(e) => setProposedByEmail(e.target.value)}
        placeholder="Votre email"
        required
      />

      <Button
        type="submit"
        disabled={createIdeaMutation.isPending}
      >
        {createIdeaMutation.isPending ? 'Envoi...' : 'Proposer une idée'}
      </Button>
    </form>
  )
}
```

#### ✅ APRÈS - useActionState + Server Action

```typescript
'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createIdea } from '@/app/actions/ideas'

export function ProposeIdeaForm() {
  const [state, formAction, isPending] = useActionState(createIdea, null)

  return (
    <form action={formAction} className="space-y-4">
      {/* Message succès */}
      {state?.success && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded">
          {state.message || 'Idée créée avec succès !'}
        </div>
      )}

      {/* Message erreur */}
      {state?.success === false && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded">
          {state.error}
        </div>
      )}

      <Input
        name="title"
        placeholder="Titre de l'idée"
        required
        defaultValue=""
        aria-invalid={state?.field === 'title' ? 'true' : undefined}
      />
      {state?.field === 'title' && (
        <p className="text-red-500 text-sm">{state.error}</p>
      )}

      <Textarea
        name="description"
        placeholder="Description"
        defaultValue=""
      />

      <Input
        name="proposedBy"
        placeholder="Votre nom"
        required
        defaultValue=""
      />

      <Input
        type="email"
        name="proposedByEmail"
        placeholder="Votre email"
        required
        defaultValue=""
      />

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Envoi...' : 'Proposer une idée'}
      </Button>
    </form>
  )
}
```

---

## 🔍 Différences Clés

### 1. Imports

**Avant:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
```

**Après:**
```typescript
import { useActionState } from 'react'
import { createIdea } from '@/app/actions/ideas'
```

### 2. State Management

**Avant:**
- État local avec `useState` pour chaque champ
- `useMutation` pour la mutation
- `queryClient.invalidateQueries()` pour cache

**Après:**
- `useActionState` gère tout (état + soumission)
- Pas besoin de `useState` par champ
- Revalidation automatique via `revalidatePath()` dans Server Action

### 3. Formulaire

**Avant:**
```typescript
<form onSubmit={handleSubmit}>
  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
</form>
```

**Après:**
```typescript
<form action={formAction}>
  <Input name="title" defaultValue="" />
</form>
```

### 4. Gestion Erreurs

**Avant:**
```typescript
{createIdeaMutation.error && (
  <div>{createIdeaMutation.error.message}</div>
)}
```

**Après:**
```typescript
{state?.success === false && (
  <div>{state.error}</div>
)}
```

### 5. Pending State

**Avant:**
```typescript
disabled={createIdeaMutation.isPending}
{createIdeaMutation.isPending ? 'Envoi...' : 'Proposer'}
```

**Après:**
```typescript
disabled={isPending}
{isPending ? 'Envoi...' : 'Proposer'}
```

---

## 📊 Tableau Comparatif

| Aspect | useMutation | useActionState |
|--------|-------------|----------------|
| **Client-side code** | ~80 lignes | ~40 lignes (-50%) |
| **État local** | `useState` par champ | ❌ Pas nécessaire |
| **Cache invalidation** | Manuel (`queryClient`) | ✅ Automatique (`revalidatePath`) |
| **Progressive enhancement** | ❌ Nécessite JS | ✅ Fonctionne sans JS |
| **Type safety** | ⚠️ Partiel | ✅ Complet (Server Action) |
| **Validation** | ❌ Côté client uniquement | ✅ Côté serveur (Zod) |
| **Rate limiting** | ❌ Non intégré | ✅ Intégré (Server Action) |
| **SEO** | ⚠️ Form inaccessible sans JS | ✅ Form fonctionne toujours |

---

## 🎯 Exemple 2: Vote sur Idée

### ❌ AVANT

```typescript
const voteMutation = useMutation({
  mutationFn: async (data: { ideaId: string; voterName: string; voterEmail: string }) => {
    const response = await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Vote failed')
    return response.json()
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['ideas'] })
  },
})

const handleVote = () => {
  voteMutation.mutate({
    ideaId: idea.id,
    voterName: name,
    voterEmail: email,
  })
}
```

### ✅ APRÈS

```typescript
import { createVote } from '@/app/actions/ideas'

const [voteState, voteAction, votePending] = useActionState(createVote, null)

<form action={voteAction}>
  <input type="hidden" name="ideaId" value={idea.id} />
  <input name="voterName" placeholder="Votre nom" required />
  <input name="voterEmail" type="email" placeholder="Votre email" required />
  <button type="submit" disabled={votePending}>
    {votePending ? 'Vote en cours...' : 'Voter'}
  </button>
</form>
```

---

## 🎯 Exemple 3: Inscription Événement

### ❌ AVANT

```typescript
const registerMutation = useMutation({
  mutationFn: async (data) => {
    const response = await fetch(`/api/inscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message)
    }
    return response.json()
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['events'] })
    toast.success('Inscription réussie !')
  },
  onError: (error) => {
    toast.error(error.message)
  },
})
```

### ✅ APRÈS

```typescript
import { registerForEvent } from '@/app/actions/events'

const [state, formAction, isPending] = useActionState(registerForEvent, null)

<form action={formAction}>
  <input type="hidden" name="eventId" value={event.id} />
  <input name="name" placeholder="Nom complet" required />
  <input name="email" type="email" placeholder="Email" required />
  <input name="company" placeholder="Société (optionnel)" />
  <input name="phone" placeholder="Téléphone (optionnel)" />
  <textarea name="comments" placeholder="Commentaires" />
  <button type="submit" disabled={isPending}>
    {isPending ? 'Inscription...' : "M'inscrire"}
  </button>
</form>
```

---

## ✅ Checklist Migration

### Préparation
- [ ] Server Action implémentée (`/app/actions/*.ts`)
- [ ] Schema Zod validé
- [ ] Rate limiting configuré
- [ ] Revalidation définie

### Composant
- [ ] Remplacer `useMutation` par `useActionState`
- [ ] Supprimer `useState` pour les champs
- [ ] Remplacer `value` par `name` dans inputs
- [ ] Remplacer `onChange` par `defaultValue`
- [ ] Remplacer `onSubmit` par `action`
- [ ] Adapter affichage erreurs (`state?.error`)
- [ ] Adapter pending state (`isPending`)

### Tests
- [ ] Test soumission formulaire
- [ ] Test validation erreurs
- [ ] Test progressive enhancement (désactiver JS)
- [ ] Test rate limiting
- [ ] Screenshots before/after

---

## 🚀 Avantages Migration

### Performance
- ✅ **-50% code client** (moins de JavaScript à télécharger)
- ✅ **Progressive enhancement** (formulaires fonctionnent sans JS)
- ✅ **Revalidation automatique** (pas de `queryClient.invalidateQueries()`)

### Développement
- ✅ **Type-safety complète** (Server Action → Client)
- ✅ **Moins de boilerplate** (pas de `useState` par champ)
- ✅ **Validation centralisée** (Zod côté serveur)

### Sécurité
- ✅ **Rate limiting intégré** (Server Action)
- ✅ **Validation serveur** (Zod schemas)
- ✅ **Pas d'exposition API** (Server Action sécurisée)

### SEO
- ✅ **Forms accessibles sans JS** (Progressive enhancement)
- ✅ **Crawlers peuvent soumettre** (si nécessaire)

---

## 📝 Notes

### Progressive Enhancement

Avec Server Actions, les formulaires **fonctionnent sans JavaScript** :

```typescript
// Ce formulaire fonctionne même si JS est désactivé
<form action={formAction}>
  <input name="title" required />
  <button type="submit">Envoyer</button>
</form>
```

### Reset Form Après Succès

**Option 1: Avec key**
```typescript
const [key, setKey] = useState(0)

{state?.success && setKey(k => k + 1)}

<form action={formAction} key={key}>
  {/* Form will remount and reset */}
</form>
```

**Option 2: Avec ref**
```typescript
const formRef = useRef<HTMLFormElement>(null)

useEffect(() => {
  if (state?.success) {
    formRef.current?.reset()
  }
}, [state])

<form ref={formRef} action={formAction}>
  {/* Form will reset on success */}
</form>
```

---

**Document créé:** 2026-01-19
**Migration:** Next.js Server Actions Phase 1
**Projet:** cjd80

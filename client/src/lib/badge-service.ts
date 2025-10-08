class BadgeService {
  private currentCount: number = 0;

  // Vérifier si l'API est disponible
  isSupported(): boolean {
    return 'setAppBadge' in navigator;
  }

  // Définir le badge avec un nombre
  async setBadge(count: number): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      if (count > 0) {
        await navigator.setAppBadge(count);
        this.currentCount = count;
        return true;
      } else {
        return await this.clearBadge();
      }
    } catch (error) {
      console.error('[Badge] Erreur setBadge:', error);
      return false;
    }
  }

  // Supprimer le badge
  async clearBadge(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      await navigator.clearAppBadge();
      this.currentCount = 0;
      return true;
    } catch (error) {
      console.error('[Badge] Erreur clearBadge:', error);
      return false;
    }
  }

  // Incrémenter le compteur
  async incrementBadge(amount: number = 1): Promise<boolean> {
    const newCount = this.currentCount + amount;
    return this.setBadge(newCount);
  }

  // Décrémenter le compteur
  async decrementBadge(amount: number = 1): Promise<boolean> {
    const newCount = Math.max(0, this.currentCount - amount);
    return this.setBadge(newCount);
  }

  // Obtenir le compteur actuel
  getCurrentCount(): number {
    return this.currentCount;
  }
}

// Instance singleton
export const badgeService = new BadgeService();

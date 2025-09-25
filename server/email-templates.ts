import type { Idea, Event, User } from '@shared/schema';

export interface NotificationContext {
  baseUrl: string;
  adminDashboardUrl: string;
}

// CSS inline pour une meilleure compatibilité email
const emailStyles = {
  container: 'max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;',
  header: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;',
  title: 'margin: 0; font-size: 24px; font-weight: bold;',
  subtitle: 'margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;',
  content: 'background: #ffffff; padding: 30px; border: 1px solid #e0e0e0;',
  badge: 'display: inline-block; background: #4CAF50; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-bottom: 15px;',
  itemTitle: 'font-size: 20px; font-weight: bold; color: #2c3e50; margin: 0 0 10px 0;',
  description: 'background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; border-radius: 0 4px 4px 0;',
  metaInfo: 'background: #f0f0f0; padding: 15px; border-radius: 6px; margin: 15px 0;',
  metaLabel: 'font-weight: bold; color: #555; margin-right: 8px;',
  metaValue: 'color: #333;',
  button: 'display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold;',
  footer: 'background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;'
};

export function createNewIdeaEmailTemplate(
  idea: Idea, 
  proposedBy: string, 
  context: NotificationContext
): { subject: string; html: string } {
  const subject = `🌟 Nouvelle idée proposée : ${idea.title}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f5f5f5;">
      <div style="${emailStyles.container}">
        <!-- Header -->
        <header style="${emailStyles.header}">
          <h1 style="${emailStyles.title}">CJD Amiens</h1>
          <p style="${emailStyles.subtitle}">Nouvelle idée proposée dans la Boîte à Kiffs</p>
        </header>

        <!-- Content -->
        <main style="${emailStyles.content}">
          <div style="${emailStyles.badge}">💡 NOUVELLE IDÉE</div>
          
          <h2 style="${emailStyles.itemTitle}">${idea.title}</h2>
          
          ${idea.description ? `
          <div style="${emailStyles.description}">
            <strong>Description :</strong><br>
            ${idea.description.replace(/\n/g, '<br>')}
          </div>
          ` : ''}

          <div style="${emailStyles.metaInfo}">
            <div style="margin-bottom: 8px;">
              <span style="${emailStyles.metaLabel}">Proposée par :</span>
              <span style="${emailStyles.metaValue}">${proposedBy} (${idea.proposedByEmail})</span>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="${emailStyles.metaLabel}">Statut :</span>
              <span style="${emailStyles.metaValue}">${idea.status}</span>
            </div>
            ${idea.featured ? `
            <div style="margin-bottom: 8px;">
              <span style="${emailStyles.metaLabel}">🌟 Idée mise en avant</span>
            </div>
            ` : ''}
            ${idea.deadline ? `
            <div>
              <span style="${emailStyles.metaLabel}">📅 Échéance :</span>
              <span style="${emailStyles.metaValue}">${new Date(idea.deadline).toLocaleDateString('fr-FR')}</span>
            </div>
            ` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${context.adminDashboardUrl}" style="${emailStyles.button}">
              📊 Accéder au tableau de bord
            </a>
          </div>

          <p style="color: #666; font-style: italic; margin-top: 25px;">
            Cette idée attend votre évaluation et vos commentaires. 
            Connectez-vous à l'interface d'administration pour la traiter.
          </p>
        </main>

        <!-- Footer -->
        <footer style="${emailStyles.footer}">
          <p style="margin: 0;">
            Centre des Jeunes Dirigeants d'Amiens<br>
            Système de gestion des idées et événements
          </p>
        </footer>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

export function createNewEventEmailTemplate(
  event: Event, 
  organizer: string, 
  context: NotificationContext
): { subject: string; html: string } {
  const subject = `📅 Nouvel événement proposé : ${event.title}`;
  
  // Formatage de la date
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f5f5f5;">
      <div style="${emailStyles.container}">
        <!-- Header -->
        <header style="${emailStyles.header}">
          <h1 style="${emailStyles.title}">CJD Amiens</h1>
          <p style="${emailStyles.subtitle}">Nouvel événement proposé</p>
        </header>

        <!-- Content -->
        <main style="${emailStyles.content}">
          <div style="${emailStyles.badge}">📅 NOUVEL ÉVÉNEMENT</div>
          
          <h2 style="${emailStyles.itemTitle}">${event.title}</h2>
          
          ${event.description ? `
          <div style="${emailStyles.description}">
            <strong>Description :</strong><br>
            ${event.description.replace(/\n/g, '<br>')}
          </div>
          ` : ''}

          <div style="${emailStyles.metaInfo}">
            <div style="margin-bottom: 8px;">
              <span style="${emailStyles.metaLabel}">Organisé par :</span>
              <span style="${emailStyles.metaValue}">${organizer}</span>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="${emailStyles.metaLabel}">📅 Date :</span>
              <span style="${emailStyles.metaValue}">${formattedDate}</span>
            </div>
            ${event.location ? `
            <div style="margin-bottom: 8px;">
              <span style="${emailStyles.metaLabel}">📍 Lieu :</span>
              <span style="${emailStyles.metaValue}">${event.location}</span>
            </div>
            ` : ''}
            ${event.maxParticipants ? `
            <div>
              <span style="${emailStyles.metaLabel}">👥 Places disponibles :</span>
              <span style="${emailStyles.metaValue}">${event.maxParticipants} participants maximum</span>
            </div>
            ` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${context.adminDashboardUrl}" style="${emailStyles.button}">
              📊 Accéder au tableau de bord
            </a>
          </div>

          <p style="color: #666; font-style: italic; margin-top: 25px;">
            Cet événement attend votre validation. 
            Connectez-vous à l'interface d'administration pour l'approuver ou le modifier.
          </p>
        </main>

        <!-- Footer -->
        <footer style="${emailStyles.footer}">
          <p style="margin: 0;">
            Centre des Jeunes Dirigeants d'Amiens<br>
            Système de gestion des idées et événements
          </p>
        </footer>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

// Template pour les emails de test
export function createTestEmailTemplate(): { subject: string; html: string } {
  const subject = '✅ Test de configuration email - CJD Amiens';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #f5f5f5;">
      <div style="${emailStyles.container}">
        <header style="${emailStyles.header}">
          <h1 style="${emailStyles.title}">CJD Amiens</h1>
          <p style="${emailStyles.subtitle}">Test de configuration email</p>
        </header>

        <main style="${emailStyles.content}">
          <h2 style="${emailStyles.itemTitle}">✅ Configuration email réussie !</h2>
          
          <p>Ce message confirme que la configuration SMTP avec OVH fonctionne correctement.</p>
          
          <div style="${emailStyles.metaInfo}">
            <div style="margin-bottom: 8px;">
              <span style="${emailStyles.metaLabel}">📧 Service :</span>
              <span style="${emailStyles.metaValue}">OVH SMTP (ssl0.ovh.net)</span>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="${emailStyles.metaLabel}">🕐 Envoyé le :</span>
              <span style="${emailStyles.metaValue}">${new Date().toLocaleString('fr-FR')}</span>
            </div>
            <div>
              <span style="${emailStyles.metaLabel}">🎯 Fonctionnalité :</span>
              <span style="${emailStyles.metaValue}">Notifications automatiques pour les administrateurs</span>
            </div>
          </div>

          <p style="color: #4CAF50; font-weight: bold; text-align: center; margin: 20px 0;">
            🎉 Les notifications par email sont maintenant opérationnelles !
          </p>
        </main>

        <footer style="${emailStyles.footer}">
          <p style="margin: 0;">
            Centre des Jeunes Dirigeants d'Amiens<br>
            Système de notifications automatiques
          </p>
        </footer>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}
import type { Idea, Event, User, LoanItem } from '@shared/schema';
import { brandingCore, getShortAppName } from '../lib/config/branding-core';

export interface NotificationContext {
  baseUrl: string;
  adminDashboardUrl: string;
}

// CSS inline simplifié pour éviter les filtres anti-spam
const emailStyles = {
  container: 'max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; line-height: 1.6; color: #333;',
  header: 'background: #2c3e50; color: white; padding: 24px; text-align: center;',
  title: 'margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.5px;',
  subtitle: 'margin: 8px 0 0 0; font-size: 13px; opacity: 0.85; font-weight: 400;',
  content: 'background: #ffffff; padding: 32px 24px;',
  label: 'display: inline-block; background: #f4f4f4; color: #555; padding: 4px 10px; border-radius: 3px; font-size: 11px; font-weight: 500; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;',
  itemTitle: 'font-size: 18px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px 0; line-height: 1.4;',
  description: 'background: #fafafa; padding: 16px; border-left: 3px solid #e0e0e0; margin: 16px 0; color: #444; font-size: 14px;',
  metaInfo: 'margin: 24px 0; padding: 16px 0; border-top: 1px solid #e8e8e8; border-bottom: 1px solid #e8e8e8;',
  metaRow: 'margin: 8px 0; font-size: 14px;',
  metaLabel: 'font-weight: 500; color: #666; display: inline-block; width: 140px;',
  metaValue: 'color: #1a1a1a;',
  button: 'display: inline-block; background: #2c3e50; color: white; padding: 12px 32px; text-decoration: none; border-radius: 4px; margin: 24px 0; font-weight: 500; font-size: 14px;',
  note: 'color: #666; font-size: 13px; margin-top: 24px; padding: 16px; background: #f9f9f9; border-radius: 4px;',
  footer: 'background: #f4f4f4; padding: 20px; text-align: center; color: #666; font-size: 12px;'
};

export function createNewIdeaEmailTemplate(
  idea: Idea, 
  proposedBy: string, 
  context: NotificationContext
): { subject: string; html: string } {
  const subject = `Nouvelle idée : ${idea.title}`;
  
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
          <h1 style="${emailStyles.title}">${getShortAppName()}</h1>
          <p style="${emailStyles.subtitle}">Notification administrative</p>
        </header>

        <main style="${emailStyles.content}">
          <div style="${emailStyles.label}">Nouvelle idée</div>
          
          <h2 style="${emailStyles.itemTitle}">${idea.title}</h2>
          
          ${idea.description ? `
          <div style="${emailStyles.description}">
            ${idea.description.replace(/\n/g, '<br>')}
          </div>
          ` : ''}

          <div style="${emailStyles.metaInfo}">
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Proposée par</span>
              <span style="${emailStyles.metaValue}">${proposedBy}</span>
            </div>
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Contact</span>
              <span style="${emailStyles.metaValue}">${idea.proposedByEmail}</span>
            </div>
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Statut</span>
              <span style="${emailStyles.metaValue}">${idea.status === 'pending' ? 'En attente' : idea.status}</span>
            </div>
            ${idea.deadline ? `
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Échéance</span>
              <span style="${emailStyles.metaValue}">${new Date(idea.deadline).toLocaleDateString('fr-FR')}</span>
            </div>
            ` : ''}
          </div>

          <div style="text-align: center;">
            <a href="${context.adminDashboardUrl}" style="${emailStyles.button}">
              Accéder au tableau de bord
            </a>
          </div>

          <div style="${emailStyles.note}">
            Cette idée nécessite votre évaluation. Connectez-vous à l'interface d'administration pour la traiter.
          </div>
        </main>

        <footer style="${emailStyles.footer}">
          ${brandingCore.organization.fullName}<br>
          Notification automatique
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
  const subject = `Nouvel événement : ${event.title}`;
  
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
        <header style="${emailStyles.header}">
          <h1 style="${emailStyles.title}">${getShortAppName()}</h1>
          <p style="${emailStyles.subtitle}">Notification administrative</p>
        </header>

        <main style="${emailStyles.content}">
          <div style="${emailStyles.label}">Nouvel événement</div>
          
          <h2 style="${emailStyles.itemTitle}">${event.title}</h2>
          
          ${event.description ? `
          <div style="${emailStyles.description}">
            ${event.description.replace(/\n/g, '<br>')}
          </div>
          ` : ''}

          <div style="${emailStyles.metaInfo}">
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Organisé par</span>
              <span style="${emailStyles.metaValue}">${organizer}</span>
            </div>
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Date</span>
              <span style="${emailStyles.metaValue}">${formattedDate}</span>
            </div>
            ${event.location ? `
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Lieu</span>
              <span style="${emailStyles.metaValue}">${event.location}</span>
            </div>
            ` : ''}
            ${event.maxParticipants ? `
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Places</span>
              <span style="${emailStyles.metaValue}">${event.maxParticipants} participants max</span>
            </div>
            ` : ''}
          </div>

          <div style="text-align: center;">
            <a href="${context.adminDashboardUrl}" style="${emailStyles.button}">
              Accéder au tableau de bord
            </a>
          </div>

          <div style="${emailStyles.note}">
            Cet événement attend votre validation. Connectez-vous à l'interface d'administration pour l'approuver.
          </div>
        </main>

        <footer style="${emailStyles.footer}">
          ${brandingCore.organization.fullName}<br>
          Notification automatique
        </footer>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

export function createTestEmailTemplate(): { subject: string; html: string } {
  const subject = `Test configuration email - ${getShortAppName()}`;
  
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
          <h1 style="${emailStyles.title}">${getShortAppName()}</h1>
          <p style="${emailStyles.subtitle}">Test de configuration</p>
        </header>

        <main style="${emailStyles.content}">
          <h2 style="${emailStyles.itemTitle}">Configuration email réussie</h2>
          
          <p>Ce message confirme que la configuration SMTP avec OVH fonctionne correctement.</p>
          
          <div style="${emailStyles.metaInfo}">
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Service</span>
              <span style="${emailStyles.metaValue}">OVH SMTP</span>
            </div>
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Envoyé le</span>
              <span style="${emailStyles.metaValue}">${new Date().toLocaleString('fr-FR')}</span>
            </div>
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Fonctionnalité</span>
              <span style="${emailStyles.metaValue}">Notifications automatiques</span>
            </div>
          </div>

          <div style="${emailStyles.note}">
            Les notifications par email sont maintenant opérationnelles.
          </div>
        </main>

        <footer style="${emailStyles.footer}">
          ${brandingCore.organization.fullName}<br>
          Système de notifications automatiques
        </footer>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

export function createNewMemberProposalEmailTemplate(
  memberData: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    phone?: string;
    role?: string;
    notes?: string;
    proposedBy: string;
  },
  context: NotificationContext
): { subject: string; html: string } {
  const subject = `Nouveau membre proposé : ${memberData.firstName} ${memberData.lastName}`;
  
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
          <h1 style="${emailStyles.title}">${getShortAppName()}</h1>
          <p style="${emailStyles.subtitle}">Notification recrutement</p>
        </header>

        <main style="${emailStyles.content}">
          <div style="${emailStyles.label}">Nouveau membre proposé</div>
          
          <h2 style="${emailStyles.itemTitle}">${memberData.firstName} ${memberData.lastName}</h2>
          
          <div style="${emailStyles.metaInfo}">
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Email</span>
              <span style="${emailStyles.metaValue}">${memberData.email}</span>
            </div>
            ${memberData.company ? `
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Société</span>
              <span style="${emailStyles.metaValue}">${memberData.company}</span>
            </div>
            ` : ''}
            ${memberData.phone ? `
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Téléphone</span>
              <span style="${emailStyles.metaValue}">${memberData.phone}</span>
            </div>
            ` : ''}
            ${memberData.role ? `
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Fonction</span>
              <span style="${emailStyles.metaValue}">${memberData.role}</span>
            </div>
            ` : ''}
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Proposé par</span>
              <span style="${emailStyles.metaValue}">${memberData.proposedBy}</span>
            </div>
          </div>

          ${memberData.notes ? `
          <div style="${emailStyles.description}">
            <strong>Notes :</strong><br>
            ${memberData.notes.replace(/\n/g, '<br>')}
          </div>
          ` : ''}

          <div style="text-align: center;">
            <a href="${context.adminDashboardUrl}/members" style="${emailStyles.button}">
              Voir dans le CRM
            </a>
          </div>

          <div style="${emailStyles.note}">
            Ce nouveau membre a été suggéré et attend votre contact pour intégrer ${brandingCore.organization.name}.
          </div>
        </main>

        <footer style="${emailStyles.footer}">
          ${brandingCore.organization.fullName}<br>
          Notification automatique
        </footer>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

export function createNewLoanItemEmailTemplate(
  loanItem: LoanItem,
  context: NotificationContext
): { subject: string; html: string } {
  const subject = `Nouveau matériel proposé au prêt : ${loanItem.title}`;
  
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
          <h1 style="${emailStyles.title}">${getShortAppName()}</h1>
          <p style="${emailStyles.subtitle}">Notification administrative</p>
        </header>

        <main style="${emailStyles.content}">
          <div style="${emailStyles.label}">Nouveau matériel au prêt</div>
          
          <h2 style="${emailStyles.itemTitle}">${loanItem.title}</h2>
          
          ${loanItem.description ? `
          <div style="${emailStyles.description}">
            ${loanItem.description.replace(/\n/g, '<br>')}
          </div>
          ` : ''}

          <div style="${emailStyles.metaInfo}">
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Prêté par</span>
              <span style="${emailStyles.metaValue}">${loanItem.lenderName}</span>
            </div>
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Proposé par</span>
              <span style="${emailStyles.metaValue}">${loanItem.proposedBy}</span>
            </div>
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Contact</span>
              <span style="${emailStyles.metaValue}">${loanItem.proposedByEmail}</span>
            </div>
            <div style="${emailStyles.metaRow}">
              <span style="${emailStyles.metaLabel}">Statut</span>
              <span style="${emailStyles.metaValue}">En attente de validation</span>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${context.adminDashboardUrl}" style="${emailStyles.button}">
              Accéder au tableau de bord
            </a>
          </div>

          <div style="${emailStyles.note}">
            Ce matériel nécessite votre validation avant d'être visible publiquement. Connectez-vous à l'interface d'administration pour le traiter.
          </div>
        </main>

        <footer style="${emailStyles.footer}">
          ${brandingCore.organization.fullName}<br>
          Notification automatique
        </footer>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

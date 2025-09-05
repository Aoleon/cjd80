import type { InsertDevelopmentRequest } from "@shared/schema";

interface GitHubIssueResponse {
  id: number;
  number: number;
  html_url: string;
  state: string;
}

interface GitHubIssuePayload {
  title: string;
  body: string;
  labels: string[];
}

interface GitHubErrorResponse {
  message: string;
  documentation_url?: string;
  errors?: Array<{ message: string }>;
}

/**
 * Crée une issue GitHub à partir d'une demande de développement
 */
export async function createGitHubIssue(request: Omit<InsertDevelopmentRequest, "requestedBy" | "requestedByName"> & { requestedBy: string; requestedByName: string }): Promise<GitHubIssueResponse | null> {
  const token = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER || "cjd-amiens"; // À ajuster selon votre repo
  const repoName = process.env.GITHUB_REPO_NAME || "boite-a-kiffs"; // À ajuster selon votre repo
  
  if (!token) {
    console.warn("[GitHub] GITHUB_TOKEN non configuré - création d'issue ignorée");
    return null;
  }
  
  if (!repoOwner || !repoName) {
    console.warn("[GitHub] GITHUB_REPO_OWNER ou GITHUB_REPO_NAME non configuré");
    return null;
  }

  try {
    const labels = [
      request.type === "bug" ? "bug" : "enhancement",
      `priority-${request.priority}`
    ];

    const body = [
      `**Description:**`,
      request.description,
      ``,
      `**Type:** ${request.type === "bug" ? "🐛 Bug" : "✨ Fonctionnalité"}`,
      `**Priorité:** ${getPriorityEmoji(request.priority)} ${request.priority}`,
      `**Demandé par:** ${request.requestedByName} (${request.requestedBy})`,
      ``,
      `---`,
      `*Issue créée automatiquement depuis l'interface d'administration CJD Amiens*`
    ].join('\n');

    const issuePayload: GitHubIssuePayload = {
      title: request.title,
      body,
      labels
    };

    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issuePayload)
    });

    if (!response.ok) {
      const errorData: GitHubErrorResponse = await response.json();
      console.error("[GitHub] Erreur création issue:", response.status, errorData);
      return null;
    }

    const issueData: GitHubIssueResponse = await response.json();
    console.log(`[GitHub] Issue créée: #${issueData.number} - ${request.title}`);
    
    return issueData;
  } catch (error) {
    console.error("[GitHub] Erreur lors de la création de l'issue:", error);
    return null;
  }
}

/**
 * Synchronise le statut d'une issue GitHub avec une demande locale
 */
export async function syncGitHubIssueStatus(issueNumber: number): Promise<{ status: string; closed: boolean } | null> {
  const token = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER || "cjd-amiens";
  const repoName = process.env.GITHUB_REPO_NAME || "boite-a-kiffs";
  
  if (!token || !repoOwner || !repoName) {
    return null;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues/${issueNumber}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    if (!response.ok) {
      console.error(`[GitHub] Erreur récupération issue #${issueNumber}:`, response.status);
      return null;
    }

    const issueData: GitHubIssueResponse = await response.json();
    
    return {
      status: issueData.state,
      closed: issueData.state === "closed"
    };
  } catch (error) {
    console.error(`[GitHub] Erreur synchronisation issue #${issueNumber}:`, error);
    return null;
  }
}

/**
 * Ferme une issue GitHub
 */
export async function closeGitHubIssue(issueNumber: number, reason?: string): Promise<boolean> {
  const token = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER || "cjd-amiens";
  const repoName = process.env.GITHUB_REPO_NAME || "boite-a-kiffs";
  
  if (!token || !repoOwner || !repoName) {
    return false;
  }

  try {
    const payload: any = {
      state: "closed"
    };

    if (reason) {
      payload.state_reason = reason === "completed" ? "completed" : "not_planned";
    }

    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues/${issueNumber}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`[GitHub] Erreur fermeture issue #${issueNumber}:`, response.status);
      return false;
    }

    console.log(`[GitHub] Issue fermée: #${issueNumber}`);
    return true;
  } catch (error) {
    console.error(`[GitHub] Erreur fermeture issue #${issueNumber}:`, error);
    return false;
  }
}

/**
 * Ajoute un commentaire à une issue GitHub
 */
export async function addGitHubComment(issueNumber: number, comment: string): Promise<boolean> {
  const token = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER || "cjd-amiens";
  const repoName = process.env.GITHUB_REPO_NAME || "boite-a-kiffs";
  
  if (!token || !repoOwner || !repoName) {
    return false;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues/${issueNumber}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body: comment })
    });

    if (!response.ok) {
      console.error(`[GitHub] Erreur ajout commentaire issue #${issueNumber}:`, response.status);
      return false;
    }

    console.log(`[GitHub] Commentaire ajouté à l'issue #${issueNumber}`);
    return true;
  } catch (error) {
    console.error(`[GitHub] Erreur ajout commentaire issue #${issueNumber}:`, error);
    return false;
  }
}

/**
 * Retourne l'emoji correspondant à la priorité
 */
function getPriorityEmoji(priority: string): string {
  switch (priority) {
    case "critical": return "🔥";
    case "high": return "🚨";
    case "medium": return "⚠️";
    case "low": return "ℹ️";
    default: return "📋";
  }
}
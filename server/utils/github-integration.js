"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGitHubIssue = createGitHubIssue;
exports.syncGitHubIssueStatus = syncGitHubIssueStatus;
exports.closeGitHubIssue = closeGitHubIssue;
exports.addGitHubComment = addGitHubComment;
/**
 * Crée une issue GitHub à partir d'une demande de développement
 */
async function createGitHubIssue(request) {
    const token = process.env.GITHUB_TOKEN;
    const repoOwner = process.env.GITHUB_REPO_OWNER || "Aoleon";
    const repoName = process.env.GITHUB_REPO_NAME || "cjd80";
    if (!token) {
        console.warn("[GitHub] GITHUB_TOKEN non configuré - création d'issue ignorée");
        return null;
    }
    if (!repoOwner || !repoName) {
        console.warn("[GitHub] GITHUB_REPO_OWNER ou GITHUB_REPO_NAME non configuré");
        return null;
    }
    try {
        // Debug: Vérifier d'abord si le repository existe
        console.log(`[GitHub] Test d'accès au repository ${repoOwner}/${repoName}`);
        const repoResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
            }
        });
        if (!repoResponse.ok) {
            const repoError = await repoResponse.json();
            console.error(`[GitHub] Erreur accès repository (${repoResponse.status}):`, repoError);
            return null;
        }
        console.log(`[GitHub] Repository accessible - procédure de création d'issue`);
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
        const issuePayload = {
            title: request.title,
            body,
            labels
        };
        console.log(`[GitHub] Création issue avec payload:`, JSON.stringify(issuePayload, null, 2));
        const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'CJD-Amiens-Bot/1.0'
            },
            body: JSON.stringify(issuePayload)
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error("[GitHub] Erreur création issue:", response.status, errorData);
            // Debug supplémentaire
            console.error("[GitHub] Headers envoyés:", {
                'Authorization': `Bearer ${token.substring(0, 10)}...`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'CJD-Amiens-Bot/1.0'
            });
            return null;
        }
        const issueData = await response.json();
        console.log(`[GitHub] Issue créée avec succès: #${issueData.number} - ${request.title}`);
        return issueData;
    }
    catch (error) {
        console.error("[GitHub] Erreur lors de la création de l'issue:", error);
        return null;
    }
}
/**
 * Synchronise le statut d'une issue GitHub avec une demande locale
 */
async function syncGitHubIssueStatus(issueNumber) {
    const token = process.env.GITHUB_TOKEN;
    const repoOwner = process.env.GITHUB_REPO_OWNER || "Aoleon";
    const repoName = process.env.GITHUB_REPO_NAME || "cjd80";
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
        const issueData = await response.json();
        return {
            status: issueData.state,
            closed: issueData.state === "closed"
        };
    }
    catch (error) {
        console.error(`[GitHub] Erreur synchronisation issue #${issueNumber}:`, error);
        return null;
    }
}
/**
 * Ferme une issue GitHub
 */
async function closeGitHubIssue(issueNumber, reason) {
    const token = process.env.GITHUB_TOKEN;
    const repoOwner = process.env.GITHUB_REPO_OWNER || "Aoleon";
    const repoName = process.env.GITHUB_REPO_NAME || "cjd80";
    if (!token || !repoOwner || !repoName) {
        return false;
    }
    try {
        const payload = {
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
    }
    catch (error) {
        console.error(`[GitHub] Erreur fermeture issue #${issueNumber}:`, error);
        return false;
    }
}
/**
 * Ajoute un commentaire à une issue GitHub
 */
async function addGitHubComment(issueNumber, comment) {
    const token = process.env.GITHUB_TOKEN;
    const repoOwner = process.env.GITHUB_REPO_OWNER || "Aoleon";
    const repoName = process.env.GITHUB_REPO_NAME || "cjd80";
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
    }
    catch (error) {
        console.error(`[GitHub] Erreur ajout commentaire issue #${issueNumber}:`, error);
        return false;
    }
}
/**
 * Retourne l'emoji correspondant à la priorité
 */
function getPriorityEmoji(priority) {
    switch (priority) {
        case "critical": return "🔥";
        case "high": return "🚨";
        case "medium": return "⚠️";
        case "low": return "ℹ️";
        default: return "📋";
    }
}

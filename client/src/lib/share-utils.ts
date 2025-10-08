export interface ShareOptions {
  title: string;
  text: string;
  url?: string;
}

export interface ShareResult {
  success: boolean;
  reason?: 'cancelled' | 'error';
  message?: string;
}

/**
 * Share content using Web Share API with clipboard fallback
 * @param options Share options (title, text, url)
 * @returns ShareResult with success status and optional reason/message
 */
export async function shareContent(options: ShareOptions): Promise<ShareResult> {
  try {
    // Check if Web Share API is available
    if (isShareSupported()) {
      // Check if the specific content can be shared
      if (canShareContent(options)) {
        await navigator.share(options);
        return { success: true };
      }
    }
    
    // Fallback: copy URL to clipboard
    const urlToCopy = options.url || window.location.href;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(urlToCopy);
      return { success: true };
    }
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = urlToCopy;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      textArea.remove();
      return { success: true };
    } catch (err) {
      textArea.remove();
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la copie';
      return { success: false, reason: 'error', message: errorMessage };
    }
  } catch (error) {
    // AbortError means user cancelled the share dialog
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, reason: 'cancelled' };
    }
    
    // Any other error
    console.error('Error sharing content:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return { success: false, reason: 'error', message: errorMessage };
  }
}

/**
 * Check if Web Share API is supported
 * @returns true if navigator.share is available
 */
export function isShareSupported(): boolean {
  return 'share' in navigator;
}

/**
 * Check if specific content can be shared
 * @param data Share data to check
 * @returns true if content can be shared
 */
export function canShareContent(data: ShareOptions): boolean {
  if ('canShare' in navigator) {
    return navigator.canShare(data);
  }
  // If canShare is not available, assume it can be shared if share is supported
  return isShareSupported();
}

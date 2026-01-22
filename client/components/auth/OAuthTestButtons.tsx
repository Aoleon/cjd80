'use client';

import { useState } from 'react';
import {
  generatePkceParams,
  storePkceVerifier,
} from '@/lib/auth/pkce';

/**
 * OAuth Test Component - PKCE Implementation Test
 *
 * Tests PKCE utilities and displays generated values
 */
export function OAuthTestButtons() {
  const [pkceData, setPkceData] = useState<{
    codeVerifier: string;
    codeChallenge: string;
    codeChallengeMethod: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const handleGeneratePkce = async () => {
    setLoading(true);
    setError(null);

    try {
      // Generate PKCE parameters
      const pkce = await generatePkceParams();
      setPkceData(pkce);

      // Store verifier in sessionStorage
      storePkceVerifier(pkce.codeVerifier, 'session');

      console.log('✅ PKCE Generated:', {
        verifier_length: pkce.codeVerifier.length,
        challenge_length: pkce.codeChallenge.length,
        method: pkce.codeChallengeMethod,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate PKCE';
      setError(errorMsg);
      console.error('❌ PKCE Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestOAuth = (provider: 'google' | 'azure') => {
    if (!pkceData) {
      alert('Generate PKCE first!');
      return;
    }

    // Build OAuth URL with PKCE
    const params = new URLSearchParams({
      code_challenge: pkceData.codeChallenge,
      code_challenge_method: pkceData.codeChallengeMethod,
    });

    const oauthUrl = `${apiUrl}/auth/${provider}/pkce?${params.toString()}`;

    console.log(`🔗 OAuth URL (${provider}):`, oauthUrl);

    // In real app, this would redirect
    // window.location.href = oauthUrl;

    alert(`OAuth URL ready! Check console for details.\n\nProvider: ${provider}\nPKCE Challenge: ${pkceData.codeChallenge.substring(0, 20)}...`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">OAuth PKCE Test</h2>

        {/* Generate PKCE Button */}
        <div className="mb-6">
          <button
            onClick={handleGeneratePkce}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Generating...' : '🔐 Generate PKCE Parameters'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold">❌ Error:</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* PKCE Data Display */}
        {pkceData && (
          <div className="mb-6 space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold mb-2">✅ PKCE Generated Successfully!</p>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Code Verifier:</p>
                  <p className="font-mono text-xs bg-white p-2 rounded mt-1 break-all border">
                    {pkceData.codeVerifier}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Length: {pkceData.codeVerifier.length} characters</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-700">Code Challenge (SHA-256):</p>
                  <p className="font-mono text-xs bg-white p-2 rounded mt-1 break-all border">
                    {pkceData.codeChallenge}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">Length: {pkceData.codeChallenge.length} characters</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-700">Challenge Method:</p>
                  <p className="font-mono text-xs bg-white p-2 rounded mt-1 border">
                    {pkceData.codeChallengeMethod}
                  </p>
                </div>
              </div>
            </div>

            {/* OAuth Provider Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleTestOAuth('google')}
                className="bg-white hover:bg-gray-50 border-2 border-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                🔗 Test Google OAuth
              </button>

              <button
                onClick={() => handleTestOAuth('azure')}
                className="bg-white hover:bg-gray-50 border-2 border-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                🔗 Test Azure OAuth
              </button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-semibold mb-2">ℹ️ About PKCE</p>
          <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
            <li>PKCE adds security for mobile/SPA apps</li>
            <li>Code verifier: Random 128-char string</li>
            <li>Code challenge: SHA-256 hash (base64url)</li>
            <li>Provider validates: SHA256(verifier) === challenge</li>
          </ul>
        </div>

        {/* SessionStorage Info */}
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-semibold mb-1">💾 Storage</p>
          <p className="text-yellow-700 text-sm">
            Code verifier stored in <code className="font-mono bg-yellow-100 px-1">sessionStorage</code>
          </p>
          <button
            onClick={() => {
              const verifier = sessionStorage.getItem('oauth_pkce_verifier');
              alert(verifier ? `Stored verifier:\n${verifier.substring(0, 50)}...` : 'No verifier in storage');
            }}
            className="mt-2 text-xs bg-yellow-200 hover:bg-yellow-300 px-3 py-1 rounded"
          >
            Check sessionStorage
          </button>
        </div>
      </div>
    </div>
  );
}

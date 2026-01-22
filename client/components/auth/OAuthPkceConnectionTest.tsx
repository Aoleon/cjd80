'use client';

import { useState } from 'react';
import {
  generatePkceParams,
  storePkceVerifier,
  retrievePkceVerifier,
} from '@/lib/auth/pkce';

/**
 * OAuth PKCE Connection Test Component
 *
 * Tests complete PKCE flow including verification
 */
export function OAuthPkceConnectionTest() {
  const [step, setStep] = useState<number>(0);
  const [pkceData, setPkceData] = useState<{
    codeVerifier: string;
    codeChallenge: string;
    codeChallengeMethod: string;
  } | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Step 1: Generate PKCE parameters (Client-side)
  const handleStep1_GeneratePkce = async () => {
    console.log('🔐 Step 1: Generating PKCE parameters...');

    const pkce = await generatePkceParams();
    setPkceData(pkce);

    // Store verifier (as would be done before OAuth redirect)
    storePkceVerifier(pkce.codeVerifier, 'session');

    console.log('✅ Step 1 Complete:', {
      verifier_length: pkce.codeVerifier.length,
      challenge_length: pkce.codeChallenge.length,
      method: pkce.codeChallengeMethod,
    });

    setStep(1);
  };

  // Step 2: Simulate OAuth Callback (Server would verify)
  const handleStep2_SimulateCallback = async () => {
    console.log('🔄 Step 2: Simulating OAuth callback...');

    // Retrieve stored verifier
    const storedVerifier = retrievePkceVerifier('session');

    if (!storedVerifier) {
      setVerificationResult({
        success: false,
        message: 'No verifier found in sessionStorage!',
      });
      return;
    }

    // Server would do this: verify code_challenge matches code_verifier
    const isValid = await verifyPkceChallenge(
      storedVerifier,
      pkceData!.codeChallenge
    );

    console.log('🔍 Step 2 Verification:', {
      stored_verifier: storedVerifier.substring(0, 30) + '...',
      expected_challenge: pkceData!.codeChallenge,
      valid: isValid,
    });

    setVerificationResult({
      success: isValid,
      message: isValid
        ? '✅ PKCE Verification Successful! code_verifier matches code_challenge.'
        : '❌ PKCE Verification Failed! Mismatch detected.',
    });

    setStep(2);
  };

  // Step 3: Clear and restart
  const handleStep3_Reset = () => {
    console.log('🔄 Resetting test...');
    sessionStorage.removeItem('oauth_pkce_verifier');
    setPkceData(null);
    setVerificationResult(null);
    setStep(0);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">
          OAuth PKCE Connection Flow Test
        </h2>
        <p className="text-gray-600 mb-6">
          Simulates complete OAuth PKCE flow with verification
        </p>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 0
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              1
            </div>
            <span className="text-xs mt-2">Generate PKCE</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200">
            <div
              className={`h-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`}
            ></div>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              2
            </div>
            <span className="text-xs mt-2">Verify</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200">
            <div
              className={`h-full ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}
            ></div>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 2
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              ✓
            </div>
            <span className="text-xs mt-2">Complete</span>
          </div>
        </div>

        {/* Step 1: Generate PKCE */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Step 1: Generate PKCE Parameters</h3>
            <p className="text-sm text-gray-600">
              Click below to generate cryptographic PKCE parameters (code_verifier and code_challenge).
            </p>
            <button
              onClick={handleStep1_GeneratePkce}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              🔐 Generate PKCE Parameters
            </button>
          </div>
        )}

        {/* Step 1 Results */}
        {step >= 1 && pkceData && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-semibold mb-3">
              ✅ PKCE Parameters Generated
            </p>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-gray-700">Code Verifier (stored in sessionStorage):</p>
                <p className="font-mono text-xs bg-white p-2 rounded mt-1 break-all border">
                  {pkceData.codeVerifier.substring(0, 80)}...
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Length: {pkceData.codeVerifier.length} chars
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Code Challenge (sent to OAuth provider):</p>
                <p className="font-mono text-xs bg-white p-2 rounded mt-1 break-all border">
                  {pkceData.codeChallenge}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Length: {pkceData.codeChallenge.length} chars (SHA-256 hash)
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Challenge Method:</p>
                <p className="font-mono text-xs bg-white p-2 rounded mt-1 border">
                  {pkceData.codeChallengeMethod}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Verify */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Step 2: Simulate OAuth Callback & Verify</h3>
            <p className="text-sm text-gray-600">
              Simulate OAuth provider callback and verify that code_verifier matches code_challenge.
            </p>
            <button
              onClick={handleStep2_SimulateCallback}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              🔍 Verify PKCE Challenge
            </button>
          </div>
        )}

        {/* Step 2 Results */}
        {step >= 2 && verificationResult && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              verificationResult.success
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <p
              className={`font-semibold mb-2 ${
                verificationResult.success ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {verificationResult.message}
            </p>
            {verificationResult.success && (
              <p className="text-green-700 text-sm">
                The PKCE flow is working correctly. In a real OAuth flow, the server would
                perform this verification to ensure the client that started the flow is the
                same client completing it.
              </p>
            )}
          </div>
        )}

        {/* Step 3: Reset */}
        {step === 2 && (
          <button
            onClick={handleStep3_Reset}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            🔄 Run Test Again
          </button>
        )}

        {/* Technical Details */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-semibold mb-2">🔬 How PKCE Works</p>
          <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
            <li>Client generates random <code className="bg-blue-100 px-1">code_verifier</code></li>
            <li>Client computes <code className="bg-blue-100 px-1">code_challenge = SHA256(code_verifier)</code></li>
            <li>Client stores <code className="bg-blue-100 px-1">code_verifier</code> locally (sessionStorage)</li>
            <li>Client sends <code className="bg-blue-100 px-1">code_challenge</code> to OAuth provider</li>
            <li>OAuth provider stores the challenge and redirects back with authorization code</li>
            <li>Client sends both authorization code + <code className="bg-blue-100 px-1">code_verifier</code> to token endpoint</li>
            <li>Server validates: <code className="bg-blue-100 px-1">SHA256(code_verifier) === stored code_challenge</code></li>
            <li>If match: issue access token. If no match: reject (security breach detected)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// Helper function to verify PKCE challenge (simulates server-side verification)
async function verifyPkceChallenge(
  codeVerifier: string,
  expectedChallenge: string
): Promise<boolean> {
  // Compute challenge from verifier
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);

  // Base64URL encode
  const computedChallenge = btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  console.log('🔍 PKCE Verification:', {
    computed_challenge: computedChallenge,
    expected_challenge: expectedChallenge,
    match: computedChallenge === expectedChallenge,
  });

  return computedChallenge === expectedChallenge;
}

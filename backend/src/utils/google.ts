/**
 * Google IDトークン検証ユーティリティ
 */

import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export interface GoogleUserInfo {
  googleId: string;
  email: string;
  displayName: string;
  pictureUrl?: string;
}

/**
 * Google IDトークンを検証し、ユーザー情報を返す
 * @param idToken Google IDトークン
 * @returns ユーザー情報、検証失敗時はnull
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleUserInfo | null> {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      return null;
    }
    return {
      googleId: payload.sub,
      email: payload.email,
      displayName: payload.name || payload.email,
      pictureUrl: payload.picture,
    };
  } catch (error) {
    console.error('Google ID token verification failed:', error);
    return null;
  }
}

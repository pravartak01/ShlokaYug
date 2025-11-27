const { OAuth2Client } = require('google-auth-library');

class GoogleAuthService {
  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Validate Google ID token
   * @param {string} tokenId - Google ID token from frontend
   * @returns {object} - Google user payload
   */
  async validateGoogleToken(tokenId) {
    try {
      if (!tokenId) {
        throw new Error('Token ID is required');
      }

      // Verify the token
      const ticket = await this.client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error('Invalid token payload');
      }

      // Verify token audience
      if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
        throw new Error('Token audience mismatch');
      }

      // Verify token issuer
      if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') {
        throw new Error('Invalid token issuer');
      }

      // Check token expiry
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        throw new Error('Token has expired');
      }

      // Return normalized user data
      return {
        sub: payload.sub, // Google user ID
        email: payload.email,
        email_verified: payload.email_verified,
        given_name: payload.given_name,
        family_name: payload.family_name,
        name: payload.name,
        picture: payload.picture,
        locale: payload.locale,
      };
    } catch (error) {
      console.error('Google token validation error:', error);
      throw new Error(`Invalid Google token: ${error.message}`);
    }
  }

  /**
   * Get Google OAuth authorization URL
   * @param {string} state - State parameter for CSRF protection
   * @returns {string} - Authorization URL
   */
  getAuthUrl(state = null) {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const params = {
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
      response_type: 'code',
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    };

    if (state) {
      params.state = state;
    }

    return this.client.generateAuthUrl(params);
  }

  /**
   * Exchange authorization code for tokens
   * @param {string} code - Authorization code from Google
   * @returns {object} - Token response with user info
   */
  async exchangeCodeForTokens(code) {
    try {
      if (!code) {
        throw new Error('Authorization code is required');
      }

      // Exchange code for tokens
      const { tokens } = await this.client.getToken(code);
      this.client.setCredentials(tokens);

      // Get user info using the access token
      const userInfo = await this.getUserInfo(tokens.access_token);

      return {
        tokens,
        userInfo,
      };
    } catch (error) {
      console.error('Token exchange error:', error);
      throw new Error(`Token exchange failed: ${error.message}`);
    }
  }

  /**
   * Get user information using access token
   * @param {string} accessToken - Google access token
   * @returns {object} - User information
   */
  async getUserInfo(accessToken) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.statusText}`);
      }

      const userInfo = await response.json();
      return userInfo;
    } catch (error) {
      console.error('Get user info error:', error);
      throw new Error(`Failed to get user info: ${error.message}`);
    }
  }

  /**
   * Verify access token
   * @param {string} accessToken - Google access token
   * @returns {object} - Token info
   */
  async verifyAccessToken(accessToken) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error('Invalid access token');
      }

      const tokenInfo = await response.json();

      // Verify audience
      if (tokenInfo.audience !== process.env.GOOGLE_CLIENT_ID) {
        throw new Error('Token audience mismatch');
      }

      return tokenInfo;
    } catch (error) {
      console.error('Access token verification error:', error);
      throw new Error(`Access token verification failed: ${error.message}`);
    }
  }

  /**
   * Revoke Google tokens
   * @param {string} token - Access or refresh token to revoke
   */
  async revokeToken(token) {
    try {
      const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        throw new Error('Token revocation failed');
      }

      return true;
    } catch (error) {
      console.error('Token revocation error:', error);
      throw new Error(`Token revocation failed: ${error.message}`);
    }
  }

  /**
   * Get service configuration status
   */
  getStatus() {
    return {
      clientId: !!process.env.GOOGLE_CLIENT_ID,
      clientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
      isConfigured: !!(
        process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET &&
        process.env.GOOGLE_REDIRECT_URI
      ),
    };
  }
}

// Create and export singleton instance
const googleAuthService = new GoogleAuthService();

module.exports = {
  googleAuthService,
  validateGoogleToken: (tokenId) => googleAuthService.validateGoogleToken(tokenId),
  getGoogleAuthUrl: (state) => googleAuthService.getAuthUrl(state),
  exchangeCodeForTokens: (code) => googleAuthService.exchangeCodeForTokens(code),
};

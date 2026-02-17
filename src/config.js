import 'dotenv/config';

export const config = {
  port: process.env.PORT || 3000,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  twitter: {
    clientId: process.env.TWITTER_CLIENT_ID || '',
    clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
    callbackUrl: `http://localhost:${process.env.PORT || 3000}/auth/twitter/callback`,
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    callbackUrl: `http://localhost:${process.env.PORT || 3000}/auth/linkedin/callback`,
  },
  substackUrl: process.env.SUBSTACK_URL || '',
};

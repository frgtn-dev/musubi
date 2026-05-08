import { betterAuth } from 'better-auth';
import { bearer } from "better-auth/plugins";
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db, schema } from '@musubi/db';
import { config } from '@musubi/config';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: [
    "musubi://",
    ...(config.api.environment === "dev" ? [
      "exp://",                      // Trust all Expo URLs (prefix matching)
      "exp://**",                    // Trust all Expo URLs (wildcard matching)
      "exp://192.168.*.*:*/**",      // Trust 192.168.x.x IP range with any port and path
      "exp://10.0.2.2:*/**",
    ] : [])
  ],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    deleteUser: {
      enabled: true,
    }
  },
  plugins: [
    bearer()
  ],
});

import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "../db"
import { accounts, households, sessions, users, verifications } from "../db/schema"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      householdId: {
        type: "number",
        required: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const [household] = await db
            .insert(households)
            .values({ name: "My Household" })
            .returning()
          return {
            data: { ...user, householdId: household.id },
          }
        },
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
})

import { createServerFn } from "@tanstack/react-start"
import { getSessionUser } from "@/server/auth"
import { requireProfile } from "@/server/profile"

export const getAppSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const user = await getSessionUser()
    if (!user) return null
    const profile = await requireProfile(user.userId)
    return { ...user, householdId: profile.householdId }
  },
)

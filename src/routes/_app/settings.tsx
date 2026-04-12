import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { getHousehold, updateHouseholdName } from "@/server/functions/settings"

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
  loader: () => getHousehold(),
})

function SettingsPage() {
  const household = Route.useLoaderData()
  const { data: session } = authClient.useSession()

  const [profileName, setProfileName] = React.useState(session?.user.name ?? "")
  const [profileSaving, setProfileSaving] = React.useState(false)
  const [profileSaved, setProfileSaved] = React.useState(false)

  const [householdName, setHouseholdName] = React.useState(household.name)
  const [householdSaving, setHouseholdSaving] = React.useState(false)
  const [householdSaved, setHouseholdSaved] = React.useState(false)

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profileName.trim()) return
    setProfileSaving(true)
    try {
      await authClient.updateUser({ name: profileName.trim() })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    } finally {
      setProfileSaving(false)
    }
  }

  async function handleHouseholdSave(e: React.FormEvent) {
    e.preventDefault()
    if (!householdName.trim()) return
    setHouseholdSaving(true)
    try {
      await updateHouseholdName({ data: { name: householdName } })
      setHouseholdSaved(true)
      setTimeout(() => setHouseholdSaved(false), 2000)
    } finally {
      setHouseholdSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and household.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your display name.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Name</p>
              <Input
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Email</p>
              <Input value={session?.user.email ?? ""} disabled />
            </div>
            <Button type="submit" disabled={profileSaving || !profileName.trim()}>
              {profileSaved ? "Saved!" : profileSaving ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Household */}
      <Card>
        <CardHeader>
          <CardTitle>Household</CardTitle>
          <CardDescription>
            All members of your household share recipes, collections, and meal plans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleHouseholdSave} className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Household name</p>
              <Input
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                placeholder="e.g. The Johnson Family"
              />
            </div>
            <Button type="submit" disabled={householdSaving || !householdName.trim()}>
              {householdSaved ? "Saved!" : householdSaving ? "Saving…" : "Save household"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your session.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={async () => {
              await authClient.signOut()
              window.location.href = "/sign-in"
            }}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

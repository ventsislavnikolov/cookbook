import * as React from "react"
import {
  createFileRoute,
  Outlet,
  Link,
  redirect,
  useRouterState,
} from "@tanstack/react-router"
import {
  BookOpenIcon,
  FolderOpenIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
  SettingsIcon,
  ChefHatIcon,
  LogOutIcon,
  HeartIcon,
  ClockIcon,
  Trash2Icon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"
import { getAppSession } from "@/server/functions/session"

export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: async () => {
    const session = await getAppSession()
    if (!session) throw redirect({ to: "/sign-in" })
    return { session }
  },
  component: AppLayout,
  pendingComponent: AppShellPending,
})

const navItems = [
  { title: "Recipes", to: "/recipes" as const, icon: BookOpenIcon },
  { title: "Favorites", to: "/favorites" as const, icon: HeartIcon },
  { title: "Recent", to: "/recent" as const, icon: ClockIcon },
  { title: "Collections", to: "/collections" as const, icon: FolderOpenIcon },
  { title: "Meal Plan", to: "/meal-plan" as const, icon: CalendarDaysIcon },
  { title: "Cook Log", to: "/cook-log" as const, icon: ClipboardListIcon },
  { title: "Trash", to: "/trash" as const, icon: Trash2Icon },
]

function AppLayout() {
  const { session } = Route.useRouteContext()

  return (
    <SidebarProvider>
      <AppSidebar user={session} />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 flex-col overflow-auto p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function AppShellPending() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 p-2">
                <Skeleton className="size-8 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({ length: 7 }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <div className="flex items-center gap-2 p-2">
                      <Skeleton className="size-4" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 px-4">
          <Skeleton className="size-7" />
        </header>
        <div className="flex flex-1 flex-col gap-4 overflow-auto p-6">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-40 rounded-lg" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function AppSidebar({ user }: { user: { name: string | null; email: string | null } }) {
  const { location } = useRouterState()
  const pathname = location.pathname

  async function handleSignOut() {
    await authClient.signOut()
    window.location.href = "/sign-in"
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ChefHatIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Cookbook</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.to)}
                    tooltip={item.title}
                    render={<Link to={item.to} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              isActive={pathname === "/settings"}
              render={<Link to="/settings" />}
            >
              <SettingsIcon />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Sign out" onClick={handleSignOut}>
              <LogOutIcon />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

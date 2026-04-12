import * as React from "react"
import {
  createFileRoute,
  Outlet,
  Link,
  useNavigate,
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
import { Separator } from "@/components/ui/separator"
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/_app")({
  component: AppLayout,
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
  const { data: session, isPending } = authClient.useSession()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (!isPending && !session) {
      navigate({ to: "/sign-in" })
    }
  }, [session, isPending, navigate])

  if (isPending || !session) return null

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
        </header>
        <div className="flex flex-1 flex-col overflow-auto p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function AppSidebar({ user }: { user: { name: string; email: string } }) {
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

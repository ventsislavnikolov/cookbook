import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/collections")({
  component: CollectionsLayout,
})

function CollectionsLayout() {
  return <Outlet />
}

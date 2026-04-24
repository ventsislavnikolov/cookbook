import { createFileRoute } from "@tanstack/react-router"

function stripCookieDomain(setCookie: string): string {
  return setCookie
    .split(";")
    .filter((part) => !/^\s*domain=/i.test(part))
    .join(";")
}

async function proxy({
  request,
  params,
}: {
  request: Request
  params: { _splat?: string }
}): Promise<Response> {
  const target = process.env.NEON_AUTH_URL ?? process.env.VITE_NEON_AUTH_URL
  if (!target) {
    return new Response("NEON_AUTH_URL is not set", { status: 500 })
  }

  const incomingUrl = new URL(request.url)
  const suffix = params._splat ?? ""
  const targetBase = target.replace(/\/$/, "")
  const targetUrl = `${targetBase}/${suffix}${incomingUrl.search}`
  const targetOrigin = new URL(targetBase).origin

  const forwardHeaders = new Headers(request.headers)
  forwardHeaders.delete("host")
  forwardHeaders.delete("content-length")
  forwardHeaders.delete("x-forwarded-host")
  forwardHeaders.delete("x-forwarded-proto")
  forwardHeaders.delete("x-forwarded-for")
  forwardHeaders.delete("x-real-ip")
  forwardHeaders.delete("x-vercel-deployment-url")
  forwardHeaders.delete("x-vercel-forwarded-for")
  forwardHeaders.delete("x-vercel-id")
  forwardHeaders.set("origin", targetOrigin)
  if (forwardHeaders.has("referer")) {
    forwardHeaders.set("referer", targetOrigin + "/")
  }

  const init: RequestInit = {
    method: request.method,
    headers: forwardHeaders,
    redirect: "manual",
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer()
  }

  const upstream = await fetch(targetUrl, init)

  const responseHeaders = new Headers(upstream.headers)
  const setCookies =
    typeof (upstream.headers as Headers & { getSetCookie?: () => string[] })
      .getSetCookie === "function"
      ? (upstream.headers as Headers & { getSetCookie: () => string[] }).getSetCookie()
      : []

  if (setCookies.length > 0) {
    responseHeaders.delete("set-cookie")
    for (const cookie of setCookies) {
      responseHeaders.append("set-cookie", stripCookieDomain(cookie))
    }
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: proxy,
      POST: proxy,
      PUT: proxy,
      PATCH: proxy,
      DELETE: proxy,
      OPTIONS: proxy,
    },
  },
})

import { defineHandler, proxyRequest } from "nitro"

function stripCookieDomain(setCookie: string): string {
  return setCookie
    .split(/,(?=\s*[^;=\s]+=)/)
    .map((cookie) =>
      cookie
        .split(";")
        .filter((part) => !/^\s*domain=/i.test(part))
        .join(";"),
    )
    .join(", ")
}

export default defineHandler(async (event) => {
  const target = process.env.NEON_AUTH_URL ?? process.env.VITE_NEON_AUTH_URL
  if (!target) {
    throw new Error("NEON_AUTH_URL is not set")
  }

  const { path = "" } = event.context.params ?? {}
  const url = event.url
  const suffix = typeof path === "string" ? path : ""
  const targetUrl = `${target.replace(/\/$/, "")}/${suffix}${url.search}`

  return proxyRequest(event, targetUrl, {
    onResponse(_event, response) {
      const setCookie = response.headers.getSetCookie?.() ?? []
      if (setCookie.length > 0) {
        response.headers.delete("set-cookie")
        for (const cookie of setCookie) {
          response.headers.append("set-cookie", stripCookieDomain(cookie))
        }
      }
    },
  })
})

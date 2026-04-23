import path from "path"
import { defineConfig } from "vitest/config"
import { config } from "dotenv"

config({ path: path.resolve(__dirname, ".env") })

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

import nextConfig from "eslint-config-next"

const config = [
  ...nextConfig,
  {
    ignores: ["node_modules", ".next", "out", "dist", "coverage"],
  },
]

export default config

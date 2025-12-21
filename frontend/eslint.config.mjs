/* eslint-disable import/no-anonymous-default-export */
import next from "eslint-config-next"

export default [
  {
    ignores: ["node_modules", ".next", "out", "dist", "coverage"],
  },
  ...next,
]

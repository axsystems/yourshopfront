import path from "node:path"
import type { NextConfig } from "next"
import withBundleAnalyzer from "@next/bundle-analyzer"

const analyze = withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default analyze(nextConfig)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // No ESLint setup in this project; type safety comes from `yarn typecheck` and the build.
  eslint: { ignoreDuringBuilds: true },
  // Keeps images working on plain static hosting as well as on Vercel.
  images: { unoptimized: true },
}

export default nextConfig

/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPages ? "/decision-flow" : "",
  assetPrefix: isGitHubPages ? "/decision-flow/" : "",
};

export default nextConfig;

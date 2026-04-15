const githubRepository = process.env.GITHUB_REPOSITORY || "";
const repositoryName = githubRepository.split("/")[1] || "";
const isPagesBuild = process.env.GITHUB_PAGES === "true";
const isProjectPage = Boolean(isPagesBuild && repositoryName);
const basePath = isProjectPage ? `/${repositoryName}` : "";

if (!process.env.NEXT_PUBLIC_API_URL) {
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isPagesBuild ? "export" : undefined,
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: isProjectPage ? `${basePath}/` : "",
};

module.exports = nextConfig;

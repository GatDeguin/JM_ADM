const githubRepository = process.env.GITHUB_REPOSITORY || "";
const repositoryName = githubRepository.split("/")[1] || "";
const isProjectPage = Boolean(process.env.GITHUB_PAGES && repositoryName);
const basePath = isProjectPage ? `/${repositoryName}` : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: isProjectPage ? `${basePath}/` : "",
};

module.exports = nextConfig;

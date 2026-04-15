const githubRepository = process.env.GITHUB_REPOSITORY || "";
const repositoryName = githubRepository.split("/")[1] || "";
const isProjectPage = Boolean(process.env.GITHUB_PAGES && repositoryName);
const basePath = isProjectPage ? `/${repositoryName}` : "";

const requiredWebEnvKeys = ["NEXT_PUBLIC_API_URL"];
const missingWebEnvKeys = requiredWebEnvKeys.filter((key) => !process.env[key]);

if (missingWebEnvKeys.length > 0) {
  throw new Error(`Missing required web environment variables: ${missingWebEnvKeys.join(", ")}`);
}

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

module.exports = {
  root: true,
  ignorePatterns: [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/playwright-report/**",
    "**/test-results/**",
  ],
  overrides: [
    {
      files: ["apps/api/**/*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["./apps/api/tsconfig.json"],
        tsconfigRootDir: __dirname,
      },
      plugins: ["@typescript-eslint"],
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "warn",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/consistent-type-imports": "warn",
        "@typescript-eslint/no-explicit-any": "off",
        "react/no-unknown-property": "off",
        "no-useless-escape": "off",
      },
    },
    {
      files: ["apps/web/**/*.{ts,tsx}"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["./apps/web/tsconfig.json"],
        tsconfigRootDir: __dirname,
        ecmaFeatures: { jsx: true },
      },
      settings: {
        react: {
          version: "detect",
        },
      },
      plugins: ["@typescript-eslint", "react", "react-hooks"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "prettier",
      ],
      rules: {
        "react/react-in-jsx-scope": "off",
        "@typescript-eslint/no-unused-vars": [
          "warn",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/consistent-type-imports": "warn",
        "@typescript-eslint/no-explicit-any": "off",
        "react/no-unknown-property": "off",
        "no-useless-escape": "off",
      },
    },
  ],
};

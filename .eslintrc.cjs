module.exports = {
  "ignorePatterns": [
    "src/test/**/*",
    "public/**/*",
    "build/**/*"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:security/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint"
  ],
  "rules": {
    "@typescript-eslint/ban-types": "warn",
    "quotes": ["error", "double"]
  }
};
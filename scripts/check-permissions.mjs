import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");
const backendRoot = path.resolve(frontendRoot, "..", "PORTAL-backend");

const routesConfigPath = path.join(frontendRoot, "src", "routes-config.js");
const permissionsPath = path.join(backendRoot, "config", "permissions.js");

const routesModule = await import(pathToFileURL(routesConfigPath).href);
const permissionsModule = await import(pathToFileURL(permissionsPath).href);

const routesConfig = routesModule.routesConfig || routesModule.default || [];
const { PERMISSIONS, ROLE_DEFAULTS } = permissionsModule;

const catalog = new Set(PERMISSIONS || []);
const errors = [];

for (const route of routesConfig) {
  if (!route.permission) {
    errors.push(`${route.path}: missing permission`);
    continue;
  }

  if (!catalog.has(route.permission)) {
    errors.push(
      `${route.path}: permission "${route.permission}" is missing from the catalog`,
    );
  }

  for (const role of route.roles || []) {
    const defaults = ROLE_DEFAULTS?.[role];
    if (!defaults) {
      continue;
    }
    if (!defaults.includes(route.permission)) {
      errors.push(
        `${route.path}: permission "${route.permission}" is missing from ${role} defaults`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error("Permission check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Permission check passed: ${routesConfig.length} routes, ${catalog.size} catalog permissions.`,
);

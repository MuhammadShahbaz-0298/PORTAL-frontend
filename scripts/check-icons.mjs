import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");

const routesModule = await import(
  pathToFileURL(path.join(frontendRoot, "src", "routes-config.js")).href
);
const routesConfig = routesModule.routesConfig || routesModule.default || [];

const navSource = fs.readFileSync(
  path.join(frontendRoot, "src", "components", "layout", "navConfig.js"),
  "utf8",
);
const navBlock = navSource.match(
  /export\s+const\s+NAV_ICONS\s*=\s*\{([\s\S]*?)\};/,
)?.[1];

const errors = [];

if (!navBlock) {
  errors.push("NAV_ICONS was not found in navConfig.js");
} else {
  const iconKeys = [...navBlock.matchAll(/^\s*([A-Za-z0-9_-]+)\s*:/gm)].map(
    match => match[1],
  );
  const uniqueKeys = new Set(iconKeys);
  const iconValues = [...navBlock.matchAll(/:\s*([A-Za-z0-9_]+)\s*,/g)].map(
    match => match[1],
  );

  for (const route of routesConfig) {
    if (!route.icon || !iconKeys.includes(route.icon)) {
      errors.push(`${route.path}: icon "${route.icon}" is missing from NAV_ICONS`);
    }
  }

  if (uniqueKeys.size !== iconKeys.length) {
    errors.push("NAV_ICONS has duplicate keys");
  }
  if (new Set(iconValues).size !== iconValues.length) {
    errors.push("NAV_ICONS reuses an icon component for more than one key");
  }
  console.log(
    `Icon check passed: ${routesConfig.length} routes, ${iconKeys.length} icon keys.`,
  );
}

const loginSource = fs.readFileSync(
  path.join(frontendRoot, "src", "features", "auth", "LoginPage.jsx"),
  "utf8",
);
const panel = loginSource.slice(
  loginSource.indexOf("<section"),
  loginSource.indexOf("</section>"),
);
const themeErrors = [];

if (!panel.includes('backgroundColor: "#0f172a"') || !panel.includes("text-white")) {
  themeErrors.push("the login panel does not use fixed dark colors and light text");
}
if (panel.includes("bg-ink") || panel.includes("text-ink")) {
  themeErrors.push("the login panel still uses theme tokens");
}

if (themeErrors.length > 0) {
  errors.push(...themeErrors.map(message => `Login theme: ${message}`));
} else {
  console.log("Login theme check passed in light and dark (fixed panel colors).");
}

if (errors.length > 0) {
  console.error("Frontend check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

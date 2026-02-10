import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

test("core project files exist", () => {
  assert.ok(exists("package.json"));
  assert.ok(exists("src/app/layout.tsx"));
  assert.ok(exists("prisma/schema.prisma"));
});

import { copyFile } from "node:fs/promises";

await copyFile(new URL("../env.json", import.meta.url), new URL("../dist/env.json", import.meta.url));

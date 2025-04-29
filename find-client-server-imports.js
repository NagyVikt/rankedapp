#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

// --- Configuration ---
const APP_DIR = 'app'; // Directory to search within
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Regex to detect common client-side React hooks
const CLIENT_HOOK_PATTERN =
  /\buse(?:State|Effect|Context|Reducer|Ref|LayoutEffect|Callback|Memo|ImperativeHandle|DebugValue|SyncExternalStore|Transition|Id|SWR|Chat)\b/;

// Regex to match the import path of your server-only queries module
const QUERIES_MODULE_IMPORT_PATTERN =
  /\bimport\b.*\s+from\s+['"]@\/lib\/db\/queries['"]/;

// --- !!! IMPORTANT: VERIFY AND ADJUST THIS PATH !!! ---
// Regex to match the import path of your actions file shown in the trace
const ACTIONS_MODULE_IMPORT_PATTERN =
  /\bimport\b.*\s+from\s+['"]@\/app\/\(auth\)\/actions['"]/;
// --- End Configuration ---

let issuesFound = 0;

async function checkFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');

    // Check if the file uses client-side hooks
    if (CLIENT_HOOK_PATTERN.test(content)) {
      let flagged = false;
      let reason = '';

      // Check 1: Does it import the server-only queries module directly?
      if (QUERIES_MODULE_IMPORT_PATTERN.test(content)) {
        flagged = true;
        reason = "Uses client hooks AND directly imports '@/lib/db/queries'.";
      }
      // Check 2: Does it import the actions module (which imports queries)?
      else if (ACTIONS_MODULE_IMPORT_PATTERN.test(content)) {
        // Importing actions is normal, but flag for review if hooks are also used
        flagged = true;
        reason =
          "Uses client hooks AND imports from '@/app/(auth)/actions.ts'. Review how actions are imported/used.";
      }

      if (flagged) {
        if (issuesFound === 0) console.log(''); // Add newline before first issue
        console.warn(`🟡 Potential Issue Found (Review Needed):`);
        console.warn(`   File: ${filePath}`);
        console.warn(`   Reason: ${reason}\n`);
        issuesFound++;
      }
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }
}

async function walkDir(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.next') {
          await walkDir(fullPath);
        }
      } else if (
        entry.isFile() &&
        FILE_EXTENSIONS.includes(path.extname(fullPath))
      ) {
        await checkFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
}

(async () => {
  console.log(
    `🔍 Searching for files using client hooks AND importing problematic modules in '${APP_DIR}'...`
  );
  console.log(
    `   (Checking imports from '@/lib/db/queries' and '@/app/(auth)/actions.ts')`
  );
  // --- VERIFY ACTION PATH ---
  console.log(
    `   *** Please ensure the path in ACTIONS_MODULE_IMPORT_PATTERN inside the script matches your actions file import path! ***`
  );
  // --- ---

  const appDirPath = path.resolve(APP_DIR);
  try {
    await fs.access(appDirPath);
    await walkDir(appDirPath);

    if (issuesFound === 0) {
      console.log(
        '\n✅ Script finished. No files found using client hooks AND directly importing the specified modules.'
      );
      console.log(
        '   (The issue might be indirect imports or rely on parent client boundaries not checked by this script).'
      );
    } else {
      console.log(
        `\n⚠️ Found ${issuesFound} potential area(s) for review. Check the files listed above.`
      );
      console.log(
        '   Focus on components that need client interactivity but try to access server code directly.'
      );
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(
        `\n❌ Error: The '${APP_DIR}' directory does not exist at the expected location.`
      );
      console.error(
        `   Please run this script from the root of your Next.js project.`
      );
    } else {
      console.error('\n❌ An unexpected error occurred:', error);
    }
    process.exit(1);
  }
})();
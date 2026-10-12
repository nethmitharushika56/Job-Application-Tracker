import fs from "fs/promises";
import path from "path";
import os from "os";

// In-memory fallback cache to ensure state survives within serverless invocations
const memoryCache = new Map<string, any>();

let determinedDir: string | null = null;

/**
 * Returns a writable directory path safe for the current environment.
 * On serverless platforms like Vercel or AWS Lambda, the deployment directory
 * (/var/task) is strictly read-only, so os.tmpdir() (/tmp) must be used.
 */
export async function getSafeDataDir(): Promise<string> {
  if (determinedDir) return determinedDir;

  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.LAMBDA_TASK_ROOT) ||
    process.cwd().startsWith("/var/task");

  if (isServerless) {
    determinedDir = path.join(os.tmpdir(), "careerpulse_data");
    await fs.mkdir(determinedDir, { recursive: true }).catch(() => {});
    return determinedDir;
  }

  // Check if process.cwd()/data is writable
  const localDir = path.join(process.cwd(), "data");
  try {
    await fs.mkdir(localDir, { recursive: true });
    const testFile = path.join(localDir, `.write_check_${Date.now()}`);
    await fs.writeFile(testFile, "test", "utf-8");
    await fs.unlink(testFile).catch(() => {});
    determinedDir = localDir;
    return determinedDir;
  } catch (err: any) {
    console.warn("Local storage directory is read-only, switching to temporary storage:", err.message);
    determinedDir = path.join(os.tmpdir(), "careerpulse_data");
    await fs.mkdir(determinedDir, { recursive: true }).catch(() => {});
    return determinedDir;
  }
}

/**
 * Safely reads JSON data from storage.
 * If running in a read-only environment, checks /tmp first;
 * if missing in /tmp, seeds from bundled process.cwd()/data if present.
 */
export async function readStorageFile<T>(filename: string, defaultValue: T): Promise<T> {
  const safeDir = await getSafeDataDir();
  const filePath = path.join(/*turbopackIgnore: true*/ safeDir, filename);

  try {
    const content = await fs.readFile(/*turbopackIgnore: true*/ filePath, "utf-8");
    const parsed = JSON.parse(content);
    memoryCache.set(filename, parsed);
    return parsed;
  } catch {
    // If not found in safeDir, check if bundled in process.cwd()/data
    const bundledPath = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", filename);
    if (bundledPath !== filePath) {
      try {
        const bundledContent = await fs.readFile(/*turbopackIgnore: true*/ bundledPath, "utf-8");
        const parsed = JSON.parse(bundledContent);
        // Copy to writable safeDir for subsequent reads/writes
        await fs.writeFile(/*turbopackIgnore: true*/ filePath, JSON.stringify(parsed, null, 2), "utf-8").catch(() => {});
        memoryCache.set(filename, parsed);
        return parsed;
      } catch {
        // Not in bundle
      }
    }

    if (memoryCache.has(filename)) {
      return memoryCache.get(filename) as T;
    }

    // Initialize with defaultValue
    await fs.writeFile(/*turbopackIgnore: true*/ filePath, JSON.stringify(defaultValue, null, 2), "utf-8").catch(() => {});
    memoryCache.set(filename, defaultValue);
    return defaultValue;
  }
}

/**
 * Safely writes JSON data to storage without crashing on EROFS.
 */
export async function writeStorageFile<T>(filename: string, data: T): Promise<void> {
  memoryCache.set(filename, data);

  const safeDir = await getSafeDataDir();
  const filePath = path.join(/*turbopackIgnore: true*/ safeDir, filename);

  try {
    await fs.mkdir(safeDir, { recursive: true });
    await fs.writeFile(/*turbopackIgnore: true*/ filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err: any) {
    if (err.code === "EROFS" || err.code === "EACCES" || err.code === "EPERM") {
      // Force switch to os.tmpdir()
      const tmpDir = path.join(os.tmpdir(), "careerpulse_data");
      determinedDir = tmpDir;
      await fs.mkdir(tmpDir, { recursive: true }).catch(() => {});
      const tmpPath = path.join(tmpDir, filename);
      await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), "utf-8").catch((writeErr) => {
        console.error("Failed to write to tmp storage fallback:", writeErr);
      });
    } else {
      console.error(`Failed to write storage file ${filename}:`, err);
    }
  }
}

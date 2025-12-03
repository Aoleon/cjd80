// Minimal ESM loader to resolve extension-less relative imports produced by TypeScript
import { access } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  // Map @shared/* to compiled dist/shared/* outputs
  if (specifier.startsWith('@shared/')) {
    const targetPath = `/app/dist/shared/${specifier.slice('@shared/'.length)}.js`;
    try {
      await access(targetPath);
      return { url: pathToFileURL(targetPath).href, shortCircuit: true };
    } catch {
      // If file is missing, let Node continue its normal resolution
    }
  }

  // Only handle relative specifiers without an explicit extension
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    const url = new URL(specifier, context.parentURL);
    const pathname = fileURLToPath(url);

    // Skip if an extension is already present
    if (!pathname.match(/\\.[a-zA-Z0-9]+$/)) {
      const withJsPath = `${pathname}.js`;
      const withJsUrl = pathToFileURL(withJsPath).href;
      try {
        await access(withJsPath);
        return { url: withJsUrl, shortCircuit: true };
      } catch {
        // fall through to default resolver
      }
    }
  }

  return nextResolve(specifier, context);
}

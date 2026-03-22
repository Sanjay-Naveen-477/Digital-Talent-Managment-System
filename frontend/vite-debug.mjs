import { build } from 'vite';
import fs from 'fs';

(async () => {
  try {
    await build();
    console.log("Build successful!");
  } catch (e) {
    fs.writeFileSync('error.json', JSON.stringify({
      message: e.message,
      frame: e.frame,
      plugin: e.plugin,
      id: e.id,
      loc: e.loc
    }, null, 2));
    console.log("Error written to error.json");
  }
})();

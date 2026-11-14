import {build} from 'esbuild';
import {execFileSync} from 'node:child_process';
await build({entryPoints:['src/posters.tsx'],bundle:true,platform:'node',packages:'external',outfile:'posters.cjs',jsx:'automatic'});
execFileSync(process.execPath,['posters.cjs'],{stdio:'inherit'});

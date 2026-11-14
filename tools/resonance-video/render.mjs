import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia,renderStill,openBrowser} from '@remotion/renderer';
import chromium from '@sparticuz/chromium';
import fs from 'node:fs/promises';
import path from 'node:path';
const names=['tuning','reactances','impedance','phasors','phase','frequency','tuning-lc','regimes','lamp','current-curves','bandwidth','quality','memory'];
const output=path.resolve('../../public/physics-schemes/resonance');await fs.mkdir(output,{recursive:true});
const executable=await chromium.executablePath();
const browser=await openBrowser('chrome',{browserExecutable:executable});
const url=await bundle({entryPoint:path.resolve('src/index.ts')});
for(const id of process.argv.length>2?process.argv.slice(2):names){
 const composition=await selectComposition({serveUrl:url,id,puppeteerInstance:browser});
 await renderStill({serveUrl:url,composition,puppeteerInstance:browser,frame:['bandwidth','frequency','tuning-lc','lamp'].includes(id)?240:152,output:path.join(output,id+'.png')});
 await renderMedia({serveUrl:url,composition,puppeteerInstance:browser,codec:'h264',crf:22,concurrency:3,outputLocation:path.join(output,id+'.mp4')});
 console.log('Rendered',id);
}
await browser.close({silent:true});

import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {DiagramFrame,type Kind} from './Diagram';
import fs from 'node:fs';
import path from 'node:path';
const names:Kind[]=['tuning','reactances','impedance','phasors','phase','frequency','tuning-lc','regimes','lamp','current-curves','bandwidth','quality','memory'];
const output=path.resolve('../../public/physics-schemes/resonance');
fs.mkdirSync(output,{recursive:true});
for(const kind of names){const f=['bandwidth','frequency','tuning-lc','lamp'].includes(kind)?240:152;fs.writeFileSync(path.join(output,kind+'.svg'),renderToStaticMarkup(<DiagramFrame kind={kind} f={f}/>));}

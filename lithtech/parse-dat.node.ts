import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as t from '../mod.ts';
import { getStructReadSnap } from '../mod.ts';
import { RenderBlock } from './classes/dat/RenderBlock.ts';
import { WorldModelRenderBlock } from './classes/dat/WorldModelRenderBlock.ts';
import { LithtechDat } from './classes/dat/LithtechDat.ts';
import { RenderData } from './classes/dat/RenderData.ts';
import { WorldTree } from './classes/dat/WorldTree.ts';
import { WorldModel } from './classes/dat/WorldModel.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const datBuffer = await fs.readFile(path.join(__dirname, './files/elevator.dat'));
// const datBuffer = await fs.readFile(path.join(__dirname, './files/lastone3.dat'));
// const datBuffer = await fs.readFile(path.join(__dirname, './files/sa_worlds@project@tank.dat'));
// const datBuffer = await fs.readFile(path.join(__dirname, './files/school_ffa.dat'));
// const datBuffer = await fs.readFile(path.join(__dirname, './files/ware_house2.dat'));
// const datBuffer = await fs.readFile(path.join(__dirname, './files/observer.dat'));
const datBuffer = await fs.readFile(path.join(__dirname, './files/WESTERN.DAT'));
// const datBuffer = await fs.readFile(path.join(__dirname, './files/YIKIMSEHRI.DAT'));
console.log(datBuffer.buffer);

const LithtechDatParser = t.getTypedParser(LithtechDat);

const readContext = t.createContext(datBuffer.buffer, {
    DebugStruct: [
        LithtechDat,

        WorldTree,
        WorldModel,

        RenderData,
        RenderBlock,
        WorldModelRenderBlock,
    ],
});

console.time('lithtechDat');
const [ lithtechDat, snap ] = readContext.read(LithtechDatParser);
console.timeEnd('lithtechDat');

const selfSnap = snap;
const fieldSnap = getStructReadSnap(lithtechDat);
// console.log(lithtechDat);
console.log(selfSnap);
console.log(fieldSnap);

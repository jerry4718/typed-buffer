import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getStructReadSnap } from '../mod.ts';
import { RenderBlock } from './classes/dat/RenderBlock.ts';
import { WorldModelRenderBlock } from './classes/dat/WorldModelRenderBlock.ts';
import * as t from '../mod.ts';
import { LithtechDat } from './classes/dat/LithtechDat.ts';
import { RenderData } from './classes/dat/RenderData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    const datBuffer = await fs.readFile(path.join(__dirname, './files/sa_worlds@project@ware_house.dat'));

    console.log(datBuffer.buffer);

    const LithtechDatParser = t.getTypedParser(LithtechDat);

    const readContext = t.createContext(datBuffer.buffer, { DebugStruct: [ LithtechDat, RenderData, RenderBlock, WorldModelRenderBlock ] });

    console.time('lithtechDat');
    const [ lithtechDat, snap ] = readContext.read(LithtechDatParser);
    console.timeEnd('lithtechDat');

    const selfSnap = snap;
    const fieldSnap = getStructReadSnap(lithtechDat);
    console.log(lithtechDat);
    console.log(selfSnap);
    console.log(fieldSnap);
})();

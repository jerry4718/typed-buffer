import { RenderBlock } from './classes/dat/RenderBlock.ts';
import { WorldModelRenderBlock } from './classes/dat/WorldModelRenderBlock.ts';
import * as t from '../mod.ts';
import { LithtechDat } from './classes/dat/LithtechDat.ts';
import { RenderData } from './classes/dat/RenderData.ts';

const datBuffer = await Deno.readFile('./files/sa_worlds@project@ware_house.dat');

console.log(datBuffer.buffer);

const LithtechDatParser = t.getTypedParser(LithtechDat);

const readContext = t.createContext(datBuffer.buffer, { DebugStruct: [ LithtechDat, RenderData, RenderBlock, WorldModelRenderBlock ] });

console.time('lithtechDat');
const [ lithtechDat, snap ] = readContext.read(LithtechDatParser);
console.timeEnd('lithtechDat');

console.log(lithtechDat);
console.log(snap);

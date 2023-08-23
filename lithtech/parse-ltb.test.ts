import * as t from '../mod.ts';
import { LithtechLtb } from './classes/ltb/LithtechLtb.ts';
import { LtbBody } from './classes/ltb/LtbBody.ts';
import { Piece } from './classes/ltb/Piece.ts';

const ltbBuffer = await Deno.readFile('./files/sa_characters@models@blue@574.ltb');

console.log(ltbBuffer.buffer);

const LithtechLtbParser = t.getTypedParser(LithtechLtb);

const readContext = t.createContext(ltbBuffer.buffer, { DebugStruct: [ LithtechLtb, LtbBody, Piece ] });

const lithtechLtb = readContext.read(LithtechLtbParser);

console.log(lithtechLtb);

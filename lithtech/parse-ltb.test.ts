import * as t from '../mod.ts';
import { Animation } from './classes/ltb/Animation.ts';
import { AnimBinding } from './classes/ltb/AnimBinding.ts';
import { LithtechLtb } from './classes/ltb/LithtechLtb.ts';
import { NullMesh } from './classes/ltb/NullMesh.ts';
import { RigidMesh } from './classes/ltb/RigidMesh.ts';
import { SkeletalMesh } from './classes/ltb/SkeletalMesh.ts';
import { UnknownMesh } from './classes/ltb/UnknownMesh.ts';
import { VertexAnimatedMesh } from './classes/ltb/VertexAnimatedMesh.ts';
import { VertexContainer } from './classes/ltb/VertexContainer.ts';

const ltbBuffer = await Deno.readFile('./files/sa_characters@models@blue@574.ltb');

console.log(ltbBuffer.buffer);

const LithtechLtbParser = t.getTypedParser(LithtechLtb);

const readContext = t.createContext(ltbBuffer.buffer, {
    DebugStruct: [
        RigidMesh,
        SkeletalMesh,
        VertexAnimatedMesh,
        NullMesh,
        UnknownMesh,

        VertexContainer,
        Animation,
        AnimBinding,
    ],
});

const lithtechLtb = readContext.read(LithtechLtbParser);

console.log(lithtechLtb);

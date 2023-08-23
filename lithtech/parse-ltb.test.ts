import * as t from '../mod.ts';
import { LithtechLtb } from './classes/ltb/LithtechLtb.ts';
import { LtbBody } from './classes/ltb/LtbBody.ts';
import { Piece } from './classes/ltb/Piece.ts';
import { ChildModel } from './classes/ltb/ChildModel.ts';
import { RenderObject } from './classes/ltb/RenderObject.ts';
import { LodMeshInfo } from './classes/ltb/LodMeshInfo.ts';
import { RigidMesh } from './classes/ltb/RigidMesh.ts';
import { SkeletalMesh } from './classes/ltb/SkeletalMesh.ts';
import { VertexAnimatedMesh } from './classes/ltb/VertexAnimatedMesh.ts';
import { NullMesh } from './classes/ltb/NullMesh.ts';
import { UnknownMesh } from './classes/ltb/UnknownMesh.ts';
import { VertexContainer } from './classes/ltb/VertexContainer.ts';
import { Animation } from './classes/ltb/Animation.ts';
import { Keyframe } from './classes/ltb/Keyframe.ts';
import { UncompressedTransform } from './classes/ltb/UncompressedTransform.ts';
import { CompressedTransform } from './classes/ltb/CompressedTransform.ts';
import { VertexInfo } from './classes/ltb/VertexInfo.ts';

const ltbBuffer = await Deno.readFile('./files/sa_characters@models@blue@574.ltb');

console.log(ltbBuffer.buffer);

const LithtechLtbParser = t.getTypedParser(LithtechLtb);

const readContext = t.createContext(ltbBuffer.buffer, {
    DebugStruct: [
        // LodMeshInfo,
        // LithtechLtb, LtbBody, Piece, RenderObject,
        RigidMesh, SkeletalMesh, VertexAnimatedMesh, NullMesh, UnknownMesh,
        VertexContainer, /*VertexInfo,*/
        // Animation,
        // /*Keyframe, */UncompressedTransform, CompressedTransform,
    ],
});

const lithtechLtb = readContext.read(LithtechLtbParser);

console.log(lithtechLtb);

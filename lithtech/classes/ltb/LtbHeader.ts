import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class LtbHeader {
    @FieldType(t.Uint16)
    declare fileType: number;

    @FieldType(t.Uint16)
    declare fileVersion: number;

    @FieldType(t.Uint32Array, { count: 4 })
    declare spaceUnknown: Uint32Array;

    @FieldType(t.Int32)
    declare version: number;

    @FieldType(t.Int32)
    declare numKeyframe: number;

    @FieldType(t.Int32)
    declare numAnimations: number;

    @FieldType(t.Int32)
    declare numNodes: number;

    @FieldType(t.Int32)
    declare numPiecesNoUse: number;

    @FieldType(t.Int32)
    declare numChildModels: number;

    @FieldType(t.Int32)
    declare numFaces: number;

    @FieldType(t.Int32)
    declare numVertexes: number;

    @FieldType(t.Int32)
    declare numVertexWeights: number;

    @FieldType(t.Int32)
    declare numLod: number;

    @FieldType(t.Int32)
    declare numSockets: number;

    @FieldType(t.Int32)
    declare numWeightSets: number;

    @FieldType(t.Int32)
    declare numStrings: number;

    @FieldType(t.Int32)
    declare stringLength: number;

    @FieldType(t.Int32)
    declare vertexAnimationDataSize: number;

    @FieldType(t.Int32)
    declare animationDataSize: number;

    @FieldType(t.String, { size: t.Uint16 })
    declare commandString: string;

    @FieldType(t.Float32)
    declare internalRadius: number;
}

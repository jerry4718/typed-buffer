import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class LtbHeader {
    @FieldType(t.Uint16)
    fileType!: number;

    @FieldType(t.Uint16)
    fileVersion!: number;

    @FieldType(t.Uint32Array, { count: 4 })
    spaceUnknown!: Uint32Array;

    @FieldType(t.Int32)
    version!: number;

    @FieldType(t.Int32)
    numKeyframe!: number;

    @FieldType(t.Int32)
    numAnimations!: number;

    @FieldType(t.Int32)
    numNodes!: number;

    @FieldType(t.Int32)
    numPiecesNoUse!: number;

    @FieldType(t.Int32)
    numChildModels!: number;

    @FieldType(t.Int32)
    numFaces!: number;

    @FieldType(t.Int32)
    numVertexes!: number;

    @FieldType(t.Int32)
    numVertexWeights!: number;

    @FieldType(t.Int32)
    numLod!: number;

    @FieldType(t.Int32)
    numSockets!: number;

    @FieldType(t.Int32)
    numWeightSets!: number;

    @FieldType(t.Int32)
    numStrings!: number;

    @FieldType(t.Int32)
    stringLength!: number;

    @FieldType(t.Int32)
    vertexAnimationDataSize!: number;

    @FieldType(t.Int32)
    animationDataSize!: number;

    @FieldType(t.String, { size: t.Uint16 })
    commandString!: string;

    @FieldType(t.Float32)
    internalRadius!: number;
}

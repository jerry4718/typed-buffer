import * as t from '../../../mod.ts';
import { FieldIf, FieldType, ParserTarget } from '../../../mod.ts';
import { VertexInfo } from './VertexInfo.ts';
import { DataMark } from './enums/DataMark.ts';

@ParserTarget()
export class VertexContainer {
    @FieldValue(t.Uint32)
    numVertexes!: number;
    @FieldValue(t.Uint32)
    maxBonesPerFace!: number;
    @FieldValue(({ scope }: t.ParserContext) => scope.vertexTypeMap[scope.$index])
    mask!: number;
    @FieldValue(t.Uint32)
    meshType!: number;

    @FieldType(t.Array, {
        item: VertexInfo,
        count: ({ scope }: t.ParserContext) => scope.mesgInfo.numVertexes,
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.mask > 0)
    vertexInfos!: VertexInfo[];

    get hasPosition() {
        return (this.mask >> DataMark.LiePosition & 1) > 0;
    }

    get hasNormal() {
        return (this.mask >> DataMark.LieNormal & 1) > 0;
    }

    get hasColor() {
        return (this.mask >> DataMark.LieColor & 1) > 0;
    }

    get hasUv1() {
        return (this.mask >> DataMark.LieUv1 & 1) > 0;
    }

    get hasUv2() {
        return (this.mask >> DataMark.LieUv2 & 1) > 0;
    }

    get hasUv3() {
        return (this.mask >> DataMark.LieUv3 & 1) > 0;
    }

    get hasUv4() {
        return (this.mask >> DataMark.LieUv4 & 1) > 0;
    }

    get hasBasisVector() {
        return (this.mask >> DataMark.LieBasisVector & 1) > 0;
    }

    get isVertexUsed() {
        return this.hasPosition || this.hasNormal || this.hasColor || this.hasBasisVector;
    }

    get isFaceVertexUsed() {
        return this.hasUv1 || this.hasUv2 || this.hasUv3 || this.hasUv4;
    }
}

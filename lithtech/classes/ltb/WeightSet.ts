import { Str2H } from '../common/Str2H.ts';
import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class WeightSet {
    @FieldType(Str2H)
    nameBox!: Str2H;

    @FieldType(t.Uint32)
    numNodes!: number;

    @FieldType(t.Array, {
        item: t.Float32,
        size: ({ scope }: t.ParserContext) => (scope.numNodes as number),
    })
    nodeWeights!: number;

    get name() {
        return this.nameBox.data;
    }
}

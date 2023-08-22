import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class WeightSet {
    @FieldType(t.String, { size: t.Uint16 })
    name!: string;

    @FieldType(t.Uint32)
    numNodes!: number;

    @FieldType(t.Array, {
        item: t.Float32,
        count: ({ scope }: t.ParserContext) => (scope.numNodes as number),
    })
    nodeWeights!: number;
}

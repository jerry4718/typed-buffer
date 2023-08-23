import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class WeightSet {
    @FieldType(t.String, { size: t.Uint16 })
    name!: string;

    @FieldType(t.Array, { item: t.Float32, count: t.Uint32 })
    nodeWeights!: number[];
}

import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class LightMapSection {
    @FieldType(t.Uint32)
    left!: number;

    @FieldType(t.Uint32)
    top!: number;

    @FieldType(t.Uint32)
    width!: number;

    @FieldType(t.Uint32)
    height!: number;

    @FieldType(t.Uint32)
    lenData!: number;

    @FieldType(t.Array, { item: t.Uint8, size: ({ scope }: t.ParserContext) => (scope.lenData as number) })
    data!: number[];
}

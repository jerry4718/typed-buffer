import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { Matrix } from '../common/Matrix.ts';

@StructTarget()
export class BoneNode {
    @FieldType(t.String, { size: t.Uint16 })
    name!: string;

    @FieldType(t.Uint16)
    index!: number;

    @FieldType(t.Int8)
    flags!: number;

    @FieldType(Matrix)
    bindMatrix!: Matrix;

    @FieldType(t.Array, { item: BoneNode, count: t.Uint32 })
    children!: BoneNode[];
}

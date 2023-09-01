import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { Matrix } from '../common/Matrix.ts';

@StructTarget()
export class BoneNode {
    @FieldType(t.String, { size: t.Uint16 })
    declare name: string;

    @FieldType(t.Uint16)
    declare index: number;

    @FieldType(t.Int8)
    declare flags: number;

    @FieldType(Matrix)
    declare bindMatrix: Matrix;

    @FieldType(t.Array, { item: BoneNode, count: t.Uint32 })
    declare children: BoneNode[];
}

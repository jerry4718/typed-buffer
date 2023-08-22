import * as t from '../../../mod.ts';
import { FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { Matrix } from '../common/Matrix.ts';
import { Str2H } from '../common/Str2H.ts';

@ParserTarget()
export class BoneNode {
    @FieldType(Str2H)
    nameBox!: Str2H;

    @FieldType(t.Uint16)
    index!: number;

    @FieldType(t.Int8)
    flags!: number;

    @FieldType(Matrix)
    bindMatrix!: Matrix;

    @FieldType(t.Uint32)
    numChildren!: number;

    @FieldType(t.Array, {
        item: getTypedParser(BoneNode),
        size: ({ scope }: t.ParserContext) => (scope[`numChildren`] as number),
    })
    children!: BoneNode;

    get name() {
        return this.nameBox.data;
    }
}

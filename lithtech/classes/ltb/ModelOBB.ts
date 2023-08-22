import * as t from '../../../mod.ts';
import { FieldIf, FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';

@ParserTarget()
export class ModelOBB {
    @FieldValue(t.Uint8)
    deprecated!: boolean;

    @FieldType(Vector3)
    pos!: Vector3;

    @FieldType(Vector3)
    size!: Vector3;

    @FieldType(t.Array, { item: getTypedParser(Vector3), size: 3 })
    basis!: Vector3;

    @FieldType(t.Uint32)
    iNode!: number;

    @FieldType(t.Float32)
    @FieldIf(({ scope }: t.ParserContext) => !scope.deprecated)
    radius!: number;
}

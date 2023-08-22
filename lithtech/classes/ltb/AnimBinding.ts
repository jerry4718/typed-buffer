import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';

@ParserTarget()
export class AnimBinding {
    @FieldType(t.String, { size: t.Uint16 })
    name!: string;

    @FieldType(Vector3)
    extents!: Vector3;

    @FieldType(Vector3)
    origin!: Vector3;
}

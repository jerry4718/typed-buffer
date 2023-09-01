import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';

@StructTarget()
export class AnimBinding {
    @FieldType(t.String, { size: t.Uint16 })
    declare name: string;

    @FieldType(Vector3)
    declare extents: Vector3;

    @FieldType(Vector3)
    declare origin: Vector3;
}

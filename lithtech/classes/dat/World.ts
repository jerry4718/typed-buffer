import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';

@StructTarget()
export class World {
    @FieldType(t.String, { size: t.Uint32 })
    declare properties: string;

    @FieldType(Vector3)
    declare extentsMin: Vector3;

    @FieldType(Vector3)
    declare extentsMax: Vector3;

    @FieldType(Vector3)
    declare worldOffset: Vector3;
}

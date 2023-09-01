import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { Quaternion } from '../common/Quaternion.ts';
import { Vector3 } from '../common/Vector3.ts';

@StructTarget()
export class Socket {
    @FieldType(t.Uint32)
    declare nodeIndex: number;

    @FieldType(t.String, { size: t.Uint16 })
    declare name: string;

    @FieldType(Quaternion)
    declare rotation: Quaternion;

    @FieldType(Vector3)
    declare position: Vector3;

    @FieldType(Vector3)
    declare scale: Vector3;
}

import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { Quaternion } from '../common/Quaternion.ts';
import { Vector3 } from '../common/Vector3.ts';

@ParserTarget()
export class Socket {
    @FieldType(t.Uint32)
    nodeIndex!: number;

    @FieldType(t.String, { size: t.Uint16 })
    name!: string;

    @FieldType(Quaternion)
    rotation!: Quaternion;

    @FieldType(Vector3)
    position!: Vector3;

    @FieldType(Vector3)
    scale!: Vector3;
}

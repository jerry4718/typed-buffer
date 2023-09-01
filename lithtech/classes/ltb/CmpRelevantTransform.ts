import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { Quaternion } from '../common/Quaternion.ts';
import { Vector3 } from '../common/Vector3.ts';
import { CmpBaseTransform } from './CmpBaseTransform.ts';

@StructTarget()
export class CmpRelevantTransform extends CmpBaseTransform {
    @FieldType(t.Array, { item: Vector3, count: t.Uint32 })
    declare positions: Vector3[];

    @FieldType(t.Array, { item: Quaternion, count: t.Uint32 })
    declare rotations: Quaternion[];
}

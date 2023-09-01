import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { CompressedQuaternion } from '../common/CompressedQuaternion.ts';
import { Vector3 } from '../common/Vector3.ts';
import { CmpBaseTransform } from './CmpBaseTransform.ts';

@StructTarget()
export class CmpRelevantRot16Transform extends CmpBaseTransform {
    @FieldType(t.Array, { item: Vector3, count: t.Uint32 })
    declare positions: Vector3[];

    @FieldType(t.Array, { item: CompressedQuaternion, count: t.Uint32 })
    declare rotations: CompressedQuaternion[];
}

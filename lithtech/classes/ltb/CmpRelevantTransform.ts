import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { Quaternion } from '../common/Quaternion.ts';
import { Vector3 } from '../common/Vector3.ts';
import { CmpBaseTransform } from './CmpBaseTransform.ts';

@ParserTarget()
export class CmpRelevantTransform extends CmpBaseTransform {
    @FieldType(t.Array, { item: Vector3, count: t.Uint32 })
    declare positions: Vector3[];

    @FieldType(t.Array, { item: Quaternion, count: t.Uint32 })
    declare rotations: Quaternion[];
}

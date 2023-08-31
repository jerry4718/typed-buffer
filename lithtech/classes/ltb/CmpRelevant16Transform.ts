import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { CompressedQuaternion } from '../common/CompressedQuaternion.ts';
import { CompressedVector3 } from '../common/CompressedVector3.ts';
import { CmpBaseTransform } from './CmpBaseTransform.ts';

@ParserTarget()
export class CmpRelevant16Transform extends CmpBaseTransform {
    @FieldType(t.Array, { item: CompressedVector3, count: t.Uint32 })
    declare positions: CompressedVector3[];

    @FieldType(t.Array, { item: CompressedQuaternion, count: t.Uint32 })
    declare rotations: CompressedQuaternion[];
}

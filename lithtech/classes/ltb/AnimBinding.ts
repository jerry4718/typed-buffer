import { FieldType, ParserTarget } from '../../../mod.ts';
import { Str2H } from '../common/Str2H.ts';
import { Vector3 } from '../common/Vector3.ts';

@ParserTarget()
export class AnimBinding {
    @FieldType(Str2H)
    nameBox!: Str2H;

    @FieldType(Vector3)
    extents!: Vector3;

    @FieldType(Vector3)
    origin!: Vector3;

    get name() {
        return this.nameBox.data;
    }
}

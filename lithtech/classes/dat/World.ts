import { FieldType, ParserTarget } from '../../../mod.ts';
import { Str4H } from '../common/Str4H.ts';
import { Vector3 } from '../common/Vector3.ts';

@ParserTarget()
export class World {
    @FieldType(Str4H)
    propertiesBox!: Str4H;

    @FieldType(Vector3)
    extentsMin!: Vector3;

    @FieldType(Vector3)
    extentsMax!: Vector3;

    @FieldType(Vector3)
    worldOffset!: Vector3;

    get properties() {
        return this.propertiesBox.data;
    }
}

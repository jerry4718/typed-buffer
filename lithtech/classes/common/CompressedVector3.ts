import { Vector3 } from './Vector3.ts';
import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

const DecompressValue = 16.0;

@ParserTarget()
export class CompressedVector3 {
    @FieldType(t.Int16)
    x!: number;

    @FieldType(t.Int16)
    y!: number;

    @FieldType(t.Int16)
    z!: number;

    toVector3() {
        const vec3 = new Vector3();
        vec3.x = this.x / DecompressValue;
        vec3.y = this.y / DecompressValue;
        vec3.z = this.z / DecompressValue;
        return vec3;
    }
}

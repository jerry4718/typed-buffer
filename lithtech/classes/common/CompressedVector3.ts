import { Vector3 } from './Vector3.ts';
import * as t from '../../../mod.ts';
import { FieldCollection, FieldType, StructTarget } from '../../../mod.ts';

const DecompressValue = 16.0;

@StructTarget()
export class CompressedVector3 {
    @FieldType(t.Int16Array, { count: 3 })
    @FieldCollection(Int16Array, [ 'x', 'y', 'z' ])
    declare meta: Int16Array;

    declare x: number;
    declare y: number;
    declare z: number;

    asArray() {
        return Array.from(this.toVector3().meta);
    }

    toVector3() {
        return CompressedVector3.toVector3(this);
    }

    static toVector3(from: CompressedVector3, decompressValue = DecompressValue) {
        const quat = new Vector3();
        quat.x = from.x / decompressValue;
        quat.y = from.y / decompressValue;
        quat.z = from.z / decompressValue;
        return quat;
    }

    static fromVector3(from: Vector3, decompressValue = DecompressValue) {
        const quat = new CompressedVector3();
        quat.x = from.x * decompressValue;
        quat.y = from.y * decompressValue;
        quat.z = from.z * decompressValue;
        return quat;
    }
}

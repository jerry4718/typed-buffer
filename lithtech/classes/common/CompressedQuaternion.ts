import * as t from '../../../mod.ts';
import { FieldType, FieldCollection, StructTarget } from '../../../mod.ts';
import { Quaternion } from './Quaternion.ts';

const DecompressValue = 0x7fff;

@StructTarget()
export class CompressedQuaternion {
    @FieldType(t.Int16Array, { count: 4 })
    @FieldCollection(Int16Array, [ 'x', 'y', 'z', 'w' ])
    declare meta: Int16Array;

    declare x: number;
    declare y: number;
    declare z: number;
    declare w: number;

    asArray() {
        return Array.from(this.toQuaternion().meta);
    }

    toQuaternion() {
        return CompressedQuaternion.toQuaternion(this);
    }

    static toQuaternion(from: CompressedQuaternion, decompressValue = DecompressValue) {
        const quat = new Quaternion();
        quat.x = from.x / decompressValue;
        quat.y = from.y / decompressValue;
        quat.z = from.z / decompressValue;
        quat.w = from.w / decompressValue;
        return quat;
    }

    static fromQuaternion(from: Quaternion, decompressValue = DecompressValue) {
        const quat = new CompressedQuaternion();
        quat.x = from.x * decompressValue;
        quat.y = from.y * decompressValue;
        quat.z = from.z * decompressValue;
        quat.w = from.w * decompressValue;
        return quat;
    }
}

import * as t from '../../../mod.ts';
import { BufferField, BufferFields } from '../../../mod.ts';
import { Vector3 } from './Vector3.ts';

const DecompressValue = 16.0;

@BufferFields(t.Int16)
export class CompressedVector3 {
    @BufferField()
    declare x: number;
    @BufferField()
    declare y: number;
    @BufferField()
    declare z: number;

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

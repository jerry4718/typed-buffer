import { BufferField, BufferTarget } from '../../../mod.ts';
import { Quaternion } from './Quaternion.ts';

const DecompressValue = 0x7fff;

@BufferTarget(Int16Array)
export class CompressedQuaternion {
    @BufferField()
    declare x: number;
    @BufferField()
    declare y: number;
    @BufferField()
    declare z: number;
    @BufferField()
    declare w: number;

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

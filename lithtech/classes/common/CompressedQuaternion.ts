import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { Quaternion } from './Quaternion.ts';

const DecompressValue = 0x7fff;

@ParserTarget()
export class CompressedQuaternion {
    @FieldType(t.Int16)
    x!: number;

    @FieldType(t.Int16)
    y!: number;

    @FieldType(t.Int16)
    z!: number;

    @FieldType(t.Int16)
    w!: number;

    toQuaternion(decompressValue = DecompressValue) {
        const quat = new Quaternion();
        quat.x = this.x / decompressValue;
        quat.y = this.y / decompressValue;
        quat.z = this.z / decompressValue;
        quat.w = this.w / decompressValue;
        return quat;
    }
}

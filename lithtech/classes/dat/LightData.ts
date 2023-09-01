import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';

@StructTarget()
export class LightData {
    @FieldType(Vector3)
    declare lookupStart: Vector3;

    @FieldType(Vector3)
    declare blockSize: Vector3;

    @FieldType(t.Uint32Array, { count: 3 })
    declare lookupSize: Uint32Array;

    /* RLE compressed data */
    @FieldType(t.Uint8Array, { count: t.Uint32 })
    declare lightDataGrid: Uint8Array;
}

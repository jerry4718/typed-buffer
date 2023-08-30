import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';

@ParserTarget()
export class LightData {
    @FieldType(Vector3)
    lookupStart!: Vector3;

    @FieldType(Vector3)
    blockSize!: Vector3;

    @FieldType(t.Uint32Array, { count: 3 })
    lookupSize!: Uint32Array;

    /* RLE compressed data */
    @FieldType(t.Uint8Array, { count: t.Uint32 })
    lightDataGrid!: Uint8Array;
}

import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class DatHeader {
    @FieldType(t.Uint8Array, { count: 4 })
    declare datVersion: Uint8Array;

    @FieldType(t.Uint32)
    declare worldDataPos: number;

    @FieldType(t.Uint32)
    declare blindDataPos: number;

    @FieldType(t.Uint32)
    declare lightDataPos: number;

    @FieldType(t.Uint32)
    declare physicsDataPos: number;

    @FieldType(t.Uint32)
    declare particleDataPos: number;

    @FieldType(t.Uint32)
    declare renderDataPos: number;

    @FieldType(t.Uint32Array, { count: 8 })
    declare future: Uint32Array;
}

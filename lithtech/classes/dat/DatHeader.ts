import * as t from '../../../mod.ts';
import { FieldType, StructTarget } from '../../../mod.ts';

@StructTarget()
export class DatHeader {
    @FieldType(t.Uint8Array, { count: 4 })
    datVersion!: Uint8Array;

    @FieldType(t.Uint32)
    worldDataPos!: number;

    @FieldType(t.Uint32)
    blindDataPos!: number;

    @FieldType(t.Uint32)
    lightDataPos!: number;

    @FieldType(t.Uint32)
    physicsDataPos!: number;

    @FieldType(t.Uint32)
    particleDataPos!: number;

    @FieldType(t.Uint32)
    renderDataPos!: number;

    @FieldType(t.Uint32Array, { count: 8 })
    future!: Uint32Array;
}

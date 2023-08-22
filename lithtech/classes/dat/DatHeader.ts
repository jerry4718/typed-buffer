import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class DatHeader {
    @FieldType(t.Array, { item: t.Uint8, size: 4 })
    datVersion!: number[];

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

    @FieldType(t.Array, {
        item: t.Uint32,
        size: 8,
    })
    future!: number;
}

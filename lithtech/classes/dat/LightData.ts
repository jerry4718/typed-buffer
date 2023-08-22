import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';

@ParserTarget()
export class LightData {
    @FieldType(Vector3)
    lookupStart!: Vector3;

    @FieldType(Vector3)
    blockSize!: Vector3;

    @FieldType(t.Array, { item: t.Uint32, count: 3 })
    lookupSize!: number;

    @FieldType(t.Uint32)
    numLightDataGrid!: number;

    @FieldType(t.Array, { item: t.Uint8, count: t.Uint32 })
    lightDataGrid!: number;
}

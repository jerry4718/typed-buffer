import * as t from '../../../mod.ts';
import { FieldIf, FieldType, ParserTarget } from '../../../mod.ts';
import { Vector3 } from '../common/Vector3.ts';
import { ObbVersion } from './enums/ObbVersion.ts';

@ParserTarget()
export class ModelOBB {
    @FieldType(Vector3)
    pos!: Vector3;

    @FieldType(Vector3)
    size!: Vector3;

    @FieldType(t.Array, { item: Vector3, count: 3 })
    basis!: Vector3[];

    @FieldType(t.Uint32)
    iNode!: number;

    @FieldType(t.Float32)
    @FieldIf(({ scope }: t.ParserContext) => {
        if (scope.header.version === ObbVersion.V23) return false;
        if (scope.header.version === ObbVersion.V24) return true;
        if (scope.header.version === ObbVersion.V25) return true;
        return true;
    })
    radius!: number;
}

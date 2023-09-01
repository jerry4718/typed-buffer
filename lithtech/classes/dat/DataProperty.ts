import * as t from '../../../mod.ts';
import { FieldExpose, FieldType, StructTarget } from '../../../mod.ts';
import { ColorRgb } from '../common/ColorRgb.ts';
import { Quaternion } from '../common/Quaternion.ts';
import { Vector3 } from '../common/Vector3.ts';

@StructTarget()
export class DataProperty {
    @FieldType(t.String, { size: t.Uint16 })
    name!: string;

    @FieldType(t.Uint8)
    @FieldExpose()
    typeCode!: number;

    @FieldType(t.Uint32)
    flags!: number;

    @FieldType(t.Uint16)
    dataLength!: number;

    @FieldType((_: t.ParserContext, scope: t.ScopeAccessor) => {
        if (scope.typeCode === 0) return t.String({ size: t.Uint16 });
        if (scope.typeCode === 1) return Vector3;
        if (scope.typeCode === 2) return ColorRgb;
        if (scope.typeCode === 3) return t.Float32;
        if (scope.typeCode === 4) return t.Uint32;
        if (scope.typeCode === 5) return t.Uint8;
        if (scope.typeCode === 6) return t.Int32;
        if (scope.typeCode === 7) return Quaternion;
        throw Error(`cannot match [data] type from [typeCode:${scope.typeCode}]`);
    })
    data!: string | Vector3 | ColorRgb | number | Quaternion;

    get type() {
        if (this.typeCode === 0x00) return 'string';
        if (this.typeCode === 0x01) return 'vector3';
        if (this.typeCode === 0x02) return 'color';
        if (this.typeCode === 0x03) return 'f4';
        if (this.typeCode === 0x04) return 'flag';
        if (this.typeCode === 0x05) return 'bool';
        if (this.typeCode === 0x06) return 'int';
        if (this.typeCode === 0x07) return 'quaternion';
        return 'unknown';
    }
}

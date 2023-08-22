import * as t from '../../../mod.ts';
import { FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { ColorRgb } from '../common/ColorRgb.ts';
import { Quaternion } from '../common/Quaternion.ts';
import { Str2H } from '../common/Str2H.ts';
import { Vector3 } from '../common/Vector3.ts';

@ParserTarget()
export class DataProperty {
    @FieldType(Str2H)
    nameBox!: Str2H;

    @FieldType(t.Uint8)
    typeCode!: number;

    @FieldType(t.Uint32)
    flags!: number;

    @FieldType(t.Uint16)
    dataLength!: number;

    @FieldType(({ scope }: t.ParserContext) => {
        if (scope.typeCode === 0) return getTypedParser(Str2H);
        if (scope.typeCode === 1) return getTypedParser(Vector3);
        if (scope.typeCode === 2) return getTypedParser(ColorRgb);
        if (scope.typeCode === 3) return t.Float32;
        if (scope.typeCode === 4) return t.Uint32;
        if (scope.typeCode === 5) return t.Uint8;
        if (scope.typeCode === 6) return t.Int32;
        if (scope.typeCode === 7) return getTypedParser(Quaternion);
    })
    data!: Str2H | Vector3 | ColorRgb | number | Quaternion;

    get name() {
        return this.nameBox.data;
    }

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

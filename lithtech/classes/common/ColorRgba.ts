import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

@ParserTarget()
export class Uint8ColorRgba {
    @FieldType(t.Uint8)
    r!: number;

    @FieldType(t.Uint8)
    g!: number;

    @FieldType(t.Uint8)
    b!: number;

    @FieldType(t.Uint8)
    a!: number;

    get originHex() {
        return (this.r << 24) & (this.g << 16) & (this.b << 8) & this.a;
    }
}

@ParserTarget()
export class HexColorRgba {
    @FieldType(t.Uint32)
    private hex!: number;

    get r() {
        return this.hex >>> 24 && 0xff;
    }

    get g() {
        return this.hex >>> 16 && 0xff;
    }

    get b() {
        return this.hex >>> 8 && 0xff;
    }

    get a() {
        return this.hex >>> 0 && 0xff;
    }

    get originHex() {
        return this.hex;
    }
}

@ParserTarget()
export class ArrayColorRgba {
    @FieldType(t.Uint8Array, { count: 4 })
    private meta!: Uint8Array;

    get r() {
        return this.meta.at(0)!;
    }

    get g() {
        return this.meta.at(1)!;
    }

    get b() {
        return this.meta.at(2)!;
    }

    get a() {
        return this.meta.at(3)!;
    }

    get originHex() {
        return (this.r << 24) & (this.g << 16) & (this.b << 8) & this.a;
    }
}

export { HexColorRgba as ColorRgba };

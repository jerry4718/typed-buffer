import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';

// @ParserTarget()
// export class Vector3 {
//     @FieldType(t.Float32)
//     x!: number;
//
//     @FieldType(t.Float32)
//     y!: number;
//
//     @FieldType(t.Float32)
//     z!: number;
// }

@ParserTarget()
export class Vector3 {
    @FieldType(t.Float32Array, { count: 3 })
    private meta!: Float32Array;

    get x() {
        return this.meta.at(0)!;
    }

    set x(x: number) {
        this.ensureMeta();
        this.meta[0] = x;
    }

    get y() {
        return this.meta.at(1)!;
    }

    set y(y: number) {
        this.ensureMeta();
        this.meta[1] = y;
    }

    get z() {
        return this.meta.at(2)!;
    }

    set z(z: number) {
        this.ensureMeta();
        this.meta[2] = z;
    }

    ensureMeta() {
        if (!this.meta) this.meta = Float32Array.of(0, 0, 0);
    }
}

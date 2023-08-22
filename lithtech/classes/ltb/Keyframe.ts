import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { Str2H } from '../common/Str2H.ts';

@ParserTarget()
export class Keyframe {
    @FieldType(t.Uint32)
    time!: number;

    @FieldType(Str2H)
    stringBox!: Str2H;

    get string() {
        return this.stringBox.data;
    }
}

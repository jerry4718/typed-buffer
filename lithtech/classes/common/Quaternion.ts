import * as t from '../../../mod.ts';
import { BufferField, BufferFields } from '../../../mod.ts';

@BufferFields(t.Float32)
export class Quaternion {
    @BufferField()
    declare x: number;
    @BufferField()
    declare y: number;
    @BufferField()
    declare z: number;
    @BufferField()
    declare w: number;
}

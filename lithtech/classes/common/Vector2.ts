import * as t from '../../../mod.ts';
import { BufferField, BufferFields } from '../../../mod.ts';

@BufferFields(t.Float32)
export class Vector2 {
    @BufferField()
    declare x: number;
    @BufferField()
    declare y: number;
}

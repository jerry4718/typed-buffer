import * as t from '../../../mod.ts';
import { BufferField, BufferFields } from '../../../mod.ts';

@BufferFields(t.Float32)
export class ColorRgb {
    @BufferField()
    declare r: number;
    @BufferField()
    declare g: number;
    @BufferField()
    declare b: number;
}

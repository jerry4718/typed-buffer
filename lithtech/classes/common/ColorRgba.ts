import * as t from '../../../mod.ts';
import { BufferField, BufferFields } from '../../../mod.ts';

@BufferFields(t.Uint8)
export class ColorRgba {
    @BufferField()
    declare r: number;
    @BufferField()
    declare g: number;
    @BufferField()
    declare b: number;
    @BufferField()
    declare a: number;
}

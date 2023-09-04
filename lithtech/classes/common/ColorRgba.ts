import { BufferField, BufferTarget } from '../../../mod.ts';

@BufferTarget(Uint8Array)
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

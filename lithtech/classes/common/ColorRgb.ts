import { BufferField, BufferTarget } from '../../../mod.ts';

@BufferTarget(Float32Array)
export class ColorRgb {
    @BufferField()
    declare r: number;
    @BufferField()
    declare g: number;
    @BufferField()
    declare b: number;
}

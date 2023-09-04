import { BufferField, BufferTarget } from '../../../mod.ts';

@BufferTarget(Float32Array)
export class Vector2 {
    @BufferField()
    declare x: number;
    @BufferField()
    declare y: number;
}

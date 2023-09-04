import { BufferField, BufferTarget } from '../../../mod.ts';

@BufferTarget(Float32Array)
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

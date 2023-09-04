import { BufferField, BufferTarget } from '../../../mod.ts';

@BufferTarget(Float32Array)
export class Vector3 {
    @BufferField()
    declare x: number;
    @BufferField()
    declare y: number;
    @BufferField()
    declare z: number;
}

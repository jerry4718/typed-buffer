import { FieldType, StructTarget } from '../../../mod.ts';
import { ColorRgba } from '../common/ColorRgba.ts';
import { Vector2 } from '../common/Vector2.ts';
import { Vector3 } from '../common/Vector3.ts';

@StructTarget()
export class Vertex {
    @FieldType(Vector3)
    declare pos: Vector3;

    @FieldType(Vector2)
    declare uv1: Vector2;

    @FieldType(Vector2)
    declare uv2: Vector2;

    @FieldType(ColorRgba)
    declare color: ColorRgba;

    @FieldType(Vector3)
    declare normal: Vector3;
}

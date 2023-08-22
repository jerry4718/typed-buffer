import { FieldType, ParserTarget } from '../../../mod.ts';
import { ColorRgba } from '../common/ColorRgba.ts';
import { Vector2 } from '../common/Vector2.ts';
import { Vector3 } from '../common/Vector3.ts';

@ParserTarget()
export class Vertex {
    @FieldType(Vector3)
    pos!: Vector3;

    @FieldType(Vector2)
    uv1!: Vector2;

    @FieldType(Vector2)
    uv2!: Vector2;

    @FieldType(ColorRgba)
    color!: ColorRgba;

    @FieldType(Vector3)
    normal!: Vector3;
}

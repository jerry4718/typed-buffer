import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { NullMesh } from './NullMesh.ts';
import { RigidMesh } from './RigidMesh.ts';
import { SkeletalMesh } from './SkeletalMesh.ts';
import { UnknownMesh } from './UnknownMesh.ts';
import { VertexAnimatedMesh } from './VertexAnimatedMesh.ts';

@ParserTarget()
export class RenderObject {
    @FieldType(t.Uint32)
    numTextures!: number;

    @FieldType(t.Array, { item: t.Uint32, size: 4 })
    textures!: number;

    @FieldType(t.Uint32)
    renderStyle!: number;

    @FieldType(t.Uint8)
    renderPriority!: number;

    @FieldType(t.Uint32)
    renderObjectType!: number;

    @FieldType(({ scope }: t.ParserContext) => {
        if (scope.renderObjectType === 4) return RigidMesh;
        if (scope.renderObjectType === 5) return SkeletalMesh;
        if (scope.renderObjectType === 6) return VertexAnimatedMesh;
        if (scope.renderObjectType === 7) return NullMesh;
        return UnknownMesh;
    })
    lodMesh!: RigidMesh | SkeletalMesh | VertexAnimatedMesh | NullMesh | UnknownMesh;

    @FieldType(t.Uint8)
    numUsedNodes!: number;

    @FieldType(t.Array, {
        item: t.Uint8,
        count: ({ scope }: t.ParserContext) => scope.numUsedNodes,
    })
    usedNodes!: number;
}

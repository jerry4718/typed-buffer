import * as t from '../../../mod.ts';
import { FieldExpose, FieldType, ParserTarget } from '../../../mod.ts';
import { NullMesh } from './NullMesh.ts';
import { RigidMesh } from './RigidMesh.ts';
import { SkeletalMesh } from './SkeletalMesh.ts';
import { UnknownMesh } from './UnknownMesh.ts';
import { VertexAnimatedMesh } from './VertexAnimatedMesh.ts';
import { MeshType } from './enums/MeshType.ts';

@ParserTarget()
export class RenderObject {
    @FieldType(t.Uint32)
    numTextures!: number;

    @FieldType(t.Uint32Array, { count: 4 })
    textures!: Uint32Array;

    @FieldType(t.Uint32)
    renderStyle!: number;

    @FieldType(t.Uint8)
    renderPriority!: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    renderObjectType!: number;

    @FieldType((_: t.ParserContext, scope: t.ScopeAccessor) => {
        if (scope.renderObjectType === MeshType.RigidMesh) return RigidMesh;
        if (scope.renderObjectType === MeshType.SkeletalMesh) return SkeletalMesh;
        if (scope.renderObjectType === MeshType.VertexAnimatedMesh) return VertexAnimatedMesh;
        if (scope.renderObjectType === MeshType.NullMesh) return NullMesh;
        return UnknownMesh;
    })
    lodMesh!: RigidMesh | SkeletalMesh | VertexAnimatedMesh | NullMesh | UnknownMesh;

    @FieldType(t.Uint8Array, { count: t.Uint8 })
    usedNodes!: Uint8Array;
}

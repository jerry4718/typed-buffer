import * as t from '../../../mod.ts';
import { FieldExpose, FieldType, StructTarget } from '../../../mod.ts';
import { NullMesh } from './NullMesh.ts';
import { RigidMesh } from './RigidMesh.ts';
import { SkeletalMesh } from './SkeletalMesh.ts';
import { UnknownMesh } from './UnknownMesh.ts';
import { VertexAnimatedMesh } from './VertexAnimatedMesh.ts';
import { MeshType } from './enums/MeshType.ts';

@StructTarget()
export class LodContainer {
    @FieldType(t.Uint32)
    declare numTextures: number;

    @FieldType(t.Uint32Array, { count: 4 })
    declare textures: Uint32Array;

    @FieldType(t.Uint32)
    declare renderStyle: number;

    @FieldType(t.Uint8)
    declare renderPriority: number;

    @FieldType(t.Uint32)
    @FieldExpose()
    declare lodMeshType: number;

    @FieldType((_: t.ParserContext, scope: t.ScopeAccessor) => {
        if (scope.lodMeshType === MeshType.RigidMesh) return RigidMesh;
        if (scope.lodMeshType === MeshType.SkeletalMesh) return SkeletalMesh;
        if (scope.lodMeshType === MeshType.VertexAnimatedMesh) return VertexAnimatedMesh;
        if (scope.lodMeshType === MeshType.NullMesh) return NullMesh;
        return UnknownMesh;
    })
    declare lodMesh: RigidMesh | SkeletalMesh | VertexAnimatedMesh | NullMesh | UnknownMesh;

    @FieldType(t.Uint8Array, { count: t.Uint8 })
    declare usedNodes: Uint8Array;
}

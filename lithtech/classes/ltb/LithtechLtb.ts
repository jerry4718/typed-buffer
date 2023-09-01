import * as t from '../../../mod.ts';
import { Ascii, FieldExpose, FieldType, StructTarget } from '../../../mod.ts';
import { Animation } from './Animation.ts';
import { AnimBinding } from './AnimBinding.ts';
import { BoneNode } from './BoneNode.ts';
import { ChildModel } from './ChildModel.ts';
import { LtbHeader } from './LtbHeader.ts';
import { ModelOBB } from './ModelOBB.ts';
import { Piece } from './Piece.ts';
import { Socket } from './Socket.ts';
import { WeightSet } from './WeightSet.ts';

@StructTarget({ endian: 'le', coding: Ascii })
export class LithtechLtb {
    @FieldType(LtbHeader)
    @FieldExpose()
    declare header: LtbHeader;

    @FieldType(t.Array, { item: ModelOBB, count: t.Int32 })
    declare modelOBBs: ModelOBB[];

    @FieldType(t.Array, { item: Piece, count: t.Int32 })
    declare pieces: Piece[];

    @FieldType(BoneNode)
    declare boneTree: BoneNode;

    @FieldType(t.Array, { item: WeightSet, count: t.Uint32 })
    declare weightSets: WeightSet[];

    @FieldType(t.Uint32)
    @FieldExpose()
    declare numChildModels: number;

    @FieldType(t.Array, {
        item: ChildModel,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.numChildModels - 1,
    })
    declare childModels: ChildModel[];

    @FieldType(t.Array, { item: Animation, count: t.Uint32 })
    declare animations: Animation[];

    @FieldType(t.Array, { item: Socket, count: t.Uint32 })
    declare sockets: Socket[];

    @FieldType(t.Array, { item: AnimBinding, count: t.Uint32 })
    declare animBindings: AnimBinding[];
}

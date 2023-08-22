import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { Animation } from './Animation.ts';
import { AnimBinding } from './AnimBinding.ts';
import { BoneNode } from './BoneNode.ts';
import { ChildModel } from './ChildModel.ts';
import { ModelOBB } from './ModelOBB.ts';
import { Piece } from './Piece.ts';
import { Socket } from './Socket.ts';
import { WeightSet } from './WeightSet.ts';

@ParserTarget()
export class LtbBody {
    @FieldType(t.Array, { item: ModelOBB, count: t.Int32 })
    modelOBBs!: ModelOBB[];

    @FieldType(t.Array, { item: Piece, count: t.Int32 })
    pieces!: Piece[];

    @FieldType(BoneNode)
    boneTree!: BoneNode;

    @FieldType(t.Array, { item: WeightSet, count: t.Uint32 })
    weightSets!: WeightSet[];

    @FieldType(t.Uint32)
    numChildModels!: number;

    @FieldType(t.Array, {
        item: ChildModel,
        count: ({ scope }: t.ParserContext) => scope.numChildModels - 1,
    })
    childModels!: ChildModel[];

    @FieldType(t.Array, { item: Animation, count: t.Uint32 })
    animations!: Animation[];

    @FieldType(t.Array, { item: Socket, count: t.Uint32 })
    sockets!: Socket[];

    @FieldType(t.Array, { item: AnimBinding, count: t.Uint32 })
    animBindings!: AnimBinding[];
}

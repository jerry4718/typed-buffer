import * as t from '../../../mod.ts';
import { FieldIf, FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { Animation } from './Animation.ts';
import { AnimBinding } from './AnimBinding.ts';
import { BoneNode } from './BoneNode.ts';
import { ChildModel } from './ChildModel.ts';
import { ObbVersion } from './enums/ObbVersion.ts';
import { ModelOBB } from './ModelOBB.ts';
import { Piece } from './Piece.ts';
import { Socket } from './Socket.ts';
import { WeightSet } from './WeightSet.ts';

@ParserTarget()
export class LtbBody {
    @FieldType(t.Int32)
    numOBBs!: number;

    @FieldType(t.Array, {
        item: ({ scope }: t.ParserContext) => {
            if (scope.scope.header.version === ObbVersion.V23) return getTypedParser(ModelOBB<true>);
            if (scope.scope.header.version === ObbVersion.V24) return getTypedParser(ModelOBB<false>);
            if (scope.scope.header.version === ObbVersion.V25) return getTypedParser(ModelOBB<false>);
        },
        size: ({ scope }: t.ParserContext) => (scope[`numOBBs`] as number),
    })
    modelOBBs!: ModelOBB;

    @FieldType(t.Int32)
    numPieces!: number;

    @FieldType(t.Array, {
        item: getTypedParser(Piece),
        size: ({ scope }: t.ParserContext) => (scope[`numPieces`] as number),
    })
    @FieldIf(({ scope }: t.ParserContext) => scope.numPieces !== 0)
    pieces!: Piece;

    @FieldType(BoneNode)
    boneTree!: BoneNode;

    @FieldType(t.Uint32)
    numWeightSets!: number;

    @FieldType(t.Array, {
        item: getTypedParser(WeightSet),
        size: ({ scope }: t.ParserContext) => (scope[`numWeightSets`] as number),
    })
    weightSets!: WeightSet;

    @FieldType(t.Uint32)
    numChildModels!: number;

    @FieldType(t.Array, {
        item: getTypedParser(ChildModel),
        size: ({ scope }: t.ParserContext) => (scope[`numChildModels - 1`] as number),
    })
    childModels!: ChildModel;

    @FieldType(t.Uint32)
    numAnimations!: number;

    @FieldType(t.Array, {
        item: getTypedParser(Animation),
        size: ({ scope }: t.ParserContext) => (scope[`numAnimations`] as number),
    })
    animations!: Animation;

    @FieldType(t.Uint32)
    numSockets!: number;

    @FieldType(t.Array, {
        item: getTypedParser(Socket),
        size: ({ scope }: t.ParserContext) => (scope[`numSockets`] as number),
    })
    sockets!: Socket;

    @FieldType(t.Uint32)
    numAnimBindings!: number;

    @FieldType(t.Array, {
        item: getTypedParser(AnimBinding),
        size: ({ scope }: t.ParserContext) => (scope[`numAnimBindings`] as number),
    })
    animBindings!: AnimBinding;

}

import * as t from '../../../mod.ts';
import { FieldType, ParserTarget } from '../../../mod.ts';
import { NodeTransform } from './NodeTransform.ts';

@ParserTarget()
export class CompressedTransform {
    @FieldType(t.Array, {
        item: NodeTransform,
        count: (_: t.ParserContext, scope: t.ScopeAccessor) => scope.header.numNodes,
    })
    nodeTransforms!: NodeTransform[];
}

import * as t from '../../../mod.ts';
import { FieldType, getTypedParser, ParserTarget } from '../../../mod.ts';
import { NodeTransform } from './NodeTransform.ts';

@ParserTarget()
export class CompressedTransform {
    @FieldValue(t.Int32)
    compressionType!: number;

    @FieldType(t.Array, {
        item: getTypedParser(NodeTransform<compressionType>),
        size: ({ scope }: t.ParserContext) => (scope.numNodes as number),
    })
    nodeTransforms!: NodeTransform<compressionType>;
}

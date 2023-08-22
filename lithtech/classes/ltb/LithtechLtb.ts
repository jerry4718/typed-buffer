import { FieldType, ParserTarget } from '../../../mod.ts';
import { LtbBody } from './LtbBody.ts';
import { LtbHeader } from './LtbHeader.ts';

@ParserTarget({ endian: 'le' })
export class LithtechLtb {
    @FieldType(LtbHeader)
    header!: LtbHeader;

    @FieldType(LtbBody)
    body!: LtbBody;
}

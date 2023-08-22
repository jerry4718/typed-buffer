import { Ascii, FieldExpose, FieldType, ParserTarget } from '../../../mod.ts';
import { LtbBody } from './LtbBody.ts';
import { LtbHeader } from './LtbHeader.ts';

@ParserTarget({ endian: 'le', coding: Ascii })
export class LithtechLtb {
    @FieldType(LtbHeader)
    @FieldExpose()
    header!: LtbHeader;

    @FieldType(LtbBody)
    body!: LtbBody;
}

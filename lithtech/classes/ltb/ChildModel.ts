import { FieldType, ParserTarget } from '../../../mod.ts';
import { Str2H } from '../common/Str2H.ts';

@ParserTarget()
export class ChildModel {
    @FieldType(Str2H)
    nameBox!: Str2H;

    get name() {
        return this.nameBox.data;
    }
}

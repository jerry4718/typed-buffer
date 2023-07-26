import { AdvancedParser, BaseParser, ParserContext, ParserOptionComposable, ValueSpec } from '@/parser/base-parser';
import { assertType } from '@/utils/type-util';

type ObjectFieldOne<T, K extends keyof T> = {
    name: K,
    type: BaseParser<T[K]>
}

type ObjectField<T> = { [K in keyof T]: ObjectFieldOne<T, K> }[keyof T]

type ObjectParserOption<T> = { fields: ObjectField<T>[] }

const keyFieldSpecs = Symbol('@@keyFieldSpecs');
type StructSpec<T> = { [K in keyof T]: ValueSpec<T[K]> }

export class StructParser<T extends {}> extends AdvancedParser<StructSpec<T>> {
    private readonly fields: ObjectField<T>[];

    constructor(option: ObjectParserOption<T>) {
        super();
        this.fields = option.fields;
    }

    read(ctx: ParserContext<T>, byteOffset: number, option: ParserOptionComposable): ValueSpec<StructSpec<T>> {
        const view = new DataView(ctx.buffer, byteOffset);
        let currentOffset = byteOffset;

        const fieldSpecs = {} as Partial<StructSpec<T>>;
        let fieldsByteSize = 0;
        for (const fieldConfig of this.fields) {
            if (!assertType<ObjectField<T>>(fieldConfig)) continue;
            const { name: fieldName, type: fieldParser } = fieldConfig;

            const fieldSpec = fieldParser.read(view, byteOffset + fieldsByteSize, option);
            fieldSpecs[fieldName] = fieldSpec;
            fieldsByteSize += fieldSpec.byteSize;
        }

        return this.valueSpec(fieldSpecs, byteOffset, currentOffset - byteOffset);
    }

    write(ctx: ParserContext<T>, byteOffset: number, value: T, option: ParserOptionComposable): ValueSpec<StructSpec<T>> {
        return undefined;
    }

}

function getStructParser<T>(parserOption: ObjectParserOption<T>): AdvancedParser<T> {
    const { fields } = parserOption;

    return {
        [keyAdvancedCreator]: getStructParser,
        read(view: DataView, byteOffset: number, option?: ParserOptionComposable): ValueSpec<T> {
        },
        write(view: DataView, byteOffset: number, value: T, option?: ParserOptionComposable): ValueSpec<T> {
            let currentOffset = byteOffset;

            for (const field of fields) {
                const { name, type } = field;
                const fieldValue = value[name];
                const { byteSize } = type.write(view, currentOffset, fieldValue, option);
                currentOffset += byteSize;
            }

            return valueSpec(value, byteOffset, currentOffset - byteOffset);
        },
    };
}

import { FieldPoint } from '../src/decorate/decorator.ts';

function CamCase(name: string): string {
    return name
        .replace(
            /(^|_+|\d)[a-z]/g,
            t => t.replace(/^_/, '').toUpperCase(),
        )
        .replace(/_/g, '');
}

function camCase(name: string): string {
    return name
        .replace(
            /(_+|\d)[a-z]/g,
            t => t.replace(/^_/, '').toUpperCase(),
        )
        .replace(/_/g, '');
}

type StructInfo = {
    meta?: {
        id: string,
        'file-extension': string,
        endian: string
    },
    params: StructParam[]
    seq: StructSeq[]
    instances: { [k in string]: StructInstance },
    types: { [k in string]: StructInfo }
}

type StructParam = {
    id: string,
    type: string
}

type StructSeq = {
    id: string,
    type: string | SwitchType,
    encoding: string,
    size: string,
    if: string,
    repeat: string
    'repeat-expr': string
}

type SwitchType = {
    'switch-on': string,
    cases: { [ k: string ]: string }
}

type StructInstance = {
    value: string,
    pos: string,
    type: string
}

function pri(type: string) {
    const [ _, p, s ] = type.match(/^([usf])(\d+)$/)!;

    const size = Number(s) * 8;
    if (p === 'u') return `${size >= 64 ? 'Big' : ''}Uint${size}`;
    if (p === 's') return `${size >= 64 ? 'Big' : ''}Int${size}`;
    if (p === 'f') return `Float${size}`;
    return 'unknown';
}

function parseTypeName(type: string | SwitchType) {
    // console.log(ClassName, paramId);
    if (typeof type === 'string') {
        if (/^[usf]\d+$/.test(type)) {
            return { d: 'number', p: `t.${pri(type)}` };
        }
        if (type === 'str') {
            return { d: 'string', p: 't.String' };
        }
        if (type === 'bool') {
            return { d: 'boolean', p: 't.Uint8' };
        }
        return { d: CamCase(type), p: CamCase(type) };
    }
    return { d: 'unknown', p: `'${JSON.stringify(type)}'` };
    // for (const [ condition, resolve ] of Object.entries(type)) {
    //
    // }
}

let tabs = 0;

function tab(count: number = 0) {
    tabs += count;
    return Math.pow(2, tabs)
        .toString(2)
        .replace(/^1/, '')
        .replace(/0/g, '\t');
}

const codes: string[] = [
    `import { FieldExpose, FieldIf, FieldType, getStructReadSnap, getStructWriteSnap, ParserTarget } from '../mod.ts';`,
    `import * as t from '../mod.ts';`,
];

function push(code: string) {
    codes.push(`${tab()}${code}`);
}

function pushTypeCode(typeName: string, typeInfo: StructInfo) {
    const { params = [], seq = [], instances = {} } = typeInfo;
    if (typeInfo.meta) {
        const ClassName = CamCase(typeInfo.meta.id);
        const endian = CamCase(typeInfo.meta.endian);
        push(`@ParserTarget({ endian: '${endian}' })`);
        push(`export class ${ClassName} {`);
    }
    //
    else {
        const ClassName = CamCase(typeName);
        push(`@ParserTarget()`);
        push(`export class ${ClassName} {`);
    }
    tab(1);

    params.forEach(({ id, type }) => {
        const param_name = camCase(id);
        const param_type = parseTypeName(type);
        push(`@FieldValue(${param_type.p})`);
        push(`${param_name}!: ${param_type.d};`);
    });

    seq.forEach((seq) => {
        push(`\r`);
        const seq_name = camCase(seq.id);
        const seq_type = parseTypeName(seq.type);

        if (seq.type === 'str') {
            push(`@FieldType(${seq_type.p}, { size: ({ scope }: t.ParserContext) => (scope.${camCase(seq.size)} as number) })`);
        }
        //
        else if (seq.repeat && seq[ 'repeat-expr' ]) {
            // ${seq_type.p}
            push(`@FieldType(t.Array, {`);
            push(`\titem: ${seq_type.p},`);
            console.log(seq);
            if (typeof seq[ 'repeat-expr' ] === 'string') {
                push(`\tsize: ({ scope }: t.ParserContext) => (scope[\`${camCase(seq[ 'repeat-expr' ])}\`] as number)`);
            } else {
                push(`\tsize: ${seq[ 'repeat-expr' ]}`);
            }
            push(`})`);
        }
            //
            // else if () {
            //
            // }
        //
        else {
            push(`@FieldType(${seq_type.p})`);
        }

        if (seq.if) {
            push(`@FieldIf(({ scope }: t.ParserContext) => scope[\`${seq.if}\`])`);
        }

        push(`${seq_name}!: ${seq_type.d};`);
    });

    push(`\r`);
    for (let [ name, getter ] of Object.entries(instances)) {
        if (getter.value) {
            push(`get ${camCase(name)} () {`);
            if (typeof getter.value === 'string') {
                push(`\treturn this.${camCase(getter.value)}`);
            }
            else {
                push(`\treturn '${ getter.value }'`);
            }
            push(`}`);
            continue;
        }
        const seq_type = parseTypeName(getter.type);
        push(`@FieldType(${seq_type.p})`);
        push(`@FieldPoint(({ scope }: t.ParserContext) => ( scope[\`${getter.pos}\`] as number ))`);
        push(`${camCase(name)}!: ${seq_type.d};`);
    }
    // console.log(parsedSeq);

    tab(-1);
    push(`}`);
    push(`\r`);
}

function parse(rootName: string, json: StructInfo) {
    // console.log(Object.keys(json.types).map(CamCase));
    for (const [ typeName, typeInfo ] of Object.entries(json.types).reverse()) {
        pushTypeCode(typeName, typeInfo);
    }
    pushTypeCode(rootName, json);
}


const fileBuffer = await Deno.readFile('./files/struct_lithtech_ltb.json');

const string = new TextDecoder('utf-8').decode(fileBuffer);

try {
    parse('lithtech_ltb', JSON.parse(string));
    await Deno.writeFile(`./out_${Date.now()}.ts`, new TextEncoder().encode(codes.join('\n')));
} catch (e) {
    console.error(e);
}

console.log(codes.join('\n'));

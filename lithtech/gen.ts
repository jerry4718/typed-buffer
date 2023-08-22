function CamCase(name: string): string {
    return name
        .replace(/(?<=\b)_parent(?=\.)/, 'scope')
        .replace(/(?<=\b)_root(?=\.)/, 'scope')
        .replace(/(?<=::)[a-zA-Z0-9_]+(?=\b)/, CamCase)
        .replace(/(?<=\b)[a-zA-Z0-9_]+(?=::)/, CamCase)
        .replace(
            /(^|_+|\d)[a-z]/g,
            t => t.replace(/^_/, '').toUpperCase(),
        )
        .replace(/_/g, '')
        .replace(/::/g, '.')
        .replace(/\(/g, '<')
        .replace(/\)/g, '>');
}

function camCase(name: string): string {
    return name
        .replace(/(?<=\b)_parent(?=\.)/, 'scope')
        .replace(/(?<=\b)_root(?=\.)/, 'scope')
        .replace(/(?<=::)[a-zA-Z0-9_]+(?=\b)/, CamCase)
        .replace(/(?<=\b)[a-zA-Z0-9_]+(?=::)/, CamCase)
        .replace(
            /(_+|\d)[a-z]/g,
            t => t.replace(/^_/, '').toUpperCase(),
        )
        .replace(/_/g, '')
        .replace(/::/g, '.');
}

type StructInfo = {
    meta?: {
        id: string,
        'file-extension': string,
        endian: string
    },
    enums?: { [k: string]: { [k: string]: string } },
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
    contents: number[],
}

type SwitchType = {
    'switch-on': string,
    cases: { [k: string]: string }
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
    const cases = type.cases;
    const switch_on = type['switch-on'];
    if (cases && switch_on) {
        const case_entries = Object.entries(cases);

        const d: string = [
            ...new Set(
                case_entries.map(([ _, t ]) => parseTypeName(t).d),
            ),
        ].join(' | ');

        const p: string = [
            `({ scope }: t.ParserContext) => {`,
            ...case_entries.map(([ c, s ]) => c !== '_'
                ? `\t\t${tab()}if (scope.${camCase(switch_on)} === ${camCase(c)}) return ${parseTypeName(s).p};`
                : `\t\t${tab()}return ${parseTypeName(s).p};`,
            ),
            `${tab()}\t}`,
        ].join('\n');

        return { d, p };
    }
    return { d: 'unknown', p: `'${JSON.stringify(type)}'` };
    // for (const [ condition, resolve ] of Object.entries(type)) {
    //
    // }
}

const operators = [ '+', '-', '*', '/', '>', '<', '>=', '<=', '==', '!=', '&&', '||', '!' ];
const strict = [ '==', '!=' ];

function parseIf(condition: string, prefix: string = ''): string {
    return condition
        .split(/\bnot\b/).join('!')
        .split(' and ').join(' && ')
        .split(' or ').join(' || ')
        .split(' ')
        .map(t => {
            if (strict.includes(t)) return `${t}=`;
            if (operators.includes(t)) return t;
            if (/(\)$|^\()/.test(t)) {
                return t.replace(/(?<=^\()([^(]+)$/, p)
                    .replace(/^([^)]+)(?=\)$)/, p);
            }

            return p(t);

            function p(t: string) {
                if (/^\d+(\.\d+)?$/.test(t)) return t;
                return `${prefix}${camCase(t)}`;
            }
        })
        .join(' ');
}

let tabs = 0;

function tab(count: number = 0) {
    tabs += count;
    return Math.pow(2, tabs)
        .toString(2)
        .replace(/^1/, '')
        .replace(/0/g, '\t');
}

const codes: string[] = [];

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

    seq.forEach((seq, sdx) => {
        if (sdx) push(`\r`);
        const seq_name = camCase(seq.id);
        if (seq.contents) {
            // hack
            push(`@FieldType(t.Array, { item: t.Uint8, size: 4 })`);
            push(`${seq_name}!: number[];`);
            return;
        }
        if (!seq.type) {
            push(`@FieldType(t.Array, { item: t.Uint8, size: ({ scope }: t.ParserContext) => (scope.${camCase(seq.size)} as number) })`);
            push(`${seq_name}!: number[];`);
            return;
        }
        const seq_type = parseTypeName(seq.type);
        if (seq.repeat && seq['repeat-expr']) {
            // ${seq_type.p}
            push(`@FieldType(t.Array, {`);
            push(`\titem: ${seq_type.p},`);
            // console.log(seq);
            if (typeof seq['repeat-expr'] === 'string') {
                push(`\tsize: ({ scope }: t.ParserContext) => (scope[\`${camCase(seq['repeat-expr'])}\`] as number)`);
            }
            else {
                push(`\tsize: ${seq['repeat-expr']}`);
            }
            push(`})`);
        }
        else if (seq.type === 'str') {
            push(`@FieldType(${seq_type.p}, { size: ({ scope }: t.ParserContext) => (scope.${camCase(seq.size)} as number) })`);
        }
            //
            //
            // else if () {
            //
            // }
        //
        else {
            push(`@FieldType(${seq_type.p})`);
        }

        if (seq.if) {
            push(`@FieldIf(({ scope }: t.ParserContext) => ${parseIf(seq.if, 'scope.')})`);
        }

        push(`${seq_name}!: ${seq_type.d};`);
    });

    if (instances) push(`\r`);
    for (const [ name, getter ] of Object.entries(instances)) {
        if (getter.value) {
            push(`get ${camCase(name)} () {`);
            if (typeof getter.value === 'string') {
                push(`\treturn this.${camCase(getter.value)}`);
            }
            else {
                push(`\treturn '${getter.value}'`);
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
    if (json.enums) {
        for (const [ enum_name, enumBody ] of Object.entries(json.enums)) {
            const EnumName = CamCase(enum_name);
            push(`export enum ${EnumName} {`);
            tab(1);
            for (const [ enum_value, enum_key ] of Object.entries(enumBody)) {
                const EnumKey = CamCase(enum_key);
                push(`${EnumKey} = ${enum_value},`);
            }
            tab(-1);
            push(`}`);
        }
    }
    // console.log(Object.keys(json.types).map(CamCase));
    for (const [ typeName, typeInfo ] of Object.entries(json.types).reverse()) {
        pushTypeCode(typeName, typeInfo);
    }
    pushTypeCode(rootName, json);
}

const codeHead = [
    `import { FieldExpose, FieldIf, FieldType, getStructReadSnap, getStructWriteSnap, ParserTarget } from '../mod.ts';`,
    `import * as t from '../mod.ts';`,
];

try {
    codes.splice(0, codes.length);
    codes.push(...codeHead);

    const ltbBuffer = await Deno.readFile('./files/struct_lithtech_ltb.json');
    const ltbString = new TextDecoder('utf-8').decode(ltbBuffer);

    parse('lithtech_ltb', JSON.parse(ltbString));
    await Deno.writeFile(`./out_${Date.now()}_lithtech_ltb.ts`, new TextEncoder().encode(codes.join('\n')));
} catch (e) {
    console.error(e);
}

try {
    codes.splice(0, codes.length);
    codes.push(...codeHead);

    const datBuffer = await Deno.readFile('./files/struct_lithtech_dat.json');
    const datString = new TextDecoder('utf-8').decode(datBuffer);

    parse('lithtech_dat', JSON.parse(datString));
    await Deno.writeFile(`./out_${Date.now()}_lithtech_dat.ts`, new TextEncoder().encode(codes.join('\n')));
} catch (e) {
    console.error(e);
}

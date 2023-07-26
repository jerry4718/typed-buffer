import { EncodingAscii } from './encoding-ascii';

export type Encoding = {
    encode: (str: string) => Uint8Array,
    decode: (bytes: Uint8Array) => string,
}

export namespace Encodings {
    export const Ascii = EncodingAscii;
}

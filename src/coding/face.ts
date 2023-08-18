export interface Coding {
    encode: (str: string) => Uint8Array,
    decode: (bytes: Uint8Array) => string,
}

declare module '@codec-bytes/ascii' {
    export function _encode(str: string): Iterable<number>
    export function _decode(bytes: ArrayLike<number>): Iterable<string>
    export function encode(str: string): number[]
    export function decode(bytes: ArrayLike<number>): string
}

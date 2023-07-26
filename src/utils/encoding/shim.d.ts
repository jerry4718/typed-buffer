declare module '@codec-bytes/ascii' {
    export function encode(str: string): number[]
    export function decode(bytes: number[]): string
}

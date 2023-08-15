declare module 'npm:@codec-bytes/ascii@^3.0.0' {
    export function encode(str: string): number[]
    export function decode(bytes: number[]): string
}

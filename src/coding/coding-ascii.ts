import { Coding } from './face.ts';
// @ts-ignore
import { _encode, _decode } from '@codec-bytes/ascii';

export const CodingAscii: Coding = {
    decode(bytes) {
        return Array.from(_decode(bytes)).join('');
    },
    encode(str) {
        return Uint8Array.from(_encode(str));
    },
};

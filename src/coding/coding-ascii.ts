/// <reference path="../../types/@codec-bytes/ascii.d.ts" />
import { Coding } from './face.ts';
import { _encode, _decode } from '@codec-bytes/ascii';

export const CodingAscii: Coding = {
    decode(bytes) {
        return Array.from(_decode(bytes)).join('');
    },
    encode(str) {
        return Uint8Array.from(_encode(str));
    },
};

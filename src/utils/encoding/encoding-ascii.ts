import { slice } from '../proto-fn.ts';
import { Encoding } from './index.ts';
import { encode, decode } from '@codec-bytes/ascii';

export const EncodingAscii: Encoding = {
    decode(bytes) {
        return decode(slice.call(bytes));
    },
    encode(str) {
        return Uint8Array.from(encode(str));
    },
};

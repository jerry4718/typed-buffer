import { Coding } from './face.ts';

export const CodingUtf8: Coding = {
    decode(bytes) {
        return new TextDecoder('utf-8').decode(bytes.buffer);
    },
    encode(str) {
        return new TextEncoder().encode(str);
    },
};

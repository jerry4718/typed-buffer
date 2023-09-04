import { type Coding } from './face.ts';

const decoder = new TextDecoder('utf-8');
const encoder = new TextEncoder();

export const CodingUtf8: Coding = {
    decode(bytes) {
        return decoder.decode(bytes.buffer);
    },
    encode(str) {
        return encoder.encode(str);
    },
};

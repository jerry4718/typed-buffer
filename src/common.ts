export const BigEndian = 'be' as const;
export const LittleEndian = 'le' as const;
export type Endian = typeof BigEndian | typeof LittleEndian;

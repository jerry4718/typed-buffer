export enum MeshType {
    RigidMesh = 4,
    SkeletalMesh = 5,
    VertexAnimatedMesh = 6,
    NullMesh = 7,
}

export enum DataMark {
    LiePosition = 0,
    LieNormal = 1,
    LieColor = 2,
    LieUv1 = 4,
    LieUv2 = 5,
    LieUv3 = 6,
    LieUv4 = 7,
    LieBasisVector = 8,
}

export enum AnimCompressionType {
    CmpNone = 0,
    CmpRelevant = 1,
    CmpRelevant16 = 2,
    CmpRelevantRot16 = 3,
}

export enum ObbVersion {
    V23 = 23,
    V24 = 24,
    V25 = 25,
}

export enum ErrorMark {
    InvalidBone = 0xff,
}

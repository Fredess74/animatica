/**
 * GLBLoader — Loads .glb models and extracts skeletons for character use.
 * Uses @react-three/drei's useGLTF for React integration.
 *
 * Supports:
 * - Humanoid rigged characters (auto-maps Mixamo/RPM bone naming)
 * - Static props (no skeleton)
 * - Animation clips embedded in GLB
 */
import * as THREE from 'three'
import type { CharacterRig, HumanoidBoneName } from './CharacterLoader'

// Bone name mapping: common naming conventions → our standard names
const BONE_NAME_MAP: Record<string, HumanoidBoneName> = {
    // Mixamo naming
    'mixamorigHips': 'Hips',
    'mixamorigSpine': 'Spine',
    'mixamorigSpine1': 'Chest',
    'mixamorigSpine2': 'Chest',
    'mixamorigNeck': 'Neck',
    'mixamorigHead': 'Head',
    'mixamorigLeftShoulder': 'LeftShoulder',
    'mixamorigLeftArm': 'LeftArm',
    'mixamorigLeftForeArm': 'LeftForeArm',
    'mixamorigLeftHand': 'LeftHand',
    'mixamorigRightShoulder': 'RightShoulder',
    'mixamorigRightArm': 'RightArm',
    'mixamorigRightForeArm': 'RightForeArm',
    'mixamorigRightHand': 'RightHand',
    'mixamorigLeftUpLeg': 'LeftUpperLeg',
    'mixamorigLeftLeg': 'LeftLowerLeg',
    'mixamorigLeftFoot': 'LeftFoot',
    'mixamorigRightUpLeg': 'RightUpperLeg',
    'mixamorigRightLeg': 'RightLowerLeg',
    'mixamorigRightFoot': 'RightFoot',

    // Generic / Blender / RPM naming (case-insensitive checked separately)
    'Hips': 'Hips',
    'Spine': 'Spine',
    'Spine1': 'Chest',
    'Spine2': 'Chest',
    'Neck': 'Neck',
    'Head': 'Head',
    'LeftShoulder': 'LeftShoulder',
    'LeftArm': 'LeftArm',
    'LeftForeArm': 'LeftForeArm',
    'LeftHand': 'LeftHand',
    'RightShoulder': 'RightShoulder',
    'RightArm': 'RightArm',
    'RightForeArm': 'RightForeArm',
    'RightHand': 'RightHand',
    'LeftUpLeg': 'LeftUpperLeg',
    'LeftLeg': 'LeftLowerLeg',
    'LeftFoot': 'LeftFoot',
    'RightUpLeg': 'RightUpperLeg',
    'RightLeg': 'RightLowerLeg',
    'RightFoot': 'RightFoot',
}

export interface GLBLoadResult {
    /** Root scene group */
    scene: THREE.Group
    /** Extracted skeleton if humanoid */
    skeleton: THREE.Skeleton | null
    /** Mapped bone references */
    bones: Map<HumanoidBoneName, THREE.Bone>
    /** Animation clips embedded in the GLB */
    animations: THREE.AnimationClip[]
    /** Whether this model has a humanoid skeleton */
    isHumanoid: boolean
    /** Primary mesh (for morph targets) */
    bodyMesh: THREE.SkinnedMesh | null
    /** Morph target name → index map */
    morphTargetMap: Record<string, number>
}

/**
 * Map a bone name from any convention to our standard naming.
 */
function mapBoneName(name: string): HumanoidBoneName | null {
    // Direct lookup
    if (name in BONE_NAME_MAP) return BONE_NAME_MAP[name]

    // Case-insensitive fuzzy match
    const lower = name.toLowerCase().replace(/[_\-\s]/g, '')
    for (const [key, value] of Object.entries(BONE_NAME_MAP)) {
        if (key.toLowerCase().replace(/[_\-\s]/g, '') === lower) return value
    }

    return null
}

/**
 * Extract skeleton and map bones from a loaded GLB scene.
 */
function extractSkeleton(scene: THREE.Group): {
    skeleton: THREE.Skeleton | null
    bones: Map<HumanoidBoneName, THREE.Bone>
    bodyMesh: THREE.SkinnedMesh | null
    morphTargetMap: Record<string, number>
} {
    const bones = new Map<HumanoidBoneName, THREE.Bone>()
    let skeleton: THREE.Skeleton | null = null
    let bodyMesh: THREE.SkinnedMesh | null = null
    const morphTargetMap: Record<string, number> = {}

    scene.traverse((child) => {
        // Extract skeleton from SkinnedMesh
        if (child instanceof THREE.SkinnedMesh) {
            if (!skeleton && child.skeleton) {
                skeleton = child.skeleton
            }
            // Find body mesh (largest by vertex count)
            if (!bodyMesh || (child.geometry.attributes.position &&
                child.geometry.attributes.position.count >
                (bodyMesh.geometry.attributes.position?.count || 0))) {
                bodyMesh = child
            }
        }

        // Map bone names
        if (child instanceof THREE.Bone) {
            const mapped = mapBoneName(child.name)
            if (mapped) {
                bones.set(mapped, child)
            }
        }
    })

    // Extract morph target names
    if (bodyMesh) {
        const mesh = bodyMesh as THREE.SkinnedMesh
        const dict = mesh.morphTargetDictionary
        if (dict) {
            for (const [name, index] of Object.entries(dict)) {
                morphTargetMap[name] = index
            }
        }
    }

    return { skeleton, bones, bodyMesh, morphTargetMap }
}

/**
 * Parse a loaded GLTF result into our CharacterRig format.
 * Call this after useGLTF or GLTFLoader.
 */
export function parseGLBResult(
    scene: THREE.Group,
    animations: THREE.AnimationClip[] = [],
): GLBLoadResult {
    const clonedScene = scene.clone(true)
    const { skeleton, bones, bodyMesh, morphTargetMap } = extractSkeleton(clonedScene)

    // Consider humanoid if we found at least Hips + Head + 2 limbs
    const requiredBones: HumanoidBoneName[] = ['Hips', 'Head', 'LeftArm', 'RightArm']
    const isHumanoid = requiredBones.every((b) => bones.has(b))

    return {
        scene: clonedScene,
        skeleton,
        bones,
        animations,
        isHumanoid,
        bodyMesh,
        morphTargetMap,
    }
}

/**
 * Convert a GLBLoadResult to a CharacterRig for use by CharacterAnimator.
 */
export function glbToCharacterRig(result: GLBLoadResult): CharacterRig {
    // Build bones Map matching CharacterRig type
    const bonesMap = new Map<string, THREE.Bone>()
    result.bones.forEach((bone, name) => {
        bonesMap.set(name, bone)
    })

    return {
        root: result.scene,
        bones: bonesMap,
        skeleton: result.skeleton,
        bodyMesh: result.bodyMesh,
        morphTargetMap: result.morphTargetMap,
        animations: result.animations,
    }
}

/**
 * Bundled model manifest — CC0 models that ship with the app.
 */
export interface BundledModel {
    id: string
    name: string
    category: 'character' | 'prop' | 'environment'
    thumbnail: string
    url: string
    source: string
    license: 'CC0' | 'CC-BY'
    polyCount: number
    hasRig: boolean
}

export const BUNDLED_MODELS: BundledModel[] = [
    // Characters from Quaternius
    {
        id: 'char-knight',
        name: 'Animated Knight',
        category: 'character',
        thumbnail: '🛡️',
        url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Soldier.glb',
        source: 'three.js examples',
        license: 'CC0',
        polyCount: 7500,
        hasRig: true,
    },
    {
        id: 'char-robot',
        name: 'Robot Character',
        category: 'character',
        thumbnail: '🤖',
        url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
        source: 'three.js examples',
        license: 'CC0',
        polyCount: 4200,
        hasRig: true,
    },
    {
        id: 'char-xbot',
        name: 'X-Bot',
        category: 'character',
        thumbnail: '🧑',
        url: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/Xbot.glb',
        source: 'Mixamo',
        license: 'CC0',
        polyCount: 12000,
        hasRig: true,
    },
    // Props
    {
        id: 'prop-chair',
        name: 'Wooden Chair',
        category: 'prop',
        thumbnail: '🪑',
        url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb',
        source: 'Khronos glTF Samples',
        license: 'CC0',
        polyCount: 1800,
        hasRig: false,
    },
    {
        id: 'prop-helmet',
        name: 'Damaged Helmet',
        category: 'prop',
        thumbnail: '⛑️',
        url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
        source: 'Khronos glTF Samples',
        license: 'CC-BY',
        polyCount: 2800,
        hasRig: false,
    },
    {
        id: 'prop-duck',
        name: 'Rubber Duck',
        category: 'prop',
        thumbnail: '🦆',
        url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF-Binary/Duck.glb',
        source: 'Khronos glTF Samples',
        license: 'CC0',
        polyCount: 400,
        hasRig: false,
    },
    // Environment
    {
        id: 'env-terrain',
        name: 'Low Poly Terrain',
        category: 'environment',
        thumbnail: '🏔️',
        url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Box/glTF-Binary/Box.glb',
        source: 'Khronos glTF Samples',
        license: 'CC0',
        polyCount: 12,
        hasRig: false,
    },
]

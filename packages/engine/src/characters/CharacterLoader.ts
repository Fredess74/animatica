/**
 * CharacterLoader — Loads GLB character models and extracts SkinnedMesh, bones, and morph targets.
 * 
 * Supports three modes:
 * 1. GLB file loading (useGLTF)
 * 2. Procedural generation (fallback when no GLB)
 * 3. Preset-based construction
 * 
 * @module @animatica/engine/character
 */
import * as THREE from 'three'

/**
 * Extracted character rig from a loaded GLB.
 */
export interface CharacterRig {
    /** Root group containing all meshes */
    root: THREE.Group
    /** The main skinned body mesh */
    bodyMesh: THREE.SkinnedMesh | null
    /** Skeleton (shared across body + clothing) */
    skeleton: THREE.Skeleton | null
    /** All named bones */
    bones: Map<string, THREE.Bone>
    /** Morph target names → indices */
    morphTargetMap: Record<string, number>
    /** Animation clips embedded in the GLB */
    animations: THREE.AnimationClip[]
}

/**
 * Standard humanoid bone names (25 bones).
 * Matches Mixamo/Ready Player Me convention.
 */
export const HUMANOID_BONES = [
    'Hips', 'Spine', 'Chest', 'Neck', 'Head',
    'LeftEye', 'RightEye', 'Jaw',
    'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand',
    'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand',
    'LeftUpperLeg', 'LeftLowerLeg', 'LeftFoot',
    'RightUpperLeg', 'RightLowerLeg', 'RightFoot',
] as const

export type HumanoidBoneName = typeof HUMANOID_BONES[number]

/**
 * Extract character rig data from a loaded GLTF scene.
 */
export function extractRig(gltfScene: THREE.Group, animations: THREE.AnimationClip[] = []): CharacterRig {
    const root = gltfScene.clone(true)
    let bodyMesh: THREE.SkinnedMesh | null = null
    let skeleton: THREE.Skeleton | null = null
    const bones = new Map<string, THREE.Bone>()
    let morphTargetMap: Record<string, number> = {}

    root.traverse((child) => {
        // Find the main skinned mesh (largest vertex count)
        if (child instanceof THREE.SkinnedMesh) {
            if (!bodyMesh || child.geometry.attributes.position.count > bodyMesh.geometry.attributes.position.count) {
                bodyMesh = child
                skeleton = child.skeleton

                // Extract morph targets
                if (child.morphTargetDictionary) {
                    morphTargetMap = { ...child.morphTargetDictionary }
                }
            }

            // Enable shadows
            child.castShadow = true
            child.receiveShadow = true
        }

        // Collect all bones
        if (child instanceof THREE.Bone) {
            bones.set(child.name, child)
        }
    })

    return {
        root,
        bodyMesh,
        skeleton,
        bones,
        morphTargetMap,
        animations,
    }
}

/**
 * Create a procedural humanoid mesh (fallback when no GLB available).
 * Uses capsule/sphere primitives attached to a skeleton.
 * This provides a functional character even without external assets.
 */
export function createProceduralHumanoid(options: {
    skinColor?: string
    height?: number
    build?: number
} = {}): CharacterRig {
    const { skinColor = '#D4A27C', height = 1.0, build = 0.5 } = options

    const root = new THREE.Group()
    const bones = new Map<string, THREE.Bone>()
    const material = new THREE.MeshPhysicalMaterial({
        color: skinColor,
        roughness: 0.65,
        metalness: 0.0,
        clearcoat: 0.05,
        clearcoatRoughness: 0.4,
        sheen: 0.2,
        sheenRoughness: 0.8,
        sheenColor: new THREE.Color('#ff9999'),
    })

    // Scale factors
    const h = height
    const w = 0.15 + build * 0.15 // body width scales with build

    // Create bone hierarchy
    const hipsBone = createBone('Hips', [0, h * 0.55, 0])
    const spineBone = createBone('Spine', [0, h * 0.1, 0])
    const chestBone = createBone('Chest', [0, h * 0.15, 0])
    const neckBone = createBone('Neck', [0, h * 0.08, 0])
    const headBone = createBone('Head', [0, h * 0.05, 0])

    const leftShoulderBone = createBone('LeftShoulder', [-w * 0.6, h * 0.02, 0])
    const leftArmBone = createBone('LeftArm', [-w * 0.8, 0, 0])
    const leftForeArmBone = createBone('LeftForeArm', [-h * 0.18, 0, 0])
    const leftHandBone = createBone('LeftHand', [-h * 0.16, 0, 0])

    const rightShoulderBone = createBone('RightShoulder', [w * 0.6, h * 0.02, 0])
    const rightArmBone = createBone('RightArm', [w * 0.8, 0, 0])
    const rightForeArmBone = createBone('RightForeArm', [h * 0.18, 0, 0])
    const rightHandBone = createBone('RightHand', [h * 0.16, 0, 0])

    const leftUpperLegBone = createBone('LeftUpperLeg', [-w * 0.35, -h * 0.05, 0])
    const leftLowerLegBone = createBone('LeftLowerLeg', [0, -h * 0.25, 0])
    const leftFootBone = createBone('LeftFoot', [0, -h * 0.25, 0])

    const rightUpperLegBone = createBone('RightUpperLeg', [w * 0.35, -h * 0.05, 0])
    const rightLowerLegBone = createBone('RightLowerLeg', [0, -h * 0.25, 0])
    const rightFootBone = createBone('RightFoot', [0, -h * 0.25, 0])

    // Build hierarchy
    hipsBone.add(spineBone)
    spineBone.add(chestBone)
    chestBone.add(neckBone, leftShoulderBone, rightShoulderBone)
    neckBone.add(headBone)
    leftShoulderBone.add(leftArmBone)
    leftArmBone.add(leftForeArmBone)
    leftForeArmBone.add(leftHandBone)
    rightShoulderBone.add(rightArmBone)
    rightArmBone.add(rightForeArmBone)
    rightForeArmBone.add(rightHandBone)
    hipsBone.add(leftUpperLegBone, rightUpperLegBone)
    leftUpperLegBone.add(leftLowerLegBone)
    leftLowerLegBone.add(leftFootBone)
    rightUpperLegBone.add(rightLowerLegBone)
    rightLowerLegBone.add(rightFootBone)

    // Store all bones
    const allBones = [
        hipsBone, spineBone, chestBone, neckBone, headBone,
        leftShoulderBone, leftArmBone, leftForeArmBone, leftHandBone,
        rightShoulderBone, rightArmBone, rightForeArmBone, rightHandBone,
        leftUpperLegBone, leftLowerLegBone, leftFootBone,
        rightUpperLegBone, rightLowerLegBone, rightFootBone,
    ]

    allBones.forEach((b) => bones.set(b.name, b))

    // Create body meshes attached to bones
    // Head sphere
    const headMesh = createBodyPart(
        new THREE.SphereGeometry(h * 0.12, 24, 24),
        material,
        [0, h * 0.12, 0]
    )
    headBone.add(headMesh)

    // Torso capsule
    const torsoMesh = createBodyPart(
        new THREE.CapsuleGeometry(w, h * 0.2, 8, 16),
        material,
        [0, h * 0.05, 0]
    )
    spineBone.add(torsoMesh)

    // Upper arms
    const armGeo = new THREE.CapsuleGeometry(w * 0.25, h * 0.12, 4, 8)
    armGeo.rotateZ(Math.PI / 2)
    leftArmBone.add(createBodyPart(armGeo.clone(), material, [-h * 0.08, 0, 0]))
    rightArmBone.add(createBodyPart(armGeo.clone(), material, [h * 0.08, 0, 0]))

    // Forearms
    const forearmGeo = new THREE.CapsuleGeometry(w * 0.2, h * 0.1, 4, 8)
    forearmGeo.rotateZ(Math.PI / 2)
    leftForeArmBone.add(createBodyPart(forearmGeo.clone(), material, [-h * 0.07, 0, 0]))
    rightForeArmBone.add(createBodyPart(forearmGeo.clone(), material, [h * 0.07, 0, 0]))

    // Hands
    const handGeo = new THREE.SphereGeometry(w * 0.18, 8, 8)
    leftHandBone.add(createBodyPart(handGeo.clone(), material, [0, 0, 0]))
    rightHandBone.add(createBodyPart(handGeo.clone(), material, [0, 0, 0]))

    // Upper legs
    const legGeo = new THREE.CapsuleGeometry(w * 0.3, h * 0.15, 4, 8)
    leftUpperLegBone.add(createBodyPart(legGeo.clone(), material, [0, -h * 0.12, 0]))
    rightUpperLegBone.add(createBodyPart(legGeo.clone(), material, [0, -h * 0.12, 0]))

    // Lower legs
    const lowerLegGeo = new THREE.CapsuleGeometry(w * 0.25, h * 0.15, 4, 8)
    leftLowerLegBone.add(createBodyPart(lowerLegGeo.clone(), material, [0, -h * 0.12, 0]))
    rightLowerLegBone.add(createBodyPart(lowerLegGeo.clone(), material, [0, -h * 0.12, 0]))

    // Feet
    const footGeo = new THREE.BoxGeometry(w * 0.35, h * 0.04, h * 0.12)
    leftFootBone.add(createBodyPart(footGeo.clone(), material, [0, -h * 0.02, h * 0.03]))
    rightFootBone.add(createBodyPart(footGeo.clone(), material, [0, -h * 0.02, h * 0.03]))

    // Eyes (emissive white)
    const eyeMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', emissive: '#FFFFFF', emissiveIntensity: 0.2 })
    const eyeGeo = new THREE.SphereGeometry(h * 0.025, 12, 12)
    const leftEye = createBodyPart(eyeGeo.clone(), eyeMat, [-h * 0.04, h * 0.14, h * 0.09])
    const rightEye = createBodyPart(eyeGeo.clone(), eyeMat, [h * 0.04, h * 0.14, h * 0.09])
    headBone.add(leftEye, rightEye)

    // Pupils (dark)
    const pupilMat = new THREE.MeshStandardMaterial({ color: '#1a1a1a' })
    const pupilGeo = new THREE.SphereGeometry(h * 0.012, 8, 8)
    leftEye.add(createBodyPart(pupilGeo.clone(), pupilMat, [0, 0, h * 0.02]))
    rightEye.add(createBodyPart(pupilGeo.clone(), pupilMat, [0, 0, h * 0.02]))

    root.add(hipsBone)

    return {
        root,
        bodyMesh: null, // Procedural = no single SkinnedMesh
        skeleton: null,
        bones,
        morphTargetMap: {},
        animations: [],
    }
}

// ---- Helpers ----

function createBone(name: string, position: [number, number, number]): THREE.Bone {
    const bone = new THREE.Bone()
    bone.name = name
    bone.position.set(...position)
    return bone
}

function createBodyPart(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    position: [number, number, number]
): THREE.Mesh {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(...position)
    mesh.castShadow = true
    mesh.receiveShadow = true
    return mesh
}

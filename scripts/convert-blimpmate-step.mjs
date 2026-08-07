import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import occtimportjs from 'occt-import-js'
import { Document, NodeIO } from '@gltf-transform/core'

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const inputStep = process.env.BLIMPMATE_STEP ?? '/Users/suwen/Documents/blimpmate/装配体 - 视频用.STEP'
const inputSmile = process.env.BLIMPMATE_SMILE ?? '/Users/suwen/Documents/blimpmate/笑脸贴图.png'
const outputDir = path.join(projectRoot, 'public/assets/blimpmate')
const outputGlb = process.env.BLIMPMATE_GLB ?? path.join(outputDir, 'balloon-robot.glb')
const outputSmile = path.join(outputDir, 'smile.png')

const sourceToGltf = (values) => {
  const transformed = new Float32Array(values.length)
  for (let index = 0; index < values.length; index += 3) {
    // The CAD file is Z-up. glTF uses Y-up, so rotate -90° around X.
    transformed[index] = values[index]
    transformed[index + 1] = values[index + 2]
    transformed[index + 2] = -values[index + 1]
  }
  return transformed
}

const calculateBounds = (positions) => {
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (let index = 0; index < positions.length; index += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], positions[index + axis])
      max[axis] = Math.max(max[axis], positions[index + axis])
    }
  }
  return { min, max }
}

const computeNormals = (positions, indices) => {
  const normals = new Float32Array(positions.length)
  for (let index = 0; index < indices.length; index += 3) {
    const a = indices[index] * 3
    const b = indices[index + 1] * 3
    const c = indices[index + 2] * 3
    const ab = [positions[b] - positions[a], positions[b + 1] - positions[a + 1], positions[b + 2] - positions[a + 2]]
    const ac = [positions[c] - positions[a], positions[c + 1] - positions[a + 1], positions[c + 2] - positions[a + 2]]
    const normal = [
      ab[1] * ac[2] - ab[2] * ac[1],
      ab[2] * ac[0] - ab[0] * ac[2],
      ab[0] * ac[1] - ab[1] * ac[0],
    ]
    for (const vertex of [a, b, c]) {
      normals[vertex] += normal[0]
      normals[vertex + 1] += normal[1]
      normals[vertex + 2] += normal[2]
    }
  }
  for (let index = 0; index < normals.length; index += 3) {
    const length = Math.hypot(normals[index], normals[index + 1], normals[index + 2]) || 1
    normals[index] /= length
    normals[index + 1] /= length
    normals[index + 2] /= length
  }
  return normals
}

const makeAccessor = (document, buffer, name, type, array) => document
  .createAccessor(name)
  .setType(type)
  .setArray(array)
  .setBuffer(buffer)

const makeTopSurfaceSampler = (mesh) => {
  const positions = mesh.attributes.position.array
  const indices = mesh.index.array
  const triangles = []
  for (let index = 0; index < indices.length; index += 3) {
    const a = indices[index] * 3
    const b = indices[index + 1] * 3
    const c = indices[index + 2] * 3
    triangles.push({
      a,
      b,
      c,
      minX: Math.min(positions[a], positions[b], positions[c]),
      maxX: Math.max(positions[a], positions[b], positions[c]),
      minY: Math.min(positions[a + 1], positions[b + 1], positions[c + 1]),
      maxY: Math.max(positions[a + 1], positions[b + 1], positions[c + 1]),
    })
  }

  return (x, y) => {
    let topZ = -Infinity
    for (const triangle of triangles) {
      if (x < triangle.minX - 0.0001 || x > triangle.maxX + 0.0001 || y < triangle.minY - 0.0001 || y > triangle.maxY + 0.0001) continue
      const p0 = triangle.a
      const p1 = triangle.b
      const p2 = triangle.c
      const v0x = positions[p1] - positions[p0]
      const v0y = positions[p1 + 1] - positions[p0 + 1]
      const v1x = positions[p2] - positions[p0]
      const v1y = positions[p2 + 1] - positions[p0 + 1]
      const v2x = x - positions[p0]
      const v2y = y - positions[p0 + 1]
      const denominator = v0x * v1y - v1x * v0y
      if (Math.abs(denominator) < 1e-9) continue
      const weight1 = (v2x * v1y - v1x * v2y) / denominator
      const weight2 = (v0x * v2y - v2x * v0y) / denominator
      const weight0 = 1 - weight1 - weight2
      if (weight0 < -0.0001 || weight1 < -0.0001 || weight2 < -0.0001) continue
      const z = positions[p0 + 2] * weight0 + positions[p1 + 2] * weight1 + positions[p2 + 2] * weight2
      topZ = Math.max(topZ, z)
    }
    return Number.isFinite(topZ) ? topZ : null
  }
}

const makeCurvedTopPatch = ({ document, buffer, name, centerX, centerY, centerZ, balloonMinZ, halfWidth, halfDepth, surfaceSampler, material, textured, surfaceOffset }) => {
  const subdivisions = 20
  const vertexCount = (subdivisions + 1) * (subdivisions + 1)
  const sourcePositions = new Float32Array(vertexCount * 3)
  const sourceNormals = new Float32Array(vertexCount * 3)
  const uvs = textured ? new Float32Array(vertexCount * 2) : null
  let sampledZ = new Array(vertexCount).fill(null)
  const fallbackRadiusX = halfWidth * 2.1
  const fallbackRadiusY = halfDepth * 2.1
  const fallbackRadiusZ = Math.max(0.01, centerZ - balloonMinZ)
  const stepX = (halfWidth * 2) / subdivisions
  const stepY = (halfDepth * 2) / subdivisions

  for (let row = 0; row <= subdivisions; row += 1) {
    const v = row / subdivisions
    const y = centerY - halfDepth + v * halfDepth * 2
    for (let column = 0; column <= subdivisions; column += 1) {
      const u = column / subdivisions
      const x = centerX - halfWidth + u * halfWidth * 2
      const vertex = row * (subdivisions + 1) + column
      sampledZ[vertex] = surfaceSampler(x, y)
    }
  }

  // Rounded STEP corners can miss a projected triangle. Repair only those
  // sparse samples from nearby valid surface points so the decal never jumps
  // abruptly to an unrelated fallback surface.
  for (let row = 0; row <= subdivisions; row += 1) {
    for (let column = 0; column <= subdivisions; column += 1) {
      const vertex = row * (subdivisions + 1) + column
      if (Number.isFinite(sampledZ[vertex])) continue
      let repairedZ = null
      for (let radius = 1; radius <= subdivisions && repairedZ === null; radius += 1) {
        let weightedZ = 0
        let totalWeight = 0
        for (let nearbyRow = Math.max(0, row - radius); nearbyRow <= Math.min(subdivisions, row + radius); nearbyRow += 1) {
          for (let nearbyColumn = Math.max(0, column - radius); nearbyColumn <= Math.min(subdivisions, column + radius); nearbyColumn += 1) {
            const distance = Math.abs(nearbyRow - row) + Math.abs(nearbyColumn - column)
            if (distance === 0 || distance > radius) continue
            const nearbyZ = sampledZ[nearbyRow * (subdivisions + 1) + nearbyColumn]
            if (!Number.isFinite(nearbyZ)) continue
            const weight = 1 / distance
            weightedZ += nearbyZ * weight
            totalWeight += weight
          }
        }
        if (totalWeight > 0) repairedZ = weightedZ / totalWeight
      }
      if (repairedZ === null) {
        const u = column / subdivisions
        const v = row / subdivisions
        const x = centerX - halfWidth + u * halfWidth * 2
        const y = centerY - halfDepth + v * halfDepth * 2
        const dx = (x - centerX) / fallbackRadiusX
        const dy = (y - centerY) / fallbackRadiusY
        repairedZ = centerZ + fallbackRadiusZ * Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy))
      }
      sampledZ[vertex] = repairedZ
    }
  }

  // A projected CAD mesh can contain a finite but discontinuous height jump
  // at its rounded outline. Replace isolated spikes with the local median so
  // no single textured triangle becomes a stretched ramp through the body.
  const discontinuityThreshold = Math.max(stepX, stepY) * 2.25
  for (let pass = 0; pass < 3; pass += 1) {
    const smoothedZ = sampledZ.slice()
    for (let row = 0; row <= subdivisions; row += 1) {
      for (let column = 0; column <= subdivisions; column += 1) {
        const vertex = row * (subdivisions + 1) + column
        const neighbors = []
        if (row > 0) neighbors.push(sampledZ[vertex - subdivisions - 1])
        if (row < subdivisions) neighbors.push(sampledZ[vertex + subdivisions + 1])
        if (column > 0) neighbors.push(sampledZ[vertex - 1])
        if (column < subdivisions) neighbors.push(sampledZ[vertex + 1])
        if (neighbors.length < 2) continue
        neighbors.sort((left, right) => left - right)
        const median = neighbors[Math.floor(neighbors.length / 2)]
        if (Math.abs(sampledZ[vertex] - median) > discontinuityThreshold) smoothedZ[vertex] = median
      }
    }
    sampledZ = smoothedZ
  }

  for (let row = 0; row <= subdivisions; row += 1) {
    const v = row / subdivisions
    const y = centerY - halfDepth + v * halfDepth * 2
    for (let column = 0; column <= subdivisions; column += 1) {
      const u = column / subdivisions
      const x = centerX - halfWidth + u * halfWidth * 2
      const vertex = row * (subdivisions + 1) + column
      const z = sampledZ[vertex] + surfaceOffset
      const left = sampledZ[row * (subdivisions + 1) + Math.max(0, column - 1)]
      const right = sampledZ[row * (subdivisions + 1) + Math.min(subdivisions, column + 1)]
      const above = sampledZ[Math.max(0, row - 1) * (subdivisions + 1) + column]
      const below = sampledZ[Math.min(subdivisions, row + 1) * (subdivisions + 1) + column]
      const tangentX = (column === 0 || column === subdivisions) ? stepX : stepX * 2
      const tangentY = (row === 0 || row === subdivisions) ? stepY : stepY * 2
      const normal = [-(right - left) / tangentX, -(below - above) / tangentY, 1]
      const normalLength = Math.hypot(...normal) || 1
      sourcePositions[vertex * 3] = x
      sourcePositions[vertex * 3 + 1] = y
      sourcePositions[vertex * 3 + 2] = z
      sourceNormals[vertex * 3] = normal[0] / normalLength
      sourceNormals[vertex * 3 + 1] = normal[1] / normalLength
      sourceNormals[vertex * 3 + 2] = normal[2] / normalLength
      if (uvs) {
        // Rotate the smile artwork 180° while mapping it onto the upper face.
        uvs[vertex * 2] = 1 - u
        uvs[vertex * 2 + 1] = 1 - v
      }
    }
  }

  const indices = new Uint32Array(subdivisions * subdivisions * 6)
  let indexOffset = 0
  for (let row = 0; row < subdivisions; row += 1) {
    for (let column = 0; column < subdivisions; column += 1) {
      const topLeft = row * (subdivisions + 1) + column
      const topRight = topLeft + 1
      const bottomLeft = topLeft + subdivisions + 1
      const bottomRight = bottomLeft + 1
      indices[indexOffset] = topLeft
      indices[indexOffset + 1] = topRight
      indices[indexOffset + 2] = bottomRight
      indices[indexOffset + 3] = topLeft
      indices[indexOffset + 4] = bottomRight
      indices[indexOffset + 5] = bottomLeft
      indexOffset += 6
    }
  }

  const primitive = document.createPrimitive()
    .setAttribute('POSITION', makeAccessor(document, buffer, `${name} positions`, 'VEC3', sourceToGltf(sourcePositions)))
    .setAttribute('NORMAL', makeAccessor(document, buffer, `${name} normals`, 'VEC3', sourceToGltf(sourceNormals)))
    .setIndices(makeAccessor(document, buffer, `${name} indices`, 'SCALAR', indices))
    .setMaterial(material)
  if (uvs) primitive.setAttribute('TEXCOORD_0', makeAccessor(document, buffer, `${name} UVs`, 'VEC2', uvs))
  return document.createMesh(name).addPrimitive(primitive)
}

const run = async () => {
  await mkdir(outputDir, { recursive: true })
  const [stepBytes, smileBytes] = await Promise.all([readFile(inputStep), readFile(inputSmile)])
  const occt = await occtimportjs()
  const result = occt.ReadStepFile(new Uint8Array(stepBytes), {
    linearUnit: 'meter',
    linearDeflectionType: 'bounding_box_ratio',
    linearDeflection: 0.0015,
    angularDeflection: 0.5,
  })

  if (!result.success || !result.meshes?.length) {
    throw new Error('STEP import failed: no tessellated meshes were returned')
  }

  const document = new Document()
  const scene = document.createScene('BlimpMate balloon robot')
  document.getRoot().setDefaultScene(scene)
  const modelRoot = document.createNode('BlimpMate front orientation (90 degrees)').setRotation([
    Math.SQRT1_2,
    0,
    0,
    Math.SQRT1_2,
  ])
  scene.addChild(modelRoot)
  const buffer = document.createBuffer('BlimpMate geometry')
  const materialCache = new Map()
  const getMaterial = (color) => {
    const rgb = color?.length === 3 ? color : [0.58, 0.63, 0.78]
    const key = rgb.map((value) => Math.round(value * 1000)).join(':')
    const cached = materialCache.get(key)
    if (cached) return cached
    const material = document.createMaterial(`STEP color ${key}`)
      .setBaseColorFactor([rgb[0], rgb[1], rgb[2], 1])
      .setMetallicFactor(0.08)
      .setRoughnessFactor(0.52)
    materialCache.set(key, material)
    return material
  }

  const sourcePositions = []
  for (const mesh of result.meshes) {
    sourcePositions.push(mesh.attributes.position.array)
  }
  const allPositions = new Float32Array(sourcePositions.reduce((total, positions) => total + positions.length, 0))
  let positionOffset = 0
  for (const positions of sourcePositions) {
    allPositions.set(positions, positionOffset)
    positionOffset += positions.length
  }
  const bounds = calculateBounds(allPositions)
  const balloonBounds = calculateBounds(result.meshes[0].attributes.position.array)
  const centerX = (balloonBounds.min[0] + balloonBounds.max[0]) / 2
  const centerY = (balloonBounds.min[1] + balloonBounds.max[1]) / 2
  const centerZ = (balloonBounds.min[2] + balloonBounds.max[2]) / 2
  const displayCoverage = 0.80
  const displaySize = Math.min(balloonBounds.max[0] - balloonBounds.min[0], balloonBounds.max[1] - balloonBounds.min[1]) * displayCoverage
  const displayHalf = displaySize / 2
  const frameScale = 1
  const surfaceSampler = makeTopSurfaceSampler(result.meshes[0])

  const balloonMaterial = document.createMaterial('BlimpMate deep grey balloon')
    .setBaseColorFactor([0.18, 0.21, 0.25, 1])
    .setMetallicFactor(0.08)
    .setRoughnessFactor(0.58)

  for (const [index, mesh] of result.meshes.entries()) {
    const positions = mesh.attributes.position.array
    const indices = mesh.index.array
    const normals = mesh.attributes.normal?.array ?? computeNormals(positions, indices)
    const primitive = document.createPrimitive()
      .setAttribute('POSITION', makeAccessor(document, buffer, `STEP ${index} positions`, 'VEC3', sourceToGltf(positions)))
      .setAttribute('NORMAL', makeAccessor(document, buffer, `STEP ${index} normals`, 'VEC3', sourceToGltf(normals)))
      .setIndices(makeAccessor(document, buffer, `STEP ${index} indices`, 'SCALAR', new Uint32Array(indices)))
      .setMaterial(index <= 2 ? balloonMaterial : getMaterial(mesh.color))
    const meshName = (mesh.name || `STEP mesh ${index}`).replaceAll('\u0000', '').trim() || `STEP mesh ${index}`
    modelRoot.addChild(document.createNode(`${meshName} #${index}`).setMesh(document.createMesh(meshName).addPrimitive(primitive)))
  }

  await copyFile(inputSmile, outputSmile)
  const smileTexture = document.createTexture('笑脸贴图.png')
    .setMimeType('image/png')
    .setImage(new Uint8Array(smileBytes))
  const smileMaterial = document.createMaterial('BlimpMate smile display')
    .setBaseColorTexture(smileTexture)
    .setMetallicFactor(0)
    .setRoughnessFactor(0.94)
    .setDoubleSided(true)
  const frameMaterial = document.createMaterial('BlimpMate display frame')
    .setBaseColorFactor([0.025, 0.035, 0.06, 1])
    .setMetallicFactor(0.12)
    .setRoughnessFactor(0.3)
    .setDoubleSided(true)

  modelRoot.addChild(document.createNode('BlimpMate upper display frame').setMesh(makeCurvedTopPatch({
    document,
    buffer,
    name: 'Upper display frame',
    centerX,
    centerY,
    centerZ,
    balloonMinZ: balloonBounds.min[2],
    halfWidth: displayHalf * frameScale,
    halfDepth: displayHalf * frameScale,
    surfaceSampler,
    material: frameMaterial,
    textured: false,
    surfaceOffset: 0.008,
  })))
  modelRoot.addChild(document.createNode('BlimpMate upper smile decal').setMesh(makeCurvedTopPatch({
    document,
    buffer,
    name: 'Upper smile decal',
    centerX,
    centerY,
    centerZ,
    balloonMinZ: balloonBounds.min[2],
    halfWidth: displayHalf,
    halfDepth: displayHalf,
    surfaceSampler,
    material: smileMaterial,
    textured: true,
    surfaceOffset: 0.012,
  })))

  const io = new NodeIO()
  const binary = await io.writeBinary(document)
  await writeFile(outputGlb, binary)
  console.log(JSON.stringify({
    outputGlb,
    outputSmile,
    meshCount: result.meshes.length,
    materialCount: materialCache.size + 2,
    triangleCount: result.meshes.reduce((total, mesh) => total + mesh.index.array.length / 3, 0),
    display: { face: 'upper', centerX, centerY, centerZ, size: displaySize, coverage: displayCoverage, surfaceFitted: true, textureRotation: 180, modelRotation: 90, material: 'diffuse' },
    bytes: binary.byteLength,
  }, null, 2))
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

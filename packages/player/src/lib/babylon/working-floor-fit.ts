interface BoundsPoint {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface MeshBounds {
  readonly min: BoundsPoint;
  readonly max: BoundsPoint;
}

export interface FloorFit {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  y: number;
}

export function mergeMeshBounds(
  meshBounds: readonly MeshBounds[],
): MeshBounds | null {
  if (meshBounds.length === 0) return null;
  return meshBounds.reduce<MeshBounds>(
    (merged, bounds) => ({
      min: {
        x: Math.min(merged.min.x, bounds.min.x),
        y: Math.min(merged.min.y, bounds.min.y),
        z: Math.min(merged.min.z, bounds.min.z),
      },
      max: {
        x: Math.max(merged.max.x, bounds.max.x),
        y: Math.max(merged.max.y, bounds.max.y),
        z: Math.max(merged.max.z, bounds.max.z),
      },
    }),
    {
      min: { x: Infinity, y: Infinity, z: Infinity },
      max: { x: -Infinity, y: -Infinity, z: -Infinity },
    },
  );
}

export function fitWorkingFloorToMeshes(
  meshBounds: readonly MeshBounds[],
): FloorFit | null {
  if (meshBounds.length === 0) return null;

  const primary = meshBounds.reduce((best, bounds) => {
    const width = bounds.max.x - bounds.min.x;
    const depth = bounds.max.z - bounds.min.z;
    const thickness = bounds.max.y - bounds.min.y;
    const score = (width * depth) / Math.max(0.05, thickness + 0.05);
    return score > best.score ? { bounds, score } : best;
  }, {
    bounds: meshBounds[0]!,
    score: -Infinity,
  });

  const extent = meshBounds.reduce<FloorFit>(
    (fit, bounds) => ({
      minX: Math.min(fit.minX, bounds.min.x),
      maxX: Math.max(fit.maxX, bounds.max.x),
      minZ: Math.min(fit.minZ, bounds.min.z),
      maxZ: Math.max(fit.maxZ, bounds.max.z),
      y: fit.y,
    }),
    {
      minX: Infinity,
      maxX: -Infinity,
      minZ: Infinity,
      maxZ: -Infinity,
      y: primary.bounds.max.y,
    },
  );
  return extent;
}

interface FloorCandidate extends FloorFit {
  area: number;
  score: number;
}

/**
 * Finds the main low, horizontal floor band and covers all broad pieces in it.
 * MMD stages frequently split one visible floor across several materials at
 * slightly different heights, so selecting only the largest piece can bury a
 * WorkingFloor accessory below its neighbours.
 */
export function inferWorkingFloorFit(
  stageBounds: MeshBounds,
  meshBounds: readonly MeshBounds[],
): FloorFit {
  const stageHeight = Math.max(1e-6, stageBounds.max.y - stageBounds.min.y);
  const upperFloorLimit = stageBounds.min.y + stageHeight * 0.35;
  const candidates: FloorCandidate[] = [];

  for (const bounds of meshBounds) {
    const width = bounds.max.x - bounds.min.x;
    const depth = bounds.max.z - bounds.min.z;
    const thickness = bounds.max.y - bounds.min.y;
    const area = width * depth;
    if (
      area <= 0 ||
      bounds.max.y > upperFloorLimit ||
      thickness > stageHeight * 0.15
    ) {
      continue;
    }
    candidates.push({
      minX: bounds.min.x,
      maxX: bounds.max.x,
      minZ: bounds.min.z,
      maxZ: bounds.max.z,
      y: bounds.max.y,
      area,
      score: area / Math.max(0.05, thickness + 0.05),
    });
  }

  if (candidates.length === 0) {
    return {
      minX: stageBounds.min.x,
      maxX: stageBounds.max.x,
      minZ: stageBounds.min.z,
      maxZ: stageBounds.max.z,
      y: stageBounds.min.y,
    };
  }

  const primary = candidates.reduce((best, candidate) =>
    candidate.score > best.score ? candidate : best,
  );
  const largestArea = Math.max(...candidates.map(({ area }) => area));
  const minimumFloorPieceArea = largestArea * 0.05;
  const floorBandTolerance = Math.max(0.25, stageHeight * 0.02);
  const floorBand = candidates.filter(
    (candidate) =>
      candidate.area >= minimumFloorPieceArea &&
      Math.abs(candidate.y - primary.y) <= floorBandTolerance,
  );

  return floorBand.reduce<FloorFit>(
    (fit, candidate) => ({
      minX: Math.min(fit.minX, candidate.minX),
      maxX: Math.max(fit.maxX, candidate.maxX),
      minZ: Math.min(fit.minZ, candidate.minZ),
      maxZ: Math.max(fit.maxZ, candidate.maxZ),
      y: Math.max(fit.y, candidate.y),
    }),
    {
      minX: Infinity,
      maxX: -Infinity,
      minZ: Infinity,
      maxZ: -Infinity,
      y: -Infinity,
    },
  );
}

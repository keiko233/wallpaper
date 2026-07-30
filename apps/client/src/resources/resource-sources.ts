import {
  ResourceCatalogSchema,
  normalizeResourceSourceUrl,
  type ResourceCatalog,
} from "@wallpaper/resource-schema";
import { createSHA256 } from "hash-wasm";
import type {
  ResourceSourceRecord,
  ResourceSourceStatus,
} from "../db/models";
import type { WallpaperClientDatabase } from "../db/database";

export const DEFAULT_SOURCE_SEEDED_KEY = "default-resource-source-seeded";

export interface SourceRefreshResult {
  source: ResourceSourceRecord;
  catalog: ResourceCatalog;
  stale: boolean;
}

export interface AddSourceResult {
  source: ResourceSourceRecord;
  isNew: boolean;
}

export interface ResourceSourceServiceOptions {
  fetcher?: typeof fetch;
  defaultSourceUrl?: string | null;
}

export async function deriveSourceId(
  rawUrl: string,
): Promise<string> {
  const { catalogUrl } = normalizeResourceSourceUrl(rawUrl);
  const hash = await createSHA256();
  hash.init();
  const encoder = new TextEncoder();
  hash.update(encoder.encode(catalogUrl));
  return hash.digest("hex");
}

export function deriveSourceDisplayName(
  catalogUrl: string,
): string {
  const url = new URL(catalogUrl);
  const basePathname = url.pathname.replace(/\/catalog\.json$/iu, "");
  if (basePathname === "" || basePathname === "/") {
    return url.host;
  }
  return `${url.host}${basePathname}`;
}

export class ResourceSourceService {
  private readonly database: WallpaperClientDatabase;
  private readonly fetcher: typeof fetch;
  private readonly defaultSourceUrl: string | null;

  constructor(
    database: WallpaperClientDatabase,
    options: ResourceSourceServiceOptions = {},
  ) {
    this.database = database;
    this.fetcher =
      options.fetcher ?? globalThis.fetch.bind(globalThis);
    this.defaultSourceUrl = options.defaultSourceUrl ?? null;
  }

  async list(): Promise<ResourceSourceRecord[]> {
    return this.database.resourceSources
      .orderBy("name")
      .sortBy("name");
  }

  async add(
    rawUrl: string,
    overrides?: Partial<
      Pick<
        ResourceSourceRecord,
        "name" | "description" | "homepage" | "enabled"
      >
    >,
  ): Promise<AddSourceResult> {
    const normalized = normalizeResourceSourceUrl(rawUrl);
    const existing = await this.database.resourceSources
      .where("catalogUrl")
      .equals(normalized.catalogUrl)
      .first();

    if (existing !== undefined) {
      return { source: existing, isNew: false };
    }

    const id = await deriveSourceId(normalized.catalogUrl);
    const now = new Date().toISOString();
    const record: ResourceSourceRecord = {
      id,
      baseUrl: normalized.baseUrl,
      catalogUrl: normalized.catalogUrl,
      name:
        overrides?.name ??
        deriveSourceDisplayName(normalized.catalogUrl),
      description: overrides?.description ?? null,
      homepage: overrides?.homepage ?? null,
      enabled: overrides?.enabled ?? true,
      isDefault: false,
      status: "idle",
      schemaVersion: null,
      revision: null,
      lastError: null,
      lastErrorAt: null,
      createdAt: now,
      updatedAt: now,
      lastAttemptedAt: null,
      lastSuccessfulAt: null,
    };

    await this.database.resourceSources.add(record);
    return { source: record, isNew: true };
  }

  async enable(id: string): Promise<void> {
    await this.database.resourceSources.update(id, {
      enabled: true,
      updatedAt: new Date().toISOString(),
    });
  }

  async disable(id: string): Promise<void> {
    await this.database.resourceSources.update(id, {
      enabled: false,
      updatedAt: new Date().toISOString(),
    });
  }

  async remove(id: string): Promise<void> {
    await this.database.transaction(
      "rw",
      this.database.resourceSources,
      this.database.sourceCatalogs,
      async () => {
        await this.database.sourceCatalogs.delete(id);
        await this.database.resourceSources.delete(id);
      },
    );
  }

  async seedDefault(): Promise<ResourceSourceRecord | null> {
    if (this.defaultSourceUrl === null) {
      return null;
    }

    const normalized = normalizeResourceSourceUrl(
      this.defaultSourceUrl,
    );
    const id = await deriveSourceId(normalized.catalogUrl);
    const now = new Date().toISOString();
    let result: ResourceSourceRecord | null = null;

    await this.database.transaction(
      "rw",
      this.database.meta,
      this.database.resourceSources,
      async () => {
        const seeded = await this.database.meta.get(
          DEFAULT_SOURCE_SEEDED_KEY,
        );
        if (seeded?.value === true) {
          return;
        }

        const existing = await this.database.resourceSources
          .where("catalogUrl")
          .equals(normalized.catalogUrl)
          .first();

        if (existing !== undefined) {
          await this.database.resourceSources.update(existing.id, {
            isDefault: true,
            updatedAt: now,
          });
        } else {
          await this.database.resourceSources.add({
            id,
            baseUrl: normalized.baseUrl,
            catalogUrl: normalized.catalogUrl,
            name: deriveSourceDisplayName(normalized.catalogUrl),
            description: null,
            homepage: null,
            enabled: true,
            isDefault: true,
            status: "idle",
            schemaVersion: null,
            revision: null,
            lastError: null,
            lastErrorAt: null,
            createdAt: now,
            updatedAt: now,
            lastAttemptedAt: null,
            lastSuccessfulAt: null,
          });
        }

        await this.database.meta.put({
          key: DEFAULT_SOURCE_SEEDED_KEY,
          value: true,
          updatedAt: now,
        });
        result =
          (await this.database.resourceSources.get(id)) ?? null;
      },
    );

    return result;
  }

  async refresh(id: string): Promise<SourceRefreshResult> {
    const source = await this.database.resourceSources.get(id);
    if (source === undefined) {
      throw new Error(`Resource source not found: ${id}`);
    }

    try {
      const response = await this.fetcher(source.catalogUrl, {
        cache: "default",
        credentials: "omit",
      });
      if (!response.ok) {
        throw new Error(
          `Resource source request failed (${response.status} ${response.statusText}).`,
        );
      }
      const catalog = ResourceCatalogSchema.parse(
        await response.json(),
      );
      return await this.applyRefreshSuccess(source, catalog);
    } catch (error) {
      return await this.applyRefreshFailure(id, error);
    }
  }

  async refreshAll(): Promise<Map<string, SourceRefreshResult | Error>> {
    const sources = await this.database.resourceSources
      .toArray()
      .then((items) => items.filter((item) => item.enabled));
    const results = await Promise.allSettled(
      sources.map((source) => this.refresh(source.id)),
    );

    const map = new Map<string, SourceRefreshResult | Error>();
    for (let index = 0; index < sources.length; index++) {
      const result = results[index];
      map.set(
        sources[index].id,
        result.status === "fulfilled"
          ? result.value
          : (result.reason as Error),
      );
    }
    return map;
  }

  private async applyRefreshSuccess(
    source: ResourceSourceRecord,
    catalog: ResourceCatalog,
  ): Promise<SourceRefreshResult> {
    const now = new Date().toISOString();
    const name =
      catalog.schemaVersion === 2
        ? catalog.repository.name
        : deriveSourceDisplayName(source.catalogUrl);
    const description =
      catalog.schemaVersion === 2
        ? catalog.repository.description
        : null;
    const homepage =
      catalog.schemaVersion === 2 ? catalog.repository.homepage : null;

    await this.database.transaction(
      "rw",
      this.database.resourceSources,
      this.database.sourceCatalogs,
      async () => {
        await this.database.resourceSources.update(source.id, {
          name,
          description,
          homepage,
          status: "ok" satisfies ResourceSourceStatus,
          schemaVersion: catalog.schemaVersion,
          revision: catalog.revision,
          lastError: null,
          lastErrorAt: null,
          updatedAt: now,
          lastAttemptedAt: now,
          lastSuccessfulAt: now,
        });
        await this.database.sourceCatalogs.put({
          sourceId: source.id,
          catalog,
          revision: catalog.revision,
          refreshedAt: now,
        });
      },
    );

    const updatedSource = await this.database.resourceSources.get(
      source.id,
    );
    if (updatedSource === undefined) {
      throw new Error(
        `Resource source disappeared during refresh: ${source.id}`,
      );
    }
    return { source: updatedSource, catalog, stale: false };
  }

  private async applyRefreshFailure(
    id: string,
    error: unknown,
  ): Promise<SourceRefreshResult> {
    const cached = await this.database.sourceCatalogs.get(id);
    const message =
      error instanceof Error ? error.message : String(error);
    const now = new Date().toISOString();

    if (cached !== undefined) {
      await this.database.resourceSources.update(id, {
        status: "stale" satisfies ResourceSourceStatus,
        lastError: message,
        lastErrorAt: now,
        updatedAt: now,
        lastAttemptedAt: now,
      });
      const source = await this.database.resourceSources.get(id);
      if (source === undefined) {
        throw new Error(
          `Resource source disappeared during refresh: ${id}`,
        );
      }
      return { source, catalog: cached.catalog, stale: true };
    }

    await this.database.resourceSources.update(id, {
      status: "error" satisfies ResourceSourceStatus,
      lastError: message,
      lastErrorAt: now,
      updatedAt: now,
      lastAttemptedAt: now,
    });
    throw error instanceof Error ? error : new Error(message);
  }
}

# ORCA Architecture Doc 3 (Revised) — Data Processing, Source Fitness and Scientific Products

**Version:** 3.0. Preserves [original 10-step pipeline](https://teampflresearch.vercel.app/doc3.html), adds federated data rights, original-availability history, scientific reproducibility and remote evidence ingestion. **Design, not completed integration.**

## 1. Legacy data architecture to retain

Source discovery is separate from ingestion and computation. Existing source strategy: INCOIS/ERDDAP (where exposed), NOAA/ERDDAP, Copernicus Marine, MOSDAC (authorization dependent), IMD advisories/forecast products, GEBCO, static geospatial boundaries, optional Open-Meteo for context subject to coverage/provenance. Retain source-first fallback, availability checks, rate limits, conditional requests, caching, idempotent ingest and immutable raw object storage.

### 1.1 All ten original processing stages

| Original stage | Original responsibility | V3 extension and validation |
|---|---|---|
| 1. Raw ingestion | Preserve provider bytes and metadata | Record license, original publication timestamp, declared provider, content checksum, rights, request ID, auth provenance, byte-level object immutability |
| 2. Structural validation | Valid file/schema/variable | Verify NetCDF/CF, coordinate axes, missing dimensions, data variable kinds, unsupported codec and suspicious files |
| 3. Scientific QC | Quality flags, ranges and applicability | QARTOD/product-specific flags, nodata masking, latitude valid, suspicious SST/CHL values, propagate QC to derived results |
| 4. Normalization | Canonical units and variable names | Explicit observation/forecast/reanalysis classification, sampling depth, variable equivalence and appropriate unit conversion (Pint) |
| 5. Spatial alignment | Common grid/geometry | Source footprint, resolution, coastline mask, reprojection, regrid/interpolation strategy and physical applicability |
| 6. Temporal alignment | Observation vs forecast validity | Store `observed_at`, `issue_at`, `valid_from/to`, `source_published_at`, `retrieved_at`, `as_of_availability` separately |
| 7. Missing-data policy | Handle gaps without fabricating | Coverage fraction; explicit interpolation rule, no arbitrary fill for warning decisions; gap map and uncertainty |
| 8. Cross-source reconciliation | Compare sources | Investigate incompatible variable definitions, depth, time averaging, method, QC, resolution and conflict; preserve dissent |
| 9. Derived features | SST anomalies, chlorophyll, fronts etc. | Versioned method registry, model/method artifact, uncertainty propagation and deterministic repeat |
| 10. Marine State | Structured, time/space aware merged state | Version parent/delta chain, provisional/validated/reproduced status and evidence manifest links |

The canonical scientific variable vocabulary belongs to `public.canonical_variables`; version mapping in `public.variable_mappings`. Do not invent a second variable registry in `research`.

## 2. Scientific Dataset Contract

Each dataset/product/snapshot must preserve:

```json
{
  "schema_version":"orca.dataset_snapshot/1.0",
  "source_id":"copernicus_marine",
  "dataset_id":"provider-product-id",
  "product_version":"provider-revision",
  "source_documentation_uri":"https://...",
  "data_kind":"observation|forecast|reanalysis|model|advisory|static",
  "variables":[{"canonical":"sea_surface_temperature","provider_name":"...","unit":"K","sampling_depth_m":0,"measurement_type":"skin_or_bulk_explicit"}],
  "footprint_ref":"geometry-id",
  "time":{"observation_start":"...","observation_end":"...","forecast_issue_time":null,"forecast_valid_start":null,"forecast_valid_end":null,"published_at":"...","retrieved_at":"..."},
  "quality":{"flag_definition_ref":"...","coverage_fraction":0.92,"quality_report_id":"..."},
  "storage":{"object_uri":"s3://...","content_digest":"sha256:..."},
  "rights":{"license":"...","download_allowed":true,"redistribution_allowed":false,"redistribution_scope":"institution_only"},
  "provenance":{"connector_version":"...","ingestion_id":"uuid","original_request_digest":"sha256:..."}
}
```

**Example schema only**; fields require dataset-specific semantics. Never assume all products expose `published_at` or full archived revisions. If original availability is unknown, mark unknown and prohibit claiming a strict historical as-of replay.

## 3. Data sources, ownership and safe federation

Three provider modes:
- **Open/authorized public:** ORCA connectors can retrieve source subsets and cache subject to published terms.
- **Organization-restricted:** the institution runs a data-proxy/MCP tool inside its network, returns approved derived artifacts, not raw confidential files.
- **Cross-org reproducibility:** reviewer receives signed/authorized reproducible subset or executes method where data resides and returns a verifiable result with a documented limitations statement.

Public Arkiv entities receive short coarse capability/region labels and content digests, never licensed raw data, sensitive study polygons, private user queries or secret endpoints. ENS records expose only purposefully public agent discovery contacts.

### 3.1 Connector interface

```python
class MarineConnector(Protocol):
    async def discover(self, requirement: DataRequirement) -> list[ProductCandidate]: ...
    async def check_access(self, candidate: ProductCandidate, principal: Principal) -> AccessDecision: ...
    async def get_metadata(self, candidate: ProductCandidate) -> DatasetMetadata: ...
    async def retrieve_subset(self, requirement: DataRequirement, candidate: ProductCandidate) -> IngestionManifest: ...
    async def fetch_quality_docs(self, candidate: ProductCandidate) -> list[DocumentationRef]: ...
```

Provider-specific adapters map to this interface and report exact availability, cost/quota, licensing and errors. The LLM can propose structured requirements but may not issue raw URL fetches to arbitrary hosts.

### 3.2 Source fitness selection

Hard checks: license/authorization; variable equivalence; data-kind match; requested spatial and time overlap; valid forecast lead time; sampling depth; advisory authority. Soft ranking after eligibility: spatial/temporal resolution, historical QC, latency, available uncertainty and cost. *No source is acceptable just because an LLM describes it as authoritative.*

## 4. Science-specific operations and provenance

- **SST:** point and regional stats, seasonal anomalies, gradients; separate skin vs bulk temperature; baseline anchored to source, region, day-of-year/matched season and climatology period.
- **Chlorophyll:** product quality/cloud flags, log transform only when method explicitly requires, mask, seasonal anomaly, distribution summaries. Chlorophyll isn't by itself a guarantee of fish abundance.
- **Weather:** source wind/wave/swell validity, forecast lead/issue, compare physical variable definitions, official IMD and INCOIS warnings.
- **Currents:** ocean vector components, resolution, local geodesic transformations and optional route exposure under validated policies.
- **Tides:** tidal constituents/observed gauge vs model output; validity/uncertainty and datum alignment.
- **Marine geography:** PostGIS geometry checks, GEBCO bathymetry and protected/restricted zones with edition date; bathymetry not a certified navigation chart.
- **Historical replay:** reconstruct observations/forecasts available **as of** a time and compare outcomes to later archived measurements/advisories; no leakage from future reanalysis.

Every derived operation emits: method ID/version, input asset IDs/hashes, relevant QC/coverage, output structure/units, calculation tolerance, environment image digest, artifacts and experiment trace.

## 5.  Reproducibility and independent scientific comparison

For a scientific method `sst.seasonal_anomaly`:

1. Freeze a source subset, QC mask and defined anomaly baseline period.
2. Produce a machine-readable `InvestigationRecipe` and results with numerical precision rules.
3. Prepare reproducibility package (e.g. RO-Crate-compatible manifest, source ref/rights, executable method, env lock/container digest).
4. Independent worker receives permissioned input refs, reruns with a separately controlled environment and records method/input hashes.
5. Compare calculated values to method-specific tolerance and check **scientific fitness** (units, depth, grid, temporal baseline). Identical arithmetic on scientifically mismatched products must NOT be classified as validated science.
6. If mismatch, produce a `challenge` with structured reason: `SOURCE_VERSION`, `QC`, `VARIABLE_KIND`, `SPATIAL_ALIGNMENT`, `FORECAST_ISSUE`, `BASELINE`, `METHOD_VERSION`, `NUMERICAL`, or `INCONCLUSIVE`.
7. Correction = a new artifact version and relation `supersedes`, preserving old artifacts and their review statuses.

## 6. Cache and retention boundaries

Redis keyed by product/version/region/time/method/rights scope and source QC; avoid cross-tenant cache exposure. Invalidations on new advisories, source version change, stale forecast, revoked authorization, new method/QC version. Reanalysis versions need stable snapshots. Data that licensing forbids redistribution cannot be bundled into exported research package; include instructions for authorized re-fetch instead. Retain original forecast issue data only when available and licensed.

## 7. Data failures and recovery

| Failure | Response |
|---|---|
| Source inaccessible or restricted | Explain restriction; alternate legally permitted product if appropriate; otherwise no claim |
| Source rate-limited | Retry after backoff; cached source allowed only within freshness and safety policy |
| QC too sparse | `insufficient_evidence`; show map coverage |
| Forecast issue and valid times confused | Block analysis and request aligned product |
| External provider artifact lacks source version | Mark unverified; request manifest or abstain |
| Hash matches but calculations don't | Mark integrity valid, scientific mismatch; open review |
| Historic snapshot missing | Report `not_replayable_as_of_time`, do not substitute a newer reanalysis |
| Licensed dataset cannot leave institution | Remote evaluation where data resides or denied with explicit reason |

## 8. Storage, tasks and test matrix

- PostgreSQL: source metadata, canonical variables, ingestions, quality, refs, methods, dataset snapshots and audit.
- S3/MinIO: content-addressed raw NetCDF/HDF/CSV, derived Zarr/Parquet/COG, validation reports and reproducibility bundles.
- Parquet/DuckDB/Dask: scan large historical series and method benchmark datasets.
- Redis: access-scope-aware cache, rate budgets, jobs and safe transient session state.
- Arkiv: permitted task descriptions, claims, public hashes/results/reviews only.

Tests: synthetic arrays with known SST anomalies; incompatible Kelvin/Celsius; 10 m vs surface; shifted times; forecast issue after historical cutoff; intentionally wrong seasonal baseline; missing satellite pixels; wrong restricted-area boundary; poison metadata; archive disappearance; source data license denial; variable alias conflict; independently rerun from manifest.

**Original references:** [Doc 3](https://teampflresearch.vercel.app/doc3.html) and [Data Acquisition Matrix](https://teampflresearch.vercel.app/data-sources.html). External standards: [CF](https://cfconventions.org/), [QARTOD](https://ioos.noaa.gov/project/qartod/), [STAC](https://stacspec.org/), [W3C PROV](https://www.w3.org/TR/prov-o/).

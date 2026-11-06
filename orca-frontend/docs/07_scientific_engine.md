# ORCA Architecture Doc 7 (Revised) — Scientific & Marine Intelligence Engine

**Version 3.0.** Extends the [original System 7](https://teampflresearch.vercel.app/scientific.html). Retains its seven scientific-engine families and extends them with scientific method contracts, reproducibility, independent validation and historical as-of evaluation. **Proposed specification, not a validated scientific model.**

## 1. Preserve all original scientific engines

| Engine | Operations kept from original design | V3 scientific review additions |
|---|---|---|
| **Ocean** | SST lookup/stats/gradient/anomaly, chlorophyll, fronts, eddies/upwelling, current fields, vertical profiles, PFZ indicators | Explicit product types, seasonal baseline, source QC, matched grid and method version |
| **Weather** | Wind, wave/swell, rain, cyclone, lightning, forecast comparison and marine hazards | Forecast issue vs valid time, official alert provenance, variable definitions, historical verification |
| **Spatial** | Point-in-polygon, distance, intersections, raster sampling, EEZ/MPA/restricted/ESZ/geofences | Geometry-version provenance, CRS/datum validation, spatial coverage masks |
| **Temporal** | Historical comparison, anomaly, trends, lead times and temporal joins | Reanalysis vs original-operational-forecast distinction, as-of availability, causal ordering |
| **Ecosystem** | Environmental indicators and productivity-related relationships | Distinguish proxy from outcome, detect unsupported causal assertions, spatial ecology uncertainty |
| **Risk** | Multi-factor hazard/risk exposure, uncertainty, constraints | Official-warning priority, explicit vessel/context applicability, abstention and warning miss metrics |
| **Route/Operations** | Route alternatives, currents, wave exposure, cost and geofencing | Chart/obstruction limitations, route exposure comparison not certified route authorization |

These engines perform deterministic numerical computation (or explicitly versioned statistical/physical models). The LLM never directly invents an ocean value or a numeric confidence. Every engine emits structured scientific artifacts with source ID/version, evidence, geometry, time, method and units.

## 2. New scientific platform services

1. **Scientific Investigation Compiler:** Language model proposes a constrained `InvestigationRecipe`; deterministic schema/method validator checks variable, baseline, depth, units, spatial/temporal scope and data rights. Researchers approve material assumptions.
2. **Method Registry:** Versioned implementations (`sst.anomaly`, `chl.trend`, `weather.forecast_matchup`, `geo.boundary_intersection`, `risk.route_exposure`), I/O schemas, tolerances, QC policy, code digest, environment digest.
3. **Dataset Fitness Service:** Before computing, validate source metadata, product coverage, measurement kind, depth/datum, forecast lead time, quality flags and license.
4. **Scientific Comparison/Conflict Analyzer:** Detect baseline, method, source, unit, spatial, temporal, QC or actual observational disagreements; report reason, not arbitrary consensus.
5. **Independent Reproduction Service:** Recompute from same approved inputs with separately controlled method runner; report `reproduced`, `challenged`, `inconclusive`, `failed`.
6. **Historical Replay Laboratory:** Freeze data/forecasts available **at historical decision time**, compare to later independent observations/advisories; no future leakage.
7. **Claim-Level Scientific Gate:** Every quantitative claim references deterministic result and cited evidence; refuse unsupported extrapolations.
8. **Research Package Exporter:** Portable method, environment, result and provenance package, rights-aware refs, independent review signatures and correction graph.

## 3. Scientific result contract

```json
{
  "schema_version":"orca.science_result/1.0",
  "task_id":"uuid","engine":"ocean","method":{"id":"sst.seasonal_anomaly","version":"1.0","implementation_digest":"sha256:..."},
  "inputs":[{"evidence_id":"ev1","dataset_id":"...","product_version":"...","content_digest":"sha256:..."}],
  "region":{"geometry_ref":"...","crs":"EPSG:4326","spatial_coverage_fraction":0.87},
  "time":{"observation_start":"...","observation_end":"...","forecast_issue_at":null,"forecast_valid_at":null,"as_of_available_at":"..."},
  "output":{"sst_anomaly":1.3},"units":{"sst_anomaly":"degC"},
  "quality":{"status":"qc_passed","uncertainty_source":"documented_method","limitations":[]},
  "verification":{"scientific_reproduction":"pending","hash_integrity":"checked"},
  "artifact_manifest_digest":"sha256:...",
  "status":"complete"
}
```

`+1.3°C` is a **synthetic illustration**, not live measurements. The output schema requires explicit computation origin, not model text. Real implementations should report quality and uncertainty appropriate to the source and scientific method; arbitrary single `confidence_score` is inappropriate without calibration.

## 4. Reference mathematical and methodological specifications

### 4.1 Seasonal SST anomaly

For region `R`, observation time `t`, and an approved baseline `B(t)` with matching calendar/season, quality mask, depth and product definition:

`SST_anomaly(R,t) = valid_weighted_mean(SST(R,t)) - valid_weighted_mean(B(R,t))`

Record: baseline period, data product and version, aggregation convention, weights, pixel coverage, land/cloud masks, treatment of missing values and uncertainty. A monthly mean baseline must not be compared to an arbitrary instantaneous measurement without explicit method.

### 4.2 Chlorophyll change

A change/anomaly is computed from scientifically valid satellite product and QC mask. Optical chlorophyll retrieval is affected by cloud, coastal turbidity and algorithm limitations; require a quality profile. Do not infer fish abundance, disease or a biological cause from a chlorophyll number alone.

### 4.3 Spatial analysis

Use PostGIS/shapely/rasterio/xarray. Ensure CRS, point order, coastline and region version. Crossing protected boundaries requires applicable current rules; derived geometry is not a legal maritime determination by itself.

### 4.4 Model vs observation verification

Use matched observation/model pairs with properly aligned valid time, depth/height and position. Metrics appropriate to task: mean bias, MAE, RMSE; event warning recall and false-safe rate; uncertainty calibration and spatial coverage. Validate forecast issue time, not just valid time.

### 4.5 Route/risk

Evaluate hazard *exposure* subject to sea state, forecast uncertainty, vessel context, official restrictions and chart-quality limitations. Never assert safe navigation solely from model grids. Show rule assumptions and abstain where coverage/official authority insufficient.

## 5. A demonstrated scientific challenge, not LLM voting

### Synthetic wrong-baseline example

- An external Ocean Agent receives observed SST `28.4°C`, agreed season-matched baseline `27.1°C`, and method `sst.seasonal_anomaly v1`.
- Its erroneous artifact uses an alternative `27.8°C` baseline and reports `+0.6°C`.
- The independent validator **does not just ask a second LLM**. It reads input manifest and approved recipe, detects incompatible baseline, recomputes `28.4 - 27.1 = +1.3°C`, signs challenge referencing both method and input versions.
- ORCA preserves original artifact +0.6, challenge, and corrected artifact +1.3; it records reason and avoids claiming this anomaly is a marine heatwave without the relevant scientific definition and supporting data.
- Arkiv, if used, records hashes/refs owned by Ocean Agent and Validator respectively; a valid chain hash proves artifact integrity, not correct baseline.

### Classes of disagreement

`INPUT_DIFFERENCE`, `PRODUCT_DEFINITION`, `UNIT`, `VERTICAL_REFERENCE`, `QC_MASK`, `SPATIAL_SAMPLING`, `TEMPORAL_WINDOW`, `HISTORICAL_BASELINE`, `METHOD_VERSION`, `NUMERICAL_PRECISION`, `UNCERTAINTY`, `HYPOTHESIS_UNDERDETERMINED`, `REVIEWER_ERROR`.

Never force agreement when true data conflict persists or scientific evidence is incomplete. Supported output is qualified or `inconclusive`.

## 6. Historical replay and model evaluation

As-of evaluation must store original decision timestamp and source availability. If archived operational forecast data from that date does not exist, `not_replayable` is honest. Later reanalysis cannot be misrepresented as contemporaneously available. Freeze train/validation/test partitions by time/location before fine-tuning. Benchmark ORCA against existing Python research methods and generic tool-enabled LLM on identical permitted data; report fail/abstain cases as well as successes.

Metrics:
- Numeric: MAE, RMSE, bias and method-specific tolerances.
- Forecast events: missed warning, false-safe, precision/recall, invalid region/time.
- Reproducibility: independent runs successful / eligible runs; mismatch type breakdown.
- Claim gate: unsupported precise figures, missing source citations, unwarranted causal inference, correct abstention.
- UX/economics: researcher active time including corrections, compute and paid provider cost per accepted investigation.

## 7. Scientific Engine API and tools

```text
POST /v1/science/recipes/validate
POST /v1/science/run
GET  /v1/science/methods
GET  /v1/science/datasets/{id}/quality
POST /v1/science/artifacts/{id}/reproduce
POST /v1/science/artifacts/{id}/review
POST /v1/science/historical-evaluations
GET  /v1/science/investigations/{id}/report
```

These are **proposed ORCA routes**; ensure job queues/idempotency and method-specific authorization. MCP can expose approved operations under `ocean.*`, `weather.*`, `geo.*`, `science.*` only to authorized agents, never whole Python/SQL execution without sandbox and policy.

## 8. Institutional independence and research data rights

- Institutions may contribute an approved scientific **method** or **tool** without exposing an LLM or their confidential data.
- Independent reviewer receives permitted public/restricted dataset snapshot access or executes at source's trusted location; label impossible-to-reproduce cases if input licensing blocks access.
- All artifacts are signed by a key bound to an approved agent and checked against an organization authorization policy.
- Scientific peer review status is separate from wallet identity, network reputation and independent mathematical reproduction.
- Researcher retains ability to edit/approve method and reject unsound automatic hypotheses.

## 9. Testing, versioning and failure cases

Maintain golden synthetic datasets and actual approved source samples, negative test fixtures with wrong baseline/units/CRS/validity/depth, missing quality flags, malicious metadata, source withdrawal, clipped satellite coverage, contradictory marine advisories, expired historical source, mismatched key signatures and forged review. Version everything used to reproduce: source product, subset content digest, method, environment, instrument/QC definition and numeric tolerances. If a method changes, generate a **new** artifact; don't claim old artifacts were produced with new code.

## 10. Scientific method onboarding and acceptance

A new method must have a domain reviewer, input/output schema, unit/CRS/time tests, reference case, documented limitations, uncertainty/quality policy, versioned implementation digest, bounds, sample outputs and either independent reproduction or reason no reproduction is possible. More LLM agents do not replace this procedure.

## 11. Relation to seven design docs

- Doc 1 presents scientific results and limitations without false assurance.
- Doc 2 selects tools and external agents; no calculation in LLM.
- Doc 3 provides exact inputs and QC masks.
- Doc 4 stores datasets, methods, scientific artifacts, reviews and chain refs.
- Doc 5 tests all scientific stages against held-out cases.
- Doc 6 remembers past investigation references but not stale facts.
- Doc 7 defines and executes actual computation.

**Sources:** [Original scientific System 7](https://teampflresearch.vercel.app/scientific.html), [old pipeline](https://teampflresearch.vercel.app/doc3.html), [CF Conventions](https://cfconventions.org/), [QARTOD](https://ioos.noaa.gov/project/qartod/), [WMO](https://wmo.int/), [Copernicus Marine](https://data.marine.copernicus.eu/).

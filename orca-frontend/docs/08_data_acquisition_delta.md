# ORCA Companion Update — Data Acquisition Matrix and Federated Source Access

**Old source:** https://teampflresearch.vercel.app/data-sources.html. **This file is a V3 change specification, not a replacement for every old data-source URL or provider-specific retrieval note.** Revalidate provider access before development.

## 1. Preserve provider inventory

Keep original INCOIS (Argo/BGC Argo, OSF, PFZ, buoys, HF radar, tide gauges, appropriate model products), MOSDAC satellite products (OCM/SCAT/SST sensors, account/license controls), IMD cyclone and marine warnings, Copernicus Marine, NOAA/ERDDAP, NASA Earth observations where relevant, GEBCO, coastal GIS/static boundaries, OSM place data. Every provider connector must advertise `current_access_status = public | requires_account | restricted | pending | unavailable` and clearly distinguish source pages from actual machine-accessible data endpoints. Never infer that a catalogue product is freely downloadable.

## 2. New source catalog fields

`source_organization`, `dataset_access_policy`, `redistribution_permitted`, `product_version`, `original_publication_time`, `retrieval_timestamp`, `forecast_issue_time`, `valid_time`, `observation_time`, `vertical_reference`, `product_quality_doc`, `source_revision`, `checksum`, `QC_flag_definitions`, `method_compatibility`. Preserve original `source_id` and canonical variable crosswalk.

## 3. Three ingestion strategies

| Strategy | Process | Best for |
|---|---|---|
| ORCA-hosted connector | Catalog → authorized subset retrieval → old 10-stage ingest → object store | Public products and approved direct access |
| Institution-private tool | A2A provider invokes own MCP or science tool; returns permitted signed derived artifact | Licensed/embargoed research, protected private datasets |
| Independent reproducibility | Authorized reviewer re-fetches published source subset or runs a method at data owner's location | Review without copying restricted datasets to ORCA |

Data licenses govern whether a reproducibility package contains raw bytes, a derived public statistic, a signed reference or just authorized re-fetch instructions. Never publish private source URLs with access tokens in ENS or Arkiv.

## 4. Connector test cases

Rate limits, authentication expired, intermittently missing data, mismatch in variable units, source product renamed, catalog moved, unsupported subsetting, wrong coordinate orientation, source-published date missing, cloud-mask error, insufficient footprint, wrong forecast issue time, redistribution disallowed, source archive unavailable for replay. Record specific connector and scientific validation errors for the researcher instead of returning a generic LLM answer.

## 5. Explicit preservation

Original source pages contain much greater provider-specific depth and should be kept in the engineering reading list. A data connector is 'implemented' only after a real authorized request, parsed metadata, QC, error branch and repeatable source-backed test all work. Do not claim India-wide coverage based on one coastal source example.

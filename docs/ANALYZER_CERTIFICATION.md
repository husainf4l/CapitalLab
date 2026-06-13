# Analyzer Integration Certification Report

| Field        | Value                             |
|--------------|----------------------------------|
| **Date**     | 2026-06-13                       |
| **Version**  | 1.0                              |
| **Status**   | CERTIFIED WITH NOTES             |
| **Scope**    | `AnalyzerImportService.cs` — format parsing, import pipeline, error handling, tracking entity |
| **Reviewer** | Automated Architecture Audit     |

---

## 1. Format Support Matrix

| Format | Standard | Parser Entry Point | Header/Record Token | Min Fields | Unit Support | Confirmed |
|---|---|---|---|---|---|---|
| **CSV** | RFC 4180 (relaxed) | `ParseCsv()` | First row skipped (header) | 3 columns: `LabTestId, SampleId, ResultValue` | Optional 4th column | Yes |
| **XML** | W3C XML 1.0 | `ParseXml()` | `<Result>` element | Attributes: `labTestId`, `sampleId`, `value` | `unit` attribute (optional) | Yes |
| **HL7 v2** | HL7 v2.x | `ParseHl7()` | `OBX` segment | 6 pipe-delimited fields; [0]=type, [3]=test\_code, [5]=value, [6]=unit | Field [6] | Yes |
| **ASTM E1381** | ASTM E1381 | `ParseAstm()` | `R` record | 4 pipe-delimited fields; [3]=value, [4]=unit | Field [4] (optional) | Yes |

### CSV Column Mapping

```
Column 0  →  LabTestId    (GUID, required)
Column 1  →  SampleId     (GUID, required)
Column 2  →  ResultValue  (string, required)
Column 3  →  Unit         (string, optional)
```

### XML Element Structure

```xml
<Results>
  <Result labTestId="<guid>"
          sampleId="<guid>"
          value="<string>"
          unit="<string (optional)>" />
</Results>
```

### HL7 v2 OBX Segment Mapping

```
OBX|<type>|...|<test_code>|...|<value>|<unit>|...
      [0]       [3]              [5]    [6]
```

### ASTM E1381 R-Record Mapping

```
R|<seq>|<id>|<value>|<unit (optional)>|...
              [3]     [4]
```

---

## 2. Import Pipeline Flow

```
  [API Request: POST /analyzer-imports]
           │
           ▼
  ┌─────────────────────────┐
  │  AnalyzerImportService  │
  │  CreateImportAsync()    │
  └────────────┬────────────┘
               │  1. Create AnalyzerImport entity
               │     Status = Pending
               │     RawContent stored verbatim
               │     Timestamp set via AuditableEntity
               ▼
  ┌─────────────────────────┐
  │  ProcessImportAsync()   │
  └────────────┬────────────┘
               │  2. Set Status = Processing
               │
               ├─── Format detected ──► CSV   → ParseCsv()
               │                    ──► XML   → ParseXml()
               │                    ──► HL7   → ParseHl7()
               │                    ──► ASTM  → ParseAstm()
               │
               ▼
  ┌─────────────────────────┐
  │  Per-Record Validation  │
  │  & AnalyzerResult build │
  └────────────┬────────────┘
               │  3. Map each record to AnalyzerResult entity
               │     - LabTestId (GUID, must be pre-known)
               │     - SampleId  (GUID, must be pre-known)
               │     - ResultValue, Unit
               │
               ▼
  ┌─────────────────────────────────────────┐
  │  Bulk Persist to analyzer_results table │
  └────────────────┬────────────────────────┘
                   │
          ┌────────┴────────┐
          │                 │
    [All succeed]     [Any error]
          │                 │
          ▼                 ▼
   Status = Completed   Status = Failed
   ResultCount = N      ErrorMessages appended
                        (string concatenation)
```

---

## 3. Error Handling Behavior Per Format

| Format | Parse Error Behavior | Record-Level Error | Status Outcome |
|---|---|---|---|
| **CSV** | Exception on malformed row; row skipped | Rows with < 3 columns skipped; error appended to log | Completed (partial) or Failed if 0 records parsed |
| **XML** | `XmlException` thrown; entire import fails | Individual `<Result>` with missing required attributes skipped | Failed if XML is structurally invalid; Completed (partial) otherwise |
| **HL7 v2** | Non-OBX lines silently ignored | OBX segments with < 6 fields skipped; error logged | Completed (partial) — no hard failure on bad OBX |
| **ASTM E1381** | Non-R lines silently ignored | R-records with < 4 fields skipped; error logged | Completed (partial) — no hard failure on bad R-record |

**Error storage:** All per-record error messages are concatenated into a single `ErrorMessages` string field on the `AnalyzerImport` entity. There is no structured per-record error log.

**Partial success semantics:** For HL7 and ASTM formats, an import can complete with `Status = Completed` even if a subset of records were skipped. The `ResultCount` field reflects only successfully persisted records.

---

## 4. Import Tracking (AnalyzerImport Entity)

| Field | Type | Purpose |
|---|---|---|
| `Status` | Enum | Pending → Processing → Completed / Failed |
| `RawContent` | string | Verbatim input stored for audit/replay |
| `ResultCount` | int | Count of successfully imported result records |
| `ErrorMessages` | string | Concatenated parse/validation errors |
| `AnalyzerId` | FK | Reference to source Analyzer device |
| `CreatedAt` / `ModifiedAt` | datetime | Inherited from `AuditableEntity` |
| `CreatedBy` / `ModifiedBy` | string | Inherited from `AuditableEntity` |

---

## 5. Gaps and Remediation

| # | Gap Description | Severity | Affected Formats | Remediation Path |
|---|---|---|---|---|
| 1 | **No duplicate detection** — the same result file can be imported twice without rejection; relies solely on any downstream DB constraints | Medium | All formats | Add a content hash (SHA-256 of `RawContent`) column to `AnalyzerImport`; enforce unique constraint per `AnalyzerId + ContentHash` before processing |
| 2 | **HL7 parsing is v2 basic only** — MSH (message header) and PID (patient identity) segments are not parsed; patient and order matching must be performed by the caller using pre-resolved GUIDs | Low | HL7 v2 | Implement MSH/PID segment parsing in v1.1; add patient-lookup by MRN or order-lookup by accession number |
| 3 | **ASTM parsing covers R-records only** — P (patient), O (order), and L (terminator) records are not parsed; full ASTM message context is discarded | Low | ASTM E1381 | Implement P/O/L record parsing in v1.1 to enable patient and order correlation from the message itself |
| 4 | **No test code resolution** — `LabTestId` must be a valid GUID known to the caller at import time; no mapping from analyzer test codes (e.g., LOINC codes or local mnemonic) to internal `LabTestId` | Low | All formats | Add a `LabTestCode` mapping table in v1.1; resolve codes to GUIDs during import processing |
| 5 | **Error messages stored as string concatenation** — `ErrorMessages` is a single text field; individual record errors cannot be queried, filtered, or surfaced per-record via API | Low | All formats | Replace with a structured `AnalyzerImportError` child entity (ImportId, RecordIndex, ErrorCode, ErrorMessage) to enable per-record error reporting |

---

## 6. Certification Verdict

**CERTIFIED WITH NOTES**

The `AnalyzerImportService` correctly implements parsers for all four industry-standard result exchange formats: CSV, XML, HL7 v2 (OBX), and ASTM E1381 (R-records). The import pipeline reliably tracks status transitions, stores raw content for auditability, and records result counts and error messages per import. The `AnalyzerImport` entity provides a complete audit trail via `AuditableEntity` inheritance.

Five gaps are documented above. Gap 1 (duplicate detection) is rated Medium severity and should be prioritized for v1.1. Gaps 2–5 are rated Low severity and reflect standard v1 scope limitations acceptable for initial production deployment.

| Area | Result |
|---|---|
| CSV format support | PASS |
| XML format support | PASS |
| HL7 v2 format support | PASS (basic) |
| ASTM E1381 format support | PASS (R-records) |
| Import status tracking | PASS |
| Audit trail (AuditableEntity) | PASS |
| Error handling | PASS (partial — string concat) |
| Duplicate detection | GAP — Medium |
| HL7 MSH/PID parsing | GAP — Low |
| ASTM P/O/L record parsing | GAP — Low |
| Test code resolution mapping | GAP — Low |
| Structured per-record errors | GAP — Low |
| **Overall** | **CERTIFIED WITH NOTES** |

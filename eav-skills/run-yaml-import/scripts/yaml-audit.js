#!/usr/bin/env node
/**
 * Semantic audit: source import YAML vs eav-cli cfg export yaml output.
 *
 * Usage:
 *   node rules/skills/run-yaml-import/scripts/yaml-audit.js \
 *     --source <模块>/api/foo-api-config.yaml \
 *     --export <模块>/api/foo-api-config.audit-export.yaml \
 *     [--warn "message"]... \
 *     [-o <模块>/api/output/yaml-audit-report.md]
 *
 * Export YAML is normalized in-place: keys with null values are removed before compare/write.
 *
 * Exit: 0 = PASS (zero difference items vs source), 1 = FAIL, 2 = usage/dependency error
 */

const fs = require('fs');
const path = require('path');

function loadYamlModule() {
    const candidates = [
        path.join(__dirname, 'node_modules', 'js-yaml'),
        path.join(
            process.env.HOME || '',
            '.claude/skills/eav-skill/scripts/node_modules/js-yaml'
        ),
    ];
    for (const dir of candidates) {
        try {
            return require(dir);
        } catch {
            // try next
        }
    }
    console.error(
        'yaml-audit: js-yaml not found. Run: npm install --prefix rules/skills/run-yaml-import/scripts'
    );
    process.exit(2);
}

const yaml = loadYamlModule();

function parseArgs(argv) {
    const out = { source: null, export: null, output: null, warn: [] };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--source' && argv[i + 1]) {
            out.source = argv[++i];
        } else if (a === '--export' && argv[i + 1]) {
            out.export = argv[++i];
        } else if ((a === '-o' || a === '--output') && argv[i + 1]) {
            out.output = argv[++i];
        } else if (a === '--warn' && argv[i + 1]) {
            out.warn.push(argv[++i]);
        } else if (a === '--help' || a === '-h') {
            console.log(`Usage: node yaml-audit.js --source <file> --export <file> [-o report.md] [--warn msg]...`);
            process.exit(0);
        }
    }
    if (!out.source || !out.export) {
        console.error('yaml-audit: --source and --export are required');
        process.exit(2);
    }
    return out;
}

function load(filePath) {
    return yaml.load(fs.readFileSync(filePath, 'utf8'));
}

/** Recursively drop object keys whose value is null (export noise from eav-cli). */
function stripNulls(value) {
    if (value === null || value === undefined) {
        return undefined;
    }
    if (Array.isArray(value)) {
        return value.map(stripNulls).filter((v) => v !== undefined);
    }
    if (typeof value === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            const cleaned = stripNulls(v);
            if (cleaned !== undefined) {
                out[k] = cleaned;
            }
        }
        return out;
    }
    return value;
}

function writeFilteredExport(filePath, doc) {
    const text = yaml.dump(doc, { lineWidth: -1, noRefs: true, sortKeys: false });
    fs.writeFileSync(filePath, text, 'utf8');
}

function entityMap(doc) {
    const map = {};
    for (const e of doc.entities || []) {
        map[e.name] = e;
    }
    return map;
}

function attrNames(ent) {
    return new Set((ent.attributes || []).map((a) => a.name));
}

function pathToV1Segment(routePath) {
    let p = (routePath || '').trim();
    for (const prefix of ['/api/v1/', '/api/v1']) {
        if (p.startsWith(prefix)) {
            return p.slice(prefix.length).replace(/^\//, '');
        }
    }
    return p.replace(/^\//, '');
}

function sourceRouteSegments(ent) {
    const out = [];
    for (const r of ent.routes || []) {
        const seg = pathToV1Segment(r.path || '');
        let methods = r.methods ?? r.method;
        if (methods == null) {
            out.push([seg, null]);
        } else if (Array.isArray(methods)) {
            out.push([seg, new Set(methods.map((m) => String(m).toUpperCase()))]);
        } else {
            out.push([seg, new Set([String(methods).toUpperCase()])]);
        }
    }
    return out;
}

function exportRoutes(ent) {
    const out = [];
    for (const r of ent.routes || []) {
        const seg = r.v1_segment || pathToV1Segment(r.path || '');
        let methods = r.allow_methods || r.methods || [];
        if (typeof methods === 'string') {
            methods = [methods];
        }
        out.push([seg, new Set(methods.map((m) => String(m).toUpperCase()))]);
    }
    return out;
}

function isSubset(sub, sup) {
    for (const x of sub) {
        if (!sup.has(x)) return false;
    }
    return true;
}

function routeCovered(srcSeg, srcMethods, expRoutes) {
    for (const [eseg, emethods] of expRoutes) {
        const idSeg = `${srcSeg}/{id}`;
        if (eseg !== srcSeg && !(srcMethods === null && eseg === idSeg)) {
            continue;
        }
        if (srcMethods === null) {
            return true;
        }
        if (isSubset(srcMethods, emethods)) {
            return true;
        }
    }
    return false;
}

function attrByName(ent) {
    const map = {};
    for (const a of ent.attributes || []) {
        map[a.name] = a;
    }
    return map;
}

function normDefault(attr) {
    const v = attr.default ?? attr.default_value;
    if (v === undefined || v === null) return undefined;
    return String(v);
}

function normAnnotations(attr) {
    const ann = attr.annotations || [];
    return JSON.stringify([...ann].sort());
}

function typesCompatible(srcType, expType) {
    if (srcType === expType) return true;
    const numeric = new Set(['integer', 'number', 'decimal']);
    return numeric.has(srcType) && numeric.has(expType);
}

function formatRoute(seg, methods) {
    if (!methods || methods.size === 0) return seg;
    return `${seg} [${[...methods].sort().join(',')}]`;
}

function exportRouteExtra(eseg, emethods, srcRoutes) {
    for (const [sseg, smethods] of srcRoutes) {
        const idSeg = `${sseg}/{id}`;
        if (smethods === null) {
            if (eseg === sseg || eseg === idSeg) return false;
            // source path may be a specific op route (exact match only)
            if (eseg === sseg) return false;
            continue;
        }
        if (eseg === sseg && isSubset(smethods, emethods)) return false;
    }
    // exact match on op-style paths
    for (const [sseg, smethods] of srcRoutes) {
        if (eseg === sseg) return false;
    }
    return true;
}

const ENTITY_META_KEYS = ['domain', 'resource_identifier', 'table_name'];
const ATTR_FIELD_KEYS = ['type', 'is_required', 'is_unique', 'is_primary', 'is_readonly'];

function collectEntityDiffs(src, exp) {
    const diffs = {
        entityMeta: [],
        searchFields: [],
        attributesMissing: [],
        attributesExtra: [],
        attributeFields: [],
        routesMissing: [],
        routesExtra: [],
    };

    for (const key of ENTITY_META_KEYS) {
        const sv = src[key];
        const ev = exp[key];
        if (sv !== undefined && sv !== null && sv !== ev) {
            diffs.entityMeta.push({ field: key, source: sv, export: ev ?? '(missing)' });
        }
    }

    const srcSearch = [...(src.search_fields || [])].sort();
    const expSearch = [...(exp.search_fields || exp.search_configs || [])]
        .map((x) => (typeof x === 'string' ? x : x.name))
        .filter(Boolean)
        .sort();
    if (srcSearch.length) {
        const missing = srcSearch.filter((f) => !expSearch.includes(f));
        const extra = expSearch.filter((f) => !srcSearch.includes(f));
        if (missing.length) {
            diffs.searchFields.push({ kind: 'missing', values: missing });
        }
        if (extra.length) {
            diffs.searchFields.push({ kind: 'extra', values: extra });
        }
    }

    const srcAttrs = attrByName(src);
    const expAttrs = attrByName(exp);
    diffs.attributesMissing = Object.keys(srcAttrs).filter((n) => !expAttrs[n]).sort();
    diffs.attributesExtra = Object.keys(expAttrs).filter((n) => !srcAttrs[n]).sort();

    for (const name of Object.keys(srcAttrs).filter((n) => expAttrs[n]).sort()) {
        const sa = srcAttrs[name];
        const ea = expAttrs[name];
        for (const key of ATTR_FIELD_KEYS) {
            if (sa[key] === undefined) continue;
            const sv = sa[key];
            const ev = ea[key];
            if (key === 'type') {
                if (!typesCompatible(sv, ev)) {
                    diffs.attributeFields.push({ name, field: key, source: sv, export: ev });
                }
                continue;
            }
            if (sv !== ev) {
                diffs.attributeFields.push({ name, field: key, source: sv, export: ev });
            }
        }
        const sd = normDefault(sa);
        const ed = normDefault(ea);
        if (sd !== undefined && sd !== ed) {
            diffs.attributeFields.push({ name, field: 'default', source: sd, export: ed ?? '(missing)' });
        }
        const sAnn = normAnnotations(sa);
        const eAnn = normAnnotations(ea);
        if (sAnn !== '[]' && sAnn !== eAnn) {
            diffs.attributeFields.push({ name, field: 'annotations', source: sAnn, export: eAnn });
        }
        for (const jk of ['join_entity', 'join_attribute', 'join_on', 'join_with']) {
            if (sa[jk] !== undefined && sa[jk] !== ea[jk]) {
                diffs.attributeFields.push({ name, field: jk, source: sa[jk], export: ea[jk] ?? '(missing)' });
            }
        }
    }

    const srcRoutes = sourceRouteSegments(src);
    const expRoutes = exportRoutes(exp);
    diffs.routesMissing = srcRoutes
        .filter(([seg, m]) => !routeCovered(seg, m, expRoutes))
        .map(([seg, m]) => formatRoute(seg, m ? new Set(m) : null));
    diffs.routesExtra = expRoutes
        .filter(([eseg, em]) => exportRouteExtra(eseg, em, srcRoutes))
        .map(([eseg, em]) => formatRoute(eseg, em));

    return diffs;
}

function countDiffs(diffs) {
    return (
        diffs.entityMeta.length +
        diffs.searchFields.length +
        diffs.attributesMissing.length +
        diffs.attributesExtra.length +
        diffs.attributeFields.length +
        diffs.routesMissing.length +
        diffs.routesExtra.length
    );
}

function auditEntity(name, src, exp) {
    if (!exp) {
        return {
            name,
            inDb: false,
            pass: false,
            issues: ['entity missing in export'],
            diffs: null,
            diffCount: 0,
        };
    }

    const diffs = collectEntityDiffs(src, exp);
    const diffCount = countDiffs(diffs);
    /** PASS only when export matches source on every compared dimension (zero diff items). */
    const pass = diffCount === 0;

    const issues = [];
    if (!pass) {
        issues.push(`strict: ${diffCount} difference item(s) — PASS requires zero items in Differences`);
    }
    if (diffs.attributesMissing.length) {
        issues.push(`missing attributes: ${JSON.stringify(diffs.attributesMissing)}`);
    }
    if (diffs.routesMissing.length) {
        issues.push(`missing routes (v1_segment): ${JSON.stringify(diffs.routesMissing)}`);
    }

    const sa = attrNames(src);
    const ea = attrNames(exp);
    const srcRoutes = sourceRouteSegments(src);
    const expRoutes = exportRoutes(exp);

    return {
        name,
        inDb: true,
        pass,
        srcAttrs: sa.size,
        expAttrs: ea.size,
        srcRoutes: srcRoutes.length,
        expRoutes: expRoutes.length,
        extraAttrs: diffs.attributesExtra.length,
        issues,
        diffs,
        diffCount,
    };
}

function renderDiffSection(diffs) {
    const lines = [];
    if (diffs.entityMeta.length) {
        lines.push('- **Entity metadata**');
        for (const d of diffs.entityMeta) {
            lines.push(`  - \`${d.field}\`: source=\`${d.source}\` → export=\`${d.export}\``);
        }
    }
    if (diffs.searchFields.length) {
        lines.push('- **search_fields**');
        for (const d of diffs.searchFields) {
            lines.push(`  - ${d.kind}: \`${d.values.join('`, `')}\``);
        }
    }
    if (diffs.attributesMissing.length) {
        lines.push(`- **Attributes missing in export**: \`${diffs.attributesMissing.join('`, `')}\``);
    }
    if (diffs.attributesExtra.length) {
        lines.push(`- **Attributes extra in export**: \`${diffs.attributesExtra.join('`, `')}\``);
    }
    if (diffs.attributeFields.length) {
        lines.push('- **Attribute field mismatches**');
        for (const d of diffs.attributeFields) {
            lines.push(`  - \`${d.name}.${d.field}\`: source=\`${d.source}\` → export=\`${d.export}\``);
        }
    }
    if (diffs.routesMissing.length) {
        lines.push('- **Routes missing in export**');
        for (const r of diffs.routesMissing) {
            lines.push(`  - \`${r}\``);
        }
    }
    if (diffs.routesExtra.length) {
        lines.push('- **Routes extra in export** (not in source; strict mode counts as mismatch)');
        for (const r of diffs.routesExtra) {
            lines.push(`  - \`${r}\``);
        }
    }
    if (lines.length === 0) {
        lines.push('- _(no differences)_');
    }
    return lines;
}

function renderReport(source, exportFile, entities, results, warnings) {
    const overall = results.every((r) => r.pass);
    const totalDiffs = results.reduce((n, r) => n + (r.diffCount || 0), 0);
    const lines = [
        '# YAML Import Audit Report',
        '',
        `- **Source**: \`${source}\``,
        `- **Export (audit)**: \`${exportFile}\` (null keys stripped by yaml-audit.js)`,
        `- **Generated**: ${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}`,
        `- **Entities**: ${entities.join(', ')}`,
        `- **Difference items**: ${totalDiffs} (**PASS** only when this is 0 for every entity)`,
        '',
        '## Summary',
        '',
        '| Entity | In DB | Src attrs | Exp attrs | Src routes | Exp routes | Diffs | Result |',
        '|--------|-------|-----------|-----------|------------|------------|-------|--------|',
    ];

    for (const r of results) {
        const status = r.pass ? 'PASS' : 'FAIL';
        if (!r.inDb) {
            lines.push(`| ${r.name} | ✗ | — | — | — | — | — | **FAIL** |`);
        } else {
            lines.push(
                `| ${r.name} | ✓ | ${r.srcAttrs} | ${r.expAttrs} | ${r.srcRoutes} | ${r.expRoutes} | ${r.diffCount} | **${status}** |`
            );
        }
    }

    lines.push(
        '',
        `**Overall**: **${overall ? 'PASS' : 'FAIL'}** — ` +
            (overall
                ? 'all entities have **zero** difference items vs source.'
                : 'at least one entity has non-zero differences; see **Differences** and exit code.'),
        ''
    );

    if (warnings.length) {
        lines.push('## Export warnings', '');
        for (const w of warnings) {
            lines.push(`- ${w}`);
        }
        lines.push('');
    }

    lines.push('## Differences', '');
    for (const r of results) {
        lines.push(`### ${r.name}`, '');
        if (!r.inDb) {
            lines.push('- Entity not found in export.', '');
            continue;
        }
        if (!r.pass) {
            lines.push('- **FAIL reasons**');
            for (const issue of r.issues) {
                lines.push(`  - ${issue}`);
            }
            lines.push('');
        }
        lines.push(...renderDiffSection(r.diffs), '');
    }

    return lines.join('\n');
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const srcDoc = stripNulls(load(args.source));
    const expDocRaw = load(args.export);
    const expDoc = stripNulls(expDocRaw);
    writeFilteredExport(args.export, expDoc);
    const sm = entityMap(srcDoc);
    const em = entityMap(expDoc);
    const entities = Object.keys(sm);
    const results = entities.map((n) => auditEntity(n, sm[n], em[n]));
    const report = renderReport(args.source, args.export, entities, results, args.warn);

    if (args.output) {
        fs.mkdirSync(path.dirname(path.resolve(args.output)), { recursive: true });
        fs.writeFileSync(args.output, report, 'utf8');
        console.log(`Report written to ${args.output}`);
    } else {
        console.log(report);
    }

    process.exit(results.every((r) => r.pass) ? 0 : 1);
}

main();

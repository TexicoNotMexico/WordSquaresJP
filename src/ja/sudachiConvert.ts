import { dirname, fromFileUrl, join } from "https://deno.land/std@0.203.0/path/mod.ts";

const __dirname = dirname(fromFileUrl(import.meta.url));
const INPUT_FILES = ["small_lex.csv", "core_lex.csv", "notcore_lex.csv"].map((f) => join(__dirname, f));
const OUTPUT_FILE = join(__dirname, "converted.csv");

// === 工程 1 ===
async function readAllCSVs(): Promise<string[][]> {
    const rows: string[][] = [];
    for (const file of INPUT_FILES) {
        try {
            console.log(`Reading file: ${file}`);
            const text = await Deno.readTextFile(file);
            for (const line of text.split(/\r?\n/)) {
                if (!line.trim()) continue;
                rows.push(line.split(","));
            }
            console.log(`Loaded ${rows.length} rows from ${file}`);
        } catch {
            console.warn(`Skipped missing file: ${file}`);
        }
    }
    console.log(`Total rows: ${rows.length}`);
    return rows;
}

// === 工程 2  ===
function posFilter(row: string[]): boolean {
    const major = row[5]; // 品詞大分類
    const mid = row[6]; // 品詞中分類

    if (major === "名詞" && mid === "普通名詞") return true;
    if (major === "代名詞") return true;
    if (major === "形状詞" && mid !== "助動詞語幹") return true;
    if (major === "副詞") return true;
    if (major === "感動詞" && mid === "一般") return true;
    if (major === "動詞") return true;
    if (major === "形容詞") return true;

    return false;
}

// === 工程 3 ===
function normalizeFilter(row: string[]): boolean {
    const headword = row[0];
    const normalized = row[12];
    return headword === normalized;
}

// === 工程 4 ===
function sanitizeReading(rows: string[][]): string[][] {
    const allowed =
        "ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロワヲンヴー";
    const allowedSet = new Set([...allowed]);

    const result: string[][] = [];
    for (const row of rows) {
        const reading = row[11];
        const filtered = [...reading].filter((c) => allowedSet.has(c)).join("");
        if (filtered.length === 0) {
            continue; // 0 文字になったら捨てる
        }
        row[11] = filtered;
        result.push(row);
    }
    return result;
}

// === 工程 5 ===
function groupByReading(rows: string[][]): Map<string, { head: string; cost: number }[]> {
    const groups = new Map<string, { head: string; cost: number }[]>();
    for (const row of rows) {
        const reading = row[11]; // 読み
        const headword = row[0]; // 見出し
        const cost = parseInt(row[3], 10); // コスト
        if (!groups.has(reading)) groups.set(reading, []);
        groups.get(reading)!.push({ head: headword, cost });
    }
    return groups;
}

// === メイン処理 ===
if (import.meta.main) {
    console.log("Step 1...");
    const rows = await readAllCSVs();

    console.log("Step 2...");
    const filteredPOS = rows.filter(posFilter);
    console.log(`Rows: ${filteredPOS.length}`);

    console.log("Step 3...");
    const filteredNorm = filteredPOS.filter(normalizeFilter);
    console.log(`Rows: ${filteredNorm.length}`);

    console.log("Step 4...");
    const sanitized = sanitizeReading(filteredNorm);
    console.log(`Rows: ${sanitized.length}`);

    console.log("Step 5...");
    const groups = groupByReading(sanitized);
    const sortedReadings = [...groups.entries()].sort((a, b) =>
        a[0].localeCompare(b[0], undefined, { sensitivity: "base" })
    );
    console.log(`Unique readings: ${sortedReadings.length}`);

    const outLines: string[] = [];
    const skipAmount = 1;
    for (const [reading, entries] of sortedReadings) {
        entries.sort((a, b) => a.cost - b.cost);
        const uniqueHeads = [...new Set(entries.map((e) => e.head))].filter((_, idx) => idx % skipAmount === 0);
        outLines.push(`${reading},${uniqueHeads.join("/")}`);
    }

    console.log(`Writing output file: ${OUTPUT_FILE}`);
    await Deno.writeTextFile(OUTPUT_FILE, outLines.join("\n"));
    console.log(`Done. Wrote ${OUTPUT_FILE} (${outLines.length} entries)`);
}

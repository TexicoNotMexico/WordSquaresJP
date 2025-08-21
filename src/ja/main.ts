import { Trie } from "./trie.ts";

const DICTIONARY = "src/ja/converted.csv";
const SIZE_W = 5;
const SIZE_H = 5;
const UNIQUE = true;

const banned = new Set<string>();

const g_forms = new Map<string, string[]>();

const g_trie_w = new Trie();
const g_trie_h = new Trie();

const g_words: string[] = Array(SIZE_H * SIZE_W).fill("");

const g_rows: string[] = Array(SIZE_H).fill("");
const g_cols: string[] = Array(SIZE_W).fill("");

async function LoadDictionary(fname: string, length: number, trie: Trie) {
    console.log(`Loading Dictionary ${fname}...`);
    const data = await Deno.readTextFile(fname);
    const lines = data.split(/\r?\n/);
    let numWords = 0;
    for (let line of lines) {
        line = line.trim();
        if (line.length === 0) continue;
        const parts = line.split(",");
        if (parts.length < 2) continue;
        const yomi = parts[0].trim();
        const forms = parts[1].split("/").map((s) => s.trim());
        if (yomi.length !== length) continue;
        if (banned.has(yomi)) continue;
        trie.add(yomi);
        g_forms.set(yomi, forms);
        numWords++;
    }
    console.log(`Loaded ${numWords} words.`);
}

function PrintBox(words: string[]) {
    const rowWords: string[] = [];
    for (let h = 0; h < SIZE_H; h++) {
        const row = words.slice(h * SIZE_W, (h + 1) * SIZE_W).join("");
        rowWords.push(row);
    }

    const colWords: string[] = [];
    for (let w = 0; w < SIZE_W; w++) {
        let col = "";
        for (let h = 0; h < SIZE_H; h++) {
            col += words[h * SIZE_W + w];
        }
        colWords.push(col);
    }

    if (UNIQUE) {
        const seen = new Set<string>();
        for (const r of rowWords) {
            if (seen.has(r)) return;
            seen.add(r);
        }
        for (const c of colWords) {
            if (seen.has(c)) return;
            seen.add(c);
        }
    }

    for (let h = 0; h < SIZE_H; h++) {
        console.log(rowWords[h]);
    }
    console.log("");

    for (let h = 0; h < SIZE_H; h++) {
        const yomi = rowWords[h];
        const forms = g_forms.get(yomi) ?? [];
        console.log(`横${h + 1}: ${forms.join("/")}`);
    }

    for (let w = 0; w < SIZE_W; w++) {
        const yomi = colWords[w];
        const forms = g_forms.get(yomi) ?? [];
        console.log(`縦${w + 1}: ${forms.join("/")}`);
    }

    console.log("");
}

function BoxSearch(trie: Trie | null, vtries: (Trie | null)[], pos: number) {
    const v_ix = pos % SIZE_W;
    const h_ix = Math.floor(pos / SIZE_W);

    if (v_ix === 0) {
        if (pos === SIZE_H * SIZE_W) {
            PrintBox(g_words);
            return;
        }
        trie = g_trie_w;
    }

    if (!trie) return;

    for (const { ix, letter, trie: nextTrie } of trie.iter()) {
        if (!vtries[v_ix]?.hasIx(ix)) continue;

        g_words[pos] = letter;

        let rowComplete = false;
        if (v_ix === SIZE_W - 1) {
            const row = g_words.slice(h_ix * SIZE_W, (h_ix + 1) * SIZE_W).join("");
            if (!g_forms.has(row)) continue;
            g_rows[h_ix] = row;
            rowComplete = true;
        }

        const backup = vtries[v_ix];
        vtries[v_ix] = vtries[v_ix]?.decend(ix) ?? null;

        BoxSearch(nextTrie, vtries, pos + 1);

        vtries[v_ix] = backup;
        if (rowComplete) g_rows[h_ix] = "";
    }
}

if (import.meta.main) {
    await LoadDictionary(DICTIONARY, SIZE_W, g_trie_w);
    let trie_h: Trie = g_trie_w;
    if (SIZE_W !== SIZE_H) {
        await LoadDictionary(DICTIONARY, SIZE_H, g_trie_h);
        trie_h = g_trie_h;
    }

    const vtries: (Trie | null)[] = Array(SIZE_W).fill(trie_h);
    BoxSearch(null, vtries, 0);

    console.log("Done.");
}

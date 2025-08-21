import { Trie } from "./trie.ts";

const DICTIONARY = "./scrabble_words.txt";
const FREQ_FILTER = "./ngram_freq_dict.csv";
const SIZE_W = 5;
const SIZE_H = 5;
const MIN_FREQ_W = 20000;
const MIN_FREQ_H = 20000;
const UNIQUE = true;
const DIAGONALS = false;

const VTRIE_SIZE = DIAGONALS ? SIZE_W + 2 : SIZE_W;
const banned = new Set<string>();

const g_freqs = new Map<string, number>();
const g_trie_w = new Trie();
const g_trie_h = new Trie();
const g_words: string[] = Array(SIZE_H * SIZE_W).fill("");

async function LoadFreq(fname: string) {
    console.log(`Loading Frequency List ${fname}...`);
    const data = await Deno.readTextFile(fname);
    const lines = data.split(/\r?\n/).filter((l) => l.trim().length > 0);
    let numWords = 0;
    let first = true;
    for (const line of lines) {
        if (first) {
            first = false;
            continue;
        }
        const word = line.split(",")[0].toUpperCase();
        g_freqs.set(word, numWords);
        numWords++;
    }
    console.log(`Loaded ${numWords} words.`);
}

async function LoadDictionary(fname: string, length: number, trie: Trie, minFreq: number) {
    console.log(`Loading Dictionary ${fname}...`);
    const data = await Deno.readTextFile(fname);
    const lines = data.split(/\r?\n/);
    let numWords = 0;
    for (let line of lines) {
        line = line.trim().toUpperCase();
        if (line.length !== length) continue;
        if (g_freqs.size > 0 && minFreq > 0) {
            const freq = g_freqs.get(line);
            if (freq === undefined || freq > minFreq) continue;
        }
        if (banned.has(line)) continue;
        trie.add(line);
        numWords++;
    }
    console.log(`Loaded ${numWords} words.`);
}

function PrintBox(words: string[]) {
    if (UNIQUE && SIZE_H === SIZE_W) {
        for (let i = 0; i < SIZE_H; i++) {
            let numSame = 0;
            for (let j = 0; j < SIZE_W; j++) {
                if (words[i * SIZE_W + j] === words[j * SIZE_W + i]) {
                    numSame++;
                }
            }
            if (numSame === SIZE_W) return;
        }
    }
    for (let h = 0; h < SIZE_H; h++) {
        console.log(words.slice(h * SIZE_W, (h + 1) * SIZE_W).join(""));
    }
    console.log("");
}

function BoxSearch(trie: Trie | null, vtries: (Trie | null)[], pos: number) {
    const v_ix = pos % SIZE_W;
    // const h_ix = Math.floor(pos / SIZE_W);

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

        if (pos === 0) console.log(`=== [${letter}] ===`);

        // DIAGONALS

        g_words[pos] = letter;
        const backup = vtries[v_ix];
        vtries[v_ix] = vtries[v_ix]?.decend(ix) ?? null;

        BoxSearch(nextTrie, vtries, pos + 1);

        vtries[v_ix] = backup;
    }
}

// ==== main ====
if (import.meta.main) {
    await LoadFreq(FREQ_FILTER);

    await LoadDictionary(DICTIONARY, SIZE_W, g_trie_w, MIN_FREQ_W);
    let trie_h: Trie = g_trie_w;
    if (SIZE_W !== SIZE_H) {
        await LoadDictionary(DICTIONARY, SIZE_H, g_trie_h, MIN_FREQ_H);
        trie_h = g_trie_h;
    }

    const vtries: (Trie | null)[] = Array(VTRIE_SIZE).fill(trie_h);
    BoxSearch(null, vtries, 0);

    console.log("Done.");
}

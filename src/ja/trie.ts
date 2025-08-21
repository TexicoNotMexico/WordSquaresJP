export const KATAKANA =
    "ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロワヲンヴー";

export const NUM_LETTERS = KATAKANA.length;
export const CHAR_TO_INDEX = new Map<string, number>();
export const INDEX_TO_CHAR = new Map<number, string>();

(function initMaps() {
    for (let i = 0; i < KATAKANA.length; i++) {
        CHAR_TO_INDEX.set(KATAKANA[i], i);
        INDEX_TO_CHAR.set(i, KATAKANA[i]);
    }
})();

export class Trie {
    nodes: (Trie | null)[];

    constructor() {
        this.nodes = Array(NUM_LETTERS).fill(null);
    }

    add(str: string) {
        let ptr: Trie = this;
        for (const c of str) {
            const ix = CHAR_TO_INDEX.get(c);
            if (ix === undefined) throw new Error(`Invalid char: ${c}`);
            if (ptr.nodes[ix] === null) {
                ptr.nodes[ix] = new Trie();
            }
            ptr = ptr.nodes[ix]!;
        }
    }

    has(str: string): boolean {
        let ptr: Trie | null = this;
        for (const c of str) {
            const ix = CHAR_TO_INDEX.get(c);
            if (ix === undefined) throw new Error(`Invalid char: ${c}`);
            if (ptr!.nodes[ix] === null) return false;
            ptr = ptr!.nodes[ix];
        }
        return true;
    }

    hasIx(ix: number): boolean {
        return this.nodes[ix] !== null;
    }

    decend(ix: number): Trie | null {
        return this.nodes[ix];
    }

    *iter(): Generator<{ ix: number; letter: string; trie: Trie }> {
        for (let ix = 0; ix < NUM_LETTERS; ix++) {
            if (this.nodes[ix]) {
                yield { ix, letter: INDEX_TO_CHAR.get(ix)!, trie: this.nodes[ix]! };
            }
        }
    }
}

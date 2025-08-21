export const NUM_LETTERS = 26;

export class Trie {
    nodes: (Trie | null)[];

    constructor() {
        this.nodes = Array(NUM_LETTERS).fill(null);
    }

    add(str: string) {
        let ptr: Trie = this;
        for (const c of str) {
            const ix = c.charCodeAt(0) - 65; // 'A' = 65
            if (ix < 0 || ix >= NUM_LETTERS) throw new Error("Invalid letter");
            if (ptr.nodes[ix] === null) {
                ptr.nodes[ix] = new Trie();
            }
            ptr = ptr.nodes[ix]!;
        }
    }

    has(str: string): boolean {
        let ptr: Trie | null = this;
        for (const c of str) {
            const ix = c.charCodeAt(0) - 65;
            if (ix < 0 || ix >= NUM_LETTERS) throw new Error("Invalid letter");
            if (ptr.nodes[ix] === null) return false;
            ptr = ptr.nodes[ix];
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
                yield { ix, letter: String.fromCharCode(ix + 65), trie: this.nodes[ix]! };
            }
        }
    }
}

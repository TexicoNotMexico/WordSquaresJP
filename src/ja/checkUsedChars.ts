import { parse } from "jsr:@std/csv";

const text = await Deno.readTextFile("src/ja/converted.csv");

const data = parse(text, { skipFirstRow: false, strip: true });

let chars = "";
for (const row of data as string[][]) {
    if (row.length > 0) {
        chars += row[0];
    }
}

const result = [...new Set(chars.split(""))].sort().join("");

console.log(result);
// Expected: ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロワヲンヴー

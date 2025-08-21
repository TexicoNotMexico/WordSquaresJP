# WordSquaresJP

[WordSquares](https://github.com/HackerPoet/WordSquares) の Typescript (Deno) 移植および日本語対応

## 実行方法

### 英語版

#### 辞書データ

- [Scrabble Words List](https://raw.githubusercontent.com/andrewchen3019/wordle/refs/heads/main/Collins%20Scrabble%20Words%20(2019).txt) を `src/en/scrabble_words.txt` にダウンロード
- [NGram Viewer Frequencies](https://www.kaggle.com/datasets/wheelercode/dictionary-word-frequency) を `src/en/ngram_freq_dict.csv` にダウンロード

#### 実行

```bash
deno run --allow-read ./src/en/main.ts
```

### 日本語版

#### 辞書データ

[Sudachi Dictionary Sources](http://sudachi.s3-website-ap-northeast-1.amazonaws.com/sudachidict-raw/) から `src/ja/*.csv` にダウンロードして以下のコマンドを実行

```bash
deno run --allow-read --allow-write ./src/ja/sudachiConvert.ts
```

#### 実行

```bash
deno run --allow-read --allow-write ./src/ja/main.ts
```

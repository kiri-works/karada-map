# 水分不足側セルフチェック｜preview v0.1

Notion正本「💧 水分不足側セルフチェック｜MVP仕様 v0.1 正本｜2026-08-30」をWeb実装へ落とすための公開前preview。

## 実装境界

- 既存の `/index.html` / `/result.html` は変更しない。
- このpreviewは `/water-check-preview/` 配下だけで完結する。
- `noindex,nofollow,noarchive` を付け、公開導線にはまだ接続しない。
- 脱水症・熱中症の診断、体内水分量の推定、必要水分量mL計算はしない。
- 主判定は「24時間の排尿回数」と「尿色」の2指標のみ。
- 口渇と生活背景は結果ランクを変更しない。
- UNKNOWN / INVALID / SPECIAL は陰性へ丸めない。

## 状態

### 排尿回数
- `VOID_LOW_STRONG`: 2〜4回
- `VOID_LOW`: 5〜6回
- `VOID_NOT_LOW`: 7回以上
- `VOID_UNKNOWN`: 記憶不明、0〜1回の再確認不成立等
- `VOID_INVALID`: 頻回少量、排尿症状、薬変更等で水分指標として使わない
- `VOID_SPECIAL`: 0〜1回を再確認しても確か

### 尿色
- `COLOR_LOW`: 濃い黄色〜琥珀色
- `COLOR_NOT_LOW`: ほぼ無色〜黄色側
- `COLOR_UNKNOWN`: 見ていない／確認困難／決めにくい
- `COLOR_CONFOUNDED`: ビタミン剤等で普段と違う鮮やかな色
- `COLOR_ATYPICAL`: 赤・茶など普段の黄色系と異なる色

### 通常結果
- `RESULT_MULTIPLE`
- `RESULT_PARTIAL`
- `RESULT_NOT_PROMINENT`
- `RESULT_UNCLEAR`

### 特殊結果
- `RESULT_VOID_SPECIAL`
- `RESULT_COLOR_ATYPICAL`
- UI側: `SCOPE_STOP` / `SAFETY_STOP` / `URGENT_STOP`

`COLOR_ATYPICAL` と `VOID_SPECIAL` が同時に成立する境界では `COLOR_ATYPICAL` を優先表示する。これは重症度順位ではなく、「普段と違う尿色を水分不足として解釈しない」という安全側の表示優先。

## 画面フロー

1. START
2. 利用条件ゲート
3. Q1 急性体調
4. 必要時 Q1-A 強い状態
5. Q2 口渇
6. Q3 24時間排尿回数
7. 必要時 Q3-A 0〜1回再確認
8. Q4 尿色を確認できるか
9. 必要時 Q4-A 尿色
10. Q5 排尿回数の読み取り条件
11. 必要時 Q5-A 強い口渇＋頻回排尿の持続
12. Q6 生活背景
13. 結果

質問数は固定表示しない。progressは論理フェーズの進行率として表示する。

## 計測フック

previewでは外部analytics providerにはまだ接続しない。

- `water_check_start`
- `water_check_complete`
- `water_check_result_cta_click`

イベントは `window.dataLayer` と `CustomEvent('karadaMapAnalytics')` に流す。

## テスト

```bash
node water-check-preview/test.mjs
```

正本20ケースのうち通常判定／特殊判定15ケース（1〜14・20）を機械テストし、15〜19はUI STOPルートとして分離。追加境界ケースも含めてPASS済み。

公開前にUIで20ケースを通し、STOP分岐・戻る・回答保持・スマホ表示・CTA計測を確認する。

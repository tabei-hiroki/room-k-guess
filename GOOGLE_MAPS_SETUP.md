# Google Maps API Setup Guide

このドキュメントでは、Vue.js + Firebase プロジェクトで Google Maps JavaScript API をセットアップする手順をまとめます。

---

## 1. Google Cloud プロジェクトの作成

1. [Google Cloud Console](https://console.cloud.google.com/) にログイン
2. 新しいプロジェクトを作成（任意の名前でOK）
3. 作成したプロジェクトを選択し、以後の設定を行う

---

## 2. Maps JavaScript API を有効化

1. 左上メニュー「API とサービス」>「ライブラリ」を開く
2. `Maps JavaScript API` を検索して有効化
3. （必要に応じて）以下も有効化することを推奨:
    - `Geocoding API`
    - `Places API`

---

## 3. APIキーの作成

1. 「認証情報」>「+ 認証情報を作成」>「APIキー」
2. 発行されたキーをコピーして `.env` に追加

```env
VUE_APP_GOOGLE_MAPS_API_KEY=your-api-key-here
```

---

## 4. APIキーの制限設定（推奨）

セキュリティ保護のため、キーに使用制限を設定しましょう。

- 使用制限: `Maps JavaScript API` のみに限定
- アプリケーション制限:
  - 開発中 → `なし`
  - 公開時 → `HTTP リファラ` または `IPアドレス` 制限を設定

---

## 5. Vue アプリでの使用

### `main.js` での読み込み（例）

```js
import * as VueGoogleMaps from 'vue2-google-maps';

Vue.use(VueGoogleMaps, {
  load: {
    key: process.env.VUE_APP_GOOGLE_MAPS_API_KEY,
    language: 'ja',
    libraries: 'places', // 例：Place APIを使う場合
  }
});
```

---

## 6. よくあるエラー

| エラー内容                     | 原因と対策                                                 |
|------------------------------|------------------------------------------------------------|
| `InvalidKeyMapError`         | APIキーが不正、または制限の設定が厳しすぎる可能性         |
| `RetiredVersion`             | 読み込んでいるAPIのバージョンが古い。`v=3.exp`推奨         |
| `key=undefined`              | `.env`の環境変数が正しく読み込まれていない                 |

---

## 7. 料金について

Google Maps API は無料枠あり：

- **月額 $200 分まで無料**
- Maps JavaScript API では約 **28,000回の読み込み/月**まで無料
- テスト用途・少人数の利用であれば課金される可能性は低い

※ 詳細: [Google Maps Platform Pricing](https://cloud.google.com/maps-platform/pricing)

---

## 8. その他注意点

- `.env` ファイルの変更後は必ず再ビルド (`npm run serve` など)
- `.env` は `.gitignore` で Git 管理から除外すること

---

## 参考リンク

- [Maps JavaScript API ガイド](https://developers.google.com/maps/documentation/javascript/overview?hl=ja)
- [APIエラーとトラブルシューティング](https://developers.google.com/maps/documentation/javascript/error-messages?hl=ja)
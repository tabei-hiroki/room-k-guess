# room-k-guess

**room-k-guess** は、オープンソースの地理推測ゲーム [GeoGuess](https://github.com/GeoGuess/GeoGuess) をベースに、自分専用にカスタマイズしたプロジェクトです。広告を完全に除去し、Google Maps API キーを使ってセルフホストでプレイできます。

## 🔄 このリポジトリの変更点

- Google AdSense やその他の広告コンポーネントをすべて削除
- 自分専用の UI 日本語翻訳を追加
- Firebase Realtime Database によるマルチプレイ機能対応（最大5人）
- Firebase Hosting を使ったデプロイ手順を明文化
- Google Maps API のセットアップ手順を別ドキュメントに分離

## 🚀 セットアップ方法（ローカル）

```bash
git clone https://github.com/tabei-hiroki/room-k-guess.git
cd room-k-guess
npm install
npm run serve
```

`.env` ファイルを作成し、以下のように記載してください：

```env
VITE_MAPS_API_KEY=あなたのGoogleMapsAPIキー
```

## 🔧 Firebase の設定

Firebase のプロジェクト作成やマルチプレイ設定、Firebase Hosting によるデプロイについては、以下のドキュメントを参照してください：

- [Firebase セットアップ手順](docs/FIREBASE_SETUP.md)
- [Google Maps API 設定手順](docs/GOOGLE_MAPS_SETUP.md)

## 🕹️ 遊び方

- ランダムに表示される Google StreetView の風景を見て、地図上で場所を推測するゲームです。
- ソロまたは最大5人までのマルチプレイが可能です。
- ラウンド数は5回。正解に近いほどスコアが高くなります。

## 🛠 技術構成

- フロントエンド：Vue.js
- 地図API：Google Maps JavaScript API + StreetView
- マルチプレイ：Firebase Realtime Database
- PWA対応（モバイルでも快適に動作）
- デプロイ：Firebase Hosting または GitHub Pages

## 📄 ライセンスとクレジット

本プロジェクトは [GeoGuess](https://github.com/GeoGuess/GeoGuess) を元にしています。  
GeoGuess は MIT ライセンスで提供されています。

```
MIT License
...
```

## ✍️ 作者


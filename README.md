# room-k-guess

**room-k-guess** は、オープンソースの地理推測ゲーム [GeoGuess](https://github.com/GeoGuess/GeoGuess) をベースに、自分専用にカスタマイズしたプロジェクトです。広告を完全に除去し、Google Maps API キーを使ってセルフホストでプレイできます。

## 🔄 このリポジトリの変更点

- Google AdSense やその他の広告コンポーネントをすべて削除
- 自分専用の UI カスタマイズ（必要に応じて）
- 独自のリポジトリ名（room-k-guess）として運用
- Google Maps API キーは `.env` にて設定可能

## 🚀 セットアップ方法

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

## Firebase の設定

Firebase のプロジェクト作成や `.env` 設定については、[こちらのガイド](docs/firebase-setup.md) を参照してください。


## 🕹️ 遊び方

- ランダムに表示される場所の風景（Google StreetView）を見て、地図上で位置を当てるゲームです。
- ソロまたは最大5人までのマルチプレイが可能。
- ラウンド数は5回。正解に近いほどスコアが高くなります。

## 🛠 技術構成

- フロントエンド：Vue.js
- 地図API：Google Maps JavaScript API + StreetView
- PWA対応（モバイルでも快適に動作）

## 📄 ライセンスとクレジット

本プロジェクトは [GeoGuess](https://github.com/GeoGuess/GeoGuess) を元にしています。  
GeoGuess は MIT ライセンスで提供されています。

```
MIT License

Copyright (c) ...

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
...
```

## ✍️ 作者

- Hiroki Tabei（[@tabei-hiroki](https://github.com/tabei-hiroki)）
- 本プロジェクトは個人用途およびセルフホスト用に公開しています。

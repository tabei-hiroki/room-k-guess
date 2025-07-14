# Firebase Setup for room-k-guess

このドキュメントは、GeoGuess クローン「room-k-guess」に Firebase を導入してマルチプレイ機能を有効化するためのセットアップ手順をまとめたものです。

## プラン選択
- **Sparkプラン（無料）** を選択してください。
  - ロケーション選択: `asia-southeast1`（シンガポール）
  - マルチプレイ目的であれば無料枠で十分運用可能です。

---

## Firebase プロジェクト作成手順

1. [Firebase Console](https://console.firebase.google.com/) にアクセスし、新しいプロジェクトを作成。
2. 「プロジェクト名」を入力し、Google Analytics は任意で設定。
3. プロジェクト作成後、下記を控える（`.env` に記載するため）:
    - `VUE_APP_FIREBASE_API_KEY`
    - `VUE_APP_FIREBASE_AUTH_DOMAIN`
    - `VUE_APP_FIREBASE_PROJECT_ID`
    - `VUE_APP_FIREBASE_DATABASE_URL`
    - `VUE_APP_STORAGE_BUCKET`
    - `VUE_APP_FIREBASE_MESSAGING_SENDER_ID`
    - `VUE_APP_FIREBASE_APP_ID`
    - `VUE_APP_FIREBASE_MEASUREMENT_ID`（Google Analytics を使用しないので空欄でOK）

---

## Realtime Database の設定

1. 左メニュー「Build > Realtime Database」を選択。
2. 「データベースを作成」 > ロケーションを選択。
3. セキュリティルール:
    - テストモードを選択（※本番環境ではルールの見直しを推奨）

```json
{
  "rules": {
    ".read": "now < 1755010800000",  // 2025-8-13
    ".write": "now < 1755010800000"  // 2025-8-13
  }
}
```

---

## .env ファイルへの追加

プロジェクトルートに `.env` ファイルを作成し、以下を記載：

```env
VUE_APP_FIREBASE_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VUE_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VUE_APP_FIREBASE_PROJECT_ID=your-project-id
VUE_APP_FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
VUE_APP_STORAGE_BUCKET=your-project-id.appspot.com
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=000000000000
VUE_APP_FIREBASE_APP_ID=1:000000000000:web:xxxxxxxxxxxxxxxx
VUE_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX （Google Analytics を使用しないので空欄でOK）
```

---

## 4. Firebase Hosting 導入手順（Vue.js アプリの場合）

Firebase Hosting を使うことで、Vue.js アプリを簡単に Web に公開できます。
本プロジェクトでは任意の選択ですが、チームメンバーが共有しやすくなるため推奨します。

### 🔹 初期設定（初回のみ）

```bash
firebase init hosting
```

初期化中に表示される英語の質問と推奨回答：

- `What do you want to use as your public directory? (public)` → `dist`
- `Configure as a single-page app (rewrite all urls to /index.html)? (Y/n)` → `Y`
- `Set up automatic builds and deploys with GitHub? (Y/n)` → `n`

### 🔹 デプロイコマンド

```bash
npm run build
firebase deploy
```

デプロイ成功後、以下のURLでアクセスできます：

```
https://<project-id>.web.app
```

---

## 無料枠の注意点

- Sparkプランは以下のような上限があります：
  - 同時接続数: 100人
  - 書き込み: 1GB/月
  - データ転送: 10GB/月

### 超過時の動作
- Firebase の無料枠を超えると **エラー発生** や **書き込み不可** となることがあります。
- ビルド失敗や強制的なアップグレードはされませんが、制限にかかる前に通知が届きます。

---

## その他

- Firebase SDK は `src/main.js` にて初期化されます。
- `firebase.analytics()` は `measurementId` がある場合のみ有効。
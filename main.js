// ブラウザに保存するためのキー（名前）
const STORAGE_KEY = 'estat_app_id';

// 画面読み込み時の処理
document.addEventListener('DOMContentLoaded', () => {
    // ブラウザの記憶領域からIDを取り出す
    const savedAppId = localStorage.getItem(STORAGE_KEY);

    if (savedAppId) {
        // IDが既に保存されていれば、メイン画面を表示
        showMainScreen();
        console.log("保存されたIDを使ってデータの自動取得を開始します...");
        // ※後ほど、ここにe-Stat APIを叩く関数を追加します
        // fetchLogPrices(savedAppId);
    } else {
        // 保存されていなければ、設定画面を表示
        document.getElementById('setup-screen').style.display = 'block';
    }
});

// 「保存して開始」ボタンが押された時の処理
function saveAppId() {
    const inputId = document.getElementById('appIdInput').value.trim();
    
    if (inputId) {
        // 入力されたIDをブラウザに記憶させる
        localStorage.setItem(STORAGE_KEY, inputId);
        
        // 設定画面を隠してメイン画面を表示
        document.getElementById('setup-screen').style.display = 'none';
        showMainScreen();
        
        console.log("新しいIDを保存しました。データの取得を開始します...");
        // ※後ほど、ここにe-Stat APIを叩く関数を追加します
        // fetchLogPrices(inputId);
    } else {
        alert('アプリケーションIDを入力してください。');
    }
}

// メイン画面を表示する処理
function showMainScreen() {
    document.getElementById('main-screen').style.display = 'block';
}

// 「リセット」ボタンが押された時の処理（PCを変えた時やIDを間違えた時用）
function clearAppId() {
    if(confirm('保存されているIDを削除して初期画面に戻りますか？')) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload(); // 画面を再読み込み
    }
}
let myChart = null; 

// ▼▼ ご自身のスプレッドシートのCSV公開URLを入れてください ▼▼
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2AWXZa2ue3nvb2vg8XW8cAu71uFZPXCFYPOgwWtDrQkdCo5aUGNZujbsyP_-8dWOVl1Npjj6rnbt_/pub?gid=0&single=true&output=csv';
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
});

async function loadDashboardData() {
    try {
        // キャッシュ（古いデータ）を無視して必ず最新を取りに行くおまじない
        const noCacheParam = `?_=${Date.now()}`;
        const csvFetchUrl = SHEET_CSV_URL.includes('?') ? `${SHEET_CSV_URL}&_=${Date.now()}` : `${SHEET_CSV_URL}${noCacheParam}`;

        // 1. CSVデータの読み込み
        const csvResponse = await fetch(csvFetchUrl, { cache: 'no-store' });
        if (!csvResponse.ok) throw new Error('CSVの取得に失敗しました');
        const csvText = await csvResponse.text();
        
        const parsedData = parseCSV(csvText);
        drawChart(parsedData);

        // 2. AI予測テキスト（insight.txt）の読み込み（こちらも強制最新）
        const txtResponse = await fetch(`insight.txt${noCacheParam}`, { cache: 'no-store' });
        if (!txtResponse.ok) throw new Error('insight.txtが見つかりません');
        const insightText = await txtResponse.text();
        
        document.getElementById('prediction-text').innerText = insightText;

    } catch (error) {
        console.error("データの読み込みエラー:", error);
        document.getElementById('prediction-text').innerText = "データの読み込みに失敗しました。";
    }
}

// カンマ付き数字（"15,700"など）にも対応したCSV分割関数
function splitCSVRow(text) {
    let result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (char === '"') {
            inQuotes = !inQuotes; // ダブルクォーテーションの中かどうかを判定
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

// CSVパーサー（カンマ付き数字＆最新12ヶ月抽出対応）
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = splitCSVRow(lines[0].trim());

    let labels = [];
    const datasets = [];

    for (let i = 1; i < headers.length; i++) {
        datasets.push({
            label: headers[i].trim(),
            data: [],
            borderWidth: 2,
            tension: 0.1,
            hidden: false 
        });
    }

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;

        // 改良版の分割関数を使って行を読み込む
        const row = splitCSVRow(lines[i].trim());
        
        if (row.length === headers.length) {
            labels.push(row[0].trim());
            for (let j = 1; j < row.length; j++) {
                // カンマやダブルクォーテーションを取り除いて純粋な数字にする
                const value = parseInt(row[j].replace(/[^0-9]/g, ''), 10);
                datasets[j - 1].data.push(isNaN(value) ? 0 : value);
            }
        }
    }

    // 直近12ヶ月分だけを残す
    const MAX_MONTHS = 12;
    if (labels.length > MAX_MONTHS) {
        labels = labels.slice(-MAX_MONTHS);
        datasets.forEach(dataset => {
            dataset.data = dataset.data.slice(-MAX_MONTHS);
        });
    }

    return { labels, datasets };
}

// グラフ描画
function drawChart(parsedData) {
    const ctx = document.getElementById('priceChart').getContext('2d');
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: parsedData.labels,
            datasets: parsedData.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: '価格 (円/㎥)' }
                }
            }
        }
    });
}

// 絞り込みボタン機能
function filterCategory(category) {
    if (!myChart) return;
    myChart.data.datasets.forEach((dataset) => {
        const label = dataset.label;
        let show = false;
        if (category === 'all') show = true;
        else if (category === 'gohan') show = label.includes('合板');
        else if (category === 'chip') show = label.includes('チップ');
        else if (category === 'seizai') show = !label.includes('合板') && !label.includes('チップ');
        
        dataset.hidden = !show; 
    });
    myChart.update();
}

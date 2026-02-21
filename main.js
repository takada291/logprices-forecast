let myChart = null; // グラフ全体を操作するための変数

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
});

// CSVとテキストファイルを両方読み込むメイン関数
async function loadDashboardData() {
    try {
        // 1. CSVデータの読み込みとグラフ描画
        const csvResponse = await fetch('data.csv');
        if (!csvResponse.ok) throw new Error('data.csvが見つかりません');
        const csvText = await csvResponse.text();
        
        const parsedData = parseCSV(csvText);
        drawChart(parsedData);

        // 2. AI予測テキスト（insight.txt）の読み込みと表示
        const txtResponse = await fetch('insight.txt');
        if (!txtResponse.ok) throw new Error('insight.txtが見つかりません');
        const insightText = await txtResponse.text();
        
        document.getElementById('prediction-text').innerText = insightText;

    } catch (error) {
        console.error("データの読み込みエラー:", error);
        document.getElementById('prediction-text').innerText = "データの読み込みに失敗しました。data.csv または insight.txt が存在するか確認してください。";
    }
}

// 簡単なCSVパーサー
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');

    const labels = [];
    const datasets = [];

    // データセットの箱を用意
    for (let i = 1; i < headers.length; i++) {
        datasets.push({
            label: headers[i].trim(),
            data: [],
            borderWidth: 2,
            tension: 0.1,
            hidden: false // 初期状態はすべて表示
        });
    }

    // データを格納
    for (let i = 1; i < lines.length; i++) {
        // 空行対策
        if (lines[i].trim() === '') continue;

        const row = lines[i].split(',');
        if (row.length === headers.length) {
            labels.push(row[0].trim());
            for (let j = 1; j < row.length; j++) {
                const value = parseInt(row[j].replace(/[^0-9]/g, ''), 10);
                datasets[j - 1].data.push(value);
            }
        }
    }

    return { labels, datasets };
}

// Chart.jsを使ったグラフ描画
function drawChart(parsedData) {
    const ctx = document.getElementById('priceChart').getContext('2d');

    // 既にグラフがあれば破棄して再描画
    if (myChart) {
        myChart.destroy();
    }

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

// ボタンを押したときの表示切り替え処理
function filterCategory(category) {
    if (!myChart) return;

    myChart.data.datasets.forEach((dataset) => {
        const label = dataset.label;
        let show = false;

        // カテゴリーに応じた表示判定
        if (category === 'all') {
            show = true;
        } else if (category === 'gohan') {
            show = label.includes('合板');
        } else if (category === 'chip') {
            show = label.includes('チップ');
        } else if (category === 'seizai') {
            show = !label.includes('合板') && !label.includes('チップ');
        }

        // hiddenプロパティを切り替えて表示/非表示をコントロール
        dataset.hidden = !show; 
    });

    myChart.update(); // 変更をグラフに反映
}

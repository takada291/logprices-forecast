// 画面が読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {
    loadDataAndDrawChart();
});

// CSVを読み込んでグラフを描画するメイン関数
async function loadDataAndDrawChart() {
    try {
        // 同じフォルダにある 'data.csv' を読み込む
        const response = await fetch('data.csv');
        const csvText = await response.text();

        // CSVテキストをパース（解析）する
        const parsedData = parseCSV(csvText);

        // グラフを描画する
        drawChart(parsedData);

    } catch (error) {
        console.error("データの読み込みに失敗しました:", error);
        alert("データの読み込みに失敗しました。ファイル名が data.csv になっているか確認してください。");
    }
}

// 簡単なCSVパーサー（カンマ区切りで配列に変換）
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(','); // 1行目はヘッダー（品目名）

    const labels = []; // X軸のラベル（年月）
    const datasets = []; // グラフのデータセット

    // ヘッダーの数（最初の「年月」列を除いた分）だけデータセットの箱を用意
    for (let i = 1; i < headers.length; i++) {
        datasets.push({
            label: headers[i].trim(),
            data: [],
            borderWidth: 2,
            tension: 0.1 // 線の滑らかさ
        });
    }

    // 2行目以降のデータをループ処理
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        if (row.length === headers.length) {
            labels.push(row[0].trim()); // 1列目は年月

            // 2列目以降は数値として各データセットに追加
            for (let j = 1; j < row.length; j++) {
                // カンマ等の余計な文字があれば取り除いて数値化
                const value = parseInt(row[j].replace(/[^0-9]/g, ''), 10);
                datasets[j - 1].data.push(value);
            }
        }
    }

    return { labels, datasets };
}

// Chart.jsを使って折れ線グラフを描画
function drawChart(parsedData) {
    const ctx = document.getElementById('priceChart').getContext('2d');

    new Chart(ctx, {
        type: 'line', // 折れ線グラフ
        data: {
            labels: parsedData.labels,
            datasets: parsedData.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top', // 凡例の位置
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: false, // 0から始めない（価格変動を見やすくするため）
                    title: {
                        display: true,
                        text: '価格 (円/㎥)'
                    }
                }
            }
        }
    });
}

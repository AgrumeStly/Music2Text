const sub = (s) => s.split('').map(c => ({'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉',':':':'}[c]||c)).join('');

function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
}

async function generateAll() {
    const query = document.getElementById('songInput').value;
    if(!query) return;

    const btn = document.getElementById('genBtn');
    btn.innerText = "搜索中...";
    
    try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`);
        const data = await res.json();
        if(!data.results.length) return alert("未找到歌曲");
        incrementGlobalCount(); 
        const track = data.results[0];
        const name = track.trackName;
        const artist = track.artistName;
        const durMs = track.trackTimeMillis;
        
        // 随机进度
        const ratio = 0.2 + Math.random() * 0.6; 
        const curMs = durMs * ratio;
        const curT = formatTime(curMs);
        const totT = formatTime(durMs);

        // 1. Classic Bar
        const dotPos = Math.floor(ratio * 25);
        let bar = "─".repeat(dotPos) + "⚪" + "─".repeat(25 - dotPos);
        document.getElementById('out1').innerText = `🎵 ${name} - ${artist}\n\n${bar}\n◄◄⠀▐▐ ⠀►►⠀ ${sub(curT)} / ${sub(totT)}⠀ ──○─`;

        // 2. Waveform Vibe
        const waves = ["|", "||", "|||", "||||", "၊", "။", "၊၊"];
        let randomWave = "";
        for(let i=0; i<15; i++) randomWave += waves[Math.floor(Math.random()*waves.length)];
        document.getElementById('out2').innerText = `${name}\n▶︎ ${randomWave} ${totT} ⋆.˚`;

        // 3. Minimalist
        const dotPosMini = Math.floor(ratio * 10)
        let barMini = "─".repeat(dotPosMini) + "●" + "─".repeat(10 - dotPosMini);
        document.getElementById('out3').innerText = `${name} － ${artist}\n${curT} ${barMini} ${totT}\n⇆ㅤ◁ㅤ ❚❚ㅤ ▷ㅤ ↻`;

        // 4. Retro Compact
        document.getElementById('out4').innerText = `vibe check: ${name}\n[${"■".repeat(dotPos/2)}${"□".repeat(12-dotPos/2)}] ${Math.floor(ratio*100)}%`;

    } catch (e) {
        alert("生成出错");
    } finally {
        btn.innerText = "生成样式";
    }
}

const songInput = document.getElementById('songInput');
const suggestionsBox = document.getElementById('suggestions');

// 1. 防抖函数：避免频繁触发请求
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// 2. 获取联想建议
async function fetchSuggestions(query) {
    if (query.length < 2) {
        suggestionsBox.classList.add('suggestions-hidden');
        return;
    }

    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`);
        const data = await response.json();
        
        renderSuggestions(data.results);
    } catch (err) {
        console.error("Suggestions fetch failed", err);
    }
}

// 3. 渲染联想列表
function renderSuggestions(results) {
    if (results.length === 0) {
        suggestionsBox.classList.add('suggestions-hidden');
        return;
    }

    suggestionsBox.innerHTML = '';
    results.forEach(track => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `
            <img src="${track.artworkUrl30}" alt="cover">
            <div class="song-info">
                <span class="song-name">${track.trackName}</span>
                <span class="artist-name">${track.artistName}</span>
            </div>
        `;
        // 点击建议项：填入输入框并直接生成结果
        div.onclick = () => {
            songInput.value = `${track.trackName} ${track.artistName}`;
            suggestionsBox.classList.add('suggestions-hidden');
            // 复用之前的生成逻辑，但直接传入这个 track 对象
            const ratio = 0.2 + Math.random() * 0.6;
            // updateStyles(track.trackName, track.artistName, ratio, formatTime(track.trackTimeMillis * ratio), formatTime(track.trackTimeMillis));
        };
        suggestionsBox.appendChild(div);
    });

    suggestionsBox.classList.remove('suggestions-hidden');
}

// 4. 事件绑定
songInput.addEventListener('input', debounce((e) => {
    fetchSuggestions(e.target.value.trim());
}, 300));

// 点击页面其他地方关闭建议框
document.addEventListener('click', (e) => {
    if (e.target !== songInput) {
        suggestionsBox.classList.add('suggestions-hidden');
    }
});

// 保持原本的“生成”按钮逻辑
document.getElementById('genBtn').addEventListener('click', generateAll);


function copyText(id) {
    const text = document.getElementById(id).innerText;
    navigator.clipboard.writeText(text);
    const btn = event.target;
    btn.innerText = "已复制！";
    setTimeout(() => btn.innerText = "复制样式", 1500);
}


let DATA = [];
let SUMMARY = {};
let currentView = "list";

// API
const API_URL = window.location.origin;

async function load() {
    if (currentView !== "list") return;

    try {
        const res = await fetch(API_URL + "/dashboard");
        const json = await res.json();

        DATA = json.items || [];
        SUMMARY = json.summary || {};

        fillKPI();
        fillFilters();
        renderProblems();
        render(DATA);

    } catch (e) {
        console.log("Ошибка загрузки", e);
    }
}

/* KPI */
function fillKPI() {
    document.getElementById("kpiTotal").innerText = SUMMARY.total || 0;
    document.getElementById("kpiClosed").innerText = SUMMARY.closed || 0;
    document.getElementById("kpiProgress").innerText = SUMMARY.in_progress || 0;
    document.getElementById("kpiOverdue").innerText = SUMMARY.overdue || 0;
}

/* ФИЛЬТРЫ */
function fillFilters() {
    const acc = [...new Set(DATA.map(i => i.accountant).filter(Boolean))];
    const tm = [...new Set(DATA.map(i => i.tm).filter(Boolean))];

    fillSelect("filterAccountant", acc);
    fillSelect("filterTM", tm);
    fillSelect("filterStatus", ["closed", "in_progress", "overdue"]);

    document.getElementById("filterType").innerHTML = `
        <option value="">Все</option>
        <option value="shop">Магазин</option>
        <option value="bar">Бар</option>
    `;
}

function fillSelect(id, values) {
    const el = document.getElementById(id);
    el.innerHTML = '<option value="">Все</option>';

    values.forEach(v => {
        const o = document.createElement("option");
        o.value = v;
        o.textContent = v;
        el.appendChild(o);
    });

    el.onchange = applyFilters;
}

/* ФИЛЬТР */
function applyFilters() {
    let filtered = DATA;

    const acc = document.getElementById("filterAccountant").value;
    const tm = document.getElementById("filterTM").value;
    const st = document.getElementById("filterStatus").value;
    const type = document.getElementById("filterType").value;

    if (type) filtered = filtered.filter(i => i.type === type);
    if (acc) filtered = filtered.filter(i => i.accountant === acc);
    if (tm) filtered = filtered.filter(i => i.tm === tm);
    if (st) filtered = filtered.filter(i => i.status === st);

    render(filtered);
}

/* 💰 ФОРМАТ ДЕНЕГ */
function formatMoney(num) {
    if (!num) return "0";
    return Number(num).toLocaleString("ru-RU");
}

/* 🚀 ГЛАВНЫЙ ЭКРАН (ПЕРЕДЕЛАН) */
function render(list) {
    const container = document.getElementById("list");
    container.innerHTML = "";

    list.forEach(item => {
        const div = document.createElement("div");
        div.className = "card";

        const statusColor =
            item.status === "closed" ? "#22c55e" :
            item.status === "overdue" ? "#ef4444" :
            "#f59e0b";

        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                
                <div>
                    <div style="font-size:16px;font-weight:600;">
                        ${item.branch}
                    </div>

                    <div style="margin-top:4px;color:${statusColor};font-size:13px;">
                        ● ${item.status_raw || item.status}
                    </div>

                    <div style="margin-top:6px;font-size:12px;color:#94a3b8;">
                        ${item.accountant || "-"} / ${item.tm || "-"}
                    </div>
                </div>

                <div style="text-align:right;">
                    <div style="font-size:16px;font-weight:bold;color:#38bdf8;">
                        ${formatMoney(item.total)}
                    </div>

                    <button style="margin-top:6px"
                        onclick='openDetails(${JSON.stringify(item)})'>
                        Открыть →
                    </button>
                </div>

            </div>
        `;

        container.appendChild(div);
    });
}

/* 🔥 ДЕТАЛИ */
function openDetails(item) {
    currentView = "details";

    const container = document.getElementById("list");

    let html = `<button onclick="goBack()">← Назад</button>`;
    html += `<h3>${item.branch}</h3>`;

    if (!item.excel_html) {
        html += "<p>Нет данных</p>";
    } else {
        html += `
            <input 
                type="text" 
                id="excelSearch" 
                placeholder="🔍 Поиск..." 
                style="margin-bottom:10px;padding:6px;border-radius:6px;border:none;width:100%;"
                onkeyup="filterExcelTable()"
            />
            <div id="excelTable">${item.excel_html}</div>
        `;
    }

    container.innerHTML = html;

    setTimeout(enableCellClick, 100);
}

/* 🔙 НАЗАД */
function goBack() {
    currentView = "list";
    load();
}

/* 🔍 ПОИСК */
function filterExcelTable() {
    const input = document.getElementById("excelSearch").value.toLowerCase();
    const rows = document.querySelectorAll("#excelTable table tr");

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(input) ? "" : "none";
    });
}

/* 🟦 КЛИК ПО ЯЧЕЙКЕ */
function enableCellClick() {
    const cells = document.querySelectorAll("#excelTable td");

    cells.forEach(cell => {
        cell.onclick = () => {
            document.querySelectorAll("#excelTable td").forEach(c => c.style.outline = "none");
            cell.style.outline = "2px solid #3b82f6";
        };
    });
}

/* ПРОБЛЕМЫ */
function renderProblems() {
    const problems = DATA.filter(i => i.is_overdue);
    const container = document.getElementById("problems");

    if (!problems.length) {
        container.innerHTML = "Нет проблем 🎉";
        return;
    }

    container.innerHTML = problems.map(p =>
        `<div class="card red">${p.branch}</div>`
    ).join("");
}

/* автообновление */
setInterval(load, 30000);
load();

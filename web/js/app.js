let DATA = [];
let SUMMARY = {};

// API
const API_URL = window.location.origin;

async function load() {
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

/* СПИСОК */
function render(list) {
    const container = document.getElementById("list");
    container.innerHTML = "";

    list.forEach(item => {
        const div = document.createElement("div");
        div.className = "card";

        div.onclick = () => openDetails(item);

        div.innerHTML = `
            <div><b>${item.branch}</b></div>
            <div class="status ${item.status}">
                ${item.status_raw || item.status}
            </div>
            <div style="font-size:12px;color:#94a3b8">
                ${item.accountant || "-"} / ${item.tm || "-"}
            </div>
        `;

        container.appendChild(div);
    });
}

/* 🔥 НОВАЯ ВЕРСИЯ — БЕЗ /excel */
function openDetails(item) {
    const container = document.getElementById("list");

    let html = `<button onclick="load()">← Назад</button>`;
    html += `<h3>${item.branch}</h3>`;

    if (!item.excel_html) {
        html += "<p>Нет данных</p>";
    } else {
        html += `<div id="excelTable">${item.excel_html}</div>`;
    }

    container.innerHTML = html;
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

let DATA = [];
let SUMMARY = [];
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

/* 🚀 СПИСОК ФИЛИАЛОВ */
function render(list) {
    const container = document.getElementById("list");
    container.innerHTML = "";

    list.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                
                <div>
                    <div style="font-weight:600">${item.branch}</div>
                    <div style="font-size:12px;color:#94a3b8">
                        ${item.status_raw || ""}
                    </div>
                </div>

                <div style="display:flex;align-items:center;gap:10px;">
                    
                    <div style="font-weight:bold;color:#38bdf8">
                        ${formatMoney(item.total)}
                    </div>

                    <button onclick="openDetails(${index})">
                        →
                    </button>

                </div>
            </div>
        `;

        container.appendChild(div);
    });
}

/* 🔥 ОТКРЫТИЕ В МОДАЛКЕ */
function openDetails(index) {
    const item = DATA[index];

    const modal = document.getElementById("modal");
    const body = document.getElementById("modalBody");

    let html = `<h3>${item.branch}</h3>`;

    if (!item.excel_html) {
        html += "<p>Нет данных</p>";
    } else {
        html += `<div id="excelTable">${item.excel_html}</div>`;
    }

    body.innerHTML = html;

    // 💥 ЖЁСТКИЙ СТАРТ
    modal.classList.remove("hidden");
    modal.offsetHeight; // 🔥 форс рендер
    modal.classList.add("show");
}

    body.innerHTML = html;

    // 💥 АНИМАЦИЯ
    modal.classList.remove("hidden");

    setTimeout(() => {
        modal.classList.add("show");
    }, 10);
}

/* 🔙 ЗАКРЫТИЕ */
function closeModal() {
    const modal = document.getElementById("modal");

    modal.classList.remove("show");

    setTimeout(() => {
        modal.classList.add("hidden");
        currentView = "list";
    }, 250);
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

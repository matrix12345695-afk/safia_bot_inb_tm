let DATA = [];
let SUMMARY = [];

async function load() {
    try {
        const res = await fetch(window.location.origin + "/dashboard");
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

// KPI
function fillKPI() {
    document.getElementById("kpiTotal").innerText = SUMMARY.total || 0;
    document.getElementById("kpiClosed").innerText = SUMMARY.closed || 0;
    document.getElementById("kpiProgress").innerText = SUMMARY.in_progress || 0;
    document.getElementById("kpiOverdue").innerText = SUMMARY.overdue || 0;
}

// ФИЛЬТРЫ
function fillFilters() {
    const acc = [...new Set(DATA.map(i => i.accountant).filter(Boolean))];
    const tm = [...new Set(DATA.map(i => i.tm).filter(Boolean))];

    fillSelect("filterAccountant", acc);
    fillSelect("filterTM", tm);
    fillSelect("filterStatus", ["closed", "in_progress", "overdue"]);

    document.getElementById("filterType").onchange = applyFilters;
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

function applyFilters() {
    let filtered = DATA;

    const acc = document.getElementById("filterAccountant").value;
    const tm = document.getElementById("filterTM").value;
    const st = document.getElementById("filterStatus").value;
    const type = document.getElementById("filterType").value;

    if (type === "shop") {
        filtered = filtered.filter(i => i.type === "shop");
    }

    if (type === "bar") {
        filtered = filtered.filter(i => i.type === "bar");
    }

    if (acc) filtered = filtered.filter(i => i.accountant === acc);
    if (tm) filtered = filtered.filter(i => i.tm === tm);
    if (st) filtered = filtered.filter(i => i.status === st);

    render(filtered);
}

// СПИСОК
function render(list) {
    const container = document.getElementById("list");
    container.innerHTML = "";

    list.forEach(item => {
        const div = document.createElement("div");
        div.className = "card";

        div.onclick = () => openDetails(item);

        div.innerHTML = `
            <b>${item.branch}</b><br>
            ${item.status_raw || item.status}<br>
            ${item.accountant || "-"} / ${item.tm || "-"}
        `;

        container.appendChild(div);
    });
}

// ДЕТАЛКА (как Excel)
function openDetails(item) {
    const container = document.getElementById("list");

    if (!item.details || !item.details.length) {
        container.innerHTML = `
            <button onclick="load()">⬅ Назад</button>
            <p>Нет детальных данных</p>
        `;
        return;
    }

    let html = `<button onclick="load()">⬅ Назад</button>`;
    html += `<h3>${item.branch}</h3>`;

    html += `<table border="1" style="width:100%; font-size:12px;">
        <tr>
            <th>Название</th>
            <th>Кол-во</th>
            <th>Цена</th>
            <th>Сумма</th>
        </tr>`;

    item.details.forEach(row => {
        html += `
        <tr>
            <td>${row.name}</td>
            <td>${row.qty}</td>
            <td>${row.price}</td>
            <td>${row.sum}</td>
        </tr>`;
    });

    html += `</table>`;

    container.innerHTML = html;
}

// ПРОБЛЕМЫ
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

// автообновление
setInterval(load, 30000);

load();

let DATA = [];
let SUMMARY = {};

async function load() {
    try {
        const res = await fetch("/dashboard");
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

function fillKPI() {
    document.getElementById("kpiTotal").innerText = SUMMARY.total || 0;
    document.getElementById("kpiClosed").innerText = SUMMARY.closed || 0;
    document.getElementById("kpiProgress").innerText = SUMMARY.in_progress || 0;
    document.getElementById("kpiOverdue").innerText = SUMMARY.overdue || 0;
}

// ?? автообновление
setInterval(load, 30000);

load();
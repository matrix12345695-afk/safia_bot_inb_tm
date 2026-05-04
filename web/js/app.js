<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Inventory Dashboard PRO</title>

<script src="https://telegram.org/js/telegram-web-app.js"></script>

<!-- ✅ ДОБАВИЛ -->
<script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>

<link rel="stylesheet" href="/web/css/styles.css">
</head>

<body>

<script>
if (window.Telegram?.WebApp) {
    Telegram.WebApp.expand();
}
</script>

<h2>📊 Инвентаризация</h2>

<div class="kpi">
    <div class="kpi-card">Всего<br><span id="kpiTotal">0</span></div>
    <div class="kpi-card green">Закрыто<br><span id="kpiClosed">0</span></div>
    <div class="kpi-card yellow">В работе<br><span id="kpiProgress">0</span></div>
    <div class="kpi-card red">Просрочено<br><span id="kpiOverdue">0</span></div>
</div>

<div class="filters">

    <div class="filter-block">
        <label>Подразделение</label>
        <select id="filterType">
            <option value="">Все</option>
            <option value="shop">Магазин</option>
            <option value="bar">Бар</option>
        </select>
    </div>

    <div class="filter-block">
        <label>Бухгалтер</label>
        <select id="filterAccountant"></select>
    </div>

    <div class="filter-block">
        <label>ТМ</label>
        <select id="filterTM"></select>
    </div>

    <div class="filter-block">
        <label>Статус</label>
        <select id="filterStatus"></select>
    </div>

</div>

<h3>🔥 Проблемы</h3>
<div id="problems"></div>

<h3>📋 Все филиалы</h3>
<div id="list"></div>

<script src="/web/js/app.js"></script>

</body>
</html>

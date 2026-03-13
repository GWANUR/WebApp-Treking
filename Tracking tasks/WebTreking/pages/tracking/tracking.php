<?php
require_once 'traking_helper.php';

$folderIndex = $_GET['folderIndex'] ?? 1;
$folderName = getFolderName($folderIndex);
$theme = getSettings('theme') ?? 'dark';
?>

<!DOCTYPE html>
<html lang="en" data-theme="<?= htmlspecialchars($theme) ?>">
<head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <link rel="stylesheet" href="tracking.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">
    <title>Tracking "<?= htmlspecialchars($folderName) ?>"</title>
</head>

<body>
    <header>
        <div class="container">
            <span class="title">Tracking "<?= htmlspecialchars($folderName) ?>"</span>
            <button><i class="bi bi-x-circle" onclick="window.close()"></i></button>
        </div>
    </header>
    <main>
        <div class="tracking_function">
            <nav>
                <li></li>
                <li><button onclick="timer()"><i class="bi bi-stopwatch-fill"></i><span>Timer</span></button></li>
                <li><button onclick="timeReport()"><i class="bi bi-clock-fill"></i><span>Time Report</span></button></li>
            </nav>
        </div>
        <div class="container">
            <div id="tasks_container">
                <div class="tasks_items">
                </div>
            </div>
            <div class="stat_tasks">
                <div class="around_graph_container">
                    <div class="around_graph">
                        <div id="graph"></div>
                        <div id="graph-status"><span class="procent">0</span> %</div>
                    </div>
                    <div class="stats">
                        <span class="stat_title">Total tasks</span>
                        <div class="stat">
                            <span class="stat_value" id="total_tasks">0</span>/<span class="ready_stat_value">0</span>
                    </div>
                </div>
            </div>
        </div>
            <div class="task-window-footer">
                <button class="addTask" onclick="addTask(<?= htmlspecialchars($folderIndex - 1)?>)"><i class="bi bi-plus-circle-fill"></i></button>
            </div>
    </main>
    <div id="reminder_container">
        <div class="reminder_button">
            <button onclick="openAllReminder('open')" class="all_reminder">
                <i class="bi bi-bell-fill"></i>
            </button>
        </div>
        <div class="reminder_window">
            
        </div>

    </div>
</body>
<script src="tracking.js"></script>
<script src="../../src/components/castomAlert/castomAlert.js"></script>
<script>
    loadTasks((<?= htmlspecialchars($folderIndex)?> - 1));
</script>
</html>



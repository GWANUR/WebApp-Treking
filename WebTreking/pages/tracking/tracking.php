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

</body>
</html>
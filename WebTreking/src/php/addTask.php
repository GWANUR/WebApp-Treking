<?php
header('Content-Type: application/json');

$file = '../data/treking.JSON';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$folderIndex = $data['folderIndex'] ?? null;
$taskName = trim($data['taskName'] ?? '');

if ($folderIndex === null || $taskName === '') {
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit;
}

if (!file_exists($file)) {
    echo json_encode(['success' => false, 'message' => 'JSON file not found']);
    exit;
}

$json = json_decode(file_get_contents($file), true);

if (!isset($json['FOLDER'][$folderIndex])) {
    echo json_encode(['success' => false, 'message' => 'Folder not found']);
    exit;
}

$tasks = $json['FOLDER'][$folderIndex]['tasks'] ?? [];

# Проверка на дубликаты
foreach ($tasks as $task) {
    if (mb_strtolower(trim($task['Name'])) === mb_strtolower($taskName)) {
        echo json_encode([
            'success' => false,
            'message' => 'Task with this name already exists'
        ]);
        exit;
    }
}

$newTask = [
    "Name" => $taskName,
    "status" => false
];

$json['FOLDER'][$folderIndex]['tasks'][] = $newTask;

file_put_contents(
    $file,
    json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
);

echo json_encode(['success' => true]);
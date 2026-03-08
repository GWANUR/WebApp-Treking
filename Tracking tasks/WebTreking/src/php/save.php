<?php
header('Content-Type: application/json');

// Получаем данные из запроса
$data = json_decode(file_get_contents("php://input"), true);

// Проверка входных данных
if (!isset($data['name']) || !trim($data['name'])) {
    echo json_encode(['success' => false, 'error' => 'Folder name cannot be empty']);
    
    exit;
}

$newname = trim($data['name']);

// Путь к JSON файлу
$file = __DIR__ . '/../data/treking.JSON';

// Читаем существующие данные
$jsonData = json_decode(file_get_contents($file), true);

// Проверяем уникальность имени
$existingnames = array_map(fn($folder) => $folder['name'], $jsonData['FOLDER'] ?? []);

if (in_array($newname, $existingnames)) {
    echo json_encode(['success' => false, 'error' => 'Folder name already exists']);
    exit;
}

// Добавляем новую папку
$jsonData['FOLDER'][] = [
    'name' => $newname,
    'date' => date('Y-m-d H:i:s'),
    'tasks' => []
];

// Сохраняем обратно
file_put_contents($file, json_encode($jsonData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode(['success' => true]);
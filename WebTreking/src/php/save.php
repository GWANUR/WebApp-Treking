<?php
header('Content-Type: application/json');

// Получаем данные из запроса
$data = json_decode(file_get_contents("php://input"), true);

// Проверка входных данных
if (!isset($data['name']) || !trim($data['name'])) {
    echo json_encode(['success' => false, 'error' => 'Folder name cannot be empty']);
    
    exit;
}

$newName = trim($data['name']);

// Путь к JSON файлу
$file = __DIR__ . '/../data/treking.JSON';

// Читаем существующие данные
$jsonData = json_decode(file_get_contents($file), true);

// Проверяем уникальность имени
$existingNames = array_map(fn($folder) => $folder['Name'], $jsonData['FOLDER'] ?? []);

if (in_array($newName, $existingNames)) {
    echo json_encode(['success' => false, 'error' => 'Folder name already exists']);
    exit;
}

// Добавляем новую папку
$jsonData['FOLDER'][] = [
    'Name' => $newName,
    'tasks' => []
];

// Сохраняем обратно
file_put_contents($file, json_encode($jsonData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode(['success' => true]);
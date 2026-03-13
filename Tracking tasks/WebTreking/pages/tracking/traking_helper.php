<?php

define('TREKING_FILE', __DIR__ . '/../../src/data/treking.JSON');

function getFolderName($folderIndex) {
    $index = intval($folderIndex) - 1;

    if (!file_exists(TREKING_FILE)) {
        return null;
    }

    $json = json_decode(file_get_contents(TREKING_FILE), true);

    if (!isset($json['FOLDER'][$index])) {
        return null;
    }

    return $json['FOLDER'][$index]['name'] ?? "Unknown Folder";
}

function getSettings($key) {
    if (!file_exists(TREKING_FILE)) {
        return null;
    }

    $json = json_decode(file_get_contents(TREKING_FILE), true);

    return $json['SETTINGS'][$key] ?? null;
}

function deleteTask($folderIndex, $taskIndex) {

    if (!file_exists(TREKING_FILE)) {
        return ['success' => false];
    }

    $folder = intval($folderIndex);
    $json = json_decode(file_get_contents(TREKING_FILE), true);

    if (!isset($json['FOLDER'][$folder]['tasks']) || !is_array($json['FOLDER'][$folder]['tasks'])) {
        return ['success' => false];
    }

    unset($json['FOLDER'][$folder]['tasks'][$taskIndex]);

    $json['FOLDER'][$folder]['tasks'] = array_values($json['FOLDER'][$folder]['tasks']);

    file_put_contents(
        TREKING_FILE,
        json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    );

    return ['success' => true];
}

function addTask($folderIndex, $taskName) {

    if (!file_exists(TREKING_FILE)) {
        echo json_encode(['success' => false, 'message' => 'File not found']);
        exit;
    }

    $json = json_decode(file_get_contents(TREKING_FILE), true);

    if (!isset($json['FOLDER'][$folderIndex])) {
        echo json_encode(['success' => false, 'message' => 'Folder not found']);
        exit;
    }

    if (!isset($json['FOLDER'][$folderIndex]['tasks']) || !is_array($json['FOLDER'][$folderIndex]['tasks'])) {
        $json['FOLDER'][$folderIndex]['tasks'] = [];
    }

    foreach ($json['FOLDER'][$folderIndex]['tasks'] as $task) {
        if ($task['name'] === $taskName) {
            echo json_encode(['success' => false, 'message' => 'Task already exists']);
            exit;
        }
    }

    $json['FOLDER'][$folderIndex]['tasks'][] = [
        'name' => $taskName,
        'status' => false,
        'data' => false,
        'time' => false,
        'sound' => false
    ];

    file_put_contents(
            TREKING_FILE,
            json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE| JSON_UNESCAPED_SLASHES)
        );

    echo json_encode(['success' => true, 'message' => 'Task toggled']);
    exit;

    echo json_encode(['success' => true, 'message' => 'Task added']);
    exit;
}
function toggleTask($folderIndex, $taskIndex) {

    if (!file_exists(TREKING_FILE)) {
        echo json_encode(['success' => false, 'message' => 'File not found']);
        exit;
    }

    $json = json_decode(file_get_contents(TREKING_FILE), true);

    if (!isset($json['FOLDER'][$folderIndex]['tasks'][$taskIndex])) {
        echo json_encode(['success' => false, 'message' => 'Task not found']);
        exit;
    }

    $json['FOLDER'][$folderIndex]['tasks'][$taskIndex]['status'] =
        !$json['FOLDER'][$folderIndex]['tasks'][$taskIndex]['status'];

    file_put_contents(
        TREKING_FILE,
        json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    );

    echo json_encode(['success' => true, 'message' => 'Task toggled']);
    exit;
}
function renameTask($folderIndex, $taskIndex, $newName) {
    
    if (!file_exists(TREKING_FILE)) {
        echo json_encode(['success' => false, 'message' => 'File not found']);
        exit;
    }
    $json = json_decode(file_get_contents(TREKING_FILE), true);
    
    $json['FOLDER'][$folderIndex]['tasks'][$taskIndex]['name'] = $newName;

    file_put_contents(
        TREKING_FILE,
        json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    );

    echo json_encode(['success' => true, 'message' => 'Task toggled']);
    exit;
}
function addTaskReminder($folderIndex, $taskIndex, $date, $time, $sound = true){

    if (!file_exists(TREKING_FILE)) {
        return ['success' => false, 'message' => 'File not found'];
    }

    $json = json_decode(file_get_contents(TREKING_FILE), true);

    $reminder = $json['FOLDER'][$folderIndex]['tasks'][$taskIndex];

    // Проверка на повторение
    if (
        $reminder['data'] != false &&
        $reminder['time'] != false
    ) {
        return [
            "success" => false,
            "message" => "Reminder already exists"
        ];
    }

    // Добавление напоминания
    $json['FOLDER'][$folderIndex]['tasks'][$taskIndex]['data'] = $date;
    $json['FOLDER'][$folderIndex]['tasks'][$taskIndex]['time'] = $time;
    $json['FOLDER'][$folderIndex]['tasks'][$taskIndex]['sound'] = $sound;

    file_put_contents(
        TREKING_FILE,
        json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    );

    return [
        "success" => true,
    ];
}

function removeTaskReminder($folderIndex, $taskIndex) {
    if (!file_exists(TREKING_FILE)) {
        return ['success' => false, 'message' => 'File not found'];
    }

    $json = json_decode(file_get_contents(TREKING_FILE), true);
    
    $json['FOLDER'][$folderIndex]['tasks'][$taskIndex]['data'] = false;
    $json['FOLDER'][$folderIndex]['tasks'][$taskIndex]['time'] = false;
    $json['FOLDER'][$folderIndex]['tasks'][$taskIndex]['sound'] = false;

    file_put_contents(
        TREKING_FILE,
        json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    );

    return [
        "success" => true,
    ];
}






// Обработка запроса
if (isset($_GET['method']) && $_GET['method'] === 'addTask') {
    $folderIndex = $_GET['folderIndex'] ?? 0;
    $taskText = $_GET['taskText'] ?? '';

    $result = addTask($folderIndex, $taskText);
    
    echo json_encode($result);
    exit;
}
if (isset($_GET['method']) && $_GET['method'] === 'deleteTask') {
    $folderIndex = $_GET['folderIndex'] ?? 0;
    $taskIndex = $_GET['taskIndex'] ?? 0;

    $result = deleteTask($folderIndex, $taskIndex);

    echo json_encode($result);
    exit;
}
if (isset($_GET['method']) && $_GET['method'] === 'toggleTask') {
    $folderIndex = $_GET['folderIndex'] ?? 0;
    $taskIndex = $_GET['taskIndex'] ?? 0;

    $result = toggleTask($folderIndex, $taskIndex);

    echo json_encode($result);
    exit;
}
if (isset($_GET['method']) && $_GET['method'] === 'renameTask') {
    $folderIndex = $_GET['folderIndex'] ?? 0;
    $taskIndex = $_GET['taskIndex'] ?? 0;
    $taskText = $_GET['taskText'] ?? 0;

    $result = renameTask($folderIndex, $taskIndex, $taskText);

    echo json_encode($result);
    exit;
}
if (isset($_GET['method']) && $_GET['method'] === 'addTaskReminder') {

    header('Content-Type: application/json');

    $data = json_decode(file_get_contents('php://input'), true);

    $folderIndex = $data['folderId'] ?? 0;
    $taskIndex = $data['taskId'] ?? 0;
    $date = $data['data'] ?? '';
    $time = $data['time'] ?? '';

    $result = addTaskReminder($folderIndex, $taskIndex, $date, $time);

    echo json_encode($result);
    exit;
}
if (isset($_GET['method']) && $_GET['method'] === 'removeTaskReminder') {

    header('Content-Type: application/json');

    $data = json_decode(file_get_contents('php://input'), true);

    $folderIndex = $data['folderId'] ?? 0;
    $taskIndex = $data['taskId'] ?? 0;
    $result = removeTaskReminder($folderIndex, $taskIndex);

    echo json_encode($result);
    exit;
}
<?php

$data = json_decode(file_get_contents("php://input"), true);

$file = __DIR__ . '/../data/treking.JSON';

$jsonData = json_decode(file_get_contents($file), true);
$folderIndex = (int)$data['folderIndex'];
$taskIndex = (int)$data['taskIndex'];
$currentStatus = $jsonData['FOLDER'][$folderIndex - 1]['tasks'][$taskIndex]['status'] ?? false;

$jsonData['FOLDER'][$folderIndex - 1]['tasks'][$taskIndex]['status'] = !$currentStatus;

file_put_contents($file, json_encode($jsonData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));


echo json_encode(["success" => true]);
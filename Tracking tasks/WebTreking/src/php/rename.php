<?php

$data = json_decode(file_get_contents("php://input"), true);

$file = __DIR__ . '/../data/treking.JSON';
$jsonData = json_decode(file_get_contents($file), true);

$index = (int)$data['index'];
$newname = trim($data['newname']);

$jsonData['FOLDER'][$index - 1]['name'] = $newname;



// Сохраняем обратно
file_put_contents($file, json_encode($jsonData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode(["success" => true]);
<?php

function getFolderName($folderIndex) {

    $index = intval($folderIndex) - 1;
    $file = '../../src/data/treking.JSON';

    if (!file_exists($file)) {
        return null;
    }

    $json = json_decode(file_get_contents($file), true);

    if (!isset($json['FOLDER'][$index])) {
        return null;
    }

    return $json['FOLDER'][$index]['Name'] ?? "Unknown Folder";
}
function getSettings($key) {
    $file = '../../src/data/treking.JSON';

    if (!file_exists($file)) {
        return null;
    }

    $json = json_decode(file_get_contents($file), true);

    return $json['SETTINGS'][$key] ?? null;
}
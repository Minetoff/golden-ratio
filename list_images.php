<?php
function listDirectory($dir) {
    $files = [];
    if (is_dir($dir)) {
        if ($dh = opendir($dir)) {
            while (($file = readdir($dh)) !== false) {
                if ($file !== '.' && $file !== '..') {
                    $files[] = $file;
                }
            }
            closedir($dh);
        }
    }
    // Alphabetical sort by filename
    sort($files, SORT_NATURAL | SORT_FLAG_CASE);
    return $files;
}

$gold   = listDirectory('jewelry/Gold');
$silver = listDirectory('jewelry/Silver');
$stone  = listDirectory('jewelry/Stone');

header('Content-Type: application/json');
echo json_encode(['gold' => $gold, 'silver' => $silver, 'stone' => $stone]);

<?php
// Let's create a test PDF
file_put_contents('test.pdf', '%PDF-1.4 Mock');
// Now let's try to upload it
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/api/auth/login");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['username'=>'admin', 'password'=>'password']));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = curl_exec($ch);
$json = json_decode($res, true);
$token = $json['token'];

$ch2 = curl_init();
curl_setopt($ch2, CURLOPT_URL, "http://localhost:8000/api/documents");
curl_setopt($ch2, CURLOPT_POST, 1);
$cfile = new CURLFile('test.pdf', 'application/pdf', 'test.pdf');
$data = array('file' => $cfile, 'title' => 'CURL Test', 'description' => 'test', 'category_id' => '1', 'is_public' => '1');
curl_setopt($ch2, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'X-Auth-Token: ' . $token
]);
$upload_res = curl_exec($ch2);
$httpcode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
echo "HTTP: $httpcode\n";
echo "Response: $upload_res\n";

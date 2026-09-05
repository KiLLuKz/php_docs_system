<?php
require __DIR__ . '/vendor/autoload.php';

use Bramus\Router\Router;
use Dotenv\Dotenv;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

// Setup Router
$router = new Router();
$basePath = str_replace('/index.php', '', $_SERVER['SCRIPT_NAME']);
$router->setBasePath($basePath);

// CORS Middleware
$router->options('/.*', function() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    exit();
});

$router->before('GET|POST|PUT|DELETE', '/.*', function() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Content-Type: application/json; charset=utf-8');
});

// Define Routes
$router->mount('/api', function() use ($router) {
    
    // Auth Routes
    $router->post('/auth/login', 'App\\Controllers\\AuthController@login');
    $router->post('/auth/register', 'App\\Controllers\\AuthController@register');
    
    // Protected Routes
    $router->before('GET|POST|PUT|DELETE', '/auth/me', 'App\\Middleware\\Auth@check');
    $router->before('GET|POST|PUT|DELETE', '/documents', 'App\\Middleware\\Auth@check');
    $router->before('GET|POST|PUT|DELETE', '/documents/.*', 'App\\Middleware\\Auth@check');
    $router->before('GET|POST|PUT|DELETE', '/users', 'App\\Middleware\\Auth@check');
    
    $router->get('/auth/me', 'App\\Controllers\\AuthController@me');
    $router->get('/documents', 'App\\Controllers\\DocumentController@index');
    $router->post('/documents', 'App\\Controllers\\DocumentController@upload');
    $router->delete('/documents/(\d+)', 'App\\Controllers\\DocumentController@delete');
    $router->post('/documents/(\d+)/assign', 'App\\Controllers\\DocumentController@assign');
    $router->get('/documents/download/(\d+)', 'App\\Controllers\\DocumentController@download');
    
    $router->get('/users', 'App\\Controllers\\UserController@index');

});

// Custom 404
$router->set404(function() {
    header('HTTP/1.1 404 Not Found');
    echo json_encode(['status' => 'error', 'message' => 'API endpoint not found']);
});

$router->run();

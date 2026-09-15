<?php
require __DIR__ . '/vendor/autoload.php';

use Bramus\Router\Router;
use Dotenv\Dotenv;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

// Setup Router
$router = new Router();
$router->setBasePath(''); // Force empty base path so REQUEST_URI remains intact

// CORS Middleware
$router->options('/.*', function() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Auth-Token');
    exit();
});

$router->before('GET|POST|PUT|DELETE', '/.*', function() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Auth-Token');
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
    $router->before('GET|POST|PUT|DELETE', '/users/.*', 'App\\Middleware\\Auth@check');
    $router->before('GET|POST|PUT|DELETE', '/categories', 'App\\Middleware\\Auth@check');
    $router->before('GET|POST|PUT|DELETE', '/admin/categories', 'App\\Middleware\\Auth@check');
    $router->before('GET|POST|PUT|DELETE', '/admin/categories/.*', 'App\\Middleware\\Auth@check');
    $router->before('GET|POST|PUT|DELETE', '/admin/logs', 'App\\Middleware\\Auth@check');
    $router->before('GET|POST|PUT|DELETE', '/admin/dashboard-stats', 'App\\Middleware\\Auth@check');
    
    $router->get('/auth/me', 'App\\Controllers\\AuthController@me');
    $router->post('/auth/me', 'App\\Controllers\\AuthController@updateProfile');
    $router->get('/documents', 'App\\Controllers\\DocumentController@index');
    $router->post('/documents', 'App\\Controllers\\DocumentController@upload');
    $router->post('/documents/(\d+)', 'App\\Controllers\\DocumentController@update');
    $router->delete('/documents/(\d+)', 'App\\Controllers\\DocumentController@delete');
    $router->post('/documents/bulk-delete', 'App\\Controllers\\DocumentController@bulkDelete');
    $router->post('/documents/(\d+)/assign', 'App\\Controllers\\DocumentController@assign');
    $router->get('/documents/(\d+)/assigned-users', 'App\\Controllers\\DocumentController@assignedUsers');
    $router->post('/documents/(\d+)/sync-users', 'App\\Controllers\\DocumentController@syncUsers');
    $router->get('/documents/download/(\d+)', 'App\\Controllers\\DocumentController@download');
    $router->get('/documents/preview/(\d+)', 'App\\Controllers\\DocumentController@preview');
    $router->get('/admin/logs', 'App\\Controllers\\DocumentController@logs');
    $router->get('/admin/dashboard-stats', 'App\\Controllers\\AdminController@getDashboardStats');
    $router->delete('/admin/documents/bulk', 'App\\Controllers\\AdminController@bulkDeleteDocuments');
    
    $router->get('/categories', 'App\\Controllers\\CategoryController@index');
    $router->post('/admin/categories', 'App\\Controllers\\CategoryController@store');
    $router->put('/admin/categories/(\d+)', 'App\\Controllers\\CategoryController@update');
    $router->delete('/admin/categories/bulk', 'App\\Controllers\\CategoryController@bulkDelete');

    $router->get('/users', 'App\\Controllers\\UserController@index');
    $router->post('/users', 'App\\Controllers\\UserController@store');
    $router->put('/users/(\d+)', 'App\\Controllers\\UserController@update');
    $router->delete('/users/(\d+)', 'App\\Controllers\\UserController@delete');
    $router->post('/users/bulk-delete', 'App\\Controllers\\UserController@bulkDelete');

});

// Custom 404
$router->set404(function() {
    header('HTTP/1.1 404 Not Found');
    echo json_encode(['status' => 'error', 'message' => 'API endpoint not found']);
});

$router->run();

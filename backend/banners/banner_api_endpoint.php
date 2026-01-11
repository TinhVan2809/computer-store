<?php

    require_once './banner_class.php';
    
    
/**
 * Handle CORS (Cross-Origin Resource Sharing)
 * Allows requests from specified origins and methods
 */
function handleCORS() {
    // Define allowed origins
    $allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://localhost:80',
        'http://localhost:5174',
        'http://localhost:5175',
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    }

    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Max-Age: 86400');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

handleCORS();
header('Content-Type: application/json');


function sendJson($payload, int $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}
    try{
        $action = $_REQUEST['action'] ?? null;
        $action = is_string($action) ? trim(filter_var($action, FILTER_SANITIZE_FULL_SPECIAL_CHARS)) : null;

        if (!$action) {
            sendJson(['success' => false, 'message' => 'No action specified'], 400);
        }

        $banners = new Banner_class();

        switch($action) {
                case 'get' :
                  $data = $banners->getBanners();
                    sendJson([
                        'success' => true,
                        'data' => $data 
                    ]);
            break;  

            case 'add':
                if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                    sendJson(['success' => false, 'message' => 'Method not allowed'], 405);
                }

                if (!isset($_FILES['image'])) {
                    sendJson(['success' => false, 'message' => 'No image uploaded'], 400);
                }

                $result = $banners->addBanner($_FILES['image']);
                
                if ($result) {
                    sendJson(['success' => true, 'message' => 'Banner added successfully']);
                } else {
                    sendJson(['success' => false, 'message' => 'Failed to add banner'], 500);
                }
                break;

                case 'delete':
                    $banner_id = filter_input(INPUT_POST, 'banner_id', FILTER_VALIDATE_INT);

                    if(!$banner_id) {
                        sendJson(['success' => false, 'message' => 'Invalid banner Id'], 400);
                    }

                    $result = $banners->deleteImage($banner_id);

                    if($result) {
                        sendJson(['success' => true, 'message' => 'Delete image successfully']);
                    } else {
                        sendJson(['success' => false, 'message' => "Can't delete image"], 400);
                    }
                    break;
        } 

    } catch (PDOException $e) {
    error_log("General Error in product_api_endpoint.php: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine() . "\nStack trace:\n" . $e->getTraceAsString());
    sendJson(['success' => false, 'message' => 'An unexpected error occurred'], 500);
    }

?>
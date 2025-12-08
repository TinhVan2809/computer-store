<?php

require_once './manufacturer_class.php';

/**
 * Handle CORS (Cross-Origin Resource Sharing)
 */
function handleCORS() {
    $allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    }

    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

handleCORS();
header('Content-Type: application/json');

try {
    $action = $_REQUEST['action'] ?? null;
    $action = is_string($action) ? trim(filter_var($action, FILTER_SANITIZE_FULL_SPECIAL_CHARS)) : null;

    if (!$action) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No action specified']);
        exit();
    }

    $manufacturerObj = new Manufacturers_class();

    switch ($action) {
        case 'get_all':
            // Get paginated manufacturers
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

            $manufacturers = $manufacturerObj->getManufacturers($limit, $offset);
            $total = $manufacturerObj->getCountManufacturers();

            echo json_encode([
                'success' => true,
                'data' => $manufacturers,
                'total' => $total,
                'limit' => $limit,
                'offset' => $offset
            ]);
            break;

        case 'get_by_id':
            // Get single manufacturer
            $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
            
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Manufacturer ID required']);
                exit();
            }

            $manufacturer = $manufacturerObj->getManufacturerById($id);
            
            if ($manufacturer) {
                echo json_encode(['success' => true, 'data' => $manufacturer]);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Manufacturer not found']);
            }
            break;

        case 'add':
            // Add new manufacturer
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405);
                echo json_encode(['success' => false, 'message' => 'Method not allowed']);
                exit();
            }

            $name = $_POST['name'] ?? '';
            $url = $_POST['url'] ?? '';
            $description = $_POST['description'] ?? '';
            $logoFile = $_FILES['logo'] ?? null;

            if (empty($name)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Manufacturer name required']);
                exit();
            }

            $result = $manufacturerObj->addManufacturer($name, $url, $description, $logoFile);

            if ($result) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Manufacturer added successfully',
                    'manufacturer_id' => $result
                ]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Failed to add manufacturer']);
            }
            break;

        case 'update':
            // Update manufacturer
            if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
                http_response_code(405);
                echo json_encode(['success' => false, 'message' => 'Method not allowed']);
                exit();
            }

            $id = $_POST['id'] ?? $_GET['id'] ?? null;
            $name = $_POST['name'] ?? '';
            $url = $_POST['url'] ?? '';
            $description = $_POST['description'] ?? '';
            $logoFile = $_FILES['logo'] ?? null;

            if (!$id || empty($name)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Manufacturer ID and name required']);
                exit();
            }

            $result = $manufacturerObj->updateManufacturer($id, $name, $url, $description, $logoFile);

            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Manufacturer updated successfully']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Failed to update manufacturer']);
            }
            break;

        case 'delete':
            // Delete manufacturer
            if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
                http_response_code(405);
                echo json_encode(['success' => false, 'message' => 'Method not allowed']);
                exit();
            }

            $id = $_POST['id'] ?? $_GET['id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Manufacturer ID required']);
                exit();
            }

            $result = $manufacturerObj->deleteManufacturer($id);

            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Manufacturer deleted successfully']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Failed to delete manufacturer']);
            }
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            break;
    }

} catch (Exception $e) {
    error_log('General Error in manufacturer_api_endpoint.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An unexpected error occurred']);
}

?>

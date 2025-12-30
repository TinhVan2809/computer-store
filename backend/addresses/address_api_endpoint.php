<?php

require_once './address_class.php';

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
        'http://localhost:5175',
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
function sendJson($payload, int $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

try{
    $action = $_REQUEST['action'] ?? null;
        $action = is_string($action) ? trim(filter_var($action, FILTER_SANITIZE_FULL_SPECIAL_CHARS)) : null;

        if(!$action) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No action specified']);
            exit();
        }

        $addresses = new Address_class();


        switch($action) {

            case 'get':
                $page = filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT, ['options' => ['default' => 1, 'min_range' => 1]]) ?: 1;
                $limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT, ['options' => ['default' => 100, 'min_range' => 1]]) ?: 100;

                $user_id = null;
                    if (isset($_GET['user_id'])) {
                        $user_id = filter_input(INPUT_GET, 'user_id', FILTER_VALIDATE_INT);
                    } elseif (isset($_POST['user_id'])) {
                        $user_id = filter_input(INPUT_POST, 'user_id', FILTER_VALIDATE_INT);
                    } elseif (session_status() === PHP_SESSION_ACTIVE && !empty($_SESSION['user_id'])) {
                        $user_id = (int) $_SESSION['user_id'];
                    }

                    if (!$user_id) {
                        sendJson(['success' => false, 'message' => 'User ID required'], 400);
                    }

                $offset = ($page - 1) * $limit;
                $totalItems = (int)$addresses->getCountAddresses($user_id);
                $totalPages = $limit > 0 ? (int)ceil($totalItems / $limit) : 1;
                $data = $addresses->getAddressesByUser($user_id,$limit, $offset);

                sendJson([
                    'success' => true,
                    'data' => $data,
                    'total_items' => $totalItems,
                    'total_pages' => $totalPages,
                    'current_page' => $page,
                    'limit' => $limit
                ]);
            break;

            case 'add':
                $user_id = null;
                if (isset($_GET['user_id'])) {
                    $user_id = filter_input(INPUT_GET, 'user_id', FILTER_VALIDATE_INT);
                } elseif (isset($_POST['user_id'])) {
                    $user_id = filter_input(INPUT_POST, 'user_id', FILTER_VALIDATE_INT);
                } elseif (session_status() === PHP_SESSION_ACTIVE && !empty($_SESSION['user_id'])) {
                    $user_id = (int) $_SESSION['user_id'];
                }

                if (!$user_id) {
                    sendJson(['success' => false, 'message' => 'User ID required'], 400);
                }

                $data = json_decode(file_get_contents('php://input'), true);

                $required_fields = ['recipient_name', 'phone', 'province_id', 'province_name', 'district_id', 'district_name', 'ward_id', 'ward_name', 'specific_address', 'label'];
                foreach ($required_fields as $field) {
                    if (empty($data[$field])) {
                        sendJson(['success' => false, 'message' => "Missing required field: $field"], 400);
                    }
                }

                $address_data = [
                    'user_id' => $user_id,
                    'recipient_name' => $data['recipient_name'],
                    'phone' => $data['phone'],
                    'province_id' => $data['province_id'],
                    'province_name' => $data['province_name'],
                    'district_id' => $data['district_id'],
                    'district_name' => $data['district_name'],
                    'ward_id' => $data['ward_id'],
                    'ward_name' => $data['ward_name'],
                    'specific_address' => $data['specific_address'],
                    'is_default' => $data['is_default'] ?? 0,
                    'label' => $data['label']
                ];

                $new_address_id = $addresses->add_address($address_data);

                if ($new_address_id) {
                    sendJson(['success' => true, 'message' => 'Address added successfully', 'address_id' => $new_address_id]);
                } else {
                    sendJson(['success' => false, 'message' => 'Failed to add address'], 500);
                }
            break;


             default:
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
                break;
        }


} catch(PDOException $e) {
       error_log('General Error in categories_api_endpoint.php: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'An unexpected error occurred']);
}

?>
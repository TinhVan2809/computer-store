<?php


/**
 * Handle CORS (Cross-Origin Resource Sharing)
 * Allows requests from specified origins and methods
 */
function handleCORS()
{
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

require_once './review_class.php';


function sendJson($payload, int $status = 200)
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}
try {

    $action = $_REQUEST['action'] ?? null;
    $action = is_string($action) ? trim(filter_var($action, FILTER_SANITIZE_FULL_SPECIAL_CHARS)) : null;

    if (!$action) {
        sendJson(['success' => false, 'message' => 'No action specified'], 400);
    }

    $reviews = new Review_class();

    switch ($action) {

        case 'get':
            $page = filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT, ['options' => ['default' => 1, 'min_range' => 1]]) ?: 1;
            $limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT, ['options' => ['default' => 10, 'min_range' => 1]]) ?: 10;

            $product_id = null;
            if (isset($_GET['product_id'])) {
                $product_id = filter_input(INPUT_GET, 'product_id', FILTER_VALIDATE_INT);
            } elseif (isset($_POST['product_id'])) {
                $product_id = filter_input(INPUT_POST, 'product_id', FILTER_VALIDATE_INT);
            } elseif (session_status() === PHP_SESSION_ACTIVE && !empty($_SESSION['product_id'])) {
                $product_id = (int) $_SESSION['product_id'];
            }

            if (!$product_id) {
                sendJson(['success' => false, 'message' => 'Product ID required'], 400);
            }
            $offset = ($page - 1) * $limit;
            $totalItems =  $reviews->countReviewsByProduct($product_id);
            $totalPages = ceil($totalItems / $limit);
            $data =  $reviews->getAllReviewsByProduct($product_id, $limit, $offset);

            sendJson([
                'success' => true,
                'data' => $data,
                'total_items' => $totalItems,
                'total_pages' => $totalPages,
                'current_page' => $page,
                'limit' => $limit
            ]);
            break;


            case 'delete':
                $vote_id = filter_input(INPUT_POST, 'vote_id', FILTER_VALIDATE_INT);
                
                if (!$vote_id) {
                    sendJson(['success' => false, 'message' => 'Invalid review ID'], 400);
                }

                $result = $reviews->deleteReview($vote_id);
                
                if ($result) {
                    sendJson(['success' => true, 'message' => 'Xóa review thành công']);
                } else {
                    sendJson(['success' => false, 'message' => 'Không thể xóa review'], 400);
                }
            break;

        default:
            sendJson(['success' => false, 'message' => 'Invalid action: ' . htmlspecialchars($action)], 400);
            break;
    }
} catch (PDOException $e) {
    error_log("General Error in product_api_endpoint.php: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine() . "\nStack trace:\n" . $e->getTraceAsString());
    sendJson(['success' => false, 'message' => 'An unexpected error occurred'], 500);
}

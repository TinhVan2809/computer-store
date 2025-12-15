<?php

require_once './cart_class.php';

/**
 * Handle CORS (Cross-Origin Resource Sharing)
 */
function handleCORS()
{
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

function sendJson($payload, int $status = 200)
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

header('Content-Type: application/json');


try {
    $action = $_REQUEST['action'] ?? null;
    $action = is_string($action) ? trim(filter_var($action, FILTER_SANITIZE_FULL_SPECIAL_CHARS)) : null;

    if (!$action) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No action specified']);
        exit();
    }

    $cartsObj = new cart_class();

    switch ($action) {
        // Get cart by user
        case 'get':
            $page = filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT, ['options' => ['default' => 1, 'min_range' => 1]]) ?: 1;
            $limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT, ['options' => ['default' => 50, 'min_range' => 1]]) ?: 50;
            // Determine user_id: prefer GET/POST parameter, fallback to session if available
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
            $totalItems = $cartsObj->getCountCart($user_id);
            $totalPages = ceil($totalItems / $limit);
            $data = $cartsObj->getCartByUser($user_id, $limit, $offset);

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
            
                // Ensure it's a POST request for adding
                if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                    sendJson(['success' => false, 'message' => 'Invalid request method. Only POST is allowed for adding to cart.'], 405);
                }

                // Read JSON input from request body
                $input = json_decode(file_get_contents('php://input'), true);
                $user_id = $input['user_id'] ?? null;
                $product_id = $input['product_id'] ?? null;

                // Validate inputs
                if (!$user_id || !$product_id) {
                    sendJson(['success' => false, 'message' => 'User ID and Product ID are required.'], 400);
                }

                $user_id = filter_var($user_id, FILTER_VALIDATE_INT);
                $product_id = filter_var($product_id, FILTER_VALIDATE_INT);

                if ($user_id === false || $product_id === false) {
                    sendJson(['success' => false, 'message' => 'Invalid User ID or Product ID.'], 400);
                }

                if ($cartsObj->addToCart($user_id, $product_id)) {
                    sendJson(['success' => true, 'message' => 'Product added to cart successfully.']);
                } else {
                    sendJson(['success' => false, 'message' => 'Failed to add product to cart.'], 500);
                } 
           
            break;

        case 'update_quantity':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendJson(['success' => false, 'message' => 'Invalid request method.'], 405);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $cart_id = $input['cart_id'] ?? null;
            $quantity = $input['quantity'] ?? null;

            if ($cart_id === null || $quantity === null) {
                sendJson(['success' => false, 'message' => 'Cart ID and quantity are required.'], 400);
            }

            $cart_id = filter_var($cart_id, FILTER_VALIDATE_INT);
            $quantity = filter_var($quantity, FILTER_VALIDATE_INT);

            if ($cart_id === false || $quantity === false) {
                sendJson(['success' => false, 'message' => 'Invalid Cart ID or quantity.'], 400);
            }

            if ($cartsObj->updateCartQuantity($cart_id, $quantity)) {
                sendJson(['success' => true, 'message' => 'Cart quantity updated successfully.']);
            } else {
                sendJson(['success' => false, 'message' => 'Failed to update cart quantity.'], 500);
            }
            break;

        case 'delete':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendJson(['success' => false, 'message' => 'Invalid request method.'], 405);
            }

            $input = json_decode(file_get_contents('php://input'), true);
            $cart_id = $input['cart_id'] ?? null;

            if (!$cart_id) {
                sendJson(['success' => false, 'message' => 'Cart ID is required.'], 400);
            }

            $cart_id = filter_var($cart_id, FILTER_VALIDATE_INT);
            if ($cart_id === false) {
                sendJson(['success' => false, 'message' => 'Invalid Cart ID.'], 400);
            }

            if ($cartsObj->deleteCartById($cart_id)) {
                sendJson(['success' => true, 'message' => 'Item removed from cart successfully.']);
            } else {
                sendJson(['success' => false, 'message' => 'Failed to remove item from cart.'], 500);
            }
            break;

        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            break;
    }
} catch (PDOException $e) {
    error_log('General Error in Cart_api_endpoint.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An unexpected error occurred']);
}

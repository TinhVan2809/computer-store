<?php
    require_once './similar_class.php';

/**
 * Handle CORS (Cross-Origin Resource Sharing)
 * Allows requests from specified origins and methods
 */
function handleCORS() {
    // Define allowed origins (add your frontend URL here)
    $allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:80',
        // Add your production domain here: 'https://yourdomain.com'
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    // Check if origin is allowed
    if (in_array($origin, $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    }

    // Allow credentials
    header('Access-Control-Allow-Credentials: true');

    // Allow methods
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');

    // Allow headers
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

    // Cache preflight for 86400 seconds (24 hours)
    header('Access-Control-Max-Age: 86400');

    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Call CORS handler at the beginning
handleCORS();


    $data = json_decode(file_get_contents("php://input"), true);

    $similar = new Similar_class();
    
    if($_SERVER['REQUEST_METHOD'] == 'GET') {
        if(isset($_GET['product_id'])) {
            $product_id = intval($_GET['product_id']);

            // Lấy category_id
            $category_id_obj = $similar->getCategoryIdFromProduct($product_id);

            if($category_id_obj && isset($category_id_obj[0]->category_id)) {
                $category_id = $category_id_obj[0]->category_id;

                // Lấy sản phẩm tương tự
                $similar_products = $similar->getSimilarProducts($category_id, $product_id);
                
                if($similar_products) {
                    echo json_encode(['status' => 'success', 'data' => $similar_products]);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'No similar products found']);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Category not found for this product']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Product ID is required']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
    }

?>
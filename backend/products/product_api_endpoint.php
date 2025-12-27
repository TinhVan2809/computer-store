<?php

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

require_once './product_class.php';

function sendJson($payload, int $status = 200) {
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

    $productObj = new Products_class();

    switch ($action) {
        case 'getProducts':
            $page = filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT, ['options' => ['default' => 1, 'min_range' => 1]]) ?: 1;
            $limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT, ['options' => ['default' => 50, 'min_range' => 1]]) ?: 50;
            
            $offset = ($page - 1) * $limit;
            $totalItems = $productObj->getCountProducts();
            $totalPages = ceil($totalItems / $limit);
            $data = $productObj->getProducts($limit, $offset);

            sendJson([
                'success' => true,
                'data' => $data,
                'total_items' => $totalItems,
                'total_pages' => $totalPages,
                'current_page' => $page,
                'limit' => $limit
            ]);
            break;

        case 'getProductById':
            $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
            
            if (!$id) {
                sendJson(['success' => false, 'message' => 'Product ID required'], 400);
            }

            $product = $productObj->getProductById($id);

            if ($product) {
                sendJson(['success' => true, 'data' => $product]);
            } else {
                sendJson(['success' => false, 'message' => 'Product not found'], 404);
            }
            break;

        case 'addProduct':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendJson(['success' => false, 'message' => 'Method not allowed'], 405);
            }

            $name = $_POST['name'] ?? '';
            $price = $_POST['price'] ?? '';
            $quantity = $_POST['quantity'] ?? '0';
            $description = $_POST['description'] ?? '';
            $manufacturer_id = $_POST['manufacturer_id'] ?? null;
            $imageFile = $_FILES['image_main'] ?? null;
            $sale = $_POST['product_sale'] ?? '0';
            $category_id = $_POST['category_id'] ?? null;

            if (empty($name) || empty($price)) {
                sendJson(['success' => false, 'message' => 'Product name and price required'], 400);
            }

            if (!is_numeric($price) || $price < 0) {
                sendJson(['success' => false, 'message' => 'Price must be a valid positive number'], 400);
            }

            // Note: addProduct signature expects ($name, $price, $quantity, $description, $product_sale, $manufacturer_id, $image_file)
            $result = $productObj->addProduct($name, $price, $quantity, $description, $sale, $manufacturer_id, $imageFile, $category_id);

            if ($result) {
                sendJson([
                    'success' => true,
                    'message' => 'Product added successfully',
                    'product_id' => $result
                ], 201);
            } else {
                sendJson(['success' => false, 'message' => 'Failed to add product'], 400);
            }
            break;

        case 'updateProduct':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
                sendJson(['success' => false, 'message' => 'Method not allowed'], 405);
            }

            $id = $_POST['id'] ?? $_GET['id'] ?? null;
            $name = $_POST['name'] ?? '';
            $price = $_POST['price'] ?? '';
            $quantity = $_POST['quantity'] ?? '0';
            $description = $_POST['description'] ?? '';
            $manufacturer_id = $_POST['manufacturer_id'] ?? null;
            $imageFile = $_FILES['image_main'] ?? null;
            $sale = $_POST['product_sale'] ?? '0';
            $category_id = $_POST['category_id'] ?? null;

            if (!$id || empty($name) || empty($price)) {
                sendJson(['success' => false, 'message' => 'Product ID, name, and price required'], 400);
            }

            if (!is_numeric($price) || $price < 0) {
                sendJson(['success' => false, 'message' => 'Price must be a valid positive number'], 400);
            }

            // Note: updateProduct signature expects ($id, $name, $price, $quantity, $description, $product_sale, $manufacturer_id, $image_file)
            $result = $productObj->updateProduct($id, $name, $price, $quantity, $description, $sale, $manufacturer_id, $imageFile, $category_id);

            if ($result) {
                sendJson(['success' => true, 'message' => 'Product updated successfully']);
            } else {
                sendJson(['success' => false, 'message' => 'Failed to update product'], 400);
            }
            break;

        case 'deleteProduct':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
                sendJson(['success' => false, 'message' => 'Method not allowed'], 405);
            }

            $id = $_POST['id'] ?? $_GET['id'] ?? null;

            if (!$id) {
                sendJson(['success' => false, 'message' => 'Product ID required'], 400);
            }

            $result = $productObj->deleteProduct($id);

            if ($result) {
                sendJson(['success' => true, 'message' => 'Product deleted successfully']);
            } else {
                sendJson(['success' => false, 'message' => 'Failed to delete product'], 400);
            }
            break;

        case 'getSecondaryImages':
            $product_id = filter_input(INPUT_GET, 'product_id', FILTER_VALIDATE_INT);
            
            if (!$product_id) {
                sendJson(['success' => false, 'message' => 'Product ID required'], 400);
            }

            $images = $productObj->getSecondaryImages($product_id);
            sendJson([
                'success' => true,
                'data' => $images,
                'count' => count($images)
            ]);
            break;

        case 'addSecondaryImages':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                sendJson(['success' => false, 'message' => 'Method not allowed'], 405);
            }

            $product_id = $_POST['product_id'] ?? null;
            error_log("DEBUG addSecondaryImages - product_id: " . var_export($product_id, true));
            error_log("DEBUG addSecondaryImages - \$_FILES keys: " . implode(', ', array_keys($_FILES)));

            if (!$product_id || !is_numeric($product_id)) {
                sendJson(['success' => false, 'message' => 'Valid product ID required'], 400);
            }

            // Handle multiple file uploads (accept both 'images' and 'images[]' keys)
            $uploadedFiles = [];
            $fileKey = null;
            if (isset($_FILES['images'])) {
                $fileKey = 'images';
            } elseif (isset($_FILES['images[]'])) {
                $fileKey = 'images[]';
            }

            error_log("DEBUG addSecondaryImages - fileKey: " . var_export($fileKey, true));

            if ($fileKey !== null) {
                // If multiple files were uploaded using images[] or images, PHP will present
                // $_FILES[$fileKey]['name'] as an array. Normalize to an array of file arrays.
                error_log("DEBUG addSecondaryImages - \$_FILES[$fileKey]['name']: " . var_export($_FILES[$fileKey]['name'], true));
                
                if (is_array($_FILES[$fileKey]['name'])) {
                    $fileCount = count($_FILES[$fileKey]['name']);
                    error_log("DEBUG addSecondaryImages - fileCount: $fileCount");
                    for ($i = 0; $i < $fileCount; $i++) {
                        $uploadedFiles[] = [
                            'name' => $_FILES[$fileKey]['name'][$i],
                            'tmp_name' => $_FILES[$fileKey]['tmp_name'][$i],
                            'size' => $_FILES[$fileKey]['size'][$i],
                            'type' => $_FILES[$fileKey]['type'][$i],
                            'error' => $_FILES[$fileKey]['error'][$i]
                        ];
                    }
                } else {
                    // Single file
                    $uploadedFiles[] = $_FILES[$fileKey];
                }
            }

            error_log("DEBUG addSecondaryImages - uploadedFiles count: " . count($uploadedFiles));

            if (empty($uploadedFiles)) {
                sendJson(['success' => false, 'message' => 'No images provided'], 400);
            }

            $result = $productObj->addSecondaryImages($product_id, $uploadedFiles);
            error_log("DEBUG addSecondaryImages - result: " . var_export($result, true));

            if (!empty($result)) {
                sendJson([
                    'success' => true,
                    'message' => 'Secondary images added successfully',
                    'image_ids' => $result,
                    'count' => count($result)
                ], 201);
            } else {
                sendJson(['success' => false, 'message' => 'Failed to add secondary images'], 400);
            }
            break;

        case 'deleteSecondaryImage':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
                sendJson(['success' => false, 'message' => 'Method not allowed'], 405);
            }

            $image_id = $_POST['image_id'] ?? $_GET['image_id'] ?? null;

            if (!$image_id || !is_numeric($image_id)) {
                sendJson(['success' => false, 'message' => 'Valid image ID required'], 400);
            }

            $result = $productObj->deleteSecondaryImage($image_id);

            if ($result) {
                sendJson(['success' => true, 'message' => 'Secondary image deleted successfully']);
            } else {
                sendJson(['success' => false, 'message' => 'Failed to delete secondary image'], 400);
            }
            break;

        default:
            sendJson(['success' => false, 'message' => 'Invalid action: ' . htmlspecialchars($action)], 400);
            break;
    }

} catch (PDOException $e) {
    error_log("General Error in product_api_endpoint.php: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine() . "\nStack trace:\n" . $e->getTraceAsString());
    sendJson(['success' => false, 'message' => 'An unexpected error occurred'], 500);
} catch (Exception $e) {
    error_log("Error in product_api_endpoint.php: " . $e->getMessage());
    sendJson(['success' => false, 'message' => 'An error occurred'], 500);
}

?>
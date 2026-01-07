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

require_once './voucher_class.php';

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

        $vouchersObj = new Voucher_class();

    switch($action) {

        case 'get':
            $page = filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT, ['options' => ['default' => 1, 'min_range' => 1]]) ?: 1;
            $limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT, ['options' => ['default' => 10, 'min_range' => 1]]) ?: 10;
            
            $offset = ($page - 1) * $limit;
            $totalItems = $vouchersObj->getCountVouchers();
            $totalPages = ceil($totalItems / $limit);
            $data = $vouchersObj->getVouchers($limit, $offset);

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
            $voucher_id = filter_input(INPUT_POST, 'voucher_id', FILTER_VALIDATE_INT);
            
            if (!$voucher_id) {
                sendJson(['success' => false, 'message' => 'Invalid voucher ID'], 400);
            }

            $result = $vouchersObj->deleteVoucher($voucher_id);
            
            if ($result) {
                sendJson(['success' => true, 'message' => 'Xóa voucher thành công']);
            } else {
                sendJson(['success' => false, 'message' => 'Không thể xóa voucher'], 400);
            }
            break;

            case 'detail':
                $voucher_id = filter_input(INPUT_POST, 'voucher_id', FILTER_VALIDATE_INT);

                if(!$voucher_id) {
                    sendJson(['success' => false, 'message' => "Invalid voucher Id"], 400);
                }
                $data = $vouchersObj->getVoucherById($voucher_id);

                if($data) {
                    sendJson([
                    'success' => true,
                    'data' => $data,                  
                    ]);
                } else {
                    sendJson(['success' => false, 'message' => 'Không thể lấy voucher theo ID'], 400);
                }

                break;

        case 'update':
            $voucher_id = filter_input(INPUT_POST, 'voucher_id', FILTER_VALIDATE_INT);
            
            if (!$voucher_id) {
                sendJson(['success' => false, 'message' => 'Invalid voucher ID'], 400);
            }

            $voucher_name = filter_input(INPUT_POST, 'voucher_name', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
            $sale = filter_input(INPUT_POST, 'sale', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
            $min_total_amount = filter_input(INPUT_POST, 'min_total_amount', FILTER_VALIDATE_INT);
            $start_at = filter_input(INPUT_POST, 'start_at', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
            $end_at = filter_input(INPUT_POST, 'end_at', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

            if (!$voucher_name || !$sale || $min_total_amount === null || !$start_at || !$end_at) {
                sendJson(['success' => false, 'message' => 'Missing or invalid required fields'], 400);
            }

            $data = [
                'voucher_name' => $voucher_name,
                'sale' => $sale,
                'min_total_amount' => $min_total_amount,
                'start_at' => $start_at,
                'end_at' => $end_at
            ];

            $result = $vouchersObj->updateVoucher($voucher_id, $data);
            
            if ($result) {
                sendJson(['success' => true, 'message' => 'Cập nhật voucher thành công']);
            } else {
                sendJson(['success' => false, 'message' => 'Không thể cập nhật voucher'], 400);
            }
            break;

         default:
            sendJson(['success' => false, 'message' => 'Invalid action: ' . htmlspecialchars($action)], 400);
            break;
    }

    } catch(PDOException $e) {
        error_log("General Error in product_api_endpoint.php: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine() . "\nStack trace:\n" . $e->getTraceAsString());
    sendJson(['success' => false, 'message' => 'An unexpected error occurred'], 500);
    }

?>
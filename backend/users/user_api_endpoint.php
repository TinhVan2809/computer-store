<?php


require_once './user_class.php';
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

function sendJson($payload, int $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

try {

    $action = $_REQUEST['action'] ?? null;
    $action = is_string($action) ? trim(filter_var($action, FILTER_SANITIZE_FULL_SPECIAL_CHARS)) : null;

    if (!$action ) {
        echo sendJson(['success' => false, 'message' => 'No action']);
    }

    if($action) {
        $userObj = new Users_class();

        switch($action) {

            //GET ALL USERS
            case 'getAll' :
            $page = filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT, ['options' => ['default' => 1, 'min_range' => 1]]) ?: 1;
            $limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT, ['options' => ['default' => 50, 'min_range' => 1]]) ?: 50;
            
            $offset = ($page - 1) * $limit;
            $totalItems = $userObj->getCountUsers();
            $totalPages = ceil($totalItems / $limit);
            $data = $userObj->getUsers($limit, $offset);

            sendJson([
                'success' => true,
                'data' => $data,
                'total_items' => $totalItems,
                'total_pages' => $totalPages,
                'current_page' => $page,
                'limit' => $limit
            ]);
            break;

            // ADD NEW USER (Admin)
            case 'addUser':
                // Expecting POST
                $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
                $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL) ?: ($_POST['email'] ?? null);
                $password = $_POST['password'] ?? null; // allow raw password for hashing
                $role = filter_input(INPUT_POST, 'role', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
                $phone = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
                $address = filter_input(INPUT_POST, 'address', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
                $gender = filter_input(INPUT_POST, 'gender', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

                if (!$username || !$email || !$password) {
                    sendJson(['success' => false, 'message' => 'username, email and password are required'], 400);
                }

                $data = [
                    'username' => $username,
                    'email' => $email,
                    'password' => $password,
                    'role' => $role,
                    'phone' => $phone,
                    'address' => $address,
                    'gender' => $gender
                ];

                // Accept file keys 'avata' or 'avatar'
                $avatarFile = $_FILES['avata'] ?? ($_FILES['avatar'] ?? null);

                $result = $userObj->addUser($data, $avatarFile);
                if (is_array($result) && isset($result['error'])) {
                    sendJson(['success' => false, 'message' => $result['error']], 400);
                }
                if ($result && is_array($result) && isset($result['user_id'])) {
                    sendJson(['success' => true, 'user_id' => $result['user_id']]);
                }
                sendJson(['success' => false, 'message' => 'Failed to add user'], 500);
            break;

            // UPDATE USER
            case 'updateUser':
                $user_id = filter_input(INPUT_POST, 'user_id', FILTER_VALIDATE_INT);
                if (!$user_id) sendJson(['success' => false, 'message' => 'user_id required'], 400);

                // Accept fields to update
                $data = [];
                $possible = ['username','email','password','role','phone','address','gender'];
                foreach ($possible as $f) {
                    if (array_key_exists($f, $_POST)) {
                        $data[$f] = trim($_POST[$f]);
                    }
                }

                $avatarFile = $_FILES['avata'] ?? ($_FILES['avatar'] ?? null);
                $ok = $userObj->updateUser($user_id, $data, $avatarFile);
                if ($ok) {
                    sendJson(['success' => true]);
                }
                sendJson(['success' => false, 'message' => 'Failed to update user'], 500);
            break;

            // DELETE USER
            case 'deleteUser':
                $user_id = filter_input(INPUT_POST, 'user_id', FILTER_VALIDATE_INT) ?: filter_input(INPUT_GET, 'user_id', FILTER_VALIDATE_INT);
                if (!$user_id) sendJson(['success' => false, 'message' => 'user_id required'], 400);

                $ok = $userObj->deleteUser($user_id);
                if ($ok) sendJson(['success' => true]);
                sendJson(['success' => false, 'message' => 'Failed to delete user'], 500);
            break;

            default: echo json_encode(['success' => false, 'message' => 'invalid action. ' . htmlspecialchars($action)]);
            break;
        }

    } else {
        echo json_encode(['success' => false, 'message' => 'No action']);
    }
} catch(PDOException $e) {
    error_log('General Error in user_class.php: ' . $e->getMessage(), ' in ' . $e->getFile(), ' in line ' . $e->getLine() . "\nStack trace:\n" . $e->getTraceAsString());
    echo json_encode(['success' => false,  'message' => "An unexpected error has occurred. Try it again."]);
}

?>
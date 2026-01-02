<?php

require_once '../connect.php';
class Users_class {

    /**
     * Upload avatar for user
     * @param array $file - $_FILES['avata'] or $_FILES['avatar']
     * @param string $uploadDir - default upload directory
     * @return string|false - filename on success or false on failure
     */
    private function handleAvatarUpload($file, $uploadDir = '../uploads/users/') {
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            error_log("Avatar: no uploaded file");
            return false;
        }

        $maxSize = 5 * 1024 * 1024; // 5MB
        if ($file['size'] > $maxSize) {
            error_log("Avatar: file size too large");
            return false;
        }

        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowedMimes, true)) {
            error_log("Avatar: invalid mime type");
            return false;
        }

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $fileExt = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'user_' . time() . '_' . uniqid() . '.' . $fileExt;
        $filePath = $uploadDir . $filename;

        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            return $filename;
        }

        error_log("Avatar: move_uploaded_file failed");
        return false;
    }

    private function deleteAvatarFile($filename, $uploadDir = '../uploads/users/') {
        if (empty($filename)) return true;
        $filePath = $uploadDir . $filename;
        if (file_exists($filePath) && is_file($filePath)) {
            return unlink($filePath);
        }
        return true;
    }

    /**
     * Check if email already exists
     * @param string $email
     * @param int|null $excludeUserId - optionally exclude a user ID (for updates)
     * @return bool - true if email exists
     */
    public function emailExists($email, $excludeUserId = null) {
        try {
            $db = Database::getInstance();
            $connection = $db->getConnection();
            $sql = "SELECT COUNT(*) AS cnt FROM users WHERE email = :email";
            if ($excludeUserId !== null) {
                $sql .= " AND user_id != :exclude_id";
            }
            $stmt = $connection->prepare($sql);
            $stmt->bindValue(':email', $email, PDO::PARAM_STR);
            if ($excludeUserId !== null) {
                $stmt->bindValue(':exclude_id', (int)$excludeUserId, PDO::PARAM_INT);
            }
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return isset($row['cnt']) && (int)$row['cnt'] > 0;
        } catch (PDOException $e) {
            error_log("Error checking email existence: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if username already exists
     * @param string $username
     * @param int|null $excludeUserId - optionally exclude a user ID (for updates)
     * @return bool - true if username exists
     */
    public function usernameExists($username, $excludeUserId = null) {
        try {
            $db = Database::getInstance();
            $connection = $db->getConnection();
            $sql = "SELECT COUNT(*) AS cnt FROM users WHERE username = :username";
            if ($excludeUserId !== null) {
                $sql .= " AND user_id != :exclude_id";
            }
            $stmt = $connection->prepare($sql);
            $stmt->bindValue(':username', $username, PDO::PARAM_STR);
            if ($excludeUserId !== null) {
                $stmt->bindValue(':exclude_id', (int)$excludeUserId, PDO::PARAM_INT);
            }
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return isset($row['cnt']) && (int)$row['cnt'] > 0;
        } catch (PDOException $e) {
            error_log("Error checking username existence: " . $e->getMessage());
            return false;
        }
    }

    public function getUsers(int $limit = 50, int $offset = 0) {
        try{
            $db = Database::getInstance();
            $connection = $db->getConnection();
            // include LIMIT/OFFSET so pagination works as expected
            $sql = "SELECT user_id, username, email, avata, role, phone, address, gender FROM users ORDER BY user_created_at DESC LIMIT :limit OFFSET :offset";
            $get = $connection->prepare($sql);
            $get->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
            $get->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
            $get->execute();
            return $get->fetchAll(PDO::FETCH_OBJ);
        } catch(PDOException $e) {
            error_log("Error Getting Users: " . $e->getMessage());
            return [];
        }
    }

    public function getCountUsers() {
        try{
            $db = Database::getInstance();
            $connection = $db->getConnection();

            $sql = "SELECT COUNT(*) AS total FROM users";
            $count = $connection->prepare($sql);
            $count->execute();
            $row = $count->fetch(PDO::FETCH_ASSOC);
            return isset($row['total']) ? (int)$row['total'] : 0;

        } catch(PDOException $e) {
            error_log("Error Count Users " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Add a new user (admin can create user or admin)
     * @param array $data - associative array ['username','email','password','role','phone','address','gender']
     * @param array|null $avatarFile - optional $_FILES['avata']
     * @return array|false - ['user_id' => int] on success or false on failure
     */
    public function addUser(array $data, $avatarFile = null) {
        $username = isset($data['username']) ? trim((string)$data['username']) : '';
        $email = isset($data['email']) ? trim((string)$data['email']) : '';
        $password = isset($data['password']) ? $data['password'] : '';
        $role = isset($data['role']) ? trim((string)$data['role']) : 'user';
        $phone = isset($data['phone']) ? trim((string)$data['phone']) : null;
        $address = isset($data['address']) ? trim((string)$data['address']) : null;
        $gender = isset($data['gender']) ? trim((string)$data['gender']) : null;

        // Validation with detailed error messages
        if ($username === '') {
            error_log("addUser error: username is empty");
            return ['error' => 'Username is required'];
        }

        if (strlen($username) < 3) {
            error_log("addUser error: username too short");
            return ['error' => 'Username must be at least 3 characters'];
        }

        if ($email === '') {
            error_log("addUser error: email is empty");
            return ['error' => 'Email is required'];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            error_log("addUser error: invalid email format");
            return ['error' => 'Invalid email format'];
        }

        if ($this->emailExists($email)) {
            error_log("addUser error: email already exists");
            return ['error' => 'Email already exists'];
        }

        if ($this->usernameExists($username)) {
            error_log("addUser error: username already exists");
            return ['error' => 'Username already exists'];
        }

        if ($password === '') {
            error_log("addUser error: password is empty");
            return ['error' => 'Password is required'];
        }

        if (strlen($password) < 6) {
            error_log("addUser error: password too short");
            return ['error' => 'Password must be at least 6 characters'];
        }

        // Validate role
        $allowedRoles = ['user', 'admin'];
        if (!in_array($role, $allowedRoles, true)) {
            $role = 'user';
        }

        // Clamp gender length
        if ($gender !== null) {
            $gender = substr($gender, 0, 20);
        }

        // Hash password
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        // Handle avatar upload
        $avatarFilename = null;
        if (!empty($avatarFile) && isset($avatarFile['tmp_name']) && $avatarFile['size'] > 0) {
            $avatarFilename = $this->handleAvatarUpload($avatarFile);
            if ($avatarFilename === false) {
                return ['error' => 'Avatar upload failed. Check file size and format (JPEG, PNG, WebP, GIF)'];
            }
        }

        try {
            $db = Database::getInstance();
            $connection = $db->getConnection();

            $sql = "INSERT INTO users (username, email, password, avata, user_created_at, role, phone, address, gender)
                    VALUES (:username, :email, :password, :avata, NOW(), :role, :phone, :address, :gender)";

            $stmt = $connection->prepare($sql);
            $stmt->bindValue(':username', $username, PDO::PARAM_STR);
            $stmt->bindValue(':email', $email, PDO::PARAM_STR);
            $stmt->bindValue(':password', $passwordHash, PDO::PARAM_STR);
            $stmt->bindValue(':avata', $avatarFilename, PDO::PARAM_STR);
            $stmt->bindValue(':role', $role, PDO::PARAM_STR);
            $stmt->bindValue(':phone', $phone, PDO::PARAM_STR);
            $stmt->bindValue(':address', $address, PDO::PARAM_STR);
            $stmt->bindValue(':gender', $gender, PDO::PARAM_STR);

            if ($stmt->execute()) {
                $lastId = $connection->lastInsertId();
                return ['user_id' => $lastId !== '0' ? (int)$lastId : true];
            }

            // If insert failed, delete uploaded avatar
            if ($avatarFilename) {
                $this->deleteAvatarFile($avatarFilename);
            }

            return ['error' => 'Database error. Please try again'];

        } catch (PDOException $e) {
            error_log("Error Adding User: " . $e->getMessage());
            if (isset($avatarFilename) && $avatarFilename) {
                $this->deleteAvatarFile($avatarFilename);
            }
            return ['error' => 'Database error: ' . $e->getMessage()];
        }
    }

    /**
     * Update existing user
     * @param int $user_id
     * @param array $data
     * @param array|null $avatarFile
     * @return array|bool - true on success, or array with error message
     */
    public function updateUser($user_id, array $data, $avatarFile = null) {
        $user_id = (int)$user_id;
        if ($user_id <= 0) return ['error' => 'Invalid user ID'];

        try {
            $db = Database::getInstance();
            $connection = $db->getConnection();

            // Fetch existing to get current avatar
            $getSql = "SELECT avata FROM users WHERE user_id = :user_id";
            $getStmt = $connection->prepare($getSql);
            $getStmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
            $getStmt->execute();
            $existing = $getStmt->fetch(PDO::FETCH_ASSOC);
            if (!$existing) return ['error' => 'User not found'];

            $oldAvatar = $existing['avata'];

            // Validate email if provided
            if (isset($data['email'])) {
                $email = trim((string)$data['email']);
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    return ['error' => 'Invalid email format'];
                }
                if ($this->emailExists($email, $user_id)) {
                    return ['error' => 'Email already exists'];
                }
            }

            // Validate username if provided
            if (isset($data['username'])) {
                $username = trim((string)$data['username']);
                if (strlen($username) < 3) {
                    return ['error' => 'Username must be at least 3 characters'];
                }
                if ($this->usernameExists($username, $user_id)) {
                    return ['error' => 'Username already exists'];
                }
            }

            // Prepare fields
            $fields = [];
            $params = [':user_id' => $user_id];

            if (isset($data['username'])) { $fields[] = 'username = :username'; $params[':username'] = trim((string)$data['username']); }
            if (isset($data['email'])) { $fields[] = 'email = :email'; $params[':email'] = trim((string)$data['email']); }
            if (isset($data['password']) && $data['password'] !== '') { $fields[] = 'password = :password'; $params[':password'] = password_hash($data['password'], PASSWORD_DEFAULT); }
            if (isset($data['role'])) { $role = in_array($data['role'], ['user','admin'], true) ? $data['role'] : 'user'; $fields[] = 'role = :role'; $params[':role'] = $role; }
            if (array_key_exists('phone', $data)) { $fields[] = 'phone = :phone'; $params[':phone'] = $data['phone'] ?: null; }
            if (array_key_exists('address', $data)) { $fields[] = 'address = :address'; $params[':address'] = $data['address'] ?: null; }
            if (array_key_exists('gender', $data)) { $fields[] = 'gender = :gender'; $params[':gender'] = substr((string)$data['gender'], 0, 20) ?: null; }

            // Handle avatar upload
            $avatarUploaded = false;
            if (!empty($avatarFile) && isset($avatarFile['tmp_name']) && $avatarFile['size'] > 0) {
                $uploaded = $this->handleAvatarUpload($avatarFile);
                if ($uploaded === false) {
                    return ['error' => 'Avatar upload failed. Check file size and format (JPEG, PNG, WebP, GIF)'];
                }
                $fields[] = 'avata = :avata';
                $params[':avata'] = $uploaded;
                $avatarUploaded = true;
            }

            if (empty($fields)) return true; // nothing to update

            $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE user_id = :user_id";
            $stmt = $connection->prepare($sql);
            foreach ($params as $k => $v) {
                $stmt->bindValue($k, $v, is_int($v) ? PDO::PARAM_INT : PDO::PARAM_STR);
            }

            $result = $stmt->execute();
            
            // Delete old avatar if new one was uploaded
            if ($result && $avatarUploaded && $oldAvatar) {
                $this->deleteAvatarFile($oldAvatar);
            }
            
            return $result;

        } catch (PDOException $e) {
            error_log("Error Updating User: " . $e->getMessage());
            return ['error' => 'Database error: ' . $e->getMessage()];
        }
    }

    /**
     * Delete user and avatar
     * @param int $user_id
     * @return bool
     */
    public function deleteUser($user_id) {
        $user_id = (int)$user_id;
        if ($user_id <= 0) return false;

        try {
            $db = Database::getInstance();
            $connection = $db->getConnection();

            // get avatar
            $getSql = "SELECT avata FROM users WHERE user_id = :user_id";
            $getStmt = $connection->prepare($getSql);
            $getStmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
            $getStmt->execute();
            $existing = $getStmt->fetch(PDO::FETCH_ASSOC);
            if (!$existing) return false;

            $avatar = $existing['avata'];

            $delSql = "DELETE FROM users WHERE user_id = :user_id";
            $delStmt = $connection->prepare($delSql);
            $delStmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
            $res = $delStmt->execute();
            if ($res) {
                if ($avatar) $this->deleteAvatarFile($avatar);
            }
            return $res;

        } catch (PDOException $e) {
            error_log("Error Deleting User: " . $e->getMessage());
            return false;
        }
    }

}

?>
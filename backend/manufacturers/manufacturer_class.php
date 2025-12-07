<?php

require_once '../connect.php';
class Manufacturers_class {

    // GET MANUFACTURES 
    public function getManufacturers(int $limit = 10, int $offset = 0) {
        try{
            $db = Database::getInstance();
            $connection = $db->getConnection();

            $sql = "SELECT manufacturer_id, manufacturer_name, manufacturer_logo_image, manufacturer_url FROM manufacturers LIMIT :limit OFFSET :offset";
            $get = $connection->prepare($sql);
            $get->bindValue(':limit', $limit, PDO::PARAM_INT);
            $get->bindValue(':offset', $offset, PDO::PARAM_INT);
            $get->execute();
            return $get->fetchAll(PDO::FETCH_OBJ);

        } catch (PDOException $e) {
            error_log("Error Getting Manufacturers " . $e->getMessage());
            return [];
        }
    }

    public function getCountManufacturers() {
        try{
            $db = Database::getInstance();
            $connection = $db->getConnection();

            $sql = "SELECT COUNT(*) AS total FROM manufacturers";
            $count = $connection->prepare($sql);
            $count->execute();
            $row = $count->fetch(PDO::FETCH_ASSOC);
            return isset($row['total']) ? (int)$row['total'] : 0;

        } catch(PDOException $e) {
            error_log("Error Count Manufacturers " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Upload và xử lý ảnh nhà sản xuất
     * @param array $file - $_FILES['key']
     * @param string $uploadDir - Thư mục đích (default: ../uploads/manufacturers_img/)
     * @return string|false - Tên file hoặc false nếu lỗi
     */
    private function handleImageUpload($file, $uploadDir = '../uploads/manufacturers_img/') {
        // Validate file exists
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            error_log("Error: File not uploaded or invalid");
            return false;
        }

        // Validate file size (max 5MB)
        $maxSize = 5 * 1024 * 1024; // 5MB
        if ($file['size'] > $maxSize) {
            error_log("Error: File size exceeds 5MB");
            return false;
        }

        // Validate MIME type
        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowedMimes, true)) {
            error_log("Error: Invalid file type. Only JPEG, PNG, WebP, GIF allowed");
            return false;
        }

        // Create directory if not exists
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Generate unique filename
        $fileExt = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'manufacturer_' . time() . '_' . uniqid() . '.' . $fileExt;
        $filePath = $uploadDir . $filename;

        // Move uploaded file
        if (move_uploaded_file($file['tmp_name'], $filePath)) {
            return $filename;
        }

        error_log("Error: Failed to move uploaded file");
        return false;
    }

    /**
     * Delete old image file
     * @param string $filename - Tên file cần xóa
     * @param string $uploadDir - Thư mục chứa file
     * @return bool
     */
    private function deleteImageFile($filename, $uploadDir = '../uploads/manufacturers_img/') {
        if (empty($filename)) {
            return true; // Không có file, xem như thành công
        }

        $filePath = $uploadDir . $filename;
        if (file_exists($filePath) && is_file($filePath)) {
            return unlink($filePath);
        }

        return true;
    }

    /**
     * Thêm nhà sản xuất mới
     * @param string $manufacturerName - Tên nhà sản xuất
     * @param string $manufacturerUrl - Website nhà sản xuất (optional)
     * @param string $description - Mô tả (optional)
     * @param array $logoFile - $_FILES['manufacturer_logo_image']
     * @return int|false - ID nhà sản xuất mới hoặc false nếu lỗi
     */
    public function addManufacturer($manufacturerName, $manufacturerUrl = '', $description = '', $logoFile = null) {
        // Validate required fields
        $manufacturerName = trim((string)$manufacturerName);
        if (empty($manufacturerName)) {
            error_log("Error: Manufacturer name is required");
            return false;
        }

        $manufacturerUrl = trim((string)$manufacturerUrl);
        $description = trim((string)$description);

        try {
            $db = Database::getInstance();
            $connection = $db->getConnection();

            // Handle image upload if provided
            $logoImageFilename = null;
            if (!empty($logoFile) && $logoFile['size'] > 0) {
                $logoImageFilename = $this->handleImageUpload($logoFile);
                if ($logoImageFilename === false) {
                    return false; // Upload failed
                }
            }

            // Insert into database
            $sql = "INSERT INTO manufacturers (manufacturer_name, manufacturer_logo_image, manufacturer_url, description, manufacturer_created_at)
                    VALUES (:manufacturer_name, :manufacturer_logo_image, :manufacturer_url, :description, NOW())";

            $stmt = $connection->prepare($sql);
            $stmt->bindValue(':manufacturer_name', $manufacturerName, PDO::PARAM_STR);
            $stmt->bindValue(':manufacturer_logo_image', $logoImageFilename, PDO::PARAM_STR);
            $stmt->bindValue(':manufacturer_url', $manufacturerUrl, PDO::PARAM_STR);
            $stmt->bindValue(':description', $description, PDO::PARAM_STR);

            if ($stmt->execute()) {
                $lastId = $connection->lastInsertId();
                return (int)$lastId;
            }

            return false;

        } catch (PDOException $e) {
            error_log("Error Adding Manufacturer: " . $e->getMessage());
            // Clean up uploaded file if database insert failed
            if ($logoImageFilename) {
                $this->deleteImageFile($logoImageFilename);
            }
            return false;
        }
    }

    /**
     * Cập nhật thông tin nhà sản xuất
     * @param int $manufacturerId - ID nhà sản xuất
     * @param string $manufacturerName - Tên nhà sản xuất
     * @param string $manufacturerUrl - Website (optional)
     * @param string $description - Mô tả (optional)
     * @param array $logoFile - $_FILES['manufacturer_logo_image'] (optional, nếu muốn thay ảnh)
     * @return bool - true nếu thành công, false nếu lỗi
     */
    public function updateManufacturer($manufacturerId, $manufacturerName, $manufacturerUrl = '', $description = '', $logoFile = null) {
        $manufacturerId = (int)$manufacturerId;
        $manufacturerName = trim((string)$manufacturerName);

        if ($manufacturerId <= 0 || empty($manufacturerName)) {
            error_log("Error: Invalid manufacturer ID or name");
            return false;
        }

        $manufacturerUrl = trim((string)$manufacturerUrl);
        $description = trim((string)$description);

        try {
            $db = Database::getInstance();
            $connection = $db->getConnection();

            // Get current manufacturer to check existing image
            $currentSql = "SELECT manufacturer_logo_image FROM manufacturers WHERE manufacturer_id = :id";
            $currentStmt = $connection->prepare($currentSql);
            $currentStmt->bindValue(':id', $manufacturerId, PDO::PARAM_INT);
            $currentStmt->execute();
            $currentManufacturer = $currentStmt->fetch(PDO::FETCH_ASSOC);

            if (!$currentManufacturer) {
                error_log("Error: Manufacturer not found");
                return false;
            }

            $oldImageFilename = $currentManufacturer['manufacturer_logo_image'];
            $newImageFilename = $oldImageFilename; // Keep old image by default

            // Handle new image upload if provided
            if (!empty($logoFile) && $logoFile['size'] > 0) {
                $newImageFilename = $this->handleImageUpload($logoFile);
                if ($newImageFilename === false) {
                    return false;
                }
                // Delete old image after successful new upload
                if ($oldImageFilename) {
                    $this->deleteImageFile($oldImageFilename);
                }
            }

            // Update database
            $sql = "UPDATE manufacturers 
                    SET manufacturer_name = :manufacturer_name, 
                        manufacturer_logo_image = :manufacturer_logo_image, 
                        manufacturer_url = :manufacturer_url, 
                        description = :description 
                    WHERE manufacturer_id = :id";

            $stmt = $connection->prepare($sql);
            $stmt->bindValue(':manufacturer_name', $manufacturerName, PDO::PARAM_STR);
            $stmt->bindValue(':manufacturer_logo_image', $newImageFilename, PDO::PARAM_STR);
            $stmt->bindValue(':manufacturer_url', $manufacturerUrl, PDO::PARAM_STR);
            $stmt->bindValue(':description', $description, PDO::PARAM_STR);
            $stmt->bindValue(':id', $manufacturerId, PDO::PARAM_INT);

            return $stmt->execute();

        } catch (PDOException $e) {
            error_log("Error Updating Manufacturer: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Xóa nhà sản xuất và ảnh liên quan
     * @param int $manufacturerId - ID nhà sản xuất
     * @return bool - true nếu thành công, false nếu lỗi
     */
    public function deleteManufacturer($manufacturerId) {
        $manufacturerId = (int)$manufacturerId;

        if ($manufacturerId <= 0) {
            error_log("Error: Invalid manufacturer ID");
            return false;
        }

        try {
            $db = Database::getInstance();
            $connection = $db->getConnection();

            // Get image filename before deleting
            $sql = "SELECT manufacturer_logo_image FROM manufacturers WHERE manufacturer_id = :id";
            $stmt = $connection->prepare($sql);
            $stmt->bindValue(':id', $manufacturerId, PDO::PARAM_INT);
            $stmt->execute();
            $manufacturer = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$manufacturer) {
                error_log("Error: Manufacturer not found");
                return false;
            }

            // Delete image file
            if ($manufacturer['manufacturer_logo_image']) {
                $this->deleteImageFile($manufacturer['manufacturer_logo_image']);
            }

            // Delete from database
            $deleteSql = "DELETE FROM manufacturers WHERE manufacturer_id = :id";
            $deleteStmt = $connection->prepare($deleteSql);
            $deleteStmt->bindValue(':id', $manufacturerId, PDO::PARAM_INT);

            return $deleteStmt->execute();

        } catch (PDOException $e) {
            error_log("Error Deleting Manufacturer: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Lấy thông tin chi tiết nhà sản xuất
     * @param int $manufacturerId - ID nhà sản xuất
     * @return object|false - Thông tin nhà sản xuất hoặc false
     */
    public function getManufacturerById($manufacturerId) {
        $manufacturerId = (int)$manufacturerId;

        if ($manufacturerId <= 0) {
            return false;
        }

        try {
            $db = Database::getInstance();
            $connection = $db->getConnection();

            $sql = "SELECT * FROM manufacturers WHERE manufacturer_id = :id";
            $stmt = $connection->prepare($sql);
            $stmt->bindValue(':id', $manufacturerId, PDO::PARAM_INT);
            $stmt->execute();

            return $stmt->fetch(PDO::FETCH_OBJ);

        } catch (PDOException $e) {
            error_log("Error Getting Manufacturer: " . $e->getMessage());
            return false;
        }
    }
}

?>
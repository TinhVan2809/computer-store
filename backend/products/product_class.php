<?php
    require_once '../connect.php';

    class Products_class {

        /**
         * Upload và xử lý ảnh sản phẩm
         * @param array $file - $_FILES['key']
         * @param string $uploadDir - Thư mục đích (default: ../uploads/products_img/)
         * @return string|false - Tên file hoặc false nếu lỗi
         */
        private function handleImageUpload($file, $uploadDir = '../uploads/products_img/') {
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
            $filename = 'product_' . time() . '_' . uniqid() . '.' . $fileExt;
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
        private function deleteImageFile($filename, $uploadDir = '../uploads/products_img/') {
            if (empty($filename)) {
                return true; // Không có file, xem như thành công
            }

            $filePath = $uploadDir . $filename;
            if (file_exists($filePath) && is_file($filePath)) {
                return unlink($filePath);
            }

            return true;
        }

        // Get products with pagination
       public function getProducts(int $limit = 50, int $offset = 0) {
            try{
                $db = Database::getInstance();
                $connection = $db->getConnection();
                $sql = "SELECT p.product_id, p.product_name, p.product_price, p.product_quantity, p.product_sale,
                               p.product_description, p.product_created_at, p.image_main, 
                               COALESCE(AVG(v.rating), 0) AS rating, 
                               m.manufacturer_name
                        FROM products p
                        LEFT JOIN votes v ON p.product_id = v.vote_id
                        LEFT JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
                        GROUP BY p.product_id
                        ORDER BY p.product_created_at DESC
                        LIMIT :limit OFFSET :offset";
                $get = $connection->prepare($sql);
                $get->bindValue(':limit', $limit, PDO::PARAM_INT);
                $get->bindValue(':offset', $offset, PDO::PARAM_INT);
                $get->execute();
                return $get->fetchAll(PDO::FETCH_OBJ);
            } catch(PDOException $e) {
                error_log("Error Getting Products " . $e->getMessage());
                return [];
            }
       }

       public function getCountProducts() {
            try{
                $db = Database::getInstance();
                $connection = $db->getConnection();

                $sql = "SELECT COUNT(*) AS total FROM products";
                $count = $connection->prepare($sql);
                $count->execute();
                $row = $count->fetch(PDO::FETCH_ASSOC);
                return isset($row['total']) ? (int)$row['total'] : 0;

            } catch(PDOException $e) {
                error_log("Error Count Products " . $e->getMessage());
                return 0;
            }
       }

       /**
        * Add a new product (optimized with image upload)
        * @param string $product_name - Product name (required)
        * @param float $product_price - Product price (required)
        * @param float $product_sale -product sale
        * @param string $product_quantity - Product quantity (optional)
        * @param string $product_description - Product description (optional)
        * @param int $manufacturer_id - Manufacturer ID (optional)
        * @param array $image_file - $_FILES['image_main'] (optional)
        * @return int|false - Inserted product ID or false
        */
       public function addProduct($product_name, $product_price, $product_quantity = '0', $product_description = '', $product_sale = '0', $manufacturer_id = null, $image_file = null) {

            $product_name = trim((string)$product_name);
            $product_price = (float)$product_price;
            $product_quantity = trim((string)$product_quantity);
            $product_description = trim((string)$product_description);
            // Ensure sale is numeric and clamp to reasonable range (0-100)
            $product_sale = is_numeric($product_sale) ? (float)$product_sale : 0.0;
            if ($product_sale < 0) $product_sale = 0.0;
            if ($product_sale > 100) $product_sale = 100.0;
            $manufacturer_id = $manufacturer_id !== null ? (int)$manufacturer_id : null;

            if ($product_name === '' || $product_price < 0) {
                error_log("Error: Missing or invalid product name/price");
                return false;
            }

            try {
                $db = Database::getInstance();
                $connection = $db->getConnection();

                // Handle image upload if provided
                $image_main = null;
                if (!empty($image_file) && $image_file['size'] > 0) {
                    $image_main = $this->handleImageUpload($image_file);
                    if ($image_main === false) {
                        return false; // Upload failed
                    }
                }

                $sql = "INSERT INTO products (product_name, product_price, product_quantity, product_description, manufacturer_id, image_main, product_created_at, product_sale)
                        VALUES (:product_name, :product_price, :product_quantity, :product_description, :manufacturer_id, :image_main, NOW(), :product_sale)";

                $stmt = $connection->prepare($sql);

                $stmt->bindValue(':product_name', $product_name, PDO::PARAM_STR);
                $stmt->bindValue(':product_price', $product_price);
                $stmt->bindValue(':product_quantity', $product_quantity, PDO::PARAM_STR);
                $stmt->bindValue(':product_description', $product_description, PDO::PARAM_STR);
                $stmt->bindValue(':image_main', $image_main, PDO::PARAM_STR);
                $stmt->bindValue(':product_sale', $product_sale, PDO::PARAM_STR);

                if ($manufacturer_id === null) {
                    $stmt->bindValue(':manufacturer_id', null, PDO::PARAM_NULL);
                } else {
                    $stmt->bindValue(':manufacturer_id', $manufacturer_id, PDO::PARAM_INT);
                }

                if ($stmt->execute()) {
                    $lastId = $connection->lastInsertId();
                    return $lastId !== '0' ? (int)$lastId : true;
                }

                // Clean up uploaded file if database insert failed
                if ($image_main) {
                    $this->deleteImageFile($image_main);
                }

                return false;

            } catch(PDOException $e) {
                error_log("Error Adding Product: " . $e->getMessage());
                // Clean up uploaded file if error
                if ($image_main) {
                    $this->deleteImageFile($image_main);
                }
                return false;
            }
       }

       /**
        * Delete product và ảnh liên quan
        * @param int $product_id - Product ID
        * @return bool - true on success, false on failure
        */
       public function deleteProduct($product_id) {
            $product_id = (int)$product_id;
            
            if ($product_id <= 0) {
                error_log("Error: Invalid product ID");
                return false;
            }

            try{
                $db = Database::getInstance();
                $connection = $db->getConnection();

                // Get image filename before deleting
                $sql = "SELECT image_main FROM products WHERE product_id = :id";
                $stmt = $connection->prepare($sql);
                $stmt->bindValue(':id', $product_id, PDO::PARAM_INT);
                $stmt->execute();
                $product = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$product) {
                    error_log("Error: Product not found");
                    return false;
                }

                // Delete main image file
                if ($product['image_main']) {
                    $this->deleteImageFile($product['image_main']);
                }

                // Delete secondary images
                $this->deleteProductSecondaryImages($product_id);

                // Delete from database
                $deleteSql = "DELETE FROM products WHERE product_id = :id";
                $deleteStmt = $connection->prepare($deleteSql);
                $deleteStmt->bindValue(':id', $product_id, PDO::PARAM_INT);

                return $deleteStmt->execute();

            } catch(PDOException $e) {
                error_log("Error deleting product " . $e->getMessage());
                return false;
            }
       }

       /**
        * Get product by ID
        * @param int $product_id - Product ID
        * @return object|false - Product object or false
        */
       public function getProductById($product_id) {
            $product_id = (int)$product_id;
            
            if ($product_id <= 0) {
                return false;
            }

            try {
                $db = Database::getInstance();
                $connection = $db->getConnection();

                $sql = "SELECT p.*, 
                               COALESCE(AVG(v.rating), 0) AS rating,
                               m.manufacturer_name
                        FROM products p
                        LEFT JOIN votes v ON p.product_id = v.vote_id
                        LEFT JOIN manufacturers m ON p.manufacturer_id = m.manufacturer_id
                        WHERE p.product_id = :id
                        GROUP BY p.product_id";

                $stmt = $connection->prepare($sql);
                $stmt->bindValue(':id', $product_id, PDO::PARAM_INT);
                $stmt->execute();

                return $stmt->fetch(PDO::FETCH_OBJ);

            } catch(PDOException $e) {
                error_log("Error Getting Product: " . $e->getMessage());
                return false;
            }
       }

       /**
        * Update product (with optional image upload)
        * @param int $product_id - Product ID
        * @param string $product_name - Product name
        * @param float $product_price - Product price
        * @param string $product_quantity - Product quantity
        * @param string $product_description - Product description
        * @param float $product_sale = Product sale
        * @param int $manufacturer_id - Manufacturer ID (optional)
        * @param array $image_file - $_FILES['image_main'] (optional, replaces old image)
        * @return bool - true on success, false on failure
        */
       public function updateProduct($product_id, $product_name, $product_price, $product_quantity = '0', $product_description = '', $product_sale = '0', $manufacturer_id = null, $image_file = null) {
            
            $product_id = (int)$product_id;
            $product_name = trim((string)$product_name);
            $product_price = (float)$product_price;
            $product_quantity = trim((string)$product_quantity);
            $product_description = trim((string)$product_description);
            $product_sale = (float)$product_sale;
            $manufacturer_id = $manufacturer_id !== null ? (int)$manufacturer_id : null;

            if ($product_id <= 0 || $product_name === '' || $product_price < 0) {
                error_log("Error: Invalid product ID, name, or price");
                return false;
            }

            try {
                $db = Database::getInstance();
                $connection = $db->getConnection();

                // Get current product to check existing image
                $currentSql = "SELECT image_main FROM products WHERE product_id = :id";
                $currentStmt = $connection->prepare($currentSql);
                $currentStmt->bindValue(':id', $product_id, PDO::PARAM_INT);
                $currentStmt->execute();
                $currentProduct = $currentStmt->fetch(PDO::FETCH_ASSOC);

                if (!$currentProduct) {
                    error_log("Error: Product not found");
                    return false;
                }

                $oldImageFilename = $currentProduct['image_main'];
                $newImageFilename = $oldImageFilename; // Keep old image by default

                // Handle new image upload if provided
                if (!empty($image_file) && $image_file['size'] > 0) {
                    $newImageFilename = $this->handleImageUpload($image_file);
                    if ($newImageFilename === false) {
                        return false;
                    }
                    // Delete old image after successful new upload
                    if ($oldImageFilename) {
                        $this->deleteImageFile($oldImageFilename);
                    }
                }

                $sql = "UPDATE products 
                        SET product_name = :product_name,
                            product_price = :product_price,
                            product_quantity = :product_quantity,
                            product_description = :product_description,
                            product_sale = :product_sale,
                            manufacturer_id = :manufacturer_id,
                            image_main = :image_main,
                            product_update_at = NOW()
                        WHERE product_id = :product_id";

                $stmt = $connection->prepare($sql);

                $stmt->bindValue(':product_id', $product_id, PDO::PARAM_INT);
                $stmt->bindValue(':product_name', $product_name, PDO::PARAM_STR);
                $stmt->bindValue(':product_price', $product_price);
                $stmt->bindValue(':product_quantity', $product_quantity, PDO::PARAM_STR);
                $stmt->bindValue(':product_description', $product_description, PDO::PARAM_STR);
                $stmt->bindValue(':product_sale', $product_sale, PDO::PARAM_STR);
                $stmt->bindValue(':image_main', $newImageFilename, PDO::PARAM_STR);

                if ($manufacturer_id === null) {
                    $stmt->bindValue(':manufacturer_id', null, PDO::PARAM_NULL);
                } else {
                    $stmt->bindValue(':manufacturer_id', $manufacturer_id, PDO::PARAM_INT);
                }

                $execResult = $stmt->execute();
                if ($execResult === false) {
                    $err = $stmt->errorInfo();
                    error_log("Error Updating Product - SQLSTATE: {$err[0]} Code: {$err[1]} Message: {$err[2]}");
                }
                return $execResult;

            } catch(PDOException $e) {
                error_log("Error Updating Product: " . $e->getMessage());
                return false;
            }
       }

        /**
         * Thêm ảnh phụ cho sản phẩm
         * @param int $product_id - ID sản phẩm
         * @param array $images - Mảng $_FILES từ frontend
         * @return array - Mảng image_id của các ảnh đã thêm hoặc false
         */
        public function addSecondaryImages($product_id, $images = []) {
            if (empty($images) || !is_array($images)) {
                return [];
            }

            $uploadedImageIds = [];

            try {
                foreach ($images as $imageFile) {
                    // Validate and upload each image
                    $filename = $this->handleImageUpload($imageFile);
                    
                    if ($filename) {
                        $db = Database::getInstance();
                        $connection = $db->getConnection();
                        $stmt = $connection->prepare(
                            "INSERT INTO product_images (product_id, image) VALUES (:product_id, :image)"
                        );
                        $stmt->bindValue(':product_id', $product_id, PDO::PARAM_INT);
                        $stmt->bindValue(':image', $filename, PDO::PARAM_STR);

                        if ($stmt->execute()) {
                            $uploadedImageIds[] = $connection->lastInsertId();
                        } else {
                            // Rollback: delete uploaded file if DB insert fails
                            $this->deleteImageFile($filename);
                            error_log("Warning: Failed to insert product image to database");
                        }
                    }
                }

                return $uploadedImageIds;

            } catch(PDOException $e) {
                error_log("Error Adding Secondary Images: " . $e->getMessage());
                return [];
            }
        }

        /**
         * Lấy tất cả ảnh phụ của sản phẩm
         * @param int $product_id - ID sản phẩm
         * @return array - Mảng các ảnh phụ
         */
        public function getSecondaryImages($product_id) {
            try {
                $db = Database::getInstance();
                $connection = $db->getConnection();
                $stmt = $connection->prepare(
                    "SELECT image_id, product_id, image FROM product_images WHERE product_id = :product_id ORDER BY image_id"
                );
                $stmt->bindValue(':product_id', $product_id, PDO::PARAM_INT);
                $stmt->execute();

                return $stmt->fetchAll(PDO::FETCH_ASSOC);

            } catch(PDOException $e) {
                error_log("Error Getting Secondary Images: " . $e->getMessage());
                return [];
            }
        }

        /**
         * Xóa ảnh phụ theo image_id
         * @param int $image_id - ID của ảnh phụ
         * @return bool
         */
        public function deleteSecondaryImage($image_id) {
            try {
                // Get image filename before deleting
                $db = Database::getInstance();
                $connection = $db->getConnection();
                $stmt = $connection->prepare(
                    "SELECT image FROM product_images WHERE image_id = :image_id"
                );
                $stmt->bindValue(':image_id', $image_id, PDO::PARAM_INT);
                $stmt->execute();
                $result = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$result) {
                    return false;
                }

                $imageFilename = $result['image'];

                // Delete from database
                $stmt = $connection->prepare(
                    "DELETE FROM product_images WHERE image_id = :image_id"
                );
                $stmt->bindValue(':image_id', $image_id, PDO::PARAM_INT);

                if ($stmt->execute()) {
                    // Delete file after successful DB deletion
                    $this->deleteImageFile($imageFilename);
                    return true;
                }

                return false;

            } catch(PDOException $e) {
                error_log("Error Deleting Secondary Image: " . $e->getMessage());
                return false;
            }
        }

        /**
         * Xóa tất cả ảnh phụ của sản phẩm
         * @param int $product_id - ID sản phẩm
         * @return bool
         */
        public function deleteProductSecondaryImages($product_id) {
            try {
                // Get all images before deleting
                $images = $this->getSecondaryImages($product_id);

                // Delete from database
                $db = Database::getInstance();
                $connection = $db->getConnection();
                $stmt = $connection->prepare(
                    "DELETE FROM product_images WHERE product_id = :product_id"
                );
                $stmt->bindValue(':product_id', $product_id, PDO::PARAM_INT);

                if ($stmt->execute()) {
                    // Delete files after successful DB deletion
                    foreach ($images as $image) {
                        $this->deleteImageFile($image['image']);
                    }
                    return true;
                }

                return false;

            } catch(PDOException $e) {
                error_log("Error Deleting Product Secondary Images: " . $e->getMessage());
                return false;
            }
        }


    }

?>
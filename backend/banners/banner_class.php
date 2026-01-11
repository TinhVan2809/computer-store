<?php


    require_once '../connect.php';

    class Banner_class {
        
        /**
         * Upload và xử lý ảnh banner
         */
        private function handleImageUpload($file, $uploadDir = '../uploads/banners/') {
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
            $filename = 'banner_' . time() . '_' . uniqid() . '.' . $fileExt;
            $filePath = $uploadDir . $filename;

            // Move uploaded file
            if (move_uploaded_file($file['tmp_name'], $filePath)) {
                return $filename;
            }

            return false;
        }

        public function addBanner($image_file) {
            try {
                $image_name = $this->handleImageUpload($image_file);
                
                if (!$image_name) {
                    return false;
                }

                $db = Database::getInstance();
                $connection = $db->getConnection();

                $sql = "INSERT INTO banners (image, created_at) VALUES (:image, NOW())";
                $stmt = $connection->prepare($sql);
                $stmt->bindValue(':image', $image_name, PDO::PARAM_STR);
                
                return $stmt->execute();

            } catch(PDOException $e) {
                error_log("Error adding Banner " . $e->getMessage());
                return false;
            }
        }

        public function getBanners() {
            try{    
            $db = Database::getInstance();
            $connection = $db->getConnection();

                $sql = "SELECT banner_id, image FROM banners ORDER BY created_at DESC";
                $stmt = $connection->prepare($sql);
                $stmt->execute();

                return $stmt->fetchAll(PDO::FETCH_OBJ);

            } catch(PDOException $e) {
                error_log("Error getting Banners " . $e->getMessage());
                return [];
            }
        }

        public function deleteImage(int $banner_id) {
            if(empty($banner_id)) {
                return false;
            }

            try{
                $db = Database::getInstance();
                $connection = $db->getConnection();

                $sql = "DELETE FROM banners WHERE banner_id = :banner_id";
                $stmt = $connection->prepare($sql);
                $stmt->bindValue(':banner_id', $banner_id, PDO::PARAM_INT);
                $stmt->execute();
                return $stmt->rowCount() > 0;
            } catch(PDOException $e) {
                error_log("Error deleting image " . $e->getMessage());
                return [];
            }
        }

    }

?>
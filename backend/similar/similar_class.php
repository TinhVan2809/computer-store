<?php

    require_once '../connect.php';
 {/* Láy sản phẩm CÓ THỂ BẠN CŨNG THÍCH (tương tự) */}
      
        {/* không truyền luôn category_id từ frontend
        User có thể sửa URL → lấy sai sản phẩm
        Mất tính bảo mật logic
        Backend mất quyền kiểm soát */}
    
    class Similar_class{

        // Lấy category_id trước
        public function getCategoryIdFromProduct(int $product_id) {
            if(empty($product_id)) {
                return false;
            }

            try{
                $db = Database::getInstance();
                $connection = $db->getConnection();

                $sql = "SELECT category_id FROM products WHERE product_id = :product_id";
                $stmt = $connection->prepare($sql);
                $stmt->bindValue(':product_id', $product_id, PDO::PARAM_INT);
                $stmt->execute();

                return $stmt->fetchAll(PDO::FETCH_OBJ);

            } catch(PDOException $e) {
                error_log("Errror getting category_id " . $e->getMessage());
                return [];
            }
        }

        // Lấy sản phẩm tương tự dựa vào category_id nhưng khác product_id hiện tại (tránh bị trùng id product hiện tại);
        public function getSimilarProducts(int $category_id, int $product_id )  {
            try{
                $db = Database::getInstance();
                $connection = $db->getConnection();

                $sql = "SELECT product_id, product_name, product_price, image_main FROM products WHERE category_id = :category_id AND product_id != :product_id ";
                $stmt = $connection->prepare($sql);
                $stmt->bindValue(':category_id', $category_id, PDO::PARAM_INT);
                $stmt->bindValue(':product_id', $product_id, PDO::PARAM_INT);
                $stmt->execute();

                return $stmt->fetchAll(PDO::FETCH_OBJ);

            } catch(PDOException $e) {
                error_log("Errror getting similar " . $e->getMessage());
                return [];
            }
        }
    }

?>
<?php

     require_once '../connect.php';


    class cart_class {
        public function getCountCart($user_id) {

            try {
                $db = Database::getInstance();
                $connection = $db->getConnection();

                $sql = "SELECT COUNT(*) AS total FROM carts WHERE user_id = ?";
                $count = $connection->prepare($sql);
                $count->execute([$user_id]);
                $row = $count->fetch(PDO::FETCH_ASSOC);
                return isset($row['total']) ? (int)$row['total'] : 0;
            } catch (PDOException $e) {
                error_log("Error Counting " . $e->getMessage());
                return 0; // Return 0 for count on error
            }
        }

        public function getCartByUser($user_id, int $limit = 10, int $offset = 0 ) {
            if(empty($user_id)) {
                return false;
            }

            try{
                $db = Database::getInstance();
                $connection = $db->getConnection();
                $sql = "SELECT c.cart_id, c.product_id, c.user_id, c.add_at, c.quantity, p.product_name, p.image_main, p.product_price, p.product_sale
                    FROM carts c
                    LEFT JOIN products p ON c.product_id = p.product_id
                    WHERE c.user_id = :user_id
                    ORDER BY c.add_at DESC
                    LIMIT :limit OFFSET :offset";

                $get = $connection->prepare($sql);
                $get->bindValue(':user_id', $user_id, PDO::PARAM_INT);
                $get->bindValue(':limit', $limit, PDO::PARAM_INT);
                $get->bindValue(':offset', $offset, PDO::PARAM_INT);
                $get->execute();

                return $get->fetchAll(PDO::FETCH_OBJ);
            } catch(PDOException $e) {
                error_log("Error getting cart by user " . $e->getMessage());
                return [];
            }
        }

        public function addToCart($user_id, $product_id, $quantity = 1) {
            if (empty($user_id) || empty($product_id) || !is_numeric($quantity) || $quantity <= 0) {
                error_log("User ID or Product ID is empty for addToCart.");
                return false;
            }
        
            try {
                $db = Database::getInstance();
                $connection = $db->getConnection();
        
                // Kiểm tra xem sản phẩm đã có trong giỏ hàng của người dùng chưa
                $checkSql = "SELECT cart_id, quantity FROM carts WHERE user_id = :user_id AND product_id = :product_id";
                $checkStmt = $connection->prepare($checkSql);
                $checkStmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
                $checkStmt->bindValue(':product_id', $product_id, PDO::PARAM_INT);
                $checkStmt->execute();
                $existingCartItem = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
                if ($existingCartItem) {
                    // Nếu đã có, cập nhật số lượng
                    $newQuantity = $existingCartItem['quantity'] + $quantity;
                    $sql = "UPDATE carts SET quantity = :quantity, add_at = NOW() WHERE cart_id = :cart_id";
                    $stmt = $connection->prepare($sql);
                    $stmt->bindValue(':quantity', $newQuantity, PDO::PARAM_INT);
                    $stmt->bindValue(':cart_id', $existingCartItem['cart_id'], PDO::PARAM_INT);
                } else {
                    // Nếu chưa có, thêm sản phẩm mới vào giỏ hàng với số lượng được cung cấp
                    $sql = "INSERT INTO carts (user_id, product_id, quantity, add_at) VALUES (:user_id, :product_id, :quantity, NOW())";
                    $stmt = $connection->prepare($sql);
                    $stmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
                    $stmt->bindValue(':product_id', $product_id, PDO::PARAM_INT);
                    $stmt->bindValue(':quantity', $quantity, PDO::PARAM_INT);
                }
        
                return $stmt->execute();
            } catch (PDOException $e) {
                error_log("Error adding product to cart: " . $e->getMessage());
                return false;
            }
        }

        public function updateCartQuantity($cart_id, $new_quantity) {
            $cart_id = (int)$cart_id;
            $new_quantity = (int)$new_quantity;
    
            if ($cart_id <= 0) {
                error_log("Invalid cart_id for update.");
                return false;
            }
    
            try {
                $db = Database::getInstance();
                $connection = $db->getConnection();
    
                if ($new_quantity <= 0) {
                    // Nếu số lượng là 0 hoặc nhỏ hơn, xóa sản phẩm
                    return $this->deleteCartById($cart_id);
                } else {
                    // Ngược lại, cập nhật số lượng
                    $sql = "UPDATE carts SET quantity = :quantity WHERE cart_id = :cart_id";
                    $stmt = $connection->prepare($sql);
                    $stmt->bindValue(':quantity', $new_quantity, PDO::PARAM_INT);
                    $stmt->bindValue(':cart_id', $cart_id, PDO::PARAM_INT);
                    return $stmt->execute();
                }
            } catch (PDOException $e) {
                error_log("Error updating cart quantity: " . $e->getMessage());
                return false;
            }
        }

        public function deleteCartById($cart_id) {
        if (empty($cart_id)) {
            return false;
        }

        try {
            $db = Database::getInstance();
            $connection = $db->getConnection();
            $sql = "DELETE FROM carts WHERE cart_id = :cart_id";
            $delete = $connection->prepare($sql);
            $delete->bindValue('cart_id',  $cart_id, PDO::PARAM_INT);

            return $delete->execute();
           
        } catch (PDOException $e) {
            error_log("Error Deleting " . $e->getMessage());
            return false;
        }
        }

     
    }

?>
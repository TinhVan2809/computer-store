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
                return [];
            }
        }

        public function getCartByUser($user_id, int $limit = 10, int $offset = 0 ) {
            if(empty($user_id)) {
                return false;
            }

            try{
                $db = Database::getInstance();
                $connection = $db->getConnection();
                $sql = "SELECT c.cart_id, c.product_id, c.user_id, c.add_at, p.product_name, p.image_main, p.product_quantity, p.product_price, p.product_sale
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
<?php
require_once '../connect.php';
    class Order_class {
    
       // Lấy tất cả đơn hàng của một user (Xem người này đã đặt bao nhiêu đơn rồi)
       public function getOrdersByUser(int $user_id, int $limit = 10, $offset = 0) {
         if(!$user_id) {
                return false;
            }
        try{
            $db = Database::getInstance();
            $connection = $db->getConnection();

            $sql = "SELECT * FROM orders WHERE user_id = :user_id LIMIT :limit OFFSET :offset";
            $stmt = $connection->prepare($sql);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_OBJ);

        } catch(PDOException $e) {
            error_log("Error getting all orders by user " . $e->getMessage());
            return [];
        }
       }

       public function countOrdersByUser(int $user_id) {
            if(!$user_id) {
                return false;
            }
            try{
                $db = Database::getInstance();
                $connection = $db->getConnection();
                $sql = "SELECT COUNT(*) as total_orders FROM orders WHERE user_id = :user_id";
                $stmt = $connection->prepare($sql);
                $stmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
                $stmt->execute();

                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                return isset($row['total_orders']) ? (int)$row['total_orders'] : 0;
                
            } catch(PDOException $e) {
                error_log("error counting orders by user " . $e->getMessage());
                return [];
            }  
       }
    }
?>
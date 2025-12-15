<?php

require_once '../connect.php';

    class Notification_class {

        public function getAllNotificationsByUser(int $user_id, int $limit = 10, int $offset = 0) 
         {
             if(empty($user_id) ) 
            {
                return false;
            }
            try{
                $db = Database::getInstance();
                $connection = $db->getConnection();
                // Explicitly select columns and use aliases to avoid column name collisions
                // This is safer than SELECT n.*, o.*
                $sql = "SELECT 
                            n.*, 
                            o.order_id AS order_info_id, 
                            o.total_amount AS order_total_amount
                        FROM notifications n 
                        LEFT JOIN orders o ON o.order_id = n.order_id
                        WHERE n.user_id = :user_id
                        ORDER BY n.notification_date DESC
                        LIMIT :limit OFFSET :offset";
                $stmt = $connection->prepare($sql);
                $stmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
                $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
                $stmt->execute();

                return $stmt->fetchAll(PDO::FETCH_OBJ);
            } catch(PDOException $e) {
                error_log("Error getting Notification By User " . $e->getMessage());
                echo json_encode("Error getting Notification By User " . $e->getMessage());
                return [];
            }
            
        }

         public function getCountNotificationsByUser(int $user_id)
        {
             if (empty($user_id)) {
            return 0;
        }

        try {
            $db = Database::getInstance();
            $connection = $db->getConnection();

            $sql = "SELECT COUNT(*) AS total FROM notifications WHERE user_id = :user_id";
            $stmt = $connection->prepare($sql);
            $stmt->execute([':user_id' => $user_id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return isset($row['total']) ? (int)$row['total'] : 0;
        } catch (PDOException $e) {
            error_log("Error Counting " . $e->getMessage());
            return 0;
        }
    }
    }

?>
<?php

    require_once '../connect.php';

    class Address_class {

        // Lấy danh sách địa chỉ của user
        public function getAddressesByUser($user_id, int $limit = 10, int $offset = 0) {
            if(empty($user_id)) {
                return false;
            }

            try{
                $db = Database::getInstance();
                $connection = $db->getConnection();
                $sql = "SELECT * FROM user_addresses WHERE user_id = :user_id LIMIT :limit OFFSET :offset";
                $stmt = $connection->prepare($sql);

                $stmt->bindValue('user_id', $user_id, PDO::PARAM_INT);
                $stmt->bindValue('limit', $limit, PDO::PARAM_INT);
                $stmt->bindValue('offset', $offset, PDO::PARAM_INT);

                $stmt->execute();

                return $stmt->fetchAll(PDO::FETCH_OBJ);
                
            } catch(PDOException $e) {
                error_log("Error Getting Addresses " . $e->getMessage());
                return [];
            }
        }

        public function getCountAddresses(int $user_id) {
            try{
                $db = Database::getInstance();
                $connection = $db->getConnection();
                $sql = "SELECT COUNT(user_addresses_id) AS total FROM user_addresses WHERE user_id = :user_id";
                $stmt = $connection->prepare($sql);
                $stmt->execute([':user_id' => $user_id]);
                
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                 return isset($row['total']) ? (int)$row['total'] : 0;

            } catch(PDOException $e) {
                error_log("Error couting addresses " . $e->getMessage());
                return [];
            }
        }
    }

?>
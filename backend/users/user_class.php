<?php

require_once '../connect.php';
class Users_class {

    public function getUsers(int $limit = 50, int $offset = 0) {
        try{
            $db = Database::getInstace();
            $connection = $db->getConnection();
            $sql = "SELECT user_id, username, email FROM users";
            $get = $connection->prepare($sql);
            $get->bindParam(':limit', $limit, PDO::PARAM_INT);
            $get->bindParam(':offset', $offset, PDO::PARAM_INT);
            $get->execute();
            return $get->fetchAll(PDO::FETCH_OBJ);
            } catch(PDOException $e) {
                error_log("Error Getting Products " . $e->getMessage());
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
}

?>
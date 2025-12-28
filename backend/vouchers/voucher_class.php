<?php


    require_once '../connect.php';

    class Voucher_class {

        public function getVouchers(int $limit = 10, $offset = 0) {
            try{
                $db = Database::getInstance();
                 $connection = $db->getConnection();

                $sql = "SELECT * FROM vouchers";
                $stmt = $connection->prepare($sql);
                $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
                $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
                $stmt->execute();
                return $stmt->fetchAll(PDO::FETCH_OBJ);

            } catch(PDOException $e) {
                error_log("Error getting vouchers " . $e->getMessage());
                return [];
            }
        }
    }

?>
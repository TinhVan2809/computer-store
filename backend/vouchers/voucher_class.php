<?php


    require_once '../connect.php';

    class Voucher_class {

        public function getVouchers(int $limit = 10, $offset = 0) {
            try{
                $db = Database::getInstance();
                 $connection = $db->getConnection();

                $sql = "SELECT * FROM vouchers LIMIT :limit OFFSET :offset";
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

    public function getCountVouchers()
    {
        try {
            $db = Database::getInstance();
            $connection = $db->getConnection();
            $sql = "SELECT COUNT(*) AS total_vouchers FROM vouchers";
            $count = $connection->prepare($sql);
            $count->execute();
            $row = $count->fetch(PDO::FETCH_ASSOC);
            return isset($row['total_vouchers']) ? (int)$row['total_vouchers'] : 0;
        } catch (PDOException $e) {
            error_log("Error counting vouchers", $e->getMessage());
            return [];
        }
    }
    }

?>
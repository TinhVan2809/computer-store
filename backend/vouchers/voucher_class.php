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

    public function deleteVoucher($voucher_id) {
        try {
            $db = Database::getInstance();
            $connection = $db->getConnection();
            
            $sql = "DELETE FROM vouchers WHERE voucher_id = :voucher_id";
            $stmt = $connection->prepare($sql);
            $stmt->bindValue(':voucher_id', $voucher_id, PDO::PARAM_INT);
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error deleting voucher: " . $e->getMessage());
            return false;
        }
    }

        public function getVoucherById($voucher_id) {
            try{    
                    $db = Database::getInstance();
                    $connection = $db->getConnection();

                    $sql = "SELECT * FROM vouchers WHERE voucher_id = :voucher_id";
                    $stmt = $connection->prepare($sql);
                    $stmt->bindValue(':voucher_id', $voucher_id, PDO::PARAM_INT);
                    $stmt->execute();
                    return $stmt->fetch(PDO::FETCH_OBJ);
                
            } catch(PDOException $e) {
                error_log("Error getting voucher by id: " . $e->getMessage());
                return null;
            }
        }

        public function updateVoucher($voucher_id, $data) {
            try {
                $db = Database::getInstance();
                $connection = $db->getConnection();
                
                $sql = "UPDATE vouchers SET 
                        voucher_name = :voucher_name,
                        sale = :sale,
                        min_total_amount = :min_total_amount,
                        start_at = :start_at,
                        end_at = :end_at
                        WHERE voucher_id = :voucher_id";
                
                $stmt = $connection->prepare($sql);
                $stmt->bindValue(':voucher_id', $voucher_id, PDO::PARAM_INT);
                $stmt->bindValue(':voucher_name', $data['voucher_name'], PDO::PARAM_STR);
                $stmt->bindValue(':sale', $data['sale'], PDO::PARAM_STR);
                $stmt->bindValue(':min_total_amount', $data['min_total_amount'], PDO::PARAM_INT);
                $stmt->bindValue(':start_at', $data['start_at'], PDO::PARAM_STR);
                $stmt->bindValue(':end_at', $data['end_at'], PDO::PARAM_STR);
                
                $stmt->execute();
                return $stmt->rowCount() > 0;
                
            } catch (PDOException $e) {
                error_log("Error updating voucher: " . $e->getMessage());
                return false;
            }
        }

    }

?>
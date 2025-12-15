<?php
    class Order_class {
    
        public function getOrderByUser(int $user_id, int $limit = 10, int $ioffset = 0) {
            if(empty($user_id)) {
                return false;
            }

            try{
                $db = Database::getInstance();
                $connection = $db->getConnection();

              

            } catch(PDOException $e) {
                error_log("Error Getting Oder By User ." . $e->getMessage());
                return [];
            }
        }
    }
?>
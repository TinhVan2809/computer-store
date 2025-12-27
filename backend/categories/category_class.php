<?php

    require_once '../connect.php';

    class categories_class {

        public function getCategories(int $limit = 100, int $offset = 0) {
            try{
                // sanitize/normalize inputs
                $limit = $limit > 0 ? $limit : 100;
                $offset = $offset >= 0 ? $offset : 0;

                $db = Database::getInstance();
                $connection = $db->getConnection();
                $sql = "SELECT * FROM categories 
                        ORDER BY category_name ASC 
                        LIMIT :limit OFFSET :offset";
                $get = $connection->prepare($sql);
                $get->bindValue(':limit', $limit, PDO::PARAM_INT);
                $get->bindValue(':offset', $offset, PDO::PARAM_INT);
                $get->execute();

                return $get->fetchAll(PDO::FETCH_OBJ);

            } catch(PDOException $e) {
                error_log("Error Getting Categories " . $e->getMessage());
                return [];
            }
        }

    public function getCountCategories()
    {

        try {
            $db = Database::getInstance();
            $connection = $db->getConnection();

            $sql = "SELECT COUNT(*) AS total FROM categories";
            $count = $connection->prepare($sql);
            $count->execute();
            $row = $count->fetch(PDO::FETCH_ASSOC);
            return isset($row['total']) ? (int)$row['total'] : 0;
        } catch (PDOException $e) {
            error_log("Error Counting " . $e->getMessage());
            return 0;
        }
    }

    }

?>
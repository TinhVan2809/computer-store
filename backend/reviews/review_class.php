<?php

require_once '../connect.php';

class Review_class
{
    public function addReview(int $user_id, int $product_id, $rating, $comment,  $image)
    {
        if (empty($user_id) && empty($product_id)) {
            return false;
        }
        // Validate rating (1–5)
        if ($rating < 1 || $rating > 5) {
            return [
                'success' => false,
                'message' => 'Rating không hợp lệ'
            ];
        }

        try {
            $db = Database::getInstance();
            $connection = $db->getConnection();
            $sql = "
                    INSERT INTO votes (user_id, product_id, rating, comment, image)
                    VALUES (:user_id, :product_id, :rating, :comment, :image)
                ";

            $stmt = $connection->prepare($sql);

            $result = $stmt->execute([
                ':user_id'    => $user_id,
                ':product_id' => $product_id,
                ':rating'     => $rating,
                ':comment'    => $comment,
                ':image'      => $image
            ]);

            if ($result) {
                return [
                    'success' => true,
                    'vote_id' => $connection->lastInsertId()
                ];
            }

            return [
                'success' => false,
                'message' => 'Không thể thêm review'
            ];
        } catch (PDOException $e) {
            error_log("Error add review " . $e->getMessage());
            return [];
        }
    }

    public function getAllReviewsByProduct(int $product_id, int $limit = 10, $offset = 0) {
          if(!$product_id) {
                return false;
            }
        try{
            $db = Database::getInstance();
            $connection = $db->getConnection();

            $sql = "SELECT v.*, u.username, u.avata, u.user_id FROM votes v LEFT JOIN users u ON u.user_id = v.user_id WHERE v.product_id = :product_id  ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
            $get = $connection->prepare($sql);
            $get->bindValue(':product_id', $product_id, PDO::PARAM_INT);
            $get->bindValue(':limit', $limit, PDO::PARAM_INT);
            $get->bindValue(':offset', $offset, PDO::PARAM_INT);
            $get->execute();
            return $get->fetchAll(PDO::FETCH_OBJ);
             
        } catch(PDOException $e) {
            error_log("Error get All Reviews by product");
            return [];
        }
    }

    public function countReviewsByProduct(int $product_id ) {
            if(!$product_id) {
                return false;
            }
            try{
                $db = Database::getInstance();
                $connection = $db->getConnection();
                $sql = "SELECT COUNT(*) as total_reviews FROM votes WHERE product_id = :product_id";
                $stmt = $connection->prepare($sql);
                $stmt->bindValue(':product_id', $product_id, PDO::PARAM_INT);
                $stmt->execute();

                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                return isset($row['total_reviews']) ? (int)$row['total_reviews'] : 0;
                
            } catch(PDOException $e) {
                error_log("error counting ewviews by product " . $e->getMessage());
                return [];
            }  
       }

             public function deleteReview($vote_id) {
                try {
                    $db = Database::getInstance();
                    $connection = $db->getConnection();
                    
                    $sql = "DELETE FROM votes WHERE vote_id = :vote_id";
                    $stmt = $connection->prepare($sql);
                    $stmt->bindValue(':vote_id', $vote_id, PDO::PARAM_INT);
                    $stmt->execute();
                    
                    return $stmt->rowCount() > 0;
                } catch (PDOException $e) {
                    error_log("Error deleting reviews: " . $e->getMessage());
                    return false;
        }
    }
}

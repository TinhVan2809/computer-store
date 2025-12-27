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

    public function getAllReviewsByProduct() {
        try{
            $db = Database::getInstance();
            $connection = $db->getConnection();

            $sql = "SELECT user_id, product_id, rating, comment, image FROM votes WHERE product_id = ?";
            $get = $connection->prepare($sql);
            $get->execute();
            return $get->fetchAll(PDO::FETCH_OBJ);
             
        } catch(PDOException $e) {
            error_log("Error get All Reviews by product");
            return [];
        }
    }
}

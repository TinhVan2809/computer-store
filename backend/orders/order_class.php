<?php
require_once '../connect.php';
class Order_class
{

    // Lấy tất cả đơn hàng của một user (Xem người này đã đặt bao nhiêu đơn rồi)
    public function getOrdersByUser(int $user_id, int $limit = 10, $offset = 0)
    {
        if (!$user_id) {
            return false;
        }
        try {
            $db = Database::getInstance();
            $connection = $db->getConnection();

            $sql = "SELECT * FROM orders WHERE user_id = :user_id LIMIT :limit OFFSET :offset";
            $stmt = $connection->prepare($sql);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_OBJ);
        } catch (PDOException $e) {
            error_log("Error getting all orders by user " . $e->getMessage());
            return [];
        }
    }

    public function countOrdersByUser(int $user_id)
    {
        if (!$user_id) {
            return false;
        }
        try {
            $db = Database::getInstance();
            $connection = $db->getConnection();
            $sql = "SELECT COUNT(*) as total_orders FROM orders WHERE user_id = :user_id";
            $stmt = $connection->prepare($sql);
            $stmt->bindValue(':user_id', $user_id, PDO::PARAM_INT);
            $stmt->execute();

            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return isset($row['total_orders']) ? (int)$row['total_orders'] : 0;
        } catch (PDOException $e) {
            error_log("error counting orders by user " . $e->getMessage());
            return [];
        }
    }


    // Lấy 10 sản phẩm bán chạy nhất
    public function takeTheBestSellingThisMonth()
    {
        try {
            $db = Database::getInstance();
            $connecton = $db->getConnection();

            $sql = "SELECT p.product_id, p.product_name, SUM(oi.quantity) total_sold
                    FROM orders o
                    JOIN order_items oi ON o.order_id = oi.order_id
                    JOIN products p ON p.product_id = oi.product_id
                    WHERE o.status = 'pending'
                    AND o.created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                    AND o.created_at < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
                    GROUP BY p.product_id
                    ORDER BY total_sold DESC
                    LIMIT 10";

            $stmt = $connecton->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_OBJ);
        } catch (PDOException $e) {
            error_log("Error Take the best-selling product" . $e->getMessage());
            return [];
        }
    }

    public function takeTheBestSellingLastMonth()
    {
        try {
            $db = Database::getInstance();
            $connecton = $db->getConnection();

            $sql = "SELECT p.product_id, p.product_name, SUM(oi.quantity) total_sold
                    FROM orders o
                    JOIN order_items oi ON o.order_id = oi.order_id
                    JOIN products p ON p.product_id = oi.product_id
                    WHERE o.status = 'pending' 
                    AND o.created_at >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01')
                    AND o.created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01')
                    GROUP BY p.product_id
                    ORDER BY total_sold DESC
                    LIMIT 10";

            $stmt = $connecton->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_OBJ);
        } catch (PDOException $e) {
            error_log("Error Take the best-selling product" . $e->getMessage());
            return [];
        }
    }
}

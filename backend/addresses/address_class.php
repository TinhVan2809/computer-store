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
                $sql = "SELECT * FROM user_addresses WHERE user_id = :user_id ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
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

        public function add_address(array $address_data) {
            try {
                $db = Database::getInstance();
                $connection = $db->getConnection();

                $sql = "INSERT INTO user_addresses (
                    user_id,
                    recipient_name,
                    phone,
                    province_id,
                    province_name,
                    district_id,
                    district_name,
                    ward_id,
                    ward_name,
                    specific_address,
                    is_default,
                    label
                ) VALUES (
                    :user_id,
                    :recipient_name,
                    :phone,
                    :province_id,
                    :province_name,
                    :district_id,
                    :district_name,
                    :ward_id,
                    :ward_name,
                    :specific_address,
                    :is_default,
                    :label
                )";

                $stmt = $connection->prepare($sql);

                $stmt->bindValue(':user_id', $address_data['user_id'], PDO::PARAM_INT);
                $stmt->bindValue(':recipient_name', $address_data['recipient_name'], PDO::PARAM_STR);
                $stmt->bindValue(':phone', $address_data['phone'], PDO::PARAM_STR);
                $stmt->bindValue(':province_id', $address_data['province_id'], PDO::PARAM_INT);
                $stmt->bindValue(':province_name', $address_data['province_name'], PDO::PARAM_STR);
                $stmt->bindValue(':district_id', $address_data['district_id'], PDO::PARAM_INT);
                $stmt->bindValue(':district_name', $address_data['district_name'], PDO::PARAM_STR);
                $stmt->bindValue(':ward_id', $address_data['ward_id'], PDO::PARAM_STR);
                $stmt->bindValue(':ward_name', $address_data['ward_name'], PDO::PARAM_STR);
                $stmt->bindValue(':specific_address', $address_data['specific_address'], PDO::PARAM_STR);
                $stmt->bindValue(':is_default', $address_data['is_default'], PDO::PARAM_INT);
                $stmt->bindValue(':label', $address_data['label'], PDO::PARAM_STR);

                if ($stmt->execute()) {
                    return $connection->lastInsertId();
                }

                return false;
            } catch (PDOException $e) {
                error_log("Error adding address: " . $e->getMessage());
                return false;
            }
        }
    }

?>
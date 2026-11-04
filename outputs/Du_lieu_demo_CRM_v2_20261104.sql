-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: backline_crm_demo_v2_20261104124703_4e1565
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `customer_interests`
--

DROP TABLE IF EXISTS `customer_interests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_interests` (
  `customer_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `interest_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`customer_id`,`interest_id`),
  KEY `fk_interest_catalog` (`interest_id`),
  CONSTRAINT `fk_interest_catalog` FOREIGN KEY (`interest_id`) REFERENCES `interests` (`id`),
  CONSTRAINT `fk_interest_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_interests`
--

LOCK TABLES `customer_interests` WRITE;
/*!40000 ALTER TABLE `customer_interests` DISABLE KEYS */;
INSERT INTO `customer_interests` VALUES ('5e3fe782-91fb-49b4-8ed5-5f6f9605eff3','design'),('6b1b7c5f-a2ec-4ce7-9570-1d592fde0c18','design'),('71736766-54c4-4ca6-a5d2-4c95eac2ce81','design'),('96e04221-02f9-45bf-b47b-28dcb35904b9','design'),('9b568026-57e4-47f0-a331-bea09fe27e60','design'),('c0cd4216-cf6c-4fc6-a676-b4e4a06c0422','design'),('cefcaf80-0616-4a53-b03f-bbe45f891764','design'),('ea1f9643-f0bc-4cc1-aa84-c7f1e773835c','design'),('3a36397e-2306-4ccd-aac4-ee1c31bf1559','gaming'),('3db2e962-10c6-42b6-a5ab-a42e495f0cd9','gaming'),('65896043-a1c6-43b7-a02e-a3b411aa5bd3','gaming'),('6b1b7c5f-a2ec-4ce7-9570-1d592fde0c18','gaming'),('6c609307-ebea-419a-b93d-0314a87b9caa','gaming'),('96e04221-02f9-45bf-b47b-28dcb35904b9','gaming'),('cefcaf80-0616-4a53-b03f-bbe45f891764','gaming'),('0e921993-0eb6-4724-8c1a-813ececc0e0b','learning'),('4d219a55-2271-4af3-9c60-fa835bc0b84b','learning'),('6c609307-ebea-419a-b93d-0314a87b9caa','learning'),('9b568026-57e4-47f0-a331-bea09fe27e60','learning'),('e8eeb18c-9795-4198-be82-befaa4201aca','learning'),('0e921993-0eb6-4724-8c1a-813ececc0e0b','office'),('3d948947-b55a-4d00-8805-2f120dc334d1','office'),('5e3fe782-91fb-49b4-8ed5-5f6f9605eff3','office'),('65896043-a1c6-43b7-a02e-a3b411aa5bd3','office'),('71736766-54c4-4ca6-a5d2-4c95eac2ce81','office'),('e8eeb18c-9795-4198-be82-befaa4201aca','office'),('ea1f9643-f0bc-4cc1-aa84-c7f1e773835c','office'),('4d219a55-2271-4af3-9c60-fa835bc0b84b','other'),('93a00b56-d02f-4411-b174-d6ce2435f38a','other'),('3a36397e-2306-4ccd-aac4-ee1c31bf1559','programming'),('3db2e962-10c6-42b6-a5ab-a42e495f0cd9','programming'),('c0cd4216-cf6c-4fc6-a676-b4e4a06c0422','programming');
/*!40000 ALTER TABLE `customer_interests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_recovery_codes`
--

DROP TABLE IF EXISTS `customer_recovery_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer_recovery_codes` (
  `customer_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code_hash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `used_at` datetime DEFAULT NULL,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `code_hash` (`code_hash`),
  CONSTRAINT `fk_customer_recovery_code` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_recovery_codes`
--

LOCK TABLES `customer_recovery_codes` WRITE;
/*!40000 ALTER TABLE `customer_recovery_codes` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_recovery_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `demo_datasets`
--

DROP TABLE IF EXISTS `demo_datasets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `demo_datasets` (
  `name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `installed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `summary_json` json NOT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `demo_datasets`
--

LOCK TABLES `demo_datasets` WRITE;
/*!40000 ALTER TABLE `demo_datasets` DISABLE KEYS */;
INSERT INTO `demo_datasets` VALUES ('backline-demo-v2','2026-11-04 19:47:04','{\"surveys\": 12, \"accounts\": 21, \"feedback\": 54, \"products\": 14, \"customers\": 18, \"questions\": 24, \"responses\": 18, \"scenarios\": [{\"id\": \"aab0ef87-889b-4a9f-8588-2fb2c7867e58\", \"scope\": \"ALL\", \"title\": \"Mức độ hài lòng về dịch vụ\", \"status\": \"OPEN\"}, {\"id\": \"87940458-b681-4bb6-9a86-62cbb580d279\", \"scope\": \"ALL\", \"title\": \"Nhu cầu mua sắm PC và laptop\", \"status\": \"OPEN\"}, {\"id\": \"f7ab86a0-d881-4c11-981d-5f09bc7b91db\", \"scope\": \"ALL\", \"title\": \"Trải nghiệm bảo hành và hỗ trợ\", \"status\": \"CLOSED\"}, {\"id\": \"7da3452e-502b-4a47-9eca-903f01c1b54e\", \"scope\": \"FILTER\", \"title\": \"Khảo sát ý tưởng ưu đãi thành viên\", \"status\": \"DRAFT\"}, {\"id\": \"8e8d95b1-6523-48f8-9051-d09d23608f28\", \"scope\": \"ALL\", \"title\": \"Đánh giá trải nghiệm mua hàng tháng trước\", \"status\": \"OPEN\"}, {\"id\": \"8bafa003-480f-4ca1-b443-4d20b3d4d281\", \"scope\": \"SELECTED\", \"title\": \"Khảo sát chương trình chăm sóc khách hàng\", \"status\": \"CLOSED\"}, {\"id\": \"076d96fa-abdb-4150-9db7-dd34b9afb302\", \"scope\": \"FILTER\", \"title\": \"Khảo sát Gaming/Đồ họa 15–20 tuổi\", \"status\": \"OPEN\"}, {\"id\": \"26b65242-0467-4bbf-91b4-3cf7c10a3098\", \"scope\": \"SELECTED\", \"title\": \"Khảo sát khách được chọn riêng\", \"status\": \"OPEN\"}, {\"id\": \"945d5efe-5020-49fb-a9c2-fde114070167\", \"scope\": null, \"title\": \"[Bản nháp] Chưa thiết lập phạm vi\", \"status\": \"DRAFT\"}, {\"id\": \"c9c2227b-4e43-422c-bcd2-35c8a989c818\", \"scope\": \"ALL\", \"title\": \"[Bản nháp] Đã chọn Tất cả\", \"status\": \"DRAFT\"}, {\"id\": \"f915a1d1-f6f4-4ad5-ac43-a97f7a7f3f58\", \"scope\": \"SELECTED\", \"title\": \"[Bản nháp] Đã chọn từng khách\", \"status\": \"DRAFT\"}, {\"id\": \"a31ec62b-a5b4-41d4-a7e2-b1ab34e6acaf\", \"scope\": \"FILTER\", \"title\": \"Khảo sát khách hàng 25–45 tuổi\", \"status\": \"OPEN\"}], \"recipients\": 83, \"answerDetails\": 44, \"interestLinks\": 32, \"recoveryHistory\": 2}');
/*!40000 ALTER TABLE `demo_datasets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `feedback_type` enum('Góp ý','Khen ngợi','Báo lỗi / Khiếu nại','Câu hỏi') COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` tinyint NOT NULL,
  `title` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('NEW','IN_PROGRESS','RESOLVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  `reply_content` text COLLATE utf8mb4_unicode_ci,
  `replied_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `replied_at` datetime DEFAULT NULL,
  `is_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `hidden_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_feedback_product` (`product_id`),
  KEY `fk_feedback_replier` (`replied_by`),
  KEY `idx_feedback_customer` (`customer_id`),
  KEY `idx_feedback_status` (`status`),
  CONSTRAINT `fk_feedback_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_feedback_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_feedback_replier` FOREIGN KEY (`replied_by`) REFERENCES `users` (`id`),
  CONSTRAINT `chk_feedback_rating` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback`
--

LOCK TABLES `feedback` WRITE;
/*!40000 ALTER TABLE `feedback` DISABLE KEYS */;
INSERT INTO `feedback` VALUES ('018812f1-49d1-4af5-9328-26b99e03824a','6b1b7c5f-a2ec-4ce7-9570-1d592fde0c18','c8c8989f-2faa-4487-85ec-bdccefe70b4c','Khen ngợi',4,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-08-12 19:47:03','2026-11-04 19:47:04'),('0244ec60-5eb7-49aa-b3ea-8b96e6c768ba','93a00b56-d02f-4411-b174-d6ce2435f38a','5e4d2be3-e962-48d8-a173-918f1681df51','Báo lỗi / Khiếu nại',1,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-08-27 19:47:03',1,'2026-08-27 19:47:03','2026-08-25 19:47:03','2026-11-04 19:47:04'),('02e631fe-2ea6-43db-b697-6fd097272e6a','96e04221-02f9-45bf-b47b-28dcb35904b9','487fe40a-2b7d-430a-ad12-ab50a8d10acd','Báo lỗi / Khiếu nại',5,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-08-21 19:47:03','2026-11-04 19:47:04'),('03747fef-246a-4676-b536-90e09e07462d','71736766-54c4-4ca6-a5d2-4c95eac2ce81','f5c7af60-a9f3-428c-bb31-6defbffce7d3','Góp ý',1,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-09-26 19:47:03',0,NULL,'2026-09-24 19:47:03','2026-11-04 19:47:04'),('03788aa7-9fa8-437b-8cbc-651aed493312','9b568026-57e4-47f0-a331-bea09fe27e60','91ce47e4-a047-40f2-af52-510220d6247c','Góp ý',5,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-09-02 19:47:03',0,NULL,'2026-08-31 19:47:03','2026-11-04 19:47:04'),('056826c9-1163-4088-82cf-123a867bf384','5e3fe782-91fb-49b4-8ed5-5f6f9605eff3','01b3e367-5f93-4423-bb94-103513ef76ff','Câu hỏi',2,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-08-14 19:47:03','2026-11-04 19:47:04'),('09d4364e-8585-4dd1-8c10-2965f933ac50','3db2e962-10c6-42b6-a5ab-a42e495f0cd9','08ed8b68-96dd-4b24-bea5-61d5d85ab57a','Câu hỏi',3,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-08-18 19:47:03','2026-11-04 19:47:04'),('0b4fbd0f-6c54-4bd8-bf24-d0fce4377d93','5e3fe782-91fb-49b4-8ed5-5f6f9605eff3','f7c145a8-a9d8-400c-979d-bd807987f438','Câu hỏi',1,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-19 19:47:03','2026-11-04 19:47:04'),('0bf8076c-ca9f-4739-a8ac-f016ea079fe5','e8eeb18c-9795-4198-be82-befaa4201aca','f5c7af60-a9f3-428c-bb31-6defbffce7d3','Báo lỗi / Khiếu nại',5,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-10 19:47:03','2026-11-04 19:47:04'),('0cbc02ec-989b-4828-929a-80525fade85b','0b3ddeae-cfc7-44c6-aba6-065d846f8b2d','f5c7af60-a9f3-428c-bb31-6defbffce7d3','Góp ý',4,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-08-27 19:47:03','2026-11-04 19:47:04'),('13806f3d-a3ee-4fb0-8af5-cdcf4891dec4','9b568026-57e4-47f0-a331-bea09fe27e60','f5c7af60-a9f3-428c-bb31-6defbffce7d3','Báo lỗi / Khiếu nại',3,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-08-15 19:47:03',1,'2026-08-15 19:47:03','2026-08-13 19:47:03','2026-11-04 19:47:04'),('1781b5ed-327d-4b03-a04c-969621c430d8','65896043-a1c6-43b7-a02e-a3b411aa5bd3','01b3e367-5f93-4423-bb94-103513ef76ff','Câu hỏi',4,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-11 19:47:03','2026-11-04 19:47:04'),('211a2c42-8679-4305-a26a-b8239ec13f02','3db2e962-10c6-42b6-a5ab-a42e495f0cd9','c8c8989f-2faa-4487-85ec-bdccefe70b4c','Câu hỏi',2,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-23 19:47:03','2026-11-04 19:47:04'),('218b00b0-5c42-4d88-bc8b-14b3647cc53c','4d219a55-2271-4af3-9c60-fa835bc0b84b','48ca0c6c-3f7c-44ca-9faf-a65bf74f81fc','Câu hỏi',3,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-09-29 19:47:03',0,NULL,'2026-09-27 19:47:03','2026-11-04 19:47:04'),('2e261e59-8ba4-4fa9-84ab-83e7988978ea','3db2e962-10c6-42b6-a5ab-a42e495f0cd9','f7c145a8-a9d8-400c-979d-bd807987f438','Khen ngợi',5,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-05 19:47:03','2026-11-04 19:47:04'),('366cf4fe-4039-464e-bb40-194fefc16b49','0b3ddeae-cfc7-44c6-aba6-065d846f8b2d','91ce47e4-a047-40f2-af52-510220d6247c','Báo lỗi / Khiếu nại',1,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-14 19:47:03','2026-11-04 19:47:04'),('386ef62b-3aa6-4089-b862-7d623e96ee4a','71736766-54c4-4ca6-a5d2-4c95eac2ce81','ce0ced69-794c-4494-87e6-d78dc8c3056d','Báo lỗi / Khiếu nại',4,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-09-08 19:47:03',1,'2026-09-08 19:47:03','2026-09-06 19:47:03','2026-11-04 19:47:04'),('38f5320f-966d-4416-a6e2-3e9f2e53e267','ea1f9643-f0bc-4cc1-aa84-c7f1e773835c','91ce47e4-a047-40f2-af52-510220d6247c','Báo lỗi / Khiếu nại',4,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-08-17 19:47:03','2026-11-04 19:47:04'),('3a39c021-28a4-4ba2-b24c-a8e0ee3e6da1','cefcaf80-0616-4a53-b03f-bbe45f891764','1459dca3-d393-4d40-97ef-3cce4aeca457','Báo lỗi / Khiếu nại',3,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-02 19:47:03','2026-11-04 19:47:04'),('417886a8-b7e1-482e-b96f-1ca009a1ebdc','0e921993-0eb6-4724-8c1a-813ececc0e0b','d1ccd936-175d-4aac-bb28-c9e90b13153d','Câu hỏi',3,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-07 19:47:03','2026-11-04 19:47:04'),('46fa16f9-07e8-4ed8-88ac-dafc7c485fb9','93a00b56-d02f-4411-b174-d6ce2435f38a','1459dca3-d393-4d40-97ef-3cce4aeca457','Báo lỗi / Khiếu nại',5,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-10-02 19:47:03',1,'2026-10-02 19:47:03','2026-09-30 19:47:03','2026-11-04 19:47:04'),('4878adfe-cdf5-47af-bd01-8859d3c4fa5b','c0cd4216-cf6c-4fc6-a676-b4e4a06c0422','08ed8b68-96dd-4b24-bea5-61d5d85ab57a','Câu hỏi',5,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-11-04 19:47:03',0,NULL,'2026-11-03 19:47:03','2026-11-04 19:47:04'),('48aacdb1-79da-4d60-a9c0-bbcddeffa706','cefcaf80-0616-4a53-b03f-bbe45f891764','ce0ced69-794c-4494-87e6-d78dc8c3056d','Góp ý',5,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-20 19:47:03','2026-11-04 19:47:04'),('5dfdb385-e1f7-4f7f-9dd8-ac0042674787','0e921993-0eb6-4724-8c1a-813ececc0e0b','01b3e367-5f93-4423-bb94-103513ef76ff','Khen ngợi',5,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-25 19:47:03','2026-11-04 19:47:04'),('5fcaa909-1267-4708-a9a8-eca131efdd1b','ea1f9643-f0bc-4cc1-aa84-c7f1e773835c','487fe40a-2b7d-430a-ad12-ab50a8d10acd','Góp ý',1,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-04 19:47:03','2026-11-04 19:47:04'),('666b838c-3120-4bf1-b9a4-03e72c45bced','6c609307-ebea-419a-b93d-0314a87b9caa','d1ccd936-175d-4aac-bb28-c9e90b13153d','Khen ngợi',4,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-09-23 19:47:03',0,NULL,'2026-09-21 19:47:03','2026-11-04 19:47:04'),('6903bef2-880d-4ba6-8ad1-e74c44387796','65896043-a1c6-43b7-a02e-a3b411aa5bd3','08ed8b68-96dd-4b24-bea5-61d5d85ab57a','Khen ngợi',1,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-29 19:47:03','2026-11-04 19:47:04'),('6e6bc65a-dd57-4d5a-8720-fda2caa0be6c','5e3fe782-91fb-49b4-8ed5-5f6f9605eff3','08ed8b68-96dd-4b24-bea5-61d5d85ab57a','Khen ngợi',4,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-01 19:47:03','2026-11-04 19:47:04'),('6e775289-23b1-4103-9924-7d4bb4384a6e','3a36397e-2306-4ccd-aac4-ee1c31bf1559','81d2c226-13aa-4e13-bbac-b2e0ba313063','Báo lỗi / Khiếu nại',2,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-08-29 19:47:03','2026-11-04 19:47:04'),('6ecd16a9-ed6b-4ca6-b2f9-245ec4d49736','3d948947-b55a-4d00-8805-2f120dc334d1','1e1319f1-620d-497a-a78a-57c56a8c9cf6','Câu hỏi',4,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-10-01 19:47:03','2026-11-04 19:47:04'),('6f703726-d95c-4347-bc2e-ee3469248db8','65896043-a1c6-43b7-a02e-a3b411aa5bd3','d1ccd936-175d-4aac-bb28-c9e90b13153d','Khen ngợi',2,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-08-24 19:47:03','2026-11-04 19:47:04'),('84de9507-6056-43d1-8833-b1df7d89042e','ea1f9643-f0bc-4cc1-aa84-c7f1e773835c','5e4d2be3-e962-48d8-a173-918f1681df51','Báo lỗi / Khiếu nại',3,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-22 19:47:03','2026-11-04 19:47:04'),('85bae204-a764-4ce9-a790-c31f796c9e39','0e921993-0eb6-4724-8c1a-813ececc0e0b','1e1319f1-620d-497a-a78a-57c56a8c9cf6','Khen ngợi',1,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-08-20 19:47:03','2026-11-04 19:47:04'),('8ae98e82-4349-4ece-a8f8-d814e7481b1f','71736766-54c4-4ca6-a5d2-4c95eac2ce81','1459dca3-d393-4d40-97ef-3cce4aeca457','Góp ý',2,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-08-21 19:47:03',0,NULL,'2026-08-19 19:47:03','2026-11-04 19:47:04'),('967ae4db-26b4-4ec1-91f2-6ac0272041f5','0b3ddeae-cfc7-44c6-aba6-065d846f8b2d','487fe40a-2b7d-430a-ad12-ab50a8d10acd','Góp ý',3,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-10-02 19:47:03','2026-11-04 19:47:04'),('a08118fc-a575-4f8f-a488-61feac8c9192','3d948947-b55a-4d00-8805-2f120dc334d1','c8c8989f-2faa-4487-85ec-bdccefe70b4c','Câu hỏi',5,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-08-26 19:47:03','2026-11-04 19:47:04'),('a1500dd3-887e-4a46-9b12-fb8a5128e140','4d219a55-2271-4af3-9c60-fa835bc0b84b','f7c145a8-a9d8-400c-979d-bd807987f438','Câu hỏi',4,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-08-24 19:47:03',0,NULL,'2026-08-22 19:47:03','2026-11-04 19:47:04'),('a290024e-f344-43b5-a82b-4c14178d6131','3d948947-b55a-4d00-8805-2f120dc334d1','48ca0c6c-3f7c-44ca-9faf-a65bf74f81fc','Khen ngợi',2,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-13 19:47:03','2026-11-04 19:47:04'),('a2e7c217-1635-4057-b6c9-b34426e3bc33','c0cd4216-cf6c-4fc6-a676-b4e4a06c0422','f7c145a8-a9d8-400c-979d-bd807987f438','Khen ngợi',2,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-11-04 19:47:03',0,NULL,'2026-11-03 19:47:03','2026-11-04 19:47:04'),('a3143471-4cd8-4571-aa2f-3be1a615aaf3','4d219a55-2271-4af3-9c60-fa835bc0b84b','c8c8989f-2faa-4487-85ec-bdccefe70b4c','Khen ngợi',1,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-09-11 19:47:03',0,NULL,'2026-09-09 19:47:03','2026-11-04 19:47:04'),('b7f07bb7-e414-4913-8208-691e8f4d6267','cefcaf80-0616-4a53-b03f-bbe45f891764','81d2c226-13aa-4e13-bbac-b2e0ba313063','Góp ý',1,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-08-15 19:47:03','2026-11-04 19:47:04'),('b81d085f-4861-465a-b215-143e350588df','96e04221-02f9-45bf-b47b-28dcb35904b9','5e4d2be3-e962-48d8-a173-918f1681df51','Góp ý',2,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-08 19:47:03','2026-11-04 19:47:04'),('b9b676f6-e3ec-46a2-80bf-1c43ef0f3b47','6b1b7c5f-a2ec-4ce7-9570-1d592fde0c18','1e1319f1-620d-497a-a78a-57c56a8c9cf6','Khen ngợi',3,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-17 19:47:03','2026-11-04 19:47:04'),('bdb5c2b5-feef-4bb0-b4e3-60c9e0149da6','6b1b7c5f-a2ec-4ce7-9570-1d592fde0c18','48ca0c6c-3f7c-44ca-9faf-a65bf74f81fc','Câu hỏi',1,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-08-30 19:47:03','2026-11-04 19:47:04'),('c09492e3-d0c5-429d-a169-702e9b74fcca','9b568026-57e4-47f0-a331-bea09fe27e60','487fe40a-2b7d-430a-ad12-ab50a8d10acd','Báo lỗi / Khiếu nại',2,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-09-20 19:47:03',1,'2026-09-20 19:47:03','2026-09-18 19:47:03','2026-11-04 19:47:04'),('c286bfa0-366c-4a6f-947a-42563193f916','e8eeb18c-9795-4198-be82-befaa4201aca','ce0ced69-794c-4494-87e6-d78dc8c3056d','Góp ý',3,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-08-23 19:47:03','2026-11-04 19:47:04'),('c5cdc50e-af5d-4cbb-aafc-edeaee3ca399','93a00b56-d02f-4411-b174-d6ce2435f38a','81d2c226-13aa-4e13-bbac-b2e0ba313063','Góp ý',3,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-09-14 19:47:03',0,NULL,'2026-09-12 19:47:03','2026-11-04 19:47:04'),('cab2601f-67db-4fde-9fa6-cb5f72cacef6','3a36397e-2306-4ccd-aac4-ee1c31bf1559','1459dca3-d393-4d40-97ef-3cce4aeca457','Góp ý',4,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-16 19:47:03','2026-11-04 19:47:04'),('d1383253-b0a5-4221-821b-591973939f81','c0cd4216-cf6c-4fc6-a676-b4e4a06c0422','01b3e367-5f93-4423-bb94-103513ef76ff','Khen ngợi',3,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-11-04 19:47:03',0,NULL,'2026-11-03 19:47:03','2026-11-04 19:47:04'),('d2fe97a7-8cef-47f7-ac2e-2da0ae839b5d','6c609307-ebea-419a-b93d-0314a87b9caa','48ca0c6c-3f7c-44ca-9faf-a65bf74f81fc','Khen ngợi',5,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-08-18 19:47:03',0,NULL,'2026-08-16 19:47:03','2026-11-04 19:47:04'),('e5da7c9e-a901-4aca-b64a-c6339dfa6e65','96e04221-02f9-45bf-b47b-28dcb35904b9','81d2c226-13aa-4e13-bbac-b2e0ba313063','Báo lỗi / Khiếu nại',4,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-26 19:47:03','2026-11-04 19:47:04'),('e98805b6-1a04-4fa8-8526-0d3c933f6891','6c609307-ebea-419a-b93d-0314a87b9caa','1e1319f1-620d-497a-a78a-57c56a8c9cf6','Câu hỏi',2,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-09-05 19:47:03',0,NULL,'2026-09-03 19:47:03','2026-11-04 19:47:04'),('f4f3155b-549c-4e28-b1cc-de4b98dbd188','e8eeb18c-9795-4198-be82-befaa4201aca','91ce47e4-a047-40f2-af52-510220d6247c','Góp ý',2,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-28 19:47:03','2026-11-04 19:47:04'),('fa071e4d-48b2-429b-94b9-a576632e5284','3a36397e-2306-4ccd-aac4-ee1c31bf1559','5e4d2be3-e962-48d8-a173-918f1681df51','Góp ý',5,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-08-11 19:47:03','2026-11-04 19:47:04');
/*!40000 ALTER TABLE `feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interests`
--

DROP TABLE IF EXISTS `interests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interests` (
  `id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interests`
--

LOCK TABLES `interests` WRITE;
/*!40000 ALTER TABLE `interests` DISABLE KEYS */;
INSERT INTO `interests` VALUES ('design','Đồ họa'),('gaming','Gaming'),('learning','Học tập'),('other','Khác'),('programming','Lập trình'),('office','Văn phòng');
/*!40000 ALTER TABLE `interests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_recovery_requests`
--

DROP TABLE IF EXISTS `password_recovery_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_recovery_requests` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_hash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','APPROVED','COMPLETED','REJECTED','EXPIRED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `reason` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verification_note` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewed_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewer_name` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `completion_seen` tinyint(1) NOT NULL DEFAULT '0',
  `verification_method` varchar(24) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MANUAL',
  `recovery_code_hash` char(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_recovery_customer` (`customer_id`),
  KEY `idx_recovery_status` (`status`,`created_at`),
  CONSTRAINT `fk_recovery_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_recovery_requests`
--

LOCK TABLES `password_recovery_requests` WRITE;
/*!40000 ALTER TABLE `password_recovery_requests` DISABLE KEYS */;
INSERT INTO `password_recovery_requests` VALUES ('87351d8b-0595-41d8-8ca8-c2d7827729ea','6b1b7c5f-a2ec-4ce7-9570-1d592fde0c18','khach2@demo.vn','86eae2eee3c20d04251e4aa3ae0e97736510f8bec396d8b8f2f99a1dba3f038d','REJECTED','Lịch sử yêu cầu khôi phục mật khẩu giả lập để trình diễn.','[DEMO] Bản ghi lịch sử giả lập, không có mã khôi phục có thể sử dụng.','0e3bb734-278f-445b-accf-848b3505cc9d','Quản trị viên Demo','2026-10-30 19:47:03','2026-10-31 19:47:03','2026-10-31 19:47:03',NULL,0,'MANUAL',NULL),('a3288e89-0eb4-4175-9b4e-49057464c62f','3a36397e-2306-4ccd-aac4-ee1c31bf1559','khach@demo.vn','99fd944ff4602000f2df0be32f87dad62f119266caa521c1513a1e9c04b6aeb8','COMPLETED','Lịch sử yêu cầu khôi phục mật khẩu giả lập để trình diễn.','[DEMO] Bản ghi lịch sử giả lập, không có mã khôi phục có thể sử dụng.','0e3bb734-278f-445b-accf-848b3505cc9d','Quản trị viên Demo','2026-10-29 19:47:03','2026-10-30 19:47:03','2026-10-30 19:47:03','2026-10-31 19:47:03',0,'MANUAL',NULL);
/*!40000 ALTER TABLE `password_recovery_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES ('01b3e367-5f93-4423-bb94-103513ef76ff','ASUS Vivobook 15 X1504','Laptop',1,'2026-11-04 19:47:04'),('08ed8b68-96dd-4b24-bea5-61d5d85ab57a','Acer Nitro V 15 ANV15','Laptop',1,'2026-11-04 19:47:04'),('1459dca3-d393-4d40-97ef-3cce4aeca457','PC Gaming Backline G1','PC',1,'2026-11-04 19:47:04'),('1e1319f1-620d-497a-a78a-57c56a8c9cf6','PC Gaming Backline G2','PC',1,'2026-11-04 19:47:04'),('487fe40a-2b7d-430a-ad12-ab50a8d10acd','PC Gaming Backline G3','PC',1,'2026-11-04 19:47:04'),('48ca0c6c-3f7c-44ca-9faf-a65bf74f81fc','Lenovo LOQ 15IAX9','Laptop',1,'2026-11-04 19:47:04'),('5e4d2be3-e962-48d8-a173-918f1681df51','Dell Inspiron 15 3530','Laptop',1,'2026-11-04 19:47:04'),('81d2c226-13aa-4e13-bbac-b2e0ba313063','ASUS TUF Gaming F15 FX507','Laptop',1,'2026-11-04 19:47:04'),('91ce47e4-a047-40f2-af52-510220d6247c','MSI Thin 15 B13VE','Laptop',1,'2026-11-04 19:47:04'),('c8c8989f-2faa-4487-85ec-bdccefe70b4c','HP 15-fd0231TU','Laptop',1,'2026-11-04 19:47:04'),('ce0ced69-794c-4494-87e6-d78dc8c3056d','PC Văn phòng Backline O1','PC',1,'2026-11-04 19:47:04'),('d1ccd936-175d-4aac-bb28-c9e90b13153d','PC Văn phòng Backline O2','PC',1,'2026-11-04 19:47:04'),('f5c7af60-a9f3-428c-bb31-6defbffce7d3','Lenovo IdeaPad Slim 3 15IAH8','Laptop',1,'2026-11-04 19:47:04'),('f7c145a8-a9d8-400c-979d-bd807987f438','PC Đồ họa Backline D1','PC',1,'2026-11-04 19:47:04');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_options`
--

DROP TABLE IF EXISTS `question_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_options` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `option_text` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_option_order` (`question_id`,`display_order`),
  CONSTRAINT `fk_option_question` FOREIGN KEY (`question_id`) REFERENCES `survey_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_options`
--

LOCK TABLES `question_options` WRITE;
/*!40000 ALTER TABLE `question_options` DISABLE KEYS */;
INSERT INTO `question_options` VALUES ('078bf924-1995-4e54-8eee-adf9ec6ebb9b','a4bd483d-2f80-4426-8231-cba7119f701a','Đồ họa / Thiết kế',2),('0cc9c832-d636-489f-9bec-bb37a8c83bf7','b6954e45-d3d0-4745-a50a-14ee7c25237e','Khác',5),('16cbd146-5bdf-4754-a265-680524949e6b','b6954e45-d3d0-4745-a50a-14ee7c25237e','Tìm kiếm Google',3),('21c5a497-f259-4fa7-8fce-bb5d455576d0','7c4e4865-5fb2-4c52-ab23-e4c362a75e8b','Chưa có dự định',4),('2330fe9a-10bb-48a3-a254-faec80b946b0','b9d6d26c-64f1-4433-a18c-6781cfcd0b61','Dựng video',3),('313b115f-ddcd-42a7-a3bd-385e6248c98a','47b47db4-c7aa-4811-8d77-1a1cb6802a07','20 - 35 triệu',3),('3683b3ce-4ed5-4948-a2fd-141a031097a4','7c4e4865-5fb2-4c52-ab23-e4c362a75e8b','Linh kiện nâng cấp',3),('4885bd9d-c3c7-40ab-a90a-e285fe796d94','b9d6d26c-64f1-4433-a18c-6781cfcd0b61','Chơi game',1),('49232778-96fa-4192-9237-a68b560318d4','b6954e45-d3d0-4745-a50a-14ee7c25237e','Facebook / TikTok',2),('5b142300-3d32-44d3-8ada-7fd054df3c21','ae6e8046-56e5-400f-8f6f-0a6d36368577','Rất tốt',1),('5d583664-5bfc-41b8-a334-af502b38aacc','47b47db4-c7aa-4811-8d77-1a1cb6802a07','10 - 20 triệu',2),('689d0bd7-6303-46e0-8858-426ebeec02a0','7c4e4865-5fb2-4c52-ab23-e4c362a75e8b','PC lắp sẵn',2),('68f46267-e314-4661-9a6c-a55a3548ae1a','b9d6d26c-64f1-4433-a18c-6781cfcd0b61','Thiết kế',2),('69fc985d-5105-4295-8916-271109d94645','a4bd483d-2f80-4426-8231-cba7119f701a','Gaming',1),('7415e08e-dcde-451d-b2b8-b6f2b57e67f9','83076567-fd81-4b93-a8c1-f53522053a5a','Điện thoại',1),('96b042e6-1561-4c1d-a785-c062c94b691f','7c4e4865-5fb2-4c52-ab23-e4c362a75e8b','Laptop',1),('990e2048-1a57-4152-993c-b15738e95d4f','8adc00a6-3a61-4b5c-803d-17eede141d45','Điện thoại',2),('9dab3cd9-71a8-4e01-9bec-4d17c915ac2a','a4bd483d-2f80-4426-8231-cba7119f701a','Lập trình',4),('a2588bd5-321c-41c2-a139-500261a49cd5','ae6e8046-56e5-400f-8f6f-0a6d36368577','Tốt',2),('a692705f-1ff1-4c4f-995b-13ce3237c232','b6954e45-d3d0-4745-a50a-14ee7c25237e','Bạn bè giới thiệu',1),('b023eac8-a7c0-4393-8bb3-b54a575e4364','83076567-fd81-4b93-a8c1-f53522053a5a','Tại cửa hàng',3),('b4754a24-407f-441e-bd93-50051b82debc','ae6e8046-56e5-400f-8f6f-0a6d36368577','Chưa tốt',4),('c37002d9-589c-4fb0-918e-2b3b866dcb98','47b47db4-c7aa-4811-8d77-1a1cb6802a07','Trên 35 triệu',4),('c62ab90b-fa76-4db9-9d55-0bcaaea49b51','ae6e8046-56e5-400f-8f6f-0a6d36368577','Bình thường',3),('cef9d026-8d98-4370-9237-221f118cc2f1','5fc360e1-5350-40b3-aecc-62d5e4d59890','Tặng phụ kiện',3),('cf52147b-a231-4440-8c50-e930b26ae1f6','8adc00a6-3a61-4b5c-803d-17eede141d45','Email',1),('d91a97d5-b83e-4092-8df7-470f7abf7f1e','b6954e45-d3d0-4745-a50a-14ee7c25237e','Đi ngang qua cửa hàng',4),('e3e8171e-98e5-4e20-8f2f-f8e1bb81d14d','83076567-fd81-4b93-a8c1-f53522053a5a','Email',2),('e603e792-c737-45fd-9381-cf10bcb350f7','5fc360e1-5350-40b3-aecc-62d5e4d59890','Vệ sinh máy miễn phí',2),('e9b025d1-b8fb-4959-91db-140b48f5c8d8','5fc360e1-5350-40b3-aecc-62d5e4d59890','Giảm giá linh kiện',1),('eac3bda6-7744-46e5-947f-ce73f4da4247','a4bd483d-2f80-4426-8231-cba7119f701a','Văn phòng / Học tập',3),('ec817da8-5cb5-4351-8700-3b9cbb6eec2d','47b47db4-c7aa-4811-8d77-1a1cb6802a07','Dưới 10 triệu',1);
/*!40000 ALTER TABLE `question_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `response_details`
--

DROP TABLE IF EXISTS `response_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `response_details` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `response_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `option_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `text_answer` text COLLATE utf8mb4_unicode_ci,
  `rating_value` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_detail_response` (`response_id`),
  KEY `fk_detail_question` (`question_id`),
  KEY `fk_detail_option` (`option_id`),
  CONSTRAINT `fk_detail_option` FOREIGN KEY (`option_id`) REFERENCES `question_options` (`id`),
  CONSTRAINT `fk_detail_question` FOREIGN KEY (`question_id`) REFERENCES `survey_questions` (`id`),
  CONSTRAINT `fk_detail_response` FOREIGN KEY (`response_id`) REFERENCES `survey_responses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_rating_value` CHECK (((`rating_value` is null) or (`rating_value` between 1 and 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `response_details`
--

LOCK TABLES `response_details` WRITE;
/*!40000 ALTER TABLE `response_details` DISABLE KEYS */;
INSERT INTO `response_details` VALUES ('0c297f46-2748-4fe1-b8d8-97edeaf5e318','de5a4bd5-e961-4b87-a3d4-816d11a46767','66d0f947-4351-4e29-9098-56236a161fe6',NULL,'Tư vấn rõ ràng, tôi hài lòng với trải nghiệm. [Demo]',NULL),('0db95bc5-a0af-4761-bd25-b762584a64a6','896cf885-fc97-4950-b10b-9282c926e5a8','7922d48c-15a6-4661-8d36-c9cafc814233',NULL,NULL,5),('173bf5e1-4a24-44b6-b7d6-e9cc78ae6343','ddd58956-4e9f-45cb-b2b2-881ba5d1179d','a4bd483d-2f80-4426-8231-cba7119f701a','eac3bda6-7744-46e5-947f-ce73f4da4247',NULL,NULL),('1d28d91f-54a0-41e3-9b76-ab5d159e639f','107412c3-5759-4a13-aee3-11e8c8367e6b','d2d9d9a2-e3a8-42d9-8a3d-1191758980ad',NULL,NULL,4),('2694fcb4-d15a-4369-b03d-f68b3ca22e12','4c6f715b-2440-48ac-8ae7-08f9319a01d7','a4bd483d-2f80-4426-8231-cba7119f701a','9dab3cd9-71a8-4e01-9bec-4d17c915ac2a',NULL,NULL),('27d32e91-5eda-4794-a8fd-c6ce89b8be7b','e2fdc67a-4b6a-4bcc-831d-c3b2dfb9bec0','d2d9d9a2-e3a8-42d9-8a3d-1191758980ad',NULL,NULL,5),('2a743bae-d646-41a1-8735-9e277faf7e1a','4c6f715b-2440-48ac-8ae7-08f9319a01d7','66d0f947-4351-4e29-9098-56236a161fe6',NULL,'Tư vấn rõ ràng, tôi hài lòng với trải nghiệm. [Demo]',NULL),('2b701d6e-d21e-49b1-9869-2aa447304928','ddd58956-4e9f-45cb-b2b2-881ba5d1179d','47b47db4-c7aa-4811-8d77-1a1cb6802a07','313b115f-ddcd-42a7-a3bd-385e6248c98a',NULL,NULL),('2dfcb2af-3815-4f39-9367-c03c959172d2','328e6230-1af6-4f7c-a611-a6cddfa0df58','a4bd483d-2f80-4426-8231-cba7119f701a','69fc985d-5105-4295-8916-271109d94645',NULL,NULL),('2f184d93-5743-4894-85b8-ed4ae9641e9f','3f15a50f-b433-445c-a5d5-cc1aca83b205','570c89a0-0cc3-4c92-ad3b-32a490d37122',NULL,'Tư vấn rõ ràng, tôi hài lòng với trải nghiệm. [Demo]',NULL),('339946e9-d5db-4756-9a5d-4778105d6e8e','7a7a0fab-042a-4532-a0b0-094ea3addffe','d2d9d9a2-e3a8-42d9-8a3d-1191758980ad',NULL,NULL,4),('369deed3-62f4-4365-831e-8fd395be6273','b0e057e0-ba90-4e8d-a057-83f381d5bb44','c3e6a9f9-c5ac-4c97-b937-66cd4699da7e',NULL,NULL,3),('3b363293-8164-42ec-805d-b83da628ad4d','24613b0c-f961-4336-ab79-cf5f426ac5e4','d2d9d9a2-e3a8-42d9-8a3d-1191758980ad',NULL,NULL,3),('40990e08-a115-46af-a214-87303dbce3ae','4c6f715b-2440-48ac-8ae7-08f9319a01d7','a4bd483d-2f80-4426-8231-cba7119f701a','69fc985d-5105-4295-8916-271109d94645',NULL,NULL),('44ff592d-361e-46b1-b0b6-f08b86a74ae6','328e6230-1af6-4f7c-a611-a6cddfa0df58','66d0f947-4351-4e29-9098-56236a161fe6',NULL,'Mong cửa hàng cải thiện thời gian hỗ trợ. [Demo]',NULL),('47938c94-bfc9-4bb4-8ac1-61ba550951a3','de5a4bd5-e961-4b87-a3d4-816d11a46767','a4bd483d-2f80-4426-8231-cba7119f701a','078bf924-1995-4e54-8eee-adf9ec6ebb9b',NULL,NULL),('55f4e6a6-266c-48fa-981f-379b525838cc','85bacd69-9c92-4ef1-82f6-fbb8c0491d63','d2d9d9a2-e3a8-42d9-8a3d-1191758980ad',NULL,NULL,3),('66ee90f2-d722-4191-a148-a498f3f1433b','b36e8768-2cd8-4fec-99a2-0cce99d010c6','c3e6a9f9-c5ac-4c97-b937-66cd4699da7e',NULL,NULL,5),('6d27342d-6b67-4087-bb25-d0ca29582466','896cf885-fc97-4950-b10b-9282c926e5a8','1aeb8e0e-42b1-4b0b-b4a8-025b1ab87f01',NULL,'Sẽ giới thiệu cửa hàng đến bạn bè. [Demo]',NULL),('81c26e67-dab8-4927-8910-3dc84d927242','85bacd69-9c92-4ef1-82f6-fbb8c0491d63','570c89a0-0cc3-4c92-ad3b-32a490d37122',NULL,'Tư vấn rõ ràng, tôi hài lòng với trải nghiệm. [Demo]',NULL),('82182123-f4e9-4ca9-ad93-6833f40c65db','328e6230-1af6-4f7c-a611-a6cddfa0df58','7c4e4865-5fb2-4c52-ab23-e4c362a75e8b','96b042e6-1561-4c1d-a785-c062c94b691f',NULL,NULL),('8a5eee5e-d199-4e72-8235-f7394e796390','ddd58956-4e9f-45cb-b2b2-881ba5d1179d','7c4e4865-5fb2-4c52-ab23-e4c362a75e8b','3683b3ce-4ed5-4948-a2fd-141a031097a4',NULL,NULL),('8b6ac2d6-4a0a-4c96-8301-eb93cf542c8b','b852e26e-2be1-4a0c-844a-fa60ce545a9c','b9d6d26c-64f1-4433-a18c-6781cfcd0b61','68f46267-e314-4661-9a6c-a55a3548ae1a',NULL,NULL),('8d4a8bd7-ed0c-4cc1-8b08-405004a86e91','b0e057e0-ba90-4e8d-a057-83f381d5bb44','9adac92d-086f-4496-9a37-2cb79ed2eae7',NULL,'Tư vấn rõ ràng, tôi hài lòng với trải nghiệm. [Demo]',NULL),('94e7d45c-770b-4661-a3c1-20457f027b60','4c6f715b-2440-48ac-8ae7-08f9319a01d7','7c4e4865-5fb2-4c52-ab23-e4c362a75e8b','21c5a497-f259-4fa7-8fce-bb5d455576d0',NULL,NULL),('97d61465-ed42-4754-ab9b-c9ca6f94ebe1','47ef3ef8-4fb7-427f-97a7-f53228d47b9d','b9d6d26c-64f1-4433-a18c-6781cfcd0b61','4885bd9d-c3c7-40ab-a90a-e285fe796d94',NULL,NULL),('9d7acf88-5c46-4b28-81e2-42b49699ed53','b852e26e-2be1-4a0c-844a-fa60ce545a9c','b9d6d26c-64f1-4433-a18c-6781cfcd0b61','2330fe9a-10bb-48a3-a254-faec80b946b0',NULL,NULL),('a03a3ebf-4a9e-4707-8336-b0c9064964c1','328e6230-1af6-4f7c-a611-a6cddfa0df58','a4bd483d-2f80-4426-8231-cba7119f701a','078bf924-1995-4e54-8eee-adf9ec6ebb9b',NULL,NULL),('a15a2158-7616-45c9-bd8d-c1af10f21bf3','de5a4bd5-e961-4b87-a3d4-816d11a46767','47b47db4-c7aa-4811-8d77-1a1cb6802a07','ec817da8-5cb5-4351-8700-3b9cbb6eec2d',NULL,NULL),('a21f7472-102d-49b7-a1a9-555b581fdb13','24613b0c-f961-4336-ab79-cf5f426ac5e4','570c89a0-0cc3-4c92-ad3b-32a490d37122',NULL,'Tư vấn rõ ràng, tôi hài lòng với trải nghiệm. [Demo]',NULL),('aa6fefca-6e3d-403a-be78-82e59e49903d','47ef3ef8-4fb7-427f-97a7-f53228d47b9d','bcc6602e-9823-4e8a-b76d-8740d49d0abe',NULL,'Sẽ giới thiệu cửa hàng đến bạn bè. [Demo]',NULL),('b6b80784-3fef-4b1d-af51-bf68c1bbb4c1','de5a4bd5-e961-4b87-a3d4-816d11a46767','a4bd483d-2f80-4426-8231-cba7119f701a','69fc985d-5105-4295-8916-271109d94645',NULL,NULL),('b8645637-4791-4525-beb9-a0547fba18dd','3f15a50f-b433-445c-a5d5-cc1aca83b205','d2d9d9a2-e3a8-42d9-8a3d-1191758980ad',NULL,NULL,3),('bd55a049-12c1-455c-a49f-0763130af906','51726031-1ebf-4a31-82bd-0269e4ece1be','d2d9d9a2-e3a8-42d9-8a3d-1191758980ad',NULL,NULL,4),('c1fa63b7-e36c-4159-a2fb-3235fe45864d','328e6230-1af6-4f7c-a611-a6cddfa0df58','47b47db4-c7aa-4811-8d77-1a1cb6802a07','ec817da8-5cb5-4351-8700-3b9cbb6eec2d',NULL,NULL),('c6254844-5db2-44db-b4b0-9a853a88f88e','ddd58956-4e9f-45cb-b2b2-881ba5d1179d','a4bd483d-2f80-4426-8231-cba7119f701a','9dab3cd9-71a8-4e01-9bec-4d17c915ac2a',NULL,NULL),('c859b8c8-a6db-45fd-9b59-4ee05e7adbd8','4c6f715b-2440-48ac-8ae7-08f9319a01d7','47b47db4-c7aa-4811-8d77-1a1cb6802a07','c37002d9-589c-4fb0-918e-2b3b866dcb98',NULL,NULL),('cb3dbaac-52c0-469c-a28a-c0da57ed082c','a0d1bdda-e8d6-469c-bb10-4c7d92d6e2fd','570c89a0-0cc3-4c92-ad3b-32a490d37122',NULL,'Sẽ giới thiệu cửa hàng đến bạn bè. [Demo]',NULL),('d2e66c44-89a9-4c00-b864-b4c4912117d5','de5a4bd5-e961-4b87-a3d4-816d11a46767','7c4e4865-5fb2-4c52-ab23-e4c362a75e8b','96b042e6-1561-4c1d-a785-c062c94b691f',NULL,NULL),('da4aea2f-e430-4a8a-8395-a346c0133c2b','a0d1bdda-e8d6-469c-bb10-4c7d92d6e2fd','d2d9d9a2-e3a8-42d9-8a3d-1191758980ad',NULL,NULL,5),('dceae197-f4e1-446b-812f-162c8c507b80','e2fdc67a-4b6a-4bcc-831d-c3b2dfb9bec0','570c89a0-0cc3-4c92-ad3b-32a490d37122',NULL,'Sẽ giới thiệu cửa hàng đến bạn bè. [Demo]',NULL),('ed447483-ab0d-4ad5-927b-87f0cf2760ea','47ef3ef8-4fb7-427f-97a7-f53228d47b9d','b9d6d26c-64f1-4433-a18c-6781cfcd0b61','2330fe9a-10bb-48a3-a254-faec80b946b0',NULL,NULL),('ef91350f-a022-4d20-9115-38e3a472fa90','04a2a093-1a62-40f5-88db-5d81fb3242e8','c3e6a9f9-c5ac-4c97-b937-66cd4699da7e',NULL,NULL,4),('fa240aee-7382-4cfa-affc-5fdbc90c7e69','b36e8768-2cd8-4fec-99a2-0cce99d010c6','9adac92d-086f-4496-9a37-2cb79ed2eae7',NULL,'Sẽ giới thiệu cửa hàng đến bạn bè. [Demo]',NULL);
/*!40000 ALTER TABLE `response_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `survey_questions`
--

DROP TABLE IF EXISTS `survey_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `survey_questions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `survey_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_type` enum('ONE','MULTI','TEXT','RATING') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT '0',
  `display_order` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_question_order` (`survey_id`,`display_order`),
  CONSTRAINT `fk_question_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `survey_questions`
--

LOCK TABLES `survey_questions` WRITE;
/*!40000 ALTER TABLE `survey_questions` DISABLE KEYS */;
INSERT INTO `survey_questions` VALUES ('1aeb8e0e-42b1-4b0b-b4a8-025b1ab87f01','26b65242-0467-4bbf-91b4-3cf7c10a3098','Cửa hàng nên cải thiện điều gì?','TEXT',0,2),('28df8767-6a2a-4ab8-b49a-a40c3ac9b730','f915a1d1-f6f4-4ad5-ac43-a97f7a7f3f58','Góp ý khác?','TEXT',0,2),('46e13f1f-bc9c-4253-b066-795062f8817c','aab0ef87-889b-4a9f-8588-2fb2c7867e58','Bạn có góp ý gì thêm cho chúng tôi?','TEXT',0,4),('47b47db4-c7aa-4811-8d77-1a1cb6802a07','87940458-b681-4bb6-9a86-62cbb580d279','Ngân sách dự kiến của bạn?','ONE',1,3),('570c89a0-0cc3-4c92-ad3b-32a490d37122','f7ab86a0-d881-4c11-981d-5f09bc7b91db','Ý kiến khác','TEXT',0,2),('5fc360e1-5350-40b3-aecc-62d5e4d59890','7da3452e-502b-4a47-9eca-903f01c1b54e','Bạn mong muốn ưu đãi nào?','MULTI',1,1),('66d0f947-4351-4e29-9098-56236a161fe6','87940458-b681-4bb6-9a86-62cbb580d279','Bạn quan tâm đến dòng máy hoặc cấu hình cụ thể nào?','TEXT',0,4),('77e8c0c4-c658-45f7-ad28-f6f941891086','a31ec62b-a5b4-41d4-a7e2-b1ab34e6acaf','Góp ý dịch vụ?','TEXT',0,1),('7922d48c-15a6-4661-8d36-c9cafc814233','26b65242-0467-4bbf-91b4-3cf7c10a3098','Bạn đánh giá buổi tư vấn thế nào?','RATING',1,1),('7c4e4865-5fb2-4c52-ab23-e4c362a75e8b','87940458-b681-4bb6-9a86-62cbb580d279','Bạn dự định mua gì trong 6 tháng tới?','ONE',1,1),('83076567-fd81-4b93-a8c1-f53522053a5a','8bafa003-480f-4ca1-b443-4d20b3d4d281','Bạn muốn nhận thông tin qua kênh nào?','ONE',1,1),('8adc00a6-3a61-4b5c-803d-17eede141d45','f915a1d1-f6f4-4ad5-ac43-a97f7a7f3f58','Bạn muốn nhận hỗ trợ qua kênh nào?','ONE',1,1),('8e70be54-9165-42d6-aeb2-bfa89b91ee42','945d5efe-5020-49fb-a9c2-fde114070167','Bạn muốn chia sẻ điều gì?','TEXT',0,1),('9583eab6-3a99-4335-921a-dfd5ccbb9e13','aab0ef87-889b-4a9f-8588-2fb2c7867e58','Bạn đánh giá chung về dịch vụ của cửa hàng như thế nào?','RATING',1,1),('9adac92d-086f-4496-9a37-2cb79ed2eae7','8e8d95b1-6523-48f8-9051-d09d23608f28','Góp ý về quá trình mua hàng?','TEXT',0,2),('a4bd483d-2f80-4426-8231-cba7119f701a','87940458-b681-4bb6-9a86-62cbb580d279','Mục đích sử dụng chính (chọn nhiều đáp án)','MULTI',1,2),('ae6e8046-56e5-400f-8f6f-0a6d36368577','aab0ef87-889b-4a9f-8588-2fb2c7867e58','Nhân viên tư vấn có nhiệt tình và hiểu sản phẩm không?','ONE',1,3),('b6954e45-d3d0-4745-a50a-14ee7c25237e','aab0ef87-889b-4a9f-8588-2fb2c7867e58','Bạn biết đến cửa hàng qua kênh nào?','ONE',1,2),('b9d6d26c-64f1-4433-a18c-6781cfcd0b61','076d96fa-abdb-4150-9db7-dd34b9afb302','Bạn quan tâm trải nghiệm nào?','MULTI',1,1),('bcc6602e-9823-4e8a-b76d-8740d49d0abe','076d96fa-abdb-4150-9db7-dd34b9afb302','Góp ý thêm?','TEXT',0,2),('c3e6a9f9-c5ac-4c97-b937-66cd4699da7e','8e8d95b1-6523-48f8-9051-d09d23608f28','Bạn đánh giá trải nghiệm đặt hàng bao nhiêu sao?','RATING',1,1),('d1a1b7f5-bfa3-45e0-ae5a-59a3626ffe55','c9c2227b-4e43-422c-bcd2-35c8a989c818','Mức độ quan tâm của bạn?','RATING',1,1),('d2d9d9a2-e3a8-42d9-8a3d-1191758980ad','f7ab86a0-d881-4c11-981d-5f09bc7b91db','Bạn hài lòng thế nào về thời gian xử lý bảo hành?','RATING',1,1),('f8a6485a-f0ac-475e-86a2-0161dce70b6e','7da3452e-502b-4a47-9eca-903f01c1b54e','Ý tưởng khác của bạn?','TEXT',0,2);
/*!40000 ALTER TABLE `survey_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `survey_recipients`
--

DROP TABLE IF EXISTS `survey_recipients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `survey_recipients` (
  `survey_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sent_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`survey_id`,`customer_id`),
  KEY `fk_recipient_customer` (`customer_id`),
  CONSTRAINT `fk_recipient_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recipient_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `survey_recipients`
--

LOCK TABLES `survey_recipients` WRITE;
/*!40000 ALTER TABLE `survey_recipients` DISABLE KEYS */;
INSERT INTO `survey_recipients` VALUES ('076d96fa-abdb-4150-9db7-dd34b9afb302','3a36397e-2306-4ccd-aac4-ee1c31bf1559','2026-11-04 19:47:03'),('076d96fa-abdb-4150-9db7-dd34b9afb302','5e3fe782-91fb-49b4-8ed5-5f6f9605eff3','2026-11-04 19:47:03'),('076d96fa-abdb-4150-9db7-dd34b9afb302','65896043-a1c6-43b7-a02e-a3b411aa5bd3','2026-11-04 19:47:03'),('076d96fa-abdb-4150-9db7-dd34b9afb302','6c609307-ebea-419a-b93d-0314a87b9caa','2026-11-04 19:47:03'),('076d96fa-abdb-4150-9db7-dd34b9afb302','9b568026-57e4-47f0-a331-bea09fe27e60','2026-11-04 19:47:03'),('076d96fa-abdb-4150-9db7-dd34b9afb302','cefcaf80-0616-4a53-b03f-bbe45f891764','2026-11-04 19:47:03'),('076d96fa-abdb-4150-9db7-dd34b9afb302','ea1f9643-f0bc-4cc1-aa84-c7f1e773835c','2026-11-04 19:47:03'),('26b65242-0467-4bbf-91b4-3cf7c10a3098','3a36397e-2306-4ccd-aac4-ee1c31bf1559','2026-10-30 19:47:03'),('26b65242-0467-4bbf-91b4-3cf7c10a3098','65896043-a1c6-43b7-a02e-a3b411aa5bd3','2026-10-30 19:47:03'),('26b65242-0467-4bbf-91b4-3cf7c10a3098','6c609307-ebea-419a-b93d-0314a87b9caa','2026-10-30 19:47:03'),('87940458-b681-4bb6-9a86-62cbb580d279','0b3ddeae-cfc7-44c6-aba6-065d846f8b2d','2026-09-26 19:47:03'),('87940458-b681-4bb6-9a86-62cbb580d279','0e921993-0eb6-4724-8c1a-813ececc0e0b','2026-09-26 19:47:03'),('87940458-b681-4bb6-9a86-62cbb580d279','3a36397e-2306-4ccd-aac4-ee1c31bf1559','2026-09-26 19:47:03'),('87940458-b681-4bb6-9a86-62cbb580d279','3d948947-b55a-4d00-8805-2f120dc334d1','2026-09-26 19:47:03'),('87940458-b681-4bb6-9a86-62cbb580d279','3db2e962-10c6-42b6-a5ab-a42e495f0cd9','2026-09-26 19:47:03'),('87940458-b681-4bb6-9a86-62cbb580d279','4d219a55-2271-4af3-9c60-fa835bc0b84b','2026-09-26 19:47:03'),('87940458-b681-4bb6-9a86-62cbb580d279','5e3fe782-91fb-49b4-8ed5-5f6f9605eff3','2026-09-26 19:47:03'),('87940458-b681-4bb6-9a86-62cbb580d279','65896043-a1c6-43b7-a02e-a3b411aa5bd3','2026-09-26 19:47:03'),('87940458-b681-4bb6-9a86-62cbb580d279','6b1b7c5f-a2ec-4ce7-9570-1d592fde0c18','2026-09-26 19:47:03'),('87940458-b681-4bb6-9a86-62cbb580d279','6c609307-ebea-419a-b93d-0314a87b9caa','2026-09-26 19:47:03'),('87940458-b681-4bb6-9a86-62cbb580d279','71736766-54c4-4ca6-a5d2-4c95eac2ce81','2026-09-26 19:47:03'),('87940458-b681-4bb6-9a86-62cbb580d279','93a00b56-d02f-4411-b174-d6ce2435f38a','2026-09-26 19:47:03'),('87940458-b681-4bb6-9a86-62cbb580d279','9b568026-57e4-47f0-a331-bea09fe27e60','2026-09-26 19:47:03'),('87940458-b681-4bb6-9a86-62cbb580d279','c0cd4216-cf6c-4fc6-a676-b4e4a06c0422','2026-11-03 19:47:03'),('87940458-b681-4bb6-9a86-62cbb580d279','cefcaf80-0616-4a53-b03f-bbe45f891764','2026-09-26 19:47:03'),('87940458-b681-4bb6-9a86-62cbb580d279','e8eeb18c-9795-4198-be82-befaa4201aca','2026-09-26 19:47:03'),('87940458-b681-4bb6-9a86-62cbb580d279','ea1f9643-f0bc-4cc1-aa84-c7f1e773835c','2026-09-26 19:47:03'),('8bafa003-480f-4ca1-b443-4d20b3d4d281','3a36397e-2306-4ccd-aac4-ee1c31bf1559','2026-10-26 19:47:03'),('8bafa003-480f-4ca1-b443-4d20b3d4d281','9b568026-57e4-47f0-a331-bea09fe27e60','2026-10-26 19:47:03'),('8bafa003-480f-4ca1-b443-4d20b3d4d281','cefcaf80-0616-4a53-b03f-bbe45f891764','2026-10-26 19:47:03'),('8e8d95b1-6523-48f8-9051-d09d23608f28','0b3ddeae-cfc7-44c6-aba6-065d846f8b2d','2026-10-01 19:47:03'),('8e8d95b1-6523-48f8-9051-d09d23608f28','0e921993-0eb6-4724-8c1a-813ececc0e0b','2026-10-01 19:47:03'),('8e8d95b1-6523-48f8-9051-d09d23608f28','3a36397e-2306-4ccd-aac4-ee1c31bf1559','2026-10-01 19:47:03'),('8e8d95b1-6523-48f8-9051-d09d23608f28','3d948947-b55a-4d00-8805-2f120dc334d1','2026-10-01 19:47:03'),('8e8d95b1-6523-48f8-9051-d09d23608f28','3db2e962-10c6-42b6-a5ab-a42e495f0cd9','2026-10-01 19:47:03'),('8e8d95b1-6523-48f8-9051-d09d23608f28','4d219a55-2271-4af3-9c60-fa835bc0b84b','2026-10-01 19:47:03'),('8e8d95b1-6523-48f8-9051-d09d23608f28','5e3fe782-91fb-49b4-8ed5-5f6f9605eff3','2026-10-01 19:47:03'),('8e8d95b1-6523-48f8-9051-d09d23608f28','65896043-a1c6-43b7-a02e-a3b411aa5bd3','2026-10-01 19:47:03'),('8e8d95b1-6523-48f8-9051-d09d23608f28','6b1b7c5f-a2ec-4ce7-9570-1d592fde0c18','2026-10-01 19:47:03'),('8e8d95b1-6523-48f8-9051-d09d23608f28','6c609307-ebea-419a-b93d-0314a87b9caa','2026-10-01 19:47:03'),('8e8d95b1-6523-48f8-9051-d09d23608f28','71736766-54c4-4ca6-a5d2-4c95eac2ce81','2026-10-01 19:47:03'),('8e8d95b1-6523-48f8-9051-d09d23608f28','93a00b56-d02f-4411-b174-d6ce2435f38a','2026-10-01 19:47:03'),('8e8d95b1-6523-48f8-9051-d09d23608f28','9b568026-57e4-47f0-a331-bea09fe27e60','2026-10-01 19:47:03'),('8e8d95b1-6523-48f8-9051-d09d23608f28','cefcaf80-0616-4a53-b03f-bbe45f891764','2026-10-01 19:47:03'),('8e8d95b1-6523-48f8-9051-d09d23608f28','e8eeb18c-9795-4198-be82-befaa4201aca','2026-10-01 19:47:03'),('8e8d95b1-6523-48f8-9051-d09d23608f28','ea1f9643-f0bc-4cc1-aa84-c7f1e773835c','2026-10-01 19:47:03'),('a31ec62b-a5b4-41d4-a7e2-b1ab34e6acaf','0e921993-0eb6-4724-8c1a-813ececc0e0b','2026-11-04 19:47:03'),('a31ec62b-a5b4-41d4-a7e2-b1ab34e6acaf','4d219a55-2271-4af3-9c60-fa835bc0b84b','2026-11-04 19:47:03'),('a31ec62b-a5b4-41d4-a7e2-b1ab34e6acaf','71736766-54c4-4ca6-a5d2-4c95eac2ce81','2026-11-04 19:47:03'),('a31ec62b-a5b4-41d4-a7e2-b1ab34e6acaf','93a00b56-d02f-4411-b174-d6ce2435f38a','2026-11-04 19:47:03'),('aab0ef87-889b-4a9f-8588-2fb2c7867e58','0b3ddeae-cfc7-44c6-aba6-065d846f8b2d','2026-10-21 19:47:03'),('aab0ef87-889b-4a9f-8588-2fb2c7867e58','0e921993-0eb6-4724-8c1a-813ececc0e0b','2026-10-21 19:47:03'),('aab0ef87-889b-4a9f-8588-2fb2c7867e58','3a36397e-2306-4ccd-aac4-ee1c31bf1559','2026-10-21 19:47:03'),('aab0ef87-889b-4a9f-8588-2fb2c7867e58','3d948947-b55a-4d00-8805-2f120dc334d1','2026-10-21 19:47:03'),('aab0ef87-889b-4a9f-8588-2fb2c7867e58','3db2e962-10c6-42b6-a5ab-a42e495f0cd9','2026-10-21 19:47:03'),('aab0ef87-889b-4a9f-8588-2fb2c7867e58','4d219a55-2271-4af3-9c60-fa835bc0b84b','2026-10-21 19:47:03'),('aab0ef87-889b-4a9f-8588-2fb2c7867e58','5e3fe782-91fb-49b4-8ed5-5f6f9605eff3','2026-10-21 19:47:03'),('aab0ef87-889b-4a9f-8588-2fb2c7867e58','65896043-a1c6-43b7-a02e-a3b411aa5bd3','2026-10-21 19:47:03'),('aab0ef87-889b-4a9f-8588-2fb2c7867e58','6b1b7c5f-a2ec-4ce7-9570-1d592fde0c18','2026-10-21 19:47:03'),('aab0ef87-889b-4a9f-8588-2fb2c7867e58','6c609307-ebea-419a-b93d-0314a87b9caa','2026-10-21 19:47:03'),('aab0ef87-889b-4a9f-8588-2fb2c7867e58','71736766-54c4-4ca6-a5d2-4c95eac2ce81','2026-10-21 19:47:03'),('aab0ef87-889b-4a9f-8588-2fb2c7867e58','93a00b56-d02f-4411-b174-d6ce2435f38a','2026-10-21 19:47:03'),('aab0ef87-889b-4a9f-8588-2fb2c7867e58','9b568026-57e4-47f0-a331-bea09fe27e60','2026-10-21 19:47:03'),('aab0ef87-889b-4a9f-8588-2fb2c7867e58','c0cd4216-cf6c-4fc6-a676-b4e4a06c0422','2026-11-03 19:47:03'),('aab0ef87-889b-4a9f-8588-2fb2c7867e58','cefcaf80-0616-4a53-b03f-bbe45f891764','2026-10-21 19:47:03'),('aab0ef87-889b-4a9f-8588-2fb2c7867e58','e8eeb18c-9795-4198-be82-befaa4201aca','2026-10-21 19:47:03'),('aab0ef87-889b-4a9f-8588-2fb2c7867e58','ea1f9643-f0bc-4cc1-aa84-c7f1e773835c','2026-10-21 19:47:03'),('f7ab86a0-d881-4c11-981d-5f09bc7b91db','0b3ddeae-cfc7-44c6-aba6-065d846f8b2d','2026-08-27 19:47:03'),('f7ab86a0-d881-4c11-981d-5f09bc7b91db','0e921993-0eb6-4724-8c1a-813ececc0e0b','2026-08-27 19:47:03'),('f7ab86a0-d881-4c11-981d-5f09bc7b91db','3a36397e-2306-4ccd-aac4-ee1c31bf1559','2026-08-27 19:47:03'),('f7ab86a0-d881-4c11-981d-5f09bc7b91db','3d948947-b55a-4d00-8805-2f120dc334d1','2026-08-27 19:47:03'),('f7ab86a0-d881-4c11-981d-5f09bc7b91db','3db2e962-10c6-42b6-a5ab-a42e495f0cd9','2026-08-27 19:47:03'),('f7ab86a0-d881-4c11-981d-5f09bc7b91db','4d219a55-2271-4af3-9c60-fa835bc0b84b','2026-08-27 19:47:03'),('f7ab86a0-d881-4c11-981d-5f09bc7b91db','5e3fe782-91fb-49b4-8ed5-5f6f9605eff3','2026-08-27 19:47:03'),('f7ab86a0-d881-4c11-981d-5f09bc7b91db','65896043-a1c6-43b7-a02e-a3b411aa5bd3','2026-08-27 19:47:03'),('f7ab86a0-d881-4c11-981d-5f09bc7b91db','6b1b7c5f-a2ec-4ce7-9570-1d592fde0c18','2026-08-27 19:47:03'),('f7ab86a0-d881-4c11-981d-5f09bc7b91db','6c609307-ebea-419a-b93d-0314a87b9caa','2026-08-27 19:47:03'),('f7ab86a0-d881-4c11-981d-5f09bc7b91db','71736766-54c4-4ca6-a5d2-4c95eac2ce81','2026-08-27 19:47:03'),('f7ab86a0-d881-4c11-981d-5f09bc7b91db','93a00b56-d02f-4411-b174-d6ce2435f38a','2026-08-27 19:47:03'),('f7ab86a0-d881-4c11-981d-5f09bc7b91db','9b568026-57e4-47f0-a331-bea09fe27e60','2026-08-27 19:47:03'),('f7ab86a0-d881-4c11-981d-5f09bc7b91db','cefcaf80-0616-4a53-b03f-bbe45f891764','2026-08-27 19:47:03'),('f7ab86a0-d881-4c11-981d-5f09bc7b91db','e8eeb18c-9795-4198-be82-befaa4201aca','2026-08-27 19:47:03'),('f7ab86a0-d881-4c11-981d-5f09bc7b91db','ea1f9643-f0bc-4cc1-aa84-c7f1e773835c','2026-08-27 19:47:03');
/*!40000 ALTER TABLE `survey_recipients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `survey_responses`
--

DROP TABLE IF EXISTS `survey_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `survey_responses` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `survey_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `submitted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_response_per_customer` (`survey_id`,`customer_id`),
  KEY `fk_response_customer` (`customer_id`),
  CONSTRAINT `fk_response_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_response_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `survey_responses`
--

LOCK TABLES `survey_responses` WRITE;
/*!40000 ALTER TABLE `survey_responses` DISABLE KEYS */;
INSERT INTO `survey_responses` VALUES ('04a2a093-1a62-40f5-88db-5d81fb3242e8','8e8d95b1-6523-48f8-9051-d09d23608f28','6b1b7c5f-a2ec-4ce7-9570-1d592fde0c18','2026-10-03 19:47:03'),('107412c3-5759-4a13-aee3-11e8c8367e6b','f7ab86a0-d881-4c11-981d-5f09bc7b91db','6b1b7c5f-a2ec-4ce7-9570-1d592fde0c18','2026-08-30 19:47:03'),('24613b0c-f961-4336-ab79-cf5f426ac5e4','f7ab86a0-d881-4c11-981d-5f09bc7b91db','ea1f9643-f0bc-4cc1-aa84-c7f1e773835c','2026-09-04 19:47:03'),('328e6230-1af6-4f7c-a611-a6cddfa0df58','87940458-b681-4bb6-9a86-62cbb580d279','cefcaf80-0616-4a53-b03f-bbe45f891764','2026-10-01 19:47:03'),('3f15a50f-b433-445c-a5d5-cc1aca83b205','f7ab86a0-d881-4c11-981d-5f09bc7b91db','3a36397e-2306-4ccd-aac4-ee1c31bf1559','2026-08-29 19:47:03'),('47ef3ef8-4fb7-427f-97a7-f53228d47b9d','076d96fa-abdb-4150-9db7-dd34b9afb302','9b568026-57e4-47f0-a331-bea09fe27e60','2026-11-04 19:47:03'),('4c6f715b-2440-48ac-8ae7-08f9319a01d7','87940458-b681-4bb6-9a86-62cbb580d279','5e3fe782-91fb-49b4-8ed5-5f6f9605eff3','2026-09-30 19:47:03'),('51726031-1ebf-4a31-82bd-0269e4ece1be','f7ab86a0-d881-4c11-981d-5f09bc7b91db','cefcaf80-0616-4a53-b03f-bbe45f891764','2026-09-02 19:47:03'),('7a7a0fab-042a-4532-a0b0-094ea3addffe','f7ab86a0-d881-4c11-981d-5f09bc7b91db','3db2e962-10c6-42b6-a5ab-a42e495f0cd9','2026-09-05 19:47:03'),('85bacd69-9c92-4ef1-82f6-fbb8c0491d63','f7ab86a0-d881-4c11-981d-5f09bc7b91db','5e3fe782-91fb-49b4-8ed5-5f6f9605eff3','2026-09-01 19:47:03'),('896cf885-fc97-4950-b10b-9282c926e5a8','26b65242-0467-4bbf-91b4-3cf7c10a3098','6c609307-ebea-419a-b93d-0314a87b9caa','2026-11-01 19:47:03'),('a0d1bdda-e8d6-469c-bb10-4c7d92d6e2fd','f7ab86a0-d881-4c11-981d-5f09bc7b91db','6c609307-ebea-419a-b93d-0314a87b9caa','2026-09-03 19:47:03'),('b0e057e0-ba90-4e8d-a057-83f381d5bb44','8e8d95b1-6523-48f8-9051-d09d23608f28','5e3fe782-91fb-49b4-8ed5-5f6f9605eff3','2026-10-05 19:47:03'),('b36e8768-2cd8-4fec-99a2-0cce99d010c6','8e8d95b1-6523-48f8-9051-d09d23608f28','9b568026-57e4-47f0-a331-bea09fe27e60','2026-10-04 19:47:03'),('b852e26e-2be1-4a0c-844a-fa60ce545a9c','076d96fa-abdb-4150-9db7-dd34b9afb302','cefcaf80-0616-4a53-b03f-bbe45f891764','2026-11-04 19:47:03'),('ddd58956-4e9f-45cb-b2b2-881ba5d1179d','87940458-b681-4bb6-9a86-62cbb580d279','9b568026-57e4-47f0-a331-bea09fe27e60','2026-09-29 19:47:03'),('de5a4bd5-e961-4b87-a3d4-816d11a46767','87940458-b681-4bb6-9a86-62cbb580d279','3a36397e-2306-4ccd-aac4-ee1c31bf1559','2026-09-28 19:47:03'),('e2fdc67a-4b6a-4bcc-831d-c3b2dfb9bec0','f7ab86a0-d881-4c11-981d-5f09bc7b91db','9b568026-57e4-47f0-a331-bea09fe27e60','2026-08-31 19:47:03');
/*!40000 ALTER TABLE `survey_responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `surveys`
--

DROP TABLE IF EXISTS `surveys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `surveys` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `due_date` date DEFAULT NULL,
  `status` enum('DRAFT','OPEN','CLOSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `accept_new_customers` tinyint(1) NOT NULL DEFAULT '0',
  `audience_config` json DEFAULT NULL,
  `is_hidden` tinyint(1) NOT NULL DEFAULT '0',
  `hidden_at` datetime DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_survey_creator` (`created_by`),
  KEY `idx_survey_status` (`status`),
  CONSTRAINT `fk_survey_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `surveys`
--

LOCK TABLES `surveys` WRITE;
/*!40000 ALTER TABLE `surveys` DISABLE KEYS */;
INSERT INTO `surveys` VALUES ('076d96fa-abdb-4150-9db7-dd34b9afb302','Khảo sát Gaming/Đồ họa 15–20 tuổi','Chỉ người đủ 15 đến hết 20 tuổi và có Gaming hoặc Đồ họa được nhận.','2026-11-24','OPEN',0,'{\"mode\": \"FILTER\", \"filters\": {\"maxAge\": 20, \"minAge\": 15, \"interests\": [\"gaming\", \"design\"]}, \"customerIds\": []}',0,NULL,'009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-11-03 19:47:03','2026-11-04 19:47:04'),('26b65242-0467-4bbf-91b4-3cf7c10a3098','Khảo sát khách được chọn riêng','Chỉ ba khách đã chọn, không tự gửi khách mới hoặc khách khác.','2026-11-25','OPEN',0,'{\"mode\": \"SELECTED\", \"filters\": {}, \"customerIds\": [\"3a36397e-2306-4ccd-aac4-ee1c31bf1559\", \"6c609307-ebea-419a-b93d-0314a87b9caa\", \"65896043-a1c6-43b7-a02e-a3b411aa5bd3\"]}',0,NULL,'009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-10-29 19:47:03','2026-11-04 19:47:04'),('7da3452e-502b-4a47-9eca-903f01c1b54e','Khảo sát ý tưởng ưu đãi thành viên','Bản nháp để thử chỉnh sửa toàn bộ câu hỏi trước khi gửi.',NULL,'DRAFT',0,'{\"mode\": \"FILTER\", \"filters\": {\"maxAge\": 20, \"minAge\": 15, \"interests\": [\"gaming\", \"design\"]}, \"customerIds\": []}',0,NULL,'009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-11-02 19:47:03','2026-11-04 19:47:04'),('87940458-b681-4bb6-9a86-62cbb580d279','Nhu cầu mua sắm PC và laptop','Cho chúng tôi biết dự định của bạn để gợi ý sản phẩm và ưu đãi phù hợp.','2026-12-19','OPEN',1,'{\"mode\": \"ALL\", \"filters\": {}, \"customerIds\": []}',0,NULL,'009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-09-25 19:47:03','2026-11-04 19:47:04'),('8bafa003-480f-4ca1-b443-4d20b3d4d281','Khảo sát chương trình chăm sóc khách hàng','Khảo sát đã đóng và chưa có câu trả lời để thử trạng thái dữ liệu rỗng.','2026-11-02','CLOSED',0,'{\"mode\": \"SELECTED\", \"filters\": {}, \"customerIds\": [\"3a36397e-2306-4ccd-aac4-ee1c31bf1559\", \"9b568026-57e4-47f0-a331-bea09fe27e60\", \"cefcaf80-0616-4a53-b03f-bbe45f891764\"]}',0,NULL,'009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-10-25 19:47:03','2026-11-04 19:47:04'),('8e8d95b1-6523-48f8-9051-d09d23608f28','Đánh giá trải nghiệm mua hàng tháng trước','Khảo sát đã hết hạn, dùng để xem mục quá hạn chưa trả lời.','2026-11-03','OPEN',1,'{\"mode\": \"ALL\", \"filters\": {}, \"customerIds\": []}',0,NULL,'009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-09-30 19:47:03','2026-11-04 19:47:04'),('945d5efe-5020-49fb-a9c2-fde114070167','[Bản nháp] Chưa thiết lập phạm vi','Thử nút mở bị chặn cho đến khi chọn phạm vi.',NULL,'DRAFT',0,NULL,0,NULL,'009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-11-03 19:47:03','2026-11-04 19:47:04'),('a31ec62b-a5b4-41d4-a7e2-b1ab34e6acaf','Khảo sát khách hàng 25–45 tuổi','Phiếu mới có phạm vi từ lúc tạo, chỉ gửi người đủ 25 đến hết 45 tuổi.','2026-11-19','OPEN',0,'{\"mode\": \"FILTER\", \"filters\": {\"maxAge\": 45, \"minAge\": 25}, \"customerIds\": []}',0,NULL,'009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-11-03 19:47:03','2026-11-04 19:52:48'),('aab0ef87-889b-4a9f-8588-2fb2c7867e58','Mức độ hài lòng về dịch vụ','Giúp chúng tôi cải thiện chất lượng tư vấn và chăm sóc khách hàng.','2026-12-04','OPEN',1,'{\"mode\": \"ALL\", \"filters\": {}, \"customerIds\": []}',0,NULL,'009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-10-20 19:47:03','2026-11-04 19:47:04'),('c9c2227b-4e43-422c-bcd2-35c8a989c818','[Bản nháp] Đã chọn Tất cả','Đã lưu phạm vi, có thể mở ngay từ danh sách.','2026-12-04','DRAFT',0,'{\"mode\": \"ALL\", \"filters\": {}, \"customerIds\": []}',0,NULL,'009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-11-02 19:47:03','2026-11-04 19:47:04'),('f7ab86a0-d881-4c11-981d-5f09bc7b91db','Trải nghiệm bảo hành và hỗ trợ','Đánh giá về quá trình bảo hành, sửa chữa tại cửa hàng.','2026-10-28','CLOSED',0,'{\"mode\": \"ALL\", \"filters\": {}, \"customerIds\": []}',1,'2026-11-03 19:47:03','009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-08-26 19:47:03','2026-11-04 19:47:04'),('f915a1d1-f6f4-4ad5-ac43-a97f7a7f3f58','[Bản nháp] Đã chọn từng khách','Mở lại form sẽ giữ đúng ba người đã chọn.','2026-11-18','DRAFT',0,'{\"mode\": \"SELECTED\", \"filters\": {}, \"customerIds\": [\"9b568026-57e4-47f0-a331-bea09fe27e60\", \"cefcaf80-0616-4a53-b03f-bbe45f891764\", \"65896043-a1c6-43b7-a02e-a3b411aa5bd3\"]}',0,NULL,'009c83dd-a2fa-4c7d-b2e0-6db739db0105','2026-11-02 19:47:03','2026-11-04 19:47:04');
/*!40000 ALTER TABLE `surveys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `auth_version` int NOT NULL DEFAULT '0',
  `role` enum('ADMIN','MANAGER','CUSTOMER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CUSTOMER',
  `account_status` enum('ACTIVE','LOCKED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `full_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `birth_year` smallint DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('','Nam','Nữ','Khác') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `need` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Chưa xác định',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('009c83dd-a2fa-4c7d-b2e0-6db739db0105','manager@demo.vn','$2b$12$pfOF2VK0BljSH9DgvRWCFOSAW6yPABps9gtuMn/yPvcvR2YWMtZCW',0,'MANAGER','ACTIVE','Quản lý Demo','0900000001','Văn phòng demo',1990,'1990-01-15','Khác','Chưa xác định','2026-04-18 19:47:03','2026-11-04 19:47:04'),('0b3ddeae-cfc7-44c6-aba6-065d846f8b2d','khach17@demo.vn','$2b$12$xygu8rfEVM6Na/zxCv90NetGLRE0uX0aFssW.YYude36dyI4LH5ey',0,'CUSTOMER','ACTIVE','Vũ Thảo Nguyên (Demo)','0910000017','Địa chỉ giả lập 17, khu dân cư Demo, TP.HCM',NULL,NULL,'Nam','Gaming','2026-08-22 19:47:03','2026-11-04 19:47:04'),('0e3bb734-278f-445b-accf-848b3505cc9d','admin@backline.vn','$2b$12$FuOORQ37cGIK39V6/0DMm.AfG3PahLSiMRKvXzWIKBt6KsaLtvPFy',0,'ADMIN','ACTIVE','Quản trị viên Demo','0900000000','Văn phòng demo',1990,'1990-01-15','Khác','Chưa xác định','2026-04-18 19:47:03','2026-11-04 19:47:04'),('0e921993-0eb6-4724-8c1a-813ececc0e0b','khach10@demo.vn','$2b$12$xygu8rfEVM6Na/zxCv90NetGLRE0uX0aFssW.YYude36dyI4LH5ey',0,'CUSTOMER','ACTIVE','Ngô Tuấn Kiệt (Demo)','0910000010','Địa chỉ giả lập 10, khu dân cư Demo, TP.HCM',1991,'1991-11-04','Nữ','Đồ họa','2026-07-11 19:47:03','2026-11-04 19:47:04'),('2d8040da-a0e1-4daa-ad56-f4b133d504bc','manager2@demo.vn','$2b$12$pfOF2VK0BljSH9DgvRWCFOSAW6yPABps9gtuMn/yPvcvR2YWMtZCW',0,'MANAGER','ACTIVE','Quản lý hỗ trợ Demo','0900000002','Văn phòng demo',1990,'1990-01-15','Khác','Chưa xác định','2026-04-18 19:47:03','2026-11-04 19:47:04'),('3a36397e-2306-4ccd-aac4-ee1c31bf1559','khach@demo.vn','$2b$12$xygu8rfEVM6Na/zxCv90NetGLRE0uX0aFssW.YYude36dyI4LH5ey',0,'CUSTOMER','ACTIVE','Nguyễn Minh Anh (Demo)','0901234567','Địa chỉ giả lập 1, khu dân cư Demo, TP.HCM',2008,'2008-11-04','Nữ','Gaming','2026-05-18 19:47:03','2026-11-04 19:47:04'),('3d948947-b55a-4d00-8805-2f120dc334d1','khach16@demo.vn','$2b$12$xygu8rfEVM6Na/zxCv90NetGLRE0uX0aFssW.YYude36dyI4LH5ey',0,'CUSTOMER','ACTIVE','Trần Minh Châu (Demo)','0910000016','Địa chỉ giả lập 16, khu dân cư Demo, TP.HCM',1974,'1974-11-04','Nữ','Chưa xác định','2026-08-16 19:47:03','2026-11-04 19:47:04'),('3db2e962-10c6-42b6-a5ab-a42e495f0cd9','khach8@demo.vn','$2b$12$xygu8rfEVM6Na/zxCv90NetGLRE0uX0aFssW.YYude36dyI4LH5ey',0,'CUSTOMER','ACTIVE','Đỗ Đức Minh (Demo)','0910000008','Địa chỉ giả lập 8, khu dân cư Demo, TP.HCM',2005,'2005-11-04','Nam','Chưa xác định','2026-06-29 19:47:03','2026-11-04 19:47:04'),('4d219a55-2271-4af3-9c60-fa835bc0b84b','khach12@demo.vn','$2b$12$xygu8rfEVM6Na/zxCv90NetGLRE0uX0aFssW.YYude36dyI4LH5ey',0,'CUSTOMER','ACTIVE','Đinh Văn An (Demo)','0910000012','',1999,'1999-11-04','Khác','Chưa xác định','2026-07-23 19:47:03','2026-11-04 19:47:04'),('5e3fe782-91fb-49b4-8ed5-5f6f9605eff3','khach4@demo.vn','$2b$12$xygu8rfEVM6Na/zxCv90NetGLRE0uX0aFssW.YYude36dyI4LH5ey',0,'CUSTOMER','ACTIVE','Phạm Gia Huy (Demo)','0910000004','Địa chỉ giả lập 4, khu dân cư Demo, TP.HCM',2010,'2010-11-04','Nữ','Chưa xác định','2026-06-05 19:47:03','2026-11-04 19:47:04'),('65896043-a1c6-43b7-a02e-a3b411aa5bd3','khach14@demo.vn','$2b$12$xygu8rfEVM6Na/zxCv90NetGLRE0uX0aFssW.YYude36dyI4LH5ey',0,'CUSTOMER','ACTIVE','Trịnh Ngọc Ánh (Demo)','0910000014','Địa chỉ giả lập 14, khu dân cư Demo, TP.HCM',2007,'2007-11-04','Nam','Đồ họa','2026-08-04 19:47:03','2026-11-04 19:47:04'),('6b1b7c5f-a2ec-4ce7-9570-1d592fde0c18','khach2@demo.vn','$2b$12$xygu8rfEVM6Na/zxCv90NetGLRE0uX0aFssW.YYude36dyI4LH5ey',0,'CUSTOMER','ACTIVE','Trần Hoàng Nam (Demo)','0910000002','Địa chỉ giả lập 2, khu dân cư Demo, TP.HCM',2011,'2011-11-05','Nam','Đồ họa','2026-05-24 19:47:03','2026-11-04 19:47:04'),('6c609307-ebea-419a-b93d-0314a87b9caa','khach6@demo.vn','$2b$12$xygu8rfEVM6Na/zxCv90NetGLRE0uX0aFssW.YYude36dyI4LH5ey',0,'CUSTOMER','ACTIVE','Đặng Quốc Bảo (Demo)','0910000006','Địa chỉ giả lập 6, khu dân cư Demo, TP.HCM',2006,'2006-11-04','Khác','Đồ họa','2026-06-17 19:47:03','2026-11-04 19:47:04'),('71736766-54c4-4ca6-a5d2-4c95eac2ce81','khach9@demo.vn','$2b$12$xygu8rfEVM6Na/zxCv90NetGLRE0uX0aFssW.YYude36dyI4LH5ey',0,'CUSTOMER','ACTIVE','Hồ Bảo Ngọc (Demo)','0910000009','Địa chỉ giả lập 9, khu dân cư Demo, TP.HCM',2001,'2001-11-04','Khác','Gaming','2026-07-05 19:47:03','2026-11-04 19:47:04'),('93a00b56-d02f-4411-b174-d6ce2435f38a','khach15@demo.vn','$2b$12$xygu8rfEVM6Na/zxCv90NetGLRE0uX0aFssW.YYude36dyI4LH5ey',0,'CUSTOMER','ACTIVE','Nguyễn Hải Đăng (Demo)','0910000015','Địa chỉ giả lập 15, khu dân cư Demo, TP.HCM',1981,'1981-11-04','Khác','Văn phòng','2026-08-10 19:47:03','2026-11-04 19:47:04'),('96e04221-02f9-45bf-b47b-28dcb35904b9','khach11@demo.vn','$2b$12$xygu8rfEVM6Na/zxCv90NetGLRE0uX0aFssW.YYude36dyI4LH5ey',0,'CUSTOMER','LOCKED','Dương Thảo Vy (Demo)','0910000011','Địa chỉ giả lập 11, khu dân cư Demo, TP.HCM',2007,'2007-11-04','Nam','Văn phòng','2026-07-17 19:47:03','2026-11-04 19:47:04'),('9b568026-57e4-47f0-a331-bea09fe27e60','khach3@demo.vn','$2b$12$xygu8rfEVM6Na/zxCv90NetGLRE0uX0aFssW.YYude36dyI4LH5ey',0,'CUSTOMER','ACTIVE','Lê Thu Hà (Demo)','0910000003','Địa chỉ giả lập 3, khu dân cư Demo, TP.HCM',2011,'2011-11-04','Khác','Văn phòng','2026-05-30 19:47:03','2026-11-04 19:47:04'),('c0cd4216-cf6c-4fc6-a676-b4e4a06c0422','khach18@demo.vn','$2b$12$xygu8rfEVM6Na/zxCv90NetGLRE0uX0aFssW.YYude36dyI4LH5ey',0,'CUSTOMER','ACTIVE','Lâm Gia Bảo (Demo)','0910000018','Địa chỉ giả lập 18, khu dân cư Demo, TP.HCM',2002,'2002-11-04','Khác','Đồ họa','2026-11-03 19:47:03','2026-11-04 19:47:04'),('cefcaf80-0616-4a53-b03f-bbe45f891764','khach5@demo.vn','$2b$12$xygu8rfEVM6Na/zxCv90NetGLRE0uX0aFssW.YYude36dyI4LH5ey',0,'CUSTOMER','ACTIVE','Võ Ngọc Lan (Demo)','0910000005','Địa chỉ giả lập 5, khu dân cư Demo, TP.HCM',2009,'2009-11-04','Nam','Gaming','2026-06-11 19:47:03','2026-11-04 19:47:04'),('e8eeb18c-9795-4198-be82-befaa4201aca','khach13@demo.vn','$2b$12$xygu8rfEVM6Na/zxCv90NetGLRE0uX0aFssW.YYude36dyI4LH5ey',0,'CUSTOMER','ACTIVE','Phan Nhật Huy (Demo)','0910000013','Địa chỉ giả lập 13, khu dân cư Demo, TP.HCM',2010,'2010-11-04','Nữ','Gaming','2026-07-29 19:47:03','2026-11-04 19:47:04'),('ea1f9643-f0bc-4cc1-aa84-c7f1e773835c','khach7@demo.vn','$2b$12$xygu8rfEVM6Na/zxCv90NetGLRE0uX0aFssW.YYude36dyI4LH5ey',0,'CUSTOMER','ACTIVE','Bùi Thanh Mai (Demo)','0910000007','Địa chỉ giả lập 7, khu dân cư Demo, TP.HCM',2005,'2005-11-05','Nữ','Văn phòng','2026-06-23 19:47:03','2026-11-04 19:47:04');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'backline_crm_demo_v2_20261104124703_4e1565'
--

--
-- Dumping routines for database 'backline_crm_demo_v2_20261104124703_4e1565'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-04 19:52:48

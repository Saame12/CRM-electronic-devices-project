-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: backline_crm_demo_v3_20261112060733_436de4
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
INSERT INTO `customer_interests` VALUES ('29852a99-0f8b-48e6-8fc3-4dcfef901752','design'),('5ab5ec2a-60de-456a-a812-13625405c837','design'),('95974d30-040c-4de9-be6a-607c42713cb1','design'),('b84ae0cc-4fb3-46d8-9049-cfcc8ac11af5','design'),('d1eeef8f-c3da-4241-a7be-ab5e8f95e827','design'),('d207781f-1832-48b5-ac17-135451dd53f9','design'),('d3f59d4f-d2f0-4732-9edb-5c73c88f30bf','design'),('f6132e59-af9c-4b19-9d83-485220a56e48','design'),('0053880e-4182-41aa-8a44-9c1846eeeebb','gaming'),('29852a99-0f8b-48e6-8fc3-4dcfef901752','gaming'),('5ab5ec2a-60de-456a-a812-13625405c837','gaming'),('88298f34-2aed-4105-a0e4-6caa2864bbda','gaming'),('8e08fdee-e1a0-4544-8d7d-b46ac4d6587d','gaming'),('f6132e59-af9c-4b19-9d83-485220a56e48','gaming'),('ffa60692-a327-4fc5-89fd-7177eff64b51','gaming'),('8e08fdee-e1a0-4544-8d7d-b46ac4d6587d','learning'),('95974d30-040c-4de9-be6a-607c42713cb1','learning'),('cd288301-b787-450d-8585-e28a6fa4217f','learning'),('d2d02b5c-ecee-4770-92c4-9600be290e53','learning'),('f1172762-b42e-48a2-b67c-f2cd992b98c3','learning'),('fd7a3ebc-a800-42c0-8f06-96778e72ba8e','learning'),('07e6c92e-48bd-4788-bf45-329708cd89aa','office'),('cd288301-b787-450d-8585-e28a6fa4217f','office'),('d1eeef8f-c3da-4241-a7be-ab5e8f95e827','office'),('d207781f-1832-48b5-ac17-135451dd53f9','office'),('d2d02b5c-ecee-4770-92c4-9600be290e53','office'),('d3f59d4f-d2f0-4732-9edb-5c73c88f30bf','office'),('fd7a3ebc-a800-42c0-8f06-96778e72ba8e','office'),('ffa60692-a327-4fc5-89fd-7177eff64b51','office'),('a2869a3d-fefd-4d74-89e1-a5c4712f60ed','other'),('f1172762-b42e-48a2-b67c-f2cd992b98c3','other'),('0053880e-4182-41aa-8a44-9c1846eeeebb','programming'),('88298f34-2aed-4105-a0e4-6caa2864bbda','programming'),('b84ae0cc-4fb3-46d8-9049-cfcc8ac11af5','programming');
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
INSERT INTO `demo_datasets` VALUES ('backline-demo-v3','2026-11-12 13:07:35','{\"surveys\": 16, \"accounts\": 21, \"feedback\": 54, \"products\": 14, \"customers\": 18, \"questions\": 28, \"responses\": 21, \"scenarios\": [{\"id\": \"e3f5c15d-9557-4e16-aea5-270af30c5c03\", \"scope\": \"ALL\", \"title\": \"Mức độ hài lòng về dịch vụ\", \"status\": \"OPEN\", \"dueDate\": \"2026-12-12\", \"endMode\": \"DATE\"}, {\"id\": \"4ca6d4cd-4d90-474d-9d09-f14f7fa72075\", \"scope\": \"ALL\", \"title\": \"Nhu cầu mua sắm PC và laptop\", \"status\": \"OPEN\", \"dueDate\": \"2026-12-27\", \"endMode\": \"DATE\"}, {\"id\": \"a2623fb7-0fb7-4aa0-a89e-f86e47c76c78\", \"scope\": \"ALL\", \"title\": \"Trải nghiệm bảo hành và hỗ trợ\", \"status\": \"CLOSED\", \"dueDate\": \"2026-11-05\", \"endMode\": \"DATE\"}, {\"id\": \"47bdb92f-4f28-4c3a-b022-c19ebef5d793\", \"scope\": \"FILTER\", \"title\": \"Khảo sát ý tưởng ưu đãi thành viên\", \"status\": \"DRAFT\", \"dueDate\": null, \"endMode\": \"MANUAL\"}, {\"id\": \"424af115-bf2f-479a-86e8-5444b80890e8\", \"scope\": \"ALL\", \"title\": \"Đánh giá trải nghiệm mua hàng tháng trước\", \"status\": \"CLOSED\", \"dueDate\": \"2026-11-11\", \"endMode\": \"DATE\"}, {\"id\": \"3e63eeda-7bb2-4e96-8ed3-5508d5a993ad\", \"scope\": \"SELECTED\", \"title\": \"Khảo sát chương trình chăm sóc khách hàng\", \"status\": \"CLOSED\", \"dueDate\": \"2026-11-10\", \"endMode\": \"DATE\"}, {\"id\": \"9b8ff7f2-e0b9-489c-a546-505b64ecffc5\", \"scope\": \"FILTER\", \"title\": \"Khảo sát Gaming/Đồ họa 15–20 tuổi\", \"status\": \"OPEN\", \"dueDate\": \"2026-12-02\", \"endMode\": \"DATE\"}, {\"id\": \"e6acb7c6-c6de-44af-b8c3-019dbc8444af\", \"scope\": \"SELECTED\", \"title\": \"Khảo sát khách được chọn riêng\", \"status\": \"OPEN\", \"dueDate\": \"2026-12-03\", \"endMode\": \"DATE\"}, {\"id\": \"c5f0e65d-24e3-4a5a-af6d-cf968d692c23\", \"scope\": null, \"title\": \"[Bản nháp] Chưa thiết lập phạm vi\", \"status\": \"DRAFT\", \"dueDate\": null, \"endMode\": \"MANUAL\"}, {\"id\": \"06968483-e8d7-446b-9538-fa50117822d1\", \"scope\": \"ALL\", \"title\": \"[Bản nháp] Đã chọn Tất cả\", \"status\": \"DRAFT\", \"dueDate\": \"2026-12-12\", \"endMode\": \"DATE\"}, {\"id\": \"af480159-a15d-466e-9b04-bc01f67816d9\", \"scope\": \"SELECTED\", \"title\": \"[Bản nháp] Đã chọn từng khách\", \"status\": \"DRAFT\", \"dueDate\": \"2026-11-26\", \"endMode\": \"DATE\"}, {\"id\": \"87c1314f-40e4-4706-9016-747b418da4d1\", \"scope\": \"FILTER\", \"title\": \"Khảo sát khách hàng 25–45 tuổi\", \"status\": \"OPEN\", \"dueDate\": \"2026-11-27\", \"endMode\": \"DATE\"}, {\"id\": \"2d3c62e9-8d7a-415d-9059-fb8cd114a2ea\", \"scope\": \"ALL\", \"title\": \"[Đóng thủ công] Góp ý dịch vụ thường xuyên\", \"status\": \"OPEN\", \"dueDate\": null, \"endMode\": \"MANUAL\"}, {\"id\": \"ea88cf3b-c110-42b9-a186-cadb5d97d12b\", \"scope\": \"SELECTED\", \"title\": \"[Hết hạn hôm nay] Xác nhận nhu cầu hỗ trợ\", \"status\": \"OPEN\", \"dueDate\": \"2026-11-12\", \"endMode\": \"DATE\"}, {\"id\": \"7c9c2722-853e-4580-8788-486e85a9452a\", \"scope\": \"FILTER\", \"title\": \"[Đã gia hạn] Góp ý nhóm Gaming và Đồ họa\", \"status\": \"OPEN\", \"dueDate\": \"2026-11-26\", \"endMode\": \"DATE\"}, {\"id\": \"15a6382c-d76d-4d7b-bc5c-f35bea576bc4\", \"scope\": \"ALL\", \"title\": \"[Đã mở lại] Đánh giá hỗ trợ sau mua\", \"status\": \"OPEN\", \"dueDate\": \"2026-11-22\", \"endMode\": \"DATE\"}], \"recipients\": 135, \"answerDetails\": 47, \"interestLinks\": 34, \"recoveryHistory\": 2, \"lifecycleHistory\": 5}');
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
  `status` enum('NEW','RESOLVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  `reply_content` text COLLATE utf8mb4_unicode_ci,
  `revision` int NOT NULL DEFAULT '0',
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
INSERT INTO `feedback` VALUES ('025832cc-7f55-4b0f-95fe-bbc8818b5b79','f6132e59-af9c-4b19-9d83-485220a56e48','2a8f68d6-b45c-42cf-a11f-805bbda221ac','Báo lỗi / Khiếu nại',4,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-10-04 13:07:34','2026-11-12 13:07:35'),('0e2ee034-43b0-4750-be76-021b3da9b502','29852a99-0f8b-48e6-8fc3-4dcfef901752','390f4858-2235-41fe-b678-f9f9266807aa','Báo lỗi / Khiếu nại',3,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-10 13:07:34','2026-11-12 13:07:35'),('0f34dc45-e641-4962-a72c-a8139bcf0dfd','88298f34-2aed-4105-a0e4-6caa2864bbda','e1a3ab66-fa06-4383-91f3-a53cede1ea14','Khen ngợi',5,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-13 13:07:34','2026-11-12 13:07:35'),('17cb390e-e9d1-469a-b18f-613f4eae6bd2','d3f59d4f-d2f0-4732-9edb-5c73c88f30bf','9b947205-f750-4dd8-8eb3-8ad8bda91745','Câu hỏi',2,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-08-22 13:07:34','2026-11-12 13:07:35'),('1810e66f-4758-45fd-833a-86228f3c2e11','fd7a3ebc-a800-42c0-8f06-96778e72ba8e','c40ea776-bf28-494c-a6f5-758e5c449c71','Góp ý',3,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-10-10 13:07:34','2026-11-12 13:07:35'),('1b467570-7b38-43bd-81a6-770da5e6b459','b84ae0cc-4fb3-46d8-9049-cfcc8ac11af5','e1a3ab66-fa06-4383-91f3-a53cede1ea14','Khen ngợi',2,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]',0,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-11-12 13:07:34',0,NULL,'2026-11-11 13:07:34','2026-11-12 13:07:35'),('28a6fc57-62ae-41b1-be60-3221a0076072','ffa60692-a327-4fc5-89fd-7177eff64b51','37d73d65-6a4b-44b5-8298-d1d96a2aea3c','Khen ngợi',1,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-10-07 13:07:34','2026-11-12 13:07:35'),('2cdb0f09-2796-40bd-90f0-a1d3e81251de','d3f59d4f-d2f0-4732-9edb-5c73c88f30bf','37d73d65-6a4b-44b5-8298-d1d96a2aea3c','Khen ngợi',4,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-09 13:07:34','2026-11-12 13:07:35'),('2dcb2df7-c66e-41e3-9384-b0f5ce4e93a2','d2d02b5c-ecee-4770-92c4-9600be290e53','9b947205-f750-4dd8-8eb3-8ad8bda91745','Khen ngợi',5,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-10-03 13:07:34','2026-11-12 13:07:35'),('31db7fda-2725-4008-a04d-9e2b0658c6a4','ffa60692-a327-4fc5-89fd-7177eff64b51','9b947205-f750-4dd8-8eb3-8ad8bda91745','Câu hỏi',4,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-19 13:07:34','2026-11-12 13:07:35'),('32da7433-ca14-402d-bab4-a8f4e4825424','a2869a3d-fefd-4d74-89e1-a5c4712f60ed','2a8f68d6-b45c-42cf-a11f-805bbda221ac','Góp ý',3,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]',0,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-09-22 13:07:34',0,NULL,'2026-09-20 13:07:34','2026-11-12 13:07:35'),('34944b38-7fb4-4cbf-9583-797d15cdd7d3','88298f34-2aed-4105-a0e4-6caa2864bbda','1bb7148a-4792-4179-9757-8861bd5b75c3','Câu hỏi',2,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-10-01 13:07:34','2026-11-12 13:07:35'),('4687195f-ac92-4e1f-8459-2a5515e91b8d','f6132e59-af9c-4b19-9d83-485220a56e48','3f283652-77ab-4b2b-bc02-2b4bf515979b','Góp ý',2,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-16 13:07:34','2026-11-12 13:07:35'),('47178656-70ec-4759-abd4-325b03ad2114','f1172762-b42e-48a2-b67c-f2cd992b98c3','e1a3ab66-fa06-4383-91f3-a53cede1ea14','Câu hỏi',4,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]',0,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-09-01 13:07:34',0,NULL,'2026-08-30 13:07:34','2026-11-12 13:07:35'),('49493feb-6e9a-4ee7-96f2-020b494e0955','cd288301-b787-450d-8585-e28a6fa4217f','da0b0ef9-adf7-44ab-ac96-51c2ae2dba64','Góp ý',2,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-10-06 13:07:34','2026-11-12 13:07:35'),('4a2f16c2-c92c-44ea-bfa8-035c2fc7cc31','0053880e-4182-41aa-8a44-9c1846eeeebb','2a8f68d6-b45c-42cf-a11f-805bbda221ac','Báo lỗi / Khiếu nại',2,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-06 13:07:34','2026-11-12 13:07:35'),('4e6a3f09-cacf-40cb-b5d5-9648018311e1','f1172762-b42e-48a2-b67c-f2cd992b98c3','1bb7148a-4792-4179-9757-8861bd5b75c3','Khen ngợi',1,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]',0,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-09-19 13:07:34',0,NULL,'2026-09-17 13:07:34','2026-11-12 13:07:35'),('4e979d41-9a24-4efc-a29f-c7b0714bebc4','f6132e59-af9c-4b19-9d83-485220a56e48','c40ea776-bf28-494c-a6f5-758e5c449c71','Báo lỗi / Khiếu nại',5,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-08-29 13:07:34','2026-11-12 13:07:35'),('4f598fba-87de-476a-89e1-4838bbf27266','a2869a3d-fefd-4d74-89e1-a5c4712f60ed','3f283652-77ab-4b2b-bc02-2b4bf515979b','Báo lỗi / Khiếu nại',1,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]',0,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-09-04 13:07:34',1,'2026-09-04 13:07:34','2026-09-02 13:07:34','2026-11-12 13:07:35'),('5a43a543-a771-41a6-aa44-8f63a9c4a681','d1eeef8f-c3da-4241-a7be-ab5e8f95e827','fd07c371-0d3a-48fb-b30f-2ab56a6eb3e2','Góp ý',1,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]',0,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-10-04 13:07:34',0,NULL,'2026-10-02 13:07:34','2026-11-12 13:07:35'),('5d1ae8ce-363b-44f9-9a14-b0443b0d5804','95974d30-040c-4de9-be6a-607c42713cb1','fd07c371-0d3a-48fb-b30f-2ab56a6eb3e2','Báo lỗi / Khiếu nại',3,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]',0,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-08-23 13:07:34',1,'2026-08-23 13:07:34','2026-08-21 13:07:34','2026-11-12 13:07:35'),('5da62c33-47a6-4eaa-bee7-f32e7b9a0e27','b84ae0cc-4fb3-46d8-9049-cfcc8ac11af5','37d73d65-6a4b-44b5-8298-d1d96a2aea3c','Câu hỏi',5,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]',0,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-11-12 13:07:34',0,NULL,'2026-11-11 13:07:34','2026-11-12 13:07:35'),('5e445b6e-072f-4ce8-8f13-e7f132679831','0053880e-4182-41aa-8a44-9c1846eeeebb','390f4858-2235-41fe-b678-f9f9266807aa','Góp ý',4,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-24 13:07:34','2026-11-12 13:07:35'),('60ead27c-f22e-4125-80c6-329efb9bd86c','d2d02b5c-ecee-4770-92c4-9600be290e53','11850d65-051b-49b9-bc11-632e9b63ac06','Câu hỏi',3,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-15 13:07:34','2026-11-12 13:07:35'),('65e722cd-3245-4e12-97df-6289b0433be7','07e6c92e-48bd-4788-bf45-329708cd89aa','ea1725f5-2b70-463f-9727-4fd02205c6a4','Khen ngợi',2,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-21 13:07:34','2026-11-12 13:07:35'),('673d581a-ea37-4358-a7ba-8b243a3d84e6','d207781f-1832-48b5-ac17-135451dd53f9','da0b0ef9-adf7-44ab-ac96-51c2ae2dba64','Báo lỗi / Khiếu nại',4,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-08-25 13:07:34','2026-11-12 13:07:35'),('67439e01-049d-485d-b5a4-a2956d0aa064','5ab5ec2a-60de-456a-a812-13625405c837','ea1725f5-2b70-463f-9727-4fd02205c6a4','Câu hỏi',1,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-07 13:07:34','2026-11-12 13:07:35'),('674583be-d51a-4593-9571-f5c628a45639','fd7a3ebc-a800-42c0-8f06-96778e72ba8e','da0b0ef9-adf7-44ab-ac96-51c2ae2dba64','Báo lỗi / Khiếu nại',1,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-22 13:07:34','2026-11-12 13:07:35'),('6d09e766-4127-4067-bf19-f00d69d550cd','b84ae0cc-4fb3-46d8-9049-cfcc8ac11af5','9b947205-f750-4dd8-8eb3-8ad8bda91745','Khen ngợi',3,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]',0,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-11-12 13:07:34',0,NULL,'2026-11-11 13:07:34','2026-11-12 13:07:35'),('702532e5-11cb-4ea0-a0a6-9a0046ef3532','ffa60692-a327-4fc5-89fd-7177eff64b51','11850d65-051b-49b9-bc11-632e9b63ac06','Khen ngợi',2,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-01 13:07:34','2026-11-12 13:07:35'),('804aa3b5-025f-4fa6-b43a-74a4f946166b','5ab5ec2a-60de-456a-a812-13625405c837','1bb7148a-4792-4179-9757-8861bd5b75c3','Khen ngợi',4,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-08-20 13:07:34','2026-11-12 13:07:35'),('8340b5dc-967e-4851-b67f-bcb246358901','f1172762-b42e-48a2-b67c-f2cd992b98c3','ea1725f5-2b70-463f-9727-4fd02205c6a4','Câu hỏi',3,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]',0,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-10-07 13:07:34',0,NULL,'2026-10-05 13:07:34','2026-11-12 13:07:35'),('85b46ff3-2af6-4c2b-b108-5b6b3a6ab1b0','8e08fdee-e1a0-4544-8d7d-b46ac4d6587d','11850d65-051b-49b9-bc11-632e9b63ac06','Khen ngợi',4,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]',0,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-10-01 13:07:34',0,NULL,'2026-09-29 13:07:34','2026-11-12 13:07:35'),('88193dce-2bed-4562-bb2a-122f9c2c28f9','8e08fdee-e1a0-4544-8d7d-b46ac4d6587d','ffe02812-27a6-46a7-98ed-219191c3c81f','Câu hỏi',2,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]',0,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-09-13 13:07:34',0,NULL,'2026-09-11 13:07:34','2026-11-12 13:07:35'),('90419b11-4c8e-4ffc-bca7-4b500acd20c7','95974d30-040c-4de9-be6a-607c42713cb1','da0b0ef9-adf7-44ab-ac96-51c2ae2dba64','Góp ý',5,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]',0,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-09-10 13:07:34',0,NULL,'2026-09-08 13:07:34','2026-11-12 13:07:35'),('98b15030-15ee-440a-beb5-9bec2c04c17e','d207781f-1832-48b5-ac17-135451dd53f9','c40ea776-bf28-494c-a6f5-758e5c449c71','Góp ý',1,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-12 13:07:34','2026-11-12 13:07:35'),('98fe02e4-59ff-420f-9c45-f1929ef63f11','cd288301-b787-450d-8585-e28a6fa4217f','fd07c371-0d3a-48fb-b30f-2ab56a6eb3e2','Báo lỗi / Khiếu nại',5,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-18 13:07:34','2026-11-12 13:07:35'),('a021ec95-3408-4de2-9f47-a8221cad6440','d207781f-1832-48b5-ac17-135451dd53f9','3f283652-77ab-4b2b-bc02-2b4bf515979b','Báo lỗi / Khiếu nại',3,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-30 13:07:34','2026-11-12 13:07:35'),('aeaa25ba-e93c-44fb-94fd-dfbdbfc65648','07e6c92e-48bd-4788-bf45-329708cd89aa','1bb7148a-4792-4179-9757-8861bd5b75c3','Câu hỏi',5,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-03 13:07:34','2026-11-12 13:07:35'),('b53cf7be-4e6b-464e-a276-f820fb205b26','29852a99-0f8b-48e6-8fc3-4dcfef901752','d06ae0c7-0146-4f09-ad6e-3bebe3453d0d','Góp ý',5,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-28 13:07:34','2026-11-12 13:07:35'),('bbc6ae7b-b3d9-46bc-8716-cedc9e979148','07e6c92e-48bd-4788-bf45-329708cd89aa','ffe02812-27a6-46a7-98ed-219191c3c81f','Câu hỏi',4,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-10-09 13:07:34','2026-11-12 13:07:35'),('c7e72f24-d1ba-4632-88e5-183bc676b35b','8e08fdee-e1a0-4544-8d7d-b46ac4d6587d','ea1725f5-2b70-463f-9727-4fd02205c6a4','Khen ngợi',5,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]',0,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-08-26 13:07:34',0,NULL,'2026-08-24 13:07:34','2026-11-12 13:07:35'),('ce698332-46ba-4d1e-9015-cbc2ccbe325d','d2d02b5c-ecee-4770-92c4-9600be290e53','ffe02812-27a6-46a7-98ed-219191c3c81f','Khen ngợi',1,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-08-28 13:07:34','2026-11-12 13:07:35'),('d6d321e1-a056-44d6-a1bf-34d325717fa7','5ab5ec2a-60de-456a-a812-13625405c837','ffe02812-27a6-46a7-98ed-219191c3c81f','Khen ngợi',3,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-25 13:07:34','2026-11-12 13:07:35'),('d9215d66-3c37-4cdc-b221-251c6a007059','0053880e-4182-41aa-8a44-9c1846eeeebb','3f283652-77ab-4b2b-bc02-2b4bf515979b','Góp ý',5,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-08-19 13:07:34','2026-11-12 13:07:35'),('dc470dd0-9b3e-4e2c-952c-bf782c0fdf8f','cd288301-b787-450d-8585-e28a6fa4217f','d06ae0c7-0146-4f09-ad6e-3bebe3453d0d','Góp ý',3,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-08-31 13:07:34','2026-11-12 13:07:35'),('e14e459e-6ade-49cd-ab1c-c4bf40b910fd','95974d30-040c-4de9-be6a-607c42713cb1','c40ea776-bf28-494c-a6f5-758e5c449c71','Báo lỗi / Khiếu nại',2,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]',0,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-09-28 13:07:34',1,'2026-09-28 13:07:34','2026-09-26 13:07:34','2026-11-12 13:07:35'),('e2425c0b-6e10-43ae-99f9-258bf23b752d','29852a99-0f8b-48e6-8fc3-4dcfef901752','2a8f68d6-b45c-42cf-a11f-805bbda221ac','Góp ý',1,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-08-23 13:07:34','2026-11-12 13:07:35'),('e2b3ca4e-f39d-4681-88d1-a1ece1acdb85','d1eeef8f-c3da-4241-a7be-ab5e8f95e827','d06ae0c7-0146-4f09-ad6e-3bebe3453d0d','Báo lỗi / Khiếu nại',4,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]',0,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-09-16 13:07:34',1,'2026-09-16 13:07:34','2026-09-14 13:07:34','2026-11-12 13:07:35'),('e31c3fa5-e236-472d-ab67-1a9ddba2c04d','fd7a3ebc-a800-42c0-8f06-96778e72ba8e','fd07c371-0d3a-48fb-b30f-2ab56a6eb3e2','Góp ý',4,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-04 13:07:34','2026-11-12 13:07:35'),('ebc8d668-d272-41a1-a7c2-fd494f340a83','d1eeef8f-c3da-4241-a7be-ab5e8f95e827','390f4858-2235-41fe-b678-f9f9266807aa','Góp ý',2,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]',0,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-08-29 13:07:34',0,NULL,'2026-08-27 13:07:34','2026-11-12 13:07:35'),('f94d6083-b000-4dad-90ce-da232f232902','88298f34-2aed-4105-a0e4-6caa2864bbda','37d73d65-6a4b-44b5-8298-d1d96a2aea3c','Câu hỏi',3,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-08-26 13:07:34','2026-11-12 13:07:35'),('fc1a5c08-cb56-458c-b597-311c1d2610f0','a2869a3d-fefd-4d74-89e1-a5c4712f60ed','390f4858-2235-41fe-b678-f9f9266807aa','Báo lỗi / Khiếu nại',5,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]',0,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-10-10 13:07:34',1,'2026-10-10 13:07:34','2026-10-08 13:07:34','2026-11-12 13:07:35'),('fcdb0930-29c0-416f-941f-bd2972334169','d3f59d4f-d2f0-4732-9edb-5c73c88f30bf','e1a3ab66-fa06-4383-91f3-a53cede1ea14','Câu hỏi',1,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','NEW',NULL,0,NULL,NULL,0,NULL,'2026-09-27 13:07:34','2026-11-12 13:07:35');
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
INSERT INTO `password_recovery_requests` VALUES ('4b52b1ef-c0cb-4497-98a7-b57f98e35668','5ab5ec2a-60de-456a-a812-13625405c837','khach2@demo.vn','000136f7f14890b555e98e0b2d856c0aa80e8b27b94776eabfe02674b13657ec','REJECTED','Lịch sử yêu cầu khôi phục mật khẩu giả lập để trình diễn.','[DEMO] Bản ghi lịch sử giả lập, không có mã khôi phục có thể sử dụng.','d9d47e23-c8a6-496a-bc60-228ade643634','Quản trị viên Demo','2026-11-07 13:07:34','2026-11-08 13:07:34','2026-11-08 13:07:34',NULL,0,'MANUAL',NULL),('567eef6b-c03f-430d-a159-3168f47a27df','0053880e-4182-41aa-8a44-9c1846eeeebb','khach@demo.vn','4dec3690bc072149dfedd63c9d32131a855d50547bfb5781f0cb54d615236916','COMPLETED','Lịch sử yêu cầu khôi phục mật khẩu giả lập để trình diễn.','[DEMO] Bản ghi lịch sử giả lập, không có mã khôi phục có thể sử dụng.','d9d47e23-c8a6-496a-bc60-228ade643634','Quản trị viên Demo','2026-11-06 13:07:34','2026-11-07 13:07:34','2026-11-07 13:07:34','2026-11-08 13:07:34',0,'MANUAL',NULL);
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
INSERT INTO `products` VALUES ('11850d65-051b-49b9-bc11-632e9b63ac06','PC Văn phòng Backline O2','PC',1,'2026-11-12 13:07:35'),('1bb7148a-4792-4179-9757-8861bd5b75c3','HP 15-fd0231TU','Laptop',1,'2026-11-12 13:07:35'),('2a8f68d6-b45c-42cf-a11f-805bbda221ac','ASUS TUF Gaming F15 FX507','Laptop',1,'2026-11-12 13:07:35'),('37d73d65-6a4b-44b5-8298-d1d96a2aea3c','Acer Nitro V 15 ANV15','Laptop',1,'2026-11-12 13:07:35'),('390f4858-2235-41fe-b678-f9f9266807aa','PC Gaming Backline G1','PC',1,'2026-11-12 13:07:35'),('3f283652-77ab-4b2b-bc02-2b4bf515979b','Dell Inspiron 15 3530','Laptop',1,'2026-11-12 13:07:35'),('9b947205-f750-4dd8-8eb3-8ad8bda91745','ASUS Vivobook 15 X1504','Laptop',1,'2026-11-12 13:07:35'),('c40ea776-bf28-494c-a6f5-758e5c449c71','PC Gaming Backline G3','PC',1,'2026-11-12 13:07:35'),('d06ae0c7-0146-4f09-ad6e-3bebe3453d0d','PC Văn phòng Backline O1','PC',1,'2026-11-12 13:07:35'),('da0b0ef9-adf7-44ab-ac96-51c2ae2dba64','MSI Thin 15 B13VE','Laptop',1,'2026-11-12 13:07:35'),('e1a3ab66-fa06-4383-91f3-a53cede1ea14','PC Đồ họa Backline D1','PC',1,'2026-11-12 13:07:35'),('ea1725f5-2b70-463f-9727-4fd02205c6a4','Lenovo LOQ 15IAX9','Laptop',1,'2026-11-12 13:07:35'),('fd07c371-0d3a-48fb-b30f-2ab56a6eb3e2','Lenovo IdeaPad Slim 3 15IAH8','Laptop',1,'2026-11-12 13:07:35'),('ffe02812-27a6-46a7-98ed-219191c3c81f','PC Gaming Backline G2','PC',1,'2026-11-12 13:07:35');
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
INSERT INTO `question_options` VALUES ('0309712e-477c-4562-a667-1e20e660c40d','8c2ef8b4-58b4-4098-9ed2-05b86ca27cbb','Thiết kế',2),('0d4f91c4-1410-454a-a84a-3b6e62e2fa44','e60e2e8d-6322-49d5-8709-5637e022ba6f','Đi ngang qua cửa hàng',4),('1640ea16-055b-48e5-a948-aea261a9d548','11c7b9f6-eba9-4f67-967e-1a9638a6d616','Tại cửa hàng',3),('1b6e91d2-81d9-46bc-b569-9a084c3da6c9','93d8881a-8375-4b39-8f98-8d946c35aaef','Laptop',1),('22be45cf-7ae1-4bf2-8822-4a869e819af1','c1fd25b1-dde0-4a76-8429-ad9a771aafa8','Văn phòng / Học tập',3),('308dafcd-1758-460e-85b3-c63efd43d4df','c6752765-4071-4d35-a6bc-80d79483f808','Giảm giá linh kiện',1),('3c6b9c41-fcf4-4fc2-9c79-d241a5c9397e','8c2ef8b4-58b4-4098-9ed2-05b86ca27cbb','Dựng video',3),('4b4d8e87-dd42-4e83-b746-ea451b9a6bc0','2f472773-a9a9-421b-ac32-b683d8e9d7cd','Chưa tốt',4),('53d7b04c-72b1-4c02-af8c-2dc92baba67f','11c7b9f6-eba9-4f67-967e-1a9638a6d616','Email',2),('57350999-ef13-427c-9f93-c5b76e6aa61f','e60e2e8d-6322-49d5-8709-5637e022ba6f','Facebook / TikTok',2),('72a36eaf-f01e-4767-99c0-8a67f46c9193','42c50463-4a6a-4540-bb56-40155b4a6755','10 - 20 triệu',2),('72b405dd-5866-400e-aad0-61a4b6869a77','8c2ef8b4-58b4-4098-9ed2-05b86ca27cbb','Chơi game',1),('7a6b8501-faea-4d20-8a11-c897057ede4b','42c50463-4a6a-4540-bb56-40155b4a6755','20 - 35 triệu',3),('845e6670-1387-4506-b29c-b69a6706c6cd','c6752765-4071-4d35-a6bc-80d79483f808','Vệ sinh máy miễn phí',2),('863fd0ec-3889-4e48-ae19-bafe14363b6f','c1fd25b1-dde0-4a76-8429-ad9a771aafa8','Gaming',1),('8b0b661c-af93-4bac-a5a1-777d09b655db','2f472773-a9a9-421b-ac32-b683d8e9d7cd','Bình thường',3),('91c195ce-a627-4161-b99d-1f652da27794','93d8881a-8375-4b39-8f98-8d946c35aaef','Chưa có dự định',4),('931f13ff-d132-40e2-b6cd-c60666057136','93d8881a-8375-4b39-8f98-8d946c35aaef','Linh kiện nâng cấp',3),('9e214163-417d-4dbc-8a0b-9282d8d07dd2','89448659-8e5f-4d65-af15-99f61a348e9a','Email',1),('acdaec5e-2af5-448a-888a-0f4a402ff76b','c1fd25b1-dde0-4a76-8429-ad9a771aafa8','Lập trình',4),('af563866-3a78-4e08-9620-c41f696ca28f','c1fd25b1-dde0-4a76-8429-ad9a771aafa8','Đồ họa / Thiết kế',2),('b9ebef4d-7c7c-425d-9ae9-a1513ada31de','93d8881a-8375-4b39-8f98-8d946c35aaef','PC lắp sẵn',2),('bd469d62-bd33-475a-b184-c6f1d6f34d1c','89448659-8e5f-4d65-af15-99f61a348e9a','Điện thoại',2),('c3cfd1ef-0d7d-4fdd-905e-cf901f359fd2','e60e2e8d-6322-49d5-8709-5637e022ba6f','Tìm kiếm Google',3),('c7a540d4-07b8-447e-9f81-68e7ff75ac9a','42c50463-4a6a-4540-bb56-40155b4a6755','Dưới 10 triệu',1),('d2d53ff6-c14c-4f52-ba12-101e07b92b55','c6752765-4071-4d35-a6bc-80d79483f808','Tặng phụ kiện',3),('dcec8ca0-41b8-408e-a886-6580ea2d8f77','11c7b9f6-eba9-4f67-967e-1a9638a6d616','Điện thoại',1),('dd5e25f0-ccf4-4a1e-b95c-0890321a163b','2f472773-a9a9-421b-ac32-b683d8e9d7cd','Rất tốt',1),('e1f8dfcd-190f-4c17-ae0a-b7a5702e637f','42c50463-4a6a-4540-bb56-40155b4a6755','Trên 35 triệu',4),('f62bfa74-44a9-4a51-8997-2176f7d714de','e60e2e8d-6322-49d5-8709-5637e022ba6f','Bạn bè giới thiệu',1),('f8c51473-9314-4655-8f0f-93bebf7672fb','e60e2e8d-6322-49d5-8709-5637e022ba6f','Khác',5),('fec35d26-87c1-429d-96d9-095b050148fd','2f472773-a9a9-421b-ac32-b683d8e9d7cd','Tốt',2);
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
INSERT INTO `response_details` VALUES ('0652d763-12c6-4d43-b456-7950ba88b871','c752d7c9-a399-496a-983b-85dfc2b21d08','42c50463-4a6a-4540-bb56-40155b4a6755','c7a540d4-07b8-447e-9f81-68e7ff75ac9a',NULL,NULL),('0a72ac98-34be-4a8a-9dd9-c2e994b40092','242fd0cb-e93e-48bf-98f9-14d84c170420','93d8881a-8375-4b39-8f98-8d946c35aaef','931f13ff-d132-40e2-b6cd-c60666057136',NULL,NULL),('0dbe83e6-03a6-42e0-bc02-923912341034','c752d7c9-a399-496a-983b-85dfc2b21d08','c1fd25b1-dde0-4a76-8429-ad9a771aafa8','af563866-3a78-4e08-9620-c41f696ca28f',NULL,NULL),('11f019bf-b058-4a16-a362-f367c2913ba9','d4a9866d-7233-4ed2-9e8b-58ee8c8aa934','421e5509-c5c3-4453-9772-2353553e70dc',NULL,'Sẽ giới thiệu cửa hàng đến bạn bè. [Demo]',NULL),('15ea5c18-8666-4c09-bdc3-5cc7e58fe9ee','fcbf9a36-8c04-4813-833d-644a44e9ff8f','42c50463-4a6a-4540-bb56-40155b4a6755','c7a540d4-07b8-447e-9f81-68e7ff75ac9a',NULL,NULL),('196675fb-b9d2-4012-8a8d-75fbfc49e6db','4507dc72-caa2-4c0a-b17e-1a88138110fe','7cfa0ecf-27a1-4e92-a2d8-188b296f8785',NULL,NULL,4),('19f62b01-20bc-4470-8624-a1016a72f954','ed108542-e78b-4dfe-ae0a-12bbf4f6420f','06a2904c-f6b3-42cd-8a2a-a021ed28e590',NULL,'Tư vấn rõ ràng, tôi hài lòng với trải nghiệm. [Demo]',NULL),('1a2807b6-1bac-43a7-8884-b59e767d1753','c6a1c0d3-1255-4ffe-bff2-981adc89f3f9','3ea2764a-b4fd-479c-bea1-b57fa6f76af3',NULL,NULL,4),('1da709e3-713c-42d0-90f4-f8fd6e3e861c','242fd0cb-e93e-48bf-98f9-14d84c170420','42c50463-4a6a-4540-bb56-40155b4a6755','7a6b8501-faea-4d20-8a11-c897057ede4b',NULL,NULL),('348d7e96-2031-4d25-b5ce-391644e22e49','6f6ebc02-0df9-4561-9079-8aec6badba7c','7cfa0ecf-27a1-4e92-a2d8-188b296f8785',NULL,NULL,5),('4835e312-1ed0-4347-aeaa-d0b5227d7328','242fd0cb-e93e-48bf-98f9-14d84c170420','c1fd25b1-dde0-4a76-8429-ad9a771aafa8','acdaec5e-2af5-448a-888a-0f4a402ff76b',NULL,NULL),('4cc770fc-19cd-4d2d-aeea-d1ebbddafa30','d9ba936c-2dc9-4084-b00f-bb1cc7393fef','8c2ef8b4-58b4-4098-9ed2-05b86ca27cbb','0309712e-477c-4562-a667-1e20e660c40d',NULL,NULL),('51d7b253-772d-40c2-8e39-0dc4210a7061','117233b0-2a51-4096-9c03-b122f77df828','d9f1650d-1be7-4c8f-bc85-c2ab2c5432ae',NULL,'Sẽ giới thiệu cửa hàng đến bạn bè. [Demo]',NULL),('54c098ce-751c-4289-90a4-83bd42645e19','bde309a7-a291-4abe-bd5b-450d6f6ea705','e7866f1c-30ec-46bf-a64a-c9dc5f0357bf',NULL,'Sẽ giới thiệu cửa hàng đến bạn bè. [Demo]',NULL),('620346cc-09fe-4105-826f-d6b2cdc3d414','047456be-9325-4b46-b038-0b747e916cec','7cfa0ecf-27a1-4e92-a2d8-188b296f8785',NULL,NULL,5),('6ecaf3e7-a379-4d7d-bcb8-7bcdc1a328de','ed108542-e78b-4dfe-ae0a-12bbf4f6420f','c1fd25b1-dde0-4a76-8429-ad9a771aafa8','863fd0ec-3889-4e48-ae19-bafe14363b6f',NULL,NULL),('7469bb52-0ceb-464f-810a-860b7e1942b9','c752d7c9-a399-496a-983b-85dfc2b21d08','06a2904c-f6b3-42cd-8a2a-a021ed28e590',NULL,'Mong cửa hàng cải thiện thời gian hỗ trợ. [Demo]',NULL),('7b963e35-448c-4b3e-95ac-ace83c6121de','d4a9866d-7233-4ed2-9e8b-58ee8c8aa934','aebce4f7-bd76-4340-ab29-ebaba69c0e1e',NULL,NULL,5),('7f1c13b3-7c4a-4334-878a-a1998fc218f2','047456be-9325-4b46-b038-0b747e916cec','e3f22e7a-4774-4b7e-a58d-8ea639a1b0bd',NULL,'Sẽ giới thiệu cửa hàng đến bạn bè. [Demo]',NULL),('897926c6-c8d9-4847-a361-050554e742bf','fcbf9a36-8c04-4813-833d-644a44e9ff8f','c1fd25b1-dde0-4a76-8429-ad9a771aafa8','af563866-3a78-4e08-9620-c41f696ca28f',NULL,NULL),('8ece08cd-4acd-4af1-9bd8-e32116f8d385','c73e41a7-bddd-48d0-a8c4-9c6fc56f3ee0','79d1d706-5f25-4c09-9eb3-e34225a26146',NULL,'Tôi mong tiếp tục nhận được hỗ trợ tận tình.',NULL),('93a18eb6-3548-458c-9d1c-221730f4c493','dabf991c-18ab-46ed-8b92-81f1c5967d7e','7cfa0ecf-27a1-4e92-a2d8-188b296f8785',NULL,NULL,3),('95bb9c5a-c6df-441a-8735-26dd6f4db605','242fd0cb-e93e-48bf-98f9-14d84c170420','c1fd25b1-dde0-4a76-8429-ad9a771aafa8','22be45cf-7ae1-4bf2-8822-4a869e819af1',NULL,NULL),('9ab7e1ab-8e81-41b7-852e-358892681b7c','e2de4064-1f53-43a8-83c1-0713959f35d4','506ed3b1-2ac0-4f36-8b11-ff2274306bdb',NULL,'Tôi mong tiếp tục nhận được hỗ trợ tận tình.',NULL),('a0fdafc8-60d8-4059-b7d2-57c1b394e94b','38c12889-e14d-4a21-b1b0-9984d6abb545','7cfa0ecf-27a1-4e92-a2d8-188b296f8785',NULL,NULL,4),('a4afe3a0-8215-457b-bba6-93d79c996c9e','bde309a7-a291-4abe-bd5b-450d6f6ea705','3ea2764a-b4fd-479c-bea1-b57fa6f76af3',NULL,NULL,5),('a6d35302-9ca0-4e72-a462-7bbfa695af47','985f26c6-3e6e-4fd7-be89-7ed609f24fc8','7cfa0ecf-27a1-4e92-a2d8-188b296f8785',NULL,NULL,3),('b842a4f1-8e4a-4d1c-955a-85945ed49f84','117233b0-2a51-4096-9c03-b122f77df828','8c2ef8b4-58b4-4098-9ed2-05b86ca27cbb','3c6b9c41-fcf4-4fc2-9c79-d241a5c9397e',NULL,NULL),('b9041e9e-e0db-47cb-a0d7-95ef14232600','985f26c6-3e6e-4fd7-be89-7ed609f24fc8','e3f22e7a-4774-4b7e-a58d-8ea639a1b0bd',NULL,'Tư vấn rõ ràng, tôi hài lòng với trải nghiệm. [Demo]',NULL),('ba2903fa-fb6e-491c-aea5-27cef6f9e23b','fcbf9a36-8c04-4813-833d-644a44e9ff8f','06a2904c-f6b3-42cd-8a2a-a021ed28e590',NULL,'Tư vấn rõ ràng, tôi hài lòng với trải nghiệm. [Demo]',NULL),('bc668d34-f585-4cd3-8a31-806a18ff0306','869af04a-19ab-4d93-8cf8-9f7b1cdbfeb8','7cfa0ecf-27a1-4e92-a2d8-188b296f8785',NULL,NULL,4),('c5bfd55e-1e1d-40a0-80ec-71c1f8ec19d2','d9ba936c-2dc9-4084-b00f-bb1cc7393fef','8c2ef8b4-58b4-4098-9ed2-05b86ca27cbb','3c6b9c41-fcf4-4fc2-9c79-d241a5c9397e',NULL,NULL),('c836709f-2d8b-4670-8aba-b3cffc29218f','fcbf9a36-8c04-4813-833d-644a44e9ff8f','93d8881a-8375-4b39-8f98-8d946c35aaef','1b6e91d2-81d9-46bc-b569-9a084c3da6c9',NULL,NULL),('caae3b20-8dbb-47e3-8902-81c2e9b466f5','c752d7c9-a399-496a-983b-85dfc2b21d08','93d8881a-8375-4b39-8f98-8d946c35aaef','1b6e91d2-81d9-46bc-b569-9a084c3da6c9',NULL,NULL),('cbc5b0d9-394a-48d3-8a8e-c013511ac0c4','fcbf9a36-8c04-4813-833d-644a44e9ff8f','c1fd25b1-dde0-4a76-8429-ad9a771aafa8','863fd0ec-3889-4e48-ae19-bafe14363b6f',NULL,NULL),('ce586531-9540-4486-962d-1c243aa02ffc','ed108542-e78b-4dfe-ae0a-12bbf4f6420f','c1fd25b1-dde0-4a76-8429-ad9a771aafa8','acdaec5e-2af5-448a-888a-0f4a402ff76b',NULL,NULL),('ceb4d106-c0b4-4cb0-973c-3e647e6e61b0','b4e5f36c-d7f5-41f6-8686-40455f2a3907','e3f22e7a-4774-4b7e-a58d-8ea639a1b0bd',NULL,'Tư vấn rõ ràng, tôi hài lòng với trải nghiệm. [Demo]',NULL),('d741d21e-9a42-43b7-ac2f-514500dbe8bd','ed108542-e78b-4dfe-ae0a-12bbf4f6420f','93d8881a-8375-4b39-8f98-8d946c35aaef','91c195ce-a627-4161-b99d-1f652da27794',NULL,NULL),('d8917523-b8a0-4700-8051-a3bb7203713d','b4e5f36c-d7f5-41f6-8686-40455f2a3907','7cfa0ecf-27a1-4e92-a2d8-188b296f8785',NULL,NULL,3),('d915351a-7357-48f6-b35b-eec2308e1fd1','a6046525-bfac-412a-8f50-342f93ff6b5a','3ea2764a-b4fd-479c-bea1-b57fa6f76af3',NULL,NULL,3),('dbc9e5e3-ec72-4baf-ae7a-befd71d4e0f0','117233b0-2a51-4096-9c03-b122f77df828','8c2ef8b4-58b4-4098-9ed2-05b86ca27cbb','72b405dd-5866-400e-aad0-61a4b6869a77',NULL,NULL),('e64e3c68-71d6-4763-8cf0-f2605daa9b28','c752d7c9-a399-496a-983b-85dfc2b21d08','c1fd25b1-dde0-4a76-8429-ad9a771aafa8','863fd0ec-3889-4e48-ae19-bafe14363b6f',NULL,NULL),('e671af63-e88f-4198-8f9d-11da8ca66c38','ed108542-e78b-4dfe-ae0a-12bbf4f6420f','42c50463-4a6a-4540-bb56-40155b4a6755','e1f8dfcd-190f-4c17-ae0a-b7a5702e637f',NULL,NULL),('ed8908e4-c48d-429d-a5c3-a04934bcc614','a6046525-bfac-412a-8f50-342f93ff6b5a','e7866f1c-30ec-46bf-a64a-c9dc5f0357bf',NULL,'Tư vấn rõ ràng, tôi hài lòng với trải nghiệm. [Demo]',NULL),('f4c4b686-59bb-4946-bded-ae022a559769','6f6ebc02-0df9-4561-9079-8aec6badba7c','e3f22e7a-4774-4b7e-a58d-8ea639a1b0bd',NULL,'Sẽ giới thiệu cửa hàng đến bạn bè. [Demo]',NULL),('f7b75b28-3c60-499f-90cf-4d90b39d2da4','dabf991c-18ab-46ed-8b92-81f1c5967d7e','e3f22e7a-4774-4b7e-a58d-8ea639a1b0bd',NULL,'Tư vấn rõ ràng, tôi hài lòng với trải nghiệm. [Demo]',NULL),('fd65a38a-308a-4fca-b92e-c94faa0adbeb','642cd5c7-33a2-411b-9a8e-d05df2e7bd66','0bc26a3c-7e19-4655-855f-2d07ee4f15c4',NULL,'Tôi mong tiếp tục nhận được hỗ trợ tận tình.',NULL);
/*!40000 ALTER TABLE `response_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `survey_lifecycle_history`
--

DROP TABLE IF EXISTS `survey_lifecycle_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `survey_lifecycle_history` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `survey_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actor_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_due_date` date DEFAULT NULL,
  `new_due_date` date DEFAULT NULL,
  `old_status` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `new_status` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `actor_id` (`actor_id`),
  KEY `idx_survey_history` (`survey_id`,`created_at`),
  CONSTRAINT `survey_lifecycle_history_ibfk_1` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`),
  CONSTRAINT `survey_lifecycle_history_ibfk_2` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `survey_lifecycle_history`
--

LOCK TABLES `survey_lifecycle_history` WRITE;
/*!40000 ALTER TABLE `survey_lifecycle_history` DISABLE KEYS */;
INSERT INTO `survey_lifecycle_history` VALUES ('1640f9a9-047e-4dc8-92e6-136c9d01163e','7c9c2722-853e-4580-8788-486e85a9452a','3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','EXTEND','2026-11-14','2026-11-26','OPEN','OPEN','2026-11-11 06:07:34'),('578a76a2-1a6b-4f56-bdec-147d98441c05','a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','CLOSE','2026-11-05','2026-11-05','OPEN','CLOSED','2026-11-10 06:07:34'),('9eb5faa8-a14c-4516-b788-950cc304a35e','15a6382c-d76d-4d7b-bc5c-f35bea576bc4','3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','CLOSE','2026-11-09','2026-11-09','OPEN','CLOSED','2026-11-09 06:07:34'),('c42f484e-520f-4d26-b874-0ce57f43eec2','3e63eeda-7bb2-4e96-8ed3-5508d5a993ad','3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','CLOSE','2026-11-10','2026-11-10','OPEN','CLOSED','2026-11-10 06:07:34'),('c7bb6394-0d1a-4174-9ef1-b574ae4e0d7b','15a6382c-d76d-4d7b-bc5c-f35bea576bc4','3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','REOPEN','2026-11-09','2026-11-22','CLOSED','OPEN','2026-11-11 06:07:34');
/*!40000 ALTER TABLE `survey_lifecycle_history` ENABLE KEYS */;
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
INSERT INTO `survey_questions` VALUES ('06a2904c-f6b3-42cd-8a2a-a021ed28e590','4ca6d4cd-4d90-474d-9d09-f14f7fa72075','Bạn quan tâm đến dòng máy hoặc cấu hình cụ thể nào?','TEXT',0,4),('0bc26a3c-7e19-4655-855f-2d07ee4f15c4','7c9c2722-853e-4580-8788-486e85a9452a','Bạn góp ý gì để chúng tôi phục vụ tốt hơn?','TEXT',1,1),('11c7b9f6-eba9-4f67-967e-1a9638a6d616','3e63eeda-7bb2-4e96-8ed3-5508d5a993ad','Bạn muốn nhận thông tin qua kênh nào?','ONE',1,1),('2f472773-a9a9-421b-ac32-b683d8e9d7cd','e3f5c15d-9557-4e16-aea5-270af30c5c03','Nhân viên tư vấn có nhiệt tình và hiểu sản phẩm không?','ONE',1,3),('3ea2764a-b4fd-479c-bea1-b57fa6f76af3','424af115-bf2f-479a-86e8-5444b80890e8','Bạn đánh giá trải nghiệm đặt hàng bao nhiêu sao?','RATING',1,1),('40e40697-81f5-4954-b111-eac866d1f35e','e3f5c15d-9557-4e16-aea5-270af30c5c03','Bạn đánh giá chung về dịch vụ của cửa hàng như thế nào?','RATING',1,1),('421e5509-c5c3-4453-9772-2353553e70dc','e6acb7c6-c6de-44af-b8c3-019dbc8444af','Cửa hàng nên cải thiện điều gì?','TEXT',0,2),('42c50463-4a6a-4540-bb56-40155b4a6755','4ca6d4cd-4d90-474d-9d09-f14f7fa72075','Ngân sách dự kiến của bạn?','ONE',1,3),('506ed3b1-2ac0-4f36-8b11-ff2274306bdb','2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','Bạn góp ý gì để chúng tôi phục vụ tốt hơn?','TEXT',1,1),('6d7c2d35-e3d6-44b9-b758-03a96096f12d','c5f0e65d-24e3-4a5a-af6d-cf968d692c23','Bạn muốn chia sẻ điều gì?','TEXT',0,1),('79d1d706-5f25-4c09-9eb3-e34225a26146','15a6382c-d76d-4d7b-bc5c-f35bea576bc4','Bạn góp ý gì để chúng tôi phục vụ tốt hơn?','TEXT',1,1),('7cfa0ecf-27a1-4e92-a2d8-188b296f8785','a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','Bạn hài lòng thế nào về thời gian xử lý bảo hành?','RATING',1,1),('89448659-8e5f-4d65-af15-99f61a348e9a','af480159-a15d-466e-9b04-bc01f67816d9','Bạn muốn nhận hỗ trợ qua kênh nào?','ONE',1,1),('8c2ef8b4-58b4-4098-9ed2-05b86ca27cbb','9b8ff7f2-e0b9-489c-a546-505b64ecffc5','Bạn quan tâm trải nghiệm nào?','MULTI',1,1),('92e35ad5-d341-42f1-a203-b3cb9d3ad10e','47bdb92f-4f28-4c3a-b022-c19ebef5d793','Ý tưởng khác của bạn?','TEXT',0,2),('93d8881a-8375-4b39-8f98-8d946c35aaef','4ca6d4cd-4d90-474d-9d09-f14f7fa72075','Bạn dự định mua gì trong 6 tháng tới?','ONE',1,1),('a968ec95-12af-4b0a-921a-e6905e822358','06968483-e8d7-446b-9538-fa50117822d1','Mức độ quan tâm của bạn?','RATING',1,1),('aebce4f7-bd76-4340-ab29-ebaba69c0e1e','e6acb7c6-c6de-44af-b8c3-019dbc8444af','Bạn đánh giá buổi tư vấn thế nào?','RATING',1,1),('c1fd25b1-dde0-4a76-8429-ad9a771aafa8','4ca6d4cd-4d90-474d-9d09-f14f7fa72075','Mục đích sử dụng chính (chọn nhiều đáp án)','MULTI',1,2),('c6752765-4071-4d35-a6bc-80d79483f808','47bdb92f-4f28-4c3a-b022-c19ebef5d793','Bạn mong muốn ưu đãi nào?','MULTI',1,1),('d8909d7c-8116-4c2e-a50a-9b4b001b6835','e3f5c15d-9557-4e16-aea5-270af30c5c03','Bạn có góp ý gì thêm cho chúng tôi?','TEXT',0,4),('d9f1650d-1be7-4c8f-bc85-c2ab2c5432ae','9b8ff7f2-e0b9-489c-a546-505b64ecffc5','Góp ý thêm?','TEXT',0,2),('dbe53ea9-e76b-4e5a-a3e9-5040c21a693c','ea88cf3b-c110-42b9-a186-cadb5d97d12b','Bạn góp ý gì để chúng tôi phục vụ tốt hơn?','TEXT',1,1),('e34ed686-1b96-48c5-a0ba-2bc0a80cfc5b','af480159-a15d-466e-9b04-bc01f67816d9','Góp ý khác?','TEXT',0,2),('e3f22e7a-4774-4b7e-a58d-8ea639a1b0bd','a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','Ý kiến khác','TEXT',0,2),('e60e2e8d-6322-49d5-8709-5637e022ba6f','e3f5c15d-9557-4e16-aea5-270af30c5c03','Bạn biết đến cửa hàng qua kênh nào?','ONE',1,2),('e7866f1c-30ec-46bf-a64a-c9dc5f0357bf','424af115-bf2f-479a-86e8-5444b80890e8','Góp ý về quá trình mua hàng?','TEXT',0,2),('f47e85cc-fdd0-4528-a084-127fe9b6ff6e','87c1314f-40e4-4706-9016-747b418da4d1','Góp ý dịch vụ?','TEXT',0,1);
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
INSERT INTO `survey_recipients` VALUES ('15a6382c-d76d-4d7b-bc5c-f35bea576bc4','0053880e-4182-41aa-8a44-9c1846eeeebb','2026-11-05 13:07:34'),('15a6382c-d76d-4d7b-bc5c-f35bea576bc4','07e6c92e-48bd-4788-bf45-329708cd89aa','2026-11-05 13:07:34'),('15a6382c-d76d-4d7b-bc5c-f35bea576bc4','29852a99-0f8b-48e6-8fc3-4dcfef901752','2026-11-05 13:07:34'),('15a6382c-d76d-4d7b-bc5c-f35bea576bc4','5ab5ec2a-60de-456a-a812-13625405c837','2026-11-05 13:07:34'),('15a6382c-d76d-4d7b-bc5c-f35bea576bc4','88298f34-2aed-4105-a0e4-6caa2864bbda','2026-11-05 13:07:34'),('15a6382c-d76d-4d7b-bc5c-f35bea576bc4','8e08fdee-e1a0-4544-8d7d-b46ac4d6587d','2026-11-05 13:07:34'),('15a6382c-d76d-4d7b-bc5c-f35bea576bc4','95974d30-040c-4de9-be6a-607c42713cb1','2026-11-05 13:07:34'),('15a6382c-d76d-4d7b-bc5c-f35bea576bc4','a2869a3d-fefd-4d74-89e1-a5c4712f60ed','2026-11-05 13:07:34'),('15a6382c-d76d-4d7b-bc5c-f35bea576bc4','b84ae0cc-4fb3-46d8-9049-cfcc8ac11af5','2026-11-11 13:07:34'),('15a6382c-d76d-4d7b-bc5c-f35bea576bc4','cd288301-b787-450d-8585-e28a6fa4217f','2026-11-05 13:07:34'),('15a6382c-d76d-4d7b-bc5c-f35bea576bc4','d1eeef8f-c3da-4241-a7be-ab5e8f95e827','2026-11-05 13:07:34'),('15a6382c-d76d-4d7b-bc5c-f35bea576bc4','d207781f-1832-48b5-ac17-135451dd53f9','2026-11-05 13:07:34'),('15a6382c-d76d-4d7b-bc5c-f35bea576bc4','d2d02b5c-ecee-4770-92c4-9600be290e53','2026-11-05 13:07:34'),('15a6382c-d76d-4d7b-bc5c-f35bea576bc4','d3f59d4f-d2f0-4732-9edb-5c73c88f30bf','2026-11-05 13:07:34'),('15a6382c-d76d-4d7b-bc5c-f35bea576bc4','f1172762-b42e-48a2-b67c-f2cd992b98c3','2026-11-05 13:07:34'),('15a6382c-d76d-4d7b-bc5c-f35bea576bc4','f6132e59-af9c-4b19-9d83-485220a56e48','2026-11-05 13:07:34'),('15a6382c-d76d-4d7b-bc5c-f35bea576bc4','fd7a3ebc-a800-42c0-8f06-96778e72ba8e','2026-11-05 13:07:34'),('15a6382c-d76d-4d7b-bc5c-f35bea576bc4','ffa60692-a327-4fc5-89fd-7177eff64b51','2026-11-05 13:07:34'),('2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','0053880e-4182-41aa-8a44-9c1846eeeebb','2026-11-05 13:07:34'),('2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','07e6c92e-48bd-4788-bf45-329708cd89aa','2026-11-05 13:07:34'),('2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','29852a99-0f8b-48e6-8fc3-4dcfef901752','2026-11-05 13:07:34'),('2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','5ab5ec2a-60de-456a-a812-13625405c837','2026-11-05 13:07:34'),('2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','88298f34-2aed-4105-a0e4-6caa2864bbda','2026-11-05 13:07:34'),('2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','8e08fdee-e1a0-4544-8d7d-b46ac4d6587d','2026-11-05 13:07:34'),('2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','95974d30-040c-4de9-be6a-607c42713cb1','2026-11-05 13:07:34'),('2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','a2869a3d-fefd-4d74-89e1-a5c4712f60ed','2026-11-05 13:07:34'),('2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','b84ae0cc-4fb3-46d8-9049-cfcc8ac11af5','2026-11-11 13:07:34'),('2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','cd288301-b787-450d-8585-e28a6fa4217f','2026-11-05 13:07:34'),('2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','d1eeef8f-c3da-4241-a7be-ab5e8f95e827','2026-11-05 13:07:34'),('2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','d207781f-1832-48b5-ac17-135451dd53f9','2026-11-05 13:07:34'),('2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','d2d02b5c-ecee-4770-92c4-9600be290e53','2026-11-05 13:07:34'),('2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','d3f59d4f-d2f0-4732-9edb-5c73c88f30bf','2026-11-05 13:07:34'),('2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','f1172762-b42e-48a2-b67c-f2cd992b98c3','2026-11-05 13:07:34'),('2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','f6132e59-af9c-4b19-9d83-485220a56e48','2026-11-05 13:07:34'),('2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','fd7a3ebc-a800-42c0-8f06-96778e72ba8e','2026-11-05 13:07:34'),('2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','ffa60692-a327-4fc5-89fd-7177eff64b51','2026-11-05 13:07:34'),('3e63eeda-7bb2-4e96-8ed3-5508d5a993ad','0053880e-4182-41aa-8a44-9c1846eeeebb','2026-11-03 13:07:34'),('3e63eeda-7bb2-4e96-8ed3-5508d5a993ad','29852a99-0f8b-48e6-8fc3-4dcfef901752','2026-11-03 13:07:34'),('3e63eeda-7bb2-4e96-8ed3-5508d5a993ad','95974d30-040c-4de9-be6a-607c42713cb1','2026-11-03 13:07:34'),('424af115-bf2f-479a-86e8-5444b80890e8','0053880e-4182-41aa-8a44-9c1846eeeebb','2026-10-09 13:07:34'),('424af115-bf2f-479a-86e8-5444b80890e8','07e6c92e-48bd-4788-bf45-329708cd89aa','2026-10-09 13:07:34'),('424af115-bf2f-479a-86e8-5444b80890e8','29852a99-0f8b-48e6-8fc3-4dcfef901752','2026-10-09 13:07:34'),('424af115-bf2f-479a-86e8-5444b80890e8','5ab5ec2a-60de-456a-a812-13625405c837','2026-10-09 13:07:34'),('424af115-bf2f-479a-86e8-5444b80890e8','88298f34-2aed-4105-a0e4-6caa2864bbda','2026-10-09 13:07:34'),('424af115-bf2f-479a-86e8-5444b80890e8','8e08fdee-e1a0-4544-8d7d-b46ac4d6587d','2026-10-09 13:07:34'),('424af115-bf2f-479a-86e8-5444b80890e8','95974d30-040c-4de9-be6a-607c42713cb1','2026-10-09 13:07:34'),('424af115-bf2f-479a-86e8-5444b80890e8','a2869a3d-fefd-4d74-89e1-a5c4712f60ed','2026-10-09 13:07:34'),('424af115-bf2f-479a-86e8-5444b80890e8','cd288301-b787-450d-8585-e28a6fa4217f','2026-10-09 13:07:34'),('424af115-bf2f-479a-86e8-5444b80890e8','d1eeef8f-c3da-4241-a7be-ab5e8f95e827','2026-10-09 13:07:34'),('424af115-bf2f-479a-86e8-5444b80890e8','d207781f-1832-48b5-ac17-135451dd53f9','2026-10-09 13:07:34'),('424af115-bf2f-479a-86e8-5444b80890e8','d2d02b5c-ecee-4770-92c4-9600be290e53','2026-10-09 13:07:34'),('424af115-bf2f-479a-86e8-5444b80890e8','d3f59d4f-d2f0-4732-9edb-5c73c88f30bf','2026-10-09 13:07:34'),('424af115-bf2f-479a-86e8-5444b80890e8','f1172762-b42e-48a2-b67c-f2cd992b98c3','2026-10-09 13:07:34'),('424af115-bf2f-479a-86e8-5444b80890e8','f6132e59-af9c-4b19-9d83-485220a56e48','2026-10-09 13:07:34'),('424af115-bf2f-479a-86e8-5444b80890e8','fd7a3ebc-a800-42c0-8f06-96778e72ba8e','2026-10-09 13:07:34'),('424af115-bf2f-479a-86e8-5444b80890e8','ffa60692-a327-4fc5-89fd-7177eff64b51','2026-10-09 13:07:34'),('4ca6d4cd-4d90-474d-9d09-f14f7fa72075','0053880e-4182-41aa-8a44-9c1846eeeebb','2026-10-04 13:07:34'),('4ca6d4cd-4d90-474d-9d09-f14f7fa72075','07e6c92e-48bd-4788-bf45-329708cd89aa','2026-10-04 13:07:34'),('4ca6d4cd-4d90-474d-9d09-f14f7fa72075','29852a99-0f8b-48e6-8fc3-4dcfef901752','2026-10-04 13:07:34'),('4ca6d4cd-4d90-474d-9d09-f14f7fa72075','5ab5ec2a-60de-456a-a812-13625405c837','2026-10-04 13:07:34'),('4ca6d4cd-4d90-474d-9d09-f14f7fa72075','88298f34-2aed-4105-a0e4-6caa2864bbda','2026-10-04 13:07:34'),('4ca6d4cd-4d90-474d-9d09-f14f7fa72075','8e08fdee-e1a0-4544-8d7d-b46ac4d6587d','2026-10-04 13:07:34'),('4ca6d4cd-4d90-474d-9d09-f14f7fa72075','95974d30-040c-4de9-be6a-607c42713cb1','2026-10-04 13:07:34'),('4ca6d4cd-4d90-474d-9d09-f14f7fa72075','a2869a3d-fefd-4d74-89e1-a5c4712f60ed','2026-10-04 13:07:34'),('4ca6d4cd-4d90-474d-9d09-f14f7fa72075','b84ae0cc-4fb3-46d8-9049-cfcc8ac11af5','2026-11-11 13:07:34'),('4ca6d4cd-4d90-474d-9d09-f14f7fa72075','cd288301-b787-450d-8585-e28a6fa4217f','2026-10-04 13:07:34'),('4ca6d4cd-4d90-474d-9d09-f14f7fa72075','d1eeef8f-c3da-4241-a7be-ab5e8f95e827','2026-10-04 13:07:34'),('4ca6d4cd-4d90-474d-9d09-f14f7fa72075','d207781f-1832-48b5-ac17-135451dd53f9','2026-10-04 13:07:34'),('4ca6d4cd-4d90-474d-9d09-f14f7fa72075','d2d02b5c-ecee-4770-92c4-9600be290e53','2026-10-04 13:07:34'),('4ca6d4cd-4d90-474d-9d09-f14f7fa72075','d3f59d4f-d2f0-4732-9edb-5c73c88f30bf','2026-10-04 13:07:34'),('4ca6d4cd-4d90-474d-9d09-f14f7fa72075','f1172762-b42e-48a2-b67c-f2cd992b98c3','2026-10-04 13:07:34'),('4ca6d4cd-4d90-474d-9d09-f14f7fa72075','f6132e59-af9c-4b19-9d83-485220a56e48','2026-10-04 13:07:34'),('4ca6d4cd-4d90-474d-9d09-f14f7fa72075','fd7a3ebc-a800-42c0-8f06-96778e72ba8e','2026-10-04 13:07:34'),('4ca6d4cd-4d90-474d-9d09-f14f7fa72075','ffa60692-a327-4fc5-89fd-7177eff64b51','2026-10-04 13:07:34'),('7c9c2722-853e-4580-8788-486e85a9452a','0053880e-4182-41aa-8a44-9c1846eeeebb','2026-11-05 13:07:34'),('7c9c2722-853e-4580-8788-486e85a9452a','29852a99-0f8b-48e6-8fc3-4dcfef901752','2026-11-05 13:07:34'),('7c9c2722-853e-4580-8788-486e85a9452a','8e08fdee-e1a0-4544-8d7d-b46ac4d6587d','2026-11-05 13:07:34'),('7c9c2722-853e-4580-8788-486e85a9452a','95974d30-040c-4de9-be6a-607c42713cb1','2026-11-05 13:07:34'),('7c9c2722-853e-4580-8788-486e85a9452a','d207781f-1832-48b5-ac17-135451dd53f9','2026-11-05 13:07:34'),('7c9c2722-853e-4580-8788-486e85a9452a','d3f59d4f-d2f0-4732-9edb-5c73c88f30bf','2026-11-05 13:07:34'),('7c9c2722-853e-4580-8788-486e85a9452a','f6132e59-af9c-4b19-9d83-485220a56e48','2026-11-05 13:07:34'),('7c9c2722-853e-4580-8788-486e85a9452a','ffa60692-a327-4fc5-89fd-7177eff64b51','2026-11-05 13:07:34'),('87c1314f-40e4-4706-9016-747b418da4d1','a2869a3d-fefd-4d74-89e1-a5c4712f60ed','2026-11-12 13:07:34'),('87c1314f-40e4-4706-9016-747b418da4d1','d1eeef8f-c3da-4241-a7be-ab5e8f95e827','2026-11-12 13:07:34'),('87c1314f-40e4-4706-9016-747b418da4d1','d2d02b5c-ecee-4770-92c4-9600be290e53','2026-11-12 13:07:34'),('87c1314f-40e4-4706-9016-747b418da4d1','f1172762-b42e-48a2-b67c-f2cd992b98c3','2026-11-12 13:07:34'),('9b8ff7f2-e0b9-489c-a546-505b64ecffc5','0053880e-4182-41aa-8a44-9c1846eeeebb','2026-11-12 13:07:34'),('9b8ff7f2-e0b9-489c-a546-505b64ecffc5','29852a99-0f8b-48e6-8fc3-4dcfef901752','2026-11-12 13:07:34'),('9b8ff7f2-e0b9-489c-a546-505b64ecffc5','8e08fdee-e1a0-4544-8d7d-b46ac4d6587d','2026-11-12 13:07:34'),('9b8ff7f2-e0b9-489c-a546-505b64ecffc5','95974d30-040c-4de9-be6a-607c42713cb1','2026-11-12 13:07:34'),('9b8ff7f2-e0b9-489c-a546-505b64ecffc5','d207781f-1832-48b5-ac17-135451dd53f9','2026-11-12 13:07:34'),('9b8ff7f2-e0b9-489c-a546-505b64ecffc5','d3f59d4f-d2f0-4732-9edb-5c73c88f30bf','2026-11-12 13:07:34'),('9b8ff7f2-e0b9-489c-a546-505b64ecffc5','f6132e59-af9c-4b19-9d83-485220a56e48','2026-11-12 13:07:34'),('9b8ff7f2-e0b9-489c-a546-505b64ecffc5','ffa60692-a327-4fc5-89fd-7177eff64b51','2026-11-12 13:07:34'),('a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','0053880e-4182-41aa-8a44-9c1846eeeebb','2026-09-04 13:07:34'),('a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','07e6c92e-48bd-4788-bf45-329708cd89aa','2026-09-04 13:07:34'),('a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','29852a99-0f8b-48e6-8fc3-4dcfef901752','2026-09-04 13:07:34'),('a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','5ab5ec2a-60de-456a-a812-13625405c837','2026-09-04 13:07:34'),('a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','88298f34-2aed-4105-a0e4-6caa2864bbda','2026-09-04 13:07:34'),('a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','8e08fdee-e1a0-4544-8d7d-b46ac4d6587d','2026-09-04 13:07:34'),('a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','95974d30-040c-4de9-be6a-607c42713cb1','2026-09-04 13:07:34'),('a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','a2869a3d-fefd-4d74-89e1-a5c4712f60ed','2026-09-04 13:07:34'),('a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','cd288301-b787-450d-8585-e28a6fa4217f','2026-09-04 13:07:34'),('a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','d1eeef8f-c3da-4241-a7be-ab5e8f95e827','2026-09-04 13:07:34'),('a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','d207781f-1832-48b5-ac17-135451dd53f9','2026-09-04 13:07:34'),('a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','d2d02b5c-ecee-4770-92c4-9600be290e53','2026-09-04 13:07:34'),('a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','d3f59d4f-d2f0-4732-9edb-5c73c88f30bf','2026-09-04 13:07:34'),('a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','f1172762-b42e-48a2-b67c-f2cd992b98c3','2026-09-04 13:07:34'),('a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','f6132e59-af9c-4b19-9d83-485220a56e48','2026-09-04 13:07:34'),('a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','fd7a3ebc-a800-42c0-8f06-96778e72ba8e','2026-09-04 13:07:34'),('a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','ffa60692-a327-4fc5-89fd-7177eff64b51','2026-09-04 13:07:34'),('e3f5c15d-9557-4e16-aea5-270af30c5c03','0053880e-4182-41aa-8a44-9c1846eeeebb','2026-10-29 13:07:34'),('e3f5c15d-9557-4e16-aea5-270af30c5c03','07e6c92e-48bd-4788-bf45-329708cd89aa','2026-10-29 13:07:34'),('e3f5c15d-9557-4e16-aea5-270af30c5c03','29852a99-0f8b-48e6-8fc3-4dcfef901752','2026-10-29 13:07:34'),('e3f5c15d-9557-4e16-aea5-270af30c5c03','5ab5ec2a-60de-456a-a812-13625405c837','2026-10-29 13:07:34'),('e3f5c15d-9557-4e16-aea5-270af30c5c03','88298f34-2aed-4105-a0e4-6caa2864bbda','2026-10-29 13:07:34'),('e3f5c15d-9557-4e16-aea5-270af30c5c03','8e08fdee-e1a0-4544-8d7d-b46ac4d6587d','2026-10-29 13:07:34'),('e3f5c15d-9557-4e16-aea5-270af30c5c03','95974d30-040c-4de9-be6a-607c42713cb1','2026-10-29 13:07:34'),('e3f5c15d-9557-4e16-aea5-270af30c5c03','a2869a3d-fefd-4d74-89e1-a5c4712f60ed','2026-10-29 13:07:34'),('e3f5c15d-9557-4e16-aea5-270af30c5c03','b84ae0cc-4fb3-46d8-9049-cfcc8ac11af5','2026-11-11 13:07:34'),('e3f5c15d-9557-4e16-aea5-270af30c5c03','cd288301-b787-450d-8585-e28a6fa4217f','2026-10-29 13:07:34'),('e3f5c15d-9557-4e16-aea5-270af30c5c03','d1eeef8f-c3da-4241-a7be-ab5e8f95e827','2026-10-29 13:07:34'),('e3f5c15d-9557-4e16-aea5-270af30c5c03','d207781f-1832-48b5-ac17-135451dd53f9','2026-10-29 13:07:34'),('e3f5c15d-9557-4e16-aea5-270af30c5c03','d2d02b5c-ecee-4770-92c4-9600be290e53','2026-10-29 13:07:34'),('e3f5c15d-9557-4e16-aea5-270af30c5c03','d3f59d4f-d2f0-4732-9edb-5c73c88f30bf','2026-10-29 13:07:34'),('e3f5c15d-9557-4e16-aea5-270af30c5c03','f1172762-b42e-48a2-b67c-f2cd992b98c3','2026-10-29 13:07:34'),('e3f5c15d-9557-4e16-aea5-270af30c5c03','f6132e59-af9c-4b19-9d83-485220a56e48','2026-10-29 13:07:34'),('e3f5c15d-9557-4e16-aea5-270af30c5c03','fd7a3ebc-a800-42c0-8f06-96778e72ba8e','2026-10-29 13:07:34'),('e3f5c15d-9557-4e16-aea5-270af30c5c03','ffa60692-a327-4fc5-89fd-7177eff64b51','2026-10-29 13:07:34'),('e6acb7c6-c6de-44af-b8c3-019dbc8444af','0053880e-4182-41aa-8a44-9c1846eeeebb','2026-11-07 13:07:34'),('e6acb7c6-c6de-44af-b8c3-019dbc8444af','8e08fdee-e1a0-4544-8d7d-b46ac4d6587d','2026-11-07 13:07:34'),('e6acb7c6-c6de-44af-b8c3-019dbc8444af','ffa60692-a327-4fc5-89fd-7177eff64b51','2026-11-07 13:07:34'),('ea88cf3b-c110-42b9-a186-cadb5d97d12b','0053880e-4182-41aa-8a44-9c1846eeeebb','2026-11-05 13:07:34'),('ea88cf3b-c110-42b9-a186-cadb5d97d12b','5ab5ec2a-60de-456a-a812-13625405c837','2026-11-05 13:07:34'),('ea88cf3b-c110-42b9-a186-cadb5d97d12b','95974d30-040c-4de9-be6a-607c42713cb1','2026-11-05 13:07:34');
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
INSERT INTO `survey_responses` VALUES ('047456be-9325-4b46-b038-0b747e916cec','a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','8e08fdee-e1a0-4544-8d7d-b46ac4d6587d','2026-09-11 13:07:34'),('117233b0-2a51-4096-9c03-b122f77df828','9b8ff7f2-e0b9-489c-a546-505b64ecffc5','95974d30-040c-4de9-be6a-607c42713cb1','2026-11-12 13:07:34'),('242fd0cb-e93e-48bf-98f9-14d84c170420','4ca6d4cd-4d90-474d-9d09-f14f7fa72075','95974d30-040c-4de9-be6a-607c42713cb1','2026-10-07 13:07:34'),('38c12889-e14d-4a21-b1b0-9984d6abb545','a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','5ab5ec2a-60de-456a-a812-13625405c837','2026-09-07 13:07:34'),('4507dc72-caa2-4c0a-b17e-1a88138110fe','a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','88298f34-2aed-4105-a0e4-6caa2864bbda','2026-09-13 13:07:34'),('642cd5c7-33a2-411b-9a8e-d05df2e7bd66','7c9c2722-853e-4580-8788-486e85a9452a','0053880e-4182-41aa-8a44-9c1846eeeebb','2026-11-08 13:07:34'),('6f6ebc02-0df9-4561-9079-8aec6badba7c','a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','95974d30-040c-4de9-be6a-607c42713cb1','2026-09-08 13:07:34'),('869af04a-19ab-4d93-8cf8-9f7b1cdbfeb8','a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','29852a99-0f8b-48e6-8fc3-4dcfef901752','2026-09-10 13:07:34'),('985f26c6-3e6e-4fd7-be89-7ed609f24fc8','a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','d3f59d4f-d2f0-4732-9edb-5c73c88f30bf','2026-09-09 13:07:34'),('a6046525-bfac-412a-8f50-342f93ff6b5a','424af115-bf2f-479a-86e8-5444b80890e8','d3f59d4f-d2f0-4732-9edb-5c73c88f30bf','2026-10-13 13:07:34'),('b4e5f36c-d7f5-41f6-8686-40455f2a3907','a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','0053880e-4182-41aa-8a44-9c1846eeeebb','2026-09-06 13:07:34'),('bde309a7-a291-4abe-bd5b-450d6f6ea705','424af115-bf2f-479a-86e8-5444b80890e8','95974d30-040c-4de9-be6a-607c42713cb1','2026-10-12 13:07:34'),('c6a1c0d3-1255-4ffe-bff2-981adc89f3f9','424af115-bf2f-479a-86e8-5444b80890e8','5ab5ec2a-60de-456a-a812-13625405c837','2026-10-11 13:07:34'),('c73e41a7-bddd-48d0-a8c4-9c6fc56f3ee0','15a6382c-d76d-4d7b-bc5c-f35bea576bc4','0053880e-4182-41aa-8a44-9c1846eeeebb','2026-11-08 13:07:34'),('c752d7c9-a399-496a-983b-85dfc2b21d08','4ca6d4cd-4d90-474d-9d09-f14f7fa72075','29852a99-0f8b-48e6-8fc3-4dcfef901752','2026-10-09 13:07:34'),('d4a9866d-7233-4ed2-9e8b-58ee8c8aa934','e6acb7c6-c6de-44af-b8c3-019dbc8444af','8e08fdee-e1a0-4544-8d7d-b46ac4d6587d','2026-11-09 13:07:34'),('d9ba936c-2dc9-4084-b00f-bb1cc7393fef','9b8ff7f2-e0b9-489c-a546-505b64ecffc5','29852a99-0f8b-48e6-8fc3-4dcfef901752','2026-11-12 13:07:34'),('dabf991c-18ab-46ed-8b92-81f1c5967d7e','a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','d207781f-1832-48b5-ac17-135451dd53f9','2026-09-12 13:07:34'),('e2de4064-1f53-43a8-83c1-0713959f35d4','2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','0053880e-4182-41aa-8a44-9c1846eeeebb','2026-11-08 13:07:34'),('ed108542-e78b-4dfe-ae0a-12bbf4f6420f','4ca6d4cd-4d90-474d-9d09-f14f7fa72075','d3f59d4f-d2f0-4732-9edb-5c73c88f30bf','2026-10-08 13:07:34'),('fcbf9a36-8c04-4813-833d-644a44e9ff8f','4ca6d4cd-4d90-474d-9d09-f14f7fa72075','0053880e-4182-41aa-8a44-9c1846eeeebb','2026-10-06 13:07:34');
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
  `auto_closed_at` datetime DEFAULT NULL,
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
INSERT INTO `surveys` VALUES ('06968483-e8d7-446b-9538-fa50117822d1','[Bản nháp] Đã chọn Tất cả','Đã lưu phạm vi, có thể mở ngay từ danh sách.','2026-12-12','DRAFT',0,'{\"mode\": \"ALL\", \"filters\": {}, \"customerIds\": []}',NULL,0,NULL,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-11-10 13:07:34','2026-11-12 13:07:35'),('15a6382c-d76d-4d7b-bc5c-f35bea576bc4','[Đã mở lại] Đánh giá hỗ trợ sau mua','Đã đóng rồi mở lại; giữ bài đã gửi và bổ sung khách mới thuộc phạm vi Tất cả.','2026-11-22','OPEN',1,'{\"mode\": \"ALL\", \"filters\": {}, \"customerIds\": []}',NULL,0,NULL,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-11-04 13:07:34','2026-11-12 13:07:35'),('2d3c62e9-8d7a-415d-9059-fb8cd114a2ea','[Đóng thủ công] Góp ý dịch vụ thường xuyên','Không đặt ngày kết thúc. Quản lý chủ động Đóng ngay; có một bài đã gửi để kiểm tra không gửi lại.',NULL,'OPEN',1,'{\"mode\": \"ALL\", \"filters\": {}, \"customerIds\": []}',NULL,0,NULL,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-11-04 13:07:34','2026-11-12 13:07:35'),('3e63eeda-7bb2-4e96-8ed3-5508d5a993ad','Khảo sát chương trình chăm sóc khách hàng','Khảo sát đã đóng và chưa có câu trả lời để thử trạng thái dữ liệu rỗng.','2026-11-10','CLOSED',0,'{\"mode\": \"SELECTED\", \"filters\": {}, \"customerIds\": [\"0053880e-4182-41aa-8a44-9c1846eeeebb\", \"95974d30-040c-4de9-be6a-607c42713cb1\", \"29852a99-0f8b-48e6-8fc3-4dcfef901752\"]}',NULL,0,NULL,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-11-02 13:07:34','2026-11-12 13:07:35'),('424af115-bf2f-479a-86e8-5444b80890e8','Đánh giá trải nghiệm mua hàng tháng trước','Khảo sát đã hết hạn, dùng để xem mục quá hạn chưa trả lời.','2026-11-11','CLOSED',0,'{\"mode\": \"ALL\", \"filters\": {}, \"customerIds\": []}','2026-11-11 17:00:00',0,NULL,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-10-08 13:07:34','2026-11-12 13:07:35'),('47bdb92f-4f28-4c3a-b022-c19ebef5d793','Khảo sát ý tưởng ưu đãi thành viên','Bản nháp để thử chỉnh sửa toàn bộ câu hỏi trước khi gửi.',NULL,'DRAFT',0,'{\"mode\": \"FILTER\", \"filters\": {\"maxAge\": 20, \"minAge\": 15, \"interests\": [\"gaming\", \"design\"]}, \"customerIds\": []}',NULL,0,NULL,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-11-10 13:07:34','2026-11-12 13:07:35'),('4ca6d4cd-4d90-474d-9d09-f14f7fa72075','Nhu cầu mua sắm PC và laptop','Cho chúng tôi biết dự định của bạn để gợi ý sản phẩm và ưu đãi phù hợp.','2026-12-27','OPEN',1,'{\"mode\": \"ALL\", \"filters\": {}, \"customerIds\": []}',NULL,0,NULL,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-10-03 13:07:34','2026-11-12 13:07:35'),('7c9c2722-853e-4580-8788-486e85a9452a','[Đã gia hạn] Góp ý nhóm Gaming và Đồ họa','Hạn đã được kéo dài; danh sách người nhận theo bộ lọc vẫn giữ nguyên.','2026-11-26','OPEN',0,'{\"mode\": \"FILTER\", \"filters\": {\"maxAge\": 20, \"minAge\": 15, \"interests\": [\"gaming\", \"design\"]}, \"customerIds\": []}',NULL,0,NULL,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-11-04 13:07:34','2026-11-12 13:07:35'),('87c1314f-40e4-4706-9016-747b418da4d1','Khảo sát khách hàng 25–45 tuổi','Phiếu mới có phạm vi từ lúc tạo, chỉ gửi người đủ 25 đến hết 45 tuổi.','2026-11-27','OPEN',0,'{\"mode\": \"FILTER\", \"filters\": {\"maxAge\": 45, \"minAge\": 25}, \"customerIds\": []}',NULL,0,NULL,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-11-11 13:07:34','2026-11-12 13:07:35'),('9b8ff7f2-e0b9-489c-a546-505b64ecffc5','Khảo sát Gaming/Đồ họa 15–20 tuổi','Chỉ người đủ 15 đến hết 20 tuổi và có Gaming hoặc Đồ họa được nhận.','2026-12-02','OPEN',0,'{\"mode\": \"FILTER\", \"filters\": {\"maxAge\": 20, \"minAge\": 15, \"interests\": [\"gaming\", \"design\"]}, \"customerIds\": []}',NULL,0,NULL,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-11-11 13:07:34','2026-11-12 13:07:35'),('a2623fb7-0fb7-4aa0-a89e-f86e47c76c78','Trải nghiệm bảo hành và hỗ trợ','Đánh giá về quá trình bảo hành, sửa chữa tại cửa hàng.','2026-11-05','CLOSED',0,'{\"mode\": \"ALL\", \"filters\": {}, \"customerIds\": []}',NULL,1,'2026-11-11 13:07:34','3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-09-03 13:07:34','2026-11-12 13:07:35'),('af480159-a15d-466e-9b04-bc01f67816d9','[Bản nháp] Đã chọn từng khách','Mở lại form sẽ giữ đúng ba người đã chọn.','2026-11-26','DRAFT',0,'{\"mode\": \"SELECTED\", \"filters\": {}, \"customerIds\": [\"95974d30-040c-4de9-be6a-607c42713cb1\", \"29852a99-0f8b-48e6-8fc3-4dcfef901752\", \"ffa60692-a327-4fc5-89fd-7177eff64b51\"]}',NULL,0,NULL,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-11-10 13:07:34','2026-11-12 13:07:35'),('c5f0e65d-24e3-4a5a-af6d-cf968d692c23','[Bản nháp] Chưa thiết lập phạm vi','Thử nút mở bị chặn cho đến khi chọn phạm vi.',NULL,'DRAFT',0,NULL,NULL,0,NULL,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-11-11 13:07:34','2026-11-12 13:07:35'),('e3f5c15d-9557-4e16-aea5-270af30c5c03','Mức độ hài lòng về dịch vụ','Giúp chúng tôi cải thiện chất lượng tư vấn và chăm sóc khách hàng.','2026-12-12','OPEN',1,'{\"mode\": \"ALL\", \"filters\": {}, \"customerIds\": []}',NULL,0,NULL,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-10-28 13:07:34','2026-11-12 13:07:35'),('e6acb7c6-c6de-44af-b8c3-019dbc8444af','Khảo sát khách được chọn riêng','Chỉ ba khách đã chọn, không tự gửi khách mới hoặc khách khác.','2026-12-03','OPEN',0,'{\"mode\": \"SELECTED\", \"filters\": {}, \"customerIds\": [\"0053880e-4182-41aa-8a44-9c1846eeeebb\", \"8e08fdee-e1a0-4544-8d7d-b46ac4d6587d\", \"ffa60692-a327-4fc5-89fd-7177eff64b51\"]}',NULL,0,NULL,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-11-06 13:07:34','2026-11-12 13:07:35'),('ea88cf3b-c110-42b9-a186-cadb5d97d12b','[Hết hạn hôm nay] Xác nhận nhu cầu hỗ trợ','Được trả lời đến hết hôm nay theo giờ Việt Nam; tự đóng từ 00:00 ngày mai.','2026-11-12','OPEN',0,'{\"mode\": \"SELECTED\", \"filters\": {}, \"customerIds\": [\"0053880e-4182-41aa-8a44-9c1846eeeebb\", \"5ab5ec2a-60de-456a-a812-13625405c837\", \"95974d30-040c-4de9-be6a-607c42713cb1\"]}',NULL,0,NULL,'3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','2026-11-04 13:07:34','2026-11-12 13:07:35');
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
  `email` varchar(254) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `auth_version` int NOT NULL DEFAULT '0',
  `role` enum('ADMIN','MANAGER','CUSTOMER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CUSTOMER',
  `account_status` enum('ACTIVE','LOCKED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `full_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `erased_at` datetime DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `birth_year` smallint DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('','Nam','Nữ','Khác') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `need` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Chưa xác định',
  `need_confirmed` tinyint(1) NOT NULL DEFAULT '0',
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
INSERT INTO `users` VALUES ('0053880e-4182-41aa-8a44-9c1846eeeebb','khach@demo.vn','$2b$12$a3hb9V.meM1O8msH1.2mb.LrvUOVQfZKcSOT8HvS8GKPuTcmVp9Me',0,'CUSTOMER','ACTIVE','Nguyễn Minh Anh (Demo)','0901234567',NULL,'Địa chỉ giả lập 1, khu dân cư Demo, TP.HCM',2008,'2008-11-12','Nữ','Gaming',1,'2026-05-26 13:07:34','2026-11-12 13:07:35'),('07e6c92e-48bd-4788-bf45-329708cd89aa','khach16@demo.vn','$2b$12$a3hb9V.meM1O8msH1.2mb.LrvUOVQfZKcSOT8HvS8GKPuTcmVp9Me',0,'CUSTOMER','ACTIVE','Trần Minh Châu (Demo)','0910000016',NULL,'Địa chỉ giả lập 16, khu dân cư Demo, TP.HCM',1974,'1974-11-12','Nữ','Gaming',1,'2026-08-24 13:07:34','2026-11-12 13:07:35'),('29852a99-0f8b-48e6-8fc3-4dcfef901752','khach5@demo.vn','$2b$12$a3hb9V.meM1O8msH1.2mb.LrvUOVQfZKcSOT8HvS8GKPuTcmVp9Me',0,'CUSTOMER','ACTIVE','Võ Ngọc Lan (Demo)','0910000005',NULL,'Địa chỉ giả lập 5, khu dân cư Demo, TP.HCM',2009,'2009-11-12','Nam','Đồ họa',1,'2026-06-19 13:07:34','2026-11-12 13:07:35'),('2f480dec-95c2-4060-8b93-b82e7ae14abd','manager2@demo.vn','$2b$12$p4ZBsQqNseqPtcH0o6vij.REjsLIVbUE//.d0OyS4Rqrq9gwvmt9W',0,'MANAGER','ACTIVE','Quản lý hỗ trợ Demo','0900000002',NULL,'Văn phòng demo',1990,'1990-01-15','Khác','Chưa xác định',0,'2026-04-26 13:07:34','2026-11-12 13:07:35'),('3d35aaf7-33fa-4bc9-aa1d-2400e8750f1a','manager@demo.vn','$2b$12$p4ZBsQqNseqPtcH0o6vij.REjsLIVbUE//.d0OyS4Rqrq9gwvmt9W',0,'MANAGER','ACTIVE','Quản lý Demo','0900000001',NULL,'Văn phòng demo',1990,'1990-01-15','Khác','Chưa xác định',0,'2026-04-26 13:07:34','2026-11-12 13:07:35'),('5ab5ec2a-60de-456a-a812-13625405c837','khach2@demo.vn','$2b$12$a3hb9V.meM1O8msH1.2mb.LrvUOVQfZKcSOT8HvS8GKPuTcmVp9Me',0,'CUSTOMER','ACTIVE','Trần Hoàng Nam (Demo)','0910000002',NULL,'Địa chỉ giả lập 2, khu dân cư Demo, TP.HCM',2011,'2011-11-13','Nam','Đồ họa',1,'2026-06-01 13:07:34','2026-11-12 13:07:35'),('88298f34-2aed-4105-a0e4-6caa2864bbda','khach8@demo.vn','$2b$12$a3hb9V.meM1O8msH1.2mb.LrvUOVQfZKcSOT8HvS8GKPuTcmVp9Me',0,'CUSTOMER','ACTIVE','Đỗ Đức Minh (Demo)','0910000008',NULL,'Địa chỉ giả lập 8, khu dân cư Demo, TP.HCM',2005,'2005-11-12','Nam','Đồ họa',1,'2026-07-07 13:07:34','2026-11-12 13:07:35'),('8e08fdee-e1a0-4544-8d7d-b46ac4d6587d','khach6@demo.vn','$2b$12$a3hb9V.meM1O8msH1.2mb.LrvUOVQfZKcSOT8HvS8GKPuTcmVp9Me',0,'CUSTOMER','ACTIVE','Đặng Quốc Bảo (Demo)','0910000006',NULL,'Địa chỉ giả lập 6, khu dân cư Demo, TP.HCM',2006,'2006-11-12','Khác','Văn phòng',1,'2026-06-25 13:07:34','2026-11-12 13:07:35'),('95974d30-040c-4de9-be6a-607c42713cb1','khach3@demo.vn','$2b$12$a3hb9V.meM1O8msH1.2mb.LrvUOVQfZKcSOT8HvS8GKPuTcmVp9Me',0,'CUSTOMER','ACTIVE','Lê Thu Hà (Demo)','0910000003',NULL,'Địa chỉ giả lập 3, khu dân cư Demo, TP.HCM',2011,'2011-11-12','Khác','Văn phòng',1,'2026-06-07 13:07:34','2026-11-12 13:07:35'),('a2869a3d-fefd-4d74-89e1-a5c4712f60ed','khach15@demo.vn','$2b$12$a3hb9V.meM1O8msH1.2mb.LrvUOVQfZKcSOT8HvS8GKPuTcmVp9Me',0,'CUSTOMER','ACTIVE','Nguyễn Hải Đăng (Demo)','0910000015',NULL,'Địa chỉ giả lập 15, khu dân cư Demo, TP.HCM',1981,'1981-11-12','Khác','Văn phòng',1,'2026-08-18 13:07:34','2026-11-12 13:07:35'),('b84ae0cc-4fb3-46d8-9049-cfcc8ac11af5','khach18@demo.vn','$2b$12$a3hb9V.meM1O8msH1.2mb.LrvUOVQfZKcSOT8HvS8GKPuTcmVp9Me',0,'CUSTOMER','ACTIVE','Lâm Gia Bảo (Demo)','0910000018',NULL,'Địa chỉ giả lập 18, khu dân cư Demo, TP.HCM',2002,'2002-11-12','Khác','Văn phòng',1,'2026-11-11 13:07:34','2026-11-12 13:07:35'),('cd288301-b787-450d-8585-e28a6fa4217f','khach13@demo.vn','$2b$12$a3hb9V.meM1O8msH1.2mb.LrvUOVQfZKcSOT8HvS8GKPuTcmVp9Me',0,'CUSTOMER','ACTIVE','Phan Nhật Huy (Demo)','0910000013',NULL,'Địa chỉ giả lập 13, khu dân cư Demo, TP.HCM',2010,'2010-11-12','Nữ','Gaming',1,'2026-08-06 13:07:34','2026-11-12 13:07:35'),('d1eeef8f-c3da-4241-a7be-ab5e8f95e827','khach9@demo.vn','$2b$12$a3hb9V.meM1O8msH1.2mb.LrvUOVQfZKcSOT8HvS8GKPuTcmVp9Me',0,'CUSTOMER','ACTIVE','Hồ Bảo Ngọc (Demo)','0910000009',NULL,'Địa chỉ giả lập 9, khu dân cư Demo, TP.HCM',2001,'2001-11-12','Khác','Văn phòng',1,'2026-07-13 13:07:34','2026-11-12 13:07:35'),('d207781f-1832-48b5-ac17-135451dd53f9','khach7@demo.vn','$2b$12$a3hb9V.meM1O8msH1.2mb.LrvUOVQfZKcSOT8HvS8GKPuTcmVp9Me',0,'CUSTOMER','ACTIVE','Bùi Thanh Mai (Demo)','0910000007',NULL,'Địa chỉ giả lập 7, khu dân cư Demo, TP.HCM',2005,'2005-11-13','Nữ','Gaming',1,'2026-07-01 13:07:34','2026-11-12 13:07:35'),('d2d02b5c-ecee-4770-92c4-9600be290e53','khach10@demo.vn','$2b$12$a3hb9V.meM1O8msH1.2mb.LrvUOVQfZKcSOT8HvS8GKPuTcmVp9Me',0,'CUSTOMER','ACTIVE','Ngô Tuấn Kiệt (Demo)','0910000010',NULL,'Địa chỉ giả lập 10, khu dân cư Demo, TP.HCM',1991,'1991-11-12','Nữ','Gaming',1,'2026-07-19 13:07:34','2026-11-12 13:07:35'),('d3f59d4f-d2f0-4732-9edb-5c73c88f30bf','khach4@demo.vn','$2b$12$a3hb9V.meM1O8msH1.2mb.LrvUOVQfZKcSOT8HvS8GKPuTcmVp9Me',0,'CUSTOMER','ACTIVE','Phạm Gia Huy (Demo)','0910000004',NULL,'Địa chỉ giả lập 4, khu dân cư Demo, TP.HCM',2010,'2010-11-12','Nữ','Gaming',1,'2026-06-13 13:07:34','2026-11-12 13:07:35'),('d9d47e23-c8a6-496a-bc60-228ade643634','admin@backline.vn','$2b$12$vFOUPtxk4klAUEdgqgSyGuetBj0c4NiRHx/gqbY6SeqVRIbBbipKa',0,'ADMIN','ACTIVE','Quản trị viên Demo','0900000000',NULL,'Văn phòng demo',1990,'1990-01-15','Khác','Chưa xác định',0,'2026-04-26 13:07:34','2026-11-12 13:07:35'),('f1172762-b42e-48a2-b67c-f2cd992b98c3','khach12@demo.vn','$2b$12$a3hb9V.meM1O8msH1.2mb.LrvUOVQfZKcSOT8HvS8GKPuTcmVp9Me',0,'CUSTOMER','ACTIVE','Đinh Văn An (Demo)','0910000012',NULL,'Địa chỉ giả lập 12, khu dân cư Demo, TP.HCM',1999,'1999-11-12','Khác','Văn phòng',1,'2026-07-31 13:07:34','2026-11-12 13:07:35'),('f6132e59-af9c-4b19-9d83-485220a56e48','khach11@demo.vn','$2b$12$a3hb9V.meM1O8msH1.2mb.LrvUOVQfZKcSOT8HvS8GKPuTcmVp9Me',0,'CUSTOMER','ACTIVE','Dương Thảo Vy (Demo)','0910000011',NULL,'Địa chỉ giả lập 11, khu dân cư Demo, TP.HCM',2007,'2007-11-12','Nam','Đồ họa',1,'2026-07-25 13:07:34','2026-11-12 13:07:35'),('fd7a3ebc-a800-42c0-8f06-96778e72ba8e','khach17@demo.vn','$2b$12$a3hb9V.meM1O8msH1.2mb.LrvUOVQfZKcSOT8HvS8GKPuTcmVp9Me',0,'CUSTOMER','ACTIVE','Vũ Thảo Nguyên (Demo)','0910000017',NULL,'Địa chỉ giả lập 17, khu dân cư Demo, TP.HCM',2004,'2004-11-12','Nam','Đồ họa',1,'2026-08-30 13:07:34','2026-11-12 13:07:35'),('ffa60692-a327-4fc5-89fd-7177eff64b51','khach14@demo.vn','$2b$12$a3hb9V.meM1O8msH1.2mb.LrvUOVQfZKcSOT8HvS8GKPuTcmVp9Me',0,'CUSTOMER','ACTIVE','Trịnh Ngọc Ánh (Demo)','0910000014',NULL,'Địa chỉ giả lập 14, khu dân cư Demo, TP.HCM',2007,'2007-11-12','Nam','Đồ họa',1,'2026-08-12 13:07:34','2026-11-12 13:07:35');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'backline_crm_demo_v3_20261112060733_436de4'
--

--
-- Dumping routines for database 'backline_crm_demo_v3_20261112060733_436de4'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-12 13:07:35

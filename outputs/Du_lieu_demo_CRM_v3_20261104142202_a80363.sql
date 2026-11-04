-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: backline_crm_demo_v3_20261104142202_a80363
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
INSERT INTO `customer_interests` VALUES ('0ad1b5d1-4827-4416-8d16-2cb225ebafed','design'),('337895bf-6771-4963-8a61-c6d478c24524','design'),('54cd8c4f-ecce-433d-bb05-d6c70e5a744d','design'),('5722d865-fd7e-46ad-841f-da92b247f326','design'),('5c0b9d32-f8d3-454c-a8ba-bf9168d78801','design'),('85761216-056b-4339-abb7-e5dba68f7d37','design'),('8b29fe6c-0843-48b6-9bd5-6d981d807bb6','design'),('cdf52298-1cb1-40ea-a2d4-ce37319098c7','design'),('3eb9ed1d-1523-438d-819f-0a1496aa49ec','gaming'),('5722d865-fd7e-46ad-841f-da92b247f326','gaming'),('72afaf85-ff98-476f-9290-c2926b55bfb0','gaming'),('85761216-056b-4339-abb7-e5dba68f7d37','gaming'),('8b29fe6c-0843-48b6-9bd5-6d981d807bb6','gaming'),('cece875b-ebdd-46b0-83e0-c5c6e26ea245','gaming'),('d1b398b8-edf6-4d78-bee7-d1ce0e1ab263','gaming'),('337895bf-6771-4963-8a61-c6d478c24524','learning'),('3eb9ed1d-1523-438d-819f-0a1496aa49ec','learning'),('838a60a1-8e25-4173-89d4-8731f9e68eed','learning'),('ba39e984-58c8-40bb-b6ab-459b99a6c0c9','learning'),('be0416ba-978c-4e31-aa0b-f2fea3734ed6','learning'),('0ad1b5d1-4827-4416-8d16-2cb225ebafed','office'),('54cd8c4f-ecce-433d-bb05-d6c70e5a744d','office'),('72afaf85-ff98-476f-9290-c2926b55bfb0','office'),('838a60a1-8e25-4173-89d4-8731f9e68eed','office'),('be0416ba-978c-4e31-aa0b-f2fea3734ed6','office'),('c09a846c-ccdd-423c-8a66-9628a3b0d98a','office'),('cdf52298-1cb1-40ea-a2d4-ce37319098c7','office'),('ba39e984-58c8-40bb-b6ab-459b99a6c0c9','other'),('ca95a495-1ccd-491f-97f7-74014a6a5757','other'),('5c0b9d32-f8d3-454c-a8ba-bf9168d78801','programming'),('cece875b-ebdd-46b0-83e0-c5c6e26ea245','programming'),('d1b398b8-edf6-4d78-bee7-d1ce0e1ab263','programming');
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
INSERT INTO `demo_datasets` VALUES ('backline-demo-v3','2026-11-04 21:22:04','{\"surveys\": 16, \"accounts\": 21, \"feedback\": 54, \"products\": 14, \"customers\": 18, \"questions\": 28, \"responses\": 21, \"scenarios\": [{\"id\": \"02383079-ef25-4204-ba4e-3c7ecbb5c6f4\", \"scope\": \"ALL\", \"title\": \"Mức độ hài lòng về dịch vụ\", \"status\": \"OPEN\", \"dueDate\": \"2026-12-04\", \"endMode\": \"DATE\"}, {\"id\": \"ad02ffee-a009-4c56-8ed2-361b1df83722\", \"scope\": \"ALL\", \"title\": \"Nhu cầu mua sắm PC và laptop\", \"status\": \"OPEN\", \"dueDate\": \"2026-12-19\", \"endMode\": \"DATE\"}, {\"id\": \"c8c54e88-f3d6-4f70-96d0-f195369d49d6\", \"scope\": \"ALL\", \"title\": \"Trải nghiệm bảo hành và hỗ trợ\", \"status\": \"CLOSED\", \"dueDate\": \"2026-10-28\", \"endMode\": \"DATE\"}, {\"id\": \"eaeb8159-0055-4454-a8a4-9774de7c1180\", \"scope\": \"FILTER\", \"title\": \"Khảo sát ý tưởng ưu đãi thành viên\", \"status\": \"DRAFT\", \"dueDate\": null, \"endMode\": \"MANUAL\"}, {\"id\": \"49d7c824-2deb-482c-8780-1a6b0c6c0b04\", \"scope\": \"ALL\", \"title\": \"Đánh giá trải nghiệm mua hàng tháng trước\", \"status\": \"CLOSED\", \"dueDate\": \"2026-11-03\", \"endMode\": \"DATE\"}, {\"id\": \"20efce9b-a835-44cb-a9fb-a8d918104114\", \"scope\": \"SELECTED\", \"title\": \"Khảo sát chương trình chăm sóc khách hàng\", \"status\": \"CLOSED\", \"dueDate\": \"2026-11-02\", \"endMode\": \"DATE\"}, {\"id\": \"bf3c841b-5f14-4252-b049-b613df891d6e\", \"scope\": \"FILTER\", \"title\": \"Khảo sát Gaming/Đồ họa 15–20 tuổi\", \"status\": \"OPEN\", \"dueDate\": \"2026-11-24\", \"endMode\": \"DATE\"}, {\"id\": \"4db92246-b537-4b26-b1c5-bd213c62cdbd\", \"scope\": \"SELECTED\", \"title\": \"Khảo sát khách được chọn riêng\", \"status\": \"OPEN\", \"dueDate\": \"2026-11-25\", \"endMode\": \"DATE\"}, {\"id\": \"dde4395a-8295-46b6-b14c-341ab4dcc16d\", \"scope\": null, \"title\": \"[Bản nháp] Chưa thiết lập phạm vi\", \"status\": \"DRAFT\", \"dueDate\": null, \"endMode\": \"MANUAL\"}, {\"id\": \"17a2e5a5-5d7d-4753-8855-e79e75b5b6e2\", \"scope\": \"ALL\", \"title\": \"[Bản nháp] Đã chọn Tất cả\", \"status\": \"DRAFT\", \"dueDate\": \"2026-12-04\", \"endMode\": \"DATE\"}, {\"id\": \"2058b251-cbce-4e8c-86ac-fa9099ed6d3b\", \"scope\": \"SELECTED\", \"title\": \"[Bản nháp] Đã chọn từng khách\", \"status\": \"DRAFT\", \"dueDate\": \"2026-11-18\", \"endMode\": \"DATE\"}, {\"id\": \"1483cb1f-da71-4f33-afde-b5d8f169d170\", \"scope\": \"FILTER\", \"title\": \"Khảo sát khách hàng 25–45 tuổi\", \"status\": \"OPEN\", \"dueDate\": \"2026-11-19\", \"endMode\": \"DATE\"}, {\"id\": \"2c030ff4-691a-4dfb-8261-1529b252287f\", \"scope\": \"ALL\", \"title\": \"[Đóng thủ công] Góp ý dịch vụ thường xuyên\", \"status\": \"OPEN\", \"dueDate\": null, \"endMode\": \"MANUAL\"}, {\"id\": \"003d44dc-3fc7-40db-8a7f-eff03a925060\", \"scope\": \"SELECTED\", \"title\": \"[Hết hạn hôm nay] Xác nhận nhu cầu hỗ trợ\", \"status\": \"OPEN\", \"dueDate\": \"2026-11-04\", \"endMode\": \"DATE\"}, {\"id\": \"3bf7ab60-75b8-4bcc-b5a0-a6168e1b965a\", \"scope\": \"FILTER\", \"title\": \"[Đã gia hạn] Góp ý nhóm Gaming và Đồ họa\", \"status\": \"OPEN\", \"dueDate\": \"2026-11-18\", \"endMode\": \"DATE\"}, {\"id\": \"cec70382-5b3d-4ca8-96f1-6ef71aca0d5a\", \"scope\": \"ALL\", \"title\": \"[Đã mở lại] Đánh giá hỗ trợ sau mua\", \"status\": \"OPEN\", \"dueDate\": \"2026-11-14\", \"endMode\": \"DATE\"}], \"recipients\": 127, \"answerDetails\": 47, \"interestLinks\": 32, \"recoveryHistory\": 2, \"lifecycleHistory\": 5}');
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
INSERT INTO `feedback` VALUES ('0c735bcd-58da-457b-b872-3c5dad0c3d47','ba39e984-58c8-40bb-b6ab-459b99a6c0c9','013b7830-0769-489b-9280-03a3ed437dd9','Câu hỏi',4,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-08-24 21:22:03',0,NULL,'2026-08-22 21:22:03','2026-11-04 21:22:04'),('1819d942-61fd-4d21-968d-035a30b9a530','337895bf-6771-4963-8a61-c6d478c24524','beba3451-36ab-4b36-9c35-f5430bea5c8f','Góp ý',5,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-09-02 21:22:03',0,NULL,'2026-08-31 21:22:03','2026-11-04 21:22:04'),('18bcc088-7dd6-46cb-9b02-fe6ef1980690','8b29fe6c-0843-48b6-9bd5-6d981d807bb6','e0a8393f-3766-49c8-ae48-582edd51dd2b','Câu hỏi',1,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-08-30 21:22:03','2026-11-04 21:22:04'),('1a1b362e-df41-48c0-9541-16e5b737122a','be0416ba-978c-4e31-aa0b-f2fea3734ed6','020c90da-6b51-4e8d-b604-d34a345a8bb7','Góp ý',3,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-08-23 21:22:03','2026-11-04 21:22:04'),('1b68010e-6c79-4ce5-834f-2d161536d29b','0ad1b5d1-4827-4416-8d16-2cb225ebafed','013b7830-0769-489b-9280-03a3ed437dd9','Câu hỏi',1,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-19 21:22:03','2026-11-04 21:22:04'),('1e998135-29b5-410c-8699-9a2b1c87d700','be0416ba-978c-4e31-aa0b-f2fea3734ed6','d6474ca3-a500-4ec7-8f7a-c8693d3bea57','Báo lỗi / Khiếu nại',5,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-10 21:22:03','2026-11-04 21:22:04'),('210667b2-8567-4495-b77d-2f192b624165','0ad1b5d1-4827-4416-8d16-2cb225ebafed','4aaf949b-7f77-4b27-ab09-90e6abcb7342','Khen ngợi',4,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-01 21:22:03','2026-11-04 21:22:04'),('23959787-64a7-4f1b-9bf6-0318aca8e301','5722d865-fd7e-46ad-841f-da92b247f326','bade8b37-dbdc-466d-8bfc-148678a927a1','Báo lỗi / Khiếu nại',3,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-02 21:22:03','2026-11-04 21:22:04'),('2737f006-ca71-44b4-8857-5390a7b6dafb','3eb9ed1d-1523-438d-819f-0a1496aa49ec','e0a8393f-3766-49c8-ae48-582edd51dd2b','Khen ngợi',5,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-08-18 21:22:03',0,NULL,'2026-08-16 21:22:03','2026-11-04 21:22:04'),('31d0989b-6603-457a-a238-8e0830ed1b17','c09a846c-ccdd-423c-8a66-9628a3b0d98a','4da72165-0812-4f5a-9634-f908b730ba5b','Câu hỏi',4,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-10-01 21:22:03','2026-11-04 21:22:04'),('3c9df04f-48be-49db-8b97-86bdc8fbdae3','cdf52298-1cb1-40ea-a2d4-ce37319098c7','2eb8527c-e0fa-4bdd-b3b0-4c72848c051e','Báo lỗi / Khiếu nại',3,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-22 21:22:03','2026-11-04 21:22:04'),('430f1b0f-5d08-42a4-b248-bf910c0578a8','8b29fe6c-0843-48b6-9bd5-6d981d807bb6','4da72165-0812-4f5a-9634-f908b730ba5b','Khen ngợi',3,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-17 21:22:03','2026-11-04 21:22:04'),('4615122c-5c90-48e6-95a9-eb9faa59f756','72afaf85-ff98-476f-9290-c2926b55bfb0','a9ec1da9-2917-42ee-a6c1-fd326144af20','Khen ngợi',2,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-08-24 21:22:03','2026-11-04 21:22:04'),('46c02fe5-a370-4565-9464-d938a3b24266','ba39e984-58c8-40bb-b6ab-459b99a6c0c9','e0a8393f-3766-49c8-ae48-582edd51dd2b','Câu hỏi',3,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-09-29 21:22:03',0,NULL,'2026-09-27 21:22:03','2026-11-04 21:22:04'),('4d557d16-7600-41b2-b354-53679697775c','ba39e984-58c8-40bb-b6ab-459b99a6c0c9','66fd45cd-0eba-429c-a4b4-a20f8646b9cb','Khen ngợi',1,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-09-11 21:22:03',0,NULL,'2026-09-09 21:22:03','2026-11-04 21:22:04'),('4ee76aca-0655-4a55-afc0-0426abf8261d','8c3082bc-b34f-49aa-8591-ff5cdfd843cd','beba3451-36ab-4b36-9c35-f5430bea5c8f','Báo lỗi / Khiếu nại',1,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-14 21:22:03','2026-11-04 21:22:04'),('4f7ad124-1bae-4b24-a437-150b13a5c880','838a60a1-8e25-4173-89d4-8731f9e68eed','a9ec1da9-2917-42ee-a6c1-fd326144af20','Câu hỏi',3,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-07 21:22:03','2026-11-04 21:22:04'),('533546d0-66aa-4374-ad2f-314f08f66329','54cd8c4f-ecce-433d-bb05-d6c70e5a744d','020c90da-6b51-4e8d-b604-d34a345a8bb7','Báo lỗi / Khiếu nại',4,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-09-08 21:22:03',1,'2026-09-08 21:22:03','2026-09-06 21:22:03','2026-11-04 21:22:04'),('53d7baa2-e7f5-4687-ad6d-92d7def010d0','8b29fe6c-0843-48b6-9bd5-6d981d807bb6','66fd45cd-0eba-429c-a4b4-a20f8646b9cb','Khen ngợi',4,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-08-12 21:22:03','2026-11-04 21:22:04'),('566ca397-76f5-428d-b150-5afd63d2f099','838a60a1-8e25-4173-89d4-8731f9e68eed','4da72165-0812-4f5a-9634-f908b730ba5b','Khen ngợi',1,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-08-20 21:22:03','2026-11-04 21:22:04'),('593be58c-a95d-4f47-83cc-093bbcf22449','c09a846c-ccdd-423c-8a66-9628a3b0d98a','e0a8393f-3766-49c8-ae48-582edd51dd2b','Khen ngợi',2,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-13 21:22:03','2026-11-04 21:22:04'),('5e5b451f-88d1-4b16-a2d3-8efeb45b6dd7','ca95a495-1ccd-491f-97f7-74014a6a5757','bade8b37-dbdc-466d-8bfc-148678a927a1','Báo lỗi / Khiếu nại',5,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-10-02 21:22:03',1,'2026-10-02 21:22:03','2026-09-30 21:22:03','2026-11-04 21:22:04'),('62998ea5-109a-4962-ae0b-f15499250919','cece875b-ebdd-46b0-83e0-c5c6e26ea245','bade8b37-dbdc-466d-8bfc-148678a927a1','Góp ý',4,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-16 21:22:03','2026-11-04 21:22:04'),('662c8b17-1fd7-419f-a899-543e7c7fecd6','3eb9ed1d-1523-438d-819f-0a1496aa49ec','a9ec1da9-2917-42ee-a6c1-fd326144af20','Khen ngợi',4,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-09-23 21:22:03',0,NULL,'2026-09-21 21:22:03','2026-11-04 21:22:04'),('69281f25-6ea8-4da2-b2d6-ca1079e6bf6b','5c0b9d32-f8d3-454c-a8ba-bf9168d78801','a6019462-3c17-4503-8f77-9cd6cfd54b29','Khen ngợi',3,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-11-04 21:22:03',0,NULL,'2026-11-03 21:22:03','2026-11-04 21:22:04'),('6976e247-d985-494b-8591-96795f6a1823','838a60a1-8e25-4173-89d4-8731f9e68eed','a6019462-3c17-4503-8f77-9cd6cfd54b29','Khen ngợi',5,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-25 21:22:03','2026-11-04 21:22:04'),('6e6bc5ca-1797-44f9-addf-37500411e5c4','cdf52298-1cb1-40ea-a2d4-ce37319098c7','beba3451-36ab-4b36-9c35-f5430bea5c8f','Báo lỗi / Khiếu nại',4,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-08-17 21:22:03','2026-11-04 21:22:04'),('6e873d02-8d5f-40be-a888-a9455b9b392b','be0416ba-978c-4e31-aa0b-f2fea3734ed6','beba3451-36ab-4b36-9c35-f5430bea5c8f','Góp ý',2,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-28 21:22:03','2026-11-04 21:22:04'),('726da5ad-1481-45c0-860b-a1821a435f4a','85761216-056b-4339-abb7-e5dba68f7d37','368d2149-d9c2-4750-b590-8c1e750307af','Báo lỗi / Khiếu nại',5,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-08-21 21:22:03','2026-11-04 21:22:04'),('730683ba-6c81-4481-b4f4-36e598cb058f','3eb9ed1d-1523-438d-819f-0a1496aa49ec','4da72165-0812-4f5a-9634-f908b730ba5b','Câu hỏi',2,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-09-05 21:22:03',0,NULL,'2026-09-03 21:22:03','2026-11-04 21:22:04'),('78f735c1-6839-4b68-a5f1-d93d9b47c377','c09a846c-ccdd-423c-8a66-9628a3b0d98a','66fd45cd-0eba-429c-a4b4-a20f8646b9cb','Câu hỏi',5,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-08-26 21:22:03','2026-11-04 21:22:04'),('7a128740-10c1-426c-a7f7-453c80732bb5','337895bf-6771-4963-8a61-c6d478c24524','368d2149-d9c2-4750-b590-8c1e750307af','Báo lỗi / Khiếu nại',2,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-09-20 21:22:03',1,'2026-09-20 21:22:03','2026-09-18 21:22:03','2026-11-04 21:22:04'),('83f411e3-7c64-4c42-93ef-ac30b1224280','ca95a495-1ccd-491f-97f7-74014a6a5757','2eb8527c-e0fa-4bdd-b3b0-4c72848c051e','Báo lỗi / Khiếu nại',1,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-08-27 21:22:03',1,'2026-08-27 21:22:03','2026-08-25 21:22:03','2026-11-04 21:22:04'),('84242047-f127-41db-97e1-defc755aa80f','337895bf-6771-4963-8a61-c6d478c24524','d6474ca3-a500-4ec7-8f7a-c8693d3bea57','Báo lỗi / Khiếu nại',3,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-08-15 21:22:03',1,'2026-08-15 21:22:03','2026-08-13 21:22:03','2026-11-04 21:22:04'),('85a1f69f-678e-4ac0-8c98-86ed4dceb8fd','5722d865-fd7e-46ad-841f-da92b247f326','91969471-097a-4bcc-9e31-3c46fa6094a2','Góp ý',1,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-08-15 21:22:03','2026-11-04 21:22:04'),('8c804ef8-24be-4fb3-bc3d-b99a75e371f3','85761216-056b-4339-abb7-e5dba68f7d37','2eb8527c-e0fa-4bdd-b3b0-4c72848c051e','Góp ý',2,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-08 21:22:03','2026-11-04 21:22:04'),('989500a7-7f78-4d5d-864c-b9d2fbea3c89','72afaf85-ff98-476f-9290-c2926b55bfb0','a6019462-3c17-4503-8f77-9cd6cfd54b29','Câu hỏi',4,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-11 21:22:03','2026-11-04 21:22:04'),('9a28b73c-010e-4730-9ce9-53e627556f73','cdf52298-1cb1-40ea-a2d4-ce37319098c7','368d2149-d9c2-4750-b590-8c1e750307af','Góp ý',1,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-09-04 21:22:03','2026-11-04 21:22:04'),('9b27ad3e-f2f5-4d24-90fb-1726b00cac0f','85761216-056b-4339-abb7-e5dba68f7d37','91969471-097a-4bcc-9e31-3c46fa6094a2','Báo lỗi / Khiếu nại',4,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-26 21:22:03','2026-11-04 21:22:04'),('9e82c584-55cf-4cbd-9455-fd7190247dd2','d1b398b8-edf6-4d78-bee7-d1ce0e1ab263','013b7830-0769-489b-9280-03a3ed437dd9','Khen ngợi',5,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-05 21:22:03','2026-11-04 21:22:04'),('9e9a21fc-6879-4747-a8b0-53817ec6f93a','8c3082bc-b34f-49aa-8591-ff5cdfd843cd','368d2149-d9c2-4750-b590-8c1e750307af','Góp ý',3,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-10-02 21:22:03','2026-11-04 21:22:04'),('9e9ba342-968f-43d2-a311-a3b90a0625dc','72afaf85-ff98-476f-9290-c2926b55bfb0','4aaf949b-7f77-4b27-ab09-90e6abcb7342','Khen ngợi',1,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-29 21:22:03','2026-11-04 21:22:04'),('9f9be0c5-47f0-4ee8-91cc-ffed61034e1a','5722d865-fd7e-46ad-841f-da92b247f326','020c90da-6b51-4e8d-b604-d34a345a8bb7','Góp ý',5,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-20 21:22:03','2026-11-04 21:22:04'),('b6cc9984-c1cb-4f29-8fa3-6b932a20aa18','8c3082bc-b34f-49aa-8591-ff5cdfd843cd','d6474ca3-a500-4ec7-8f7a-c8693d3bea57','Góp ý',4,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-08-27 21:22:03','2026-11-04 21:22:04'),('c1b53a2c-f9a0-41ed-aae5-c3bd17546513','d1b398b8-edf6-4d78-bee7-d1ce0e1ab263','4aaf949b-7f77-4b27-ab09-90e6abcb7342','Câu hỏi',3,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-08-18 21:22:03','2026-11-04 21:22:04'),('c379039b-cdad-4f52-9253-4f6918ee033e','ca95a495-1ccd-491f-97f7-74014a6a5757','91969471-097a-4bcc-9e31-3c46fa6094a2','Góp ý',3,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-09-14 21:22:03',0,NULL,'2026-09-12 21:22:03','2026-11-04 21:22:04'),('c6738457-da28-41c4-b485-0fbebbd1da5e','d1b398b8-edf6-4d78-bee7-d1ce0e1ab263','66fd45cd-0eba-429c-a4b4-a20f8646b9cb','Câu hỏi',2,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','IN_PROGRESS',NULL,NULL,NULL,0,NULL,'2026-09-23 21:22:03','2026-11-04 21:22:04'),('c8a2c319-73ed-4edb-9f84-0fc348128bce','cece875b-ebdd-46b0-83e0-c5c6e26ea245','91969471-097a-4bcc-9e31-3c46fa6094a2','Báo lỗi / Khiếu nại',2,'Cần hỗ trợ kỹ thuật','Máy có hiện tượng nóng khi chạy tác vụ nặng, mong cửa hàng kiểm tra và hướng dẫn xử lý. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-08-29 21:22:03','2026-11-04 21:22:04'),('c9361d55-46f6-4d69-bc27-f7eceba45143','5c0b9d32-f8d3-454c-a8ba-bf9168d78801','4aaf949b-7f77-4b27-ab09-90e6abcb7342','Câu hỏi',5,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-11-04 21:22:03',0,NULL,'2026-11-03 21:22:03','2026-11-04 21:22:04'),('d13adfca-21a8-402c-b6cf-6c958ca7551e','0ad1b5d1-4827-4416-8d16-2cb225ebafed','a6019462-3c17-4503-8f77-9cd6cfd54b29','Câu hỏi',2,'Tư vấn nâng cấp','Tôi muốn được tư vấn nâng cấp RAM và thời hạn bảo hành của sản phẩm này. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-08-14 21:22:03','2026-11-04 21:22:04'),('e184a607-45d3-4054-858d-26ac2e194cd1','cece875b-ebdd-46b0-83e0-c5c6e26ea245','2eb8527c-e0fa-4bdd-b3b0-4c72848c051e','Góp ý',5,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','NEW',NULL,NULL,NULL,0,NULL,'2026-08-11 21:22:03','2026-11-04 21:22:04'),('e6fd5114-ba58-4c92-a592-fe1ea37e86df','54cd8c4f-ecce-433d-bb05-d6c70e5a744d','d6474ca3-a500-4ec7-8f7a-c8693d3bea57','Góp ý',1,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-09-26 21:22:03',0,NULL,'2026-09-24 21:22:03','2026-11-04 21:22:04'),('f3325638-dd08-4861-b9f3-6d3ad4db0c13','54cd8c4f-ecce-433d-bb05-d6c70e5a744d','bade8b37-dbdc-466d-8bfc-148678a927a1','Góp ý',2,'Đề xuất cải thiện','Tôi mong cửa hàng bổ sung hướng dẫn chọn cấu hình và so sánh sản phẩm rõ hơn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-08-21 21:22:03',0,NULL,'2026-08-19 21:22:03','2026-11-04 21:22:04'),('f5b0ab54-b5ad-4720-b3a5-02f8f99fa5cc','5c0b9d32-f8d3-454c-a8ba-bf9168d78801','013b7830-0769-489b-9280-03a3ed437dd9','Khen ngợi',2,'Đánh giá trải nghiệm','Sản phẩm hoạt động ổn định, nhân viên tư vấn nhiệt tình và giao hàng đúng hẹn. [Dữ liệu demo]','RESOLVED','Cửa hàng đã tiếp nhận và hỗ trợ khách hàng hoàn tất. [Demo]','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-11-04 21:22:03',0,NULL,'2026-11-03 21:22:03','2026-11-04 21:22:04');
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
INSERT INTO `password_recovery_requests` VALUES ('200303a2-61e4-46e8-aa25-57f162595892','8b29fe6c-0843-48b6-9bd5-6d981d807bb6','khach2@demo.vn','e28a9a226d582b1909fa6930bf09e5aacc6431c2e32088c0a0df310134771628','REJECTED','Lịch sử yêu cầu khôi phục mật khẩu giả lập để trình diễn.','[DEMO] Bản ghi lịch sử giả lập, không có mã khôi phục có thể sử dụng.','30f8c7ee-0f6f-4138-bd0c-01f755599e5c','Quản trị viên Demo','2026-10-30 21:22:03','2026-10-31 21:22:03','2026-10-31 21:22:03',NULL,0,'MANUAL',NULL),('5d9142dd-0944-4408-b222-85bb5efa59bb','cece875b-ebdd-46b0-83e0-c5c6e26ea245','khach@demo.vn','2595106b30640bcd72f50f1f4bc0edaaa6dd60b3399fb9d601c9da2e7e39b1fb','COMPLETED','Lịch sử yêu cầu khôi phục mật khẩu giả lập để trình diễn.','[DEMO] Bản ghi lịch sử giả lập, không có mã khôi phục có thể sử dụng.','30f8c7ee-0f6f-4138-bd0c-01f755599e5c','Quản trị viên Demo','2026-10-29 21:22:03','2026-10-30 21:22:03','2026-10-30 21:22:03','2026-10-31 21:22:03',0,'MANUAL',NULL);
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
INSERT INTO `products` VALUES ('013b7830-0769-489b-9280-03a3ed437dd9','PC Đồ họa Backline D1','PC',1,'2026-11-04 21:22:04'),('020c90da-6b51-4e8d-b604-d34a345a8bb7','PC Văn phòng Backline O1','PC',1,'2026-11-04 21:22:04'),('2eb8527c-e0fa-4bdd-b3b0-4c72848c051e','Dell Inspiron 15 3530','Laptop',1,'2026-11-04 21:22:04'),('368d2149-d9c2-4750-b590-8c1e750307af','PC Gaming Backline G3','PC',1,'2026-11-04 21:22:04'),('4aaf949b-7f77-4b27-ab09-90e6abcb7342','Acer Nitro V 15 ANV15','Laptop',1,'2026-11-04 21:22:04'),('4da72165-0812-4f5a-9634-f908b730ba5b','PC Gaming Backline G2','PC',1,'2026-11-04 21:22:04'),('66fd45cd-0eba-429c-a4b4-a20f8646b9cb','HP 15-fd0231TU','Laptop',1,'2026-11-04 21:22:04'),('91969471-097a-4bcc-9e31-3c46fa6094a2','ASUS TUF Gaming F15 FX507','Laptop',1,'2026-11-04 21:22:04'),('a6019462-3c17-4503-8f77-9cd6cfd54b29','ASUS Vivobook 15 X1504','Laptop',1,'2026-11-04 21:22:04'),('a9ec1da9-2917-42ee-a6c1-fd326144af20','PC Văn phòng Backline O2','PC',1,'2026-11-04 21:22:04'),('bade8b37-dbdc-466d-8bfc-148678a927a1','PC Gaming Backline G1','PC',1,'2026-11-04 21:22:04'),('beba3451-36ab-4b36-9c35-f5430bea5c8f','MSI Thin 15 B13VE','Laptop',1,'2026-11-04 21:22:04'),('d6474ca3-a500-4ec7-8f7a-c8693d3bea57','Lenovo IdeaPad Slim 3 15IAH8','Laptop',1,'2026-11-04 21:22:04'),('e0a8393f-3766-49c8-ae48-582edd51dd2b','Lenovo LOQ 15IAX9','Laptop',1,'2026-11-04 21:22:04');
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
INSERT INTO `question_options` VALUES ('24c619d2-f169-4470-b8ff-ee215aa69935','6ccaf25b-57db-4b1f-bd1a-61b9c7ba7edd','Email',2),('28012c98-7e37-44c9-a509-70b282ca6459','74b3b908-70c7-4bfb-a902-2801c4e4bd95','Giảm giá linh kiện',1),('2e27c9a2-aef0-4e25-91d2-a65eeb6950eb','bd8c8bb3-5fc2-4b5f-a326-4bf3811454cb','10 - 20 triệu',2),('41c8701c-8e9b-4f93-b934-12805edc8954','47b97698-bf01-4a8d-bad3-0d3ff775a59f','Thiết kế',2),('427abf4d-646a-41b3-8180-96e556e08115','db1f36cb-993e-4f90-b2ce-5a58ee61f670','Khác',5),('6ad487e3-7897-4e5a-a690-ac5e80cbf2dc','f1768992-b8e9-4b4a-9f07-0db1fd1fd2c9','Rất tốt',1),('73be7021-9347-4dfe-9508-7697fcbf7b0d','ca5e9f8c-0be9-4c12-a3b4-06a63328eb20','Lập trình',4),('8047e65e-725f-4228-93b8-6b843772a359','d96e3cb8-a431-494c-b89c-29aea7b3a463','Điện thoại',2),('85f0e0c6-08eb-4736-9fcf-9c09bc3f93e4','ca5e9f8c-0be9-4c12-a3b4-06a63328eb20','Văn phòng / Học tập',3),('85f417c1-e114-4296-8563-bdb8e7e5f09f','db1f36cb-993e-4f90-b2ce-5a58ee61f670','Bạn bè giới thiệu',1),('88aacb18-9dc9-4244-be81-c2d4482ee61f','47b97698-bf01-4a8d-bad3-0d3ff775a59f','Dựng video',3),('89fb160f-102b-4bbe-b476-6d7f5ae79545','f1768992-b8e9-4b4a-9f07-0db1fd1fd2c9','Chưa tốt',4),('903de3a4-3b37-473b-a4c7-31d2a5ae3810','bd8c8bb3-5fc2-4b5f-a326-4bf3811454cb','Trên 35 triệu',4),('90a24cc9-a95d-4aa3-a6d8-9999a6eb3f5f','47b97698-bf01-4a8d-bad3-0d3ff775a59f','Chơi game',1),('9e7fcaeb-7876-4449-bfb3-181cc1199926','f1768992-b8e9-4b4a-9f07-0db1fd1fd2c9','Bình thường',3),('a2675ce3-5199-4c02-b9e6-ea18c2067d9e','b39a7ef3-cc83-4453-85e5-763f42948e6c','Linh kiện nâng cấp',3),('ac6d1f85-d6e3-494f-b828-923f64a063ec','b39a7ef3-cc83-4453-85e5-763f42948e6c','PC lắp sẵn',2),('b5147dcf-1678-46df-8a53-113721171d7c','6ccaf25b-57db-4b1f-bd1a-61b9c7ba7edd','Điện thoại',1),('bb562bbd-650e-4be5-bac6-8bf39f5744e8','bd8c8bb3-5fc2-4b5f-a326-4bf3811454cb','Dưới 10 triệu',1),('c4d01712-a164-4fad-8f4b-78d07e567de0','74b3b908-70c7-4bfb-a902-2801c4e4bd95','Vệ sinh máy miễn phí',2),('c5346979-bb95-437f-af16-6e0ed0a59e58','f1768992-b8e9-4b4a-9f07-0db1fd1fd2c9','Tốt',2),('ca5331f3-5cdc-45a7-acc5-715a3b3fe794','ca5e9f8c-0be9-4c12-a3b4-06a63328eb20','Gaming',1),('d0ffb3ed-2032-4727-aafb-0a77061dc03c','db1f36cb-993e-4f90-b2ce-5a58ee61f670','Tìm kiếm Google',3),('d42907aa-2299-44d5-a0d2-50daa13eeb58','6ccaf25b-57db-4b1f-bd1a-61b9c7ba7edd','Tại cửa hàng',3),('d6adf032-d9a2-44fc-8a8a-e80ff3b5d0d1','74b3b908-70c7-4bfb-a902-2801c4e4bd95','Tặng phụ kiện',3),('d7eabb30-d630-4440-94dc-48c03a857d0b','b39a7ef3-cc83-4453-85e5-763f42948e6c','Chưa có dự định',4),('da5791ff-6416-4501-a3c2-27bee2e4a2ce','db1f36cb-993e-4f90-b2ce-5a58ee61f670','Facebook / TikTok',2),('da99c27c-c0f4-4d8f-a6cc-516c293c3131','db1f36cb-993e-4f90-b2ce-5a58ee61f670','Đi ngang qua cửa hàng',4),('dca6c74b-763b-413b-939a-a47bd46af17a','d96e3cb8-a431-494c-b89c-29aea7b3a463','Email',1),('dff86dd2-47a7-48cd-8245-1af1269c88ce','ca5e9f8c-0be9-4c12-a3b4-06a63328eb20','Đồ họa / Thiết kế',2),('e5fa2187-0b64-4cb2-bf57-4771c8d55cf1','bd8c8bb3-5fc2-4b5f-a326-4bf3811454cb','20 - 35 triệu',3),('ed47bd8c-5251-4fdb-96b4-8e62627add4d','b39a7ef3-cc83-4453-85e5-763f42948e6c','Laptop',1);
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
INSERT INTO `response_details` VALUES ('03ee9d58-651e-48c7-aef4-bd287cb5f0f2','67fb719a-b8c2-4dff-a8bc-b279142b2617','b39a7ef3-cc83-4453-85e5-763f42948e6c','d7eabb30-d630-4440-94dc-48c03a857d0b',NULL,NULL),('047644a5-d574-4331-9a9d-37666e943ae8','9eb7ee59-9405-4f8e-886e-50500226fbfe','80733313-d14a-425e-8a42-6f4d74a50004',NULL,'Tư vấn rõ ràng, tôi hài lòng với trải nghiệm. [Demo]',NULL),('0b98b5ff-65d1-47c5-8c46-2fa26448cc06','d76e16b9-7816-4d96-a686-bea4d4d3a9df','47b97698-bf01-4a8d-bad3-0d3ff775a59f','88aacb18-9dc9-4244-be81-c2d4482ee61f',NULL,NULL),('101be00b-de31-4652-b370-3c90d1af0460','0e7fc0b8-1051-4785-8ccd-fc448efd2474','bd8c8bb3-5fc2-4b5f-a326-4bf3811454cb','bb562bbd-650e-4be5-bac6-8bf39f5744e8',NULL,NULL),('11e0e2cc-ce62-400d-b2a8-aeb87b925fb0','0e7fc0b8-1051-4785-8ccd-fc448efd2474','ca5e9f8c-0be9-4c12-a3b4-06a63328eb20','ca5331f3-5cdc-45a7-acc5-715a3b3fe794',NULL,NULL),('13682db8-39ff-4ed2-84b5-edc5a2cfb205','6779ba9b-6eee-44e4-8995-eb2fd98820fe','ca5e9f8c-0be9-4c12-a3b4-06a63328eb20','dff86dd2-47a7-48cd-8245-1af1269c88ce',NULL,NULL),('181dfb9e-5c8d-4d8a-a7d9-3956b899b899','303456a6-0038-4105-b278-c9dccf704cde','f642dee7-10f4-4fea-9cb8-28c574bdca4b',NULL,NULL,5),('1b6e40ce-aff5-47e1-b36c-678079dcc365','f5c57029-7ca1-40c7-b029-473230d1d6c9','f642dee7-10f4-4fea-9cb8-28c574bdca4b',NULL,NULL,3),('2180d314-3f35-416a-b4ad-0ad466e9b578','dfb02b02-f342-40b4-a1a0-0f5ab8ed009a','f642dee7-10f4-4fea-9cb8-28c574bdca4b',NULL,NULL,3),('2412f558-f49a-481f-99d3-b819d5087626','0e7fc0b8-1051-4785-8ccd-fc448efd2474','b39a7ef3-cc83-4453-85e5-763f42948e6c','ed47bd8c-5251-4fdb-96b4-8e62627add4d',NULL,NULL),('29951579-879c-4171-8933-000e49f3a5da','5dba5dc8-dfe0-469f-b32b-6a01bf255e09','f642dee7-10f4-4fea-9cb8-28c574bdca4b',NULL,NULL,4),('3c1e502a-d479-4285-a08a-8781a0b4bb0e','a77c744c-7b5d-4340-9581-78ca98a9a3c7','bd7466b6-1cef-4d82-a71d-c22ed85e2f7c',NULL,NULL,4),('475ab9d3-6e14-4f8a-939d-208f23079b7c','6779ba9b-6eee-44e4-8995-eb2fd98820fe','b39a7ef3-cc83-4453-85e5-763f42948e6c','ed47bd8c-5251-4fdb-96b4-8e62627add4d',NULL,NULL),('4d9bcb57-7ac3-4d24-9e9a-12f92f21c171','ab122218-219c-4f68-9f44-a63257fd4eef','cb1d9cbf-d40a-4728-a037-1e20cfaa2d27',NULL,'Tôi mong tiếp tục nhận được hỗ trợ tận tình.',NULL),('50b17fbc-a967-4b9a-9c89-a10dde2d8c30','ebb27455-943d-4005-9621-225653cdb754','67e63bf5-7c46-4918-b558-43bb2293f2a0',NULL,'Tôi mong tiếp tục nhận được hỗ trợ tận tình.',NULL),('5ed18c15-493a-4212-bf99-c614124d968d','67fb719a-b8c2-4dff-a8bc-b279142b2617','9fcb9edb-431c-416f-87c3-f6b06f4afdcc',NULL,'Tư vấn rõ ràng, tôi hài lòng với trải nghiệm. [Demo]',NULL),('69bed141-643a-4f7c-8846-9ffd38251335','c6e13157-3f95-42fc-b51c-5ff6e1143a6b','ca5e9f8c-0be9-4c12-a3b4-06a63328eb20','73be7021-9347-4dfe-9508-7697fcbf7b0d',NULL,NULL),('6de4becd-cc64-4b15-a56f-287e42aa718d','6cac7917-50fd-4114-9566-bf8a16c2c2ee','47b97698-bf01-4a8d-bad3-0d3ff775a59f','88aacb18-9dc9-4244-be81-c2d4482ee61f',NULL,NULL),('7619c21f-6114-4399-8514-8a65a4f3a6a1','67fb719a-b8c2-4dff-a8bc-b279142b2617','bd8c8bb3-5fc2-4b5f-a326-4bf3811454cb','903de3a4-3b37-473b-a4c7-31d2a5ae3810',NULL,NULL),('802e6bf4-9a37-4257-be94-8de6f07256a8','59ea843a-20cd-442f-aa8a-b7bf0674ccbf','bd7466b6-1cef-4d82-a71d-c22ed85e2f7c',NULL,NULL,3),('830d0ca6-72e2-45dc-bd1d-fdf3c8aeac28','59ea843a-20cd-442f-aa8a-b7bf0674ccbf','fba97508-13d1-44b4-8c59-501bdb200cb7',NULL,'Tư vấn rõ ràng, tôi hài lòng với trải nghiệm. [Demo]',NULL),('87c8e327-a6c2-4804-a398-a9deb5e19d16','0e7fc0b8-1051-4785-8ccd-fc448efd2474','9fcb9edb-431c-416f-87c3-f6b06f4afdcc',NULL,'Tư vấn rõ ràng, tôi hài lòng với trải nghiệm. [Demo]',NULL),('8a36288c-a03e-47c1-8745-934a05369f89','6779ba9b-6eee-44e4-8995-eb2fd98820fe','ca5e9f8c-0be9-4c12-a3b4-06a63328eb20','ca5331f3-5cdc-45a7-acc5-715a3b3fe794',NULL,NULL),('8dbe2e52-6771-4d97-85f5-1136831abb8a','f5c57029-7ca1-40c7-b029-473230d1d6c9','80733313-d14a-425e-8a42-6f4d74a50004',NULL,'Tư vấn rõ ràng, tôi hài lòng với trải nghiệm. [Demo]',NULL),('99054930-ae4e-49a6-ad6a-ce1c1e47e898','d76e16b9-7816-4d96-a686-bea4d4d3a9df','47b97698-bf01-4a8d-bad3-0d3ff775a59f','90a24cc9-a95d-4aa3-a6d8-9999a6eb3f5f',NULL,NULL),('99512528-d772-4e90-b258-02df244981b6','6779ba9b-6eee-44e4-8995-eb2fd98820fe','9fcb9edb-431c-416f-87c3-f6b06f4afdcc',NULL,'Mong cửa hàng cải thiện thời gian hỗ trợ. [Demo]',NULL),('9a93ff8e-3ffc-4a4d-8a30-4ee8cac18be9','d76e16b9-7816-4d96-a686-bea4d4d3a9df','8c677d02-e568-4097-a891-e248e327be08',NULL,'Sẽ giới thiệu cửa hàng đến bạn bè. [Demo]',NULL),('9c3e5645-3b94-44eb-86b9-9d2fca4d8f26','9eb7ee59-9405-4f8e-886e-50500226fbfe','f642dee7-10f4-4fea-9cb8-28c574bdca4b',NULL,NULL,3),('a02b3e29-556a-4350-a3de-9d5cf0e436a7','f2ed37d3-73ae-4528-848c-6f2f1fd23f2b','47e169ca-c2f0-4a1a-9afc-75915faf3961',NULL,NULL,5),('aa0273a9-2ef9-46eb-b9b0-bbed30299eea','c6e13157-3f95-42fc-b51c-5ff6e1143a6b','ca5e9f8c-0be9-4c12-a3b4-06a63328eb20','85f0e0c6-08eb-4736-9fcf-9c09bc3f93e4',NULL,NULL),('ad8eb24f-f88d-40fd-b515-9204707b0e86','d0160c5e-2762-4884-bb2d-0e6abc74fb03','bd7466b6-1cef-4d82-a71d-c22ed85e2f7c',NULL,NULL,5),('b0054f53-f6ff-4b04-9957-77941e433d55','0e7fc0b8-1051-4785-8ccd-fc448efd2474','ca5e9f8c-0be9-4c12-a3b4-06a63328eb20','dff86dd2-47a7-48cd-8245-1af1269c88ce',NULL,NULL),('be273872-65f9-4c80-b610-dbc35652b0a3','dfb02b02-f342-40b4-a1a0-0f5ab8ed009a','80733313-d14a-425e-8a42-6f4d74a50004',NULL,'Tư vấn rõ ràng, tôi hài lòng với trải nghiệm. [Demo]',NULL),('bee06b37-7455-440d-9aa6-bdf42d648755','6779ba9b-6eee-44e4-8995-eb2fd98820fe','bd8c8bb3-5fc2-4b5f-a326-4bf3811454cb','bb562bbd-650e-4be5-bac6-8bf39f5744e8',NULL,NULL),('c02ec5d2-a06f-47f8-bb2f-3f44cb9eb905','d5aa8fc4-592a-43aa-bf11-1355bbf20c93','f642dee7-10f4-4fea-9cb8-28c574bdca4b',NULL,NULL,4),('d328f4ba-ab29-4bba-b4d5-2c0d227ca83a','51e844fb-4b7f-47d9-a829-fa6cf6b4023e','f642dee7-10f4-4fea-9cb8-28c574bdca4b',NULL,NULL,5),('d7fc3e85-8494-4aed-8248-416583213286','6cac7917-50fd-4114-9566-bf8a16c2c2ee','47b97698-bf01-4a8d-bad3-0d3ff775a59f','41c8701c-8e9b-4f93-b934-12805edc8954',NULL,NULL),('d9539b80-d0dc-4bea-993a-611617bb5f52','c6e13157-3f95-42fc-b51c-5ff6e1143a6b','b39a7ef3-cc83-4453-85e5-763f42948e6c','a2675ce3-5199-4c02-b9e6-ea18c2067d9e',NULL,NULL),('dc7542ad-31ae-49bf-8a1a-ed791d766111','c6e13157-3f95-42fc-b51c-5ff6e1143a6b','bd8c8bb3-5fc2-4b5f-a326-4bf3811454cb','e5fa2187-0b64-4cb2-bf57-4771c8d55cf1',NULL,NULL),('de36fbc4-7b8c-4b6d-9d15-68d21ca6b94d','d0160c5e-2762-4884-bb2d-0e6abc74fb03','fba97508-13d1-44b4-8c59-501bdb200cb7',NULL,'Sẽ giới thiệu cửa hàng đến bạn bè. [Demo]',NULL),('e43cc99d-7499-4fcd-900e-a7e391d60c2b','303456a6-0038-4105-b278-c9dccf704cde','80733313-d14a-425e-8a42-6f4d74a50004',NULL,'Sẽ giới thiệu cửa hàng đến bạn bè. [Demo]',NULL),('e784f5c6-4198-4e06-a5d3-87420d5db81e','ab26610e-e599-459a-be18-35dc07c89f5a','f642dee7-10f4-4fea-9cb8-28c574bdca4b',NULL,NULL,4),('efc2e04b-1dc1-4503-b34c-3b6de7449fe2','67fb719a-b8c2-4dff-a8bc-b279142b2617','ca5e9f8c-0be9-4c12-a3b4-06a63328eb20','ca5331f3-5cdc-45a7-acc5-715a3b3fe794',NULL,NULL),('f7cc2cc1-a865-4c0d-bbb8-ca27d801e020','d46aaa87-a8ae-49ee-8ad0-3746eabefbf2','e63fdc73-0e3b-4e27-85a7-30689e63bcbc',NULL,'Tôi mong tiếp tục nhận được hỗ trợ tận tình.',NULL),('f8d34d2e-61c2-4c51-93ef-ebe1bbb9a26f','f2ed37d3-73ae-4528-848c-6f2f1fd23f2b','bb0b523d-6e8a-4b7a-acac-e5ee61887fa3',NULL,'Sẽ giới thiệu cửa hàng đến bạn bè. [Demo]',NULL),('f99aef29-966f-43e9-95f0-90088ca91d72','51e844fb-4b7f-47d9-a829-fa6cf6b4023e','80733313-d14a-425e-8a42-6f4d74a50004',NULL,'Sẽ giới thiệu cửa hàng đến bạn bè. [Demo]',NULL),('f9d609d9-e902-452e-ad2f-679e310bbf6e','67fb719a-b8c2-4dff-a8bc-b279142b2617','ca5e9f8c-0be9-4c12-a3b4-06a63328eb20','73be7021-9347-4dfe-9508-7697fcbf7b0d',NULL,NULL);
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
INSERT INTO `survey_lifecycle_history` VALUES ('476f72ed-218a-4333-9ba4-e40b91a1b47e','3bf7ab60-75b8-4bcc-b5a0-a6168e1b965a','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','EXTEND','2026-11-06','2026-11-18','OPEN','OPEN','2026-11-03 14:22:03'),('7792159a-8f97-4c16-9542-ec4050aaee8a','cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','CLOSE','2026-11-01','2026-11-01','OPEN','CLOSED','2026-11-01 14:22:03'),('ac258b5b-2e63-44d5-9eaa-a8011b38e86e','cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','REOPEN','2026-11-01','2026-11-14','CLOSED','OPEN','2026-11-03 14:22:03'),('dc255567-b6ee-45e4-b697-70f5b9ec26cf','c8c54e88-f3d6-4f70-96d0-f195369d49d6','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','CLOSE','2026-10-28','2026-10-28','OPEN','CLOSED','2026-11-02 14:22:03'),('fd1aa148-8269-4a23-8675-3086404aac91','20efce9b-a835-44cb-a9fb-a8d918104114','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','CLOSE','2026-11-02','2026-11-02','OPEN','CLOSED','2026-11-02 14:22:03');
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
INSERT INTO `survey_questions` VALUES ('103bd8b8-074d-4876-a0ab-f72e01cc748c','02383079-ef25-4204-ba4e-3c7ecbb5c6f4','Bạn đánh giá chung về dịch vụ của cửa hàng như thế nào?','RATING',1,1),('398dcbe9-854d-4541-97f1-5644921c4c93','eaeb8159-0055-4454-a8a4-9774de7c1180','Ý tưởng khác của bạn?','TEXT',0,2),('47b97698-bf01-4a8d-bad3-0d3ff775a59f','bf3c841b-5f14-4252-b049-b613df891d6e','Bạn quan tâm trải nghiệm nào?','MULTI',1,1),('47e169ca-c2f0-4a1a-9afc-75915faf3961','4db92246-b537-4b26-b1c5-bd213c62cdbd','Bạn đánh giá buổi tư vấn thế nào?','RATING',1,1),('67e63bf5-7c46-4918-b558-43bb2293f2a0','cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','Bạn góp ý gì để chúng tôi phục vụ tốt hơn?','TEXT',1,1),('6ccaf25b-57db-4b1f-bd1a-61b9c7ba7edd','20efce9b-a835-44cb-a9fb-a8d918104114','Bạn muốn nhận thông tin qua kênh nào?','ONE',1,1),('74b3b908-70c7-4bfb-a902-2801c4e4bd95','eaeb8159-0055-4454-a8a4-9774de7c1180','Bạn mong muốn ưu đãi nào?','MULTI',1,1),('80733313-d14a-425e-8a42-6f4d74a50004','c8c54e88-f3d6-4f70-96d0-f195369d49d6','Ý kiến khác','TEXT',0,2),('8c677d02-e568-4097-a891-e248e327be08','bf3c841b-5f14-4252-b049-b613df891d6e','Góp ý thêm?','TEXT',0,2),('929daed3-cb5e-44fe-b390-ce83727956e0','02383079-ef25-4204-ba4e-3c7ecbb5c6f4','Bạn có góp ý gì thêm cho chúng tôi?','TEXT',0,4),('9fcb9edb-431c-416f-87c3-f6b06f4afdcc','ad02ffee-a009-4c56-8ed2-361b1df83722','Bạn quan tâm đến dòng máy hoặc cấu hình cụ thể nào?','TEXT',0,4),('a62608f3-0381-486f-a336-334b0a50825a','1483cb1f-da71-4f33-afde-b5d8f169d170','Góp ý dịch vụ?','TEXT',0,1),('b39a7ef3-cc83-4453-85e5-763f42948e6c','ad02ffee-a009-4c56-8ed2-361b1df83722','Bạn dự định mua gì trong 6 tháng tới?','ONE',1,1),('bb0b523d-6e8a-4b7a-acac-e5ee61887fa3','4db92246-b537-4b26-b1c5-bd213c62cdbd','Cửa hàng nên cải thiện điều gì?','TEXT',0,2),('bd7466b6-1cef-4d82-a71d-c22ed85e2f7c','49d7c824-2deb-482c-8780-1a6b0c6c0b04','Bạn đánh giá trải nghiệm đặt hàng bao nhiêu sao?','RATING',1,1),('bd8c8bb3-5fc2-4b5f-a326-4bf3811454cb','ad02ffee-a009-4c56-8ed2-361b1df83722','Ngân sách dự kiến của bạn?','ONE',1,3),('ca5e9f8c-0be9-4c12-a3b4-06a63328eb20','ad02ffee-a009-4c56-8ed2-361b1df83722','Mục đích sử dụng chính (chọn nhiều đáp án)','MULTI',1,2),('cb1d9cbf-d40a-4728-a037-1e20cfaa2d27','2c030ff4-691a-4dfb-8261-1529b252287f','Bạn góp ý gì để chúng tôi phục vụ tốt hơn?','TEXT',1,1),('cb8c2663-22ec-411c-b270-35e6144acfe3','17a2e5a5-5d7d-4753-8855-e79e75b5b6e2','Mức độ quan tâm của bạn?','RATING',1,1),('d5b4e6a6-fe32-4e6b-b1c9-976ed2ad4e46','dde4395a-8295-46b6-b14c-341ab4dcc16d','Bạn muốn chia sẻ điều gì?','TEXT',0,1),('d6f907bb-bb01-4aae-965a-0f70f4ad4bcc','003d44dc-3fc7-40db-8a7f-eff03a925060','Bạn góp ý gì để chúng tôi phục vụ tốt hơn?','TEXT',1,1),('d96e3cb8-a431-494c-b89c-29aea7b3a463','2058b251-cbce-4e8c-86ac-fa9099ed6d3b','Bạn muốn nhận hỗ trợ qua kênh nào?','ONE',1,1),('db1f36cb-993e-4f90-b2ce-5a58ee61f670','02383079-ef25-4204-ba4e-3c7ecbb5c6f4','Bạn biết đến cửa hàng qua kênh nào?','ONE',1,2),('e63fdc73-0e3b-4e27-85a7-30689e63bcbc','3bf7ab60-75b8-4bcc-b5a0-a6168e1b965a','Bạn góp ý gì để chúng tôi phục vụ tốt hơn?','TEXT',1,1),('f1768992-b8e9-4b4a-9f07-0db1fd1fd2c9','02383079-ef25-4204-ba4e-3c7ecbb5c6f4','Nhân viên tư vấn có nhiệt tình và hiểu sản phẩm không?','ONE',1,3),('f642dee7-10f4-4fea-9cb8-28c574bdca4b','c8c54e88-f3d6-4f70-96d0-f195369d49d6','Bạn hài lòng thế nào về thời gian xử lý bảo hành?','RATING',1,1),('f6ec26de-e1a8-49f6-9d0c-604a059a286d','2058b251-cbce-4e8c-86ac-fa9099ed6d3b','Góp ý khác?','TEXT',0,2),('fba97508-13d1-44b4-8c59-501bdb200cb7','49d7c824-2deb-482c-8780-1a6b0c6c0b04','Góp ý về quá trình mua hàng?','TEXT',0,2);
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
INSERT INTO `survey_recipients` VALUES ('003d44dc-3fc7-40db-8a7f-eff03a925060','337895bf-6771-4963-8a61-c6d478c24524','2026-10-28 21:22:03'),('003d44dc-3fc7-40db-8a7f-eff03a925060','8b29fe6c-0843-48b6-9bd5-6d981d807bb6','2026-10-28 21:22:03'),('003d44dc-3fc7-40db-8a7f-eff03a925060','cece875b-ebdd-46b0-83e0-c5c6e26ea245','2026-10-28 21:22:03'),('02383079-ef25-4204-ba4e-3c7ecbb5c6f4','0ad1b5d1-4827-4416-8d16-2cb225ebafed','2026-10-21 21:22:03'),('02383079-ef25-4204-ba4e-3c7ecbb5c6f4','337895bf-6771-4963-8a61-c6d478c24524','2026-10-21 21:22:03'),('02383079-ef25-4204-ba4e-3c7ecbb5c6f4','3eb9ed1d-1523-438d-819f-0a1496aa49ec','2026-10-21 21:22:03'),('02383079-ef25-4204-ba4e-3c7ecbb5c6f4','54cd8c4f-ecce-433d-bb05-d6c70e5a744d','2026-10-21 21:22:03'),('02383079-ef25-4204-ba4e-3c7ecbb5c6f4','5722d865-fd7e-46ad-841f-da92b247f326','2026-10-21 21:22:03'),('02383079-ef25-4204-ba4e-3c7ecbb5c6f4','5c0b9d32-f8d3-454c-a8ba-bf9168d78801','2026-11-03 21:22:03'),('02383079-ef25-4204-ba4e-3c7ecbb5c6f4','72afaf85-ff98-476f-9290-c2926b55bfb0','2026-10-21 21:22:03'),('02383079-ef25-4204-ba4e-3c7ecbb5c6f4','838a60a1-8e25-4173-89d4-8731f9e68eed','2026-10-21 21:22:03'),('02383079-ef25-4204-ba4e-3c7ecbb5c6f4','8b29fe6c-0843-48b6-9bd5-6d981d807bb6','2026-10-21 21:22:03'),('02383079-ef25-4204-ba4e-3c7ecbb5c6f4','8c3082bc-b34f-49aa-8591-ff5cdfd843cd','2026-10-21 21:22:03'),('02383079-ef25-4204-ba4e-3c7ecbb5c6f4','ba39e984-58c8-40bb-b6ab-459b99a6c0c9','2026-10-21 21:22:03'),('02383079-ef25-4204-ba4e-3c7ecbb5c6f4','be0416ba-978c-4e31-aa0b-f2fea3734ed6','2026-10-21 21:22:03'),('02383079-ef25-4204-ba4e-3c7ecbb5c6f4','c09a846c-ccdd-423c-8a66-9628a3b0d98a','2026-10-21 21:22:03'),('02383079-ef25-4204-ba4e-3c7ecbb5c6f4','ca95a495-1ccd-491f-97f7-74014a6a5757','2026-10-21 21:22:03'),('02383079-ef25-4204-ba4e-3c7ecbb5c6f4','cdf52298-1cb1-40ea-a2d4-ce37319098c7','2026-10-21 21:22:03'),('02383079-ef25-4204-ba4e-3c7ecbb5c6f4','cece875b-ebdd-46b0-83e0-c5c6e26ea245','2026-10-21 21:22:03'),('02383079-ef25-4204-ba4e-3c7ecbb5c6f4','d1b398b8-edf6-4d78-bee7-d1ce0e1ab263','2026-10-21 21:22:03'),('1483cb1f-da71-4f33-afde-b5d8f169d170','54cd8c4f-ecce-433d-bb05-d6c70e5a744d','2026-11-04 21:22:03'),('1483cb1f-da71-4f33-afde-b5d8f169d170','838a60a1-8e25-4173-89d4-8731f9e68eed','2026-11-04 21:22:03'),('1483cb1f-da71-4f33-afde-b5d8f169d170','ba39e984-58c8-40bb-b6ab-459b99a6c0c9','2026-11-04 21:22:03'),('1483cb1f-da71-4f33-afde-b5d8f169d170','ca95a495-1ccd-491f-97f7-74014a6a5757','2026-11-04 21:22:03'),('20efce9b-a835-44cb-a9fb-a8d918104114','337895bf-6771-4963-8a61-c6d478c24524','2026-10-26 21:22:03'),('20efce9b-a835-44cb-a9fb-a8d918104114','5722d865-fd7e-46ad-841f-da92b247f326','2026-10-26 21:22:03'),('20efce9b-a835-44cb-a9fb-a8d918104114','cece875b-ebdd-46b0-83e0-c5c6e26ea245','2026-10-26 21:22:03'),('2c030ff4-691a-4dfb-8261-1529b252287f','0ad1b5d1-4827-4416-8d16-2cb225ebafed','2026-10-28 21:22:03'),('2c030ff4-691a-4dfb-8261-1529b252287f','337895bf-6771-4963-8a61-c6d478c24524','2026-10-28 21:22:03'),('2c030ff4-691a-4dfb-8261-1529b252287f','3eb9ed1d-1523-438d-819f-0a1496aa49ec','2026-10-28 21:22:03'),('2c030ff4-691a-4dfb-8261-1529b252287f','54cd8c4f-ecce-433d-bb05-d6c70e5a744d','2026-10-28 21:22:03'),('2c030ff4-691a-4dfb-8261-1529b252287f','5722d865-fd7e-46ad-841f-da92b247f326','2026-10-28 21:22:03'),('2c030ff4-691a-4dfb-8261-1529b252287f','5c0b9d32-f8d3-454c-a8ba-bf9168d78801','2026-11-03 21:22:03'),('2c030ff4-691a-4dfb-8261-1529b252287f','72afaf85-ff98-476f-9290-c2926b55bfb0','2026-10-28 21:22:03'),('2c030ff4-691a-4dfb-8261-1529b252287f','838a60a1-8e25-4173-89d4-8731f9e68eed','2026-10-28 21:22:03'),('2c030ff4-691a-4dfb-8261-1529b252287f','8b29fe6c-0843-48b6-9bd5-6d981d807bb6','2026-10-28 21:22:03'),('2c030ff4-691a-4dfb-8261-1529b252287f','8c3082bc-b34f-49aa-8591-ff5cdfd843cd','2026-10-28 21:22:03'),('2c030ff4-691a-4dfb-8261-1529b252287f','ba39e984-58c8-40bb-b6ab-459b99a6c0c9','2026-10-28 21:22:03'),('2c030ff4-691a-4dfb-8261-1529b252287f','be0416ba-978c-4e31-aa0b-f2fea3734ed6','2026-10-28 21:22:03'),('2c030ff4-691a-4dfb-8261-1529b252287f','c09a846c-ccdd-423c-8a66-9628a3b0d98a','2026-10-28 21:22:03'),('2c030ff4-691a-4dfb-8261-1529b252287f','ca95a495-1ccd-491f-97f7-74014a6a5757','2026-10-28 21:22:03'),('2c030ff4-691a-4dfb-8261-1529b252287f','cdf52298-1cb1-40ea-a2d4-ce37319098c7','2026-10-28 21:22:03'),('2c030ff4-691a-4dfb-8261-1529b252287f','cece875b-ebdd-46b0-83e0-c5c6e26ea245','2026-10-28 21:22:03'),('2c030ff4-691a-4dfb-8261-1529b252287f','d1b398b8-edf6-4d78-bee7-d1ce0e1ab263','2026-10-28 21:22:03'),('3bf7ab60-75b8-4bcc-b5a0-a6168e1b965a','0ad1b5d1-4827-4416-8d16-2cb225ebafed','2026-10-28 21:22:03'),('3bf7ab60-75b8-4bcc-b5a0-a6168e1b965a','337895bf-6771-4963-8a61-c6d478c24524','2026-10-28 21:22:03'),('3bf7ab60-75b8-4bcc-b5a0-a6168e1b965a','3eb9ed1d-1523-438d-819f-0a1496aa49ec','2026-10-28 21:22:03'),('3bf7ab60-75b8-4bcc-b5a0-a6168e1b965a','5722d865-fd7e-46ad-841f-da92b247f326','2026-10-28 21:22:03'),('3bf7ab60-75b8-4bcc-b5a0-a6168e1b965a','72afaf85-ff98-476f-9290-c2926b55bfb0','2026-10-28 21:22:03'),('3bf7ab60-75b8-4bcc-b5a0-a6168e1b965a','cdf52298-1cb1-40ea-a2d4-ce37319098c7','2026-10-28 21:22:03'),('3bf7ab60-75b8-4bcc-b5a0-a6168e1b965a','cece875b-ebdd-46b0-83e0-c5c6e26ea245','2026-10-28 21:22:03'),('49d7c824-2deb-482c-8780-1a6b0c6c0b04','0ad1b5d1-4827-4416-8d16-2cb225ebafed','2026-10-01 21:22:03'),('49d7c824-2deb-482c-8780-1a6b0c6c0b04','337895bf-6771-4963-8a61-c6d478c24524','2026-10-01 21:22:03'),('49d7c824-2deb-482c-8780-1a6b0c6c0b04','3eb9ed1d-1523-438d-819f-0a1496aa49ec','2026-10-01 21:22:03'),('49d7c824-2deb-482c-8780-1a6b0c6c0b04','54cd8c4f-ecce-433d-bb05-d6c70e5a744d','2026-10-01 21:22:03'),('49d7c824-2deb-482c-8780-1a6b0c6c0b04','5722d865-fd7e-46ad-841f-da92b247f326','2026-10-01 21:22:03'),('49d7c824-2deb-482c-8780-1a6b0c6c0b04','72afaf85-ff98-476f-9290-c2926b55bfb0','2026-10-01 21:22:03'),('49d7c824-2deb-482c-8780-1a6b0c6c0b04','838a60a1-8e25-4173-89d4-8731f9e68eed','2026-10-01 21:22:03'),('49d7c824-2deb-482c-8780-1a6b0c6c0b04','8b29fe6c-0843-48b6-9bd5-6d981d807bb6','2026-10-01 21:22:03'),('49d7c824-2deb-482c-8780-1a6b0c6c0b04','8c3082bc-b34f-49aa-8591-ff5cdfd843cd','2026-10-01 21:22:03'),('49d7c824-2deb-482c-8780-1a6b0c6c0b04','ba39e984-58c8-40bb-b6ab-459b99a6c0c9','2026-10-01 21:22:03'),('49d7c824-2deb-482c-8780-1a6b0c6c0b04','be0416ba-978c-4e31-aa0b-f2fea3734ed6','2026-10-01 21:22:03'),('49d7c824-2deb-482c-8780-1a6b0c6c0b04','c09a846c-ccdd-423c-8a66-9628a3b0d98a','2026-10-01 21:22:03'),('49d7c824-2deb-482c-8780-1a6b0c6c0b04','ca95a495-1ccd-491f-97f7-74014a6a5757','2026-10-01 21:22:03'),('49d7c824-2deb-482c-8780-1a6b0c6c0b04','cdf52298-1cb1-40ea-a2d4-ce37319098c7','2026-10-01 21:22:03'),('49d7c824-2deb-482c-8780-1a6b0c6c0b04','cece875b-ebdd-46b0-83e0-c5c6e26ea245','2026-10-01 21:22:03'),('49d7c824-2deb-482c-8780-1a6b0c6c0b04','d1b398b8-edf6-4d78-bee7-d1ce0e1ab263','2026-10-01 21:22:03'),('4db92246-b537-4b26-b1c5-bd213c62cdbd','3eb9ed1d-1523-438d-819f-0a1496aa49ec','2026-10-30 21:22:03'),('4db92246-b537-4b26-b1c5-bd213c62cdbd','72afaf85-ff98-476f-9290-c2926b55bfb0','2026-10-30 21:22:03'),('4db92246-b537-4b26-b1c5-bd213c62cdbd','cece875b-ebdd-46b0-83e0-c5c6e26ea245','2026-10-30 21:22:03'),('ad02ffee-a009-4c56-8ed2-361b1df83722','0ad1b5d1-4827-4416-8d16-2cb225ebafed','2026-09-26 21:22:03'),('ad02ffee-a009-4c56-8ed2-361b1df83722','337895bf-6771-4963-8a61-c6d478c24524','2026-09-26 21:22:03'),('ad02ffee-a009-4c56-8ed2-361b1df83722','3eb9ed1d-1523-438d-819f-0a1496aa49ec','2026-09-26 21:22:03'),('ad02ffee-a009-4c56-8ed2-361b1df83722','54cd8c4f-ecce-433d-bb05-d6c70e5a744d','2026-09-26 21:22:03'),('ad02ffee-a009-4c56-8ed2-361b1df83722','5722d865-fd7e-46ad-841f-da92b247f326','2026-09-26 21:22:03'),('ad02ffee-a009-4c56-8ed2-361b1df83722','5c0b9d32-f8d3-454c-a8ba-bf9168d78801','2026-11-03 21:22:03'),('ad02ffee-a009-4c56-8ed2-361b1df83722','72afaf85-ff98-476f-9290-c2926b55bfb0','2026-09-26 21:22:03'),('ad02ffee-a009-4c56-8ed2-361b1df83722','838a60a1-8e25-4173-89d4-8731f9e68eed','2026-09-26 21:22:03'),('ad02ffee-a009-4c56-8ed2-361b1df83722','8b29fe6c-0843-48b6-9bd5-6d981d807bb6','2026-09-26 21:22:03'),('ad02ffee-a009-4c56-8ed2-361b1df83722','8c3082bc-b34f-49aa-8591-ff5cdfd843cd','2026-09-26 21:22:03'),('ad02ffee-a009-4c56-8ed2-361b1df83722','ba39e984-58c8-40bb-b6ab-459b99a6c0c9','2026-09-26 21:22:03'),('ad02ffee-a009-4c56-8ed2-361b1df83722','be0416ba-978c-4e31-aa0b-f2fea3734ed6','2026-09-26 21:22:03'),('ad02ffee-a009-4c56-8ed2-361b1df83722','c09a846c-ccdd-423c-8a66-9628a3b0d98a','2026-09-26 21:22:03'),('ad02ffee-a009-4c56-8ed2-361b1df83722','ca95a495-1ccd-491f-97f7-74014a6a5757','2026-09-26 21:22:03'),('ad02ffee-a009-4c56-8ed2-361b1df83722','cdf52298-1cb1-40ea-a2d4-ce37319098c7','2026-09-26 21:22:03'),('ad02ffee-a009-4c56-8ed2-361b1df83722','cece875b-ebdd-46b0-83e0-c5c6e26ea245','2026-09-26 21:22:03'),('ad02ffee-a009-4c56-8ed2-361b1df83722','d1b398b8-edf6-4d78-bee7-d1ce0e1ab263','2026-09-26 21:22:03'),('bf3c841b-5f14-4252-b049-b613df891d6e','0ad1b5d1-4827-4416-8d16-2cb225ebafed','2026-11-04 21:22:03'),('bf3c841b-5f14-4252-b049-b613df891d6e','337895bf-6771-4963-8a61-c6d478c24524','2026-11-04 21:22:03'),('bf3c841b-5f14-4252-b049-b613df891d6e','3eb9ed1d-1523-438d-819f-0a1496aa49ec','2026-11-04 21:22:03'),('bf3c841b-5f14-4252-b049-b613df891d6e','5722d865-fd7e-46ad-841f-da92b247f326','2026-11-04 21:22:03'),('bf3c841b-5f14-4252-b049-b613df891d6e','72afaf85-ff98-476f-9290-c2926b55bfb0','2026-11-04 21:22:03'),('bf3c841b-5f14-4252-b049-b613df891d6e','cdf52298-1cb1-40ea-a2d4-ce37319098c7','2026-11-04 21:22:03'),('bf3c841b-5f14-4252-b049-b613df891d6e','cece875b-ebdd-46b0-83e0-c5c6e26ea245','2026-11-04 21:22:03'),('c8c54e88-f3d6-4f70-96d0-f195369d49d6','0ad1b5d1-4827-4416-8d16-2cb225ebafed','2026-08-27 21:22:03'),('c8c54e88-f3d6-4f70-96d0-f195369d49d6','337895bf-6771-4963-8a61-c6d478c24524','2026-08-27 21:22:03'),('c8c54e88-f3d6-4f70-96d0-f195369d49d6','3eb9ed1d-1523-438d-819f-0a1496aa49ec','2026-08-27 21:22:03'),('c8c54e88-f3d6-4f70-96d0-f195369d49d6','54cd8c4f-ecce-433d-bb05-d6c70e5a744d','2026-08-27 21:22:03'),('c8c54e88-f3d6-4f70-96d0-f195369d49d6','5722d865-fd7e-46ad-841f-da92b247f326','2026-08-27 21:22:03'),('c8c54e88-f3d6-4f70-96d0-f195369d49d6','72afaf85-ff98-476f-9290-c2926b55bfb0','2026-08-27 21:22:03'),('c8c54e88-f3d6-4f70-96d0-f195369d49d6','838a60a1-8e25-4173-89d4-8731f9e68eed','2026-08-27 21:22:03'),('c8c54e88-f3d6-4f70-96d0-f195369d49d6','8b29fe6c-0843-48b6-9bd5-6d981d807bb6','2026-08-27 21:22:03'),('c8c54e88-f3d6-4f70-96d0-f195369d49d6','8c3082bc-b34f-49aa-8591-ff5cdfd843cd','2026-08-27 21:22:03'),('c8c54e88-f3d6-4f70-96d0-f195369d49d6','ba39e984-58c8-40bb-b6ab-459b99a6c0c9','2026-08-27 21:22:03'),('c8c54e88-f3d6-4f70-96d0-f195369d49d6','be0416ba-978c-4e31-aa0b-f2fea3734ed6','2026-08-27 21:22:03'),('c8c54e88-f3d6-4f70-96d0-f195369d49d6','c09a846c-ccdd-423c-8a66-9628a3b0d98a','2026-08-27 21:22:03'),('c8c54e88-f3d6-4f70-96d0-f195369d49d6','ca95a495-1ccd-491f-97f7-74014a6a5757','2026-08-27 21:22:03'),('c8c54e88-f3d6-4f70-96d0-f195369d49d6','cdf52298-1cb1-40ea-a2d4-ce37319098c7','2026-08-27 21:22:03'),('c8c54e88-f3d6-4f70-96d0-f195369d49d6','cece875b-ebdd-46b0-83e0-c5c6e26ea245','2026-08-27 21:22:03'),('c8c54e88-f3d6-4f70-96d0-f195369d49d6','d1b398b8-edf6-4d78-bee7-d1ce0e1ab263','2026-08-27 21:22:03'),('cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','0ad1b5d1-4827-4416-8d16-2cb225ebafed','2026-10-28 21:22:03'),('cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','337895bf-6771-4963-8a61-c6d478c24524','2026-10-28 21:22:03'),('cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','3eb9ed1d-1523-438d-819f-0a1496aa49ec','2026-10-28 21:22:03'),('cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','54cd8c4f-ecce-433d-bb05-d6c70e5a744d','2026-10-28 21:22:03'),('cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','5722d865-fd7e-46ad-841f-da92b247f326','2026-10-28 21:22:03'),('cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','5c0b9d32-f8d3-454c-a8ba-bf9168d78801','2026-11-03 21:22:03'),('cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','72afaf85-ff98-476f-9290-c2926b55bfb0','2026-10-28 21:22:03'),('cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','838a60a1-8e25-4173-89d4-8731f9e68eed','2026-10-28 21:22:03'),('cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','8b29fe6c-0843-48b6-9bd5-6d981d807bb6','2026-10-28 21:22:03'),('cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','8c3082bc-b34f-49aa-8591-ff5cdfd843cd','2026-10-28 21:22:03'),('cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','ba39e984-58c8-40bb-b6ab-459b99a6c0c9','2026-10-28 21:22:03'),('cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','be0416ba-978c-4e31-aa0b-f2fea3734ed6','2026-10-28 21:22:03'),('cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','c09a846c-ccdd-423c-8a66-9628a3b0d98a','2026-10-28 21:22:03'),('cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','ca95a495-1ccd-491f-97f7-74014a6a5757','2026-10-28 21:22:03'),('cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','cdf52298-1cb1-40ea-a2d4-ce37319098c7','2026-10-28 21:22:03'),('cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','cece875b-ebdd-46b0-83e0-c5c6e26ea245','2026-10-28 21:22:03'),('cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','d1b398b8-edf6-4d78-bee7-d1ce0e1ab263','2026-10-28 21:22:03');
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
INSERT INTO `survey_responses` VALUES ('0e7fc0b8-1051-4785-8ccd-fc448efd2474','ad02ffee-a009-4c56-8ed2-361b1df83722','cece875b-ebdd-46b0-83e0-c5c6e26ea245','2026-09-28 21:22:03'),('303456a6-0038-4105-b278-c9dccf704cde','c8c54e88-f3d6-4f70-96d0-f195369d49d6','337895bf-6771-4963-8a61-c6d478c24524','2026-08-31 21:22:03'),('51e844fb-4b7f-47d9-a829-fa6cf6b4023e','c8c54e88-f3d6-4f70-96d0-f195369d49d6','3eb9ed1d-1523-438d-819f-0a1496aa49ec','2026-09-03 21:22:03'),('59ea843a-20cd-442f-aa8a-b7bf0674ccbf','49d7c824-2deb-482c-8780-1a6b0c6c0b04','0ad1b5d1-4827-4416-8d16-2cb225ebafed','2026-10-05 21:22:03'),('5dba5dc8-dfe0-469f-b32b-6a01bf255e09','c8c54e88-f3d6-4f70-96d0-f195369d49d6','8b29fe6c-0843-48b6-9bd5-6d981d807bb6','2026-08-30 21:22:03'),('6779ba9b-6eee-44e4-8995-eb2fd98820fe','ad02ffee-a009-4c56-8ed2-361b1df83722','5722d865-fd7e-46ad-841f-da92b247f326','2026-10-01 21:22:03'),('67fb719a-b8c2-4dff-a8bc-b279142b2617','ad02ffee-a009-4c56-8ed2-361b1df83722','0ad1b5d1-4827-4416-8d16-2cb225ebafed','2026-09-30 21:22:03'),('6cac7917-50fd-4114-9566-bf8a16c2c2ee','bf3c841b-5f14-4252-b049-b613df891d6e','5722d865-fd7e-46ad-841f-da92b247f326','2026-11-04 21:22:03'),('9eb7ee59-9405-4f8e-886e-50500226fbfe','c8c54e88-f3d6-4f70-96d0-f195369d49d6','cdf52298-1cb1-40ea-a2d4-ce37319098c7','2026-09-04 21:22:03'),('a77c744c-7b5d-4340-9581-78ca98a9a3c7','49d7c824-2deb-482c-8780-1a6b0c6c0b04','8b29fe6c-0843-48b6-9bd5-6d981d807bb6','2026-10-03 21:22:03'),('ab122218-219c-4f68-9f44-a63257fd4eef','2c030ff4-691a-4dfb-8261-1529b252287f','cece875b-ebdd-46b0-83e0-c5c6e26ea245','2026-10-31 21:22:03'),('ab26610e-e599-459a-be18-35dc07c89f5a','c8c54e88-f3d6-4f70-96d0-f195369d49d6','5722d865-fd7e-46ad-841f-da92b247f326','2026-09-02 21:22:03'),('c6e13157-3f95-42fc-b51c-5ff6e1143a6b','ad02ffee-a009-4c56-8ed2-361b1df83722','337895bf-6771-4963-8a61-c6d478c24524','2026-09-29 21:22:03'),('d0160c5e-2762-4884-bb2d-0e6abc74fb03','49d7c824-2deb-482c-8780-1a6b0c6c0b04','337895bf-6771-4963-8a61-c6d478c24524','2026-10-04 21:22:03'),('d46aaa87-a8ae-49ee-8ad0-3746eabefbf2','3bf7ab60-75b8-4bcc-b5a0-a6168e1b965a','cece875b-ebdd-46b0-83e0-c5c6e26ea245','2026-10-31 21:22:03'),('d5aa8fc4-592a-43aa-bf11-1355bbf20c93','c8c54e88-f3d6-4f70-96d0-f195369d49d6','d1b398b8-edf6-4d78-bee7-d1ce0e1ab263','2026-09-05 21:22:03'),('d76e16b9-7816-4d96-a686-bea4d4d3a9df','bf3c841b-5f14-4252-b049-b613df891d6e','337895bf-6771-4963-8a61-c6d478c24524','2026-11-04 21:22:03'),('dfb02b02-f342-40b4-a1a0-0f5ab8ed009a','c8c54e88-f3d6-4f70-96d0-f195369d49d6','cece875b-ebdd-46b0-83e0-c5c6e26ea245','2026-08-29 21:22:03'),('ebb27455-943d-4005-9621-225653cdb754','cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','cece875b-ebdd-46b0-83e0-c5c6e26ea245','2026-10-31 21:22:03'),('f2ed37d3-73ae-4528-848c-6f2f1fd23f2b','4db92246-b537-4b26-b1c5-bd213c62cdbd','3eb9ed1d-1523-438d-819f-0a1496aa49ec','2026-11-01 21:22:03'),('f5c57029-7ca1-40c7-b029-473230d1d6c9','c8c54e88-f3d6-4f70-96d0-f195369d49d6','0ad1b5d1-4827-4416-8d16-2cb225ebafed','2026-09-01 21:22:03');
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
INSERT INTO `surveys` VALUES ('003d44dc-3fc7-40db-8a7f-eff03a925060','[Hết hạn hôm nay] Xác nhận nhu cầu hỗ trợ','Được trả lời đến hết hôm nay theo giờ Việt Nam; tự đóng từ 00:00 ngày mai.','2026-11-04','OPEN',0,'{\"mode\": \"SELECTED\", \"filters\": {}, \"customerIds\": [\"cece875b-ebdd-46b0-83e0-c5c6e26ea245\", \"8b29fe6c-0843-48b6-9bd5-6d981d807bb6\", \"337895bf-6771-4963-8a61-c6d478c24524\"]}',NULL,0,NULL,'5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-10-27 21:22:03','2026-11-04 21:22:04'),('02383079-ef25-4204-ba4e-3c7ecbb5c6f4','Mức độ hài lòng về dịch vụ','Giúp chúng tôi cải thiện chất lượng tư vấn và chăm sóc khách hàng.','2026-12-04','OPEN',1,'{\"mode\": \"ALL\", \"filters\": {}, \"customerIds\": []}',NULL,0,NULL,'5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-10-20 21:22:03','2026-11-04 21:22:04'),('1483cb1f-da71-4f33-afde-b5d8f169d170','Khảo sát khách hàng 25–45 tuổi','Phiếu mới có phạm vi từ lúc tạo, chỉ gửi người đủ 25 đến hết 45 tuổi.','2026-11-19','OPEN',0,'{\"mode\": \"FILTER\", \"filters\": {\"maxAge\": 45, \"minAge\": 25}, \"customerIds\": []}',NULL,0,NULL,'5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-11-03 21:22:03','2026-11-04 21:22:04'),('17a2e5a5-5d7d-4753-8855-e79e75b5b6e2','[Bản nháp] Đã chọn Tất cả','Đã lưu phạm vi, có thể mở ngay từ danh sách.','2026-12-04','DRAFT',0,'{\"mode\": \"ALL\", \"filters\": {}, \"customerIds\": []}',NULL,0,NULL,'5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-11-02 21:22:03','2026-11-04 21:22:04'),('2058b251-cbce-4e8c-86ac-fa9099ed6d3b','[Bản nháp] Đã chọn từng khách','Mở lại form sẽ giữ đúng ba người đã chọn.','2026-11-18','DRAFT',0,'{\"mode\": \"SELECTED\", \"filters\": {}, \"customerIds\": [\"337895bf-6771-4963-8a61-c6d478c24524\", \"5722d865-fd7e-46ad-841f-da92b247f326\", \"72afaf85-ff98-476f-9290-c2926b55bfb0\"]}',NULL,0,NULL,'5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-11-02 21:22:03','2026-11-04 21:22:04'),('20efce9b-a835-44cb-a9fb-a8d918104114','Khảo sát chương trình chăm sóc khách hàng','Khảo sát đã đóng và chưa có câu trả lời để thử trạng thái dữ liệu rỗng.','2026-11-02','CLOSED',0,'{\"mode\": \"SELECTED\", \"filters\": {}, \"customerIds\": [\"cece875b-ebdd-46b0-83e0-c5c6e26ea245\", \"337895bf-6771-4963-8a61-c6d478c24524\", \"5722d865-fd7e-46ad-841f-da92b247f326\"]}',NULL,0,NULL,'5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-10-25 21:22:03','2026-11-04 21:22:04'),('2c030ff4-691a-4dfb-8261-1529b252287f','[Đóng thủ công] Góp ý dịch vụ thường xuyên','Không đặt ngày kết thúc. Quản lý chủ động Đóng ngay; có một bài đã gửi để kiểm tra không gửi lại.',NULL,'OPEN',1,'{\"mode\": \"ALL\", \"filters\": {}, \"customerIds\": []}',NULL,0,NULL,'5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-10-27 21:22:03','2026-11-04 21:22:04'),('3bf7ab60-75b8-4bcc-b5a0-a6168e1b965a','[Đã gia hạn] Góp ý nhóm Gaming và Đồ họa','Hạn đã được kéo dài; danh sách người nhận theo bộ lọc vẫn giữ nguyên.','2026-11-18','OPEN',0,'{\"mode\": \"FILTER\", \"filters\": {\"maxAge\": 20, \"minAge\": 15, \"interests\": [\"gaming\", \"design\"]}, \"customerIds\": []}',NULL,0,NULL,'5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-10-27 21:22:03','2026-11-04 21:22:04'),('49d7c824-2deb-482c-8780-1a6b0c6c0b04','Đánh giá trải nghiệm mua hàng tháng trước','Khảo sát đã hết hạn, dùng để xem mục quá hạn chưa trả lời.','2026-11-03','CLOSED',0,'{\"mode\": \"ALL\", \"filters\": {}, \"customerIds\": []}','2026-11-03 17:00:00',0,NULL,'5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-09-30 21:22:03','2026-11-04 21:22:04'),('4db92246-b537-4b26-b1c5-bd213c62cdbd','Khảo sát khách được chọn riêng','Chỉ ba khách đã chọn, không tự gửi khách mới hoặc khách khác.','2026-11-25','OPEN',0,'{\"mode\": \"SELECTED\", \"filters\": {}, \"customerIds\": [\"cece875b-ebdd-46b0-83e0-c5c6e26ea245\", \"3eb9ed1d-1523-438d-819f-0a1496aa49ec\", \"72afaf85-ff98-476f-9290-c2926b55bfb0\"]}',NULL,0,NULL,'5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-10-29 21:22:03','2026-11-04 21:22:04'),('ad02ffee-a009-4c56-8ed2-361b1df83722','Nhu cầu mua sắm PC và laptop','Cho chúng tôi biết dự định của bạn để gợi ý sản phẩm và ưu đãi phù hợp.','2026-12-19','OPEN',1,'{\"mode\": \"ALL\", \"filters\": {}, \"customerIds\": []}',NULL,0,NULL,'5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-09-25 21:22:03','2026-11-04 21:22:04'),('bf3c841b-5f14-4252-b049-b613df891d6e','Khảo sát Gaming/Đồ họa 15–20 tuổi','Chỉ người đủ 15 đến hết 20 tuổi và có Gaming hoặc Đồ họa được nhận.','2026-11-24','OPEN',0,'{\"mode\": \"FILTER\", \"filters\": {\"maxAge\": 20, \"minAge\": 15, \"interests\": [\"gaming\", \"design\"]}, \"customerIds\": []}',NULL,0,NULL,'5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-11-03 21:22:03','2026-11-04 21:22:04'),('c8c54e88-f3d6-4f70-96d0-f195369d49d6','Trải nghiệm bảo hành và hỗ trợ','Đánh giá về quá trình bảo hành, sửa chữa tại cửa hàng.','2026-10-28','CLOSED',0,'{\"mode\": \"ALL\", \"filters\": {}, \"customerIds\": []}',NULL,1,'2026-11-03 21:22:03','5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-08-26 21:22:03','2026-11-04 21:22:04'),('cec70382-5b3d-4ca8-96f1-6ef71aca0d5a','[Đã mở lại] Đánh giá hỗ trợ sau mua','Đã đóng rồi mở lại; giữ bài đã gửi và bổ sung khách mới thuộc phạm vi Tất cả.','2026-11-14','OPEN',1,'{\"mode\": \"ALL\", \"filters\": {}, \"customerIds\": []}',NULL,0,NULL,'5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-10-27 21:22:03','2026-11-04 21:22:04'),('dde4395a-8295-46b6-b14c-341ab4dcc16d','[Bản nháp] Chưa thiết lập phạm vi','Thử nút mở bị chặn cho đến khi chọn phạm vi.',NULL,'DRAFT',0,NULL,NULL,0,NULL,'5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-11-03 21:22:03','2026-11-04 21:22:04'),('eaeb8159-0055-4454-a8a4-9774de7c1180','Khảo sát ý tưởng ưu đãi thành viên','Bản nháp để thử chỉnh sửa toàn bộ câu hỏi trước khi gửi.',NULL,'DRAFT',0,'{\"mode\": \"FILTER\", \"filters\": {\"maxAge\": 20, \"minAge\": 15, \"interests\": [\"gaming\", \"design\"]}, \"customerIds\": []}',NULL,0,NULL,'5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','2026-11-02 21:22:03','2026-11-04 21:22:04');
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
INSERT INTO `users` VALUES ('0ad1b5d1-4827-4416-8d16-2cb225ebafed','khach4@demo.vn','$2b$12$fVXQ3d8UsqwuOEj56jglIuHOTcruTWh09ZF0pDNv7KReI4L3XiUYe',0,'CUSTOMER','ACTIVE','Phạm Gia Huy (Demo)','0910000004','Địa chỉ giả lập 4, khu dân cư Demo, TP.HCM',2010,'2010-11-04','Nữ','Chưa xác định','2026-06-05 21:22:03','2026-11-04 21:22:04'),('30f8c7ee-0f6f-4138-bd0c-01f755599e5c','admin@backline.vn','$2b$12$5iI/BbPU4DtZBNBfSFU3ZuihhoqHIsCQUVyXi/MX//XygANhp8HAC',0,'ADMIN','ACTIVE','Quản trị viên Demo','0900000000','Văn phòng demo',1990,'1990-01-15','Khác','Chưa xác định','2026-04-18 21:22:03','2026-11-04 21:22:04'),('337895bf-6771-4963-8a61-c6d478c24524','khach3@demo.vn','$2b$12$fVXQ3d8UsqwuOEj56jglIuHOTcruTWh09ZF0pDNv7KReI4L3XiUYe',0,'CUSTOMER','ACTIVE','Lê Thu Hà (Demo)','0910000003','Địa chỉ giả lập 3, khu dân cư Demo, TP.HCM',2011,'2011-11-04','Khác','Văn phòng','2026-05-30 21:22:03','2026-11-04 21:22:04'),('3eb9ed1d-1523-438d-819f-0a1496aa49ec','khach6@demo.vn','$2b$12$fVXQ3d8UsqwuOEj56jglIuHOTcruTWh09ZF0pDNv7KReI4L3XiUYe',0,'CUSTOMER','ACTIVE','Đặng Quốc Bảo (Demo)','0910000006','Địa chỉ giả lập 6, khu dân cư Demo, TP.HCM',2006,'2006-11-04','Khác','Đồ họa','2026-06-17 21:22:03','2026-11-04 21:22:04'),('54cd8c4f-ecce-433d-bb05-d6c70e5a744d','khach9@demo.vn','$2b$12$fVXQ3d8UsqwuOEj56jglIuHOTcruTWh09ZF0pDNv7KReI4L3XiUYe',0,'CUSTOMER','ACTIVE','Hồ Bảo Ngọc (Demo)','0910000009','Địa chỉ giả lập 9, khu dân cư Demo, TP.HCM',2001,'2001-11-04','Khác','Gaming','2026-07-05 21:22:03','2026-11-04 21:22:04'),('5722d865-fd7e-46ad-841f-da92b247f326','khach5@demo.vn','$2b$12$fVXQ3d8UsqwuOEj56jglIuHOTcruTWh09ZF0pDNv7KReI4L3XiUYe',0,'CUSTOMER','ACTIVE','Võ Ngọc Lan (Demo)','0910000005','Địa chỉ giả lập 5, khu dân cư Demo, TP.HCM',2009,'2009-11-04','Nam','Gaming','2026-06-11 21:22:03','2026-11-04 21:22:04'),('5c0b9d32-f8d3-454c-a8ba-bf9168d78801','khach18@demo.vn','$2b$12$fVXQ3d8UsqwuOEj56jglIuHOTcruTWh09ZF0pDNv7KReI4L3XiUYe',0,'CUSTOMER','ACTIVE','Lâm Gia Bảo (Demo)','0910000018','Địa chỉ giả lập 18, khu dân cư Demo, TP.HCM',2002,'2002-11-04','Khác','Đồ họa','2026-11-03 21:22:03','2026-11-04 21:22:04'),('5cfbdb63-e9a2-49d5-8a52-4da51dcaaf78','manager@demo.vn','$2b$12$ZwbE6lAVcsA1xZNWy3AF4OCqfcYj64mwmIPujQhXJYF5gHKK/s0Ra',0,'MANAGER','ACTIVE','Quản lý Demo','0900000001','Văn phòng demo',1990,'1990-01-15','Khác','Chưa xác định','2026-04-18 21:22:03','2026-11-04 21:22:04'),('72afaf85-ff98-476f-9290-c2926b55bfb0','khach14@demo.vn','$2b$12$fVXQ3d8UsqwuOEj56jglIuHOTcruTWh09ZF0pDNv7KReI4L3XiUYe',0,'CUSTOMER','ACTIVE','Trịnh Ngọc Ánh (Demo)','0910000014','Địa chỉ giả lập 14, khu dân cư Demo, TP.HCM',2007,'2007-11-04','Nam','Đồ họa','2026-08-04 21:22:03','2026-11-04 21:22:04'),('838a60a1-8e25-4173-89d4-8731f9e68eed','khach10@demo.vn','$2b$12$fVXQ3d8UsqwuOEj56jglIuHOTcruTWh09ZF0pDNv7KReI4L3XiUYe',0,'CUSTOMER','ACTIVE','Ngô Tuấn Kiệt (Demo)','0910000010','Địa chỉ giả lập 10, khu dân cư Demo, TP.HCM',1991,'1991-11-04','Nữ','Đồ họa','2026-07-11 21:22:03','2026-11-04 21:22:04'),('85761216-056b-4339-abb7-e5dba68f7d37','khach11@demo.vn','$2b$12$fVXQ3d8UsqwuOEj56jglIuHOTcruTWh09ZF0pDNv7KReI4L3XiUYe',0,'CUSTOMER','LOCKED','Dương Thảo Vy (Demo)','0910000011','Địa chỉ giả lập 11, khu dân cư Demo, TP.HCM',2007,'2007-11-04','Nam','Văn phòng','2026-07-17 21:22:03','2026-11-04 21:22:04'),('8b29fe6c-0843-48b6-9bd5-6d981d807bb6','khach2@demo.vn','$2b$12$fVXQ3d8UsqwuOEj56jglIuHOTcruTWh09ZF0pDNv7KReI4L3XiUYe',0,'CUSTOMER','ACTIVE','Trần Hoàng Nam (Demo)','0910000002','Địa chỉ giả lập 2, khu dân cư Demo, TP.HCM',2011,'2011-11-05','Nam','Đồ họa','2026-05-24 21:22:03','2026-11-04 21:22:04'),('8c3082bc-b34f-49aa-8591-ff5cdfd843cd','khach17@demo.vn','$2b$12$fVXQ3d8UsqwuOEj56jglIuHOTcruTWh09ZF0pDNv7KReI4L3XiUYe',0,'CUSTOMER','ACTIVE','Vũ Thảo Nguyên (Demo)','0910000017','Địa chỉ giả lập 17, khu dân cư Demo, TP.HCM',NULL,NULL,'Nam','Gaming','2026-08-22 21:22:03','2026-11-04 21:22:04'),('9540662e-e433-40bb-b52d-c811d855c1d0','manager2@demo.vn','$2b$12$ZwbE6lAVcsA1xZNWy3AF4OCqfcYj64mwmIPujQhXJYF5gHKK/s0Ra',0,'MANAGER','ACTIVE','Quản lý hỗ trợ Demo','0900000002','Văn phòng demo',1990,'1990-01-15','Khác','Chưa xác định','2026-04-18 21:22:03','2026-11-04 21:22:04'),('ba39e984-58c8-40bb-b6ab-459b99a6c0c9','khach12@demo.vn','$2b$12$fVXQ3d8UsqwuOEj56jglIuHOTcruTWh09ZF0pDNv7KReI4L3XiUYe',0,'CUSTOMER','ACTIVE','Đinh Văn An (Demo)','0910000012','',1999,'1999-11-04','Khác','Chưa xác định','2026-07-23 21:22:03','2026-11-04 21:22:04'),('be0416ba-978c-4e31-aa0b-f2fea3734ed6','khach13@demo.vn','$2b$12$fVXQ3d8UsqwuOEj56jglIuHOTcruTWh09ZF0pDNv7KReI4L3XiUYe',0,'CUSTOMER','ACTIVE','Phan Nhật Huy (Demo)','0910000013','Địa chỉ giả lập 13, khu dân cư Demo, TP.HCM',2010,'2010-11-04','Nữ','Gaming','2026-07-29 21:22:03','2026-11-04 21:22:04'),('c09a846c-ccdd-423c-8a66-9628a3b0d98a','khach16@demo.vn','$2b$12$fVXQ3d8UsqwuOEj56jglIuHOTcruTWh09ZF0pDNv7KReI4L3XiUYe',0,'CUSTOMER','ACTIVE','Trần Minh Châu (Demo)','0910000016','Địa chỉ giả lập 16, khu dân cư Demo, TP.HCM',1974,'1974-11-04','Nữ','Chưa xác định','2026-08-16 21:22:03','2026-11-04 21:22:04'),('ca95a495-1ccd-491f-97f7-74014a6a5757','khach15@demo.vn','$2b$12$fVXQ3d8UsqwuOEj56jglIuHOTcruTWh09ZF0pDNv7KReI4L3XiUYe',0,'CUSTOMER','ACTIVE','Nguyễn Hải Đăng (Demo)','0910000015','Địa chỉ giả lập 15, khu dân cư Demo, TP.HCM',1981,'1981-11-04','Khác','Văn phòng','2026-08-10 21:22:03','2026-11-04 21:22:04'),('cdf52298-1cb1-40ea-a2d4-ce37319098c7','khach7@demo.vn','$2b$12$fVXQ3d8UsqwuOEj56jglIuHOTcruTWh09ZF0pDNv7KReI4L3XiUYe',0,'CUSTOMER','ACTIVE','Bùi Thanh Mai (Demo)','0910000007','Địa chỉ giả lập 7, khu dân cư Demo, TP.HCM',2005,'2005-11-05','Nữ','Văn phòng','2026-06-23 21:22:03','2026-11-04 21:22:04'),('cece875b-ebdd-46b0-83e0-c5c6e26ea245','khach@demo.vn','$2b$12$fVXQ3d8UsqwuOEj56jglIuHOTcruTWh09ZF0pDNv7KReI4L3XiUYe',0,'CUSTOMER','ACTIVE','Nguyễn Minh Anh (Demo)','0901234567','Địa chỉ giả lập 1, khu dân cư Demo, TP.HCM',2008,'2008-11-04','Nữ','Gaming','2026-05-18 21:22:03','2026-11-04 21:22:04'),('d1b398b8-edf6-4d78-bee7-d1ce0e1ab263','khach8@demo.vn','$2b$12$fVXQ3d8UsqwuOEj56jglIuHOTcruTWh09ZF0pDNv7KReI4L3XiUYe',0,'CUSTOMER','ACTIVE','Đỗ Đức Minh (Demo)','0910000008','Địa chỉ giả lập 8, khu dân cư Demo, TP.HCM',2005,'2005-11-04','Nam','Chưa xác định','2026-06-29 21:22:03','2026-11-04 21:22:04');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'backline_crm_demo_v3_20261104142202_a80363'
--

--
-- Dumping routines for database 'backline_crm_demo_v3_20261104142202_a80363'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-04 21:22:04

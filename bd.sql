-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: proyecto_final_sl
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alertas_cadena_frio`
--

DROP TABLE IF EXISTS `alertas_cadena_frio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alertas_cadena_frio` (
  `id_alerta` int NOT NULL AUTO_INCREMENT,
  `id_medicion` bigint DEFAULT NULL,
  `id_lote` int DEFAULT NULL,
  `tipo_alerta` enum('Máx. Excedida','Mín. Violada') NOT NULL,
  `fecha_alerta` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('Activa','Resuelta','Desechado') DEFAULT 'Activa',
  PRIMARY KEY (`id_alerta`),
  KEY `id_medicion` (`id_medicion`),
  KEY `id_lote` (`id_lote`),
  CONSTRAINT `alertas_cadena_frio_ibfk_1` FOREIGN KEY (`id_medicion`) REFERENCES `mediciones_temp` (`id_medicion`),
  CONSTRAINT `alertas_cadena_frio_ibfk_2` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id_lote`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alertas_cadena_frio`
--

LOCK TABLES `alertas_cadena_frio` WRITE;
/*!40000 ALTER TABLE `alertas_cadena_frio` DISABLE KEYS */;
INSERT INTO `alertas_cadena_frio` VALUES (1,2,2,'Máx. Excedida','2025-12-12 07:19:15','Activa'),(2,3,1,'Máx. Excedida','2025-12-12 09:25:08','Activa');
/*!40000 ALTER TABLE `alertas_cadena_frio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario_stock`
--

DROP TABLE IF EXISTS `inventario_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario_stock` (
  `id_inventario` int NOT NULL AUTO_INCREMENT,
  `id_lote` int DEFAULT NULL,
  `id_ubicacion` int DEFAULT NULL,
  `cantidad_actual` int NOT NULL,
  `fecha_ultima_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_inventario`),
  UNIQUE KEY `uk_lote_ubicacion` (`id_lote`,`id_ubicacion`),
  KEY `id_ubicacion` (`id_ubicacion`),
  CONSTRAINT `inventario_stock_ibfk_1` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id_lote`),
  CONSTRAINT `inventario_stock_ibfk_2` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicaciones` (`id_ubicacion`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario_stock`
--

LOCK TABLES `inventario_stock` WRITE;
/*!40000 ALTER TABLE `inventario_stock` DISABLE KEYS */;
INSERT INTO `inventario_stock` VALUES (1,1,1,5000,'2025-12-12 07:19:15'),(2,2,1,10000,'2025-12-12 07:19:15');
/*!40000 ALTER TABLE `inventario_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lotes`
--

DROP TABLE IF EXISTS `lotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lotes` (
  `id_lote` int NOT NULL AUTO_INCREMENT,
  `id_vacuna` int DEFAULT NULL,
  `fecha_fabricacion` date NOT NULL,
  `fecha_caducidad` date NOT NULL,
  `cantidad_inicial_unidades` int NOT NULL,
  PRIMARY KEY (`id_lote`),
  KEY `id_vacuna` (`id_vacuna`),
  CONSTRAINT `lotes_ibfk_1` FOREIGN KEY (`id_vacuna`) REFERENCES `vacunas` (`id_vacuna`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lotes`
--

LOCK TABLES `lotes` WRITE;
/*!40000 ALTER TABLE `lotes` DISABLE KEYS */;
INSERT INTO `lotes` VALUES (1,1,'2025-10-01','2026-04-01',5000),(2,2,'2025-11-20','2026-11-20',10000);
/*!40000 ALTER TABLE `lotes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mediciones_temp`
--

DROP TABLE IF EXISTS `mediciones_temp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mediciones_temp` (
  `id_medicion` bigint NOT NULL AUTO_INCREMENT,
  `id_sensor` int DEFAULT NULL,
  `id_lote` int DEFAULT NULL,
  `temperatura_c` decimal(5,2) NOT NULL,
  `timestamp_medicion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_medicion`),
  KEY `id_sensor` (`id_sensor`),
  KEY `id_lote` (`id_lote`),
  CONSTRAINT `mediciones_temp_ibfk_1` FOREIGN KEY (`id_sensor`) REFERENCES `sensores_temp` (`id_sensor`),
  CONSTRAINT `mediciones_temp_ibfk_2` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id_lote`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mediciones_temp`
--

LOCK TABLES `mediciones_temp` WRITE;
/*!40000 ALTER TABLE `mediciones_temp` DISABLE KEYS */;
INSERT INTO `mediciones_temp` VALUES (1,2,2,4.50,'2025-12-12 07:19:15'),(2,2,2,9.10,'2025-12-12 07:19:15'),(3,1,1,15.00,'2025-12-12 09:25:07');
/*!40000 ALTER TABLE `mediciones_temp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registro_movimiento`
--

DROP TABLE IF EXISTS `registro_movimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registro_movimiento` (
  `id_movimiento` int NOT NULL AUTO_INCREMENT,
  `id_lote` int DEFAULT NULL,
  `ubicacion_origen` int DEFAULT NULL,
  `ubicacion_destino` int DEFAULT NULL,
  `id_transportista` int DEFAULT NULL,
  `fecha_envio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_recepcion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_movimiento`),
  KEY `id_lote` (`id_lote`),
  KEY `ubicacion_origen` (`ubicacion_origen`),
  KEY `ubicacion_destino` (`ubicacion_destino`),
  KEY `id_transportista` (`id_transportista`),
  CONSTRAINT `registro_movimiento_ibfk_1` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id_lote`),
  CONSTRAINT `registro_movimiento_ibfk_2` FOREIGN KEY (`ubicacion_origen`) REFERENCES `ubicaciones` (`id_ubicacion`),
  CONSTRAINT `registro_movimiento_ibfk_3` FOREIGN KEY (`ubicacion_destino`) REFERENCES `ubicaciones` (`id_ubicacion`),
  CONSTRAINT `registro_movimiento_ibfk_4` FOREIGN KEY (`id_transportista`) REFERENCES `transportistas` (`id_transportista`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registro_movimiento`
--

LOCK TABLES `registro_movimiento` WRITE;
/*!40000 ALTER TABLE `registro_movimiento` DISABLE KEYS */;
INSERT INTO `registro_movimiento` VALUES (1,2,1,2,1,'2025-12-10 15:00:00','2025-12-12 15:30:00');
/*!40000 ALTER TABLE `registro_movimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sensores_temp`
--

DROP TABLE IF EXISTS `sensores_temp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sensores_temp` (
  `id_sensor` int NOT NULL AUTO_INCREMENT,
  `codigo_serie` varchar(100) NOT NULL,
  `id_ubicacion_actual` int DEFAULT NULL,
  `ultima_calibracion` date DEFAULT NULL,
  PRIMARY KEY (`id_sensor`),
  UNIQUE KEY `codigo_serie` (`codigo_serie`),
  KEY `id_ubicacion_actual` (`id_ubicacion_actual`),
  CONSTRAINT `sensores_temp_ibfk_1` FOREIGN KEY (`id_ubicacion_actual`) REFERENCES `ubicaciones` (`id_ubicacion`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sensores_temp`
--

LOCK TABLES `sensores_temp` WRITE;
/*!40000 ALTER TABLE `sensores_temp` DISABLE KEYS */;
INSERT INTO `sensores_temp` VALUES (1,'S-001A-ULTRA',1,'2025-12-01'),(2,'S-002B-STD',2,'2025-11-15');
/*!40000 ALTER TABLE `sensores_temp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transportistas`
--

DROP TABLE IF EXISTS `transportistas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transportistas` (
  `id_transportista` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `licencia` varchar(50) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `tipo_vehiculo` enum('Camión Refrigerado','Avión','Furgoneta') DEFAULT NULL,
  PRIMARY KEY (`id_transportista`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transportistas`
--

LOCK TABLES `transportistas` WRITE;
/*!40000 ALTER TABLE `transportistas` DISABLE KEYS */;
INSERT INTO `transportistas` VALUES (1,'Logística Fría Andes','T-45678',NULL,'Camión Refrigerado');
/*!40000 ALTER TABLE `transportistas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ubicaciones`
--

DROP TABLE IF EXISTS `ubicaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ubicaciones` (
  `id_ubicacion` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `tipo` enum('Almacén Central','Distribuidor','Centro de Salud') NOT NULL,
  `distrito` varchar(50) DEFAULT NULL,
  `provincia` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_ubicacion`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicaciones`
--

LOCK TABLES `ubicaciones` WRITE;
/*!40000 ALTER TABLE `ubicaciones` DISABLE KEYS */;
INSERT INTO `ubicaciones` VALUES (1,'Almacén Nacional','Almacén Central','Lima','Lima'),(2,'Distribuidor Pucallpa','Distribuidor','Callería','Coronel Portillo'),(3,'CS Luz y Vida','Centro de Salud','Iparía','Ucayali');
/*!40000 ALTER TABLE `ubicaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `picture` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `is_google_account` tinyint(1) DEFAULT NULL,
  `rol` enum('admin','usuario') DEFAULT 'usuario',
  `activo` tinyint(1) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT NULL,
  `ultima_conexion` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (21,'Ricardo Yanhua','https://lh3.googleusercontent.com/a/ACg8ocIWVwmUV3vgZAgDH5BacVh5LlcJoE007Dmq4aOgbCY-5WRBeA=s96-c','ricardoyanhua@gmail.com','$2b$10$EoLduCITtLMaixPqMB5.i.j7tCJZfH7uQEKRfLNDx78G5u9XeqKWK',1,'usuario',1,NULL,'2025-12-25 04:38:57'),(22,'asdasdasd',NULL,'ricardoyanhua@gmail.com','$2b$10$6wf.tQxVnodaJ0kAoc9xvekPC6RZHP72I0rACmOKv1wckOArl02Vi',0,'usuario',1,NULL,'2025-12-25 05:38:28'),(23,'qweqweqwe',NULL,'qweqweqwe@qweqweqwe.com','$2b$10$qfhLyeP0qBawnEEB91OPUOnSAfcN/lnQUpmYEIwN1ui6igFG4l6ie',0,'usuario',1,NULL,'2025-12-25 06:03:52'),(24,'zxczxczxc',NULL,'zxczxczxc@zxczxczxc.com','$2b$10$armQCmkiYEYfJzHnR2keRu6RA.Xr50HvZAP5pggz6fncHECVDujnW',0,'usuario',1,NULL,'2025-12-25 06:05:47'),(25,'rtyrtyrty',NULL,'rtyrtyrty@gmail.com','$2b$10$x.GHMUicw7s2d4NUhFfkI.kyL/84nV56eQNcFI9Mi1PbpC4Dem.oq',0,'usuario',1,NULL,'2025-12-25 06:09:18'),(26,'dfgdfgdfg',NULL,'dfgdfgdfg@dfgdfgdfg.com','$2b$10$w0waNRTDFN3qNWwyWVEHGugcuIfTFbUWb7pbQyg21A2WtdGE/otXu',0,'usuario',1,NULL,'2025-12-25 11:41:13');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vacunas`
--

DROP TABLE IF EXISTS `vacunas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vacunas` (
  `id_vacuna` int NOT NULL AUTO_INCREMENT,
  `nombre_comercial` varchar(100) NOT NULL,
  `fabricante` varchar(100) DEFAULT NULL,
  `temp_min_c` decimal(4,2) NOT NULL,
  `temp_max_c` decimal(4,2) NOT NULL,
  PRIMARY KEY (`id_vacuna`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vacunas`
--

LOCK TABLES `vacunas` WRITE;
/*!40000 ALTER TABLE `vacunas` DISABLE KEYS */;
INSERT INTO `vacunas` VALUES (1,'Bio-R COVID','Globopharm',-70.00,-60.00),(2,'Flu-Vax Plus','VaxCorp',2.00,8.00);
/*!40000 ALTER TABLE `vacunas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-25  6:42:35

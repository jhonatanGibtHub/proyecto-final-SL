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
  `tipo_alerta` enum('Máx. Excedida','Estable','Mín. Violada') NOT NULL,
  `fecha_alerta` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('Activa','Resuelta','Desechado') DEFAULT 'Activa',
  PRIMARY KEY (`id_alerta`),
  KEY `id_medicion` (`id_medicion`),
  KEY `id_lote` (`id_lote`),
  CONSTRAINT `alertas_cadena_frio_ibfk_1` FOREIGN KEY (`id_medicion`) REFERENCES `mediciones_temp` (`id_medicion`),
  CONSTRAINT `alertas_cadena_frio_ibfk_2` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id_lote`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alertas_cadena_frio`
--

LOCK TABLES `alertas_cadena_frio` WRITE;
/*!40000 ALTER TABLE `alertas_cadena_frio` DISABLE KEYS */;
INSERT INTO `alertas_cadena_frio` VALUES (8,12,6,'Estable','2026-01-09 20:54:36','Resuelta'),(9,3,1,'Estable','2026-01-09 21:16:38','Resuelta'),(10,4,2,'Estable','2026-01-09 21:30:27','Resuelta');
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
  `id_vacuna` int DEFAULT NULL,
  `id_ubicacion` int DEFAULT NULL,
  `cantidad_actual` int NOT NULL,
  `fecha_ultima_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_inventario`),
  KEY `id_ubicacion` (`id_ubicacion`),
  KEY `inventario_stock_ibfk_1_idx` (`id_vacuna`),
  CONSTRAINT `inventario_stock_ibfk_1` FOREIGN KEY (`id_vacuna`) REFERENCES `vacunas` (`id_vacuna`),
  CONSTRAINT `inventario_stock_ibfk_2` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicaciones` (`id_ubicacion`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario_stock`
--

LOCK TABLES `inventario_stock` WRITE;
/*!40000 ALTER TABLE `inventario_stock` DISABLE KEYS */;
INSERT INTO `inventario_stock` VALUES (8,1,20,100,'2026-01-04 07:43:04'),(11,2,20,300,'2026-01-04 07:43:04'),(12,27,20,500,'2026-01-04 07:48:18'),(13,1,24,500,'2026-01-04 10:27:44'),(14,1,25,4200,'2026-01-09 20:55:42');
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lotes`
--

LOCK TABLES `lotes` WRITE;
/*!40000 ALTER TABLE `lotes` DISABLE KEYS */;
INSERT INTO `lotes` VALUES (1,1,'2025-10-01','2026-04-01',700),(2,2,'2025-11-20','2026-11-20',400),(3,2,'2026-01-03','2026-01-10',0),(4,1,'2026-01-14','2026-01-31',0),(5,1,'2026-01-08','2026-01-23',0),(6,1,'2026-01-03','2026-01-23',0),(7,30,'2026-01-04','2026-01-14',400),(8,28,'2026-01-05','2026-01-16',1212),(9,1,'2026-01-01','2026-01-09',500);
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mediciones_temp`
--

LOCK TABLES `mediciones_temp` WRITE;
/*!40000 ALTER TABLE `mediciones_temp` DISABLE KEYS */;
INSERT INTO `mediciones_temp` VALUES (3,1,1,21.38,'2025-12-12 14:25:07'),(4,1,2,-24.45,'2025-12-27 06:37:34'),(11,1,5,4.64,'2026-01-04 08:28:53'),(12,1,6,39.80,'2026-01-04 10:41:28'),(13,2,7,23.00,'2026-01-09 18:53:09');
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
  `fecha_envio` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_recepcion` datetime DEFAULT NULL,
  `estado` enum('ACTIVO','ANULADO','COMPLETADO') NOT NULL DEFAULT 'ACTIVO',
  PRIMARY KEY (`id_movimiento`),
  KEY `id_lote` (`id_lote`),
  KEY `ubicacion_origen` (`ubicacion_origen`),
  KEY `ubicacion_destino` (`ubicacion_destino`),
  KEY `id_transportista` (`id_transportista`),
  CONSTRAINT `registro_movimiento_ibfk_1` FOREIGN KEY (`id_lote`) REFERENCES `lotes` (`id_lote`),
  CONSTRAINT `registro_movimiento_ibfk_2` FOREIGN KEY (`ubicacion_origen`) REFERENCES `ubicaciones` (`id_ubicacion`),
  CONSTRAINT `registro_movimiento_ibfk_3` FOREIGN KEY (`ubicacion_destino`) REFERENCES `ubicaciones` (`id_ubicacion`),
  CONSTRAINT `registro_movimiento_ibfk_4` FOREIGN KEY (`id_transportista`) REFERENCES `transportistas` (`id_transportista`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registro_movimiento`
--

LOCK TABLES `registro_movimiento` WRITE;
/*!40000 ALTER TABLE `registro_movimiento` DISABLE KEYS */;
INSERT INTO `registro_movimiento` VALUES (30,7,17,24,11,'2026-01-07 01:40:04',NULL,'ANULADO'),(31,8,22,25,1,'2026-01-09 14:15:25','2026-01-09 14:53:20','COMPLETADO'),(32,6,22,25,12,'2026-01-09 15:54:27','2026-01-09 15:55:43','COMPLETADO'),(33,1,17,24,1,'2026-01-08 16:16:24',NULL,'ACTIVO'),(34,2,22,20,1,'2026-01-09 16:17:22',NULL,'ACTIVO');
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sensores_temp`
--

LOCK TABLES `sensores_temp` WRITE;
/*!40000 ALTER TABLE `sensores_temp` DISABLE KEYS */;
INSERT INTO `sensores_temp` VALUES (1,'S-001A-ULTRA',17,'2025-12-01'),(2,'S-002B-STD',20,'2025-11-15');
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
  `tipo_vehiculo` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_transportista`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transportistas`
--

LOCK TABLES `transportistas` WRITE;
/*!40000 ALTER TABLE `transportistas` DISABLE KEYS */;
INSERT INTO `transportistas` VALUES (1,'Logística Fría Andes','T-45678','698234561','Camión Refrigerado'),(10,'Laura González Ruiz','T-15947','698234561','Furgoneta'),(11,'José Ramírez Flores','T-91854','745612389','Camión Plataforma'),(12,'Valentina Cruz Molina','T-57023','701928456','Tráiler'),(13,'Fernando Castillo Ríos','T-69108','756123984','Camión Cisterna');
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
  `tipo` varchar(50) NOT NULL,
  `distrito` varchar(50) DEFAULT NULL,
  `provincia` varchar(50) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `latitud` decimal(10,7) DEFAULT NULL,
  `longitud` decimal(10,7) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `ciudad` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_ubicacion`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicaciones`
--

LOCK TABLES `ubicaciones` WRITE;
/*!40000 ALTER TABLE `ubicaciones` DISABLE KEYS */;
INSERT INTO `ubicaciones` VALUES (17,'Almacén Nacional','Distribuidor',NULL,'Lima Metropolitana','Avenida Abancay 500',-12.0507188,-77.0279288,'Lima','Lima'),(20,'Inkafarma Pucallpa','Centro de Salud','Fray Martín','Ucayali','Av. Bellavista 775',-8.3851351,-74.5481689,'Ucayali','Pucallpa'),(22,'Lima central botica','Distribuidor','Surquillo','Lima Metropolitana','Av. Manuel Villarán 1199',-12.1200903,-76.9986136,'Lima','Lima'),(24,'Hospital Cusco','Hospital Pediátrico','Cusco','Cusco','Av. Micaela Bastidas 637',-12.5245047,-73.8210370,'Cusco','Cusco'),(25,'Botica Santa Maria','Centro de Salud','Zapallal','Lima Metropolitana','Calle Santa María',-11.8434794,-77.0974713,'Lima','Lima'),(26,'Plaza Vea ','Laboratorio Clínico','Independencia','Lima Metropolitana','Independencia 15311',-11.9919461,-77.0503721,'Lima','Lima'),(27,'Iglesia de Lima','Centro de Rehabilitación','San Juan de Miraflores','Lima Metropolitana','Av. Víctor Castro Iglesias 297',-12.1702638,-76.9609322,'Lima','Lima');
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
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (30,'Jhonatan Jumpa',NULL,'jhonatan@gmail.com','$2b$10$GPQIdsGDJaaoNVxZk8SoB.Kke8uvEY5XJ4hiUEPV0yAOGhz5P6kLy',0,'admin',1,NULL,'2026-01-04 12:04:49'),(31,'jhonatan',NULL,'jhonatancito0015@gmail.com','$2b$10$1I8J0oPu.Nnd0nLGSv70nOtoAqPg7qObC3FLUf2reQTGg/Sy8srMK',0,'usuario',1,NULL,'2026-01-08 06:24:20'),(32,'Ricardo',NULL,'ricardoyanhua@gmail.com','$2b$10$C06kMEkq1WmSogJqj82F8OQu2hdOEqSqCPbSTAlafKLj6PkKaU9tO',0,'admin',1,NULL,'2026-01-09 21:46:58');
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
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vacunas`
--

LOCK TABLES `vacunas` WRITE;
/*!40000 ALTER TABLE `vacunas` DISABLE KEYS */;
INSERT INTO `vacunas` VALUES (1,'Bio-R COV','Globopharm',-46.00,89.00),(2,'Flu-Vax Plus','VaxCorp',-79.00,54.00),(27,'Hepatitis B','GlaxoSmithKline (Engerix-B)',-50.00,63.00),(28,'MMR','GlaxoSmithKline',-50.00,50.00),(29,'Polio (IPV)','Sanofi Pasteur',-50.00,52.00),(30,'Rotavirus','Merck',-50.00,-10.00),(31,'Influenza','Sanofi Pasteur',-86.00,-50.00);
/*!40000 ALTER TABLE `vacunas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'proyecto_final_sl'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-09 17:40:13

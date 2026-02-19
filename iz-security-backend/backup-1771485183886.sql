/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: cart
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 104 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: orders
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `products` text NOT NULL,
  `total_amount` decimal(10, 2) NOT NULL,
  `order_status` varchar(50) DEFAULT 'Pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int DEFAULT NULL,
  `cancel_reason` varchar(255) DEFAULT NULL,
  `payment_method` varchar(20) DEFAULT NULL,
  `payment_status` varchar(20) DEFAULT NULL,
  `delivery_otp` varchar(6) DEFAULT NULL,
  `otp_verified` tinyint(1) DEFAULT '0',
  `invoice_pdf` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_order` (`user_id`),
  CONSTRAINT `fk_user_order` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: products
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(500) NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `stock` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `image` text,
  `description` text,
  `original_price` decimal(10, 2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 26 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# SCHEMA DUMP FOR TABLE: users
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `role` enum('admin', 'customer') DEFAULT 'customer',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: cart
# ------------------------------------------------------------


# ------------------------------------------------------------
# DATA DUMP FOR TABLE: orders
# ------------------------------------------------------------

INSERT INTO
  `orders` (
    `id`,
    `customer_name`,
    `phone`,
    `address`,
    `products`,
    `total_amount`,
    `order_status`,
    `created_at`,
    `user_id`,
    `cancel_reason`,
    `payment_method`,
    `payment_status`,
    `delivery_otp`,
    `otp_verified`,
    `invoice_pdf`
  )
VALUES
  (
    1,
    'Nehan Shaikh',
    '7795131735',
    'Kudroli, Mangalore',
    '3MP 4G LTE Outdoor Bullet Camera (V380 App) x2\n4G Solar Waterproof PTZ Camera (8W Panel, 8000mAh) x1',
    17228.00,
    'Delivered',
    '2026-02-18 18:15:27',
    2,
    NULL,
    'COD',
    'Pending',
    '473429',
    1,
    'https://res.cloudinary.com/dmdzytvbn/raw/upload/v1771438923/invoices/exv148xmwk5ctkenovnj.pdf'
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: products
# ------------------------------------------------------------

INSERT INTO
  `products` (
    `id`,
    `name`,
    `price`,
    `stock`,
    `created_at`,
    `image`,
    `description`,
    `original_price`
  )
VALUES
  (
    9,
    '4G/3G Solar PTZ Outdoor Camera (Dual Lens)',
    7670.00,
    10,
    '2026-02-13 14:32:44',
    'https://res.cloudinary.com/dmdzytvbn/image/upload/v1771433611/products/tqnsfkszlkess6j53vlh.png',
    'Description: Outdoor security camera with solar panel, 4G/3G SIM support, dual lens system, night vision, and built-in rechargeable battery. Ideal for farms and remote areas.',
    6500.00
  );
INSERT INTO
  `products` (
    `id`,
    `name`,
    `price`,
    `stock`,
    `created_at`,
    `image`,
    `description`,
    `original_price`
  )
VALUES
  (
    18,
    '5MP Ultra HD WiFi PTZ Indoor Camera',
    2596.00,
    15,
    '2026-02-14 14:17:00',
    'https://res.cloudinary.com/dmdzytvbn/image/upload/v1771433571/products/rldym3anf7aq8bg9b0mj.png',
    'Description: 360° rotation indoor security camera with 5MP resolution, night vision, two-way audio, human detection, and mobile app support.',
    2200.00
  );
INSERT INTO
  `products` (
    `id`,
    `name`,
    `price`,
    `stock`,
    `created_at`,
    `image`,
    `description`,
    `original_price`
  )
VALUES
  (
    22,
    '4G Solar Waterproof PTZ Camera (8W Panel, 8000mAh)',
    8260.00,
    20,
    '2026-02-18 15:53:12',
    'https://res.cloudinary.com/dmdzytvbn/image/upload/v1771433647/products/lkdc9cdsgvqit7r2nstv.png',
    'Description: IP66 waterproof solar-powered 4G camera with motion detection (PIR), night vision LEDs, and 8000mAh battery backup.',
    7000.00
  );
INSERT INTO
  `products` (
    `id`,
    `name`,
    `price`,
    `stock`,
    `created_at`,
    `image`,
    `description`,
    `original_price`
  )
VALUES
  (
    23,
    '3MP 4G LTE Outdoor Bullet Camera (V380 App)',
    4484.00,
    25,
    '2026-02-18 15:54:06',
    'https://res.cloudinary.com/dmdzytvbn/image/upload/v1771433544/products/acfqruovbnexg02aepho.png',
    'Description: 3MP IP66 waterproof outdoor camera with 4G LTE SIM support, two-way audio, night vision, and V380 mobile app compatibility.',
    3800.00
  );

# ------------------------------------------------------------
# DATA DUMP FOR TABLE: users
# ------------------------------------------------------------

INSERT INTO
  `users` (`id`, `name`, `email`, `role`, `created_at`)
VALUES
  (
    1,
    'Admin',
    'izmangalore037@gmail.com',
    'admin',
    '2026-02-18 07:11:15'
  );
INSERT INTO
  `users` (`id`, `name`, `email`, `role`, `created_at`)
VALUES
  (
    2,
    'Nehan Shaikh',
    'nehanshaikh07@gmail.com',
    'customer',
    '2026-02-18 18:13:01'
  );

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

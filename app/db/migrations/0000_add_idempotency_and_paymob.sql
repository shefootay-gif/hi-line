ALTER TABLE `orders` ADD COLUMN `idempotency_key` varchar(255) NULL;
ALTER TABLE `orders` ADD COLUMN `request_fingerprint` varchar(64) NULL;
ALTER TABLE `orders` ADD UNIQUE INDEX `orders_idempotency_key_unique` (`idempotency_key`);

ALTER TABLE `payment_transactions` MODIFY COLUMN `provider` enum('manual','paymob','tap','hyperpay','paytabs','stripe','moyasar','myfatoorah') DEFAULT 'manual';
ALTER TABLE `payment_transactions` ADD COLUMN `provider_order_id` varchar(255) NULL;
ALTER TABLE `payment_transactions` ADD COLUMN `provider_transaction_id` varchar(255) NULL;
ALTER TABLE `payment_transactions` ADD UNIQUE INDEX `payment_tx_provider_tx_id_unique` (`provider_transaction_id`);

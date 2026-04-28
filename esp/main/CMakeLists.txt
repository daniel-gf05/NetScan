idf_component_register(SRCS "net_scanner.c"
                       PRIV_REQUIRES spi_flash
                       INCLUDE_DIRS "."
                        REQUIRES esp_wifi nvs_flash esp_http_client)

#include <stdio.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_wifi.h"
#include "nvs_flash.h"
#include "esp_event.h"
#include "esp_log.h"
#include "esp_http_client.h"
#include "esp_netif.h"
#include "math.h"

static const char *TAG = "NETSCAN_HTTP";

const double env_att_factor = 3.0;
const double tx_power = -59.0;

void send_data_backend(const char *datos_string) {
    esp_http_client_config_t config = {
        .url = "http://10.232.233.112:3000/esp_info", 
        .method = HTTP_METHOD_POST,
    };
    
    esp_http_client_handle_t client = esp_http_client_init(&config);
    
    esp_http_client_set_header(client, "Content-Type", "text/plain");
    esp_http_client_set_post_field(client, datos_string, strlen(datos_string));
    
    esp_err_t err = esp_http_client_perform(client);
    
    if (err == ESP_OK) {
        ESP_LOGI(TAG, "HTTP POST Status: %d", esp_http_client_get_status_code(client));
    } else {
        ESP_LOGE(TAG, "Error in POST HTTP: %s", esp_err_to_name(err));
    }
    
    esp_http_client_cleanup(client);
}

double calculate_trajectory_lost(int rssi){
    double exp = ((tx_power - rssi)/(10*env_att_factor));
    double d = pow(10, exp);
    printf("Distance calculated for RSSI:%d is %lf\n", rssi, d);
    return d;
}

void app_main(void)
{
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_sta();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    
    wifi_config_t wifi_config = {
        .sta = {
            .ssid = "Motoap",
            .password = "daniap01",
        },
    };
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));
    ESP_ERROR_CHECK(esp_wifi_start());
    
    printf("Connecting to router...\n");
    ESP_ERROR_CHECK(esp_wifi_connect());

    vTaskDelay(pdMS_TO_TICKS(5000)); 

    printf("Wi-Fi is on and the network is set up...\n");

    while(1) {
        printf("Scanning networks...\n");
        
        esp_err_t scan_ret = esp_wifi_scan_start(NULL, true);
        
        if (scan_ret == ESP_OK) {
            uint16_t stored_aps = 5;
            wifi_ap_record_t ap_records[10];
            
            esp_err_t records_ret = esp_wifi_scan_get_ap_records(&stored_aps, ap_records);
            if (records_ret == ESP_OK && stored_aps > 0) {
                printf("Detected Networks: %d\n", stored_aps);
                
                char texto_plano[512] = {'\0'}; 
                int offset = 0;

                for (int i = 0; i < stored_aps; i++) {
                    printf("%d- SSID: %s / RSSI: %d dBm\n", i, ap_records[i].ssid, ap_records[i].rssi);
                    
                    double distance = calculate_trajectory_lost(ap_records[i].rssi);

                    offset += snprintf(texto_plano + offset, sizeof(texto_plano) - offset,
                        "%s,%02x:%02x:%02x:%02x:%02x:%02x,%d,%d,%lf\n", 
                        (char*)ap_records[i].ssid,
                        ap_records[i].bssid[0], ap_records[i].bssid[1], ap_records[i].bssid[2],
                        ap_records[i].bssid[3], ap_records[i].bssid[4], ap_records[i].bssid[5],
                        (int)ap_records[i].rssi, 
                        (int)ap_records[i].primary,
                        (double)distance
                    );
                }

                esp_wifi_connect();
                send_data_backend(texto_plano);

                vTaskDelay(pdMS_TO_TICKS(10000));

            }
        } else {
            printf("Error: %s\n", esp_err_to_name(scan_ret));
        }

    }
}
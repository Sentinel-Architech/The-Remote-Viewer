#ifndef TRV_HOLOGRAM_H
#define TRV_HOLOGRAM_H
#include <stddef.h>
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
typedef struct SovereignHologramEngine SovereignHologramEngine;
const char *trv_hologram_last_error(void);
SovereignHologramEngine *trv_hologram_init_android(void *a_native_window, uint32_t width, uint32_t height, const uint8_t *license, size_t license_len, const uint8_t *signature);
SovereignHologramEngine *trv_hologram_init_ios(void *ui_view, uint32_t width, uint32_t height, const uint8_t *license, size_t license_len, const uint8_t *signature);
SovereignHologramEngine *trv_hologram_init_wayland(void *wl_display, void *wl_surface, uint32_t width, uint32_t height, const uint8_t *license, size_t license_len, const uint8_t *signature);
SovereignHologramEngine *trv_hologram_init_win32(void *hwnd, void *hinstance, uint32_t width, uint32_t height, const uint8_t *license, size_t license_len, const uint8_t *signature);
void trv_hologram_set_hue(SovereignHologramEngine *engine, float angle_radians);
void trv_hologram_resize(SovereignHologramEngine *engine, uint32_t width, uint32_t height);
int32_t trv_hologram_render(SovereignHologramEngine *engine);
void trv_hologram_destroy(SovereignHologramEngine *engine);
#ifdef __cplusplus
}
#endif
#endif

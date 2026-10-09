// OpenHarmony / HarmonyOS NEXT surface adapter.
// Call from the XComponent OnSurfaceCreatedCB window argument.
// This module is declared by lib.rs.

use std::ptr::NonNull;
use raw_window_handle::{RawDisplayHandle, RawWindowHandle};

use crate::{finish_init, set_error, NativePlatform, SovereignHologramEngine};

pub fn harmony_handles(window: *mut std::ffi::c_void) -> Result<(RawWindowHandle, RawDisplayHandle), String> {
    let native = NonNull::new(window).ok_or_else(|| "OHNativeWindow is null".to_string())?;
    let window = RawWindowHandle::OhosNdk(raw_window_handle::OhosNdkWindowHandle::new(native));
    let display = RawDisplayHandle::Ohos(raw_window_handle::OhosDisplayHandle::new());
    Ok((window, display))
}

#[no_mangle]
pub extern "C" fn trv_hologram_init_harmonyos(
    oh_native_window: *mut std::ffi::c_void,
    width: u32,
    height: u32,
    license_bytes: *const u8,
    license_len: usize,
    sig_bytes: *const u8,
) -> *mut SovereignHologramEngine {
    match harmony_handles(oh_native_window) {
        Ok((window, display)) => finish_init(
            NativePlatform::HarmonyOs,
            window,
            display,
            width,
            height,
            license_bytes,
            license_len,
            sig_bytes,
        ),
        Err(err) => {
            set_error(err);
            std::ptr::null_mut()
        }
    }
}

// ============================================================================
// SENTINEL / THE REMOTE VIEWER: SOVEREIGN NATIVE HOLOGRAPHIC UI ENGINE
// ============================================================================
// Zero corporate runtimes. Zero WebGL / browser wrappers. Zero external telemetry.
// Stack: Rust, wgpu native backends, inline WGSL, Ed25519 offline entitlement.
// Platforms: Android (including GrapheneOS), iOS/iPadOS, mobile Linux, Windows ARM,
//            desktop Linux, macOS, and desktop Windows.
// ============================================================================

use std::ffi::{CStr, CString};
use std::num::NonZeroIsize;
use std::ptr::NonNull;
use std::sync::Mutex;

use ed25519_dalek::{Signature, Verifier, VerifyingKey};
use raw_window_handle::{RawDisplayHandle, RawWindowHandle};
use wgpu::util::DeviceExt;

const HOLOGRAPHIC_WGSL_SHADER: &str = r#"
struct HolographicUniforms {
    hue_angle: f32,
    aberration_strength: f32,
    hologram_depth: f32,
    tier_mask: u32,
};

@group(0) @binding(0)
var<uniform> uniforms: HolographicUniforms;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertex_index: u32) -> VertexOutput {
    var out: VertexOutput;
    let x = f32(i32(vertex_index & 1u) * 4 - 1);
    let y = f32(i32(vertex_index & 2u) * 2 - 1);
    out.position = vec4<f32>(x, y, 0.0, 1.0);
    out.uv = vec2<f32>((x + 1.0) * 0.5, (1.0 - y) * 0.5);
    return out;
}

fn cosine_palette(t: f32, a: vec3<f32>, b: vec3<f32>, c: vec3<f32>, d: vec3<f32>) -> vec3<f32> {
    return a + b * cos(6.28318 * (c * t + d));
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    let uv = in.uv;
    let a = vec3<f32>(0.5, 0.5, 0.5);
    let b = vec3<f32>(0.5, 0.5, 0.5);
    let c = vec3<f32>(1.0, 1.0, 1.0);
    let d = vec3<f32>(0.0, 0.33, 0.67) + vec3<f32>(uniforms.hue_angle / 6.28318);
    var final_color = cosine_palette(uv.x, a, b, c, d);

    if ((uniforms.tier_mask & 1u) == 0u) {
        let clamped_t = floor(uv.x * 4.0) / 4.0;
        final_color = cosine_palette(clamped_t, a, b, c, d);
    }

    if ((uniforms.tier_mask & 2u) != 0u) {
        let dist = uv - vec2<f32>(0.5);
        let offset = dist * uniforms.aberration_strength * 0.025;
        let r_shift = cosine_palette(uv.x + offset.x, a, b, c, d).r;
        let b_shift = cosine_palette(uv.x - offset.x, a, b, c, d).b;
        final_color = vec3<f32>(r_shift, final_color.g, b_shift);
        let scanline = sin(uv.y * 350.0 + uniforms.hologram_depth) * 0.06;
        final_color -= vec3<f32>(scanline);
    }

    if ((uniforms.tier_mask & 4u) != 0u) {
        let rim = 1.0 - length(uv - vec2<f32>(0.5));
        let fresnel = pow(rim, 2.5) * 0.3;
        final_color += vec3<f32>(fresnel);
    }

    return vec4<f32>(final_color, 1.0);
}
"#;

const EMBEDDED_PUBLIC_KEY_BYTES: [u8; 32] = [
    0x9f, 0x86, 0xd0, 0x81, 0x88, 0x4c, 0x7d, 0x65, 0x9a, 0x2f, 0xea, 0x0c, 0x55, 0xad, 0x01, 0x5a,
    0x3f, 0x21, 0x83, 0x01, 0x1a, 0x9c, 0x02, 0xd2, 0x1e, 0x81, 0x3f, 0x41, 0x8d, 0xa1, 0x09, 0xb0,
];

static LAST_ERROR: Mutex<Option<CString>> = Mutex::new(None);

fn set_error(message: impl AsRef<str>) {
    let text = message.as_ref().replace('\0', "");
    let value = CString::new(text).ok();
    if let Ok(mut slot) = LAST_ERROR.lock() {
        *slot = value;
    }
}

#[repr(C)]
#[derive(Debug, Clone, Copy, bytemuck::Pod, bytemuck::Zeroable)]
pub struct HolographicUniforms {
    pub hue_angle: f32,
    pub aberration_strength: f32,
    pub hologram_depth: f32,
    pub tier_mask: u32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NativePlatform {
    Android,
    Ios,
    Wayland,
    Win32,
}

pub struct SovereignHologramEngine {
    device: wgpu::Device,
    queue: wgpu::Queue,
    surface: wgpu::Surface<'static>,
    surface_config: wgpu::SurfaceConfiguration,
    render_pipeline: wgpu::RenderPipeline,
    uniform_buffer: wgpu::Buffer,
    bind_group: wgpu::BindGroup,
    current_uniforms: HolographicUniforms,
    platform: NativePlatform,
}

pub fn verify_local_license(license_bytes: &[u8], signature_bytes: &[u8; 64]) -> u32 {
    let Ok(public_key) = VerifyingKey::from_bytes(&EMBEDDED_PUBLIC_KEY_BYTES) else {
        return 0;
    };
    let Ok(signature) = Signature::from_slice(signature_bytes) else {
        return 0;
    };
    if public_key.verify(license_bytes, &signature).is_err() {
        return 0;
    }
    // Payload layout: member_id[16] at 0, tier_bitmask u32 at 16.
    if license_bytes.len() < 20 {
        return 0;
    }
    u32::from_le_bytes(license_bytes[16..20].try_into().unwrap_or([0; 4]))
}

fn native_backends() -> wgpu::Backends {
    wgpu::Backends::VULKAN | wgpu::Backends::METAL | wgpu::Backends::DX12 | wgpu::Backends::GL
}

impl SovereignHologramEngine {
    pub fn init(
        platform: NativePlatform,
        window: RawWindowHandle,
        display: RawDisplayHandle,
        width: u32,
        height: u32,
        license_data: Option<(&[u8], &[u8; 64])>,
    ) -> Result<Self, String> {
        if width == 0 || height == 0 {
            return Err("surface size must be non-zero".into());
        }
        let tier_mask = match license_data {
            Some((bytes, signature)) => verify_local_license(bytes, signature),
            None => 0,
        };

        let instance = wgpu::Instance::new(wgpu::InstanceDescriptor {
            backends: native_backends(),
            flags: wgpu::InstanceFlags::empty(),
            dx12_shader_compiler: wgpu::Dx12Compiler::default(),
            gles_minor_version: wgpu::Gles3MinorVersion::Automatic,
        });

        let surface = unsafe {
            instance.create_surface_unsafe(wgpu::SurfaceTargetUnsafe::RawHandle {
                raw_display_handle: display,
                raw_window_handle: window,
            })
        }
        .map_err(|err| format!("native surface init failed: {err}"))?;
        // The caller retains the platform window for the engine lifetime.
        let surface = unsafe { core::mem::transmute::<wgpu::Surface<'_>, wgpu::Surface<'static>>(surface) };

        let adapter = pollster::block_on(instance.request_adapter(&wgpu::RequestAdapterOptions {
            power_preference: wgpu::PowerPreference::HighPerformance,
            compatible_surface: Some(&surface),
            force_fallback_adapter: false,
        }))
        .ok_or_else(|| "no compatible native GPU adapter".to_string())?;

        let (device, queue) = pollster::block_on(adapter.request_device(
            &wgpu::DeviceDescriptor {
                label: Some("Sovereign_Hologram_Device"),
                required_features: wgpu::Features::empty(),
                required_limits: wgpu::Limits::downlevel_defaults(),
            },
            None,
        ))
        .map_err(|err| format!("GPU device init failed: {err}"))?;

        let caps = surface.get_capabilities(&adapter);
        let format = caps
            .formats
            .iter()
            .copied()
            .find(|candidate| candidate.is_srgb())
            .or_else(|| caps.formats.first().copied())
            .ok_or_else(|| "adapter exposed no surface format".to_string())?;
        let alpha_mode = caps
            .alpha_modes
            .first()
            .copied()
            .ok_or_else(|| "adapter exposed no alpha mode".to_string())?;
        let present_mode = if caps.present_modes.contains(&wgpu::PresentMode::Fifo) {
            wgpu::PresentMode::Fifo
        } else {
            caps.present_modes.first().copied().unwrap_or(wgpu::PresentMode::Fifo)
        };

        let surface_config = wgpu::SurfaceConfiguration {
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
            format,
            width,
            height,
            present_mode,
            alpha_mode,
            view_formats: vec![],
        };
        surface.configure(&device, &surface_config);

        let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
            label: Some("Holographic_WGSL_Module"),
            source: wgpu::ShaderSource::Wgsl(HOLOGRAPHIC_WGSL_SHADER.into()),
        });
        let initial_uniforms = HolographicUniforms {
            hue_angle: std::f32::consts::PI,
            aberration_strength: 0.8,
            hologram_depth: 1.0,
            tier_mask,
        };
        let uniform_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Holographic_Uniform_Buffer"),
            contents: bytemuck::cast_slice(&[initial_uniforms]),
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        });
        let bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
            label: Some("Holographic_Bind_Group_Layout"),
            entries: &[wgpu::BindGroupLayoutEntry {
                binding: 0,
                visibility: wgpu::ShaderStages::FRAGMENT,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Uniform,
                    has_dynamic_offset: false,
                    min_binding_size: None,
                },
                count: None,
            }],
        });
        let bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            label: Some("Holographic_Bind_Group"),
            layout: &bind_group_layout,
            entries: &[wgpu::BindGroupEntry {
                binding: 0,
                resource: uniform_buffer.as_entire_binding(),
            }],
        });
        let pipeline_layout = device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
            label: Some("Holographic_Pipeline_Layout"),
            bind_group_layouts: &[&bind_group_layout],
            push_constant_ranges: &[],
        });
        let render_pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("Holographic_Render_Pipeline"),
            layout: Some(&pipeline_layout),
            vertex: wgpu::VertexState {
                module: &shader,
                entry_point: "vs_main",
                buffers: &[],
            },
            fragment: Some(wgpu::FragmentState {
                module: &shader,
                entry_point: "fs_main",
                targets: &[Some(wgpu::ColorTargetState {
                    format: surface_config.format,
                    blend: Some(wgpu::BlendState::REPLACE),
                    write_mask: wgpu::ColorWrites::ALL,
                })],
            }),
            primitive: wgpu::PrimitiveState {
                topology: wgpu::PrimitiveTopology::TriangleList,
                strip_index_format: None,
                front_face: wgpu::FrontFace::Ccw,
                cull_mode: None,
                polygon_mode: wgpu::PolygonMode::Fill,
                unclipped_depth: false,
                conservative: false,
            },
            depth_stencil: None,
            multisample: wgpu::MultisampleState::default(),
            multiview: None,
        });

        Ok(Self {
            device,
            queue,
            surface,
            surface_config,
            render_pipeline,
            uniform_buffer,
            bind_group,
            current_uniforms: initial_uniforms,
            platform,
        })
    }

    pub fn platform(&self) -> NativePlatform {
        self.platform
    }

    pub fn set_color_wheel_angle(&mut self, angle_radians: f32) {
        self.current_uniforms.hue_angle = angle_radians.rem_euclid(std::f32::consts::TAU);
        self.queue.write_buffer(
            &self.uniform_buffer,
            0,
            bytemuck::cast_slice(&[self.current_uniforms]),
        );
    }

    pub fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
        let output = self.surface.get_current_texture()?;
        let view = output.texture.create_view(&wgpu::TextureViewDescriptor::default());
        let mut encoder = self.device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
            label: Some("Holographic_Render_Encoder"),
        });
        {
            let mut pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                label: Some("Holographic_Render_Pass"),
                color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                    view: &view,
                    resolve_target: None,
                    ops: wgpu::Operations {
                        load: wgpu::LoadOp::Clear(wgpu::Color::BLACK),
                        store: wgpu::StoreOp::Store,
                    },
                })],
                depth_stencil_attachment: None,
                timestamp_writes: None,
                occlusion_query_set: None,
            });
            pass.set_pipeline(&self.render_pipeline);
            pass.set_bind_group(0, &self.bind_group, &[]);
            pass.draw(0..3, 0..1);
        }
        self.queue.submit(std::iter::once(encoder.finish()));
        output.present();
        Ok(())
    }

    pub fn resize(&mut self, new_width: u32, new_height: u32) {
        if new_width > 0 && new_height > 0 {
            self.surface_config.width = new_width;
            self.surface_config.height = new_height;
            self.surface.configure(&self.device, &self.surface_config);
        }
    }
}

fn license_from_raw(bytes: *const u8, len: usize, signature: *const u8) -> Option<(Vec<u8>, [u8; 64])> {
    if bytes.is_null() || signature.is_null() || len == 0 {
        return None;
    }
    let mut payload = vec![0u8; len];
    let mut sig = [0u8; 64];
    unsafe {
        std::ptr::copy_nonoverlapping(bytes, payload.as_mut_ptr(), len);
        std::ptr::copy_nonoverlapping(signature, sig.as_mut_ptr(), 64);
    }
    Some((payload, sig))
}

fn finish_init(
    platform: NativePlatform,
    window: RawWindowHandle,
    display: RawDisplayHandle,
    width: u32,
    height: u32,
    license_bytes: *const u8,
    license_len: usize,
    sig_bytes: *const u8,
) -> *mut SovereignHologramEngine {
    let owned = license_from_raw(license_bytes, license_len, sig_bytes);
    let license = owned.as_ref().map(|(bytes, signature)| (bytes.as_slice(), signature));
    match SovereignHologramEngine::init(platform, window, display, width, height, license) {
        Ok(engine) => {
            set_error("");
            Box::into_raw(Box::new(engine))
        }
        Err(err) => {
            set_error(err);
            std::ptr::null_mut()
        }
    }
}

fn android_handles(window: *mut std::ffi::c_void) -> Result<(RawWindowHandle, RawDisplayHandle), String> {
    let view = NonNull::new(window).ok_or_else(|| "ANativeWindow is null".to_string())?;
    let window = RawWindowHandle::AndroidNdk(raw_window_handle::AndroidNdkWindowHandle::new(view));
    let display = RawDisplayHandle::Android(raw_window_handle::AndroidDisplayHandle::new());
    Ok((window, display))
}

fn ios_handles(view: *mut std::ffi::c_void) -> Result<(RawWindowHandle, RawDisplayHandle), String> {
    let view = NonNull::new(view).ok_or_else(|| "UIView is null".to_string())?;
    let window = RawWindowHandle::UiKit(raw_window_handle::UiKitWindowHandle::new(view));
    let display = RawDisplayHandle::UiKit(raw_window_handle::UiKitDisplayHandle::new());
    Ok((window, display))
}

fn wayland_handles(
    display: *mut std::ffi::c_void,
    surface: *mut std::ffi::c_void,
) -> Result<(RawWindowHandle, RawDisplayHandle), String> {
    let display_ptr = NonNull::new(display).ok_or_else(|| "wl_display is null".to_string())?;
    let surface_ptr = NonNull::new(surface).ok_or_else(|| "wl_surface is null".to_string())?;
    let window = RawWindowHandle::Wayland(raw_window_handle::WaylandWindowHandle::new(surface_ptr));
    let display = RawDisplayHandle::Wayland(raw_window_handle::WaylandDisplayHandle::new(display_ptr));
    Ok((window, display))
}

fn win32_handles(
    hwnd: *mut std::ffi::c_void,
    hinstance: *mut std::ffi::c_void,
) -> Result<(RawWindowHandle, RawDisplayHandle), String> {
    let hwnd = NonZeroIsize::new(hwnd as isize).ok_or_else(|| "HWND is null".to_string())?;
    let mut window = raw_window_handle::Win32WindowHandle::new(hwnd);
    if let Some(instance) = NonZeroIsize::new(hinstance as isize) {
        window.hinstance = Some(instance);
    }
    Ok((
        RawWindowHandle::Win32(window),
        RawDisplayHandle::Windows(raw_window_handle::WindowsDisplayHandle::new()),
    ))
}

#[no_mangle]
pub extern "C" fn trv_hologram_last_error() -> *const std::ffi::c_char {
    LAST_ERROR
        .lock()
        .ok()
        .and_then(|slot| slot.as_ref().map(|value| value.as_ptr()))
        .unwrap_or(std::ptr::null())
}

#[no_mangle]
pub extern "C" fn trv_hologram_init_android(
    a_native_window: *mut std::ffi::c_void,
    width: u32,
    height: u32,
    license_bytes: *const u8,
    license_len: usize,
    sig_bytes: *const u8,
) -> *mut SovereignHologramEngine {
    match android_handles(a_native_window) {
        Ok((window, display)) => finish_init(NativePlatform::Android, window, display, width, height, license_bytes, license_len, sig_bytes),
        Err(err) => {
            set_error(err);
            std::ptr::null_mut()
        }
    }
}

#[no_mangle]
pub extern "C" fn trv_hologram_init_ios(
    ui_view: *mut std::ffi::c_void,
    width: u32,
    height: u32,
    license_bytes: *const u8,
    license_len: usize,
    sig_bytes: *const u8,
) -> *mut SovereignHologramEngine {
    match ios_handles(ui_view) {
        Ok((window, display)) => finish_init(NativePlatform::Ios, window, display, width, height, license_bytes, license_len, sig_bytes),
        Err(err) => {
            set_error(err);
            std::ptr::null_mut()
        }
    }
}

#[no_mangle]
pub extern "C" fn trv_hologram_init_wayland(
    wl_display: *mut std::ffi::c_void,
    wl_surface: *mut std::ffi::c_void,
    width: u32,
    height: u32,
    license_bytes: *const u8,
    license_len: usize,
    sig_bytes: *const u8,
) -> *mut SovereignHologramEngine {
    match wayland_handles(wl_display, wl_surface) {
        Ok((window, display)) => finish_init(NativePlatform::Wayland, window, display, width, height, license_bytes, license_len, sig_bytes),
        Err(err) => {
            set_error(err);
            std::ptr::null_mut()
        }
    }
}

#[no_mangle]
pub extern "C" fn trv_hologram_init_win32(
    hwnd: *mut std::ffi::c_void,
    hinstance: *mut std::ffi::c_void,
    width: u32,
    height: u32,
    license_bytes: *const u8,
    license_len: usize,
    sig_bytes: *const u8,
) -> *mut SovereignHologramEngine {
    match win32_handles(hwnd, hinstance) {
        Ok((window, display)) => finish_init(NativePlatform::Win32, window, display, width, height, license_bytes, license_len, sig_bytes),
        Err(err) => {
            set_error(err);
            std::ptr::null_mut()
        }
    }
}

#[no_mangle]
pub extern "C" fn init_holographic_engine_native(
    window_handle: *mut std::ffi::c_void,
    display_handle: *mut std::ffi::c_void,
    width: u32,
    height: u32,
    license_bytes: *const u8,
    license_len: usize,
    sig_bytes: *const u8,
) -> *mut SovereignHologramEngine {
    #[cfg(target_os = "android")]
    {
        let _ = display_handle;
        return trv_hologram_init_android(window_handle, width, height, license_bytes, license_len, sig_bytes);
    }
    #[cfg(any(target_os = "ios", target_os = "tvos"))]
    {
        let _ = display_handle;
        return trv_hologram_init_ios(window_handle, width, height, license_bytes, license_len, sig_bytes);
    }
    #[cfg(target_os = "windows")]
    {
        return trv_hologram_init_win32(window_handle, display_handle, width, height, license_bytes, license_len, sig_bytes);
    }
    #[cfg(any(target_os = "linux", target_os = "freebsd", target_os = "netbsd", target_os = "openbsd"))]
    {
        return trv_hologram_init_wayland(display_handle, window_handle, width, height, license_bytes, license_len, sig_bytes);
    }
    #[cfg(not(any(
        target_os = "android",
        target_os = "ios",
        target_os = "tvos",
        target_os = "windows",
        target_os = "linux",
        target_os = "freebsd",
        target_os = "netbsd",
        target_os = "openbsd"
    )))]
    {
        let _ = (window_handle, display_handle, width, height, license_bytes, license_len, sig_bytes);
        set_error("host operating system has no native surface adapter");
        std::ptr::null_mut()
    }
}

#[no_mangle]
pub extern "C" fn trv_hologram_set_hue(engine: *mut SovereignHologramEngine, angle_radians: f32) {
    if let Some(engine) = unsafe { engine.as_mut() } {
        engine.set_color_wheel_angle(angle_radians);
    }
}

#[no_mangle]
pub extern "C" fn trv_hologram_resize(engine: *mut SovereignHologramEngine, width: u32, height: u32) {
    if let Some(engine) = unsafe { engine.as_mut() } {
        engine.resize(width, height);
    }
}

#[no_mangle]
pub extern "C" fn trv_hologram_render(engine: *mut SovereignHologramEngine) -> i32 {
    let Some(engine) = (unsafe { engine.as_mut() }) else {
        set_error("engine pointer is null");
        return -1;
    };
    match engine.render() {
        Ok(()) => 0,
        Err(err) => {
            set_error(err.to_string());
            -2
        }
    }
}

#[no_mangle]
pub extern "C" fn trv_hologram_destroy(engine: *mut SovereignHologramEngine) {
    if !engine.is_null() {
        drop(unsafe { Box::from_raw(engine) });
    }
}

#[allow(dead_code)]
fn _error_cstr_keepalive(err: &CStr) -> &CStr {
    err
}

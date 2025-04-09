pub fn rand(maximum: usize) -> usize {
    js_sys::Math::floor(js_sys::Math::random() * (maximum + 1) as f64) as usize
}

use screencapturekit::prelude::*;
fn main() {
    let mut config = SCStreamConfiguration::new();
    config.set_channel_count(1);
    config.set_sample_rate(48000);
}

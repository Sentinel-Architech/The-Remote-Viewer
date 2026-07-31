use trv_optical_airgap::{decrypt_blob, encrypt_for_recipient, generate_identity_pair};

fn main() {
    let kp = generate_identity_pair();
    let msg = b"TRV optical rust example";
    let ct = encrypt_for_recipient(msg, &kp.recipient).expect("encrypt");
    let pt = decrypt_blob(&ct, &kp.identity).expect("decrypt");
    assert_eq!(pt, msg);
    println!("age roundtrip ok, ciphertext {} bytes", ct.len());
    println!("recipient: {}", kp.recipient);
}

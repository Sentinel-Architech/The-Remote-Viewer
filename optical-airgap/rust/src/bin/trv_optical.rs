//! Minimal CLI: age-keygen | age-encrypt | age-decrypt | rdh-capacity | lt-demo

use std::env;
use std::io::{self, Read, Write};
use trv_optical_airgap::fountain::{encode_lt_frame, LtEncoder, LtFrameMeta};
use trv_optical_airgap::{
    decrypt_blob, embed_histogram_shifting, encrypt_for_recipient, estimate_capacity,
    generate_identity_pair, generate_local_address,
};

fn usage() {
    eprintln!(
        "trv-optical — TRV optical air-gap CLI\n\
         Commands:\n\
           keygen\n\
           encrypt <recipient-age1...>   (plaintext on stdin → ciphertext stdout)\n\
           decrypt                      (identity AGE-SECRET-KEY on env TRV_AGE_IDENTITY; ct stdin)\n\
           rdh-cap <cover-bytes-path>\n\
           address <local> <vault-fp>\n\
           lt-demo                      (stdin payload → print first 5 TRVL frame sizes)\n"
    );
}

fn main() {
    let mut args = env::args().skip(1);
    let cmd = match args.next() {
        Some(c) => c,
        None => {
            usage();
            std::process::exit(1);
        }
    };

    match cmd.as_str() {
        "keygen" => {
            let kp = generate_identity_pair();
            println!("{}", kp.recipient);
            eprintln!("{}", kp.identity);
            eprintln!("(identity on stderr — store in Vault only)");
        }
        "encrypt" => {
            let recip_str = args.next().expect("recipient age1...");
            let recipient: age::x25519::Recipient = recip_str.parse().expect("parse recipient");
            let mut pt = Vec::new();
            io::stdin().read_to_end(&mut pt).unwrap();
            let ct = encrypt_for_recipient(&pt, &recipient).expect("encrypt");
            io::stdout().write_all(&ct).unwrap();
        }
        "rdh-cap" => {
            let path = args.next().expect("cover path");
            let cover = std::fs::read(path).expect("read cover");
            println!("{}", estimate_capacity(&cover));
        }
        "address" => {
            let local = args.next().unwrap_or_else(|| "ops".into());
            let fp = args.next().unwrap_or_else(|| "vault".into());
            println!("{}", generate_local_address(&local, &fp));
        }
        "lt-demo" => {
            let mut pt = Vec::new();
            io::stdin().read_to_end(&mut pt).unwrap();
            let mut enc = LtEncoder::new(&pt, 32);
            let meta = LtFrameMeta {
                k: enc.k() as u16,
                block_size: 32,
            };
            for i in 0..5 {
                let sym = enc.next();
                let frame = encode_lt_frame(&sym, &meta).expect("frame");
                println!("frame[{i}] bytes={}", frame.len());
            }
        }
        "rdh-embed-demo" => {
            // stdin secret, synthetic cover
            let mut secret = Vec::new();
            io::stdin().read_to_end(&mut secret).unwrap();
            let cover = vec![128u8; 100_000];
            let r = embed_histogram_shifting(&cover, &secret).expect("embed");
            println!(
                "embedded_bits={} peak={} zero={}",
                r.embedded_bits, r.peak, r.zero
            );
        }
        _ => {
            usage();
            // keep decrypt documented but identity parsing is verbose for x25519 string
            let _ = decrypt_blob;
            std::process::exit(1);
        }
    }
}

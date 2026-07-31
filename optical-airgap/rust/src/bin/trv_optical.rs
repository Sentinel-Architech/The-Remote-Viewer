//! CLI: keygen | encrypt | decrypt | rdh-cap | address | lt-demo

use std::env;
use std::io::{self, Read, Write};
use trv_optical_airgap::fountain::{encode_lt_frame, LtEncoder, LtFrameMeta};
use trv_optical_airgap::{
    decrypt_blob, embed_histogram_shifting, encrypt_for_recipient, estimate_capacity,
    generate_identity_pair, generate_local_address,
};

fn usage() {
    eprintln!(
        "trv-optical\n\
         keygen\n\
         encrypt <age1-recipient>     stdin plaintext → stdout ciphertext\n\
         decrypt <identity-file>      stdin ciphertext → stdout plaintext\n\
         rdh-cap <cover-file>\n\
         address <local> <vault-fp>\n\
         lt-demo                       stdin → 5 frame sizes\n\
         rdh-embed-demo                stdin secret → stats on synthetic cover\n"
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
            eprintln!("(identity on stderr — Vault only)");
        }
        "encrypt" => {
            let recip_str = args.next().expect("recipient");
            let recipient: age::x25519::Recipient = recip_str.parse().expect("recipient");
            let mut pt = Vec::new();
            io::stdin().read_to_end(&mut pt).unwrap();
            let ct = encrypt_for_recipient(&pt, &recipient).expect("encrypt");
            io::stdout().write_all(&ct).unwrap();
        }
        "decrypt" => {
            let path = args.next().expect("identity file");
            let id_str = std::fs::read_to_string(&path).expect("read identity");
            let identity: age::x25519::Identity = id_str
                .lines()
                .find(|l| l.starts_with("AGE-SECRET-KEY-"))
                .unwrap_or(id_str.trim())
                .parse()
                .expect("parse identity");
            let mut ct = Vec::new();
            io::stdin().read_to_end(&mut ct).unwrap();
            let pt = decrypt_blob(&ct, &identity).expect("decrypt");
            io::stdout().write_all(&pt).unwrap();
        }
        "rdh-cap" => {
            let path = args.next().expect("cover path");
            let cover = std::fs::read(path).expect("read");
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
            std::process::exit(1);
        }
    }
}

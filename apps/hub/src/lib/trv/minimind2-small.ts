/** Shipped on-device weights. Apache-2.0. The file is measured in tests. */

export const SHIPPED_MODEL_NAME = "MiniMind2-Small" as const;
export const SHIPPED_MODEL_SOURCE = "jingyaogong/MiniMind2-Small" as const;
export const SHIPPED_MODEL_LICENSE = "Apache-2.0" as const;

/** Header sum of the shipped float16 tensors. The card calls this 26M. */
export const SHIPPED_PARAMETER_COUNT = 25_829_888;

/** Byte length of the shipped model.safetensors. Under the 100 MB GitHub file limit. */
export const SHIPPED_WEIGHT_BYTES = 51_667_832;

/** SHA-256 of that file. Same digest the model host published for model.safetensors. */
export const SHIPPED_WEIGHT_SHA256 = "83bfe6f127c98120a3410aab65eee3b66b8301ac352c20b7efd5e2eb688f6d85";

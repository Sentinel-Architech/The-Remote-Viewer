import type { ViewerProfile } from "./types";
import { isDualCitizenSeal } from "./citizen";

/**
 * Legacy single-document seals do not get American Citizen prices.
 * Clears citizen_at for this node when id_type is not state_*+federal.
 */
export async function expireLegacyCitizen(
  sql: {
    (strings: TemplateStringsArray, ...values: unknown[]): Promise<unknown>;
  },
  profile: ViewerProfile,
): Promise<ViewerProfile> {
  if (!profile.citizenAt) return profile;
  if (isDualCitizenSeal(profile.idType)) return profile;
  await sql`
    update viewer_profiles
    set citizen_at = null
    where user_id = ${profile.userId}
      and citizen_at is not null
      and (id_type is null or position('+' in coalesce(id_type, '')) = 0)
  `;
  return { ...profile, citizenAt: null };
}

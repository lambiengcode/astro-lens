/** `[archetype, three tags, strength, challenge]` — positional, to keep 28
 *  profiles per locale readable in one screen. */
export type Profile = readonly [string, readonly [string, string, string], string, string];

export interface Profiles {
  /** Shown for a vô chính diệu Mệnh cung. */
  empty: Profile;
  /** Keyed by the Vietnamese chính tinh name the chart data carries. */
  single: Record<string, Profile>;
  /** Keyed by `"<star>+<star>"`, either order — `getProfile` tries both. */
  combo: Record<string, Profile>;
}

import type { AvatarId } from "@/lib/types"

export type AvatarMeta = {
  id: AvatarId
  label: string
  background: string
  ink: string
}

export const AVATARS: AvatarMeta[] = [
  { id: "fox", label: "Fox", background: "#c45c2c", ink: "#fff7ed" },
  { id: "owl", label: "Owl", background: "#3d5a80", ink: "#eef4fb" },
  { id: "otter", label: "Otter", background: "#0f766e", ink: "#ecfdf8" },
  { id: "robin", label: "Robin", background: "#9f2d3a", ink: "#fff1f2" },
  { id: "badger", label: "Badger", background: "#3f3f46", ink: "#f4f4f5" },
  { id: "hare", label: "Hare", background: "#4d7c0f", ink: "#f7fee7" },
]

export function getAvatar(id: AvatarId): AvatarMeta {
  return AVATARS.find((avatar) => avatar.id === id) ?? AVATARS[0]
}

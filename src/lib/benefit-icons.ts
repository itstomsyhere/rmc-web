import { BadgePercent, Coins, Crown, Gift, Headset, MessagesSquare, PartyPopper, Percent, Sparkles, Star, Trophy, Truck, UserPlus, type LucideIcon } from 'lucide-react'

/* Icons an admin can pick for a benefit card (name stored in config.benefits[].icon). */
export const BENEFIT_ICONS: Record<string, LucideIcon> = { BadgePercent, Percent, Truck, Star, Headset, MessagesSquare, Gift, PartyPopper, Crown, Coins, Trophy, UserPlus, Sparkles }
export const BENEFIT_ICON_NAMES = Object.keys(BENEFIT_ICONS)

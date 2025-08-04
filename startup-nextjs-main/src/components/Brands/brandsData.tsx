import { Brand } from "@/types/brand";

const brandsData: Brand[] = [
  {
    id: 1,
    name: "PropertyHub",
    href: "#",
    logo: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#5750F1"/>
        <path d="M12 16L20 8L28 16V28H12V16Z" fill="white"/>
        <rect x="16" y="20" width="8" height="8" fill="#5750F1"/>
      </svg>
    ),
  },
  {
    id: 2,
    name: "RealEstatePro",
    href: "#",
    logo: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#10B981"/>
        <path d="M10 12L20 6L30 12V30H10V12Z" fill="white"/>
        <circle cx="20" cy="20" r="4" fill="#10B981"/>
      </svg>
    ),
  },
  {
    id: 3,
    name: "HomeFinder",
    href: "#",
    logo: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#F59E0B"/>
        <path d="M8 20L20 8L32 20V32H8V20Z" fill="white"/>
        <path d="M16 24L20 20L24 24V28H16V24Z" fill="#F59E0B"/>
      </svg>
    ),
  },
  {
    id: 4,
    name: "PropertyMatch",
    href: "#",
    logo: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#8B5CF6"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
        <circle cx="24" cy="24" r="6" fill="white"/>
        <path d="M22 18L18 22" stroke="#8B5CF6" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    id: 5,
    name: "EstateConnect",
    href: "#",
    logo: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#EF4444"/>
        <path d="M12 16L20 8L28 16V28H12V16Z" fill="white"/>
        <circle cx="16" cy="20" r="2" fill="#EF4444"/>
        <circle cx="24" cy="20" r="2" fill="#EF4444"/>
        <path d="M16 24L20 20L24 24" stroke="#EF4444" strokeWidth="2" fill="none"/>
      </svg>
    ),
  },
  {
    id: 6,
    name: "SmartProperty",
    href: "#",
    logo: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#06B6D4"/>
        <path d="M10 12L20 6L30 12V30H10V12Z" fill="white"/>
        <circle cx="20" cy="18" r="3" fill="#06B6D4"/>
        <path d="M18 22L20 20L22 22" stroke="#06B6D4" strokeWidth="2" fill="none"/>
      </svg>
    ),
  },
];

export default brandsData;

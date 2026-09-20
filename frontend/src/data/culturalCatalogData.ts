export interface StanzaGroup {
  number: number;
  title: string;
  lines: string[];
}

export interface CulturalItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  categoryBadge: string;
  badgeGradient: string;
  icon: string;
  tagline: string;
  description: string;
  image: string;
  stanzas: StanzaGroup[];
  status: 'ready' | 'upcoming';
  estimatedDuration: string;
}

export const CULTURAL_CATALOG: CulturalItem[] = [
  {
    id: 'jana-gana-mana',
    title: 'Jana Gana Mana',
    subtitle: 'National Anthem of India',
    category: 'National Anthem',
    categoryBadge: 'bg-[#fe9832]/20 text-[#fe9832] border-[#fe9832]/30',
    badgeGradient: 'from-[#fe9832] to-[#138808]',
    icon: '🇮🇳',
    tagline: 'Composed by Rabindranath Tagore (1911)',
    description: "India's National Anthem celebrating unity, sovereignty, and rich geographic diversity in Indian Sign Language.",
    image: '/images/cultural/anthem-flag.jpg',
    status: 'ready',
    estimatedDuration: '52s',
    stanzas: [
      {
        number: 1,
        title: 'Invocation of Destiny',
        lines: [
          'Jana Gana Mana Adhinayaka Jaya He',
          'Bharata Bhagya Vidhata',
          'Punjab Sindh Gujarat Maratha',
          'Dravida Utkala Banga',
        ],
      },
      {
        number: 2,
        title: 'Sacred Rivers & Mountains',
        lines: [
          'Vindhya Himachala Yamuna Ganga',
          'Ucchala Jaladhi Taranga',
          'Tava Shubha Name Jage',
          'Tava Shubha Ashisha Mage',
          'Gahe Tava Jaya Gatha',
        ],
      },
      {
        number: 3,
        title: 'Eternal Victory & Triumph',
        lines: [
          'Jana Gana Mangala Dayaka Jaya He',
          'Bharata Bhagya Vidhata',
          'Jaya He, Jaya He, Jaya He',
          'Jaya Jaya Jaya Jaya He',
        ],
      },
    ],
  },
  {
    id: 'vande-mataram',
    title: 'Vande Mataram',
    subtitle: 'National Song of India',
    category: 'National Song',
    categoryBadge: 'bg-emerald-500/20 text-[#8dfc75] border-emerald-500/30',
    badgeGradient: 'from-emerald-500 to-teal-600',
    icon: '🪷',
    tagline: 'Composed by Bankim Chandra Chatterjee (1875)',
    description: 'Revered national song honoring the sacred beauty, fertile waters, and strength of the motherland.',
    image: '/images/cultural/vande-mataram.jpg',
    status: 'ready',
    estimatedDuration: '65s',
    stanzas: [
      {
        number: 1,
        title: 'Mother, I Bow to Thee',
        lines: [
          'Vande Mataram',
          'Sujalam Sufalam Malayaja Shitalam',
          'Shasya Shyamalam Mataram',
          'Vande Mataram',
        ],
      },
      {
        number: 2,
        title: 'Luminous Moonlight & Sweet Speech',
        lines: [
          'Shubhra Jyotsna Pulakita Yaminim',
          'Phulla Kusumita Drumadala Shobhinim',
          'Suhasinim Sumadhura Bhashinim',
          'Sukhadam Varadam Mataram',
          'Vande Mataram',
        ],
      },
      {
        number: 3,
        title: 'Unconquerable Power & Grace',
        lines: [
          'Koti Koti Kantha Kalakala Ninada Karale',
          'Koti Koti Bhuja Dhruta Khara Karavale',
          'Ke Bole Ma Tumi Abale',
          'Bahu Bala Dharinim Namami Taminim',
          'Mataram Vande Mataram',
        ],
      },
    ],
  },
  {
    id: 'preamble-of-india',
    title: 'Preamble to the Constitution',
    subtitle: 'Supreme Guiding Philosophy of India',
    category: 'National Heritage',
    categoryBadge: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    badgeGradient: 'from-sky-500 to-indigo-600',
    icon: '⚖️',
    tagline: 'Constitution of India (1949)',
    description: 'Foundational constitutional values securing Justice, Liberty, Equality, and Fraternity for all citizens.',
    image: '/images/cultural/constitution-preamble.jpg',
    status: 'ready',
    estimatedDuration: '75s',
    stanzas: [
      {
        number: 1,
        title: 'Sovereign Republic Declaration',
        lines: [
          'WE THE PEOPLE OF INDIA',
          'Having solemnly resolved to constitute India into a',
          'SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC',
          'And to secure to all its citizens',
        ],
      },
      {
        number: 2,
        title: 'Justice, Liberty & Equality',
        lines: [
          'JUSTICE Social Economic and Political',
          'LIBERTY of Thought Expression Belief Faith and Worship',
          'EQUALITY of Status and of Opportunity',
          'And to promote among them all',
        ],
      },
      {
        number: 3,
        title: 'Fraternity & National Integrity',
        lines: [
          'FRATERNITY assuring the Dignity of the Individual',
          'And the Unity and Integrity of the Nation',
          'IN OUR CONSTITUENT ASSEMBLY this twenty sixth day of November 1949',
          'DO HEREBY ADOPT ENACT AND GIVE TO OURSELVES THIS CONSTITUTION',
        ],
      },
    ],
  },
  {
    id: 'sare-jahan-se-accha',
    title: 'Sare Jahan Se Accha',
    subtitle: 'Tarana-e-Hindi',
    category: 'Patriotic Classic',
    categoryBadge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    badgeGradient: 'from-amber-500 to-orange-600',
    icon: '🕊️',
    tagline: 'Composed by Muhammad Iqbal (1904)',
    description: 'Timeless patriotic poem celebrating communal brotherhood, sacred mountains, and eternal harmony.',
    image: '/images/cultural/sare-jahan-se-acha.jpg',
    status: 'ready',
    estimatedDuration: '60s',
    stanzas: [
      {
        number: 1,
        title: 'Our Beloved Homeland',
        lines: [
          'Sare Jahan Se Accha Hindustan Hamara',
          'Ham Bulbulen Hain Iski Ye Gulsitan Hamara',
        ],
      },
      {
        number: 2,
        title: 'Sentinel Mountains & Holy Streams',
        lines: [
          'Parbat Vo Sab Se Uncha Hamsaya Asman Ka',
          'Vo Santari Hamara Vo Pasban Hamara',
          'Godi Men Khelti Hain Iski Hazaron Nadiyan',
          'Gulshan Hai Jinke Dam Se Rashk-e-Jinan Hamara',
        ],
      },
      {
        number: 3,
        title: 'Brotherhood & Harmony',
        lines: [
          'Mazhab Nahin Sikhata Apas Men Bair Rakhna',
          'Hindi Hain Ham Vatan Hai Hindustan Hamara',
        ],
      },
    ],
  },
  {
    id: 'national-pledge',
    title: 'National Pledge of India',
    subtitle: 'Oath of Allegiance & Brotherhood',
    category: 'National Pledge',
    categoryBadge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    badgeGradient: 'from-purple-500 to-rose-600',
    icon: '✋',
    tagline: 'Pydimarri Venkata Subba Rao (1962)',
    description: 'Daily national oath of allegiance, devotion to the motherland, and brotherhood among all Indians.',
    image: '/images/cultural/pledge-india.jpg',
    status: 'ready',
    estimatedDuration: '45s',
    stanzas: [
      {
        number: 1,
        title: 'Oath of Brotherhood',
        lines: [
          'India is my country and all Indians are my brothers and sisters',
          'I love my country and I am proud of its rich and varied heritage',
          'I shall always strive to be worthy of it',
        ],
      },
      {
        number: 2,
        title: 'Respect & Devotion',
        lines: [
          'I shall give respect to my parents teachers and all elders',
          'And treat everyone with courtesy',
          'To my country and my people I pledge my devotion',
        ],
      },
      {
        number: 3,
        title: 'Universal Well-being',
        lines: [
          'In their well-being and prosperity alone lies my happiness',
          'Jai Hind',
        ],
      },
    ],
  },
];

import {
    recording03,
    recording01,
    disc02,
    chromecast,
    sliders04,
    figma,
    notion,
    discord,
    slack,
    photoshop,
    protopie,
    framer,
    raindrop,
    notification2,
    notification3,
    notification4,
    benefitIcon1,
    benefitIcon2,
    benefitIcon3,
    benefitIcon4,
    benefitIcon5,
    benefitImage2,
    homeSmile,
    file02,
    searchMd,
    plusSquare,
    discordBlack,
    twitter,
    instagram,
    telegram,
    facebook,
    dashboard,
    submitSKKM,
    detailSKKM,
    verifySKKM,
    validateSKKM,
    updatePoint,
    profile,
    logout,

} from "../assets";

// -------------------------------------------------- 
// --------------------- Home------------------------
// --------------------------------------------------

export const brainwaveServices = [
    "Photo generating",
    "Photo enhance",
    "Seamless Integration",
];

export const brainwaveServicesIcons = [
    recording03,
    recording01,
    disc02,
    chromecast,
    sliders04,
];

export const collabText =
    "With advanced blockchain technology and robust security, it's the perfect platform for institutions looking to enhance collaboration.";

export const collabText2 =
    "Facilitate quick and secure data exchange, ensuring all parties have access to accurate and up-to-date information.";

export const collabText3 =
    "Enable real-time tracking of academic progress, fostering transparency and trust in the educational journey.";

export const collabContent = [
    {
        id: "0",
        title: "Secure Record Management",
        text: collabText
    },
    {
        id: "1",
        title: "Efficient Data Sharing",
        text: collabText2
    },
    {
        id: "2",
        title: "Transparent Academic Tracking",
        text: collabText3
    },
];

export const collabApps = [
    {
        id: "0",
        title: "Figma",
        icon: figma,
        width: 26,
        height: 36,
    },
    {
        id: "1",
        title: "Notion",
        icon: notion,
        width: 34,
        height: 36,
    },
    {
        id: "2",
        title: "Discord",
        icon: discord,
        width: 36,
        height: 28,
    },
    {
        id: "3",
        title: "Slack",
        icon: slack,
        width: 34,
        height: 35,
    },
    {
        id: "4",
        title: "Photoshop",
        icon: photoshop,
        width: 34,
        height: 34,
    },
    {
        id: "5",
        title: "Protopie",
        icon: protopie,
        width: 34,
        height: 34,
    },
    {
        id: "6",
        title: "Framer",
        icon: framer,
        width: 26,
        height: 34,
    },
    {
        id: "7",
        title: "Raindrop",
        icon: raindrop,
        width: 38,
        height: 32,
    },
];

export const notificationImages = [notification4, notification3, notification2];

export const heroIcons = [homeSmile, file02, searchMd, plusSquare];

export const benefits = [
    {
        id: "0",
        title: " Immutable Records",
        text: " Ensure the safety and integrity of student records with blockchain technology, preventing unauthorized alterations and data loss.",
        backgroundUrl: "../../src/assets/home/benefits/card-1.svg",
        iconUrl: benefitIcon1,
        imageUrl: benefitImage2,
    },
    {
        id: "1",
        title: "Transparent and Trustworthy",
        text: "Provide transparency in academic records, allowing students and administrators to access and verify information with confidence.",
        backgroundUrl: "../../src/assets/home/benefits/card-2.svg",
        iconUrl: benefitIcon2,
        imageUrl: benefitImage2,
        light: true,
    },
    {
        id: "2",
        title: "Efficient Data Management",
        text: "Streamline the process of managing academic records, reducing administrative workload and increasing efficiency.",
        backgroundUrl: "../../src/assets/home/benefits/card-3.svg",
        iconUrl: benefitIcon3,
        imageUrl: benefitImage2,
    },
    {
        id: "3",
        title: "Secure Access",
        text: "Enable secure and controlled access to records, ensuring that only authorized users can view or update information.",
        backgroundUrl: "../../src/assets/home/benefits/card-5.svg",
        iconUrl: benefitIcon4,
        imageUrl: benefitImage2,
    },
    {
        id: "4",
        title: "Real-time Updates",
        text: "Keep student records up-to-date in real-time, reflecting the most recent academic achievements and changes immediately.",
        backgroundUrl: "../../src/assets/home/benefits/card-6.svg",
        iconUrl: benefitIcon5,
        imageUrl: benefitImage2,
    },
];

export const navigation = [
    {
        id: "0",
        title: "SKKM",
        url: "/skkm",
    },
    {
        id: "1",
        title: "Coming Soon",
        url: "#coming-soon",
    },
    {
        id: "2",
        title: "Coming Soon",
        url: "#coming-soon",
    },
    {
        id: "3",
        title: "Coming Soon",
        url: "#coming-soon",
    },
    // {
    //     id: "4",
    //     title: "Coming Soon",
    //     url: "#coming-soon",
    //     onlyMobile: true,
    // },
    // {
    //     id: "5",
    //     title: "Coming Soon",
    //     url: "#login",
    //     onlyMobile: true,
    // },
];
export const socials = [
    {
        id: "0",
        title: "Discord",
        iconUrl: discordBlack,
        url: "#",
    },
    {
        id: "1",
        title: "Twitter",
        iconUrl: twitter,
        url: "#",
    },
    {
        id: "2",
        title: "Instagram",
        iconUrl: instagram,
        url: "#",
    },
    {
        id: "3",
        title: "Telegram",
        iconUrl: telegram,
        url: "#",
    },
    {
        id: "4",
        title: "Facebook",
        iconUrl: facebook,
        url: "#",
    },
];

// --------------------------------------------------
// ----------------- END Home -----------------------
// --------------------------------------------------

// --------------------------------------------------
// --------------------- Dashboard-------------------
// --------------------------------------------------

export const activityData = {
    KEGIATAN_WAJIB: [
        {
            category: "NEW STUDENT ACTIVITIES",
            levels: [
                {
                    level: "ORDIK POLINEMA",
                    achievements: [
                        { achievement: "-", credit: 2.0, assessmentBasis: ["SERTIFIKAT", "SK"], SKPI: false }
                    ]
                },
                {
                    level: "LDK POLINEMA",
                    achievements: [
                        { achievement: "-", credit: 5.0, assessmentBasis: ["SERTIFIKAT", "SK"], SKPI: false }
                    ]
                },
                {
                    level: "POLINEMA RELIGIOUS MENTORING (PARTICIPANTS)",
                    achievements: [
                        { achievement: "-", credit: 2.0, assessmentBasis: ["CERTIFICATE", "SK"], SKPI: false }
                    ]
                }
            ]
        }
    ],
    KEGIATAN_PILIHAN: [
        {
            category: "KEPENGURUSAN ORGANISASI SELAIN ORGANISASI KEMAHASISWAAN INTRA",
            levels: [
                {
                    level: "INTERNASIONAL",
                    achievements: [
                        { achievement: "KETUA", credit: 5.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "WAKIL KETUA", credit: 3.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "SEKRETARIS", credit: 2.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "BENDAHARA", credit: 2.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "KETUA BIDANG", credit: 2.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "ANGGOTA / PESERTA", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true }
                    ]
                },
                {
                    level: "NASIONAL",
                    achievements: [
                        { achievement: "KETUA", credit: 4.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "WAKIL KETUA", credit: 3.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "SEKRETARIS", credit: 2.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "BENDAHARA", credit: 2.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "KETUA BIDANG", credit: 2.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "ANGGOTA / PESERTA", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true }
                    ]
                },
                {
                    level: "REGIONAL / PROPINSI",
                    achievements: [
                        { achievement: "KETUA", credit: 3.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "WAKIL KETUA", credit: 1.5, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "SEKRETARIS", credit: 1.5, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "BENDAHARA", credit: 1.5, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "KETUA BIDANG", credit: 1.5, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "ANGGOTA / PESERTA", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true }
                    ]
                },
                {
                    level: "KABUPATEN / KOTA",
                    achievements: [
                        { achievement: "KETUA", credit: 2.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "WAKIL KETUA", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "SEKRETARIS", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "BENDAHARA", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "KETUA BIDANG", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true },
                        { achievement: "ANGGOTA / PESERTA", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: true }
                    ]
                },
                {
                    level: "KECAMATAN",
                    achievements: [
                        { achievement: "KETUA", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: false },
                        { achievement: "WAKIL KETUA", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: false },
                        { achievement: "SEKRETARIS", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: false },
                        { achievement: "BENDAHARA", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: false },
                        { achievement: "KETUA BIDANG", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: false },
                        { achievement: "ANGGOTA / PESERTA", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: false }
                    ]
                },
                {
                    level: "DESA / KELURAHAN",
                    achievements: [
                        { achievement: "KETUA", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: false },
                        { achievement: "WAKIL KETUA", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: false },
                        { achievement: "SEKRETARIS", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: false },
                        { achievement: "BENDAHARA", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: false },
                        { achievement: "KETUA BIDANG", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: false },
                        { achievement: "ANGGOTA / PESERTA", credit: 1.0, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: false }
                    ]
                },
                {
                    level: "TINGKAT RT/RW",
                    achievements: [
                        { achievement: "KETUA", credit: 0.5, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: false },
                        { achievement: "WAKIL KETUA", credit: 0.5, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: false },
                        { achievement: "SEKRETARIS", credit: 0.5, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: false },
                        { achievement: "BENDAHARA", credit: 0.5, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: false },
                        { achievement: "KETUA BIDANG", credit: 0.5, assessmentBasis: ["SK", "ST", "KARTU ANGGOTA"], SKPI: false }
                    ]
                },
                {
                    level: "PENGURUS KELAS",
                    achievements: [
                        { achievement: "KETUA KELAS", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "WAKIL KETUA", credit: 0.5, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "SEKRETARIS", credit: 0.5, assessmentBasis: ["SK", "ST"], SKPI: false }
                    ]
                }
            ]
        },
        {
            category: "KEANGGOTAAN ORGANISASI INTERNAL KAMPUS",
            levels: [
                {
                    level: "INTERNAL KAMPUS DPM",
                    achievements: [
                        { achievement: "KETUA", credit: 6.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "WAKIL KETUA", credit: 4.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "SEKRETARIS", credit: 3.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "BENDAHARA", credit: 3.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "KETUA KOMISI", credit: 3.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "SEKRETARIS KOMISI", credit: 2.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "ANGGOTA", credit: 1.5, assessmentBasis: ["SK", "ST"], SKPI: false }
                    ]
                },
                {
                    level: "INTERNAL KAMPUS BEM",
                    achievements: [
                        { achievement: "PRESIDEN", credit: 6.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "WAKIL PRESIDEN", credit: 4.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "MENTERI", credit: 3.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "WAKIL MENTERI", credit: 3.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "ANGGOTA", credit: 1.5, assessmentBasis: ["SK", "ST"], SKPI: false }
                    ]
                },
                {
                    level: "INTERNAL KAMPUS HMJ",
                    achievements: [
                        { achievement: "KETUA", credit: 5.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "WAKIL KETUA", credit: 3.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "SEKRETARIS", credit: 2.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "BENDAHARA", credit: 2.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "KETUA BIDANG", credit: 2.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "WAKIL/SEKRETARIS BIDANG", credit: 1.5, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "ANGGOTA AKTIF", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false }
                    ]
                },
                {
                    level: "INTERNAL KAMPUS UKM",
                    achievements: [
                        { achievement: "KETUA", credit: 4.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "WAKIL KETUA", credit: 2.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "SEKRETARIS", credit: 2.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "BENDAHARA", credit: 2.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "KETUA BIDANG", credit: 2.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "WAKIL/SEKRETARIS BIDANG", credit: 1.5, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "ANGGOTA AKTIF", credit: 0.5, assessmentBasis: ["SK", "ST"], SKPI: false }
                    ]
                }
            ]
        },
        {
            category: "KEPANITIAAN",
            levels: [
                {
                    level: "INTERNASIONAL",
                    achievements: [
                        { achievement: "SC", credit: 3.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "KETUA", credit: 3.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "WAKIL KETUA", credit: 2.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "SEKRETARIS", credit: 2.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "BENDAHARA", credit: 2.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "KETUA BIDANG", credit: 2.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "ANGGOTA / PESERTA", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false }
                    ]
                },
                {
                    level: "NASIONAL",
                    achievements: [
                        { achievement: "SC", credit: 3.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "KETUA", credit: 3.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "WAKIL KETUA", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "SEKRETARIS", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "BENDAHARA", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "KETUA BIDANG", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "ANGGOTA / PESERTA", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false }
                    ]
                },
                {
                    level: "REGIONAL / PROPINSI",
                    achievements: [
                        { achievement: "SC", credit: 2.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "KETUA", credit: 2.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "WAKIL KETUA", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "SEKRETARIS", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "BENDAHARA", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "KETUA BIDANG", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "ANGGOTA / PESERTA", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false }
                    ]
                },
                {
                    level: "KABUPATEN / KOTA",
                    achievements: [
                        { achievement: "SC", credit: 1.5, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "KETUA", credit: 1.5, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "WAKIL KETUA", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "SEKRETARIS", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "BENDAHARA", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "KETUA BIDANG", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "ANGGOTA / PESERTA", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false }
                    ]
                },
                {
                    level: "KECAMATAN",
                    achievements: [
                        { achievement: "SC", credit: 1.5, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "KETUA", credit: 1.5, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "WAKIL KETUA", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "SEKRETARIS", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "BENDAHARA", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "KETUA BIDANG", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "ANGGOTA / PESERTA", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false }
                    ]
                },
                {
                    level: "DESA / KELURAHAN",
                    achievements: [
                        { achievement: "SC", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "KETUA", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "WAKIL KETUA", credit: 0.5, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "SEKRETARIS", credit: 0.5, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "BENDAHARA", credit: 0.5, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "KETUA BIDANG", credit: 0.5, assessmentBasis: ["SK", "ST"], SKPI: false }
                    ]
                },
                {
                    level: "INTERNAL KAMPUS",
                    achievements: [
                        { achievement: "SC", credit: 1.5, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "KETUA", credit: 1.5, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "WAKIL KETUA", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "SEKRETARIS", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "BENDAHARA", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "KETUA BIDANG", credit: 1.0, assessmentBasis: ["SK", "ST"], SKPI: false },
                        { achievement: "ANGGOTA / PESERTA", credit: 0.5, assessmentBasis: ["SK", "ST"], SKPI: false }
                    ]
                }
            ]
        },
        {
            category: "KEJUARAAN / KOMPETISI / PERLOMBAAN",
            levels: [
                {
                    level: "INTERNASIONAL",
                    achievements: [
                        { achievement: "JUARA 1", credit: 6.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "JUARA 2", credit: 5.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "JUARA 3", credit: 4.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "HARAPAN 1,2,3", credit: 3.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "SEPULUH BESAR", credit: 3.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "PESERTA/PARTISIPASI", credit: 2.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "SUPPORTER RESMI", credit: 1.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true }
                    ]
                },
                {
                    level: "NASIONAL (BELMAWA/BAKORMA)",
                    achievements: [
                        { achievement: "JUARA 1", credit: 6.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "JUARA 2", credit: 5.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "JUARA 3", credit: 4.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "HARAPAN 1,2,3", credit: 3.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "SEPULUH BESAR", credit: 3.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false },
                        { achievement: "PESERTA/PARTISIPASI", credit: 2.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false },
                        { achievement: "SUPPORTER RESMI", credit: 1.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false }
                    ]
                },
                {
                    level: "PKM/PIMNAS",
                    achievements: [
                        { achievement: "MEDALI EMAS", credit: 6.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "MEDALI PERAK", credit: 5.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "MEDALI PERUNGGU", credit: 4.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "JUARA/PENGHARGAAN KATEGORI", credit: 3.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false },
                        { achievement: "LOLOS PIMNAS", credit: 3.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false },
                        { achievement: "LOLOS PENDANAAN PKM", credit: 2.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false },
                        { achievement: "JUARA TINGKAT POLINEMA", credit: 2.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false },
                        { achievement: "UPLOAD PROPOSAL SIMBELMAWA", credit: 1.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false },
                        { achievement: "PROPOSAL PKM", credit: 0.5, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false }
                    ]
                },
                {
                    level: "NASIONAL LAINNYA",
                    achievements: [
                        { achievement: "JUARA 1", credit: 4.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "JUARA 2", credit: 3.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "JUARA 3", credit: 2.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "HARAPAN 1,2,3", credit: 2.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "SEPULUH BESAR", credit: 1.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false },
                        { achievement: "PESERTA/PARTISIPASI", credit: 1.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false },
                        { achievement: "SUPPORTER RESMI", credit: 0.5, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false }
                    ]
                },
                {
                    level: "REGIONAL/PROPINSI",
                    achievements: [
                        { achievement: "JUARA 1", credit: 3.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "JUARA 2", credit: 2.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "JUARA 3", credit: 1.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "HARAPAN 1,2,3", credit: 1.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "SEPULUH BESAR", credit: 1.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false }
                    ]
                },
                {
                    level: "KABUPATEN/KOTA",
                    achievements: [
                        { achievement: "JUARA 1", credit: 2.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "JUARA 2", credit: 1.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "JUARA 3", credit: 1.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "HARAPAN 1,2,3", credit: 1.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: true },
                        { achievement: "SEPULUH BESAR", credit: 1.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false }
                    ]
                },
                {
                    level: "KECAMATAN",
                    achievements: [
                        { achievement: "JUARA 1", credit: 1.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false },
                        { achievement: "JUARA 2", credit: 0.5, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false },
                        { achievement: "JUARA 3", credit: 0.5, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false },
                        { achievement: "HARAPAN 1,2,3", credit: 0.5, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false },
                        { achievement: "SEPULUH BESAR", credit: 0.5, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false }
                    ]
                },
                {
                    level: "DESA/KELURAHAN",
                    achievements: [
                        { achievement: "JUARA 1", credit: 1.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false },
                        { achievement: "JUARA 2", credit: 1.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false },
                        { achievement: "JUARA 3", credit: 1.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false },
                        { achievement: "HARAPAN 1,2,3", credit: 0.5, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false },
                        { achievement: "SEPULUH BESAR", credit: 0.5, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false }
                    ]
                },
                {
                    level: "INTERNAL KAMPUS (Termasuk Pekan Olahraga dan Seni Jurusan)",
                    achievements: [
                        { achievement: "JUARA 1,2,3", credit: 1.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false },
                        { achievement: "HARAPAN 1,2,3", credit: 0.5, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false }
                    ]
                }
            ]
        },
        {
            category: "PENELITIAN, PENGABDIAN MASYARAKAT, SEMINAR, KULIAH TAMU DAN KEGIATAN ILMIAH LAINNYA",
            levels: [
                {
                    level: "INTERNASIONAL",
                    achievements: [
                        { achievement: "SC", credit: 4.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "KETUA", credit: 4.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "WAKIL KETUA", credit: 3.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "SEKRETARIS", credit: 2.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "BENDAHARA", credit: 2.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "KETUA BIDANG", credit: 1.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "ANGGOTA/PESERTA", credit: 1.5, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "PENYAJI/NARASUMBER", credit: 4.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false }
                    ]
                },
                {
                    level: "NASIONAL",
                    achievements: [
                        { achievement: "SC", credit: 3.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "KETUA", credit: 3.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "WAKIL KETUA", credit: 2.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "SEKRETARIS", credit: 1.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "BENDAHARA", credit: 1.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "KETUA BIDANG", credit: 1.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "ANGGOTA/PESERTA", credit: 1.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "PENYAJI/NARASUMBER", credit: 3.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false }
                    ]
                },
                {
                    level: "LOKAL",
                    achievements: [
                        { achievement: "SC", credit: 2.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "KETUA", credit: 2.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "WAKIL KETUA", credit: 1.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "SEKRETARIS", credit: 1.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "BENDAHARA", credit: 1.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "KETUA BIDANG", credit: 1.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "ANGGOTA/PESERTA", credit: 1.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "PENYAJI/NARASUMBER/MENTOR/TUTOR", credit: 2.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false }
                    ]
                }
            ]
        },
        {
            category: "PENGHARGAAN AKADEMIK DAN NON AKADEMIK",
            levels: [
                {
                    level: "INTERNASIONAL",
                    achievements: [
                        { achievement: "-", credit: 4.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false }
                    ]
                },
                {
                    level: "NASIONAL",
                    achievements: [
                        { achievement: "-", credit: 3.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false }
                    ]
                },
                {
                    level: "REGIONAL",
                    achievements: [
                        { achievement: "-", credit: 2.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false }
                    ]
                },
                {
                    level: "LOKAL",
                    achievements: [
                        { achievement: "-", credit: 1.0, assessmentBasis: ["PIAGAM", "SERTIFIKAT"], SKPI: false }
                    ]
                }
            ]
        },
        {
            category: "HAK PATEN, HAK CIPTA",
            levels: [
                {
                    level: "INTERNASIONAL",
                    achievements: [
                        { achievement: "-", credit: 6.0, assessmentBasis: ["SERTIFIKAT"], SKPI: false }
                    ]
                },
                {
                    level: "NASIONAL",
                    achievements: [
                        { achievement: "-", credit: 5.0, assessmentBasis: ["SERTIFIKAT"], SKPI: false }
                    ]
                }
            ]
        },
        {
            category: "PERTANDINGAN PERSAHABATAN ANTAR KAMPUS/JURUSAN/DENGAN PIHAK LAIN/INDUSTRI/INSTITUSI",
            levels: [
                {
                    level: "INTERNASIONAL",
                    achievements: [
                        { achievement: "KETUA TIM", credit: 2.0, assessmentBasis: ["ST", "SK"], SKPI: false },
                        { achievement: "PEMAIN", credit: 1.0, assessmentBasis: ["ST", "SK"], SKPI: false }
                    ]
                },
                {
                    level: "NASIONAL",
                    achievements: [
                        { achievement: "KETUA TIM", credit: 2.0, assessmentBasis: ["ST", "SK"], SKPI: false },
                        { achievement: "PEMAIN", credit: 1.0, assessmentBasis: ["ST", "SK"], SKPI: false }
                    ]
                },
                {
                    level: "REGIONAL / PROPINSI",
                    achievements: [
                        { achievement: "KETUA TIM", credit: 1.0, assessmentBasis: ["ST", "SK"], SKPI: false },
                        { achievement: "PEMAIN", credit: 1.0, assessmentBasis: ["ST", "SK"], SKPI: false }
                    ]
                },
                {
                    level: "KABUPATEN / KOTA",
                    achievements: [
                        { achievement: "KETUA TIM", credit: 1.0, assessmentBasis: ["ST", "SK"], SKPI: false },
                        { achievement: "PEMAIN", credit: 1.0, assessmentBasis: ["ST", "SK"], SKPI: false }
                    ]
                },
                {
                    level: "INTERNAL POLINEMA",
                    achievements: [
                        { achievement: "KETUA TIM", credit: 1.0, assessmentBasis: ["ST", "SK"], SKPI: false },
                        { achievement: "PEMAIN", credit: 0.5, assessmentBasis: ["ST", "SK"], SKPI: false }
                    ]
                }
            ]
        },
        {
            category: "KEGIATAN PENUNJANG AKADEMIK",
            levels: [
                {
                    level: "STUDI EKSKURSI / STUDI LAPANGAN",
                    achievements: [
                        { achievement: "PANITIA", credit: 2.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false },
                        { achievement: "PESERTA", credit: 1.0, assessmentBasis: ["SERTIFIKAT", "ST"], SKPI: false }
                    ]
                }
            ]
        }
    ]
};

export const departments = [
    "Akuntansi",
    "Administrasi Niaga",
    "Teknik Elektro",
    "Teknologi Informasi",
    "Teknik Kimia",
    "Teknik Mesin",
    "Teknik Sipil",
];

// --------------------------------------------------
// ----------------- END Dashboard ------------------
// --------------------------------------------------

export const navlinks = [
    {
        name: 'Dashboard',
        imgUrl: dashboard,
        link: '/skkm',
        role: null, // All roles
    },
    {
        name: 'Submit SKKM',
        imgUrl: submitSKKM,
        link: '/skkm/submit-skkm',
        role: [1], // Student
    },
    {
        name: 'My Points',
        imgUrl: detailSKKM,
        link: '/skkm/detail-skkm',
        role: [1], // Student
    },
    {
        name: 'Verify SKKM',
        imgUrl: verifySKKM,
        link: '/skkm/verify-skkm',
        role: [2], // HMJ
    },
    {
        name: 'Validate SKKM',
        imgUrl: validateSKKM,
        link: '/skkm/validate-skkm',
        role: [2], // HMJ
    },
    {
        name: 'Validate BEM',
        imgUrl: validateSKKM,
        link: '/skkm/validate-bem',
        role: [4], // BEM
    },
    {
        name: 'User',
        imgUrl: profile,
        link: '/skkm/user*',
        role: [3, 6], // Admin and Super Admin
    },
    {
        name: 'Points',
        imgUrl: updatePoint,
        link: '/skkm/points/*',
        role: [3, 6], // Admin and Super Admin
    },
    {
        name: 'Back',
        imgUrl: logout,
        link: '/',
        role: null, // Accessible by all roles
    },
];


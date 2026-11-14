import type React from 'react';
import {
    about,
    blog,
    docs,
} from '@/routes';
import {
    BookOpen,
    Compass,
    FileCheck2,
    HeartHandshake,
    Newspaper,
    ShieldCheck,
    Store,
    UserPlus,
    Users,
    UtensilsCrossed,
} from 'lucide-react';

export interface NavigationSubItem {
    id: string;
    label: string;
    description: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
}

export interface NavigationItem {
    id: string;
    label: string;
    href: string;
    subItems?: NavigationSubItem[];
}

export const INSTITUTIONAL_NAV_ITEMS: NavigationItem[] = [
    {
        id: 'about',
        label: 'Tentang Kami',
        href: about.url(),
        subItems: [
            {
                id: 'about-profile',
                label: 'Profil & Visi Misi',
                description: 'Sejarah, asas gotong royong, dan misi pemberdayaan',
                href: about.url(),
                icon: Compass,
            },
            {
                id: 'about-structure',
                label: 'Struktur Kepengurusan',
                description: 'Dewan pengurus, pengawas, dan legalitas koperasi',
                href: `${about.url()}#pengurus`,
                icon: Users,
            },
            {
                id: 'about-stores',
                label: 'Toko UMKM Binaan',
                description: 'Daftar mitra binaan produsen kuliner halal Bogor',
                href: `${about.url()}#umkm`,
                icon: Store,
                badge: 'Mitra',
            },
        ],
    },
    {
        id: 'blog',
        label: 'Blog & Kabar',
        href: blog.url(),
        subItems: [
            {
                id: 'blog-stories',
                label: 'Kisah UMKM',
                description: 'Perjuangan dan dedikasi ibu-ibu pengusaha kuliner',
                href: blog.url(),
                icon: HeartHandshake,
            },
            {
                id: 'blog-tips',
                label: 'Tips Kuliner & Frozen Food',
                description: 'Panduan penyimpanan beku dan penyajian higienis',
                href: blog.url(),
                icon: UtensilsCrossed,
            },
            {
                id: 'blog-news',
                label: 'Warta Koperasi',
                description: 'Kabar resmi kegiatan, pelatihan, dan pameran',
                href: blog.url(),
                icon: Newspaper,
            },
        ],
    },
    {
        id: 'docs',
        label: 'Dokumentasi & Legalitas',
        href: docs.url(),
        subItems: [
            {
                id: 'docs-halal',
                label: 'Sertifikasi Halal BPJPH',
                description: 'Standar kepatuhan syariat dan kurasi bahan baku',
                href: docs.url(),
                icon: ShieldCheck,
                badge: 'Wajib',
            },
            {
                id: 'docs-packaging',
                label: 'Standar Kemasan & Mutu',
                description: 'Spesifikasi plastik vakum beku dan uji kelayakan',
                href: docs.url(),
                icon: FileCheck2,
            },
            {
                id: 'docs-register',
                label: 'Pendaftaran Mitra Baru',
                description: 'Prosedur dan syarat bergabung sebagai UMKM binaan',
                href: docs.url(),
                icon: UserPlus,
            },
        ],
    },
];

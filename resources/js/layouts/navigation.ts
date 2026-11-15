import type React from 'react';
import {
    about,
    blog,
} from '@/routes';
import {
    Compass,
    HeartHandshake,
    Newspaper,
    Store,
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
                label: 'Profil Koperasi',
                description: 'Sejarah dan visi kami',
                href: about.url(),
                icon: Compass,
            },
            {
                id: 'about-structure',
                label: 'Pengurus',
                description: 'Susunan pengurus dan pengawas',
                href: `${about.url()}#pengurus`,
                icon: Users,
            },
            {
                id: 'about-stores',
                label: 'Mitra UMKM',
                description: 'Daftar usaha binaan di Bogor',
                href: `${about.url()}#umkm`,
                icon: Store,
            },
        ],
    },
    {
        id: 'blog',
        label: 'Blog',
        href: blog.url(),
        subItems: [
            {
                id: 'blog-stories',
                label: 'Cerita UMKM',
                description: 'Kisah para ibu pelaku usaha',
                href: blog.url(),
                icon: HeartHandshake,
            },
            {
                id: 'blog-tips',
                label: 'Tips Dapur',
                description: 'Cara simpan dan sajikan makanan',
                href: blog.url(),
                icon: UtensilsCrossed,
            },
            {
                id: 'blog-news',
                label: 'Kegiatan',
                description: 'Info acara dan pelatihan bersama',
                href: blog.url(),
                icon: Newspaper,
            },
        ],
    },
];

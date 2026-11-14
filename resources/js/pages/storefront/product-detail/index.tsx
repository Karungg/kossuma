import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { ProductDetail } from './types';
import { GalleryShowcase } from './components/gallery-showcase';
import { ProductInfoPanel } from './components/product-info-panel';
import { ProductAccordions } from './components/product-accordions';
import { PurchaseActionPod } from './components/purchase-action-pod';
import { RelatedProducts } from './components/related-products';
import { StorefrontLayout } from '@/layouts/storefront-layout';

const PRODUCT_DATA: ProductDetail = {
    id: 'prod-ayam-ungkep',
    slug: 'ayam-ungkep-bumbu-kuning',
    name: 'Ayam Ungkep Bumbu Kuning Siap Goreng',
    category: 'Olahan Unggas',
    categorySlug: 'olahan-unggas',
    description:
        'Ayam pejantan utuh berlumur rempah lengkuas parut melimpah khas Bogor. Tekstur empuk, gurih meresap hingga ke tulang dengan serundeng krispi.',
    price: 65000,
    originalPrice: 72000,
    discountPercent: 10,
    rating: 5.0,
    reviewCount: 89,
    stockStatus: 'Stok Tersedia',
    shippingFastInfo: 'Pengiriman Cepat: Sameday & Instant seluruh wilayah Kota & Kab Bogor.',
    producer: {
        name: 'Pawon Ibu Fatimah',
        district: 'Kel. Semplak',
        city: 'Bogor Barat',
        activeYears: 3,
        verified: true,
    },
    images: [
        {
            id: 'img-1',
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKv6itpyCuiTg9EeX6e4iqDtjixXEgm9GB_Cf0t8zHTcwjh-q3IKJt4beViYqyNUsGATze-oGvaOK4BDUrJo1n_208FEDK0LPSknKtvG38AgWQzQTqvgct2vjZFsIYWXmOBfbEPF3Ysimzn1VtYUYheFn9epEQHGElc9p9BQ0N878YyBLijOhQWoVo_5OF4TdeBqlUE_9Y5c2i9cYWoV8fA4Hr-OZBpZQUVNzJxrsw',
            alt: 'Ayam Ungkep Bumbu Kuning Siap Goreng',
            label: 'Ayam Rempah Utuh',
        },
        {
            id: 'img-2',
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOdXxM0HZIrTs027ijLSBHE5NsIagpZycr1ZOPpCgXOJkYOhm9JmrGMJIsaBHvehuTMf_aUSwwi0yZqxeheR26U0QQUmmraBzd7LUnyQJFsKASh4xJVZwelPZjBCbQcSuxzup4fue94mFPwLr6juo2Bs3NinTYJe5zKCp5W6MpnUXqs0_WdN4XU0uO_vb0F5blwF1Ia-mZW3CuCnz3_tenmOUX0M9n4N1S7Tl1Ql9k',
            alt: 'Detail Ayam Rempah',
            label: 'Detail Rempah Lengkuas',
        },
        {
            id: 'img-3',
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNrfAw4tQDCFlTJmh1YCi4dA7zAVHWcgxaYFfAM2bKUpDvDwxPNAIdFHLGH8BRCvFow_iM4t5BtPU-Ees8XRTe8x_bTMLNuTl6s6ipsU9e7TpRMAMDOXEHc3SpO_Z42ID_IyFwOz63fc7S4mo764qsW2w8HL1nWmaGNySvCHO0Glc3P-CIgbJjSFSwWjWsFkU-yqQHsuyWE3MGzIjDEsTTyjrhL9ACfBpmbabNqBf5',
            alt: 'Kemasan Frozen Vakum',
            label: 'Kemasan Vakum Higienis',
        },
        {
            id: 'img-4',
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoq0oQbm5ea01NgB-t7ibZG5czN8LIBbFMhjijj2tqfyDVr5c9aYTgz1Lu2sDCxwop-uUuo1fmGXfq_40UwRbqq3cuYHNvOfZOAcP7cokO2cclMnoYQ-UmWqdXMGqd0i68qKCrwfisZGV71DeSyN7XmRPWR1oJ0atm6QTB2x0Digg0KcQySv-KQRXeb16gQv9KwmookQRDgwSB8qnrZlbjoOIhRa5_-0OHNpSqoM9M',
            alt: 'Hasil Goreng Keemasan',
            label: 'Hasil Goreng Renyah',
        },
        {
            id: 'img-5',
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsHTkG2J-l-XivfjAvaIh5r2bo_2GcIx2spCWs0kgvU1BkRKBXmmtbkSpr4TbJCjBwin-RgopobRWJs9QJiPZHQKcVtRyNyUUDxAHovhWhEGHC-_E7tIzhqCgQeg1Yq0S_yTXwPBgZ01Kih9xiWcgBnao4wi_dXYJE1NRsON66FWBR5Ewg3i0pHzFtB19Jbf-iYz5Jgsp5gwpw09-lhOFkTWHhNs6BYB33OaPXMaEY',
            alt: 'Sertifikat Halal',
            label: 'Sertifikasi Halal',
        },
    ],
    specifications: [
        {
            title: 'Daya Simpan',
            value: '3 Bulan Freezer',
            description: 'Suhu -18°C (3 hari di chiller)',
        },
        {
            title: 'Saran Porsi',
            value: '4 - 6 Orang',
            description: '8 Potongan (2 paha, 2 dada, dst)',
        },
        {
            title: 'Paket Termasuk',
            value: 'Sambal Korek Bawang',
            description: 'Free Cup 50 gram Pedas Segar',
        },
    ],
    composition:
        'Dibuat dari ayam pejantan segar pilihan langsung dari peternakan lokal binaan. Dibumbui dengan kunyit segar Bogor, jahe wangi, lengkuas parut berlimpah, serai segar, daun salam, ketumbar sangrai, bawang merah, bawang putih, serta garam laut alami. Diproduksi 100% alami tanpa MSG sintesis dan bebas bahan pengawet kimia.',
    cookingInstructions: [
        '<strong>Thawing / Cairkan:</strong> Diamkan dalam suhu ruang selama 15-20 menit hingga bumbu tidak membeku.',
        '<strong>Goreng Cepat:</strong> Panaskan minyak goreng secukupnya pada api sedang (±170°C). Masukkan ayam dan goreng 3-4 menit hingga warna kuning keemasan.',
        '<strong>Goreng Serundeng Lengkuas:</strong> Saring bumbu rempah basah yang tersisa, goreng terpisah sebentar hingga garing keemasan lalu taburkan di atas ayam hangat.',
        '<strong>Air Fryer Friendly:</strong> Panggang pada suhu 180°C selama 10-12 menit untuk opsi lebih rendah kalori.',
    ],
    halalAudit:
        'Produk diproduksi di bawah pengawasan berkala tim Kurasi Mutu Halal Kossuma Kota Bogor. Memenuhi sertifikasi penyembelihan syariah (RPH bersertifikat Halal) serta proses pengolahan higienis bersertifikasi BPJPH ID32110001892837.',
    relatedProducts: [
        {
            id: 'rel-1',
            slug: 'bebek-ungkep-rempah-madura',
            name: 'Bebek Ungkep Bumbu Rempah Madura',
            storeName: 'Pawon Ibu Fatimah',
            price: 75000,
            portion: '1 Ekor',
            badge: 'Halal BPJPH',
            rating: 4.9,
            imageUrl:
                'https://lh3.googleusercontent.com/aida-public/AB6AXuDLWBVerFO5EfWMAIvTfKnkW7rYMrRdH_YnbjE7v8HxyjNcyvtj-N-S-oNjhhkqHknFB0dfSCzB8ooe3BcnSmNGoSNOupSNtB1cU4-RbKPI3Qm-GBW0jLZPZo8u5Fkl4Z3bPj8KCWuLmFS_Sh4DgN5orqEw8G54XCtfoZtCDtuFNzHpjvB3UmQ4kTfVFbz57jC4rkdTeKMVO1z_kefw8zOSHQo1rYyzYJ6Jxdw0jvVz',
            imageAlt: 'Bebek Ungkep Bumbu Rempah Madura',
        },
        {
            id: 'rel-2',
            slug: 'ikan-nila-bumbu-kuning',
            name: 'Ikan Nila Bumbu Kuning Marinasi Segar',
            storeName: 'Ikan Segar Mandiri',
            price: 32500,
            portion: '500 gr',
            badge: 'Segar Higienis',
            rating: 4.8,
            imageUrl:
                'https://lh3.googleusercontent.com/aida-public/AB6AXuCoUokVVLpCbVhf3IARC0lkF7X92-XutStvAs6Z4PVBdf3xuL3ETcgP9LMS0iMoma0kiCtVpkeIzbb2RaTgf7UmXQw1mHQR4z6QLzdpYcF7o3F3tqDrXtZ6V5wSoBwU_UYFkwP1Uu_3t09RP0YgM0ZPcWk-jXyeITmi5giCsBmEKfzaohOmwuvNTBqyI2fGNfiPDxQbs2PLX6NTcXTuV6huDPdGslnz58eLYlzrndl4',
            imageAlt: 'Ikan Nila Bumbu Kuning Marinasi Segar',
        },
        {
            id: 'rel-3',
            slug: 'sambal-cumi-asin-cabe-ijo',
            name: 'Sambal Cumi Asin Cabe Ijo Pedas Gurih',
            storeName: 'Sambal Selera Muslimah',
            price: 30000,
            portion: '200 gr',
            badge: 'Pedas Nagih',
            rating: 4.9,
            imageUrl:
                'https://lh3.googleusercontent.com/aida-public/AB6AXuB0VSG_y6LXdx1nfVpOeGxF_9GN_9dyU8EjVZpeNnASvj8vBXUMdRRJsipSUO5ax7R-eR5e8CdevHY3ljLjWpPEX7oc2dMlLp6hVOQ6864SWrmaxO6xKEKY4VCNNdMJGOXbSv3reLEJnkLyVaBVcE85E-UBIgOtvD6PMOiKVM3EK28_U-2L2i2fpNMDhgMDIKgQsQTE5ZYdYOY9vkrMu9gMhCGSOsT_u1G8UlG-a5jH',
            imageAlt: 'Sambal Cumi Asin Cabe Ijo Pedas Gurih',
        },
        {
            id: 'rel-4',
            slug: 'paru-sapi-ungkep',
            name: 'Paru Sapi Ungkep Gurih Empuk',
            storeName: 'Dapur Ummu Hafizh',
            price: 58000,
            portion: '350 gr',
            badge: 'Empuk Gurih',
            rating: 4.9,
            imageUrl:
                'https://lh3.googleusercontent.com/aida-public/AB6AXuB_kjVJzgv8FRlQtweqZsvN7O6EHzQD_uXI9Y6EbSLH_L7tDshQEH-H2P1xhi6VYAttlxoGbcO0aQa8rQtSwDSAdJuCSPxf1DBxfO2B5MtjnM7ioCUNEKBwHHKvuQuAkqMpNvBjpl_K8da4EEvOvEAkxw2m_9ECUQMY_K0KYJ2kiI8RCG0Tdba_wRDDbtFpsWArA67RDyLBLk1urxhLo47uq-myEuXvZAb8BCAMnAz8',
            imageAlt: 'Paru Sapi Ungkep Gurih Empuk',
        },
    ],
};

export function ProductDetailPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [cartCount, setCartCount] = useState(2);

    const handleAddToCart = (qty: number) => {
        setCartCount((prev) => prev + qty);
    };

    return (
        <StorefrontLayout
            cartCount={cartCount}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
        >
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
                {/* Breadcrumbs & Quick Back */}
                <div className="bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-[#7D3394] text-xs font-bold shrink-0 cursor-pointer"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Kembali ke Beranda</span>
                        </Link>

                        <nav
                            aria-label="Breadcrumb"
                            className="hidden md:flex items-center gap-2 text-xs text-gray-500 min-w-0"
                        >
                            <span className="text-gray-300">/</span>
                            <Link href={home()} className="cursor-pointer">
                                Beranda
                            </Link>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-600">
                                {PRODUCT_DATA.category}
                            </span>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-900 font-semibold truncate">
                                {PRODUCT_DATA.name}
                            </span>
                        </nav>
                    </div>
                </div>

                {/* Main Product Detail Grid (5 cols visual gallery, 7 cols information) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-5">
                        <GalleryShowcase images={PRODUCT_DATA.images} />
                    </div>

                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <ProductInfoPanel product={PRODUCT_DATA} />

                        <ProductAccordions
                            composition={PRODUCT_DATA.composition}
                            cookingInstructions={PRODUCT_DATA.cookingInstructions}
                            halalAudit={PRODUCT_DATA.halalAudit}
                        />

                        <PurchaseActionPod
                            unitPrice={PRODUCT_DATA.price}
                            productName={PRODUCT_DATA.name}
                            onAddToCart={handleAddToCart}
                        />
                    </div>
                </div>

                {/* Related Products */}
                <RelatedProducts items={PRODUCT_DATA.relatedProducts} />
            </div>
        </StorefrontLayout>
    );
}

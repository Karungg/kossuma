import { useState, useMemo } from "react";
import type { CatalogProduct, CategoryTab } from "./types";
import { HeroBanner } from "./components/hero-banner";
import { CategoryTabs } from "./components/category-tabs";
import { ProductCard } from "./components/product-card";
import { StorefrontLayout } from "@/layouts/storefront-layout";
import { Search } from "lucide-react";

const CATEGORIES: CategoryTab[] = [
    { id: "all", label: "Semua" },
    { id: "frozen", label: "Frozen Food" },
    { id: "ayam", label: "Ayam" },
    { id: "ikan", label: "Ikan" },
    { id: "lauk", label: "Lauk Matang" },
    { id: "kue", label: "Kue & Camilan" },
    { id: "bumbu", label: "Bumbu & Sambal" },
];

const PRODUCTS: CatalogProduct[] = [
    {
        id: "prod-kaki-naga-ayam",
        slug: "kaki-naga-ayam",
        title: "Kaki Naga Ayam",
        description: "Olahan daging ayam segar bumbu rempah gurih siap goreng",
        category: "frozen",
        price: 28000,
        originalPrice: 32000,
        rating: 4.9,
        soldCount: "1.2rb terjual",
        storeName: "Dapur Ummi Salma",
        storeDistrict: "Tanah Sareal",
        imageUrl: "/assets/images/products/kaki-naga-ayam.jpg",
        imageAlt: "Kaki Naga Ayam olahan beku siap goreng",
    },
    {
        id: "prod-lumpia-ayam",
        slug: "lumpia-ayam",
        title: "Lumpia Ayam",
        description: "Lumpia renyah isi daging ayam cincang gurih dan sayuran",
        category: "frozen",
        price: 26000,
        originalPrice: 30000,
        rating: 4.9,
        soldCount: "850 terjual",
        storeName: "Pawon Ibu Fatimah",
        storeDistrict: "Semplak",
        imageUrl: "/assets/images/products/lumpia-ayam.jpg",
        imageAlt: "Lumpia Ayam siap goreng renyah",
    },
    {
        id: "prod-lumpia-ayam-bg-putih",
        slug: "lumpia-ayam-bg-putih",
        title: "Lumpia Ayam BG Putih",
        description:
            "Lumpia ayam kemasan higienis latar putih praktis siap masak",
        category: "ayam",
        price: 27000,
        rating: 4.8,
        soldCount: "640 terjual",
        storeName: "Pawon Ibu Fatimah",
        storeDistrict: "Semplak",
        imageUrl: "/assets/images/products/lumpia-ayam-bg-putih.png",
        imageAlt: "Lumpia Ayam BG Putih kemasan siap saji",
    },
    {
        id: "prod-lumpia-udang",
        slug: "lumpia-udang",
        title: "Lumpia Udang",
        description: "Lumpia isi olahan udang segar cincang renyah dan gurih",
        category: "frozen",
        price: 32000,
        originalPrice: 35000,
        rating: 4.9,
        soldCount: "920 terjual",
        storeName: "Pawon Ibu Fatimah",
        storeDistrict: "Bogor Barat",
        imageUrl: "/assets/images/products/lumpia-udang.jpg",
        imageAlt: "Lumpia Udang olahan udang segar siap goreng",
    },
    {
        id: "prod-lumpia-udang-bg-putih",
        slug: "lumpia-udang-bg-putih",
        title: "Lumpia Udang BG Putih",
        description:
            "Lumpia udang kemasan bersih latar putih dengan udang segar pilihan",
        category: "ikan",
        price: 33000,
        rating: 4.8,
        soldCount: "510 terjual",
        storeName: "Pawon Ibu Fatimah",
        storeDistrict: "Bogor Barat",
        imageUrl: "/assets/images/products/lumpia-udang-bg-putih.png",
        imageAlt: "Lumpia Udang BG Putih kemasan praktis",
    },
    {
        id: "prod-1",
        slug: "lapis-talas-khas-bogor-keju",
        title: "Lapis Talas Khas Bogor Original Keju Premium",
        description:
            "Kue lapis talas lembut aroma pandan dengan taburan keju melimpah",
        category: "kue",
        price: 38000,
        originalPrice: 42000,
        rating: 4.9,
        soldCount: "1.2rb terjual",
        storeName: "Dapur Ummu Hafizh",
        storeDistrict: "Pajajaran",
        imageUrl: "",
        imageAlt: "Lapis Talas Khas Bogor Original Keju Premium",
    },
    {
        id: "prod-2",
        slug: "ayam-ungkep-bumbu-kuning",
        title: "Ayam Ungkep Bumbu Kuning Lengkuas Siap Goreng (1 Ekor)",
        description:
            "Ayam ungkep bumbu rempah kuning gurih meresap siap goreng",
        category: "ayam",
        price: 65000,
        rating: 4.9,
        soldCount: "850 terjual",
        storeName: "Ayam Berkah Barokah",
        storeDistrict: "Tanah Sareal",
        imageUrl: "",
        imageAlt: "Ayam Ungkep Bumbu Kuning Lengkuas Siap Goreng (1 Ekor)",
    },
    {
        id: "prod-3",
        slug: "dimsum-ayam-udang-premium",
        title: "Dimsum Ayam Udang Premium Halal + Saus Merah (Isi 10)",
        description:
            "Dimsum kenyal padat daging ayam udang dengan saus asam manis pedas",
        category: "frozen",
        price: 35000,
        rating: 4.8,
        soldCount: "920 terjual",
        storeName: "Dimsum Muslimah",
        storeDistrict: "Bogor Barat",
        imageUrl: "",
        imageAlt: "Dimsum Ayam Udang Premium Halal + Saus Merah (Isi 10)",
    },
    {
        id: "prod-4",
        slug: "risol-mayo-smoked-beef",
        title: "Risol Mayo Smoked Beef & Telur Keju Lumer (Isi 5 Pcs)",
        description:
            "Risol renyah isian smoked beef gurih dan saus mayo keju lumer",
        category: "kue",
        price: 28000,
        rating: 4.9,
        soldCount: "740 terjual",
        storeName: "Snack Gurih Bunda",
        storeDistrict: "Bogor Tengah",
        imageUrl: "",
        imageAlt: "Risol Mayo Smoked Beef & Telur Keju Lumer (Isi 5 Pcs)",
    },
    {
        id: "prod-5",
        slug: "ikan-nila-bumbu-kuning",
        title: "Ikan Nila Bumbu Kuning Marinasi Segar Siap Masak 500g",
        description:
            "Ikan nila segar marinasi bumbu rempah kuning alami tanpa pengawet",
        category: "ikan",
        price: 32500,
        rating: 4.8,
        soldCount: "530 terjual",
        storeName: "Ikan Segar Mandiri",
        storeDistrict: "Bogor Selatan",
        imageUrl: "",
        imageAlt: "Ikan Nila Bumbu Kuning Marinasi Segar Siap Masak 500g",
    },
    {
        id: "prod-6",
        slug: "sambal-cumi-asin-cabe-ijo",
        title: "Sambal Cumi Asin Cabe Ijo Pedas Gurih Toples 200g",
        description:
            "Sambal cumi asin empuk gurih dengan cabe ijo segar pedas mantap",
        category: "bumbu",
        price: 30000,
        rating: 4.9,
        soldCount: "610 terjual",
        storeName: "Sambal Selera Muslimah",
        storeDistrict: "Sukasari",
        imageUrl: "",
        imageAlt: "Sambal Cumi Asin Cabe Ijo Pedas Gurih Toples 200g",
    },
    {
        id: "prod-7",
        slug: "bolu-gulung-pandan-keju",
        title: "Bolu Gulung Pandan Keju Lapis Legit Lembut Khas Bogor",
        description:
            "Bolu gulung aroma pandan wangi berpadu keju gurih khas Kota Bogor",
        category: "kue",
        price: 42000,
        rating: 4.9,
        soldCount: "490 terjual",
        storeName: "Bolu Hanifa",
        storeDistrict: "Baranangsiang",
        imageUrl: "",
        imageAlt: "Bolu Gulung Pandan Keju Lapis Legit Lembut Khas Bogor",
    },
    {
        id: "prod-8",
        slug: "bakso-sapi-urat-frozen",
        title: "Bakso Sapi Urat Halus Kuah Kaldu Frozen Pack Isi 20",
        description:
            "Bakso daging sapi asli tekstur urat mantap lengkap dengan kuah kaldu",
        category: "lauk",
        price: 45000,
        rating: 4.8,
        soldCount: "680 terjual",
        storeName: "Bakso Barokah",
        storeDistrict: "Bogor Utara",
        imageUrl: "",
        imageAlt: "Bakso Sapi Urat Halus Kuah Kaldu Frozen Pack Isi 20",
    },
];

export function StorefrontHomePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    const filteredProducts = useMemo(() => {
        return PRODUCTS.filter((product) => {
            const matchesCategory =
                activeCategory === "all" || product.category === activeCategory;
            const matchesSearch =
                searchQuery.trim() === "" ||
                product.title
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                (product.description
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ??
                    false) ||
                product.storeName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, activeCategory]);

    return (
        <StorefrontLayout
            cartCount={2}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
        >
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
                {/* Hero Banner */}
                <HeroBanner />

                {/* Category Filter Tabs */}
                <CategoryTabs
                    categories={CATEGORIES}
                    activeCategory={activeCategory}
                    onSelectCategory={setActiveCategory}
                />

                {/* Product Grid Section */}
                <section className="flex flex-col gap-6">
                    {filteredProducts.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 flex flex-col items-center justify-center gap-3">
                            <Search className="w-12 h-12 text-gray-300" />
                            <h3 className="text-lg font-bold text-gray-900">
                                Tidak ada produk yang cocok
                            </h3>
                            <p className="text-sm text-gray-500 max-w-sm">
                                Coba ubah kata kunci pencarian atau pilih
                                kategori lainnya.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </StorefrontLayout>
    );
}

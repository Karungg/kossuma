import { useState, useMemo } from 'react';
import {
    ArrowLeft,
    Banknote,
    Building2,
    CheckCircle2,
    MapPin,
    QrCode,
    Receipt,
    ShieldCheck,
    Store,
    Ticket,
    Truck,
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { cart, home } from '@/routes';
import { payment as checkoutPayment } from '@/routes/checkout';
import { StorefrontLayout } from '@/layouts/storefront-layout';
import type {
    BankOption,
    CheckoutAddress,
    CheckoutItem,
    PaymentMethodType,
    ShippingOption,
    VoucherOption,
} from './types';

const ADDRESSES: CheckoutAddress[] = [
    {
        id: 'addr-1',
        label: 'Rumah',
        recipientName: 'Ibu Siti Aminah',
        phone: '0812-8844-1122',
        fullAddress: 'Jl. Cimanggu Permai Blok B2 No. 14',
        district: 'Tanah Sareal',
        city: 'Kota Bogor, Jawa Barat 16164',
        isPrimary: true,
    },
    {
        id: 'addr-2',
        label: 'Kantor',
        recipientName: 'Ibu Siti Aminah',
        phone: '0812-8844-1122',
        fullAddress: 'Jl. Raya Pajajaran No. 45, Gedung Koperasi',
        district: 'Bogor Tengah',
        city: 'Kota Bogor, Jawa Barat 16143',
        isPrimary: false,
    },
];

const CHECKOUT_ITEMS: CheckoutItem[] = [
    {
        id: 'item-1',
        storeName: 'Dapur Ummi Salma — Tanah Sareal',
        name: 'Risol Mayo Smoked Beef & Telur Keju Lumer',
        variant: 'Varian: 450 gr (Isi 10 pcs)',
        price: 35000,
        originalPrice: 38000,
        quantity: 1,
        imageUrl: '',
    },
];

const SHIPPING_OPTIONS: ShippingOption[] = [
    {
        id: 'sameday',
        name: 'Kirim Hari yang Sama',
        estimate: 'Tiba hari ini (3–6 jam)',
        price: 12000,
        description: 'Kurir koperasi menjaga suhu makanan tetap segar',
    },
    {
        id: 'instant',
        name: 'Kirim Instan',
        estimate: 'Tiba dalam 1–2 jam',
        price: 20000,
        description: 'Pengantaran langsung ke alamat tujuan',
    },
    {
        id: 'pickup',
        name: 'Ambil Sendiri di Koperasi',
        estimate: 'Siap diambil hari ini',
        price: 0,
        description: 'Jl. Merdeka No. 22, Bogor Tengah',
    },
];

const VOUCHERS: VoucherOption[] = [
    {
        id: 'v-diskon10k',
        code: 'DISKON10K',
        title: 'Potongan Belanja Rp10.000',
        description: 'Min. belanja Rp30.000 untuk seluruh produk UMKM',
        discountAmount: 10000,
        type: 'subtotal',
        minPurchase: 30000,
    },
    {
        id: 'v-gratisongkir',
        code: 'GRATISONGKIR',
        title: 'Gratis Ongkos Kirim s.d. Rp15.000',
        description: 'Berlaku untuk pengantaran wilayah Kota & Kab. Bogor',
        discountAmount: 15000,
        type: 'shipping',
        minPurchase: 25000,
    },
];

const BANKS: BankOption[] = [
    {
        id: 'bsi',
        name: 'Bank Syariah Indonesia (BSI)',
        shortName: 'BSI',
        description: 'Otomatis terverifikasi melalui Virtual Account',
    },
    {
        id: 'bca',
        name: 'Bank Central Asia (BCA)',
        shortName: 'BCA',
        description: 'Transfer mudah via m-BCA atau KlikBCA',
    },
    {
        id: 'mandiri',
        name: 'Bank Mandiri',
        shortName: 'Mandiri',
        description: 'Bayar cepat melalui Livin’ by Mandiri',
    },
    {
        id: 'bri',
        name: 'Bank Rakyat Indonesia (BRI)',
        shortName: 'BRI',
        description: 'Mendukung BRImo dan ATM Bersama',
    },
];

export function CheckoutPage() {
    const [selectedAddressId, setSelectedAddressId] = useState(ADDRESSES[0].id);
    const [isAddressListOpen, setIsAddressListOpen] = useState(false);
    const [selectedShippingId, setSelectedShippingId] = useState(SHIPPING_OPTIONS[0].id);
    const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('qris');
    const [selectedBankId, setSelectedBankId] = useState<BankOption['id']>('bsi');
    const [note, setNote] = useState('');

    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    const selectedAddress =
        ADDRESSES.find((a) => a.id === selectedAddressId) ?? ADDRESSES[0];
    const selectedShipping =
        SHIPPING_OPTIONS.find((s) => s.id === selectedShippingId) ?? SHIPPING_OPTIONS[0];
    const selectedVoucher = VOUCHERS.find((v) => v.id === selectedVoucherId) ?? null;

    const calculation = useMemo(() => {
        const itemsSubtotal = CHECKOUT_ITEMS.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
        );
        const productDiscount = CHECKOUT_ITEMS.reduce(
            (sum, item) =>
                sum +
                (item.originalPrice && item.originalPrice > item.price
                    ? (item.originalPrice - item.price) * item.quantity
                    : 0),
            0,
        );
        const originalItemsTotal = itemsSubtotal + productDiscount;
        const shippingFee = selectedShipping.price;

        let voucherDiscount = 0;
        if (selectedVoucher && itemsSubtotal >= selectedVoucher.minPurchase) {
            if (selectedVoucher.type === 'subtotal') {
                voucherDiscount = Math.min(itemsSubtotal, selectedVoucher.discountAmount);
            } else {
                voucherDiscount = Math.min(shippingFee, selectedVoucher.discountAmount);
            }
        }

        const serviceFee = 1000;
        const grandTotal = Math.max(
            0,
            itemsSubtotal + shippingFee - voucherDiscount + serviceFee,
        );

        return {
            originalItemsTotal,
            productDiscount,
            itemsSubtotal,
            shippingFee,
            voucherDiscount,
            serviceFee,
            grandTotal,
        };
    }, [selectedShipping, selectedVoucher]);

    const handlePayNow = () => {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const orderId = `KSM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomNum}`;

        router.visit(
            checkoutPayment.url({
                query: {
                    method: paymentMethod,
                    bank: selectedBankId,
                    total: calculation.grandTotal,
                    order_id: orderId,
                },
            }),
        );
    };

    return (
        <StorefrontLayout cartCount={CHECKOUT_ITEMS.length}>
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
                {/* Breadcrumbs & Kembali */}
                <div className="bg-white rounded-xl px-4 py-3 border border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link
                            href={cart()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-[#7D3394] text-xs font-bold shrink-0 cursor-pointer"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Kembali ke Keranjang</span>
                        </Link>

                        <nav
                            aria-label="Breadcrumb"
                            className="hidden md:flex items-center gap-2 text-xs text-gray-500"
                        >
                            <span className="text-gray-300">/</span>
                            <Link href={home()} className="cursor-pointer">
                                Beranda
                            </Link>
                            <span className="text-gray-300">/</span>
                            <Link href={cart()} className="cursor-pointer">
                                Keranjang
                            </Link>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-900 font-semibold">Checkout</span>
                        </nav>
                    </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] tracking-tight">
                    Checkout Pesanan
                </h1>

                {/* Main 2-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Kolom Kiri (8 kolom): Alamat, Produk, Pengiriman, Voucher, Pembayaran */}
                    <div className="lg:col-span-8 flex flex-col gap-5">
                        {/* 1. Alamat Pengiriman */}
                        <section className="bg-white rounded-xl p-5 border border-gray-200 flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-[#7D3394]" />
                                    <h2 className="text-base font-bold text-gray-900">
                                        Alamat Pengiriman
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAddressListOpen((prev) => !prev)}
                                    className="text-xs font-bold text-[#7D3394] px-3 py-1.5 rounded-lg bg-[#F0E6F5] cursor-pointer"
                                >
                                    {isAddressListOpen ? 'Tutup Pilihan' : 'Ganti Alamat'}
                                </button>
                            </div>

                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-900">
                                        {selectedAddress.recipientName}
                                    </span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs font-semibold text-[#7D3394]">
                                        {selectedAddress.label}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-600">
                                    {selectedAddress.phone}
                                </span>
                                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed pt-0.5">
                                    {selectedAddress.fullAddress}, {selectedAddress.district},{' '}
                                    {selectedAddress.city}
                                </p>
                            </div>

                            {isAddressListOpen && (
                                <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                                    <span className="text-xs font-semibold text-gray-600">
                                        Pilih alamat tersimpan:
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {ADDRESSES.map((addr) => {
                                            const isSelected = addr.id === selectedAddressId;
                                            return (
                                                <button
                                                    key={addr.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedAddressId(addr.id);
                                                        setIsAddressListOpen(false);
                                                    }}
                                                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 cursor-pointer ${
                                                        isSelected
                                                            ? 'border-[#7D3394] bg-[#F0E6F5]/40'
                                                            : 'border-gray-200 bg-white'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-[#7D3394]">
                                                            {addr.label}
                                                        </span>
                                                        {isSelected && (
                                                            <CheckCircle2 className="w-4 h-4 text-[#7D3394]" />
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-900">
                                                        {addr.recipientName}
                                                    </span>
                                                    <span className="text-xs text-gray-600 line-clamp-2">
                                                        {addr.fullAddress}, {addr.district}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* 2. Daftar Produk & Pengiriman */}
                        <section className="bg-white rounded-xl p-5 border border-gray-200 flex flex-col gap-5">
                            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                                <Store className="w-5 h-5 text-[#7D3394]" />
                                <h2 className="text-base font-bold text-gray-900">
                                    Pesanan Produk &amp; Pengiriman
                                </h2>
                            </div>

                            {CHECKOUT_ITEMS.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start justify-between gap-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center text-[10px] text-gray-400">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                'Foto'
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-gray-500">
                                                {item.storeName}
                                            </span>
                                            <span className="text-sm font-bold text-gray-900">
                                                {item.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {item.variant} • {item.quantity} barang
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end shrink-0">
                                        <span className="text-sm font-bold text-gray-900">
                                            {formatRupiah(item.price * item.quantity)}
                                        </span>
                                        {item.originalPrice && (
                                            <span className="text-xs text-gray-400 line-through">
                                                {formatRupiah(item.originalPrice * item.quantity)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Catatan Penjual */}
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="checkout-note"
                                    className="text-xs font-semibold text-gray-700"
                                >
                                    Catatan untuk Penjual (Opsional)
                                </label>
                                <input
                                    id="checkout-note"
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Misal: Minta kirim dalam keadaan beku, saus dipisah"
                                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-gray-300 focus:border-[#7D3394] focus:outline-none"
                                />
                            </div>

                            {/* Pilihan Kurir Pengiriman */}
                            <div className="flex flex-col gap-2.5 pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-[#7D3394]" />
                                    <span className="text-sm font-bold text-gray-900">
                                        Pilih Metode Pengiriman
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {SHIPPING_OPTIONS.map((opt) => {
                                        const isSelected = opt.id === selectedShippingId;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setSelectedShippingId(opt.id)}
                                                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 cursor-pointer ${
                                                    isSelected
                                                        ? 'border-[#7D3394] bg-[#F0E6F5]/40'
                                                        : 'border-gray-200 bg-white'
                                                }`}
                                            >
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                                                        {opt.name}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500">
                                                        {opt.estimate}
                                                    </span>
                                                </div>
                                                <span className="text-xs sm:text-sm font-extrabold text-[#7D3394]">
                                                    {opt.price === 0
                                                        ? 'Gratis'
                                                        : formatRupiah(opt.price)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        {/* 3. Pilihan Voucher */}
                        <section className="bg-white rounded-xl p-5 border border-gray-200 flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <Ticket className="w-5 h-5 text-[#7D3394]" />
                                <h2 className="text-base font-bold text-gray-900">
                                    Voucher &amp; Promo Tersedia
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {VOUCHERS.map((voucher) => {
                                    const isSelected = selectedVoucherId === voucher.id;
                                    const isEligible =
                                        calculation.itemsSubtotal >= voucher.minPurchase;

                                    return (
                                        <button
                                            key={voucher.id}
                                            type="button"
                                            disabled={!isEligible}
                                            onClick={() =>
                                                setSelectedVoucherId(
                                                    isSelected ? null : voucher.id,
                                                )
                                            }
                                            className={`p-3.5 rounded-xl border text-left flex items-start justify-between gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                                isSelected
                                                    ? 'border-[#7D3394] bg-[#F0E6F5]/50'
                                                    : 'border-gray-200 bg-white'
                                            }`}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-bold text-[#7D3394]">
                                                    {voucher.code}
                                                </span>
                                                <span className="text-xs sm:text-sm font-bold text-gray-900">
                                                    {voucher.title}
                                                </span>
                                                <span className="text-[11px] text-gray-500">
                                                    {voucher.description}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <CheckCircle2 className="w-4 h-4 text-[#7D3394] shrink-0 mt-0.5" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* 4. Metode Pembayaran */}
                        <section className="bg-white rounded-xl p-5 border border-gray-200 flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-[#7D3394]" />
                                <h2 className="text-base font-bold text-gray-900">
                                    Metode Pembayaran
                                </h2>
                            </div>

                            <div className="flex flex-col gap-3">
                                {/* Opsi 1: QRIS */}
                                <div
                                    onClick={() => setPaymentMethod('qris')}
                                    className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer ${
                                        paymentMethod === 'qris'
                                            ? 'border-[#7D3394] bg-[#F0E6F5]/40'
                                            : 'border-gray-200 bg-white'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        checked={paymentMethod === 'qris'}
                                        onChange={() => setPaymentMethod('qris')}
                                        className="mt-1 accent-[#7D3394] cursor-pointer"
                                    />
                                    <QrCode className="w-5 h-5 text-[#7D3394] shrink-0 mt-0.5" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-bold text-gray-900">
                                            QRIS (Scan Instan)
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Bayar cepat dari GoPay, OVO, Dana, ShopeePay, dan semua m-Banking
                                        </span>
                                    </div>
                                </div>

                                {/* Opsi 2: Transfer Bank / Virtual Account */}
                                <div
                                    onClick={() => setPaymentMethod('bank')}
                                    className={`p-4 rounded-xl border flex flex-col gap-3 cursor-pointer ${
                                        paymentMethod === 'bank'
                                            ? 'border-[#7D3394] bg-[#F0E6F5]/40'
                                            : 'border-gray-200 bg-white'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            checked={paymentMethod === 'bank'}
                                            onChange={() => setPaymentMethod('bank')}
                                            className="mt-1 accent-[#7D3394] cursor-pointer"
                                        />
                                        <Building2 className="w-5 h-5 text-[#7D3394] shrink-0 mt-0.5" />
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-bold text-gray-900">
                                                Transfer Virtual Account Bank
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Verifikasi otomatis melalui nomor Virtual Account
                                            </span>
                                        </div>
                                    </div>

                                    {paymentMethod === 'bank' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-7 pt-1">
                                            {BANKS.map((bank) => {
                                                const isBankSelected = selectedBankId === bank.id;
                                                return (
                                                    <button
                                                        key={bank.id}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedBankId(bank.id);
                                                        }}
                                                        className={`p-3 rounded-lg border text-left flex items-center justify-between gap-2 cursor-pointer ${
                                                            isBankSelected
                                                                ? 'border-[#7D3394] bg-white'
                                                                : 'border-gray-200 bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-gray-900">
                                                                {bank.name}
                                                            </span>
                                                            <span className="text-[11px] text-gray-500">
                                                                {bank.description}
                                                            </span>
                                                        </div>
                                                        {isBankSelected && (
                                                            <CheckCircle2 className="w-4 h-4 text-[#7D3394] shrink-0" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Opsi 3: Bayar di Tempat (COD) */}
                                <div
                                    onClick={() => setPaymentMethod('cod')}
                                    className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer ${
                                        paymentMethod === 'cod'
                                            ? 'border-[#7D3394] bg-[#F0E6F5]/40'
                                            : 'border-gray-200 bg-white'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                        className="mt-1 accent-[#7D3394] cursor-pointer"
                                    />
                                    <Banknote className="w-5 h-5 text-[#7D3394] shrink-0 mt-0.5" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-bold text-gray-900">
                                            Bayar di Tempat (COD)
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Siapkan uang tunai saat kurir tiba mengantarkan pesanan
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Kolom Kanan (4 kolom Sticky): Ringkasan Tagihan */}
                    <div className="lg:col-span-4 lg:sticky lg:top-[132px]">
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col gap-5">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center justify-between">
                                <span>Ringkasan Tagihan</span>
                                <Receipt className="w-5 h-5 text-[#7D3394]" />
                            </h2>

                            <div className="flex flex-col gap-2.5 text-sm">
                                <div className="flex items-center justify-between text-gray-600">
                                    <span>Subtotal Harga Barang</span>
                                    <span className="font-semibold text-gray-900">
                                        {formatRupiah(calculation.itemsSubtotal)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-gray-600">
                                    <span>Ongkos Kirim ({selectedShipping.name})</span>
                                    <span className="font-semibold text-gray-900">
                                        {calculation.shippingFee === 0
                                            ? 'Gratis'
                                            : formatRupiah(calculation.shippingFee)}
                                    </span>
                                </div>

                                {calculation.voucherDiscount > 0 && (
                                    <div className="flex items-center justify-between text-gray-600">
                                        <span>Potongan Voucher ({selectedVoucher?.code})</span>
                                        <span className="font-semibold text-[#059669]">
                                            -{formatRupiah(calculation.voucherDiscount)}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-gray-600">
                                    <span>Biaya Layanan &amp; Infaq Koperasi</span>
                                    <span className="font-semibold text-gray-900">
                                        {formatRupiah(calculation.serviceFee)}
                                    </span>
                                </div>

                                <div className="h-px bg-gray-200 my-1" />

                                <div className="flex items-baseline justify-between pt-1">
                                    <span className="text-base font-extrabold text-gray-900">
                                        Total Tagihan
                                    </span>
                                    <span className="text-xl sm:text-2xl font-extrabold text-[#DC2626]">
                                        {formatRupiah(calculation.grandTotal)}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handlePayNow}
                                className="w-full py-3.5 px-6 rounded-xl bg-[#7D3394] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span>Bayar Sekarang</span>
                            </button>

                            <p className="text-[11px] text-gray-500 text-center">
                                Halaman ini menggunakan mode demo sebelum integrasi payment gateway
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}

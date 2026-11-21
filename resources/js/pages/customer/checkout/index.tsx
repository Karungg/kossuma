import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    Building2,
    CheckCircle2,
    MapPin,
    Plus,
    QrCode,
    Receipt,
    ShieldCheck,
    Store,
    Ticket,
    Truck,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { HomeLayout } from '@/layouts/home-layout';
import { cart, home, login } from '@/routes';
import { payment as checkoutPayment } from '@/routes/checkout';
import { index as customerSettingsIndex } from '@/routes/customer/settings';
import type {
    BankOption,
    CheckoutAddress,
    CheckoutItem,
    PaymentMethodType,
    ShippingOption,
    VoucherOption,
} from './types';

interface CheckoutPageProps {
    addresses?: CheckoutAddress[];
}

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

export default function CheckoutPage({ addresses = [] }: CheckoutPageProps) {
    const { auth } = usePage().props as unknown as {
        auth?: { user?: { name: string } | null };
    };
    const isAuthenticated = Boolean(auth?.user);
    const defaultAddress =
        addresses.find((address) => address.isPrimary) ?? addresses[0] ?? null;
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
        defaultAddress?.id ?? null,
    );
    const [isAddressListOpen, setIsAddressListOpen] = useState(false);
    const [selectedShippingId, setSelectedShippingId] = useState(
        SHIPPING_OPTIONS[0].id,
    );
    const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(
        null,
    );
    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethodType>('qris');
    const [selectedBankId, setSelectedBankId] =
        useState<BankOption['id']>('bsi');
    const [note, setNote] = useState('');

    const formatRupiah = (val: number) => 'Rp' + val.toLocaleString('id-ID');

    const selectedAddress =
        addresses.find((address) => address.id === selectedAddressId) ??
        defaultAddress;
    const selectedShipping =
        SHIPPING_OPTIONS.find((s) => s.id === selectedShippingId) ??
        SHIPPING_OPTIONS[0];
    const selectedVoucher =
        VOUCHERS.find((v) => v.id === selectedVoucherId) ?? null;

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
                voucherDiscount = Math.min(
                    itemsSubtotal,
                    selectedVoucher.discountAmount,
                );
            } else {
                voucherDiscount = Math.min(
                    shippingFee,
                    selectedVoucher.discountAmount,
                );
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
        <HomeLayout cartCount={CHECKOUT_ITEMS.length}>
            <Head title="Checkout Pesanan - Kossuma Kota Bogor">
                <meta
                    name="description"
                    content="Pilih alamat pengiriman, kurir, voucher, dan metode pembayaran untuk pesanan UMKM Kossuma Kota Bogor."
                />
            </Head>
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                {/* Breadcrumbs & Kembali */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <Link
                            href={cart()}
                            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-[#7D3394]"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Kembali ke Keranjang</span>
                        </Link>

                        <nav
                            aria-label="Breadcrumb"
                            className="hidden items-center gap-2 text-xs text-gray-500 md:flex"
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
                            <span className="font-semibold text-gray-900">
                                Checkout
                            </span>
                        </nav>
                    </div>
                </div>

                <h1 className="text-xl font-extrabold tracking-tight text-[#1F2937] sm:text-2xl">
                    Checkout Pesanan
                </h1>

                {/* Main 2-Column Layout */}
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                    {/* Kolom Kiri (8 kolom): Alamat, Produk, Pengiriman, Voucher, Pembayaran */}
                    <div className="flex flex-col gap-5 lg:col-span-8">
                        <section className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs sm:p-6">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-[#7D3394]" />
                                    <h2 className="text-base font-bold text-gray-900">
                                        Alamat Pengiriman
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    {addresses.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsAddressListOpen(
                                                    (prev) => !prev,
                                                )
                                            }
                                            className="cursor-pointer rounded-lg bg-[#F0E6F5] px-3 py-1.5 text-xs font-bold text-[#7D3394]"
                                        >
                                            {isAddressListOpen
                                                ? 'Tutup Pilihan'
                                                : 'Ganti Alamat'}
                                        </button>
                                    )}
                                    {isAuthenticated && (
                                        <Link
                                            href={customerSettingsIndex({
                                                query: { tab: 'addresses' },
                                            })}
                                            data-test="checkout-manage-addresses-link"
                                            className="cursor-pointer rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700"
                                        >
                                            Kelola Alamat
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {selectedAddress ? (
                                <div className="flex flex-col gap-1 border-t border-gray-100 pt-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-bold text-gray-900">
                                            {selectedAddress.recipientName}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            •
                                        </span>
                                        <span className="text-xs font-semibold text-[#7D3394]">
                                            {selectedAddress.label}
                                        </span>
                                        {selectedAddress.isPrimary && (
                                            <span className="rounded bg-[#F0E6F5] px-2 py-0.5 text-[10px] font-bold text-[#7D3394]">
                                                Alamat Utama
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-600">
                                        {selectedAddress.phone}
                                    </span>
                                    <p className="pt-0.5 text-xs leading-relaxed text-gray-700 sm:text-sm">
                                        {selectedAddress.fullAddress},{' '}
                                        {selectedAddress.district},{' '}
                                        {selectedAddress.city}
                                        {selectedAddress.postalCode
                                            ? ` ${selectedAddress.postalCode}`
                                            : ''}
                                    </p>
                                    {selectedAddress.courierNote && (
                                        <span className="text-xs text-gray-500">
                                            Patokan:{' '}
                                            {selectedAddress.courierNote}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-start gap-3 border-t border-gray-100 pt-3">
                                    <p className="text-xs text-gray-600 sm:text-sm">
                                        {isAuthenticated
                                            ? 'Anda belum memiliki alamat pengiriman tersimpan. Tambahkan alamat terlebih dahulu di Pengaturan Akun.'
                                            : 'Masuk ke akun Anda untuk memilih atau menyimpan alamat pengiriman.'}
                                    </p>
                                    <Link
                                        href={
                                            isAuthenticated
                                                ? customerSettingsIndex({
                                                      query: {
                                                          tab: 'addresses',
                                                      },
                                                  })
                                                : login()
                                        }
                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#7D3394] px-4 py-2 text-xs font-bold text-white"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>
                                            {isAuthenticated
                                                ? 'Tambah Alamat Pengiriman'
                                                : 'Masuk Sekarang'}
                                        </span>
                                    </Link>
                                </div>
                            )}

                            {isAddressListOpen && addresses.length > 1 && (
                                <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
                                    <span className="text-xs font-semibold text-gray-600">
                                        Pilih alamat tersimpan:
                                    </span>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {addresses.map((addr) => {
                                            const isSelected =
                                                addr.id === selectedAddress?.id;

                                            return (
                                                <button
                                                    key={addr.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedAddressId(
                                                            addr.id,
                                                        );
                                                        setIsAddressListOpen(
                                                            false,
                                                        );
                                                    }}
                                                    className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-3 text-left ${
                                                        isSelected
                                                            ? 'border-[#7D3394] bg-[#F0E6F5]/40'
                                                            : 'border-gray-200 bg-white'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-[#7D3394]">
                                                            {addr.label}
                                                            {addr.isPrimary
                                                                ? ' • Utama'
                                                                : ''}
                                                        </span>
                                                        {isSelected && (
                                                            <CheckCircle2 className="h-4 w-4 text-[#7D3394]" />
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-900">
                                                        {addr.recipientName}
                                                    </span>
                                                    <span className="line-clamp-2 text-xs text-gray-600">
                                                        {addr.fullAddress},{' '}
                                                        {addr.district}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* 2. Daftar Produk & Pengiriman */}
                        <section className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-5">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                <Store className="h-5 w-5 text-[#7D3394]" />
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
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-[10px] text-gray-400">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="h-full w-full rounded-lg object-cover"
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
                                                {item.variant} • {item.quantity}{' '}
                                                barang
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 flex-col items-end">
                                        <span className="text-sm font-bold text-gray-900">
                                            {formatRupiah(
                                                item.price * item.quantity,
                                            )}
                                        </span>
                                        {item.originalPrice && (
                                            <span className="text-xs text-gray-400 line-through">
                                                {formatRupiah(
                                                    item.originalPrice *
                                                        item.quantity,
                                                )}
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
                                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-xs focus:border-[#7D3394] focus:outline-none sm:text-sm"
                                />
                            </div>

                            {/* Pilihan Kurir Pengiriman */}
                            <div className="flex flex-col gap-2.5 border-t border-gray-100 pt-2">
                                <div className="flex items-center gap-2">
                                    <Truck className="h-4 w-4 text-[#7D3394]" />
                                    <span className="text-sm font-bold text-gray-900">
                                        Pilih Metode Pengiriman
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    {SHIPPING_OPTIONS.map((opt) => {
                                        const isSelected =
                                            opt.id === selectedShippingId;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedShippingId(
                                                        opt.id,
                                                    )
                                                }
                                                className={`flex cursor-pointer flex-col justify-between gap-2 rounded-xl border p-3.5 text-left ${
                                                    isSelected
                                                        ? 'border-[#7D3394] bg-[#F0E6F5]/40'
                                                        : 'border-gray-200 bg-white'
                                                }`}
                                            >
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs font-bold text-gray-900 sm:text-sm">
                                                        {opt.name}
                                                    </span>
                                                    <span className="text-[11px] text-gray-500">
                                                        {opt.estimate}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-extrabold text-[#7D3394] sm:text-sm">
                                                    {opt.price === 0
                                                        ? 'Gratis'
                                                        : formatRupiah(
                                                              opt.price,
                                                          )}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        {/* 3. Pilihan Voucher */}
                        <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5">
                            <div className="flex items-center gap-2">
                                <Ticket className="h-5 w-5 text-[#7D3394]" />
                                <h2 className="text-base font-bold text-gray-900">
                                    Voucher &amp; Promo Tersedia
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {VOUCHERS.map((voucher) => {
                                    const isSelected =
                                        selectedVoucherId === voucher.id;
                                    const isEligible =
                                        calculation.itemsSubtotal >=
                                        voucher.minPurchase;

                                    return (
                                        <button
                                            key={voucher.id}
                                            type="button"
                                            disabled={!isEligible}
                                            onClick={() =>
                                                setSelectedVoucherId(
                                                    isSelected
                                                        ? null
                                                        : voucher.id,
                                                )
                                            }
                                            className={`flex cursor-pointer items-start justify-between gap-2 rounded-xl border p-3.5 text-left disabled:cursor-not-allowed disabled:opacity-50 ${
                                                isSelected
                                                    ? 'border-[#7D3394] bg-[#F0E6F5]/50'
                                                    : 'border-gray-200 bg-white'
                                            }`}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-bold text-[#7D3394]">
                                                    {voucher.code}
                                                </span>
                                                <span className="text-xs font-bold text-gray-900 sm:text-sm">
                                                    {voucher.title}
                                                </span>
                                                <span className="text-[11px] text-gray-500">
                                                    {voucher.description}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7D3394]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* 4. Metode Pembayaran */}
                        <section className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-[#7D3394]" />
                                <h2 className="text-base font-bold text-gray-900">
                                    Metode Pembayaran
                                </h2>
                            </div>

                            <div className="flex flex-col gap-3">
                                {/* Opsi 1: QRIS */}
                                <div
                                    onClick={() => setPaymentMethod('qris')}
                                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                                        paymentMethod === 'qris'
                                            ? 'border-[#7D3394] bg-[#F0E6F5]/40'
                                            : 'border-gray-200 bg-white'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        checked={paymentMethod === 'qris'}
                                        onChange={() =>
                                            setPaymentMethod('qris')
                                        }
                                        className="mt-1 cursor-pointer accent-[#7D3394]"
                                    />
                                    <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-[#7D3394]" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-bold text-gray-900">
                                            QRIS (Scan Instan)
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Bayar cepat dari GoPay, OVO, Dana,
                                            ShopeePay, dan semua m-Banking
                                        </span>
                                    </div>
                                </div>

                                {/* Opsi 2: Transfer Bank / Virtual Account */}
                                <div
                                    onClick={() => setPaymentMethod('bank')}
                                    className={`flex cursor-pointer flex-col gap-3 rounded-xl border p-4 ${
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
                                            onChange={() =>
                                                setPaymentMethod('bank')
                                            }
                                            className="mt-1 cursor-pointer accent-[#7D3394]"
                                        />
                                        <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-[#7D3394]" />
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-bold text-gray-900">
                                                Transfer Virtual Account Bank
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Verifikasi otomatis melalui
                                                nomor Virtual Account
                                            </span>
                                        </div>
                                    </div>

                                    {paymentMethod === 'bank' && (
                                        <div className="grid grid-cols-1 gap-2.5 pt-1 pl-7 sm:grid-cols-2">
                                            {BANKS.map((bank) => {
                                                const isBankSelected =
                                                    selectedBankId === bank.id;
                                                return (
                                                    <button
                                                        key={bank.id}
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedBankId(
                                                                bank.id,
                                                            );
                                                        }}
                                                        className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg border p-3 text-left ${
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
                                                                {
                                                                    bank.description
                                                                }
                                                            </span>
                                                        </div>
                                                        {isBankSelected && (
                                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#7D3394]" />
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
                                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
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
                                        className="mt-1 cursor-pointer accent-[#7D3394]"
                                    />
                                    <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-[#7D3394]" />
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-bold text-gray-900">
                                            Bayar di Tempat (COD)
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Siapkan uang tunai saat kurir tiba
                                            mengantarkan pesanan
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Kolom Kanan (4 kolom Sticky): Ringkasan Tagihan */}
                    <div className="lg:sticky lg:top-[132px] lg:col-span-4">
                        <div className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6">
                            <h2 className="flex items-center justify-between text-lg font-bold text-gray-900">
                                <span>Ringkasan Tagihan</span>
                                <Receipt className="h-5 w-5 text-[#7D3394]" />
                            </h2>

                            <div className="flex flex-col gap-2.5 text-sm">
                                <div className="flex items-center justify-between text-gray-600">
                                    <span>Subtotal Harga Barang</span>
                                    <span className="font-semibold text-gray-900">
                                        {formatRupiah(
                                            calculation.itemsSubtotal,
                                        )}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-gray-600">
                                    <span>
                                        Ongkos Kirim ({selectedShipping.name})
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                        {calculation.shippingFee === 0
                                            ? 'Gratis'
                                            : formatRupiah(
                                                  calculation.shippingFee,
                                              )}
                                    </span>
                                </div>

                                {calculation.voucherDiscount > 0 && (
                                    <div className="flex items-center justify-between text-gray-600">
                                        <span>
                                            Potongan Voucher (
                                            {selectedVoucher?.code})
                                        </span>
                                        <span className="font-semibold text-[#059669]">
                                            -
                                            {formatRupiah(
                                                calculation.voucherDiscount,
                                            )}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-gray-600">
                                    <span>
                                        Biaya Layanan &amp; Infaq Koperasi
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                        {formatRupiah(calculation.serviceFee)}
                                    </span>
                                </div>

                                <div className="my-1 h-px bg-gray-200" />

                                <div className="flex items-baseline justify-between pt-1">
                                    <span className="text-base font-extrabold text-gray-900">
                                        Total Tagihan
                                    </span>
                                    <span className="text-xl font-extrabold text-[#DC2626] sm:text-2xl">
                                        {formatRupiah(calculation.grandTotal)}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handlePayNow}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#7D3394] px-6 py-3.5 text-sm font-bold text-white"
                            >
                                <span>Bayar Sekarang</span>
                            </button>

                            <p className="text-center text-[11px] text-gray-500">
                                Halaman ini menggunakan mode demo sebelum
                                integrasi payment gateway
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
}

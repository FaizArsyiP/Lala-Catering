export function groupByDayAndMenu(orders) {
    const result = {};

    orders.forEach((order) => {
        order.deliveries.forEach((delivery) => {
            const day = delivery.hari;

            if (!result[day]) {
                result[day] = {};
            }

            delivery.items.forEach((item) => {
                const menuName = item.namaItem;

                if (!result[day][menuName]) {
                    result[day][menuName] = {
                        jumlah: 0,
                        pendapatan: 0,
                    };
                }

                result[day][menuName].jumlah += item.jumlah;
                result[day][menuName].pendapatan += item.jumlah * item.harga;
            });
        });
    });

    return result;
}

export function convertGroupedData(grouped) {
    const rows = [];

    Object.keys(grouped).forEach((hari) => {
        Object.keys(grouped[hari]).forEach((menu) => {
            const item = grouped[hari][menu];

            rows.push({
                day: hari,
                image: "/assets/dummy/pic1.jpg", // Placeholder image
                name: menu,
                quantity: item.jumlah,
                revenue: item.pendapatan,
            });
        });
    });

    return rows;
}

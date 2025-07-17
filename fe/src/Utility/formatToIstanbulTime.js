//hem saat hem de tarih için
export const formatToIstanbulTime = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);

    // 3 saat ekliyoruz (3 * 60 * 60 * 1000 = 10800000 milisaniye)
    const dateWithThreeHours = new Date(date.getTime() + (3 * 60 * 60 * 1000));

    return dateWithThreeHours.toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};



// Sadece tarih için
export const formatToIstanbulDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);

    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

// Sadece saat için
export const formatToIstanbulTimeOnly = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);

    return date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
    });
};
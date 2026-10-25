/**
 * تنسيق التاريخ إلى صيغة عربية مقروءة
 * مثال: 2026-10-25 -> "25 أكتوبر 2026"
 */
export const formatDate = (dateString) => {
  if (!dateString) return '---';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '---'; // تاريخ غير صالح
    
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    return '---';
  }
};

/**
 * تنسيق الوقت إلى صيغة 12 ساعة مع صباحاً/مساءً
 * مثال: "16:00" -> "4:00 مساءً"
 */
export const formatTime = (timeString) => {
  if (!timeString) return '---';
  
  try {
    // إذا كان الوقت بصيغة HH:MM
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0);
    
    return new Intl.DateTimeFormat('ar-EG', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  } catch (error) {
    return timeString;
  }
};

/**
 * تنسيق التاريخ والوقت معاً
 */
export const formatDateTime = (dateString, timeString) => {
  const date = formatDate(dateString);
  const time = formatTime(timeString);
  return `${date} - ${time}`;
};

/**
 * حساب الوقت النسبي (منذ متى تم الإنشاء)
 * مثال: "منذ 5 دقائق"
 */
export const timeAgo = (dateString) => {
  if (!dateString) return '---';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    const intervals = {
      سنة: 31536000,
      شهر: 2592000,
      أسبوع: 604800,
      يوم: 86400,
      ساعة: 3600,
      دقيقة: 60,
      ثانية: 1,
    };

    for (const [unit, seconds] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        return `منذ ${interval} ${unit}${interval > 2 ? 'ات' : ''}`;
      }
    }
    return 'الآن';
  } catch (error) {
    return '---';
  }
};

/**
 * تنسيق مدة زمنية (لحساب الفرق بين وقتين)
 * مثال: "16:00" و "18:00" -> "2 ساعة"
 */
export const formatDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '---';
  
  try {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
    
    const diff = end - start;
    
    if (diff <= 0) return '---';
    
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    if (hours > 0 && minutes > 0) return `${hours} ساعة و ${minutes} دقيقة`;
    if (hours > 0) return `${hours} ساعة`;
    return `${minutes} دقيقة`;
  } catch (error) {
    return '---';
  }
};
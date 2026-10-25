import { Loader2 } from 'lucide-react';

// 1. زر (Button)
export const Button = ({ children, variant = 'primary', className = '', isLoading = false, ...props }) => {
  const baseStyles = "px-4 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20",
    secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "text-gray-600 hover:bg-gray-100",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </button>
  );
};

// 2. حقل إدخال (Input)
export const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <input 
        className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${error ? 'border-red-500' : ''} ${className}`}
        {...props} 
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// 3. بطاقة (Card)
export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>
      {children}
    </div>
  );
};

// 4. شارة (Badge)
export const Badge = ({ children, variant = 'success' }) => {
  const variants = {
    success: "bg-green-50 text-green-600 border-green-100",
    warning: "bg-amber-50 text-amber-600 border-amber-100",
    danger: "bg-red-50 text-red-600 border-red-100",
    info: "bg-blue-50 text-blue-600 border-blue-100",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
};

// 5. مكون التحميل (Loader)
export const PageLoader = () => (
  <div className="flex justify-center items-center h-64">
    <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
  </div>
);

// 6. رسالة تنبيه (Alert)
export const Alert = ({ type = 'error', message }) => {
  if (!message) return null;
  const styles = {
    success: "bg-green-50 text-green-700 border-green-100",
    error: "bg-red-50 text-red-700 border-red-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
  };
  return (
    <div className={`p-4 rounded-xl text-sm border flex items-center gap-2 ${styles[type]}`}>
      {message}
    </div>
  );
};
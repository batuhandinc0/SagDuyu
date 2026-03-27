const StatCard = ({ icon, value, label, colorClass, bgClass }) => {
    return (
        <div className="card-widget">
            <div className={`flex items-center justify-center w-12 h-12 mb-4 rounded-xl ${bgClass} ${colorClass}`}>
                {icon}
            </div>
            <div className="text-3xl font-bold text-text-main mb-1">{value}</div>
            <div className="text-sm text-text-secondary font-medium">{label}</div>
        </div>
    );
};

export default StatCard;

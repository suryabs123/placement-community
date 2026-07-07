import { Link } from "react-router-dom";

function Avatar({ user, size = "w-10 h-10", textSize = "text-sm", showName = false }) {
  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <Link to={`/profile/${user.id}`} className="flex items-center gap-2 group">
      <div className={`${size} rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white ${textSize} font-bold shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-all duration-300 cursor-pointer`}>
        {getInitials(user.name)}
      </div>
      {showName && (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">
          {user.name}
        </span>
      )}
    </Link>
  );
}

export default Avatar;
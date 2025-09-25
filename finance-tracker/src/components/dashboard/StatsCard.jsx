
import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import "../../styles/dashboard.css";

const StatsCard = ({ title, value, change, positive, icon: Icon }) => {
  return (
    <div className="stat-card">
      {/* Icon */}
      <div className="stat-icon">
        <Icon size={28} />
      </div>

      {/* Text and Change */}
      <div>
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
        <span className={`stat-change ${positive ? "positive" : "negative"}`}>
          {positive ? (
            <ArrowUpRight className="change-icon" />
          ) : (
            <ArrowDownRight className="change-icon" />
          )}
          {change}
        </span>
      </div>
    </div>
  );
};

export default StatsCard;

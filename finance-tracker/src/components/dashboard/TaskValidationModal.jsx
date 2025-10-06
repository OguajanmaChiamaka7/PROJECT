import React from 'react';
import { X, AlertCircle, CheckCircle, Info, TrendingUp } from 'lucide-react';
import '../../styles/TaskValidationModal.css';

const TaskValidationModal = ({ isOpen, onClose, type, message, title, currentAmount, requiredAmount }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="modal-icon success" />;
      case 'error':
        return <AlertCircle className="modal-icon error" />;
      case 'warning':
        return <AlertCircle className="modal-icon warning" />;
      case 'info':
        return <Info className="modal-icon info" />;
      default:
        return <AlertCircle className="modal-icon" />;
    }
  };

  const getProgressBar = () => {
    if (currentAmount !== undefined && requiredAmount !== undefined) {
      const progress = Math.min((currentAmount / requiredAmount) * 100, 100);
      return (
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">Your Progress</span>
            <span className="progress-amount">₦{currentAmount.toLocaleString()} / ₦{requiredAmount.toLocaleString()}</span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progress}%`,
                backgroundColor: progress >= 100 ? '#10b981' : '#f59e0b'
              }}
            />
          </div>
          <div className="progress-footer">
            <span className="progress-percentage">{progress.toFixed(0)}% Complete</span>
            {progress < 100 && (
              <span className="progress-remaining">₦{(requiredAmount - currentAmount).toLocaleString()} remaining</span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="validation-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-header">
          {getIcon()}
          <h2 className="modal-title">{title}</h2>
        </div>

        <div className="modal-body">
          <p className="modal-message">{message}</p>
          {getProgressBar()}
        </div>

        <div className="modal-footer">
          <button className="modal-btn primary" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskValidationModal;

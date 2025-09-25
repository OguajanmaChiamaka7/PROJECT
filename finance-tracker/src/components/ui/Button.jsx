// import styled from 'styled-components'
// import { motion } from 'framer-motion'

// const StyledButton = styled(motion.button)`
//   display: inline-flex;
//   align-items: center;
//   justify-content: center;
//   padding: ${props => props.size === 'sm' ? '0.25rem 1rem' : props.size === 'lg' ? '1rem 2rem' : '0.5rem 1.5rem'};
//   font-size: ${props => props.size === 'sm' ? '0.75rem' : props.size === 'lg' ? '1rem' : '0.875rem'};
//   font-weight: 500;
//   border-radius: 0.5rem;
//   border: none;
//   cursor: pointer;
//   outline: none;
//   position: relative;
//   text-decoration: none;
//   transition: all 0.2s ease-in-out;

//   &:focus {
//     outline: 2px solid var(--color-primary);
//     outline-offset: 2px;
//   }

//   &:disabled {
//     opacity: 0.6;
//     cursor: not-allowed;
//   }

//   ${props => {
//     switch (props.variant) {
//       case 'primary':
//         return `
//           background-color: var(--color-primary);
//           color: var(--color-white);
//           &:hover:not(:disabled) {
//             background-color: var(--color-primary-dark);
//           }
//         `;
//       case 'secondary':
//         return `
//           background-color: var(--color-gray-200);
//           color: var(--color-gray-800);
//           &:hover:not(:disabled) {
//             background-color: var(--color-gray-300);
//           }
//         `;
//       case 'success':
//         return `
//           background-color: var(--color-success);
//           color: var(--color-white);
//           &:hover:not(:disabled) {
//             background-color: var(--color-success-dark);
//           }
//         `;
//       case 'danger':
//         return `
//           background-color: var(--color-danger);
//           color: var(--color-white);
//           &:hover:not(:disabled) {
//             background-color: var(--color-danger-dark);
//           }
//         `;
//       case 'ghost':
//       default:
//         return `
//           background-color: transparent;
//           color: var(--color-gray-600);
//           border: 1px solid var(--color-gray-300);
//           &:hover:not(:disabled) {
//             background-color: var(--color-gray-50);
//             border-color: var(--color-gray-400);
//           }
//         `;
//     }
//   }}
// `

// const Button = ({
//   children,
//   variant = 'primary',
//   size = 'md',
//   loading = false,
//   onClick,
//   disabled,
//   type = 'button',
//   ...props
// }) => {
//   return (
//     <StyledButton
//       variant={variant}
//       size={size}
//       onClick={onClick}
//       disabled={disabled || loading}
//       type={type}
//       whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
//       whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
//       {...props}
//     >
//       {loading && <span className="spinner" style={{ marginRight: '0.5rem' }} />}
//       {children}
//     </StyledButton>
//   )
// }

// export default Button

const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "",
  onClick,
  disabled = false,
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500",
    outline: "border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 focus:ring-emerald-500",
    ghost: "text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:ring-gray-500"
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
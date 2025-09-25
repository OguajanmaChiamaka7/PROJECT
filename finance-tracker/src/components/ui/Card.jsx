import styled from 'styled-components'
import { motion } from 'framer-motion'

const StyledCard = styled(motion.div)`
  background-color: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-200);
  padding: var(--spacing-xl);
  transition: box-shadow var(--transition-normal);

  &:hover {
    box-shadow: var(--shadow-md);
  }
`

const CardHeader = styled.div`
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-gray-200);
`

const CardTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-900);
  margin-bottom: var(--spacing-xs);
`

const CardSubtitle = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
`

const Card = ({ children, className, ...props }) => {
  return (
    <StyledCard
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </StyledCard>
  )
}

Card.Header = CardHeader
Card.Title = CardTitle
Card.Subtitle = CardSubtitle

export default Card


// const Card = ({ 
//   children, 
//   className = "", 
//   title, 
//   action, 
//   padding = "p-6" 
// }) => {
//   return (
//     <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${padding} ${className}`}>
//       {(title || action) && (
//         <div className="flex items-center justify-between mb-6">
//           {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
//           {action}
//         </div>
//       )}
//       {children}
//     </div>
//   );
// };

// export default Card;
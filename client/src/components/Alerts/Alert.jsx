import React from 'react';
import PropTypes from 'prop-types';

const Alert = ({ message, type }) => {
  if (!message) return null;

  const alertClass = type === 'success' ? 'bg-green-100 text-green-800 border-green-400' : 'bg-red-100 text-red-800 border-red-400';

  return (
    <div className={`border-l-4 p-4 mb-4 ${alertClass}`}>
      {message}
    </div>
  );
};

Alert.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf(['success', 'error']),
};

Alert.defaultProps = {
  type: 'error',
};

export default Alert;

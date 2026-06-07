import { forwardRef, useState } from 'react';

const AutoDirInput = forwardRef(function AutoDirInput(props, ref) {
  const [dir, setDir] = useState('ltr');

  const handleChange = (e) => {
    const value = e.target.value;
    const isPersian = /[\u0600-\u06FF]/.test(value);
    setDir(isPersian ? 'rtl' : 'ltr');

    if (props.onChange) props.onChange(e);
  };

  return (
    <input
      {...props}
      ref={ref}
      dir={dir}
      onChange={handleChange}
    />
  );
});

export default AutoDirInput;

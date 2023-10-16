import React from 'react';
import { Button } from 'vtex.styleguide';
import { useCssHandles } from 'vtex.css-handles';
interface AddAllToListButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const AddAllToListButton: React.FC<AddAllToListButtonProps> = ({ onClick }) => {
  const CSS_HANDLES = ['addAllToList'] as const;
  const handles = useCssHandles(CSS_HANDLES);

  return (
    <div className={`${handles.addAllToList}`}>
      <Button isLoading={false} onClick={onClick}>Add All To List</Button>
    </div>
  );
};

export default AddAllToListButton;

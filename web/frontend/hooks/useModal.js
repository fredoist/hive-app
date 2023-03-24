import { useCallback, useState } from 'react';

export default function useModal(isOpen = false) {
  const [showModal, setShowModal] = useState(isOpen);

  const toggleModal = useCallback(() => setShowModal(!showModal), [showModal]);

  return { showModal, toggleModal }
}

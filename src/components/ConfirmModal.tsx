import './ConfirmModal.css'

interface ConfirmModalProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmVariant?: 'delete' | 'close'
}

export function ConfirmModal({
  message,
  onConfirm,
  onCancel,
  confirmVariant = 'delete',
}: ConfirmModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <p id="modal-title" className="modal-message">{message}</p>
        <div className="modal-actions">
          <button type="button" className="btn-modal-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn-modal-confirm ${confirmVariant === 'close' ? 'btn-confirm-close' : ''}`}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

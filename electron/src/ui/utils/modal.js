const AppModal = {
  show(message, title = 'Notice') {
    return new Promise((resolve) => {
      const previousFocus = document.activeElement;

      const backdrop = document.createElement('div');
      backdrop.className = 'app-modal-backdrop';

      const modal = document.createElement('div');
      modal.className = 'app-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', title);

      const heading = document.createElement('h3');
      heading.className = 'app-modal-title';
      heading.textContent = title;

      const body = document.createElement('p');
      body.className = 'app-modal-message';
      body.textContent = message;

      const actions = document.createElement('div');
      actions.className = 'app-modal-actions';

      const okButton = document.createElement('button');
      okButton.className = 'app-modal-ok-btn';
      okButton.type = 'button';
      okButton.textContent = 'OK';

      const closeModal = () => {
        document.removeEventListener('keydown', handleEscape);
        backdrop.remove();
        if (previousFocus && typeof previousFocus.focus === 'function') {
          previousFocus.focus();
        }
        resolve();
      };

      const handleEscape = (event) => {
        if (event.key === 'Escape') {
          closeModal();
        }
      };

      okButton.addEventListener('click', closeModal);
      backdrop.addEventListener('click', (event) => {
        if (event.target === backdrop) {
          closeModal();
        }
      });
      document.addEventListener('keydown', handleEscape);

      actions.appendChild(okButton);
      modal.appendChild(heading);
      modal.appendChild(body);
      modal.appendChild(actions);
      backdrop.appendChild(modal);
      document.body.appendChild(backdrop);

      okButton.focus();
    });
  }
};

window.AppModal = AppModal;

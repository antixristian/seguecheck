// Estilos do SegueCheck, isolados no Shadow DOM.
window.__MSDV_STYLES__ = `
  :host {
    all: initial;
    color-scheme: light;
    font-family: "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif;
    font-size: 14px;
    line-height: 1.4;
    color: #221c39;
    -webkit-font-smoothing: antialiased;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  button, input, select {
    font: inherit;
  }

  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 2147483646;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(21, 16, 38, .57);
    backdrop-filter: blur(4px);
  }

  .dialog {
    --ink: #221c39;
    --muted: #655d77;
    --line: #ebe7f2;
    --field: #f8f7fb;
    --accent: #5543ce;
    --accent-hover: #4635b8;
    --accent-soft: #f1edff;
    --accent-line: #d9d0fc;
    --brand-gradient: linear-gradient(145deg, #4b3acc, #7556e6);
    --gutter: 22px;
    display: flex;
    flex-direction: column;
    width: min(100%, 608px);
    height: min(696px, calc(100dvh - 40px));
    overflow: hidden;
    border: 1px solid rgba(41, 27, 80, .10);
    border-radius: 21px;
    background: #fff;
    box-shadow: 0 24px 72px rgba(21, 13, 48, .28);
    animation: panel-in .18s ease-out;
  }

  .dialog.pulse {
    box-shadow: 0 0 0 3px #a89bf6, 0 24px 72px rgba(21, 13, 48, .28);
  }

  @keyframes panel-in {
    from { opacity: 0; transform: translateY(6px) scale(.99); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  :where(button, a, input, select):focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .header, .controls-section, .filters-bar, .footer {
    padding-inline: var(--gutter);
    flex-shrink: 0;
  }

  .header, .brand, .action-row, .action-buttons, .search-row, .checkbox-group,
  .user-row, .user-link, .user-handle-line, .row-actions, .footer {
    display: flex;
    align-items: center;
  }

  .header {
    justify-content: space-between;
    gap: 12px;
    padding-block: 13px 11px;
  }

  .brand {
    gap: 10px;
  }

  .brand-icon, .btn-close, .btn-protect, .search-clear, .empty-state-icon {
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .brand-icon {
    width: 36px;
    height: 36px;
    border-radius: 11px;
    background: var(--brand-gradient);
    color: #fff;
    box-shadow: 0 3px 8px rgba(85, 67, 206, .19);
  }

  .brand-title {
    margin: 0;
    font-size: 20px;
    font-weight: 750;
    letter-spacing: -.04em;
  }

  .btn-close, .search-clear {
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
  }

  .btn-close {
    width: 34px;
    height: 34px;
    border-radius: 9px;
  }

  .btn-close:hover, .search-clear:hover {
    background: var(--accent-soft);
    color: var(--accent);
  }

  .controls-section {
    display: grid;
    gap: 10px;
    padding-bottom: 12px;
  }

  .summary {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    margin: 0;
    padding: 12px 15px;
    border: 1px solid #ede7fc;
    border-radius: 14px;
    background: linear-gradient(115deg, #f0ebff, #faf8ff 75%);
    font-variant-numeric: tabular-nums;
  }

  .summary dt {
    margin-bottom: 3px;
    color: var(--muted);
    font-size: 12px;
    font-weight: 600;
  }

  .summary dd {
    margin: 0;
    font-weight: 700;
    line-height: 1.05;
  }

  .summary-main {
    padding-right: 12px;
  }

  .summary-main dt {
    color: #48379f;
  }

  .summary-main dd {
    color: #3f2bbd;
    font-size: 35px;
    letter-spacing: -.055em;
  }

  .summary-detail {
    min-width: 92px;
    padding-left: 15px;
    border-left: 1px solid #e5def7;
  }

  .summary-detail + .summary-detail {
    margin-left: 13px;
  }

  .summary-detail dd {
    font-size: 18px;
    letter-spacing: -.025em;
  }

  .action-row {
    justify-content: space-between;
    gap: 8px 12px;
  }

  .action-buttons, .search-row, .checkbox-group {
    gap: 8px;
  }

  .btn-primary, .btn-secondary {
    min-height: 36px;
    padding: 6px 13px;
    border: 1px solid transparent;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 650;
    cursor: pointer;
    white-space: nowrap;
  }

  .btn-primary {
    background: var(--accent);
    color: #fff;
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--accent-hover);
  }

  .btn-primary:disabled {
    background: var(--accent-soft);
    color: #6653bd;
    cursor: default;
  }

  .btn-secondary {
    border-color: var(--line);
    background: #fff;
    color: var(--ink);
  }

  .btn-secondary:hover {
    background: var(--field);
  }

  .status-caption, .progress-meta {
    color: var(--muted);
    font-size: 12px;
  }

  .progress-wrap, .banner-alert {
    display: none;
  }

  .progress-wrap.visible {
    display: grid;
    gap: 5px;
  }

  .progress-meta {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-variant-numeric: tabular-nums;
  }

  .progress-track {
    height: 5px;
    overflow: hidden;
    border-radius: 99px;
    background: var(--accent-soft);
  }

  .progress-fill {
    height: 100%;
    width: 0;
    border-radius: inherit;
    background: var(--brand-gradient);
    transition: width .25s ease;
  }

  .banner-alert {
    padding: 9px 11px;
    border: 1px solid;
    border-radius: 9px;
    font-size: 12px;
  }

  .banner-alert.visible {
    display: block;
  }

  .banner-alert.warning {
    border-color: #f3d58b;
    background: #fff9e9;
    color: #754608;
  }

  .banner-alert.danger {
    border-color: #f6c9cf;
    background: #fff2f4;
    color: #991c35;
  }

  .confirmation-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }

  .filters-bar {
    display: grid;
    gap: 8px;
    padding-block: 11px;
    border-block: 1px solid var(--line);
  }

  .search-box {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  .search-input, .sort-select {
    min-height: 36px;
    border: 1px solid var(--line);
    border-radius: 9px;
    background: var(--field);
    color: var(--ink);
    font-size: 13px;
  }

  .search-input {
    width: 100%;
    padding: 5px 35px;
  }

  .search-input::placeholder {
    color: var(--muted);
  }

  .search-input::-webkit-search-cancel-button {
    display: none;
  }

  .search-icon, .search-clear {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  .search-icon {
    left: 11px;
    display: flex;
    color: var(--muted);
    pointer-events: none;
  }

  .search-clear {
    right: 4px;
    display: none;
    width: 27px;
    height: 27px;
    border-radius: 6px;
  }

  .search-clear.visible {
    display: grid;
  }

  .sort-select {
    padding: 5px 8px;
    cursor: pointer;
  }

  .checkbox-group {
    flex-wrap: wrap;
  }

  .check-chip, .btn-protected-toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 30px;
    padding: 3px 8px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: #fff;
    color: var(--muted);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    user-select: none;
  }

  .check-chip:hover, .btn-protected-toggle:hover {
    background: var(--field);
  }

  .check-chip.active, .btn-protected-toggle.active {
    border-color: var(--accent-line);
    background: var(--accent-soft);
    color: #4733b3;
  }

  .check-chip input {
    width: 13px;
    height: 13px;
    margin: 0;
    accent-color: var(--accent);
    cursor: pointer;
  }

  .btn-protected-toggle {
    margin-left: auto;
  }

  .chip-count {
    padding: 0 5px;
    border-radius: 99px;
    background: rgba(60, 42, 128, .08);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }

  .results-container {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .results-container::-webkit-scrollbar {
    width: 8px;
  }

  .results-container::-webkit-scrollbar-thumb {
    border: 2px solid #fff;
    border-radius: 8px;
    background: #d2cae4;
  }

  .empty-state {
    display: grid;
    min-height: 100%;
    place-content: center;
    justify-items: center;
    gap: 6px;
    padding: 20px var(--gutter);
    color: var(--muted);
    text-align: center;
    font-size: 13px;
  }

  .empty-state-icon {
    width: 40px;
    height: 40px;
    margin-bottom: 3px;
    border-radius: 12px;
    background: var(--accent-soft);
    color: var(--accent);
  }

  .empty-state-icon svg {
    width: 20px;
    height: 20px;
  }

  .empty-state-title {
    color: var(--ink);
    font-size: 15px;
    font-weight: 700;
  }

  .user-row {
    min-height: 58px;
    gap: 10px;
    padding: 8px var(--gutter);
    border-bottom: 1px solid var(--line);
    content-visibility: auto;
    contain-intrinsic-size: 0 41px;
  }

  .user-row:hover, .user-row:focus-within {
    background: #faf8ff;
  }

  .user-row:last-child {
    border-bottom: 0;
  }

  .user-link {
    flex: 1;
    min-width: 0;
    gap: 10px;
    border-radius: 6px;
    color: inherit;
    text-decoration: none;
  }

  .avatar-wrap {
    position: relative;
    width: 38px;
    height: 38px;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 50%;
    background: var(--accent-soft);
    flex-shrink: 0;
  }

  .avatar-img, .avatar-fallback {
    width: 100%;
    height: 100%;
  }

  .avatar-img {
    display: block;
    object-fit: cover;
  }

  .avatar-fallback {
    display: none;
    align-items: center;
    justify-content: center;
    color: #4e37b5;
    font-size: 15px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .user-meta {
    min-width: 0;
  }

  .user-handle-line {
    gap: 5px;
  }

  .user-handle, .user-fullname {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-handle {
    font-size: 13.5px;
    font-weight: 700;
  }

  .user-link:hover .user-handle {
    color: var(--accent);
  }

  .user-fullname {
    color: var(--muted);
    font-size: 12px;
  }

  .verified-badge, .private-tag {
    flex-shrink: 0;
  }

  .verified-badge {
    display: flex;
    color: #2469bd;
  }

  .verified-badge svg {
    width: 14px;
    height: 14px;
  }

  .private-tag {
    padding: 1px 5px;
    border-radius: 4px;
    background: var(--field);
    color: var(--muted);
    font-size: 10px;
    font-weight: 600;
  }

  .row-actions {
    flex-shrink: 0;
    gap: 6px;
  }

  .btn-protect, .btn-unfollow {
    min-height: 32px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: #fff;
    color: var(--muted);
    cursor: pointer;
  }

  .btn-protect {
    width: 32px;
    padding: 0;
  }

  .btn-protect:hover, .btn-protect.protected {
    border-color: var(--accent-line);
    background: var(--accent-soft);
    color: var(--accent);
  }

  .btn-unfollow {
    display: inline-grid;
    min-width: 114px;
    place-items: center;
    padding: 3px 8px;
    font-size: 12px;
    font-weight: 650;
    white-space: nowrap;
  }

  .btn-unfollow:hover:not(:disabled), .btn-unfollow:focus-visible:not(:disabled) {
    border-color: #f6c9cf;
    background: #fff2f4;
    color: #a32540;
  }

  .btn-unfollow:disabled {
    cursor: default;
  }

  .btn-unfollow.done {
    background: var(--field);
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid var(--accent-line);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin .65s linear infinite;
  }

  .footer {
    justify-content: flex-end;
    padding-block: 8px;
    border-top: 1px solid var(--line);
    background: #fcfbfe;
    color: var(--muted);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }

  .footer[hidden] {
    display: none;
  }

  @media (max-width: 500px) {
    .backdrop {
      padding: 8px;
    }

    .dialog {
      --gutter: 13px;
      height: min(696px, calc(100dvh - 16px));
      border-radius: 15px;
    }

    .summary {
      padding: 10px;
    }

    .summary-main dd {
      font-size: 30px;
    }

    .summary-detail {
      min-width: 0;
      padding-left: 8px;
    }

    .summary-detail + .summary-detail {
      margin-left: 8px;
    }

    .action-row {
      flex-wrap: wrap;
    }

    .btn-protected-toggle {
      margin-left: 0;
    }

    .btn-unfollow {
      min-width: 101px;
      padding-inline: 5px;
      font-size: 11px;
    }
  }

  @media (max-height: 500px) {
    .dialog {
      overflow-y: auto;
    }

    .results-container {
      min-height: 140px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .dialog, .spinner {
      animation: none;
    }

    .progress-fill {
      transition: none;
    }
  }
`;
